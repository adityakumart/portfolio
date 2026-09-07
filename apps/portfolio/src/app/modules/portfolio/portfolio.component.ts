import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  computed,
  ChangeDetectionStrategy,
  viewChild,
} from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideSun,
  lucideMoon,
  lucideZap,
  lucideBriefcase,
  lucideGraduationCap,
  lucideCode,
  lucideAward,
  lucideTrophy,
  lucideArrowRight,
  lucideChevronLeft,
  lucideChevronRight,
  lucideExternalLink,
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/hel/button';
import { HlmTooltip } from '@spartan-ng/hel/tooltip';
import { HlmCarousel, HlmCarouselImports } from '@spartan-ng/hel/carousel';
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

export interface ArcConfig {
  radius: number;
  angleStepDeg: number;
  yDropMultiplier: number;
  scaleDecay: number;
  minScale: number;
  maxTiltZDeg: number;
  yawYDeg: number;
  depthOffsetPx: number;
}

export interface ArcCarouselItem {
  id: number;
  title: string;
  description: string;
  category: string;
  badge: string;
  icon: string;
  sectionId: string;
  gradientClass: string;
  glowColor: string;
}

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
  providers: [
    GlobalData,
    provideIcons({
      lucideSun,
      lucideMoon,
      lucideZap,
      lucideBriefcase,
      lucideGraduationCap,
      lucideCode,
      lucideAward,
      lucideTrophy,
      lucideArrowRight,
      lucideChevronLeft,
      lucideChevronRight,
      lucideExternalLink,
    }),
  ],
})
export class PortfolioComponent implements OnInit, OnDestroy {
  private destroyed = new Subject<void>();
  private globalData = inject(GlobalData);
  private themeService = inject(ThemeService);
  private seoService = inject(SeoService);

  isDarkMode = computed(() => this.themeService.darkMode());
  resume = signal(this.globalData.resume);
  gridColumns = signal(1);

  currentBreakpoint = signal<string>(Breakpoints.Large);

  // Strongly typed viewChild for Spartan HlmCarousel
  carouselComp = viewChild(HlmCarousel);

  private readonly columnsMap = new Map([
    [Breakpoints.XSmall, 1],
    [Breakpoints.Small, 2],
    [Breakpoints.Medium, 2],
    [Breakpoints.Large, 2],
    [Breakpoints.XLarge, 2],
  ]);

  readonly arcConfig = computed<ArcConfig>(() => {
    const bp = this.currentBreakpoint();
    if (bp === Breakpoints.XSmall) {
      return {
        radius: 540,
        angleStepDeg: 13,
        yDropMultiplier: 1.15,
        scaleDecay: 0.12,
        minScale: 0.78,
        maxTiltZDeg: 14,
        yawYDeg: 11,
        depthOffsetPx: 35,
      };
    }
    if (bp === Breakpoints.Small || bp === Breakpoints.Medium) {
      return {
        radius: 820,
        angleStepDeg: 10.5,
        yDropMultiplier: 1.0,
        scaleDecay: 0.09,
        minScale: 0.82,
        maxTiltZDeg: 12,
        yawYDeg: 8,
        depthOffsetPx: 45,
      };
    }
    // Large & XLarge (Desktop)
    return {
      radius: 1200,
      angleStepDeg: 8.5,
      yDropMultiplier: 0.95,
      scaleDecay: 0.07,
      minScale: 0.84,
      maxTiltZDeg: 10,
      yawYDeg: 7,
      depthOffsetPx: 60,
    };
  });

  items = signal<ArcCarouselItem[]>([
    {
      id: 1,
      title: 'Work Experience',
      description:
        'Professional software engineering history building resilient, high-impact enterprise applications.',
      category: 'Career',
      badge: '5+ Years',
      icon: 'lucideBriefcase',
      sectionId: 'experience-section',
      gradientClass: 'from-purple-500/20 via-primary/10 to-transparent',
      glowColor: 'rgba(168, 85, 247, 0.4)',
    },
    {
      id: 2,
      title: 'Academic Education',
      description:
        'Foundational computer science degrees, algorithms, distributed computing, and system engineering.',
      category: 'Education',
      badge: 'B.Tech',
      icon: 'lucideGraduationCap',
      sectionId: 'education-section',
      gradientClass: 'from-blue-500/20 via-sky-500/10 to-transparent',
      glowColor: 'rgba(59, 130, 246, 0.4)',
    },
    {
      id: 3,
      title: 'Technical Skills',
      description:
        'Deep mastery across modern web frameworks, cloud infrastructure, TypeScript, and microfrontends.',
      category: 'Expertise',
      badge: '20+ Technologies',
      icon: 'lucideCode',
      sectionId: 'skills-section',
      gradientClass: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      glowColor: 'rgba(16, 185, 129, 0.4)',
    },
    {
      id: 4,
      title: 'Certifications',
      description:
        'Accredited certifications validating cloud architecture, web security, and agile methodologies.',
      category: 'Credentials',
      badge: 'Verified',
      icon: 'lucideAward',
      sectionId: 'certificates-section',
      gradientClass: 'from-amber-500/20 via-yellow-500/10 to-transparent',
      glowColor: 'rgba(245, 158, 11, 0.4)',
    },
    {
      id: 5,
      title: 'Honors & Awards',
      description:
        'Industry accolades, hackathon triumphs, and corporate recognition for architectural delivery.',
      category: 'Recognition',
      badge: 'Top Honors',
      icon: 'lucideTrophy',
      sectionId: 'awards-section',
      gradientClass: 'from-rose-500/20 via-pink-500/10 to-transparent',
      glowColor: 'rgba(244, 63, 94, 0.4)',
    },
  ]);

