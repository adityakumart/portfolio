import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideCalendar,
  lucideTrendingUp,
  lucideSettings,
  lucideCheck,
  lucideBell,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmLabelImports } from '@spartan-ng/hel/label';
import { DietStateService } from './services/diet-state.service';
import { HydrationReminderService } from './services/hydration-reminder.service';
import { DailyOverviewComponent } from './components/daily-overview/daily-overview.component';
import { MealSectionComponent } from './components/meal-section/meal-section.component';
import { HydrationTrackerComponent } from './components/hydration-tracker/hydration-tracker.component';
import { FoodLogDialogComponent } from './components/food-log-dialog/food-log-dialog.component';
import { JunkFoodPromptModalComponent } from './components/junk-food-prompt-modal/junk-food-prompt-modal.component';
import { StatsChartsComponent } from './components/stats-charts/stats-charts.component';
import { IUpdateDietConfigDto } from '@portfolio/shared-types';

@Component({
  selector: 'app-diet-hydration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    HlmButtonImports,
    HlmCardImports,
    HlmInputImports,
    HlmLabelImports,
    DailyOverviewComponent,
    MealSectionComponent,
    HydrationTrackerComponent,
    FoodLogDialogComponent,
    JunkFoodPromptModalComponent,
    StatsChartsComponent,
  ],
  providers: [
    provideIcons({
      lucideActivity,
      lucideCalendar,
      lucideTrendingUp,
      lucideSettings,
      lucideCheck,
      lucideBell,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './diet-hydration.component.html',
  styleUrls: ['./diet-hydration.component.scss'],
})
export class DietHydrationComponent implements OnInit, OnDestroy {
  state = inject(DietStateService);
  private reminderService = inject(HydrationReminderService);

  // Settings form binding values
  targetMl = 2500;
  cupPreset = 250;
  remindersEnabled = false;
  reminderInterval = 60;
  startTime = '08:00';
  endTime = '22:00';
  junkPromptEnabled = true;
  junkPromptTime = '21:00';

  settingsSavedNotice = false;

  async ngOnInit(): Promise<void> {
    await this.state.init();
    this.reminderService.init();

    const config = this.state.userConfig();
    if (config) {
      this.populateSettings(config);
    }
  }

  ngOnDestroy(): void {
    this.reminderService.destroy();
  }

  setActiveTab(tab: 'overview' | 'trends' | 'settings'): void {
    this.state.activeTab.set(tab);
    if (tab === 'settings') {
      const config = this.state.userConfig();
      if (config) this.populateSettings(config);
    }
  }

  private populateSettings(config: any): void {
    this.targetMl = config.hydration.dailyTargetMl || 2500;
    this.cupPreset = config.hydration.cupPresetMl || 250;
    this.remindersEnabled = config.hydration.remindersEnabled || false;
    this.reminderInterval = config.hydration.reminderIntervalMinutes || 60;
    this.startTime = config.hydration.reminderStartTime || '08:00';
    this.endTime = config.hydration.reminderEndTime || '22:00';
    this.junkPromptEnabled = config.junkFoodPrompt.enabled ?? true;
    this.junkPromptTime = config.junkFoodPrompt.promptTime || '21:00';
  }

  async onSaveSettings(): Promise<void> {
    const dto: IUpdateDietConfigDto = {
      hydration: {
        dailyTargetMl: this.targetMl,
        cupPresetMl: this.cupPreset,
        remindersEnabled: this.remindersEnabled,
        reminderIntervalMinutes: this.reminderInterval,
        reminderStartTime: this.startTime,
        reminderEndTime: this.endTime,
      },
      junkFoodPrompt: {
        enabled: this.junkPromptEnabled,
        promptTime: this.junkPromptTime,
      },
    };

    await this.state.updateConfig(dto);
    this.settingsSavedNotice = true;
    setTimeout(() => {
      this.settingsSavedNotice = false;
    }, 3000);
  }
}
