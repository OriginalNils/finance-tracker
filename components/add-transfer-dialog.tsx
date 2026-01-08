// components/add-transfer-dialog.tsx
'use client'

import { useState } from "react";
import { addTransfer } from "@/app/actions";
import { MoveRight, X, RefreshCw } from "lucide-react";

export function AddTransferDialog({ accounts }: { accounts: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="bg-muted/50 text-foreground px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-muted transition-all">
        <RefreshCw className="h-4 w-4"/> Umbuchung
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-[40px] border border-border shadow-2xl p-10 animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black italic uppercase tracking-tighter">Umbuchung</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 bg-muted rounded-full"><X className="h-4 w-4" /></button>
        </div>

        <form action={async (fd) => { await addTransfer(fd); setIsOpen(false); }} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1">Von Konto</label>
              <select name="fromAccountId" required className="w-full bg-muted/20 border-none rounded-2xl p-4 text-sm font-bold outline-none">
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>
            </div>
            <div className="flex justify-center py-1 opacity-30"><MoveRight /></div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1">Nach Konto</label>
              <select name="toAccountId" required className="w-full bg-muted/20 border-none rounded-2xl p-4 text-sm font-bold outline-none">
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border/50">
            <input name="amount" type="number" step="0.01" placeholder="Betrag (€)" required className="w-full bg-muted/20 border-none rounded-2xl p-4 text-sm font-black outline-none" />
            <input name="description" placeholder="Zweck (optional)" className="w-full bg-muted/20 border-none rounded-2xl p-4 text-sm font-bold outline-none" />
          </div>

          <button type="submit" className="w-full bg-primary text-primary-foreground font-black py-5 rounded-[22px] uppercase tracking-[0.3em] text-[10px]">Transfer ausführen</button>
        </form>
      </div>
    </div>
  );
}