// db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema'; // <-- DAS WAR DAS PROBLEM!

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env file');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // <-- Verwende .env statt hardcoded
});

export const db = drizzle(pool, { schema }); // <-- schema hinzufügen!
