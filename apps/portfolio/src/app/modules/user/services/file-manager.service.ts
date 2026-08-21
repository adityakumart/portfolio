import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from './auth';
import { FileNode } from '@portfolio/shared-types';

@Injectable({
  providedIn: 'root',
})
export class FileManagerService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Angular Signals for state tracking
  currentPath = signal<string>('');
  files = signal<FileNode[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Upload progress tracking
  uploadingFileName = signal<string | null>(null);
  uploadProgress = signal<number | null>(null);

  /**
   * Generates authorization headers using current access token
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  /**
   * Fetches folders and files for the current directory prefix
   */
  async loadDirectory(prefix: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    const url = `${environment.APIURL}/files/list?prefix=${encodeURIComponent(prefix)}`;

    try {
      const response = await firstValueFrom(
        this.http.get<FileNode[]>(url, { headers: this.getHeaders() })
      );
      this.files.set(response || []);
      this.currentPath.set(prefix);
    } catch (err: any) {
      console.error('Failed to load directory:', err);
      this.error.set(err.error?.message || 'Failed to fetch directory contents.');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Fetches a short-lived download view URL for a file
   */
  async getDownloadUrl(path: string): Promise<string> {
    const url = `${environment.APIURL}/files/view-url?key=${encodeURIComponent(path)}`;
    const res = await firstValueFrom(
      this.http.get<{ url: string }>(url, { headers: this.getHeaders() })
    );
    return res.url;
  }

  /**
   * Creates a folder path (creates a directory placeholder under the hood)
   */
  async createFolder(folderName: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    const url = `${environment.APIURL}/files/create-folder`;
    const folderPath = `${this.currentPath()}${folderName.trim()}/`;

    try {
      await firstValueFrom(
        this.http.post<unknown>(url, { path: folderPath }, { headers: this.getHeaders() })
      );
      // Refresh current directory
      await this.loadDirectory(this.currentPath());
    } catch (err: any) {
      console.error('Failed to create folder:', err);
      this.error.set(err.error?.message || 'Failed to create directory.');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Initiates direct S3 client-side file upload using a generated presigned PUT URL
   */
  async uploadFile(file: File): Promise<void> {
    const targetPath = `${this.currentPath()}${file.name}`;
    this.uploadingFileName.set(file.name);
    this.uploadProgress.set(0);
    this.error.set(null);

    try {
      // 1. Get PUT presigned URL from backend
      const presignUrl = `${environment.APIURL}/files/upload`;
      const presignRes = await firstValueFrom(
        this.http.post<{ url: string }>(
          presignUrl,
          { key: targetPath },
          { headers: this.getHeaders() }
        )
      );

      // 2. Perform direct binary upload to Cloudflare R2 / mock endpoint via PUT
      // IMPORTANT: DO NOT send our JWT Authorization header here because S3 will reject it!
      const uploadHeaders = new HttpHeaders({
        'Content-Type': file.type || 'application/octet-stream',
      });

      await new Promise<void>((resolve, reject) => {
        this.http
          .put(presignRes.url, file, {
            headers: uploadHeaders,
            reportProgress: true,
            observe: 'events',
          })
          .subscribe({
            next: (event: HttpEvent<any>) => {
              if (event.type === HttpEventType.UploadProgress && event.total) {
                const percentage = Math.round((100 * event.loaded) / event.total);
                this.uploadProgress.set(percentage);
              } else if (event.type === HttpEventType.Response) {
                resolve();
              }
            },
            error: (err) => {
              console.error('Direct S3 upload failed:', err);
              reject(new Error('Network error during file upload. Check bucket CORS config.'));
            },
          });
      });

      // 3. Reset progress and refresh directory contents
      this.uploadingFileName.set(null);
      this.uploadProgress.set(null);
      await this.loadDirectory(this.currentPath());
    } catch (err: any) {
      console.error('Upload flow error:', err);
      this.error.set(err.message || 'An error occurred during file upload.');
      this.uploadingFileName.set(null);
      this.uploadProgress.set(null);
      throw err;
    }
  }
}
