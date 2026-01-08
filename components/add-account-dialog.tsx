// components/add-account-dialog.tsx
'use client'

import { useState } from "react";
import { addAccount } from "@/app/actions";
import { X, Plus, Landmark, PiggyBank } from "lucide-react";

export function AddAccountDialog() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex flex-col items-center justify-center gap-4 p-8 rounded-[32px] border-2 border-dashed border-border/40 hover:border-primary/50 hover:bg-primary/5 transition-all group"
      >
        <div className="p-4 bg-muted rounded-full group-hover:scale-110 transition-transform">
          <Plus className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Konto hinzufügen</p>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/98 backdrop-blur-3xl z-[10000] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-[40px] border border-border/50 shadow-2xl p-10 animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Neues Konto</h2>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Finanzquelle registrieren</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-3 bg-muted rounded-full hover:bg-zinc-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={async (fd) => { await addAccount(fd); setIsOpen(false); }} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-muted-foreground px-1">Name des Kontos</label>
              <div className="relative">
                <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <input 
                  name="name" 
                  placeholder="z.B. Girokonto, Krypto-Wallet" 
                  required 
                  className="w-full bg-muted/20 border-none rounded-2xl p-5 pl-12 text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-muted-foreground px-1">Aktueller Kontostand (Startguthaben)</label>
              <div className="relative">
                <PiggyBank className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                <input 
                  name="initialBalance" 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00 €" 
                  className="w-full bg-primary/5 border border-primary/10 rounded-2xl p-5 pl-12 text-xl font-black text-primary outline-none focus:ring-2 focus:ring-primary transition-all" 
                />
              </div>
              <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-tight px-1 italic">
                * Erstellt automatisch eine Ausgleichsbuchung im Ledger.
              </p>
            </div>
          </div>

          <button type="submit" className="w-full bg-primary text-primary-foreground font-black py-6 rounded-[28px] uppercase tracking-[0.4em] text-[10px] hover:brightness-110 shadow-xl shadow-primary/20 transition-all">
            Konto eröffnen
          </button>
        </form>
      </div>
    </div>
  );
}