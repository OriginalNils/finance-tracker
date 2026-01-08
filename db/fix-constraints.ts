// db/fix-constraints.ts
import { db } from "./index"; // Pfad zu deiner db/index.ts
import { sql } from "drizzle-orm";

async function fix() {
  console.log("🛠️  Sprengung der Datenbank-Blockaden via Drizzle...");
  
  try {
    // Wir löschen die alten Sperren und legen sie mit CASCADE neu an
    await db.execute(sql`
      -- 1. Budgets reparieren
      ALTER TABLE "budgets" DROP CONSTRAINT IF EXISTS "budgets_category_id_categories_id_fk";
      ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_categories_id_fk" 
      FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE;

      -- 2. Transaktionen reparieren
      ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_category_id_categories_id_fk";
      ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" 
      FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE;
      
      -- 3. Kategorien Selbst-Referenz (für Unterkategorien)
      ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_parent_id_categories_id_fk";
      ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" 
      FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE CASCADE;
    `);

    console.log("✅ Datenbank-Constraints erfolgreich auf CASCADE umgestellt.");
  } catch (err) {
    console.error("❌ Fehler beim Update der Datenbank:", err);
  }
  process.exit(0);
}

fix();