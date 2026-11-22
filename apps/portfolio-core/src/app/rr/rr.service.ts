import { Collection, Db } from 'mongodb';
import {
  IEmployee,
  IVehicle,
  IBooking,
  ILog,
  ICustomerIntimation,
  IRRAnnouncementItem,
  IRRScrollingTicker,
  IRRFeedback,
} from '@portfolio/shared-types';
import { RRDb, IRRSettingRecord } from '../../modules/rr/common/rr-db.util';
import { RRSeedService } from '../../modules/rr/common/rr-seed.service';
import { RRLogService } from '../../modules/rr/logs/rr-log.service';
import { RRBookingService } from '../../modules/rr/bookings/rr-booking.service';

export {
  IEmployee,
  IVehicle,
  IBooking,
  ILog,
  ICustomerIntimation,
  IRRAnnouncementItem,
  IRRScrollingTicker,
  IRRFeedback,
  IRRSettingRecord,
};

export class RRService {
  static async getDb(): Promise<Db> {
    return await RRDb.getDb();
  }

  static async getEmployeesCol(): Promise<Collection<IEmployee>> {
    return await RRDb.getEmployeesCol();
  }

  static async getVehiclesCol(): Promise<Collection<IVehicle>> {
    return await RRDb.getVehiclesCol();
  }

  static async getBookingsCol(): Promise<Collection<IBooking>> {
    return await RRDb.getBookingsCol();
  }

  static async getLogsCol(): Promise<Collection<ILog>> {
    return await RRDb.getLogsCol();
  }

  static async getAnnouncementsCol(): Promise<Collection<IRRAnnouncementItem>> {
    return await RRDb.getAnnouncementsCol();
  }

  static async getFeedbackCol(): Promise<Collection<IRRFeedback>> {
    return await RRDb.getFeedbackCol();
  }

  static async getSettingsCol(): Promise<Collection<IRRSettingRecord>> {
    return await RRDb.getSettingsCol();
  }

  static async seedInitialData(): Promise<void> {
    return await RRSeedService.seedInitialData();
  }

  static async logActivity(
    action: string,
    performedBy?: string,
    role?: string,
    details?: string,
  ): Promise<ILog | null> {
    return await RRLogService.logActivity(action, performedBy, role, details);
  }

  static async autoCloseIdleAdvanceBookings(): Promise<{
    closedCount: number;
    closedBookingIds: string[];
  }> {
    return await RRBookingService.autoCloseIdleAdvanceBookings();
  }
}
