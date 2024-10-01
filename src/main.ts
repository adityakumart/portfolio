// import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// import { AppModule } from './app/app.module';

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import {
  NoPreloading, provideRouter,
  // withDebugTracing, 
  withPreloading
} from '@angular/router';
import { AppRoutes } from './app/app-routing.module';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
// import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideAnimations } from '@angular/platform-browser/animations';


bootstrapApplication(AppComponent,
  {
    providers: [
      provideExperimentalZonelessChangeDetection(),
      provideHttpClient(),
      provideRouter(
        AppRoutes,
        withPreloading(NoPreloading),
        // withDebugTracing()
      ),
      provideAnimations()
      // provideAnimationsAsync('noop')
    ]
  }
).catch(e => console.error(e));

// platformBrowserDynamic().bootstrapModule(AppModule)
//   .catch(err => console.error(err));
