// app/actions.ts
'use server'

import { db } from "@/db";
import { transactions, budgets, accounts, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { subscriptions as subTable } from "@/db/schema";

// --- KONTEN (ACCOUNTS) ---
export async function addAccount(formData: FormData) {
  const name = formData.get("name") as string;
  const initialBalance = parseFloat(formData.get("initialBalance") as string) || 0;

  // 1. Konto erstellen
  const [newAccount] = await db.insert(accounts).values({
    name: name,
  }).returning();

  // 2. Wenn ein Startguthaben eingegeben wurde, erste Buchung erstellen
  if (initialBalance !== 0) {
    // Wir suchen eine Standard-Kategorie wie "Transfer" oder "Import"
    const allCats = await db.select().from(categories);
    const defaultCat = allCats.find(c => c.name === 'Import') || allCats[0];

    await db.insert(transactions).values({
      accountId: newAccount.id,
      categoryId: defaultCat.id,
      description: "Startguthaben",
      amount: initialBalance,
      type: initialBalance >= 0 ? 'income' : 'expense',
      date: new Date(),
    });
  }

  revalidatePath("/");
}

export async function deleteAccount(id: string) {
  await db.delete(accounts).where(eq(accounts.id, id));
  revalidatePath("/");
}

// --- KATEGORIEN (CATEGORIES) ---
export async function addCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const parentId = formData.get("parentId") as string;
  const icon = formData.get("icon") as string;

  await db.insert(categories).values({
    name,
    parentId: parentId === "" ? null : parentId,
    icon: icon || '📁',
  });

  revalidatePath("/");
}

// --- TRANSAKTIONEN (TRANSACTIONS) ---
export async function addTransaction(formData: FormData) {
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as 'income' | 'expense';
  
  await db.insert(transactions).values({
    accountId: formData.get("accountId") as string,
    categoryId: formData.get("categoryId") as string,
    description: formData.get("description") as string,
    amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
    type: type,
    date: formData.get("date") ? new Date(formData.get("date") as string) : new Date(),
    
    // NEU:
    receiver: formData.get("receiver") as string || null,
    receiverIban: formData.get("receiver_iban") as string || null,
    details: formData.get("details") as string || null,
  });
  revalidatePath("/");
}

// --- UMBUCHUNGEN (TRANSFERS) ---
export async function addTransfer(formData: FormData) {
  const amount = parseFloat(formData.get("amount") as string);
  const fromId = formData.get("fromAccountId") as string;
  const toId = formData.get("toAccountId") as string;
  const description = formData.get("description") as string;
  const dateStr = formData.get("date") as string;
  const date = dateStr ? new Date(dateStr) : new Date();

  // Hinweis: Erstelle eine Kategorie "Transfer" im Editor, damit das System sie findet!
  const [transferCat] = await db.select()
    .from(categories)
    .where(eq(categories.name, 'Transfer'))
    .limit(1);

  if (!transferCat) {
    throw new Error("Bitte erstelle zuerst eine Kategorie namens 'Transfer'!");
  }

  // 1. Abgang
  await db.insert(transactions).values({
    accountId: fromId,
    categoryId: transferCat.id,
    description: `-> ${description || 'Umbuchung'}`,
    amount: -Math.abs(amount),
    type: 'expense',
    date: date,
  });

  // 2. Eingang
  await db.insert(transactions).values({
    accountId: toId,
    categoryId: transferCat.id,
    description: `<- ${description || 'Umbuchung'}`,
    amount: Math.abs(amount),
    type: 'income',
    date: date,
  });

  revalidatePath("/");
}

export async function deleteTransaction(id: string) {
  await db.delete(transactions).where(eq(transactions.id, id));
  revalidatePath("/");
}

// --- BUDGETS ---
export async function upsertBudget(formData: FormData) {
  const categoryId = formData.get("categoryId") as string;
  const limitAmount = parseFloat(formData.get("limitAmount") as string);

  const existing = await db.select().from(budgets).where(eq(budgets.categoryId, categoryId));

  if (existing.length > 0) {
    await db.update(budgets).set({ limitAmount }).where(eq(budgets.categoryId, categoryId));
  } else {
    await db.insert(budgets).values({ categoryId, limitAmount });
  }

  revalidatePath("/");
}

