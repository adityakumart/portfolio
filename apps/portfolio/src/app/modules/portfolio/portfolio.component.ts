import {
  Component,
  OnDestroy,
  signal,
  inject,
  computed,
  AfterViewInit,
  ElementRef,
  ChangeDetectionStrategy,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { PortfolioRoutingModule } from './portfolio-routing.module';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GlobalData } from '../../../shared/data/GlobalData';
import { MatExpansionModule } from '@angular/material/expansion';
import { HeroComponent } from './sub-components/hero/hero.component';
import { SummaryComponent } from './sub-components/summary/summary.component';
import { ExperienceComponent } from './sub-components/experience/experience.component';
import { SkillsComponent } from './sub-components/skills/skills.component';
import { CertificatesComponent } from './sub-components/certificates/certificates.component';
import { EducationComponent } from './sub-components/education/education.component';
import { AwardsComponent } from './sub-components/awards/awards.component';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
  imports: [
    PortfolioRoutingModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule,
    HeroComponent,
    SummaryComponent,
    ExperienceComponent,
    SkillsComponent,
    CertificatesComponent,
    EducationComponent,
    AwardsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [GlobalData],
})
export class PortfolioComponent implements OnDestroy, AfterViewInit {
  destroyed = new Subject<void>();
  private el = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);
  private globalData = inject(GlobalData);
  columnsMap = new Map([
    // [Breakpoints.XSmall, 1],
    // [Breakpoints.Small, 2],
    // [Breakpoints.Medium, 3],
    // [Breakpoints.Large, 4],
    // [Breakpoints.XLarge, 5],
    [Breakpoints.XSmall, 1],
    [Breakpoints.Small, 2],
    [Breakpoints.Medium, 2],
    [Breakpoints.Large, 2],
    [Breakpoints.XLarge, 2],
  ]);

  constructor() {
    inject(BreakpointObserver)
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .pipe(takeUntil(this.destroyed))
      .subscribe((result) => {
        for (const query of Object.keys(result.breakpoints)) {
          if (result.breakpoints[query]) {
            this.gridColumns.set(this.columnsMap.get(query) ?? 1);
          }
        }
      });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target); // Only animate once
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
      );

      setTimeout(() => {
        const elements =
          this.el.nativeElement.querySelectorAll('.reveal-on-scroll');
        elements.forEach((el: Element) => observer.observe(el));
      }, 100); // Small timeout ensures the @for loops have rendered
    }
  }

  gridColumns = signal(1);

  resume = signal(this.globalData.resume);
  classNameForJobTitle = computed(() => {
    switch (true) {
      case this.jobtitle().length % 10 === 0:
        return 'purple';
      case this.jobtitle().length % 9 === 0:
        return 'grey';
      case this.jobtitle().length % 8 === 0:
        return 'darkGrey';
      case this.jobtitle().length % 7 === 0:
        return 'darkBlue';
      case this.jobtitle().length % 6 === 0:
        return 'brown';
      case this.jobtitle().length % 5 === 0:
        return 'orange';
      case this.jobtitle().length % 4 === 0:
        return 'green';
      case this.jobtitle().length % 3 === 0:
        return 'skyblue';
      case this.jobtitle().length % 2 === 0:
        return 'blue';
      case this.jobtitle().length % 1 === 0:
        return 'red';
      default:
        return '';
    }
  });

  jobtitle = signal('');

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
