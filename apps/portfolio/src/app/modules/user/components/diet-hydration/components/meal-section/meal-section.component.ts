import {
  Component,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucideEdit,
  lucideTrash2,
  lucideClock,
  lucideFlame,
  lucideImage,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { DietStateService } from '../../services/diet-state.service';
import { MealType, IMealItem } from '@portfolio/shared-types';

interface MealCategoryMeta {
  type: MealType;
  title: string;
  iconEmoji: string;
  description: string;
}

@Component({
  selector: 'app-meal-section',
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
      lucidePlus,
      lucideEdit,
      lucideTrash2,
      lucideClock,
      lucideFlame,
      lucideImage,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './meal-section.component.html',
  styleUrls: ['./meal-section.component.scss'],
})
export class MealSectionComponent {
  state = inject(DietStateService);

  readonly categories: MealCategoryMeta[] = [
    {
      type: 'breakfast',
      title: 'Breakfast',
      iconEmoji: '🍳',
      description: 'Morning fuel to break your fast',
    },
    {
      type: 'lunch',
      title: 'Lunch',
      iconEmoji: '🥗',
      description: 'Midday balanced nutrition',
    },
    {
      type: 'snacks',
      title: 'Snacks',
      iconEmoji: '🍎',
      description: 'Healthy bites and quick refreshments',
    },
    {
      type: 'dinner',
      title: 'Dinner',
      iconEmoji: '🍲',
      description: 'Evening meal for recovery & rest',
    },
  ];

  getMeals(type: MealType): IMealItem[] {
    return this.state.dashboardData()?.meals[type] || [];
  }

  getMealCalories(type: MealType): number {
    return this.getMeals(type).reduce(
      (sum, m) => sum + (m.estimatedCalories || 0),
      0,
    );
  }

  onAdd(type: MealType): void {
    this.state.openMealDialog(type);
  }

  onEdit(type: MealType, meal: IMealItem): void {
    this.state.openMealDialog(type, meal);
  }

  onDelete(mealId: string): void {
    if (confirm('Are you sure you want to delete this food item?')) {
      this.state.deleteMeal(mealId);
    }
  }
}
