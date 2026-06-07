export interface DateRange {
  start: string;
  end: string;
}

export interface UserExperienceRecord {
  id?: number;
  name: string;
  email: string;
  experience: DateRange[];
  totalDays: number; // Stored for database indexing/sorting
  displayYears: number; // Stored for easy UI display
  displayMonths: number; // Stored for easy UI display
  displayDays: number; // Stored for easy UI display
}