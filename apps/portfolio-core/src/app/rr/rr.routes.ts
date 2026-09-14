import { Router, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import multer from 'multer';
import { authenticateRRToken, requireAdmin } from './rr.middleware';
import { RRService, IEmployee, IVehicle, IBooking } from './rr.service';
import { handleVehicleImageUpload } from './r2-storage.controller';

const rrRouter = Router();
const JWT_SECRET = process.env['JWT_SECRET'] || 'supersecretlocaljwtkey1234567890!';

// Seed database on router initialization
RRService.seedInitialData();

/* ============================================================
   AUTHENTICATION
============================================================ */
rrRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password, empId, dob } = req.body;

    const empCol = await RRService.getEmployeesCol();

    // 1. Admin Login (Username & Password)
    if (username && password) {
      // Find employee by email, id, or check if it matches AdminUN/AdminPD directly if DB is empty
      const emp = await empCol.findOne({
        $or: [{ id: username }, { email: username.toLowerCase() }]
      });

      if (!emp) {
        res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
        return;
      }

      if (!emp.allowLogin) {
        res.status(403).json({ error: 'Forbidden', message: 'Your account is disabled' });
        return;
      }

      if (emp.role === 'admin' && emp.passwordHash) {
        const isMatch = await bcrypt.compare(password, emp.passwordHash);
        if (!isMatch) {
          res.status(401).json({ error: 'Unauthorized', message: 'Invalid password' });
          return;
        }
      } else {
        // If they are an employee but logging in with username/password, we verify against DOB
        if (emp.dob !== password) {
          res.status(401).json({ error: 'Unauthorized', message: 'Invalid password' });
          return;
        }
      }

      const token = jwt.sign({ id: emp.id, role: emp.role }, JWT_SECRET, { expiresIn: '24h' });
      await RRService.logActivity('Logged in', emp.id, emp.role);

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
      return;
    }

    // 2. Employee Login (empId & dob)
    if (empId && dob) {
      const emp = await empCol.findOne({ id: empId });
      if (!emp) {
        res.status(401).json({ error: 'Unauthorized', message: 'No employee found with this ID.' });
        return;
      }

      if (!emp.allowLogin) {
        res.status(403).json({ error: 'Forbidden', message: 'Your account is disabled' });
        return;
      }

      if (emp.dob !== dob) {
        res.status(401).json({ error: 'Unauthorized', message: 'Incorrect date of birth.' });
        return;
      }

      const token = jwt.sign({ id: emp.id, role: emp.role }, JWT_SECRET, { expiresIn: '24h' });
      await RRService.logActivity('Logged in', emp.id, emp.role);

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
      return;
    }

    res.status(400).json({ error: 'Bad Request', message: 'Please provide credentials' });
  } catch (err: any) {
    console.error('Login router error:', err);
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
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  }
});

// POST upload vehicle image (Authenticated)
rrRouter.post(
  '/vehicles/upload',
  authenticateRRToken,
  (req, res, next) => {
    upload.single('image')(req, res, (err: any) => {
      if (err) {
        res.status(400).json({ error: 'Bad Request', message: err.message });
      } else {
        next();
      }
    });
  },
  handleVehicleImageUpload
);

