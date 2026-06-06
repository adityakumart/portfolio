// src/app/app.config.ts
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideIndexedDb, DBConfig } from 'ngx-indexed-db';
import { provideRouter, withPreloading, NoPreloading } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay, withNoIncrementalHydration } from '@angular/platform-browser';
import { AppRoutes } from './app/app-routing.module';

const dbConfig: DBConfig = {
  name: 'ExperienceCalcDB',
  version: 1,
  objectStoresMeta: [
    {
      store: 'experience_calculator',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'name', keypath: 'name', options: { unique: false } },
        { name: 'email', keypath: 'email', options: { unique: true } } // Unique index for lookups
      ]
    }
  ]
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideIndexedDb(dbConfig),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch()),
    provideRouter(
      AppRoutes,
      withPreloading(NoPreloading)
    ),
    provideClientHydration(withEventReplay(), withNoIncrementalHydration())
  ]
};
