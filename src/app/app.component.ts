import { Component, computed, DOCUMENT, Inject, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from './theme.service';
import { GlobalData } from 'src/shared/data/GlobalData';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatTooltipModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  routingList = [
    {
      link: "/",
      label: "Home",
      icon: "home"
    },
    {
      link: "/calculator",
      label: "Calculator",
      icon: "calculate"
    },
    {
      link: "/json-to-typescript",
      label: "JSON to TypeScript",
      icon: "code"
    }
    // {
    //   link: "/formbuilder",
    //   label: "Dynamic Form",
    //   icon: "dynamic_form"
    // }
  ];



  private document = inject(DOCUMENT);
  private globalData: GlobalData = inject(GlobalData);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  readonly isDarkMode = computed(() => this.themeService.theme() === 'dark');

  readonly activeRouteLabel = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => {
        const urlWithoutQueryParams = event.urlAfterRedirects.split('?')[0];
        const activeRoute = this.routingList.find(route => route.link === urlWithoutQueryParams);
        if(activeRoute?.label === 'Home') {
          return '';
        }
        return activeRoute?.label || '';
      })
    ),
    { initialValue: '' }
  );

  // name = signal(this.globalData.resume.basics.name);
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  loadStyle(styleName: string): void {
    const head = this.document.getElementsByTagName('head')[0];

    // const themeLink = this.document.getElementById(
    //   'client-theme'
    // ) as HTMLLinkElement;
    // if (themeLink) {
    //   themeLink.href = styleName;
    // } else {
    const style = this.document.createElement('link');
    // style.id = styleName;
    style.rel = 'stylesheet';
    style.href = `${styleName}`;

    head.appendChild(style);
    // }
  }
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    setTimeout(() => {
      this.loadStyle('custom.css');
      this.loadStyle('bootstrap.css');
      this.loadStyle('border.css');
      this.loadStyle('colors.css');
      this.loadStyle('materialIcons.css');
      this.loadStyle('text.css');

      // let bases = this.document.getElementsByTagName('base');

      // if (bases.length > 0) {
      //   bases[0].setAttribute('href', environment.baseHref);

      // }
    }, 0);


    this.document.title = this.globalData.resume.basics.name + ' || ' + this.globalData.resume.basics.jobtitle;
  }
}