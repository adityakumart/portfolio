import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withPreloading, NoPreloading } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  provideClientHydration,
  withEventReplay,
  withNoIncrementalHydration,
} from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppRoutes } from './app/app-routing.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch()),
    provideRouter(AppRoutes, withPreloading(NoPreloading)),
    provideClientHydration(withEventReplay(), withNoIncrementalHydration()),
    provideAnimationsAsync(),
  ],
};
