// db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Wir nutzen direkt dein Passwort von vorhin
const pool = new Pool({
  connectionString: "postgresql://nils:financepassword@localhost:5432/finance_db",
});

export const db = drizzle(pool);