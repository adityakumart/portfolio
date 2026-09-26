import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideTrendingUp,
  lucideCalendar,
  lucideDroplet,
  lucideSparkles,
  lucideCheckCircle2,
  lucideAlertCircle,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { DietStateService } from '../../services/diet-state.service';
import { IDailyHydrationStat } from '@portfolio/shared-types';

export interface HydrationBarVM {
  date: string;
  dayLabel: string;
  totalIntakeMl: number;
  targetMl: number;
  heightPercent: number;
  isGoalMet: boolean;
}

export interface CravingBarVM {
  label: string;
  count: number;
  percent: number;
}

@Component({
  selector: 'app-stats-charts',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    HlmCardImports,
    HlmButtonImports,
    HlmBadgeImports,
  ],
  providers: [
    provideIcons({
      lucideTrendingUp,
      lucideCalendar,
      lucideDroplet,
      lucideSparkles,
      lucideCheckCircle2,
      lucideAlertCircle,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stats-charts.component.html',
  styleUrls: ['./stats-charts.component.scss'],
})
export class StatsChartsComponent implements OnInit {
  state = inject(DietStateService);

  timeframe = signal<'weekly' | 'monthly'>('weekly');
  hoveredBar = signal<HydrationBarVM | null>(null);

  // Computed max scale for dynamic height calculations
  readonly maxScaleMl = computed(() => {
    const stats = this.state.statsData()?.hydrationStats || [];
    const maxIntake = Math.max(0, ...stats.map((s) => s.totalIntakeMl));
    const target = stats.length > 0 ? stats[0].targetMl : 2500;
    const peak = Math.max(maxIntake, target);
    return Math.ceil((peak * 1.15) / 500) * 500; // Round up with 15% headroom
  });

  // Target threshold line percentage from bottom
  readonly targetThresholdPercent = computed(() => {
    const stats = this.state.statsData()?.hydrationStats || [];
    const target = stats.length > 0 ? stats[0].targetMl : 2500;
    const max = this.maxScaleMl();
    return max > 0 ? Math.min(100, (target / max) * 100) : 70;
  });

  // Hydration bars view models
  readonly hydrationBars = computed<HydrationBarVM[]>(() => {
    const stats = this.state.statsData()?.hydrationStats || [];
    const max = this.maxScaleMl();

    return stats.map((s) => {
      const parts = s.date.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const dayLabel =
        this.timeframe() === 'weekly'
          ? d.toLocaleDateString(undefined, { weekday: 'short' })
          : `${parts[1]}/${parts[2]}`;

      const heightPercent =
        max > 0 ? Math.min(100, Math.round((s.totalIntakeMl / max) * 100)) : 0;

      return {
        date: s.date,
        dayLabel,
        totalIntakeMl: s.totalIntakeMl,
        targetMl: s.targetMl,
        heightPercent,
        isGoalMet: s.totalIntakeMl >= s.targetMl && s.targetMl > 0,
      };
    });
  });

  // Cravings breakdown view models
  readonly cravingBars = computed<CravingBarVM[]>(() => {
    const junkStats = this.state.statsData()?.junkFoodStats;
    if (!junkStats || !junkStats.cravingsCount) return [];

    const map = junkStats.cravingsCount;
    const totalCravings = Object.values(map).reduce((a, b) => a + b, 0) || 1;

    const friendlyNames: Record<string, string> = {
      stress: 'Stress / Emotional',
      social: 'Social Gatherings',
      late_night: 'Late Night Craving',
      boredom: 'Boredom',
      routine: 'Habit / Routine',
      other: 'Other',
    };

    return Object.entries(map).map(([key, count]) => ({
      label: friendlyNames[key] || key,
      count,
      percent: Math.round((count / totalCravings) * 100),
    }));
  });

  // Clean days circular gauge calculation
  readonly habitGauge = computed(() => {
    const junkStats = this.state.statsData()?.junkFoodStats;
    const total = junkStats?.totalDaysLogged || 0;
    const clean = junkStats?.cleanDaysCount || 0;
    const streak = junkStats?.cleanStreakPercentage ?? 100;

    // SVG circle circumference for r = 40 is 2 * PI * 40 = 251.32
    const circumference = 251.32;
    const offset = circumference - (circumference * (streak / 100));

    return {
      total,
      clean,
      streak,
      circumference,
      offset,
    };
  });

  ngOnInit(): void {
    this.loadCurrentStats();
  }

  setTimeframe(tf: 'weekly' | 'monthly'): void {
    this.timeframe.set(tf);
    this.loadCurrentStats();
  }

  loadCurrentStats(): void {
    this.state.loadStats(this.timeframe());
  }

  onHoverBar(bar: HydrationBarVM | null): void {
    this.hoveredBar.set(bar);
  }
}
