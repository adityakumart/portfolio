import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideUpload,
  lucideFileText,
  lucideCheck,
  lucideCheckCircle2,
  lucideAlertCircle,
  lucideAlertTriangle,
  lucideSearch,
  lucideRefreshCw,
  lucideTrash2,
  lucideVolume2,
  lucideFilm,
  lucidePlus,
  lucideX,
  lucideArrowRight,
  lucideDatabase,
  lucideChevronLeft,
  lucideChevronRight,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { MovieApiService } from './services/movie-api.service';
import {
  IMovie,
  IMovieUploadResponse,
  IMovieSkippedDetail,
} from '@portfolio/shared-types';

interface ParsedMoviePreview {
  title: string;
  cast: string;
  englishTranslation: string;
  year?: number;
  status: 'valid' | 'missing_translation' | 'invalid';
  statusMessage: string;
}

@Component({
  selector: 'app-movie-importer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmInputImports,
  ],
  providers: [
    provideIcons({
      lucideUpload,
      lucideFileText,
      lucideCheck,
      lucideCheckCircle2,
      lucideAlertCircle,
      lucideAlertTriangle,
      lucideSearch,
      lucideRefreshCw,
      lucideTrash2,
      lucideVolume2,
      lucideFilm,
      lucidePlus,
      lucideX,
      lucideArrowRight,
      lucideDatabase,
      lucideChevronLeft,
      lucideChevronRight,
    }),
  ],
  templateUrl: './movie-importer.component.html',
  styleUrl: './movie-importer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieImporterComponent implements OnInit {
  private movieApiService = inject(MovieApiService);
  private platformId = inject(PLATFORM_ID);

  // Active Input Mode
  activeMode = signal<'file' | 'paste'>('file');

  // Paste Mode State
  pastedJson = signal<string>('');

  // Drag and Drop State
  isDragging = signal<boolean>(false);
  loadedFilesSummary = signal<Array<{ name: string; count: number }>>([]);

  // Parsed Upload Queue State
  rawParsedPayload = signal<unknown[]>([]);
  parseError = signal<string | null>(null);

  // Pre-validation computation
  parsedPreview = computed<ParsedMoviePreview[]>(() => {
    const raw = this.rawParsedPayload();
    if (!raw.length) return [];

    return raw.map((item) => {
      if (!item || typeof item !== 'object') {
        return {
          title: '(Invalid Object)',
          cast: '',
          englishTranslation: '',
          status: 'invalid',
          statusMessage: 'Item is not a valid JSON object',
        };
      }

      const rec = item as Record<string, unknown>;
      const title =
        typeof rec['title'] === 'string' ? rec['title'].trim() : '';
      const englishTranslation =
        typeof rec['englishTranslation'] === 'string'
          ? rec['englishTranslation'].trim()
          : '';
      const cast = typeof rec['cast'] === 'string' ? rec['cast'].trim() : '';

      let year: number | undefined = undefined;
      if (rec['year'] !== undefined && rec['year'] !== null && rec['year'] !== '') {
        const parsedYear = Number(rec['year']);
        if (!isNaN(parsedYear)) {
          year = parsedYear;
        }
      }

      if (!title) {
        return {
          title: '(Missing Title)',
          cast,
          englishTranslation,
          year,
          status: 'invalid',
          statusMessage: 'Title is required',
        };
      }

      if (!englishTranslation) {
        return {
          title,
          cast,
          englishTranslation: '',
          year,
          status: 'missing_translation',
          statusMessage: 'No englishTranslation (will be skipped)',
        };
      }

      return {
        title,
        cast,
        englishTranslation,
        year,
        status: 'valid',
        statusMessage: 'Ready to import',
      };
    });
  });

  // Pre-upload validation stats
  readyToImportCount = computed(
    () => this.parsedPreview().filter((p) => p.status === 'valid').length,
  );
  missingTranslationCount = computed(
    () =>
      this.parsedPreview().filter((p) => p.status === 'missing_translation')
        .length,
  );
  invalidItemsCount = computed(
    () => this.parsedPreview().filter((p) => p.status === 'invalid').length,
  );

  // Upload Action State
  isUploading = signal<boolean>(false);
  uploadResponse = signal<IMovieUploadResponse | null>(null);
  uploadError = signal<string | null>(null);

  // Database Explorer State
  dbMovies = signal<IMovie[]>([]);
  totalDbCount = signal<number>(0);
  availableYears = signal<number[]>([]);
  selectedYear = signal<number | null>(null);
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(15);
  isLoadingDb = signal<boolean>(false);

  // Active audio feedback
  currentlyPlayingId = signal<string | null>(null);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDbMovies();
    }
  }

  // --- Input Handlers ---
  setMode(mode: 'file' | 'paste'): void {
    this.activeMode.set(mode);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (event.dataTransfer?.files?.length) {
      this.processFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.processFiles(input.files);
    }
  }

  private async processFiles(fileList: FileList): Promise<void> {
    this.parseError.set(null);
    this.uploadResponse.set(null);
    this.uploadError.set(null);

    const summaries: Array<{ name: string; count: number }> = [];
    const allMovies: unknown[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.name.endsWith('.json')) {
        continue;
      }

      try {
        const text = await file.text();
        const json = JSON.parse(text);
        if (Array.isArray(json)) {
          summaries.push({ name: file.name, count: json.length });
          allMovies.push(...json);
        } else if (json && Array.isArray(json.movies)) {
          summaries.push({ name: file.name, count: json.movies.length });
          allMovies.push(...json.movies);
        } else {
          this.parseError.set(
            `File "${file.name}" does not contain a JSON array.`,
          );
        }
      } catch (err: unknown) {
        this.parseError.set(
          `Failed to parse JSON file "${file.name}": ${(err as Error).message}`,
        );
      }
    }

    this.loadedFilesSummary.set(summaries);
    this.rawParsedPayload.set(allMovies);
  }

  onJsonPasteChange(value: string): void {
    this.pastedJson.set(value);
    this.parseError.set(null);
    this.uploadResponse.set(null);
    this.uploadError.set(null);

    if (!value.trim()) {
      this.rawParsedPayload.set([]);
      return;
    }

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        this.rawParsedPayload.set(parsed);
      } else if (parsed && Array.isArray(parsed.movies)) {
        this.rawParsedPayload.set(parsed.movies);
      } else {
        this.parseError.set(
          'Pasted JSON must be an array of objects: [{ title, cast, englishTranslation, year }].',
        );
        this.rawParsedPayload.set([]);
      }
    } catch (err: unknown) {
      this.parseError.set(`JSON syntax error: ${(err as Error).message}`);
      this.rawParsedPayload.set([]);
    }
  }

  clearQueue(): void {
    this.rawParsedPayload.set([]);
    this.pastedJson.set('');
    this.loadedFilesSummary.set([]);
    this.parseError.set(null);
    this.uploadResponse.set(null);
    this.uploadError.set(null);
  }

  // --- Upload Action ---
  submitUpload(): void {
    const payload = this.rawParsedPayload();
    if (!payload.length) return;

    this.isUploading.set(true);
    this.uploadError.set(null);
    this.uploadResponse.set(null);

    this.movieApiService.uploadMovies(payload).subscribe({
      next: (res) => {
        this.isUploading.set(false);
        this.uploadResponse.set(res);
        if (res.stats.insertedCount > 0) {
          this.loadDbMovies();
        }
      },
      error: (err) => {
        this.isUploading.set(false);
        this.uploadError.set(
          err.error?.message ||
            err.message ||
            'Failed to upload movies. Please check your network or server logs.',
        );
      },
    });
  }

  // --- Database Explorer Actions ---
  loadDbMovies(): void {
    this.isLoadingDb.set(true);
    this.movieApiService
      .getMovies({
        page: this.currentPage(),
        limit: this.pageSize(),
        search: this.searchQuery() || undefined,
        year: this.selectedYear() ?? undefined,
      })
      .subscribe({
        next: (res) => {
          this.isLoadingDb.set(false);
          this.dbMovies.set(res.movies);
          this.totalDbCount.set(res.total);
          this.availableYears.set(res.years);
        },
        error: (err) => {
          this.isLoadingDb.set(false);
          console.error('Failed to load database movies:', err);
        },
      });
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.loadDbMovies();
  }

  onFilterYear(year: number | null): void {
    this.selectedYear.set(year);
    this.currentPage.set(1);
    this.loadDbMovies();
  }

  goToPage(delta: number): void {
    const next = this.currentPage() + delta;
    if (next >= 1 && next <= this.totalPages()) {
      this.currentPage.set(next);
      this.loadDbMovies();
    }
  }

  totalPages = computed(() => {
    return Math.ceil(this.totalDbCount() / this.pageSize()) || 1;
  });

  // --- Text-to-Speech Preview ---
  playSpeech(text: string, id: string): void {
    if (!isPlatformBrowser(this.platformId) || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    if (this.currentlyPlayingId() === id) {
      this.currentlyPlayingId.set(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => {
      this.currentlyPlayingId.set(null);
    };

    utterance.onerror = () => {
      this.currentlyPlayingId.set(null);
    };

    this.currentlyPlayingId.set(id);
    window.speechSynthesis.speak(utterance);
  }

  deleteMovie(movie: IMovie): void {
    if (!movie.id) return;
    if (
      !confirm(
        `Are you sure you want to delete "${movie.title}" (${movie.englishTranslation})?`,
      )
    ) {
      return;
    }

    this.movieApiService.deleteMovie(movie.id).subscribe({
      next: () => {
        this.loadDbMovies();
      },
      error: (err) => {
        alert(
          `Failed to delete movie: ${err.error?.message || err.message}`,
        );
      },
    });
  }
}
