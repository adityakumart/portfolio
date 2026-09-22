import { Collection, Db } from 'mongodb';
import { connectToRRDatabase } from '../../utils/DB/mongodb';
import * as bcrypt from 'bcrypt';
import {
  IEmployee,
  IVehicle,
  IBooking,
  ILog,
  ICustomerIntimation,
} from '@portfolio/shared-types';

export { IEmployee, IVehicle, IBooking, ILog, ICustomerIntimation };

export class RRService {
  private static async getDb(): Promise<Db> {
    return await connectToRRDatabase();
  }

  static async getEmployeesCol(): Promise<Collection<IEmployee>> {
    const db = await this.getDb();
    return db.collection<IEmployee>('employees');
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

  // --- SEEDING LOGIC ---
  static async seedInitialData() {
    try {
      const empCol = await this.getEmployeesCol();
      const vehCol = await this.getVehiclesCol();

      // 1. Seed Employees
      const empCount = await empCol.countDocuments();
      if (empCount === 0) {
        console.log('Seeding initial employees for RoadReady Rentals...');
        const saltRounds = 10;
        // Default Admin password is 'AdminPD'
        const adminHash = await bcrypt.hash('AdminPD', saltRounds);

        const defaultEmployees: IEmployee[] = [
          {
            id: 'RRA001',
            firstName: 'Ram',
            lastName: 'Kumar',
            dob: '1985-01-01',
            phone: '9494873336',
            altPhone: '',
            email: 'admin@rams-cars.com',
            aadhar: '123456789012',
            dl: 'AP39123456789012',
            address: 'Cinema road, Suryanarayana puram, Kakinada, AP 533001',
            allowLogin: true,
            role: 'admin',
            passwordHash: adminHash,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'RRA002',
            firstName: 'Kiran',
            lastName: 'Kumar',
            dob: '1990-05-15',
            phone: '9494893336',
            altPhone: '',
            email: 'kiran@rams-cars.com',
            aadhar: '987654321098',
            dl: 'AP39987654321098',
            address: 'Kakinada, AP 533001',
            allowLogin: true,
            role: 'employee',
            createdAt: new Date().toISOString(),
          },
        ];
        await empCol.insertMany(defaultEmployees);
        console.log('Seeded employees successfully.');
      }

      // 2. Seed Vehicles
      const vehCount = await vehCol.countDocuments();
      if (vehCount === 0) {
        console.log('Seeding initial vehicles for RoadReady Rentals...');
        const defaultVehicles: IVehicle[] = [
          {
            regNo: 'AP39TE1234',
            name: 'Baleno',
            manufacturer: 'Maruti Suzuki',
            model: '2022-05',
            seating: '5',
            odometer: '25000',
            type: 'Hatchback',
            color: 'Blue',
            fuelType: 'Petrol',
            engineNo: 'E123456',
            chassisNo: 'C123456',
            insuranceExpiry: '2027-05-15',
            pollutionExpiry: '2027-05-15',
            pricing: {
              h23: { price: '2000', km: '300' },
              h11: { price: '1200', km: '150' },
              h3: { price: '500', km: '50' },
              h1: { price: '200', km: '20' },
            },
            extraKmPrice: '12',
            extraHourPrice: '150',
            allowBooking: true,
            status: 'available',
            images: ['assets/rr/baleno.png'],
            createdAt: new Date().toISOString(),
          },
          {
            regNo: 'AP39TE5678',
            name: 'Innova',
            manufacturer: 'Toyota',
            model: '2021-08',
            seating: '7',
            odometer: '45000',
            type: 'SUV',
            color: 'White',
            fuelType: 'Diesel',
            engineNo: 'E567890',
            chassisNo: 'C567890',
            insuranceExpiry: '2027-08-20',
            pollutionExpiry: '2027-08-20',
            pricing: {
              h23: { price: '3500', km: '300' },
              h11: { price: '2200', km: '150' },
              h3: { price: '800', km: '50' },
              h1: { price: '300', km: '20' },
            },
            extraKmPrice: '18',
            extraHourPrice: '250',
            allowBooking: true,
            status: 'available',
            images: ['assets/rr/innova.png'],
            createdAt: new Date().toISOString(),
          },
          {
            regNo: 'AP39TE9012',
            name: 'Verna',
            manufacturer: 'Hyundai',
            model: '2023-01',
            seating: '5',
            odometer: '15000',
            type: 'Sedan',
            color: 'Black',
            fuelType: 'Petrol',
            engineNo: 'E901234',
            chassisNo: 'C901234',
            insuranceExpiry: '2027-01-10',
            pollutionExpiry: '2027-01-10',
            pricing: {
              h23: { price: '2500', km: '300' },
              h11: { price: '1500', km: '150' },
              h3: { price: '600', km: '50' },
              h1: { price: '250', km: '20' },
            },
            extraKmPrice: '15',
            extraHourPrice: '180',
            allowBooking: true,
            status: 'available',
            images: ['assets/rr/verna.png'],
            createdAt: new Date().toISOString(),
          },
        ];
        await vehCol.insertMany(defaultVehicles);
        console.log('Seeded vehicles successfully.');
      }

      // 3. Backfill legacy bookings with staff audit info
      const bookingCol = await this.getBookingsCol();
      const legacyBookings = await bookingCol
        .find({ bookedBy: { $exists: false } })
        .toArray();
      if (legacyBookings.length > 0) {
        console.log(
          `Backfilling staff audit info for ${legacyBookings.length} legacy bookings...`,
        );
        for (let i = 0; i < legacyBookings.length; i++) {
          const b = legacyBookings[i];
          const isKiran = i % 2 === 1;
          const staffId = isKiran ? 'RRA002' : 'RRA001';
          const staffName = isKiran ? 'Kiran Kumar' : 'Ram Kumar';
          const staffRole = isKiran ? 'employee' : 'admin';

          const updateFields: any = {
            bookedBy: staffId,
            bookedByName: staffName,
            bookedByRole: staffRole,
          };
          if (b.status === 'completed' || b.status === 'cancelled') {
            updateFields.endedBy = staffId;
            updateFields.endedByName = staffName;
            updateFields.endedByRole = staffRole;
          }
          await bookingCol.updateOne({ _id: b._id }, { $set: updateFields });
        }
        console.log('Legacy bookings backfill complete.');
      }
    } catch (e) {
      console.error('Error seeding initial RoadReady Rentals data:', e);
    }
  }

  // --- LOGGING ---
  static async logActivity(
    action: string,
    performedBy: string,
    role: string,
    details?: string,
  ): Promise<ILog> {
    try {
      const logsCol = await this.getLogsCol();
      const newLog: ILog = {
        action,
        performedBy,
        role,
        user: performedBy,
        time: new Date().toLocaleString(),
        timestamp: new Date(),
        details,
      };
      await logsCol.insertOne(newLog);
      return newLog;
    } catch (err) {
      console.error('Error writing activity log:', err);
      throw err;
    }
  }
}
