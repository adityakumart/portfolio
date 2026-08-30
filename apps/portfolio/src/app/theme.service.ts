import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  // Initialize as false by default, set correct value on client side
  darkMode = signal<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedMode = localStorage.getItem('darkMode');
      const prefersDark =
        typeof window !== 'undefined' && typeof window.matchMedia === 'function'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
          : false;
      this.darkMode.set(savedMode !== null ? JSON.parse(savedMode) : prefersDark);
    }

    // Automatically sync DOM and localStorage whenever the signal changes
    effect(() => {
      const isDark = this.darkMode();
      if (isDark) {
        this.document.documentElement.classList.add('dark');
      } else {
        this.document.documentElement.classList.remove('dark');
      }
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('darkMode', JSON.stringify(isDark));
      }
    });
  }

  toggleTheme() {
    this.darkMode.update((mode) => !mode);
  }
}
