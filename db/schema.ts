// db/schema.ts
import { 
  pgTable, 
  uuid, 
  text, 
  timestamp, 
  doublePrecision, 
  integer // <--- DIESES WORT HINZUFÜGEN
} from "drizzle-orm/pg-core";
export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  // NEU: Feld für die Sortierung
  sortOrder: integer('sort_order').default(0).notNull(),
});

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  // DIESE ZEILE STEUERT DAS LÖSCHEN DER SUBS IN DER DB:
  parentId: uuid('parent_id').references((): AnyPgColumn => categories.id, { onDelete: 'cascade' }),
  icon: text('icon').default('📁'),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'cascade' }).notNull(),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'cascade' }).notNull(),
  description: text('description').notNull(),
  amount: doublePrecision('amount').notNull(),
  type: text('type').$type<'income' | 'expense'>().notNull(),
  date: timestamp('date').defaultNow().notNull(),
  
  // NEUE FELDER:
  receiver: text('receiver'),
  receiverIban: text('receiver_iban'),
  details: text('details'),
});

export const budgets = pgTable('budgets', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id')
    .references(() => categories.id, { onDelete: 'cascade' }) // DIESE ZEILE IST KRITISCH
    .notNull()
    .unique(),
  limitAmount: doublePrecision('limit_amount').notNull(),
});