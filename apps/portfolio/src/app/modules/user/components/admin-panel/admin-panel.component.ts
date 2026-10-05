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
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideShieldAlert,
  lucideShieldCheck,
  lucideUsers,
  lucideFilm,
  lucideSearch,
  lucideRefreshCw,
  lucideCheck,
  lucideX,
  lucidePlus,
  lucidePencil,
  lucideTrash2,
  lucideBarChart3,
  lucideExternalLink,
  lucideCheckCircle2,
  lucideAlertCircle,
  lucideChevronLeft,
  lucideChevronRight,
  lucideActivity,
  lucideLock,
  lucideLayers,
  lucideFolderArchive,
  lucideZap,
  lucideMessageSquare,
  lucideCheckSquare,
  lucideGamepad2,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { AdminApiService } from '../../services/admin-api.service';
import { AuthService } from '../../services/auth';
import {
  AdminUserListItem,
  AdminDashboardStats,
  UpdateUserPermissionsPayload,
  CreateMoviePayload,
  UpdateMoviePayload,
  IMovie,
} from '@portfolio/shared-types';
import { MovieImporterComponent } from '../../../movie-importer/movie-importer.component';

export type AdminTab = 'overview' | 'users' | 'movies' | 'importer';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NgIconComponent,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmInputImports,
    MovieImporterComponent,
  ],
  providers: [
    provideIcons({
      lucideShieldAlert,
      lucideShieldCheck,
      lucideUsers,
      lucideFilm,
      lucideSearch,
      lucideRefreshCw,
      lucideCheck,
      lucideX,
      lucidePlus,
      lucidePencil,
      lucideTrash2,
      lucideBarChart3,
      lucideExternalLink,
      lucideCheckCircle2,
      lucideAlertCircle,
      lucideChevronLeft,
      lucideChevronRight,
      lucideActivity,
      lucideLock,
      lucideLayers,
      lucideFolderArchive,
      lucideZap,
      lucideMessageSquare,
      lucideCheckSquare,
      lucideGamepad2,
    }),
  ],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPanelComponent implements OnInit {
  private adminApi = inject(AdminApiService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  currentUser = computed(() => this.authService.currentUser());

  // Navigation
  activeTab = signal<AdminTab>('overview');

  // Stats State
  stats = signal<AdminDashboardStats | null>(null);
  isLoadingStats = signal<boolean>(false);

  // Users State
  users = signal<AdminUserListItem[]>([]);
  totalUsersCount = signal<number>(0);
  userCurrentPage = signal<number>(1);
  userPageSize = signal<number>(15);
  isLoadingUsers = signal<boolean>(false);
  userSearch = signal<string>('');
  userRoleFilter = signal<'all' | 'masterAdmin' | 'admin' | 'user'>('all');
  userStatusFilter = signal<'all' | 'enabled' | 'disabled'>('all');

  // User Permissions Modal State
  selectedUserForEdit = signal<AdminUserListItem | null>(null);
  isEditModalOpen = signal<boolean>(false);
  isSavingPermissions = signal<boolean>(false);
  editForm = signal<{
    admin: boolean;
    masterAdmin: boolean;
    isEnabled: boolean;
    masterFolder: boolean;
    aiSpace: boolean;
    aiAssistant: boolean;
    fileManager: boolean;
    dietHydration: boolean;
    planner: boolean;
    game: boolean;
    movies: boolean;
  }>({
    admin: false,
    masterAdmin: false,
    isEnabled: true,
    masterFolder: false,
    aiSpace: false,
    aiAssistant: false,
    fileManager: false,
    dietHydration: false,
    planner: false,
    game: false,
    movies: false,
  });

  // Movies State
  movies = signal<IMovie[]>([]);
  totalMoviesCount = signal<number>(0);
  movieCurrentPage = signal<number>(1);
  moviePageSize = signal<number>(15);
  availableMovieYears = signal<number[]>([]);
  selectedMovieYear = signal<number | null>(null);
  movieSearch = signal<string>('');
  isLoadingMovies = signal<boolean>(false);

  // Movie Modals
  isAddMovieModalOpen = signal<boolean>(false);
  isEditMovieModalOpen = signal<boolean>(false);
  selectedMovieForEdit = signal<IMovie | null>(null);
  isSavingMovie = signal<boolean>(false);
  movieForm = signal<{
    title: string;
    cast: string;
    englishTranslation: string;
    teluguTranslation: string;
    year: number | undefined;
  }>({
    title: '',
    cast: '',
    englishTranslation: '',
    teluguTranslation: '',
    year: undefined,
  });

  // In-app Notifications
  toastNotification = signal<{ text: string; type: 'success' | 'error' } | null>(
    null,
  );
  private toastTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboardStats();
      this.loadUsers();
      this.loadMovies();
    }
  }

  setTab(tab: AdminTab): void {
    this.activeTab.set(tab);
    if (tab === 'overview') this.loadDashboardStats();
    if (tab === 'users') this.loadUsers();
    if (tab === 'movies') this.loadMovies();
  }

  showToast(text: string, type: 'success' | 'error' = 'success'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastNotification.set({ text, type });
    this.toastTimer = setTimeout(() => {
      this.toastNotification.set(null);
    }, 4000);
  }

  // --- 1. Dashboard Overview ---
  loadDashboardStats(): void {
    this.isLoadingStats.set(true);
    this.adminApi.getDashboardStats().subscribe({
      next: (res) => {
        this.isLoadingStats.set(false);
        this.stats.set(res.stats);
      },
      error: (err) => {
        this.isLoadingStats.set(false);
        console.error('Failed to load admin stats:', err);
      },
    });
  }

  // --- 2. User Permissions Management ---
  loadUsers(): void {
    this.isLoadingUsers.set(true);
    this.adminApi
      .getUsers({
        page: this.userCurrentPage(),
        limit: this.userPageSize(),
        search: this.userSearch() || undefined,
        role: this.userRoleFilter(),
        status: this.userStatusFilter(),
      })
      .subscribe({
        next: (res) => {
          this.isLoadingUsers.set(false);
          this.users.set(res.users);
          this.totalUsersCount.set(res.total);
        },
        error: (err) => {
          this.isLoadingUsers.set(false);
          this.showToast(err.error?.message || 'Failed to fetch users', 'error');
        },
      });
  }

  onUserSearch(term: string): void {
    this.userSearch.set(term);
    this.userCurrentPage.set(1);
    this.loadUsers();
  }

  onUserRoleFilter(role: 'all' | 'masterAdmin' | 'admin' | 'user'): void {
    this.userRoleFilter.set(role);
    this.userCurrentPage.set(1);
    this.loadUsers();
  }

  onUserStatusFilter(status: 'all' | 'enabled' | 'disabled'): void {
    this.userStatusFilter.set(status);
    this.userCurrentPage.set(1);
    this.loadUsers();
  }

  goToUserPage(delta: number): void {
    const next = this.userCurrentPage() + delta;
    if (next >= 1 && next <= this.totalUserPages()) {
      this.userCurrentPage.set(next);
      this.loadUsers();
    }
  }

  totalUserPages = computed(() => {
    return Math.ceil(this.totalUsersCount() / this.userPageSize()) || 1;
  });

  openEditPermissionsModal(user: AdminUserListItem): void {
    this.selectedUserForEdit.set(user);
    this.editForm.set({
      admin: user.admin,
      masterAdmin: user.masterAdmin,
      isEnabled: user.isEnabled,
      masterFolder: user.masterFolder ?? false,
      aiSpace: user.modules.aiSpace ?? false,
      aiAssistant: user.modules.aiAssistant ?? false,
      fileManager: user.modules.fileManager ?? false,
      dietHydration: user.modules.dietHydration ?? false,
      planner: user.modules.planner ?? false,
      game: user.modules.game ?? false,
      movies: user.modules.movies ?? false,
    });
    this.isEditModalOpen.set(true);
  }

  closeEditPermissionsModal(): void {
    this.isEditModalOpen.set(false);
    this.selectedUserForEdit.set(null);
  }

  savePermissions(): void {
    const user = this.selectedUserForEdit();
    if (!user) return;

    this.isSavingPermissions.set(true);
    const form = this.editForm();

    const payload: UpdateUserPermissionsPayload = {
      admin: form.admin,
      masterAdmin: form.masterAdmin,
      isEnabled: form.isEnabled,
      masterFolder: form.masterFolder,
      modules: {
        aiSpace: form.aiSpace,
        aiAssistant: form.aiAssistant,
        fileManager: form.fileManager,
        dietHydration: form.dietHydration,
        planner: form.planner,
        game: form.game,
        movies: form.movies,
      },
    };

    this.adminApi.updateUserPermissions(user.id, payload).subscribe({
      next: (res) => {
        this.isSavingPermissions.set(false);
        this.closeEditPermissionsModal();
        this.showToast(`Updated permissions for ${user.email}`);
        this.loadUsers();
        this.loadDashboardStats();
      },
      error: (err) => {
        this.isSavingPermissions.set(false);
        this.showToast(
          err.error?.message || 'Failed to update user permissions',
          'error',
        );
      },
    });
  }

  deactivateUser(user: AdminUserListItem): void {
    if (
      !confirm(
        `Are you sure you want to deactivate and remove access for user "${user.email}"?`,
      )
    ) {
      return;
    }

    this.adminApi.deleteUser(user.id).subscribe({
      next: () => {
        this.showToast(`User ${user.email} deactivated.`);
        this.loadUsers();
        this.loadDashboardStats();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to deactivate user', 'error');
      },
    });
  }

  // --- 3. Movie Management ---
  loadMovies(): void {
    this.isLoadingMovies.set(true);
    this.adminApi
      .getMovies({
        page: this.movieCurrentPage(),
        limit: this.moviePageSize(),
        search: this.movieSearch() || undefined,
        year: this.selectedMovieYear() ?? undefined,
      })
      .subscribe({
        next: (res) => {
          this.isLoadingMovies.set(false);
          this.movies.set(res.movies);
          this.totalMoviesCount.set(res.total);
          this.availableMovieYears.set(res.years);
        },
        error: (err) => {
          this.isLoadingMovies.set(false);
          this.showToast(err.error?.message || 'Failed to load movies', 'error');
        },
      });
  }

  onMovieSearch(term: string): void {
    this.movieSearch.set(term);
    this.movieCurrentPage.set(1);
    this.loadMovies();
  }

  onMovieYearFilter(year: number | null): void {
    this.selectedMovieYear.set(year);
    this.movieCurrentPage.set(1);
    this.loadMovies();
  }

  goToMoviePage(delta: number): void {
    const next = this.movieCurrentPage() + delta;
    if (next >= 1 && next <= this.totalMoviePages()) {
      this.movieCurrentPage.set(next);
      this.loadMovies();
    }
  }

  totalMoviePages = computed(() => {
    return Math.ceil(this.totalMoviesCount() / this.moviePageSize()) || 1;
  });

  openAddMovieModal(): void {
    this.movieForm.set({
      title: '',
      cast: '',
      englishTranslation: '',
      teluguTranslation: '',
      year: new Date().getFullYear(),
    });
    this.isAddMovieModalOpen.set(true);
  }

  closeAddMovieModal(): void {
    this.isAddMovieModalOpen.set(false);
  }

  submitAddMovie(): void {
    const form = this.movieForm();
    if (!form.title.trim()) {
      this.showToast('Movie title is required.', 'error');
      return;
    }
    if (!form.englishTranslation.trim() && !form.teluguTranslation.trim()) {
      this.showToast(
        'At least one translation (English or Telugu) is required.',
        'error',
      );
      return;
    }

    this.isSavingMovie.set(true);
    const payload: CreateMoviePayload = {
      title: form.title.trim(),
      cast: form.cast.trim() || undefined,
      englishTranslation: form.englishTranslation.trim(),
      teluguTranslation: form.teluguTranslation.trim() || undefined,
      year: form.year ? Number(form.year) : undefined,
    };

    this.adminApi.createMovie(payload).subscribe({
      next: (res) => {
        this.isSavingMovie.set(false);
        this.closeAddMovieModal();
        this.showToast(`Movie "${res.movie.title}" added successfully.`);
        this.loadMovies();
        this.loadDashboardStats();
      },
      error: (err) => {
        this.isSavingMovie.set(false);
        this.showToast(err.error?.message || 'Failed to add movie.', 'error');
      },
    });
  }

  openEditMovieModal(movie: IMovie): void {
    this.selectedMovieForEdit.set(movie);
    this.movieForm.set({
      title: movie.title,
      cast: movie.cast || '',
      englishTranslation: movie.englishTranslation || '',
      teluguTranslation: movie.teluguTranslation || '',
      year: movie.year,
    });
    this.isEditMovieModalOpen.set(true);
  }

  closeEditMovieModal(): void {
    this.isEditMovieModalOpen.set(false);
    this.selectedMovieForEdit.set(null);
  }

  submitUpdateMovie(): void {
    const movie = this.selectedMovieForEdit();
    if (!movie?.id) return;

    const form = this.movieForm();
    if (!form.title.trim()) {
      this.showToast('Movie title is required.', 'error');
      return;
    }

    this.isSavingMovie.set(true);
    const payload: UpdateMoviePayload = {
      title: form.title.trim(),
      cast: form.cast.trim() || '',
      englishTranslation: form.englishTranslation.trim(),
      teluguTranslation: form.teluguTranslation.trim() || '',
      year: form.year ? Number(form.year) : undefined,
    };

    this.adminApi.updateMovie(movie.id, payload).subscribe({
      next: (res) => {
        this.isSavingMovie.set(false);
        this.closeEditMovieModal();
        this.showToast(`Movie "${res.movie.title}" updated successfully.`);
        this.loadMovies();
      },
      error: (err) => {
        this.isSavingMovie.set(false);
        this.showToast(err.error?.message || 'Failed to update movie.', 'error');
      },
    });
  }

  deleteMovie(movie: IMovie): void {
    if (!movie.id) return;
    if (
      !confirm(
        `Are you sure you want to permanently delete movie "${movie.title}"?`,
      )
    ) {
      return;
    }

    this.adminApi.deleteMovie(movie.id).subscribe({
      next: () => {
        this.showToast(`Movie "${movie.title}" deleted.`);
        this.loadMovies();
        this.loadDashboardStats();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to delete movie.', 'error');
      },
    });
  }
}
