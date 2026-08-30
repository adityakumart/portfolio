import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
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
   * Performs direct file upload to backend which uploads directly to R2 / mock storage
   */
  async uploadFile(file: File): Promise<void> {
    const targetPath = `${this.currentPath()}${file.name}`;
    this.uploadingFileName.set(file.name);
    this.uploadProgress.set(0);
    this.error.set(null);

    try {
      const uploadUrl = `${environment.APIURL}/files/upload?key=${encodeURIComponent(targetPath)}`;
      
      const uploadHeaders = this.getHeaders().set(
        'Content-Type',
        file.type || 'application/octet-stream'
      );

      await new Promise<void>((resolve, reject) => {
        this.http
          .post(uploadUrl, file, {
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
            error: (err: any) => {
              console.error('Backend file upload failed:', err);
              reject(new Error(err.error?.message || 'File upload failed.'));
            },
          });
      });

      // Reset progress and refresh directory contents
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
