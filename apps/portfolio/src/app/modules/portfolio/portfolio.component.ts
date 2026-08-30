import {
  Component,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  PLATFORM_ID,
  signal,
  inject,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GlobalData } from '../../../shared/data/GlobalData';
import { ThemeService } from '../../theme.service';
import { HeroComponent } from './sub-components/hero/hero.component';
import { SummaryComponent } from './sub-components/summary/summary.component';
import { ExperienceComponent } from './sub-components/experience/experience.component';
import { SkillsComponent } from './sub-components/skills/skills.component';
import { CertificatesComponent } from './sub-components/certificates/certificates.component';
import { EducationComponent } from './sub-components/education/education.component';
import { AwardsComponent } from './sub-components/awards/awards.component';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
  imports: [
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    HeroComponent,
    SummaryComponent,
    ExperienceComponent,
    SkillsComponent,
    CertificatesComponent,
    EducationComponent,
    AwardsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GlobalData],
})
export class PortfolioComponent implements AfterViewInit, OnDestroy {
  private destroyed = new Subject<void>();
  private el = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);
  private globalData = inject(GlobalData);
  private themeService = inject(ThemeService);

  private intersectionObserver?: IntersectionObserver;
  private mutationObserver?: MutationObserver;

  isDarkMode = computed(() => this.themeService.darkMode());
  resume = signal(this.globalData.resume);
  gridColumns = signal(1);

  private readonly columnsMap = new Map([
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

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollReveal();
    }
  }

  private initScrollReveal(): void {
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback if IntersectionObserver is not available: make everything visible immediately
      const elements =
        this.el.nativeElement.querySelectorAll('.reveal-on-scroll');
      elements.forEach((el: Element) => el.classList.add('visible'));
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.intersectionObserver?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' },
    );

    const observePendingElements = () => {
      const elements = this.el.nativeElement.querySelectorAll(
        '.reveal-on-scroll:not(.visible)',
      );
      elements.forEach((el: Element) => this.intersectionObserver?.observe(el));
    };

    // Observe immediate elements
    observePendingElements();

    // Observe newly rendered deferred elements
    if (typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver(() => {
        observePendingElements();
      });
      this.mutationObserver.observe(this.el.nativeElement, {
        childList: true,
        subtree: true,
      });
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
    this.mutationObserver?.disconnect();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
