// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Lädt die .env Datei für lokale Tests und den Server
dotenv.config();

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  // NEU: 'dialect' ist jetzt Pflicht
  dialect: 'postgresql', 
  dbCredentials: {
    // NEU: 'url' statt 'connectionString' verwenden
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});