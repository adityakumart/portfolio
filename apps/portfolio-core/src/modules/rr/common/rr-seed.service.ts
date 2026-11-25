import * as bcrypt from 'bcrypt';
import { RRDb } from './rr-db.util';
import { IEmployee, IVehicle, IRRAnnouncementItem } from '@portfolio/shared-types';

export class RRSeedService {
  static async seedInitialData(): Promise<void> {
    try {
      const empCol = await RRDb.getEmployeesCol();
      const vehCol = await RRDb.getVehiclesCol();
      const announcementsCol = await RRDb.getAnnouncementsCol();
      const settingsCol = await RRDb.getSettingsCol();

      // 1. Seed Employees
      const empCount = await empCol.countDocuments();
      if (empCount === 0) {
        console.log('Seeding initial employees for RoadReady Rentals...');
        const saltRounds = 10;
        const adminHash = await bcrypt.hash('AdminPD', saltRounds);

        const defaultEmployees: IEmployee[] = [
          {
            id: 'RRA001',
            firstName: 'Ram',
            lastName: 'Kumar',
            dob: '1985-01-01',
            phone: '9800000001',
            altPhone: '',
            email: 'admin@fleetops.local',
            aadhar: '123456789012',
            dl: 'DL0120200001234',
            address: '100 Central Boulevard, Terminal Hub, City Center, 500001',
            allowLogin: true,
            role: 'admin',
            status: 'active',
            isFirstLogin: false,
            mustChangePassword: false,
            passwordLastChangedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            passwordHash: adminHash,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'RRA002',
            firstName: 'Kiran',
            lastName: 'Kumar',
            dob: '1990-05-15',
            phone: '9800000002',
            altPhone: '',
            email: 'staff@fleetops.local',
            aadhar: '987654321098',
            dl: 'DL0120200005678',
            address: 'Downtown Hub, City Center, 500001',
            allowLogin: true,
            role: 'employee',
            status: 'active',
            isFirstLogin: false,
            mustChangePassword: false,
            passwordLastChangedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ];
        await empCol.insertMany(defaultEmployees);
        console.log('Seeded employees successfully.');
      } else {
        const unmigrated = await empCol.find({ status: { $exists: false } }).toArray();
        for (const emp of unmigrated) {
          await empCol.updateOne(
            { _id: emp._id },
            {
              $set: {
                status: emp.allowLogin !== false ? 'active' : 'deactivated',
                isFirstLogin: emp.isFirstLogin ?? false,
                mustChangePassword: emp.mustChangePassword ?? false,
                passwordLastChangedAt: emp.passwordLastChangedAt || emp.createdAt || new Date().toISOString(),
                lastLoginAt: emp.lastLoginAt || new Date().toISOString(),
              },
            },
          );
        }
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
      const bookingCol = await RRDb.getBookingsCol();
      const legacyBookings = await bookingCol
        .find({ bookedBy: { $exists: false } })
        .toArray();
      if (legacyBookings.length > 0) {
        console.log(`Backfilling staff audit info for ${legacyBookings.length} legacy bookings...`);
        for (let i = 0; i < legacyBookings.length; i++) {
          const b = legacyBookings[i];
          const isKiran = i % 2 === 1;
          const staffId = isKiran ? 'RRA002' : 'RRA001';
          const staffName = isKiran ? 'Kiran Kumar' : 'Ram Kumar';
          const staffRole = isKiran ? 'employee' : 'admin';

          const updateFields: Record<string, unknown> = {
            bookedBy: staffId,
            bookedByName: staffName,
            bookedByRole: staffRole,
          };
          if (b.status === 'completed' || b.status === 'cancelled') {
            updateFields['endedBy'] = staffId;
            updateFields['endedByName'] = staffName;
            updateFields['endedByRole'] = staffRole;
          }
          await bookingCol.updateOne({ _id: b._id }, { $set: updateFields });
        }
        console.log('Legacy bookings backfill complete.');
      }

      // 4. Seed Homepage Scrolling Ticker
      const existingTicker = await settingsCol.findOne({ key: 'rr_ticker' });
      if (!existingTicker) {
        console.log('Seeding initial scrolling marquee ticker for RoadReady Rentals...');
        await settingsCol.insertOne({
          key: 'rr_ticker',
          message:
            '🎉 Festive Season Special: Enjoy flat 15% discount on all 7-seater SUV rentals for weekend getaways! Call our 24/7 desk at +91 9800000001 to reserve.',
          badgeText: 'FESTIVAL SPECIAL',
          isActive: true,
          speed: 'normal',
          linkText: 'Explore Offers',
          linkUrl: '#announcements',
          updatedAt: new Date().toISOString(),
          updatedBy: 'RRA001',
        });
        console.log('Seeded homepage scrolling ticker.');
      }

      // 5. Seed Homepage Announcements
      const announcementsCount = await announcementsCol.countDocuments({
        isDeleted: { $ne: true },
      });
      if (announcementsCount === 0) {
        console.log('Seeding initial homepage announcements for RoadReady Rentals...');
        const defaultAnnouncements: IRRAnnouncementItem[] = [
          {
            title: 'Happy Diwali & Joyous Festive Celebrations',
            description:
              'RoadReady Rentals wishes you and your loved ones a blessed, safe, and joyous festive season! Celebrate the festival of lights with seamless, worry-free journeys in our luxury fleet.',
            category: 'festival',
            tag: 'Festive Greeting',
            icon: 'sparkles',
            ctaText: 'Reserve Festival Fleet',
            ctaAction: 'whatsapp',
            ctaLink: '',
            priority: 3,
            isActive: true,
            createdAt: new Date().toISOString(),
            createdBy: 'RRA001',
          },
          {
            title: 'Weekend SUV Getaway Bonanza',
            description:
              'Plan your long coastal drive in ultimate comfort. Get flat 15% discount on Innova and Baleno rentals for 24+ hour bookings this month. Zero security deposit hassles with express checkout.',
            category: 'offer',
            tag: 'Limited Time Deal',
            promoCode: 'ROYALWEEKEND',
            discountText: '15% OFF',
            validUntil: '2026-11-30',
            ctaText: 'Claim 15% Discount',
            ctaAction: 'call',
            ctaLink: '+91 9800000001',
            icon: 'gift',
            priority: 2,
            isActive: true,
            createdAt: new Date().toISOString(),
            createdBy: 'RRA001',
          },
          {
            title: 'Monsoon & Highway Fleet Advisory',
            description:
              'Dear travelers, all fleet vehicles are freshly serviced and equipped with certified rain-wiper blades, high-grip all-weather tyres, and 24/7 roadside mechanical assistance across all operational highways.',
            category: 'intimation',
            tag: 'Fleet Advisory',
            icon: 'shield',
            ctaText: '24/7 Helpline',
            ctaAction: 'call',
            ctaLink: '+91 9800000001',
            priority: 1,
            isActive: true,
            createdAt: new Date().toISOString(),
            createdBy: 'RRA001',
          },
        ];
        await announcementsCol.insertMany(defaultAnnouncements);
        console.log('Seeded homepage announcements successfully.');
      }
    } catch (e) {
      console.error('Error seeding initial RoadReady Rentals data:', e);
    }
  }
}
