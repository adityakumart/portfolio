import {
  Component,
  inject,
  signal,
  effect,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideTrendingUp,
  lucideCalendar,
  lucideDroplet,
  lucideSparkles,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { DietStateService } from '../../services/diet-state.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

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
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stats-charts.component.html',
  styleUrls: ['./stats-charts.component.scss'],
})
export class StatsChartsComponent implements AfterViewInit, OnDestroy {
  state = inject(DietStateService);

  @ViewChild('hydrationCanvas') hydrationCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('habitsCanvas') habitsCanvas?: ElementRef<HTMLCanvasElement>;

  timeframe = signal<'weekly' | 'monthly'>('weekly');

  private hydrationChartInstance: Chart | null = null;
  private habitsChartInstance: Chart | null = null;

  constructor() {
    effect(() => {
      // Re-render charts when statsData updates
      const data = this.state.statsData();
      if (data && this.hydrationCanvas && this.habitsCanvas) {
        setTimeout(() => this.renderCharts(), 50);
      }
    });
  }

  ngAfterViewInit(): void {
    this.loadCurrentStats();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  setTimeframe(tf: 'weekly' | 'monthly'): void {
    this.timeframe.set(tf);
    this.loadCurrentStats();
  }

  loadCurrentStats(): void {
    this.state.loadStats(this.timeframe());
  }

  private destroyCharts(): void {
    if (this.hydrationChartInstance) {
      this.hydrationChartInstance.destroy();
      this.hydrationChartInstance = null;
    }
    if (this.habitsChartInstance) {
      this.habitsChartInstance.destroy();
      this.habitsChartInstance = null;
    }
  }

  private renderCharts(): void {
    const stats = this.state.statsData();
    if (!stats || !this.hydrationCanvas || !this.habitsCanvas) return;

    this.destroyCharts();

    // 1. Hydration Chart
    const hydrationLabels = stats.hydrationStats.map((h) => {
      const parts = h.date.split('-');
      return `${parts[1]}/${parts[2]}`;
    });
    const hydrationIntake = stats.hydrationStats.map((h) => h.totalIntakeMl);
    const hydrationTargets = stats.hydrationStats.map((h) => h.targetMl);

    const hydCtx = this.hydrationCanvas.nativeElement.getContext('2d');
    if (hydCtx) {
      this.hydrationChartInstance = new Chart(hydCtx, {
        type: 'bar',
        data: {
          labels: hydrationLabels,
          datasets: [
            {
              type: 'line',
              label: 'Daily Target',
              data: hydrationTargets,
              borderColor: '#f59e0b',
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false,
            },
            {
              type: 'bar',
              label: 'Actual Intake (ml)',
              data: hydrationIntake,
              backgroundColor: 'rgba(56, 189, 248, 0.75)',
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#94a3b8' },
            },
          },
          scales: {
            x: {
              ticks: { color: '#94a3b8' },
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            y: {
              ticks: { color: '#94a3b8' },
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
            },
          },
        },
      });
    }

    // 2. Habits & Cravings Chart
    const habitCtx = this.habitsCanvas.nativeElement.getContext('2d');
    const cravingsObj = stats.junkFoodStats.cravingsCount || {};
    const cravingLabels = Object.keys(cravingsObj);
    const cravingCounts = Object.values(cravingsObj);

    if (habitCtx) {
      this.habitsChartInstance = new Chart(habitCtx, {
        type: 'doughnut',
        data: {
          labels: ['Clean Days 🥦', 'Junk Food Days 🍟'],
          datasets: [
            {
              data: [
                stats.junkFoodStats.cleanDaysCount,
                stats.junkFoodStats.junkDaysCount,
              ],
              backgroundColor: ['#22c55e', '#ef4444'],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#94a3b8' },
            },
          },
        },
      });
    }
  }
}
