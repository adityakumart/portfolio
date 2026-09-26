import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DietHydrationApiService } from './diet-hydration-api.service';
import {
  IDailyDashboard,
  IUserDietConfig,
  IDietStatsResponse,
  IMealItem,
  ICreateMealDto,
  IUpdateMealDto,
  ILogJunkFoodDto,
  IUpdateDietConfigDto,
  MealType,
} from '@portfolio/shared-types';

@Injectable({
  providedIn: 'root',
})
export class DietStateService {
  private api = inject(DietHydrationApiService);

  private get todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  // Reactive State Signals
  readonly selectedDate = signal<string>(this.todayIso);
  readonly dashboardData = signal<IDailyDashboard | null>(null);
  readonly userConfig = signal<IUserDietConfig | null>(null);
  readonly statsData = signal<IDietStatsResponse | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly activeTab = signal<'overview' | 'trends' | 'settings'>('overview');

  // Modal / Dialog States
  readonly isMealDialogOpen = signal<boolean>(false);
  readonly selectedMealType = signal<MealType>('breakfast');
  readonly editingMeal = signal<IMealItem | null>(null);
  readonly isJunkPromptOpen = signal<boolean>(false);

  // Computed signals
  readonly totalCalories = computed(
    () => this.dashboardData()?.totalCalories ?? 0,
  );
  readonly hydrationTotal = computed(
    () => this.dashboardData()?.hydration.totalMl ?? 0,
  );
  readonly hydrationTarget = computed(
    () => this.dashboardData()?.hydration.targetMl ?? 2500,
  );
  readonly hydrationPercentage = computed(
    () => this.dashboardData()?.hydration.progressPercentage ?? 0,
  );
  readonly isJunkFoodRecorded = computed(
    () => this.dashboardData()?.junkFood.recorded ?? false,
  );
  readonly isCleanDay = computed(
    () =>
      this.dashboardData()?.junkFood.recorded &&
      !this.dashboardData()?.junkFood.consumed,
  );

  async init(): Promise<void> {
    await Promise.all([this.loadConfig(), this.loadDashboard(this.selectedDate())]);
  }

  async setDate(date: string): Promise<void> {
    this.selectedDate.set(date);
    await this.loadDashboard(date);
  }

  async loadConfig(): Promise<void> {
    try {
      const config = await firstValueFrom(this.api.getConfig());
      this.userConfig.set(config);
    } catch (err) {
      console.error('[DietState] Failed to load config:', err);
    }
  }

  async loadDashboard(date?: string): Promise<void> {
    const targetDate = date || this.selectedDate();
    this.isLoading.set(true);
    try {
      const data = await firstValueFrom(this.api.getDayDashboard(targetDate));
      this.dashboardData.set(data);
    } catch (err) {
      console.error('[DietState] Failed to load dashboard:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async quickAddWater(amount?: number): Promise<void> {
    const current = this.dashboardData();
    const config = this.userConfig();
    const addAmount =
      amount ?? (config?.hydration.cupPresetMl || 250);
    const date = this.selectedDate();

    // Optimistic Update
    if (current) {
      const newTotal = current.hydration.totalMl + addAmount;
      const target = current.hydration.targetMl || 2500;
      this.dashboardData.set({
        ...current,
        hydration: {
          ...current.hydration,
          totalMl: newTotal,
          progressPercentage: Math.min(100, Math.round((newTotal / target) * 100)),
          entries: [
            ...current.hydration.entries,
            {
              id: 'temp-' + Date.now(),
              userId: '',
              date,
              amountMl: addAmount,
              time: new Date().toTimeString().slice(0, 5),
              source: 'water',
            },
          ],
        },
      });
    }

    try {
      await firstValueFrom(
        this.api.logHydration({
          date,
          amountMl: addAmount,
          source: 'water',
        }),
      );
      // Background re-sync to get official Mongo ID
      await this.loadDashboard(date);
    } catch (err) {
      console.error('[DietState] Failed to log water:', err);
      // Rollback
      await this.loadDashboard(date);
    }
  }

  async deleteWaterEntry(entryId: string): Promise<void> {
    const date = this.selectedDate();
    try {
      await firstValueFrom(this.api.deleteHydration(entryId));
      await this.loadDashboard(date);
    } catch (err) {
      console.error('[DietState] Failed to delete water entry:', err);
    }
  }

  openMealDialog(mealType: MealType, meal?: IMealItem): void {
    this.selectedMealType.set(mealType);
    this.editingMeal.set(meal || null);
    this.isMealDialogOpen.set(true);
  }

  closeMealDialog(): void {
    this.isMealDialogOpen.set(false);
    this.editingMeal.set(null);
  }

  async saveMeal(dto: ICreateMealDto): Promise<void> {
    this.isSaving.set(true);
    try {
      const editing = this.editingMeal();
      if (editing) {
        await firstValueFrom(this.api.updateMeal(editing.id, dto));
      } else {
        await firstValueFrom(this.api.createMeal(dto));
      }
      this.closeMealDialog();
      await this.loadDashboard(this.selectedDate());
    } catch (err) {
      console.error('[DietState] Failed to save meal:', err);
      throw err;
    } finally {
      this.isSaving.set(false);
    }
  }

  async deleteMeal(mealId: string): Promise<void> {
    try {
      await firstValueFrom(this.api.deleteMeal(mealId));
      await this.loadDashboard(this.selectedDate());
    } catch (err) {
      console.error('[DietState] Failed to delete meal:', err);
    }
  }

  async saveJunkFoodReflection(dto: ILogJunkFoodDto): Promise<void> {
    this.isSaving.set(true);
    try {
      await firstValueFrom(this.api.logJunkFood(dto));
      this.isJunkPromptOpen.set(false);
      await this.loadDashboard(this.selectedDate());
    } catch (err) {
      console.error('[DietState] Failed to save junk food reflection:', err);
      throw err;
    } finally {
      this.isSaving.set(false);
    }
  }

  async updateConfig(dto: IUpdateDietConfigDto): Promise<void> {
    this.isSaving.set(true);
    try {
      const updated = await firstValueFrom(this.api.updateConfig(dto));
      this.userConfig.set(updated);
      await this.loadDashboard(this.selectedDate());
    } catch (err) {
      console.error('[DietState] Failed to update config:', err);
      throw err;
    } finally {
      this.isSaving.set(false);
    }
  }

  async loadStats(timeframe: 'weekly' | 'monthly'): Promise<void> {
    this.isLoading.set(true);
    try {
      const stats = await firstValueFrom(this.api.getStats(timeframe));
      this.statsData.set(stats);
    } catch (err) {
      console.error('[DietState] Failed to load stats:', err);
    } finally {
      this.isLoading.set(false);
    }
  }
}
