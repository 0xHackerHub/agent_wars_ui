import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg';
const { Pool } = pg;
import { config } from 'dotenv';
config();
import * as schema from "./schema.js"

// Disable certificate validation for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

console.log('Connecting to PostgreSQL with URL:', process.env.DATABASE_URL);

// For Aiven, we need to add the ca parameter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // This will allow self-signed certificates
  }
})

// Test the connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.connect()
  .then(client => {
    console.log('Successfully connected to PostgreSQL');
    client.release();
  })
  .catch(err => {
    console.error('Error connecting to PostgreSQL:', err);
  });

export const db = drizzle(pool, { schema: { ...schema } })
export default db;