import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideSun, lucideMoon, lucideZap } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/hel/button';
import { HlmTooltip } from '@spartan-ng/hel/tooltip';
import { HlmCarouselImports } from '@spartan-ng/hel/carousel';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { RouterLink } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GlobalData } from '../../../shared/data/GlobalData';
import { ThemeService } from '../../theme.service';
import { SeoService } from '../../shared/services/seo.service';
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
    HlmButton,
    HlmTooltip,
    HlmCarouselImports,
    HlmCardImports,
    HlmBadgeImports,
    NgIconComponent,
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
  providers: [GlobalData, provideIcons({ lucideSun, lucideMoon, lucideZap })],
})
export class PortfolioComponent implements OnInit, OnDestroy {
  private destroyed = new Subject<void>();
  private globalData = inject(GlobalData);
  private themeService = inject(ThemeService);
  private seoService = inject(SeoService);

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

  ngOnInit(): void {
    this.seoService.setPortfolioSeo(this.resume());
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  items = signal([
    {
      id: 1,
      title: 'Work Experience',
      description: 'Details about my work experience.',
      category: 'Experience',
    },
    {
      id: 2,
      title: 'Education',
      description: 'Details about my education.',
      category: 'Education',
    },
    {
      id: 3,
      title: 'Skills',
      description: 'Details about my skills.',
      category: 'Skills',
    },
    {
      id: 4,
      title: 'Certificates',
      description: 'Details about my certificates.',
      category: 'Certificates',
    },
    {
      id: 5,
      title: 'Awards',
      description: 'Details about my awards.',
      category: 'Awards',
    },
  ]);
  getArcTransform(itemIndex: number, currentIndex: number): string {
    // Signed distance from active slide (taking wrapping into account if looping)
    const offset = itemIndex - currentIndex;

    const angle = offset * 9; // 9 deg tilt per card step
    const translateY = Math.abs(offset) * 28 + offset * offset * 4; // curved drop
    const scale = Math.max(0.82, 1 - Math.abs(offset) * 0.08);

    return `translateY(${translateY}px) rotate(${angle}deg) scale(${scale})`;
  }

  getArcOpacity(itemIndex: number, currentIndex: number): number {
    const distance = Math.abs(itemIndex - currentIndex);
    return distance > 2 ? 0.3 : 1 - distance * 0.2;
  }

  ngOnDestroy(): void {
    this.seoService.removeJsonLd();
    this.destroyed.next();
    this.destroyed.complete();
  }
}