export async function deleteBudget(id: string) {
  await db.delete(budgets).where(eq(budgets.id, id));
  revalidatePath("/");
}


export async function importTransactions(transactionsList: any[]) {
  if (transactionsList.length === 0) return;

  await db.insert(transactions).values(transactionsList.map(t => ({
    accountId: t.accountId,
    categoryId: t.categoryId,
    description: t.description,
    receiver: t.receiver || null,
    receiverIban: t.receiverIban || null,
    details: t.details || null,
    amount: t.amount,
    // HIER DIE ÄNDERUNG: "as const" oder expliziter Type-Cast
    type: (t.amount < 0 ? 'expense' : 'income') as 'expense' | 'income', 
    date: new Date(t.date),
  })));

  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  try {
    // Dank ON DELETE CASCADE in der DB werden Budgets und Transaktionen 
    // jetzt automatisch mitgelöscht. Wir müssen nur den Befehl geben.
    await db.delete(categories).where(eq(categories.id, id));
    
    revalidatePath("/");
  } catch (error) {
    console.error("Fehler beim Löschen der Kategorie:", error);
    throw new Error("Kategorie konnte nicht gelöscht werden. Sind noch Abhängigkeiten vorhanden?");
  }
}


export async function updateTransaction(id: string, formData: FormData) {
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as 'income' | 'expense';
  const dateStr = formData.get("date") as string;

  await db.update(transactions).set({
    accountId: formData.get("accountId") as string,
    categoryId: formData.get("categoryId") as string,
    description: formData.get("description") as string,
    amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
    type: type,
    date: dateStr ? new Date(dateStr) : new Date(),
    receiver: formData.get("receiver") as string || null,
    receiverIban: formData.get("receiver_iban") as string || null,
    details: formData.get("details") as string || null,
  }).where(eq(transactions.id, id));

  revalidatePath("/");
}

export async function reorderAccounts(orderedIds: string[]) {
  // Wir gehen die Liste der IDs durch und setzen den sortOrder entsprechend des Index
  for (let i = 0; i < orderedIds.length; i++) {
    await db.update(accounts)
      .set({ sortOrder: i })
      .where(eq(accounts.id, orderedIds[i]));
  }
  revalidatePath("/");
}

export async function addSubscription(formData: FormData) {
  const amount = parseFloat(formData.get("amount") as string);
  
  await db.insert(subTable).values({
    name: formData.get("name") as string,
    amount: amount,
    accountId: formData.get("accountId") as string,
    categoryId: formData.get("categoryId") as string,
    interval: formData.get("interval") as string || 'monthly',
    startDate: new Date(formData.get("startDate") as string || new Date()),
  });

  revalidatePath("/");
}

export async function addSplit(formData: FormData) {
  // Wir extrahieren die Basisdaten
  const accountId = formData.get("accountId") as string;
  const date = new Date(formData.get("date") as string || new Date());
  const description = formData.get("description") as string;

  // Die Teilbuchungen kommen oft als JSON-String oder indexierte Felder
  // Hier ein robustes Beispiel für die Verarbeitung:
  const splitDataRaw = formData.get("splits") as string;
  const splits = JSON.parse(splitDataRaw) as Array<{ categoryId: string, amount: number }>;

  // Wir erstellen für jeden Teil des Splits eine eigene Buchung
  const transactionsToInsert = splits.map(s => ({
    accountId,
    categoryId: s.categoryId,
    description: `${description} (Teilbetrag)`,
    amount: s.amount,
    type: s.amount < 0 ? 'expense' : 'income' as 'expense' | 'income',
    date: date,
  }));

  if (transactionsToInsert.length > 0) {
    await db.insert(transactions).values(transactionsToInsert);
  }

  revalidatePath("/");
}