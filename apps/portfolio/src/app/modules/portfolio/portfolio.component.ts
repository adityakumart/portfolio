import {
  Component,
  OnDestroy,
  signal,
  inject,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
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
export class PortfolioComponent implements OnDestroy {
  private destroyed = new Subject<void>();
  private globalData = inject(GlobalData);
  private themeService = inject(ThemeService);

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

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
