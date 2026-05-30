// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideIndexedDb, DBConfig } from 'ngx-indexed-db';

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
    provideIndexedDb(dbConfig)
  ]
};
