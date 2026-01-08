// components/add-budget-dialog.tsx
'use client'

import { useState } from "react";
import { upsertBudget } from "@/app/actions";
import { Plus, X, Target } from "lucide-react";

export function AddBudgetDialog({ categories }: { categories: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="w-full py-4 rounded-[24px] border-2 border-dashed border-zinc-800 text-muted-foreground font-black uppercase text-[10px] tracking-widest hover:border-primary transition-all mt-4">+ Limit festlegen</button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[999] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-sm rounded-[40px] border border-border shadow-2xl p-10 animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black italic uppercase tracking-tighter">Budget-Limit</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 bg-muted rounded-full"><X className="h-4 w-4" /></button>
        </div>

        <form action={async (fd) => { await upsertBudget(fd); setIsOpen(false); }} className="space-y-6">
          <div className="space-y-4">
            <select name="categoryId" required className="w-full bg-muted/20 border-none rounded-2xl p-4 text-sm font-bold text-foreground outline-none">
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <input name="limitAmount" type="number" step="0.01" placeholder="Monatliches Limit (€)" required className="w-full bg-muted/20 border-none rounded-2xl p-4 text-sm font-black outline-none tabular-nums text-foreground" />
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground font-black py-5 rounded-[22px] uppercase tracking-[0.3em] text-[10px]">Budget Aktivieren</button>
        </form>
      </div>
    </div>
  );
}