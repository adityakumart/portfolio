import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'movies',
    renderMode: RenderMode.Client,
  },
  {
    path: 'game',
    renderMode: RenderMode.Client,
  },
  {
    path: 'user/**',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
