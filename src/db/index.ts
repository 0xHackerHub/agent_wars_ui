import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Option 1: Simply disable SSL verification (not recommended for production)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Option 2: If you have CA certificate from Aiven (preferred for production)
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: true,
//     ca: process.env.CA_CERT || fs.readFileSync(path.join(process.cwd(), 'ca.crt')).toString()
//   }
// });

// Test the connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Add connection logging
pool.on('connect', () => {
  console.log('Connected to database successfully');
});

pool.on('acquire', () => {
  console.log('Client acquired from pool');
});

// Test the connection immediately
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Database connection test successful');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    // Don't throw here, just return false to indicate failure
    return false;
  }
}

// Run the test but don't crash the app if it fails
testConnection().then(success => {
  if (!success) {
    console.warn('Database connection test failed, but continuing app startup');
  }
}).catch(err => {
  console.error('Error during connection test:', err);
});

export const db = drizzle(pool, { schema });