  private lastWheelTime = 0;
  private accumulatedWheelDelta = 0;
  private readonly wheelThreshold = 25;

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
            this.currentBreakpoint.set(query);
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

  /**
   * Calculates the shortest signed circular distance on the loop.
   */
  getCircularOffset(
    itemIndex: number,
    currentIndex: number,
    total: number
  ): number {
    if (total <= 0) return 0;
    let diff = itemIndex - currentIndex;
    const half = total / 2;
    while (diff > half) diff -= total;
    while (diff < -half) diff += total;
    return diff;
  }

  /**
   * Mathematical circular arc trajectory matrix:
   * Computes exact downward sagitta drop, 3D yaw, 3D roll, and scale.
   */
  getArcTransform(itemIndex: number, currentIndex: number): string {
    const total = this.items().length;
    const offset = this.getCircularOffset(itemIndex, currentIndex, total);
    const cfg = this.arcConfig();

    const angleDeg = offset * cfg.angleStepDeg;
    const angleRad = (angleDeg * Math.PI) / 180;

    const circularDrop =
      cfg.radius * (1 - Math.cos(angleRad)) * cfg.yDropMultiplier;
    const translateY = circularDrop + Math.abs(offset) * 10;

    const rotateZ = Math.max(
      -cfg.maxTiltZDeg,
      Math.min(cfg.maxTiltZDeg, angleDeg)
    );
    const rotateY = -offset * cfg.yawYDeg;

    const scale = Math.max(cfg.minScale, 1 - Math.abs(offset) * cfg.scaleDecay);
    const translateZ = -Math.abs(offset) * cfg.depthOffsetPx;

    return `translate3d(0, ${translateY.toFixed(1)}px, ${translateZ.toFixed(1)}px) rotateY(${rotateY.toFixed(1)}deg) rotateZ(${rotateZ.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
  }

  getArcOpacity(itemIndex: number, currentIndex: number): number {
    const total = this.items().length;
    const offset = Math.abs(
      this.getCircularOffset(itemIndex, currentIndex, total)
    );
    if (offset > 2.2) return 0.25;
    return Math.max(0.35, 1 - offset * 0.22);
  }

  getArcZIndex(itemIndex: number, currentIndex: number): number {
    const total = this.items().length;
    const offset = Math.abs(
      this.getCircularOffset(itemIndex, currentIndex, total)
    );
    return Math.max(1, 100 - Math.round(offset * 15));
  }

  /**
   * Handles smooth mouse wheel navigation over the carousel.
   */
  onCarouselWheel(event: WheelEvent): void {
    const delta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;
    if (Math.abs(delta) < 6) return;

    // Prevent full page vertical jumping while user explores carousel
    event.preventDefault();

    const now = Date.now();
    this.accumulatedWheelDelta += delta;

    if (
      now - this.lastWheelTime > 140 &&
      Math.abs(this.accumulatedWheelDelta) > this.wheelThreshold
    ) {
      const carousel = this.carouselComp();
      if (this.accumulatedWheelDelta > 0) {
        carousel?.scrollNext();
      } else {
        carousel?.scrollPrev();
      }
      this.lastWheelTime = now;
      this.accumulatedWheelDelta = 0;
    }
  }

  /**
   * Handles card click: clicking an inactive card brings it to center;
   * clicking an active card smoothly scrolls down to its section.
   */
  onCardClick(
    itemIndex: number,
    currentIndex: number,
    sectionId?: string
  ): void {
    const total = this.items().length;
    const offset = this.getCircularOffset(itemIndex, currentIndex, total);

    if (Math.abs(offset) < 0.5) {
      if (sectionId) {
        this.scrollToSection(sectionId);
      }
    } else {
      this.scrollToSlide(itemIndex);
    }
  }

  /**
   * Snaps the carousel to a specific slide index.
   */
  scrollToSlide(index: number): void {
    const carousel = this.carouselComp();
    if (!carousel) return;

    const embla = (carousel as any)._emblaCarousel?.()?.emblaApi;
    if (embla) {
      embla.scrollTo(index);
    } else {
      carousel.scrollNext();
    }
  }

  /**
   * Smooth scrolls to the target anchor section on the page.
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  ngOnDestroy(): void {
    this.seoService.removeJsonLd();
    this.destroyed.next();
    this.destroyed.complete();
  }
}



