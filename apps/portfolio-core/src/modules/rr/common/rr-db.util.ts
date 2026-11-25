import { Collection, Db, Document } from 'mongodb';
import { connectToRRDatabase } from '../../../common/utils/db/mongodb';
import {
  IEmployee,
  IVehicle,
  IBooking,
  ILog,
  IRRAnnouncementItem,
  IRRFeedback,
} from '@portfolio/shared-types';

export interface IRRSettingRecord extends Document {
  key?: string;
  [key: string]: unknown;
}

export class RRDb {
  static async getDb(): Promise<Db> {
    return await connectToRRDatabase();
  }

  static async getEmployeesCol(): Promise<Collection<IEmployee>> {
    const db = await this.getDb();
    return db.collection<IEmployee>('employee');
  }

  static async getVehiclesCol(): Promise<Collection<IVehicle>> {
    const db = await this.getDb();
    return db.collection<IVehicle>('vehicles');
  }

  static async getBookingsCol(): Promise<Collection<IBooking>> {
    const db = await this.getDb();
    return db.collection<IBooking>('bookings');
  }

  static async getLogsCol(): Promise<Collection<ILog>> {
    const db = await this.getDb();
    return db.collection<ILog>('logs');
  }

  static async getAnnouncementsCol(): Promise<Collection<IRRAnnouncementItem>> {
    const db = await this.getDb();
    return db.collection<IRRAnnouncementItem>('announcements');
  }

  static async getFeedbackCol(): Promise<Collection<IRRFeedback>> {
    const db = await this.getDb();
    return db.collection<IRRFeedback>('feedback');
  }

  static async getSettingsCol(): Promise<Collection<IRRSettingRecord>> {
    const db = await this.getDb();
    return db.collection<IRRSettingRecord>('settings');
  }
}
