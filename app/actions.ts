// app/actions.ts
'use server'

import { db } from "@/db";
import { auth } from "@/auth";
import { transactions, budgets, bankAccounts as accounts, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { subscriptions as subTable } from "@/db/schema";

// --- KONTEN (ACCOUNTS) ---
export async function addAccount(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  
  const name = formData.get("name") as string;
  const initialBalance = parseFloat(formData.get("initialBalance") as string) || 0;

  // 1. Konto erstellen
  const [newAccount] = await db.insert(accounts).values({
    name: name,
    userId: session.user.id, // <-- HINZUGEFÜGT!
  }).returning();

  // 2. Wenn ein Startguthaben eingegeben wurde, erste Buchung erstellen
  if (initialBalance !== 0) {
    const allCats = await db.select().from(categories).where(eq(categories.userId, session.user.id));
    const defaultCat = allCats.find(c => c.name === 'Import') || allCats[0];

    if (defaultCat) {
      await db.insert(transactions).values({
        accountId: newAccount.id,
        categoryId: defaultCat.id,
        description: "Startguthaben",
        amount: initialBalance,
        type: initialBalance >= 0 ? 'income' : 'expense',
        date: new Date(),
        userId: session.user.id, // <-- HINZUGEFÜGT!
      });
    }
  }

  revalidatePath("/");
}

export async function deleteAccount(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  
  await db.delete(accounts).where(eq(accounts.id, parseInt(id))); // <-- parseInt()
  revalidatePath("/");
}

// --- KATEGORIEN (CATEGORIES) ---
export async function addCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  
  const name = formData.get("name") as string;
  const parentId = formData.get("parentId") as string;
  const icon = formData.get("icon") as string;

  await db.insert(categories).values({
    name,
    parentId: parentId === "" ? null : parseInt(parentId), // <-- parseInt() hinzufügen!
    icon: icon || '📁',
    userId: session.user.id,
  });

  revalidatePath("/");
}

// --- TRANSAKTIONEN (TRANSACTIONS) ---
export async function addTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as 'income' | 'expense';
  
  await db.insert(transactions).values({
    accountId: parseInt(formData.get("accountId") as string),      // <-- parseInt()
    categoryId: parseInt(formData.get("categoryId") as string),    // <-- parseInt()
    description: formData.get("description") as string,
    amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
    type: type,
    date: formData.get("date") ? new Date(formData.get("date") as string) : new Date(),
    receiver: formData.get("receiver") as string || null,
    receiverIban: formData.get("receiver_iban") as string || null,
    details: formData.get("details") as string || null,
    userId: session.user.id,
  });
  revalidatePath("/");
}

// --- UMBUCHUNGEN (TRANSFERS) ---
// addTransfer Funktion - Zeile ~95-135
export async function addTransfer(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  
  const amount = parseFloat(formData.get("amount") as string);
  const fromId = parseInt(formData.get("fromAccountId") as string);  // <-- schon parseInt()
  const toId = parseInt(formData.get("toAccountId") as string);      // <-- schon parseInt()
  const description = formData.get("description") as string;
  const dateStr = formData.get("date") as string;
  const date = dateStr ? new Date(dateStr) : new Date();

  const [transferCat] = await db.select()
    .from(categories)
    .where(eq(categories.name, 'Transfer'))
    .limit(1);

  if (!transferCat) {
    throw new Error("Bitte erstelle zuerst eine Kategorie namens 'Transfer'!");
  }

  // 1. Abgang - fromId ist bereits number
  await db.insert(transactions).values({
    accountId: fromId,           // <-- Keine Änderung nötig, ist schon number
    categoryId: transferCat.id,  // <-- Keine Änderung nötig
    description: `-> ${description || 'Umbuchung'}`,
    amount: -Math.abs(amount),
    type: 'expense',
    date: date,
    userId: session.user.id,
  });

  // 2. Eingang - toId ist bereits number
  await db.insert(transactions).values({
    accountId: toId,             // <-- Keine Änderung nötig, ist schon number
    categoryId: transferCat.id,  // <-- Keine Änderung nötig
    description: `<- ${description || 'Umbuchung'}`,
    amount: Math.abs(amount),
    type: 'income',
    date: date,
    userId: session.user.id,
  });

  revalidatePath("/");
}

export async function deleteTransaction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  
  await db.delete(transactions).where(eq(transactions.id, parseInt(id))); // <-- parseInt()
  revalidatePath("/");
}

