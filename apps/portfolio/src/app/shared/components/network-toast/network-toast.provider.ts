import {
  ApplicationRef,
  createComponent,
  DOCUMENT,
  EnvironmentInjector,
  EnvironmentProviders,
  inject,
  PLATFORM_ID,
  provideEnvironmentInitializer,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NetworkToastComponent } from './network-toast.component';

/**
 * Dynamically mounts NetworkToastComponent directly to the document body
 * at runtime without needing to include or modify AppComponent.
 */
export function provideNetworkToast(): EnvironmentProviders {
  return provideEnvironmentInitializer(() => {
    const platformId = inject(PLATFORM_ID);
    if (!isPlatformBrowser(platformId)) return;

    const appRef = inject(ApplicationRef);
    const injector = inject(EnvironmentInjector);
    const document = inject(DOCUMENT);

    const componentRef = createComponent(NetworkToastComponent, {
      environmentInjector: injector,
    });

    appRef.attachView(componentRef.hostView);
    document.body.appendChild(componentRef.location.nativeElement);
  });
}
