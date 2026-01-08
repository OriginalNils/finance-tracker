import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Lädt die .env Datei
dotenv.config();

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});