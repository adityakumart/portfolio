import mongoose, { Connection } from 'mongoose';
import { MONGODB_URI } from './mongodb';

let isMongooseConnected = false;

/**
 * Initializes and returns a singleton Mongoose connection to the RoadReady Rentals database ('rams_cars').
 */
export async function connectMongoose(): Promise<typeof mongoose> {
  if (isMongooseConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const connectionString =
    process.env['MONGODB_RR_URI'] || process.env['MONGODB_URI'] || MONGODB_URI;
  if (!connectionString) {
    throw new Error(
      'Missing MongoDB connection URI for Mongoose initialization.',
    );
  }

  try {
    await mongoose.connect(connectionString, {
      dbName: 'rams_cars',
    });
    isMongooseConnected = true;
    console.log('[Mongoose] Connected successfully to rams_cars database.');
    return mongoose;
  } catch (err: unknown) {
    console.error(
      '[Mongoose] Database connection error:',
      (err as Error).message,
    );
    throw err;
  }
}

let portfolioConnection: Connection | null = null;

/**
 * Returns a singleton Mongoose Connection to the primary portfolio database.
 */
export async function getPortfolioConnection(): Promise<Connection> {
  if (portfolioConnection && portfolioConnection.readyState === 1) {
    return portfolioConnection;
  }

  const connectionString = process.env['MONGODB_URI'] || MONGODB_URI;
  if (!connectionString) {
    throw new Error('Missing MongoDB connection URI for Portfolio database.');
  }

  try {
    portfolioConnection = mongoose.createConnection(connectionString, {
      dbName: process.env['MONGODB_PORTFOLIO_DB'] || 'portfolio',
    });
    await portfolioConnection.asPromise();
    console.log('[Mongoose] Connected successfully to portfolio database.');
    return portfolioConnection;
  } catch (err: unknown) {
    console.error(
      '[Mongoose] Portfolio database connection error:',
      (err as Error).message,
    );
    throw err;
  }
}

export default mongoose;
