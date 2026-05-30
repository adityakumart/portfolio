// src/app/services/experience.service.ts
import { Injectable, inject } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable } from 'rxjs';

export interface DateRange {
  start: string;
  end: string;
}

export interface UserExperienceRecord {
  id?: number;
  name: string;
  email: string;
  experience: DateRange[];
  totalDays: number;      // Stored for database indexing/sorting
  displayYears: number;   // Stored for easy UI display
  displayMonths: number;  // Stored for easy UI display
  displayDays: number;    // Stored for easy UI display
}

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  private dbService = inject(NgxIndexedDBService);
  private storeName = 'experience_calculator';

  saveRecord(record: UserExperienceRecord): Observable<UserExperienceRecord> {
    return this.dbService.add<UserExperienceRecord>(this.storeName, record);
  }

  updateRecord(record: UserExperienceRecord): Observable<UserExperienceRecord> {
    return this.dbService.update<UserExperienceRecord>(this.storeName, record);
  }

  getAllRecords(): Observable<UserExperienceRecord[]> {
    return this.dbService.getAll<UserExperienceRecord>(this.storeName);
  }

  deleteRecord(id: number): Observable<boolean | unknown> {
    return this.dbService.delete(this.storeName, id);
  }

  
  calculateTotalExperience(intervals: DateRange[]): { years: number; months: number; days: number } {
    let totalYears = 0;
    let totalMonths = 0;
    let totalDays = 0;

    intervals.forEach(range => {
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