// --- BUDGETS ---
export async function upsertBudget(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  
  const categoryId = parseInt(formData.get("categoryId") as string);  // <-- parseInt()
  const limitAmount = parseFloat(formData.get("limitAmount") as string);

  const existing = await db.select()
    .from(budgets)
    .where(eq(budgets.categoryId, categoryId));  // <-- Jetzt ist categoryId number

  if (existing.length > 0) {
    await db.update(budgets)
      .set({ limitAmount })
      .where(eq(budgets.categoryId, categoryId));  // <-- Jetzt ist categoryId number
  } else {
    await db.insert(budgets).values({ 
      categoryId,      // <-- Jetzt number
      limitAmount,
      userId: session.user.id,
    });
  }

  revalidatePath("/");
}

export async function deleteBudget(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  
  await db.delete(budgets).where(eq(budgets.id, parseInt(id))); // <-- parseInt()
  revalidatePath("/");
}

// importTransactions Funktion - Zeile ~177-195
export async function importTransactions(transactionsList: any[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  
  if (transactionsList.length === 0) return;

  await db.insert(transactions).values(transactionsList.map(t => ({
    accountId: t.accountId,
    categoryId: t.categoryId,
    description: t.description,
    receiver: t.receiver || null,
    receiverIban: t.receiverIban || null,
    details: t.details || null,
    amount: t.amount,
    type: (t.amount < 0 ? 'expense' : 'income') as 'expense' | 'income', 
    date: new Date(t.date),
    userId: session.user.id,  // <-- DIESE ZEILE HINZUFÜGEN!
  })));

  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  
  try {
    await db.delete(categories).where(eq(categories.id, parseInt(id))); // <-- parseInt()
    revalidatePath("/");
  } catch (error) {
    console.error("Fehler beim Löschen der Kategorie:", error);
    throw new Error("Kategorie konnte nicht gelöscht werden. Sind noch Abhängigkeiten vorhanden?");
  }
}


export async function updateTransaction(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as 'income' | 'expense';
  const dateStr = formData.get("date") as string;

  await db.update(transactions).set({
    accountId: parseInt(formData.get("accountId") as string),
    categoryId: parseInt(formData.get("categoryId") as string),
    description: formData.get("description") as string,
    amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
    type: type,
    date: dateStr ? new Date(dateStr) : new Date(),
    receiver: formData.get("receiver") as string || null,
    receiverIban: formData.get("receiver_iban") as string || null,
    details: formData.get("details") as string || null,
  }).where(eq(transactions.id, parseInt(id))); // <-- parseInt()

  revalidatePath("/");
}


export async function reorderAccounts(orderedIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  
  for (let i = 0; i < orderedIds.length; i++) {
    await db.update(accounts)
      .set({ sortOrder: i })
      .where(eq(accounts.id, parseInt(orderedIds[i]))); // <-- parseInt()
  }
  revalidatePath("/");
}

export async function addSubscription(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  
  const amount = parseFloat(formData.get("amount") as string);
  
  await db.insert(subTable).values({
    name: formData.get("name") as string,
    amount: amount,
    accountId: parseInt(formData.get("accountId") as string),    // <-- parseInt()
    categoryId: parseInt(formData.get("categoryId") as string),  // <-- parseInt()
    interval: formData.get("interval") as string || 'monthly',
    startDate: new Date(formData.get("startDate") as string || new Date()),
    userId: session.user.id,
  });

  revalidatePath("/");
}

export async function addSplit(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  
  const accountId = parseInt(formData.get("accountId") as string);  // <-- schon parseInt()
  const date = new Date(formData.get("date") as string || new Date());
  const description = formData.get("description") as string;

  const splitDataRaw = formData.get("splits") as string;
  const splits = JSON.parse(splitDataRaw) as Array<{ categoryId: number, amount: number }>;

  const transactionsToInsert = splits.map(s => ({
    accountId,           // <-- ist schon number
    categoryId: s.categoryId,  // <-- ist schon number
    description: `${description} (Teilbetrag)`,
    amount: s.amount,
    type: s.amount < 0 ? 'expense' : 'income' as 'expense' | 'income',
    date: date,
    userId: session.user.id,  // <-- HINZUGEFÜGT!
  }));

  if (transactionsToInsert.length > 0) {
    await db.insert(transactions).values(transactionsToInsert);
  }

  revalidatePath("/");
}
