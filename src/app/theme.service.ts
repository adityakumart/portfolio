import { Injectable, signal, effect, Inject, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  theme = signal<'light' | 'dark'>('dark');

  constructor(
    @Inject(DOCUMENT) private document: Document,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);

    // On service initialization, check localStorage for a saved theme.
    // This runs only on the browser to avoid issues with SSR.
    if (this.document.defaultView) {
      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (storedTheme) {
        this.theme.set(storedTheme);
      } else {
        // Default to dark theme if no preference is stored
        localStorage.setItem('theme', 'dark');
        this.theme.set('dark');
      }
    }

    // Effect to update body class and localStorage when the theme signal changes.
    effect(() => {
      localStorage.setItem('theme', this.theme());
      this.renderer.removeClass(this.document.body, this.theme() === 'dark' ? 'light-theme' : 'dark-theme');
      this.renderer.addClass(this.document.body, this.theme() === 'dark' ? 'dark-theme' : 'light-theme');
    });
  }

  toggleTheme(): void {
    this.theme.update(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
  }
}