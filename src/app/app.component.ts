import { Component, Inject } from '@angular/core';
import { RouterModule } from '@angular/router';
// import { AppRoutes } from './app-routing.module';
import { DOCUMENT } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterModule, MatButtonModule, MatIcon, MatTooltipModule, MatSidenavModule]
})
export class AppComponent {
  // title = 'portfolio';


  constructor(
    @Inject(DOCUMENT) private document: Document
  ) { }



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

      let bases = this.document.getElementsByTagName('base');

      if (bases.length > 0) {
        bases[0].setAttribute('href', environment.baseHref);

      }
    }, 0);

  }
}
