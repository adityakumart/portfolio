import {
  Component,
  DOCUMENT,
  inject,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { ThemeService } from './theme.service';
import { GlobalData } from '../shared/data/GlobalData';
import { appRoutingList } from './shared/data/routes';

import { HlmToaster } from '@spartan-ng/hel/sonner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HlmToaster],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  routingList = appRoutingList;

  private document = inject(DOCUMENT);
  private globalData: GlobalData = inject(GlobalData);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  readonly isUserRoute = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => {
        const urlWithoutQueryParams = event.urlAfterRedirects.split('?')[0];
        return (
          urlWithoutQueryParams === '/user' ||
          urlWithoutQueryParams.startsWith('/user/')
        );
      }),
    ),
    {
      initialValue: this.document.location
        ? this.document.location.pathname === '/user' ||
          this.document.location.pathname.startsWith('/user/')
        : false,
    },
  );

  readonly activeRouteLabel = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => {
        const urlWithoutQueryParams = event.urlAfterRedirects.split('?')[0];

        // Check top-level routes first
        const activeRoute = this.routingList.find(
          (route) => route.link === urlWithoutQueryParams,
        );
        if (activeRoute) {
          return activeRoute.label === 'Portfolio' ? '' : activeRoute.label;
        }

        // Check nested groups (like Dev Tools categories)
        for (const route of this.routingList) {
          if (route.groups) {
            for (const group of route.groups) {
              const matchedTool = group.tools.find(
                (tool) => tool.link === urlWithoutQueryParams,
              );
              if (matchedTool) {
                return `${route.label} - ${matchedTool.name}`;
              }
            }
          }
        }

        return '';
      }),
    ),
    { initialValue: '' },
  );

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  ngOnInit(): void {
    this.document.title =
      this.globalData.resume.basics.name +
      ' || ' +
      this.globalData.resume.basics.jobtitle;
  }
}
