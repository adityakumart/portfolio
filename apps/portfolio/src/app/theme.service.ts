import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type DarkPalette = 'aurora' | 'eclipse';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  // Initialize as false by default, set correct value on client side
  darkMode = signal<boolean>(false);
  darkPalette = signal<DarkPalette>('aurora');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedMode = localStorage.getItem('darkMode');
      const prefersDark =
        typeof window !== 'undefined' && typeof window.matchMedia === 'function'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
          : false;
      this.darkMode.set(savedMode !== null ? JSON.parse(savedMode) : prefersDark);

      const savedPalette = localStorage.getItem('darkPalette') as DarkPalette | null;
      if (savedPalette === 'aurora' || savedPalette === 'eclipse') {
        this.darkPalette.set(savedPalette);
      }
    }

    // Automatically sync DOM and localStorage whenever the signal changes
    effect(() => {
      const isDark = this.darkMode();
      const palette = this.darkPalette();

      if (isDark) {
        this.document.documentElement.classList.add('dark');
        this.document.documentElement.setAttribute('data-dark-palette', palette);
      } else {
        this.document.documentElement.classList.remove('dark');
        this.document.documentElement.removeAttribute('data-dark-palette');
      }

      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('darkMode', JSON.stringify(isDark));
        localStorage.setItem('darkPalette', palette);

        const metaThemeColor = this.document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          const themeColor = isDark
            ? palette === 'eclipse' ? '#08090d' : '#060814'
            : '#ffffff';
          metaThemeColor.setAttribute('content', themeColor);
        }
      }
    });
  }

  toggleTheme() {
    this.darkMode.update((mode) => !mode);
  }

  toggleDarkPalette() {
    this.darkPalette.update((current) => (current === 'aurora' ? 'eclipse' : 'aurora'));
  }

  setDarkPalette(palette: DarkPalette) {
    this.darkPalette.set(palette);
  }
}
