// components/add-transaction-dialog.tsx
'use client'

import { useState } from "react";
import { addTransaction } from "@/app/actions";
import { X, Plus, CreditCard, User, Hash } from "lucide-react";

export function AddTransactionDialog({ accounts, categories }: { accounts: any[], categories: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 transition-all"
      >
        <Plus className="h-4 w-4" /> Neue Buchung
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/98 backdrop-blur-3xl z-[10000] flex items-center justify-center p-4 md:p-8">
      <div 
        className="bg-card w-full max-w-xl rounded-[40px] border border-border/50 shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[calc(100vh-4rem)] md:max-h-[85vh]"
      >
        
        {/* Fixierter Header */}
        <div className="flex justify-between items-center p-8 md:p-10 border-b border-border/10 shrink-0">
          <div className="space-y-1">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Transaktion</h2>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.3em]">System Operation v9.6</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-3 bg-muted rounded-full hover:bg-zinc-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollbarer Inhalt mit verstecktem Scrollbalken */}
        <div 
          className="overflow-y-auto p-8 md:p-10 flex-1"
          style={{
            scrollbarWidth: 'none',  /* Firefox */
            msOverflowStyle: 'none',  /* IE/Edge */
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none; /* Chrome, Safari, Opera */
            }
          `}</style>

          <form action={async (fd) => { await addTransaction(fd); setIsOpen(false); }} className="space-y-10 pb-4">
            
            {/* HAUPTDATEN */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[9px] font-black uppercase text-muted-foreground px-1">Betrag (€)</label>
                  <input name="amount" type="number" step="0.01" placeholder="0,00" required className="w-full bg-muted/20 border-none rounded-2xl p-5 text-xl font-black outline-none focus:ring-2 focus:ring-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-muted-foreground px-1">Typ</label>
                  <select name="type" className="w-full h-[68px] bg-muted/40 border-none rounded-2xl px-4 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer">
                    <option value="expense">Ausgabe ↘</option>
                    <option value="income">Einnahme ↗</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground px-1">Kurzbeschreibung</label>
                <input name="description" placeholder="z.B. Miete, Gehalt, Einkauf..." required className="w-full bg-muted/20 border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
            </div>

            {/* ZUORDNUNG */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground px-1">Konto wählen</label>
                <select name="accountId" required className="w-full bg-muted/20 border-none rounded-2xl p-5 text-sm font-bold outline-none cursor-pointer appearance-none">
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground px-1">Kategorie wählen</label>
                <select name="categoryId" required className="w-full bg-muted/20 border-none rounded-2xl p-5 text-sm font-bold outline-none cursor-pointer appearance-none">
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                </select>
              </div>
            </div>

            {/* ERWEITERT */}
            <div className="border-t border-border/20 pt-8 space-y-6">
              <div className="flex items-center gap-2 opacity-30">
                <Hash className="h-3 w-3" />
                <p className="text-[8px] font-black uppercase tracking-[0.3em]">Erweiterte Details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-muted-foreground px-1">Empfänger</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                    <input name="receiver" placeholder="Name" className="w-full bg-muted/10 border border-border/50 rounded-2xl p-4 pl-12 text-sm font-bold outline-none focus:border-primary transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-muted-foreground px-1">IBAN</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                    <input name="receiver_iban" placeholder="DE..." className="w-full bg-muted/10 border border-border/50 rounded-2xl p-4 pl-12 text-sm font-bold outline-none uppercase focus:border-primary transition-all" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground px-1">Zusätzliche Notizen</label>
                <textarea name="details" rows={3} placeholder="..." className="w-full bg-muted/10 border border-border/50 rounded-[28px] p-4 text-sm font-bold outline-none focus:border-primary resize-none" />
              </div>
            </div>

            <button type="submit" className="w-full bg-primary text-primary-foreground font-black py-6 rounded-[30px] uppercase tracking-[0.4em] text-[10px] hover:brightness-110 shadow-2xl shadow-primary/20 transition-all">
              Buchung validieren
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}