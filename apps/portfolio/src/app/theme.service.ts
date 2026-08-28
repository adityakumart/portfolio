import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject(DOCUMENT);

  // Initialize based on saved preference or system default
  darkMode = signal<boolean>(
    JSON.parse(localStorage.getItem('darkMode') ?? 'null') ??
      window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  constructor() {
    // Automatically sync DOM and localStorage whenever the signal changes
    effect(() => {
      const isDark = this.darkMode();
      if (isDark) {
        this.document.documentElement.classList.add('dark');
      } else {
        this.document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('darkMode', JSON.stringify(isDark));
    });
  }

  toggleTheme() {
    this.darkMode.update((mode) => !mode);
  }
}
