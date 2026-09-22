import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withPreloading, NoPreloading } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  provideClientHydration,
  withEventReplay,
  withNoIncrementalHydration,
} from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideSpartanHlm } from '@spartan-ng/hel/utils';
import { provideHlmDatePickerConfig } from '@spartan-ng/hel/date-picker';
import { formatToIndianDate, parseIndianDate } from './app/shared/pipes/indian-date.pipe';
import { AppRoutes } from './app/app-routing.module';
import { errorInterceptor } from './app/shared/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideSpartanHlm(),
    provideHlmDatePickerConfig<Date>({
      formatDate: (date: Date) => formatToIndianDate(date),
      formatInputDate: (date: Date) => formatToIndianDate(date),
      parseDate: (value: string) => parseIndianDate(value),
      autoCloseOnSelect: true,
    }),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch(), withInterceptors([errorInterceptor])),
    provideRouter(AppRoutes, withPreloading(NoPreloading)),
    provideClientHydration(withEventReplay(), withNoIncrementalHydration()),
    provideAnimationsAsync(),
  ],
};
