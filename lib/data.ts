// lib/data.ts
import { CreditCard, Wallet, Plane, Car, Coffee, Utensils } from "lucide-react";

export const USER_STATS = {
  safeToSpend: 2821.00,
  totalBudget: 5200.00,
  spent: 2379.00,
  paydayInDays: 11,
  income: 7542.00,
};

export const SUBSCRIPTIONS = [
  { id: "1", name: "Apple One", amount: 19.95, category: "Entertainment", dueDate: "Heute", icon: "🍎", color: "text-rose-500" },
  { id: "2", name: "Netflix", amount: 15.49, category: "Entertainment", dueDate: "Morgen", icon: "🎬", color: "text-rose-500" },
  { id: "3", name: "Fitness", amount: 45.00, category: "Gesundheit", dueDate: "in 4 Tagen", icon: "💪", color: "text-emerald-500" },
];

export const SPLITS = [
  { id: "1", title: "Flug Berlin", amount: 500.00, date: "Jan 5, 2026", user: "Du", icon: Plane, color: "bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300" },
  { id: "2", title: "Uber", amount: 60.00, date: "Jan 5, 2026", user: "Nils", icon: Car, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300" },
  { id: "3", title: "Coffee", amount: 35.00, date: "Jan 5, 2026", user: "Du", icon: Coffee, color: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" },
  { id: "4", title: "Abendessen", amount: 150.00, date: "Jan 5, 2026", user: "Du", icon: Utensils, color: "bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300" },
];