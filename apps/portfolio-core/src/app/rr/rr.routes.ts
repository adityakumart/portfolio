import { Router, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import multer from 'multer';
import { authenticateRRToken, requireAdmin } from './rr.middleware';
import { RRService, IEmployee, IVehicle, IBooking, ICustomerIntimation } from './rr.service';
import { handleVehicleImageUpload } from './r2-storage.controller';
import { rrPublicRouter } from './rr-public.routes';
import { authRateLimiter } from '../../middlewares/rate-limit.middleware';
import { customerRouter } from '../../routes/customer.routes';
import { BillingService } from '../../services/billing.service';

import { getJwtSecret } from '../../config/security';
import { safeRegex, escapeRegex } from '../../utils/security/regex.util';

const rrRouter = Router();
const JWT_SECRET = getJwtSecret();

// Mount public routes for unauthenticated customer portal / homepage
rrRouter.use('/public', rrPublicRouter);

// Mount customer membership module
rrRouter.use('/customers', customerRouter);

// Seed database on router initialization
RRService.seedInitialData();
BillingService.seedInitialRegularCustomers();

/* ============================================================
   AUTHENTICATION
============================================================ */
rrRouter.post('/auth/login', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { username, password, empId, dob } = req.body;

    const empCol = await RRService.getEmployeesCol();

    const handleFailedLogin = async (employee: any, failureReason: string) => {
      const attempts = (employee.failedLoginAttempts || 0) + 1;
      const updates: any = { failedLoginAttempts: attempts };
      if (attempts >= 5) {
        updates.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lock
      }
      await empCol.updateOne({ id: employee.id }, { $set: updates });
      res.status(401).json({ error: 'Unauthorized', message: failureReason });
    };

    const resetFailedAttempts = async (employee: any) => {
      if (employee.failedLoginAttempts || employee.lockoutUntil) {
        await empCol.updateOne({ id: employee.id }, { $set: { failedLoginAttempts: 0, lockoutUntil: null } });
      }
    };

    // 1. Admin Login (Username & Password)
    if (username && password) {
      // Find employee by email, id, or check if it matches AdminUN/AdminPD directly if DB is empty
      const emp = await empCol.findOne({
        $or: [{ id: username }, { email: username.toLowerCase() }],
        isDeleted: { $ne: true }
      });

      if (!emp) {
        res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
        return;
      }

      if (emp.lockoutUntil && new Date(emp.lockoutUntil) > new Date()) {
        const remaining = Math.ceil((new Date(emp.lockoutUntil).getTime() - Date.now()) / (60 * 1000));
        res.status(423).json({
          error: 'Locked',
          message: `Account is temporarily locked due to consecutive failed attempts. Please try again after ${remaining} minute(s).`
        });
        return;
      }

      if (!emp.allowLogin) {
        res.status(403).json({ error: 'Forbidden', message: 'Your account is disabled' });
        return;
      }

      if (emp.passwordHash) {
        const isMatch = await bcrypt.compare(password, emp.passwordHash);
        if (!isMatch) {
          if (emp.role !== 'admin' && emp.dob === password) {
            // Permitted fallback for employee DOB match
          } else {
            await handleFailedLogin(emp, 'Invalid password');
            return;
          }
        }
      } else {
        // If they are an employee without passwordHash, verify against DOB
        if (emp.dob !== password) {
          await handleFailedLogin(emp, 'Invalid password');
          return;
        }
      }

      await resetFailedAttempts(emp);

      const token = jwt.sign({ id: emp.id, role: emp.role }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        access_token: token,
        user: {
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          role: emp.role
        }
      });

      RRService.logActivity(
        'Logged in',
        emp.id,
        emp.role,
        `User session authenticated (${emp.firstName} ${emp.lastName}, Role: ${emp.role.toUpperCase()})`
      ).catch((logErr) => console.error('[AuditLog] Failed to log admin login:', logErr));

      return;
    }

    // 2. Employee Login (empId & dob)
    if (empId && dob) {
      const emp = await empCol.findOne({ id: empId, isDeleted: { $ne: true } });
      if (!emp) {
        res.status(401).json({ error: 'Unauthorized', message: 'No employee found with this ID.' });
        return;
      }

      if (emp.lockoutUntil && new Date(emp.lockoutUntil) > new Date()) {
        const remaining = Math.ceil((new Date(emp.lockoutUntil).getTime() - Date.now()) / (60 * 1000));
        res.status(423).json({
          error: 'Locked',
          message: `Account is temporarily locked due to consecutive failed attempts. Please try again after ${remaining} minute(s).`
        });
        return;
      }

      if (!emp.allowLogin) {
        res.status(403).json({ error: 'Forbidden', message: 'Your account is disabled' });
        return;
      }

      if (emp.dob !== dob) {
        await handleFailedLogin(emp, 'Incorrect date of birth.');
        return;
      }

      await resetFailedAttempts(emp);

      const token = jwt.sign({ id: emp.id, role: emp.role }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        access_token: token,
        user: {
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          role: emp.role
        }
      });

      RRService.logActivity(
        'Logged in',
        emp.id,
        emp.role,
        `Employee badge authenticated (${emp.firstName} ${emp.lastName}, ID: ${emp.id})`
      ).catch((logErr) => console.error('[AuditLog] Failed to log employee login:', logErr));

      return;
    }

    res.status(400).json({ error: 'Bad Request', message: 'Please provide credentials' });
  } catch (err: any) {
    console.error('Login router error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// POST logout (Authenticated)
rrRouter.post('/auth/logout', authenticateRRToken, async (req: any, res: Response) => {
  try {
    const empCol = await RRService.getEmployeesCol();
    const emp = await empCol.findOne({ id: req.userId });
    const empName = emp ? `${emp.firstName} ${emp.lastName}` : (req.userId || 'Staff');

    res.json({ success: true, message: 'Logged out successfully' });

    RRService.logActivity(
      'Logged out',
      req.userId || 'Unknown',
      req.userRole || 'employee',
      `User session ended (${empName}, Role: ${(req.userRole || 'employee').toUpperCase()})`
    ).catch((logErr) => console.error('[AuditLog] Failed to log logout:', logErr));
  } catch (err: any) {
    console.error('Logout router error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// GET /auth/permissions (Authenticated)
rrRouter.get('/auth/permissions', authenticateRRToken, async (req: any, res: Response) => {
  try {
    const empCol = await RRService.getEmployeesCol();
    const emp = await empCol.findOne({ id: req.userId, isDeleted: { $ne: true } });
    if (!emp) {
      res.status(401).json({ error: 'Unauthorized', message: 'Employee account does not exist or has been removed.' });
      return;
    }

    if (!emp.allowLogin) {
      res.status(403).json({ error: 'Forbidden', message: 'Account access has been revoked by an administrator.' });
      return;
    }

    res.json({
      user: {
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        role: emp.role,
      },
      role: emp.role,
    });
  } catch (err: any) {
    console.error('RR permissions router error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});


/* ============================================================
   VEHICLES
============================================================ */

// Multer storage and filter configuration for image files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed.'));
    }
  }
});

// POST upload vehicle image(s) (Authenticated)
rrRouter.post(
  '/vehicles/upload',
  authenticateRRToken,
  (req, res, next) => {
    upload.fields([
      { name: 'images', maxCount: 15 },
      { name: 'image', maxCount: 1 },
    ])(req, res, (err: any) => {
      if (err) {
        res.status(400).json({ error: 'Bad Request', message: err.message });
      } else {
        next();
      }
    });
  },
  handleVehicleImageUpload
);

// GET all vehicles (Command Desk / Staff - Authenticated)
rrRouter.get('/vehicles', authenticateRRToken, async (req: Request, res: Response) => {
  try {
    const col = await RRService.getVehiclesCol();
    const { search, limit, autocomplete, fields, includeDeleted } = req.query;
    const filter: any = {};
    if (includeDeleted !== 'true') {
      filter.isDeleted = { $ne: true };
    }
    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = safeRegex(search.trim(), 'i');
      filter.$or = [
        { name: { $regex: searchRegex } },
        { manufacturer: { $regex: searchRegex } },
        { regNo: { $regex: searchRegex } }
      ];
    }

    const isAutocomplete = autocomplete === 'true' || fields === 'autocomplete';
    const projection = isAutocomplete
      ? { regNo: 1, name: 1, manufacturer: 1, _id: 0 }
      : undefined;

    let cursor = col.find(filter, projection ? { projection } : {}).sort({ manufacturer: 1, name: 1 });
    if (limit) {
      const limitNum = parseInt(limit as string, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        cursor = cursor.limit(limitNum);
      }
    }
    const list = await cursor.toArray();

    if (isAutocomplete) {
      const mapped = list.map((v: any) => ({
        regNo: v.regNo,
        name: v.name,
        manufacturer: v.manufacturer,
        vehicleRegNo: v.regNo,
        vehicleName: v.name,
        vehicleManufacturer: v.manufacturer,
      }));
      res.json(mapped);
      return;
    }

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// GET distinct booked vehicles list for autocomplete (retrieves strictly from Bookings collection)
const handleBookingVehiclesAutocomplete = async (req: Request, res: Response) => {
  try {
    const col = await RRService.getBookingsCol();
    const { search, limit, status } = req.query;

    const match: any = {
      vehicleRegNo: { $exists: true, $nin: [null, ''] },
      isDeleted: { $ne: true }
    };

    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = safeRegex(search.trim(), 'i');
      match.$or = [
        { vehicleRegNo: { $regex: searchRegex } },
        { vehicleName: { $regex: searchRegex } },
        { vehicleManufacturer: { $regex: searchRegex } }
      ];
    }

    if (status && typeof status === 'string' && status.trim()) {
      const statuses = status.split(',').map((s: string) => s.trim()).filter(Boolean);
      if (statuses.length === 1) {
        match.status = statuses[0];
      } else if (statuses.length > 1) {
        match.status = { $in: statuses };
      }
    }

    const pipeline: any[] = [
      { $match: match },
      {
        $group: {
          _id: { $toUpper: '$vehicleRegNo' },
          regNo: { $first: '$vehicleRegNo' },
          name: { $first: '$vehicleName' },
          manufacturer: { $first: '$vehicleManufacturer' }
        }
      },
      {
        $sort: { manufacturer: 1, name: 1, regNo: 1 }
      },
      {
        $project: {
          _id: 0,
          regNo: 1,
          name: { $ifNull: ['$name', ''] },
          manufacturer: { $ifNull: ['$manufacturer', ''] },
          vehicleRegNo: '$regNo',
          vehicleName: { $ifNull: ['$name', ''] },
          vehicleManufacturer: { $ifNull: ['$manufacturer', ''] }
        }
      }
    ];

    if (limit) {
      const limitNum = parseInt(limit as string, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        pipeline.push({ $limit: limitNum });
      }
    }

    const list = await col.aggregate(pipeline).toArray();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};

rrRouter.get('/bookings/vehicles/autocomplete', authenticateRRToken, handleBookingVehiclesAutocomplete);
rrRouter.get('/bookings/vehicles', authenticateRRToken, handleBookingVehiclesAutocomplete);
rrRouter.get('/vehicles/autocomplete', authenticateRRToken, handleBookingVehiclesAutocomplete);


// POST new vehicle (Admin only)
rrRouter.post('/vehicles', authenticateRRToken, requireAdmin, async (req: any, res: Response) => {
  try {
    const data: Omit<IVehicle, 'createdAt'> = req.body;
    const col = await RRService.getVehiclesCol();

    const existing = await col.findOne({ regNo: { $regex: new RegExp(`^${escapeRegex(data.regNo)}$`, 'i') } });
    if (existing) {
      if (existing.isDeleted) {
        // Vehicle was previously soft-deleted; restore and update with new details
        await col.updateOne(
          { _id: existing._id },
          {
            $set: {
              ...data,
              regNo: data.regNo.toUpperCase().trim(),
              isDeleted: false,
              deletedAt: null,
              deletedBy: null,
              updatedAt: new Date().toISOString()
            }
          }
        );
        const restored = await col.findOne({ _id: existing._id });
        res.status(201).json(restored);

        RRService.logActivity(
          `Restored vehicle ${data.regNo}`,
          req.userId,
          req.userRole,
          `Previously soft-deleted vehicle ${data.regNo} restored and updated.`
        ).catch((logErr) => console.error('[AuditLog] Failed to log vehicle restore:', logErr));

        return;
      }
      res.status(409).json({ error: 'Conflict', message: `Vehicle with plate ${data.regNo} already exists.` });
      return;
    }

    const newVehicle: IVehicle = {
      ...data,
      createdAt: new Date().toISOString()
    };

    await col.insertOne(newVehicle);
    res.status(201).json(newVehicle);

    RRService.logActivity(
      `Added vehicle ${newVehicle.regNo}`,
      req.userId,
      req.userRole,
      `Vehicle added: ${newVehicle.manufacturer} ${newVehicle.name} (${newVehicle.model}, ${newVehicle.fuelType}, Odometer: ${newVehicle.odometer} km)`
    ).catch((logErr) => console.error('[AuditLog] Failed to log added vehicle:', logErr));
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// PUT update vehicle (Authenticated)
rrRouter.put('/vehicles/:id', authenticateRRToken, async (req: any, res: Response) => {
  try {
    const regNo = req.params.id;
    const updateData = req.body;
    const col = await RRService.getVehiclesCol();

    const vehicle = await col.findOne({ regNo });
    if (!vehicle || vehicle.isDeleted) {
      res.status(404).json({ error: 'Not Found', message: 'Vehicle not found or has been deleted' });
      return;
    }

    // Remove immutable fields
    delete updateData._id;
    delete updateData.regNo;
    delete updateData.createdAt;

    const modifiedFields = Object.keys(updateData).filter(k => k !== 'updatedAt');

    await col.updateOne(
      { regNo },
      {
        $set: {
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      }
    );

    const updated = await col.findOne({ regNo });
    res.json(updated);

    RRService.logActivity(
      `Modified vehicle ${regNo}`,
      req.userId,
      req.userRole,
      `Vehicle ${vehicle.manufacturer} ${vehicle.name} updated: [${modifiedFields.join(', ') || 'details modified'}]`
    ).catch((logErr) => console.error('[AuditLog] Failed to log modified vehicle:', logErr));
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// DELETE vehicle (Admin only - Soft delete)
rrRouter.delete('/vehicles/:id', authenticateRRToken, requireAdmin, async (req: any, res: Response) => {
  try {
    const regNo = req.params.id;
    const col = await RRService.getVehiclesCol();

    const vehicle = await col.findOne({ regNo });
    if (!vehicle || vehicle.isDeleted) {
      res.status(404).json({ error: 'Not Found', message: 'Vehicle not found' });
      return;
    }

    // Safety guard: Cannot delete a vehicle that is currently in an active booking
    if (['in_booking', 'rented'].includes(vehicle.status) || vehicle.bookingId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot delete vehicle while it is currently in an active booking or rented.'
      });
      return;
    }

    await col.updateOne(
      { regNo },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy: req.userId || 'admin',
          allowBooking: false,
          updatedAt: new Date().toISOString()
        }
      }
    );

    res.json({ message: `Vehicle ${regNo} deleted successfully.` });

    RRService.logActivity(
      `Soft-deleted vehicle ${regNo}`,
      req.userId,
      req.userRole,
      `Vehicle soft-deleted from fleet: ${vehicle.manufacturer} ${vehicle.name} (${vehicle.model})`
    ).catch((logErr) => console.error('[AuditLog] Failed to log soft-deleted vehicle:', logErr));
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

/* ============================================================
   BOOKINGS
============================================================ */

// GET bookings (Authenticated; supports filtering & pagination from API side)
rrRouter.get('/bookings', authenticateRRToken, async (req: any, res: Response) => {
  try {
    const col = await RRService.getBookingsCol();
    const {
      status,
      vehicle,
      customer,
      from,
      to,
      search,
      page,
      limit,
      paginate,
      all
    } = req.query;

    const andConditions: any[] = [];

    // Filter out soft-deleted bookings by default, unless explicitly requested or querying cancelled records (e.g. Historical Logs)
    const hasCancelledStatus = typeof status === 'string' && status.includes('cancelled');
    if (req.query.includeDeleted !== 'true' && !hasCancelledStatus) {
      andConditions.push({ isDeleted: { $ne: true } });
    }

    // Status filter (single or comma-separated, e.g. "completed,cancelled")
    if (status && typeof status === 'string' && status.trim()) {
      const statuses = status.split(',').map((s: string) => s.trim()).filter(Boolean);
      if (statuses.length === 1) {
        andConditions.push({ status: statuses[0] });
      } else if (statuses.length > 1) {
        andConditions.push({ status: { $in: statuses } });
      }
    }

    // Vehicle filter (regNo, name, manufacturer)
    if (vehicle && typeof vehicle === 'string' && vehicle.trim()) {
      const vRegex = safeRegex(vehicle.trim(), 'i');
      andConditions.push({
        $or: [
          { vehicleRegNo: { $regex: vRegex } },
          { vehicleName: { $regex: vRegex } },
          { vehicleManufacturer: { $regex: vRegex } }
        ]
      });
    }

    // Customer filter (first name, second name, phone)
    if (customer && typeof customer === 'string' && customer.trim()) {
      const cRegex = safeRegex(customer.trim(), 'i');
      andConditions.push({
        $or: [
          { renterFirstName: { $regex: cRegex } },
          { renterSecondName: { $regex: cRegex } },
          { renterPhone: { $regex: cRegex } }
        ]
      });
    }

    // Date range filter (from and/or to) on createdAt or pickupDateTime
    if (from || to) {
      const dateOrClauses: any[] = [];
      const fromStr = typeof from === 'string' && from.trim() ? from.trim() : null;
      const toStr = typeof to === 'string' && to.trim() ? to.trim() : null;

      // Filter for createdAt
      const createdCond: any = {};
      if (fromStr) createdCond.$gte = `${fromStr}T00:00:00.000Z`;
      if (toStr) createdCond.$lte = `${toStr}T23:59:59.999Z`;
      dateOrClauses.push({ createdAt: createdCond });

      // Filter for pickupDateTime
      const pickupCond: any = {};
      if (fromStr) pickupCond.$gte = fromStr;
      if (toStr) pickupCond.$lte = `${toStr}T23:59:59.999Z`;
      dateOrClauses.push({ pickupDateTime: pickupCond });

      andConditions.push({ $or: dateOrClauses });
    }

    // General search filter if provided
    if (search && typeof search === 'string' && search.trim()) {
      const sRegex = safeRegex(search.trim(), 'i');
      andConditions.push({
        $or: [
          { id: { $regex: sRegex } },
          { vehicleRegNo: { $regex: sRegex } },
          { vehicleName: { $regex: sRegex } },
          { renterFirstName: { $regex: sRegex } },
          { renterSecondName: { $regex: sRegex } },
          { renterPhone: { $regex: sRegex } }
        ]
      });
    }

    // Role-based access control for rental history:
    // Admin has full view of all rental history records.
    // Employees can only see history of bookings they personally booked or ended.
    if (req.userRole !== 'admin') {
      const isHistoryFilter = (status && (status.includes('completed') || status.includes('cancelled'))) || req.query.history === 'true';
      if (isHistoryFilter) {
        andConditions.push({
          $or: [
            { bookedBy: req.userId },
            { endedBy: req.userId }
          ]
        });
      } else {
        // If not strictly filtering history, restrict completed/cancelled to user's own
        andConditions.push({
          $or: [
            { status: { $nin: ['completed', 'cancelled'] } },
            { bookedBy: req.userId },
            { endedBy: req.userId }
          ]
        });
      }
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};

    const isPaginated = paginate === 'true' || page !== undefined || limit !== undefined;

    if (!isPaginated || all === 'true') {
      // Hard ceiling of 1000 items to prevent server out-of-memory crashes on large datasets
      const list = await col.find(query).sort({ createdAt: -1, _id: -1 }).limit(1000).toArray();
      res.json(list);
      return;
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      col.find(query).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limitNum).toArray(),
      col.countDocuments(query)
    ]);

    res.json({
      bookings,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// POST create booking or advance reservation (Authenticated - records who booked)
rrRouter.post('/bookings', authenticateRRToken, async (req: any, res: Response) => {
  try {
    const bookingData: Omit<IBooking, 'id' | 'createdAt'> = req.body;
    const bookingCol = await RRService.getBookingsCol();
    const vehCol = await RRService.getVehiclesCol();
    const empCol = await RRService.getEmployeesCol();

    const selectedVehicle = await vehCol.findOne({ regNo: bookingData.vehicleRegNo, isDeleted: { $ne: true } });
    if (!selectedVehicle) {
      res.status(404).json({ error: 'Not Found', message: 'Vehicle not found or no longer active' });
      return;
    }

    const isAdvanceReservation = bookingData.status === 'reserved';

    if (isAdvanceReservation) {
      if (!bookingData.pickupDateTime || !bookingData.returnDateTime) {
        res.status(400).json({ error: 'Bad Request', message: 'Pickup and return schedule are required for reservations.' });
        return;
      }
      const reqStart = new Date(bookingData.pickupDateTime).getTime();
      const reqEnd = new Date(bookingData.returnDateTime).getTime();

      if (isNaN(reqStart) || isNaN(reqEnd) || reqEnd <= reqStart) {
        res.status(400).json({ error: 'Bad Request', message: 'Return date & time must be after pickup date & time.' });
        return;
      }

      // Check overlap with current active booking
      const activeBooking = await bookingCol.findOne({
        vehicleRegNo: bookingData.vehicleRegNo,
        status: 'active',
        isDeleted: { $ne: true }
      });
      if (activeBooking && activeBooking.returnDateTime) {
        const activeEnd = new Date(activeBooking.returnDateTime).getTime();
        if (reqStart < activeEnd) {
          res.status(409).json({
            error: 'Conflict',
            message: `Vehicle currently has an active rental until ${activeBooking.returnDateTime}. Reservation pickup must be after current active rental return.`
          });
          return;
        }
      }

      // Check overlap with other advance bookings for this vehicle
      const existingReservations = await bookingCol.find({
        vehicleRegNo: bookingData.vehicleRegNo,
        status: 'reserved',
        isDeleted: { $ne: true }
      }).toArray();

      for (const resv of existingReservations) {
        const rStart = new Date(resv.pickupDateTime).getTime();
        const rEnd = new Date(resv.returnDateTime).getTime();
        if (Math.max(reqStart, rStart) < Math.min(reqEnd, rEnd)) {
          res.status(409).json({
            error: 'Conflict',
            message: `Reservation dates overlap with an existing advance booking (${resv.pickupDateTime} to ${resv.returnDateTime}).`
          });
          return;
        }
      }

      // Check contract / maintenance availability date
      if (['maintenance', 'contract', 'in_contract'].includes(selectedVehicle.status) && selectedVehicle.nextAvailableDate) {
        const nextAvail = new Date(selectedVehicle.nextAvailableDate).getTime();
        if (!isNaN(nextAvail) && reqStart < nextAvail) {
          res.status(409).json({
            error: 'Conflict',
            message: `Vehicle is currently in ${selectedVehicle.status} and next available on ${selectedVehicle.nextAvailableDate}. Reservation pickup must be on or after next available date.`
          });
          return;
        }
      }
    } else {
      if (['in_booking', 'rented', 'contract'].includes(selectedVehicle.status)) {
        res.status(409).json({ error: 'Conflict', message: 'Vehicle is already booked/rented.' });
        return;
      }
    }

    // Generate Booking ID
    const count = await bookingCol.countDocuments();
    const bookingId = 'RRB' + String(count + 1).padStart(3, '0');

    // Look up staff details for audit trail
    const staff = await empCol.findOne({ id: req.userId });
    const staffName = staff ? `${staff.firstName} ${staff.lastName}`.trim() : (req.userId || 'Staff');
    const staffRole = req.userRole || staff?.role || 'employee';

    const newBooking: IBooking = {
      ...bookingData,
      id: bookingId,
      status: isAdvanceReservation ? 'reserved' : (bookingData.status || 'active'),
      bookedBy: req.userId || 'RRA001',
      bookedByName: staffName,
      bookedByRole: staffRole,
      createdAt: new Date().toISOString()
    };

    await bookingCol.insertOne(newBooking);

    // Record booking in regular customer profile if recognized member
    if (newBooking.renterPhone) {
      BillingService.recordCustomerBooking(newBooking.renterPhone).catch((err: unknown) => {
        console.warn('Could not update customer booking count:', (err as Error).message);
      });
    }

    // Update vehicle status to in_booking ONLY for immediate active bookings, not advance reservations
    if (!isAdvanceReservation) {
      await vehCol.updateOne(
        { regNo: bookingData.vehicleRegNo },
        {
          $set: {
            status: 'in_booking',
            bookingId: bookingId,
            updatedAt: new Date().toISOString()
          }
        }
      );
    }

    res.status(201).json(newBooking);

    RRService.logActivity(
      isAdvanceReservation ? `Reserved vehicle ${newBooking.vehicleRegNo}` : `Started booking ${bookingId}`,
      req.userId,
      req.userRole,
      isAdvanceReservation
        ? `Advance reservation created (${bookingId}) for ${newBooking.renterFirstName} ${newBooking.renterSecondName} (${newBooking.renterPhone}) | Vehicle: ${newBooking.vehicleRegNo} | Schedule: ${newBooking.pickupDateTime} to ${newBooking.returnDateTime} | Advance Paid: ₹${newBooking.amountPaid || '0'}`
        : `Booking started for customer ${newBooking.renterFirstName} ${newBooking.renterSecondName} (${newBooking.renterPhone}) | Vehicle: ${newBooking.vehicleRegNo} (${selectedVehicle.manufacturer} ${selectedVehicle.name}) | Pickup: ${newBooking.pickupDateTime} | Return: ${newBooking.returnDateTime} | Total: ₹${newBooking.finalRentalAmount}`
    ).catch((logErr) => console.error('[AuditLog] Failed to log booking start:', logErr));
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// DELETE booking (Admin only for active/completed, or any staff for reserved bookings - Soft delete)
rrRouter.delete('/bookings/:id', authenticateRRToken, async (req: any, res: Response) => {
  try {
    const bookingId = req.params.id;
    const bookingCol = await RRService.getBookingsCol();
    const vehCol = await RRService.getVehiclesCol();

    const booking = await bookingCol.findOne({ id: bookingId });
    if (!booking || booking.isDeleted) {
      res.status(404).json({ error: 'Not Found', message: 'Booking not found' });
      return;
    }

    const body = req.body || {};
    const deletionReason = body.deletionReason || body.reasonForDeletion || req.query.deletionReason || req.query.reasonForDeletion || null;
    const returnAmount = body.returnAmount !== undefined ? String(body.returnAmount) : (req.query.returnAmount !== undefined ? String(req.query.returnAmount) : null);
    const returnAmountMode = body.returnAmountMode || req.query.returnAmountMode || null;

    // Allow admin, or any staff when reason for deletion and refund details are provided, or any staff for reserved bookings
    const hasDeletionDetails = Boolean(deletionReason && returnAmountMode);
    if (booking.status !== 'reserved' && req.userRole !== 'admin' && !hasDeletionDetails) {
      res.status(403).json({ error: 'Forbidden', message: 'Only administrators can delete active or completed rental agreements without deletion details.' });
      return;
    }

    // Resolve staff name for audit
    const empCol = await RRService.getEmployeesCol();
    let deleterName = 'Administrator';
    let deleterRole = req.userRole || 'admin';
    if (req.userId && req.userId !== 'admin') {
      const emp = await empCol.findOne({ id: req.userId });
      if (emp) {
        deleterName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || deleterName;
        deleterRole = emp.role || deleterRole;
      }
    }

    // Soft delete booking and transition to cancelled with refund metadata
    await bookingCol.updateOne(
      { id: bookingId },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy: req.userId || 'admin',
          deletedByName: deleterName,
          deletedByRole: deleterRole,
          status: 'cancelled',
          deletionReason: deletionReason,
          returnAmount: returnAmount,
          returnAmountMode: returnAmountMode,
          updatedAt: new Date().toISOString()
        }
      }
    );

    // If the vehicle was in_booking or reserved for this booking, release it to available
    if (booking.vehicleRegNo) {
      const veh = await vehCol.findOne({ regNo: booking.vehicleRegNo });
      if (veh && (veh.bookingId === bookingId || veh.status === 'in_booking' || veh.status === 'reserved')) {
        await vehCol.updateOne(
          { regNo: booking.vehicleRegNo },
          {
            $set: {
              status: 'available',
              bookingId: null,
              updatedAt: new Date().toISOString()
            }
          }
        );
      }
    }

    res.json({ message: `Booking ${bookingId} deleted successfully.` });

    const auditDetail = [
      `Booking ${bookingId} deleted.`,
      deletionReason ? `Reason: "${deletionReason}".` : '',
      returnAmount !== null ? `Refund: ₹${returnAmount} via ${returnAmountMode || 'N/A'}.` : '',
      `Customer: ${booking.renterFirstName} ${booking.renterSecondName} | Vehicle: ${booking.vehicleRegNo}`
    ].filter(Boolean).join(' ');

    RRService.logActivity(
      `Deleted active booking ${bookingId}`,
      req.userId,
      deleterRole,
      auditDetail
    ).catch((logErr) => console.error('[AuditLog] Failed to log booking delete:', logErr));
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// PUT update booking / end booking (Authenticated - records who ended)
rrRouter.put('/bookings/:id', authenticateRRToken, async (req: any, res: Response) => {
  try {
    const bookingId = req.params.id;
    const updateData = req.body;
    const bookingCol = await RRService.getBookingsCol();
    const vehCol = await RRService.getVehiclesCol();
    const empCol = await RRService.getEmployeesCol();

    const booking = await bookingCol.findOne({ id: bookingId });
    if (!booking || booking.isDeleted) {
      res.status(404).json({ error: 'Not Found', message: 'Booking not found or has been deleted' });
      return;
    }

    delete updateData._id;
    delete updateData.id;
    delete updateData.createdAt;

    const isClosing = updateData.status === 'completed' || updateData.status === 'cancelled';
    let enderName: string | undefined = undefined;
    let enderRole: string | undefined = undefined;
    if (isClosing) {
      const staff = await empCol.findOne({ id: req.userId });
      enderName = staff ? `${staff.firstName} ${staff.lastName}`.trim() : (req.userId || 'Staff');
      enderRole = req.userRole || staff?.role || 'employee';
    }

    const setDoc: any = {
      ...updateData,
    };
    if (isClosing) {
      setDoc.endedAt = updateData.endedAt || new Date().toISOString();
      setDoc.endedBy = req.userId || 'RRA001';
      setDoc.endedByName = enderName;
      setDoc.endedByRole = enderRole;
    }

    await bookingCol.updateOne(
      { id: bookingId },
      {
        $set: setDoc
      }
    );

    // Synchronize vehicle table ONLY when booking is closed / completed
    if (updateData.status === 'completed') {
      const vehicleUpdateDoc: any = {
        status: 'available',
        bookingId: null,
        updatedAt: new Date().toISOString()
      };

      // Set the final odometer reading from the closed booking
      const finalOdo = updateData.vehicleOdometerEnd || booking.vehicleOdometerEnd;
      if (finalOdo !== undefined && finalOdo !== null && String(finalOdo).trim() !== '') {
        vehicleUpdateDoc.odometer = String(finalOdo);
      }

      await vehCol.updateOne(
        { regNo: booking.vehicleRegNo },
        { $set: vehicleUpdateDoc }
      );
    } else if (updateData.status === 'cancelled') {
      // If cancelled, release vehicle back to available without modifying odometer (only if it was in_booking for this booking)
      const curVeh = await vehCol.findOne({ regNo: booking.vehicleRegNo });
      if (curVeh && curVeh.bookingId === bookingId) {
        await vehCol.updateOne(
          { regNo: booking.vehicleRegNo },
          {
            $set: {
              status: 'available',
              bookingId: null,
              updatedAt: new Date().toISOString()
            }
          }
        );
      }
    } else if (booking.status === 'reserved' && updateData.status === 'active') {
      // Transitioning advance reservation to active rental ("Book Now")
      await vehCol.updateOne(
        { regNo: booking.vehicleRegNo },
        {
          $set: {
            status: 'in_booking',
            bookingId: bookingId,
            updatedAt: new Date().toISOString()
          }
        }
      );
    }

    const updated = await bookingCol.findOne({ id: bookingId });

    res.json(updated);

    if (updateData.status === 'completed') {
      const damagesNote = Number(updateData.damagesTotal || 0) > 0 ? ` | Damages: ₹${updateData.damagesTotal}` : '';
      const fineNote = Number(updateData.nonIntimationFine || 0) > 0 ? ` | Late/Non-intimation Fine: ₹${updateData.nonIntimationFine}` : '';
      const odoNote = updateData.vehicleOdometerEnd ? ` | Final Odo: ${updateData.vehicleOdometerEnd} km` : '';
      RRService.logActivity(
        `Ended booking ${bookingId}`,
        req.userId,
        req.userRole,
        `Booking completed for vehicle ${booking.vehicleRegNo}${odoNote} | Final Settlement: ₹${updateData.finalRentalAmount || booking.finalRentalAmount} | Paid: ₹${updateData.amountPaid || booking.amountPaid}${damagesNote}${fineNote}`
      ).catch((logErr) => console.error('[AuditLog] Failed to log booking completion:', logErr));
    } else if (updateData.status === 'cancelled') {
      RRService.logActivity(
        `Cancelled booking ${bookingId}`,
        req.userId,
        req.userRole,
        `Booking cancelled for vehicle ${booking.vehicleRegNo}. Customer: ${booking.renterFirstName} ${booking.renterSecondName}`
      ).catch((logErr) => console.error('[AuditLog] Failed to log booking cancellation:', logErr));
    } else {
      const modifiedFields = [
        updateData.returnDateTime && updateData.returnDateTime !== booking.returnDateTime ? `Return: ${updateData.returnDateTime}` : null,
        updateData.durationDays !== undefined ? `Days: ${updateData.durationDays}` : null,
        updateData.durationHours !== undefined ? `Hours: ${updateData.durationHours}` : null,
        updateData.finalRentalAmount !== undefined ? `Final: ₹${updateData.finalRentalAmount}` : null,
        updateData.amountPaid !== undefined ? `Paid: ₹${updateData.amountPaid}` : null,
        updateData.pendingAmount !== undefined ? `Pending: ₹${updateData.pendingAmount}` : null,
        updateData.totalKmLimit !== undefined ? `Limit: ${updateData.totalKmLimit} km` : null
      ].filter(Boolean).join(', ');

      RRService.logActivity(
        `Modified booking ${bookingId}`,
        req.userId,
        req.userRole,
        `Booking modified for vehicle ${booking.vehicleRegNo}: [${modifiedFields || 'Details updated'}]`
      ).catch((logErr) => console.error('[AuditLog] Failed to log booking modification:', logErr));
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// POST record customer intimation for a booking (Authenticated)
rrRouter.post('/bookings/:id/customer-intimation', authenticateRRToken, async (req: any, res: Response) => {
  try {
    const bookingId = req.params.id;
    const { intimationType, notes, expectedReturnDateTime } = req.body;

    if (!intimationType || !notes) {
      res.status(400).json({ error: 'Bad Request', message: 'intimationType and notes are required.' });
      return;
    }

    const bookingCol = await RRService.getBookingsCol();
    const empCol = await RRService.getEmployeesCol();

    const booking = await bookingCol.findOne({ id: bookingId });
    if (!booking || booking.isDeleted) {
      res.status(404).json({ error: 'Not Found', message: 'Booking not found or has been deleted' });
      return;
    }

    const staff = await empCol.findOne({ id: req.userId });
    const staffName = staff ? `${staff.firstName} ${staff.lastName}`.trim() : (req.userId || 'Staff');

    const intimationRecord: ICustomerIntimation = {
      id: 'INT-' + Date.now(),
      intimationType,
      notes,
      expectedReturnDateTime: expectedReturnDateTime || undefined,
      recordedBy: req.userId,
      recordedByName: staffName,
      recordedByRole: req.userRole || 'employee',
      recordedAt: new Date().toISOString()
    };

    const updateDoc: any = {
      $push: { intimations: intimationRecord },
      $set: {
        lastIntimation: intimationRecord,
        updatedAt: new Date().toISOString()
      }
    };

    if (expectedReturnDateTime) {
      updateDoc.$set.returnDateTime = expectedReturnDateTime;
    }

    await bookingCol.updateOne({ id: bookingId }, updateDoc);

    const updated = await bookingCol.findOne({ id: bookingId });
    res.json({
      success: true,
      message: 'Customer intimation recorded successfully',
      intimation: intimationRecord,
      booking: updated
    });

    // Audit Log for Customer Intimation (sent after response)
    const logDetails = `Booking ${bookingId} (${booking.vehicleRegNo}) | Customer: ${booking.renterFirstName} ${booking.renterSecondName} (${booking.renterPhone}) | Reason: ${intimationType.toUpperCase()} | Note: "${notes}"${expectedReturnDateTime ? ` | New Expected Return: ${expectedReturnDateTime}` : ''}`;
    RRService.logActivity(
      `Customer Intimation: ${bookingId}`,
      req.userId,
      req.userRole,
      logDetails
    ).catch((logErr) => console.error('[AuditLog] Failed to log customer intimation:', logErr));
  } catch (err: any) {
    console.error('Error recording customer intimation:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

/* ============================================================
   EMPLOYEES
============================================================ */

// GET all employees (Admin only)
rrRouter.get('/employees', authenticateRRToken, requireAdmin, async (req: any, res: Response) => {
  try {
    const col = await RRService.getEmployeesCol();
    const filter: any = {};
    if (req.query.includeDeleted !== 'true') {
      filter.isDeleted = { $ne: true };
    }
    const list = await col.find(filter).toArray();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// POST create employee (Admin only)
rrRouter.post('/employees', authenticateRRToken, requireAdmin, async (req: any, res: Response) => {
  try {
    const data: Omit<IEmployee, 'id' | 'createdAt'> = req.body;
    const col = await RRService.getEmployeesCol();

    // Check duplicate
    const duplicate = await col.findOne({
      firstName: { $regex: new RegExp(`^${escapeRegex(data.firstName)}$`, 'i') },
      lastName: { $regex: new RegExp(`^${escapeRegex(data.lastName)}$`, 'i') },
      dob: data.dob,
      isDeleted: { $ne: true }
    });

    if (duplicate) {
      res.status(409).json({ error: 'Conflict', message: `Employee ${data.firstName} ${data.lastName} already exists.` });
      return;
    }

    // Generate Employee ID
    const employeesList = await col.find().toArray();
    let maxNumber = 0;
    employeesList.forEach(emp => {
      const num = parseInt(emp.id.replace(/\D/g, ''));
      if (num > maxNumber) maxNumber = num;
    });
    const newId = 'RRA' + String(maxNumber + 1).padStart(3, '0');

    let passwordHash = undefined;
    const rawPassword = data.password && typeof data.password === 'string' && data.password.trim()
      ? data.password.trim()
      : (data.role === 'admin' ? 'AdminPD' : undefined);

    if (rawPassword) {
      const saltRounds = 10;
      passwordHash = await bcrypt.hash(rawPassword, saltRounds);
    }

    // Remove raw password so it is never stored in DB
    delete data.password;

    const newEmp: IEmployee = {
      ...data,
      id: newId,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    await col.insertOne(newEmp);
    res.status(201).json(newEmp);

    RRService.logActivity(
      `Added employee ${newEmp.id}`,
      req.userId,
      req.userRole,
      `Employee registered: ${newEmp.firstName} ${newEmp.lastName} (Role: ${newEmp.role.toUpperCase()}, Phone: ${newEmp.phone})`
    ).catch((logErr) => console.error('[AuditLog] Failed to log added employee:', logErr));
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// PUT update employee (Admin only)
rrRouter.put('/employees/:id', authenticateRRToken, requireAdmin, async (req: any, res: Response) => {
  try {
    const empId = req.params.id;
    const updateData = req.body;
    const col = await RRService.getEmployeesCol();

    const emp = await col.findOne({ id: empId });
    if (!emp || emp.isDeleted) {
      res.status(404).json({ error: 'Not Found', message: 'Employee not found or has been deleted' });
      return;
    }

    delete updateData._id;
    delete updateData.id;
    delete updateData.createdAt;

    if (updateData.password && typeof updateData.password === 'string' && updateData.password.trim()) {
      const saltRounds = 10;
      updateData.passwordHash = await bcrypt.hash(updateData.password.trim(), saltRounds);
    }
    delete updateData.password;

    await col.updateOne({ id: empId }, { $set: updateData });

    const updated = await col.findOne({ id: empId });
    const modDetails = [
      updateData.role ? `Role: ${updateData.role}` : null,
      updateData.allowLogin !== undefined ? `Login: ${updateData.allowLogin ? 'Allowed' : 'Disabled'}` : null,
      updateData.phone ? `Phone: ${updateData.phone}` : null,
      updateData.email ? `Email: ${updateData.email}` : null
    ].filter(Boolean).join(', ');

    res.json(updated);

    RRService.logActivity(
      `Modified employee ${empId}`,
      req.userId,
      req.userRole,
      `Updated staff ${emp.firstName} ${emp.lastName}: [${modDetails || 'profile modified'}]`
    ).catch((logErr) => console.error('[AuditLog] Failed to log modified employee:', logErr));
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// DELETE employee (Admin only - Soft delete)
rrRouter.delete('/employees/:id', authenticateRRToken, requireAdmin, async (req: any, res: Response) => {
  try {
    const empId = req.params.id;
    const col = await RRService.getEmployeesCol();

    if (req.userId === empId) {
      res.status(400).json({ error: 'Bad Request', message: 'You cannot delete your own administrative account.' });
      return;
    }

    const emp = await col.findOne({ id: empId });
    if (!emp || emp.isDeleted) {
      res.status(404).json({ error: 'Not Found', message: 'Employee not found' });
      return;
    }

    await col.updateOne(
      { id: empId },
      {
        $set: {
          allowLogin: false,
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy: req.userId || 'admin',
          updatedAt: new Date().toISOString()
        }
      }
    );

    res.json({ message: `Employee ${empId} deleted successfully.` });

    RRService.logActivity(
      `Soft-deleted employee ${empId}`,
      req.userId,
      req.userRole,
      `Employee soft-deleted: ${emp.firstName} ${emp.lastName} (Role: ${emp.role.toUpperCase()}, Phone: ${emp.phone})`
    ).catch((logErr) => console.error('[AuditLog] Failed to log soft-deleted employee:', logErr));
  } catch (err: any) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

/* ============================================================
   ACTIVITY LOGS
============================================================ */

// GET logs (Admin only)
rrRouter.get('/logs', authenticateRRToken, requireAdmin, async (req: any, res: Response) => {
  try {
    const col = await RRService.getLogsCol();
    const { from, to, page, limit, search, all } = req.query;

    const query: any = {};
    if (from || to) {
      query.timestamp = {};
      if (from) {
        query.timestamp.$gte = new Date(from as string + 'T00:00:00');
      }
      if (to) {
        query.timestamp.$lte = new Date(to as string + 'T23:59:59.999');
      }
    }

    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = safeRegex(search.trim(), 'i');
      query.$or = [
        { action: { $regex: searchRegex } },
        { performedBy: { $regex: searchRegex } },
        { role: { $regex: searchRegex } },
        { details: { $regex: searchRegex } }
      ];
    }

    if (all === 'true') {
      // Hard ceiling of 1000 items to prevent server out-of-memory crashes on large datasets
      const list = await col.find(query).sort({ timestamp: -1, _id: -1 }).limit(1000).toArray();
      res.json(list);
      return;
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      col.find(query).sort({ timestamp: -1, _id: -1 }).skip(skip).limit(limitNum).toArray(),
      col.countDocuments(query)
    ]);

    res.json({
      logs,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

/* ============================================================
   DASHBOARD STATS & AVAILABILITY ENHANCEMENTS
============================================================ */

rrRouter.get('/dashboard/stats', authenticateRRToken, async (req: any, res: Response) => {
  try {
    const vehCol = await RRService.getVehiclesCol();
    const bookingCol = await RRService.getBookingsCol();

    const [totalFleet, maintenance, available, contract, activeBookings, pendingPayments, reserved] = await Promise.all([
      vehCol.countDocuments({ isDeleted: { $ne: true } }),
      vehCol.countDocuments({ status: 'maintenance', isDeleted: { $ne: true } }),
      vehCol.countDocuments({ status: 'available', isDeleted: { $ne: true } }),
      vehCol.countDocuments({ status: { $in: ['contract', 'in_contract'] }, isDeleted: { $ne: true } }),
      bookingCol.countDocuments({ status: 'active', isDeleted: { $ne: true } }),
      bookingCol.countDocuments({ status: 'active', isDeleted: { $ne: true }, pendingAmount: { $nin: ['0', '', null] } } as any),
      bookingCol.countDocuments({ status: 'reserved', isDeleted: { $ne: true } }),
    ]);

    res.json({
      totalFleet,
      maintenance,
      available,
      contract,
      activeBookings,
      pendingPayments,
      reserved,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

rrRouter.get('/vehicles/:id/availability', authenticateRRToken, async (req: any, res: Response) => {
  try {
    const regNo = req.params.id;
    const col = await RRService.getVehiclesCol();
    const vehicle = await col.findOne({ regNo, isDeleted: { $ne: true } });
    if (!vehicle) {
      res.status(404).json({ error: 'Not Found', message: 'Vehicle not found' });
      return;
    }
    const isAvailable = vehicle.status === 'available';
    res.json({ regNo, isAvailable, status: vehicle.status });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

export { rrRouter };

