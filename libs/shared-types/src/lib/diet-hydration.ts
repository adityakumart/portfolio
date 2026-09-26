export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

export type HydrationSource = 'water' | 'tea' | 'electrolyte' | 'other';

export type CravingTrigger =
  | 'stress'
  | 'social'
  | 'late_night'
  | 'boredom'
  | 'routine'
  | 'other';

export interface IMealItem {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  foodName: string;
  portionSize?: string;
  estimatedCalories?: number;
  mealTime?: string; // HH:mm
  imageUrl?: string;
  imageStorageKey?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateMealDto {
  date: string; // YYYY-MM-DD
  mealType: MealType;
  foodName: string;
  portionSize?: string;
  estimatedCalories?: number;
  mealTime?: string; // HH:mm
  imageUrl?: string;
  imageStorageKey?: string;
  notes?: string;
}

export interface IUpdateMealDto extends Partial<ICreateMealDto> {}

export interface IHydrationEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  amountMl: number;
  time: string; // HH:mm
  source: HydrationSource;
  createdAt?: string;
}

export interface ILogHydrationDto {
  date: string; // YYYY-MM-DD
  amountMl: number;
  time?: string; // HH:mm (defaults to now on server)
  source?: HydrationSource;
}

export interface IJunkFoodLog {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  recorded: boolean;
  consumed: boolean;
  itemsDescription?: string | null;
  cravingTrigger?: CravingTrigger | null;
  loggedAt?: string;
}

export interface ILogJunkFoodDto {
  date: string; // YYYY-MM-DD
  consumed: boolean;
  itemsDescription?: string;
  cravingTrigger?: CravingTrigger;
}

export interface IUserDietConfig {
  userId: string;
  hydration: {
    dailyTargetMl: number;
    unit: 'ml' | 'oz';
    cupPresetMl: number;
    remindersEnabled: boolean;
    reminderIntervalMinutes: number;
    reminderStartTime: string; // HH:mm
    reminderEndTime: string; // HH:mm
  };
  junkFoodPrompt: {
    enabled: boolean;
    promptTime: string; // HH:mm
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface IUpdateDietConfigDto {
  hydration?: Partial<IUserDietConfig['hydration']>;
  junkFoodPrompt?: Partial<IUserDietConfig['junkFoodPrompt']>;
}

export interface IDailyDashboard {
  date: string;
  meals: Record<MealType, IMealItem[]>;
  totalCalories: number;
  hydration: {
    totalMl: number;
    targetMl: number;
    progressPercentage: number;
    entries: IHydrationEntry[];
  };
  junkFood: {
    recorded: boolean;
    consumed: boolean;
    itemsDescription?: string | null;
    cravingTrigger?: CravingTrigger | null;
  };
}

export interface IS3PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  storageKey: string;
}

export interface IDailyHydrationStat {
  date: string;
  totalIntakeMl: number;
  targetMl: number;
  logCount: number;
}

export interface IDailyJunkFoodStat {
  date: string;
  consumed: boolean;
  itemsDescription?: string;
  cravingTrigger?: CravingTrigger;
}

export interface IDietStatsResponse {
  timeframe: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  hydrationStats: IDailyHydrationStat[];
  junkFoodStats: {
    breakdown: IDailyJunkFoodStat[];
    totalDaysLogged: number;
    cleanDaysCount: number;
    junkDaysCount: number;
    cleanStreakPercentage: number;
    cravingsCount: Record<string, number>;
  };
}
