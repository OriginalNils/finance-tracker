// db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Ändere localhost auf die IP deines Datenbank-Containers (LXC 100)
const pool = new Pool({
  connectionString: "postgresql://nils:financepassword@192.168.178.100:5432/finance_db",
});

export const db = drizzle(pool);