// db/seed.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { accounts, transactions, categories } from './schema';

const pool = new Pool({ connectionString: "postgresql://nils:financepassword@localhost:5432/finance_db" });
const db = drizzle(pool);

async function seed() {
  console.log('🧹 System-Reset v8.0...');

  // 1. Konten
  const [giro] = await db.insert(accounts).values({ name: 'Girokonto', type: 'checking', color: '#ffffff' }).returning();
  const [depot] = await db.insert(accounts).values({ name: 'Depot', type: 'investment', color: '#52525b' }).returning();

  // 2. Hauptkategorien
  const [housing] = await db.insert(categories).values({ name: 'Wohnen', icon: '🏠' }).returning();
  const [food] = await db.insert(categories).values({ name: 'Lebensmittel', icon: '🛒' }).returning();
  const [system] = await db.insert(categories).values({ name: 'Transfer', icon: '🔄' }).returning();

  // 3. Unterkategorien
  const [rent] = await db.insert(categories).values({ name: 'Miete', parentId: housing.id, icon: '🔑' }).returning();
  const [market] = await db.insert(categories).values({ name: 'Supermarkt', parentId: food.id, icon: '🥩' }).returning();

  // 4. Erste Buchungen
  await db.insert(transactions).values([
    { accountId: giro.id, categoryId: rent.id, description: 'Miete Januar', amount: -1200.00, type: 'expense' },
    { accountId: giro.id, categoryId: market.id, description: 'Wocheneinkauf', amount: -85.50, type: 'expense' },
  ]);

  console.log('✅ V8.0 erfolgreich aufgesetzt.');
  process.exit(0);
}
seed().catch(console.error);