// GET all vehicles (public so homepage can show them; supports ?search=, ?limit=, ?autocomplete=true, ?fields=...)
rrRouter.get('/vehicles', async (req: Request, res: Response) => {
  try {
    const col = await RRService.getVehiclesCol();
    const { search, limit, autocomplete, fields } = req.query;
    const filter: any = {};
    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
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

// GET minimal vehicles list for autocomplete (strictly regNo/name/manufacturer, no heavy vehicle details)
rrRouter.get('/vehicles/autocomplete', async (req: Request, res: Response) => {
  try {
    const col = await RRService.getVehiclesCol();
    const { search, limit } = req.query;
    const filter: any = {};
    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: { $regex: searchRegex } },
        { manufacturer: { $regex: searchRegex } },
        { regNo: { $regex: searchRegex } }
      ];
    }

    let cursor = col
      .find(filter, { projection: { regNo: 1, name: 1, manufacturer: 1, _id: 0 } })
      .sort({ manufacturer: 1, name: 1 });

    if (limit) {
      const limitNum = parseInt(limit as string, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        cursor = cursor.limit(limitNum);
      }
    }
    const list = await cursor.toArray();
    const mapped = list.map((v: any) => ({
      regNo: v.regNo,
      name: v.name,
      manufacturer: v.manufacturer,
      vehicleRegNo: v.regNo,
      vehicleName: v.name,
      vehicleManufacturer: v.manufacturer,
    }));
    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// POST new vehicle (Admin only)
rrRouter.post('/vehicles', authenticateRRToken, requireAdmin, async (req: any, res: Response) => {
  try {
    const data: Omit<IVehicle, 'createdAt'> = req.body;
    const col = await RRService.getVehiclesCol();

    const existing = await col.findOne({ regNo: { $regex: new RegExp(`^${data.regNo}$`, 'i') } });
    if (existing) {
      res.status(409).json({ error: 'Conflict', message: `Vehicle with plate ${data.regNo} already exists.` });
      return;
    }

    const newVehicle: IVehicle = {
      ...data,
      createdAt: new Date().toISOString()
    };

    await col.insertOne(newVehicle);
    await RRService.logActivity(`Added vehicle ${newVehicle.manufacturer} ${newVehicle.name} (${newVehicle.regNo})`, req.userId, req.userRole);

    res.status(201).json(newVehicle);
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
    if (!vehicle) {
      res.status(404).json({ error: 'Not Found', message: 'Vehicle not found' });
      return;
    }

    // Remove immutable fields
    delete updateData._id;
    delete updateData.regNo;
    delete updateData.createdAt;

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
    await RRService.logActivity(`Updated vehicle ${regNo} details`, req.userId, req.userRole);

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// DELETE vehicle (Admin only)
rrRouter.delete('/vehicles/:id', authenticateRRToken, requireAdmin, async (req: any, res: Response) => {
  try {
    const regNo = req.params.id;
    const col = await RRService.getVehiclesCol();

    const result = await col.deleteOne({ regNo });
    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Vehicle not found' });
      return;
    }

    await RRService.logActivity(`Deleted vehicle ${regNo}`, req.userId, req.userRole);
    res.json({ message: `Vehicle ${regNo} deleted successfully.` });
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
      const vRegex = new RegExp(vehicle.trim(), 'i');
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
      const cRegex = new RegExp(customer.trim(), 'i');
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
      const sRegex = new RegExp(search.trim(), 'i');
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

    const query = andConditions.length > 0 ? { $and: andConditions } : {};

    const isPaginated = paginate === 'true' || page !== undefined || limit !== undefined;

    if (!isPaginated || all === 'true') {
      const list = await col.find(query).sort({ createdAt: -1, _id: -1 }).toArray();
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

// POST create booking (Authenticated)
rrRouter.post('/bookings', authenticateRRToken, async (req: any, res: Response) => {
  try {
    const bookingData: Omit<IBooking, 'id' | 'createdAt'> = req.body;
    const bookingCol = await RRService.getBookingsCol();
    const vehCol = await RRService.getVehiclesCol();

    const selectedVehicle = await vehCol.findOne({ regNo: bookingData.vehicleRegNo });
    if (!selectedVehicle) {
      res.status(404).json({ error: 'Not Found', message: 'Vehicle not found' });
      return;
    }

    if (['in_booking', 'rented', 'contract'].includes(selectedVehicle.status)) {
      res.status(409).json({ error: 'Conflict', message: 'Vehicle is already booked/rented.' });
      return;
    }

    // Generate Booking ID
    const count = await bookingCol.countDocuments();
    const bookingId = 'RRB' + String(count + 1).padStart(3, '0');

    const newBooking: IBooking = {
      ...bookingData,
      id: bookingId,
      createdAt: new Date().toISOString()
    };

    await bookingCol.insertOne(newBooking);

    // Update main vehicle status to in_booking (odometer remains unchanged until booking is closed)
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

    await RRService.logActivity(`Created booking ${bookingId} for ${bookingData.vehicleRegNo}`, req.userId, req.userRole);

    res.status(201).json(newBooking);
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// PUT update booking / end booking (Authenticated)
rrRouter.put('/bookings/:id', authenticateRRToken, async (req: any, res: Response) => {
  try {
    const bookingId = req.params.id;
    const updateData = req.body;
    const bookingCol = await RRService.getBookingsCol();
    const vehCol = await RRService.getVehiclesCol();

    const booking = await bookingCol.findOne({ id: bookingId });
    if (!booking) {
      res.status(404).json({ error: 'Not Found', message: 'Booking not found' });
      return;
    }

    delete updateData._id;
    delete updateData.id;
    delete updateData.createdAt;

    await bookingCol.updateOne(
      { id: bookingId },
      {
        $set: {
          ...updateData,
          endedAt: updateData.status === 'completed' || updateData.status === 'cancelled' ? new Date().toISOString() : null
        }
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
      // If cancelled, release vehicle back to available without modifying odometer
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

    const updated = await bookingCol.findOne({ id: bookingId });
    await RRService.logActivity(
      `Updated booking ${bookingId} status to ${updateData.status || booking.status}` +
      (updateData.status === 'completed' && updateData.vehicleOdometerEnd ? ` (Vehicle: ${booking.vehicleRegNo} odometer updated to ${updateData.vehicleOdometerEnd})` : ''),
      req.userId,
      req.userRole
    );

    res.json(updated);
  } catch (err: any) {
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
    const list = await col.find().toArray();
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
      firstName: { $regex: new RegExp(`^${data.firstName}$`, 'i') },
      lastName: { $regex: new RegExp(`^${data.lastName}$`, 'i') },
      dob: data.dob
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
    if (data.role === 'admin') {
      const saltRounds = 10;
      // Default admin password: AdminPD
      passwordHash = await bcrypt.hash('AdminPD', saltRounds);
    }

    const newEmp: IEmployee = {
      ...data,
      id: newId,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    await col.insertOne(newEmp);
    await RRService.logActivity(`Created employee ${newEmp.firstName} ${newEmp.lastName} (${newEmp.id})`, req.userId, req.userRole);

    res.status(201).json(newEmp);
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
    if (!emp) {
      res.status(404).json({ error: 'Not Found', message: 'Employee not found' });
      return;
    }

    delete updateData._id;
    delete updateData.id;
    delete updateData.createdAt;

    await col.updateOne({ id: empId }, { $set: updateData });

    const updated = await col.findOne({ id: empId });
    await RRService.logActivity(`Updated employee ${empId} details`, req.userId, req.userRole);

    res.json(updated);
  } catch (err: any) {
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
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { action: { $regex: searchRegex } },
        { performedBy: { $regex: searchRegex } },
        { role: { $regex: searchRegex } },
        { details: { $regex: searchRegex } }
      ];
    }

    if (all === 'true') {
      const list = await col.find(query).sort({ timestamp: -1, _id: -1 }).toArray();
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

    const [totalFleet, maintenance, available, contract, activeBookings, pendingPayments] = await Promise.all([
      vehCol.countDocuments({}),
      vehCol.countDocuments({ status: 'maintenance' }),
      vehCol.countDocuments({ status: 'available' }),
      vehCol.countDocuments({ status: { $in: ['contract', 'in_contract'] } }),
      bookingCol.countDocuments({ status: 'active' }),
      bookingCol.countDocuments({ status: 'active', pendingAmount: { $nin: ['0', '', null] } } as any)
    ]);

    res.json({
      totalFleet,
      maintenance,
      available,
      contract,
      activeBookings,
      pendingPayments
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

rrRouter.get('/vehicles/:id/availability', authenticateRRToken, async (req: any, res: Response) => {
  try {
    const regNo = req.params.id;
    const col = await RRService.getVehiclesCol();
    const vehicle = await col.findOne({ regNo });
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

