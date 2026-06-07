// src/app/services/experience.service.ts
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { ToastrService } from '../../../shared/services/toaster.service';
import { IndexedDbService } from '../../../../shared/services/indexed-db-base.service';

import { UserExperienceRecord, DateRange } from '@portfolio/shared-types';



@Injectable({
  providedIn: 'root',
})
export class ExperienceService {
  private storeName = 'experience_calculator';
  private snackBar = inject(ToastrService);

  // Dynamically declare DB configuration parameters here
  private experienceDbService = new IndexedDbService<UserExperienceRecord>(
    'PortfolioDatabase',
    this.storeName,
    1,
  );

  // State Signals exposed to the UI layer
  private experienceSignal: WritableSignal<UserExperienceRecord[]> = signal([]);
  readonly experiences = this.experienceSignal.asReadonly();

  constructor() {
    this.refreshExperiences();
  }

  // Pushes fresh DB snapshots to the UI signal layer
  async refreshExperiences(): Promise<void> {
    try {
      const list = await this.experienceDbService.getAll();
      this.experienceSignal.set(list);
    } catch (err) {
      this.snackBar.open('Failed to load experiences', 'error');
    }
  }

  async addExperience(
    experience: Omit<UserExperienceRecord, 'id'>,
  ): Promise<void> {
    await this.experienceDbService.add(experience);
    this.snackBar.open('Experience added successfully!', 'success');
    await this.refreshExperiences();
  }

  async updateExperience(experience: UserExperienceRecord): Promise<void> {
    await this.experienceDbService.update(experience);
    this.snackBar.open('Experience updated successfully!', 'success');
    await this.refreshExperiences();
  }

  async deleteExperience(id: number): Promise<void> {
    await this.experienceDbService.deleteById(id);
    this.snackBar.open('Experience deleted successfully!', 'warning');
    await this.refreshExperiences();
  }

  async clearUserTable(): Promise<void> {
    await this.experienceDbService.deleteTable();
    this.snackBar.open('All experience records cleared!', 'error');
    await this.refreshExperiences();
  }

  async getUserById(id: number): Promise<UserExperienceRecord | undefined> {
    return await this.experienceDbService.getById(id);
  }

  calculateTotalExperience(intervals: DateRange[]): {
    years: number;
    months: number;
    days: number;
  } {
    let totalYears = 0;
    let totalMonths = 0;
    let totalDays = 0;

    intervals.forEach((range) => {
      const start = new Date(range.start);
      const end = new Date(range.end);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

      let diffYears = end.getFullYear() - start.getFullYear();
      let diffMonths = end.getMonth() - start.getMonth();
      let diffDays = end.getDate() - start.getDate();

      if (diffDays < 0) {
        diffMonths -= 1;
        const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
        diffDays += prevMonth.getDate();
      }

      if (diffMonths < 0) {
        diffYears -= 1;
        diffMonths += 12;
      }

      if (diffYears >= 0) {
        totalYears += diffYears;
        totalMonths += diffMonths;
        totalDays += diffDays;
      }
    });

    totalMonths += Math.floor(totalDays / 30);
    totalDays = totalDays % 30;

    totalYears += Math.floor(totalMonths / 12);
    totalMonths = totalMonths % 12;

    return { years: totalYears, months: totalMonths, days: totalDays };
  }
}
