import { MongoClient, Db } from 'mongodb';
import { MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_URI } from '../../config/mongodb';

let connectionString = MONGODB_URI;

// If MONGODB_URI is not provided but username and password are, fallback to constructing a local URI
if (!connectionString && MONGODB_USERNAME && MONGODB_PASSWORD) {
  connectionString = `mongodb://${encodeURIComponent(MONGODB_USERNAME)}:${encodeURIComponent(MONGODB_PASSWORD)}@localhost:27017/portfolio?authSource=admin`;
}

if (!connectionString) {
  throw new Error('Missing MongoDB credentials/URI in .env file');
}

const client = new MongoClient(connectionString);
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;
  await client.connect();
  db = client.db();
  return db;
}

// Secondary connection for Ram & Ram (RR) module
let rrDb: Db | null = null;
const rrConnectionString = process.env['MONGODB_RR_URI'] || connectionString;
const rrClient = rrConnectionString === connectionString ? client : new MongoClient(rrConnectionString);

export async function connectToRRDatabase(): Promise<Db> {
  if (rrDb) return rrDb;
  if (rrConnectionString === connectionString) {
    await client.connect();
    rrDb = client.db('rams_cars');
  } else {
    await rrClient.connect();
    rrDb = rrClient.db('rams_cars');
  }
  return rrDb;
}

export { client, rrClient };

