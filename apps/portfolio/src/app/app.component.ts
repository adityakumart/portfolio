import {
  Component,
  DOCUMENT,
  inject,
  ChangeDetectionStrategy,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { ThemeService } from './theme.service';
import { GlobalData } from '../shared/data/GlobalData';
import { appRoutingList } from './shared/data/routes';
import { MatMenuTrigger } from '@angular/material/menu';
import { AuthService } from './modules/user/services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  @ViewChildren(MatMenuTrigger) menuTriggers!: QueryList<MatMenuTrigger>;

  routingList = appRoutingList;

  closeAllMenus(): void {
    this.menuTriggers.forEach((trigger) => {
      if (trigger.menuOpen) {
        trigger.closeMenu();
      }
    });
  }

  private document = inject(DOCUMENT);
  private globalData: GlobalData = inject(GlobalData);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private authService = inject(AuthService);

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

  // name = signal(this.globalData.resume.basics.name);
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.document.title =
      this.globalData.resume.basics.name +
      ' || ' +
      this.globalData.resume.basics.jobtitle;
  }
}
