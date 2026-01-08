// components/edit-transaction-dialog.tsx
'use client'

import { useState } from "react";
import { updateTransaction } from "@/app/actions";
import { X, Pencil, CreditCard, User, Hash, Calendar } from "lucide-react";

export function EditTransactionDialog({ t, accounts, categories }: { t: any, accounts: any[], categories: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-muted-foreground/20 hover:text-primary hover:bg-primary/10 rounded-lg transition-all active:scale-90"
      >
        <Pencil className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/98 backdrop-blur-3xl z-[10000] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-xl rounded-[40px] border border-border/50 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-border/10 shrink-0">
          <div className="space-y-1">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Buchung Bearbeiten</h2>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.3em]">ID: {t.id.slice(0,8)}...</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-3 bg-muted rounded-full hover:bg-zinc-800 transition-colors"><X className="h-5 w-5" /></button>
        </div>

        {/* Scrollable Form */}
        <div className="overflow-y-auto p-8 flex-1" style={{ scrollbarWidth: 'none' }}>
          <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>

          <form action={async (fd) => { await updateTransaction(t.id, fd); setIsOpen(false); }} className="space-y-8 pb-4">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground px-1">Betrag (€)</label>
                <input name="amount" type="number" step="0.01" defaultValue={Math.abs(t.amount)} required className="w-full bg-muted/20 border-none rounded-2xl p-5 text-xl font-black outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground px-1">Typ</label>
                <select name="type" defaultValue={t.type} className="w-full h-[68px] bg-muted/40 border-none rounded-2xl px-4 text-[10px] font-black uppercase outline-none cursor-pointer">
                  <option value="expense">Ausgabe ↘</option>
                  <option value="income">Einnahme ↗</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground px-1">Beschreibung</label>
                <input name="description" defaultValue={t.description} required className="w-full bg-muted/20 border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground px-1">Datum</label>
                <input name="date" type="date" defaultValue={new Date(t.date).toISOString().split('T')[0]} className="w-full bg-muted/20 border-none rounded-2xl p-5 text-sm font-bold outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground px-1">Konto</label>
                <select name="accountId" defaultValue={t.accountId} required className="w-full bg-muted/20 border-none rounded-2xl p-5 text-sm font-bold outline-none appearance-none">
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground px-1">Kategorie</label>
                <select name="categoryId" defaultValue={t.categoryId} required className="w-full bg-muted/20 border-none rounded-2xl p-5 text-sm font-bold outline-none appearance-none">
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                </select>
              </div>
            </div>

            <div className="border-t border-border/20 pt-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-muted-foreground px-1">Empfänger</label>
                  <input name="receiver" defaultValue={t.receiver || ''} className="w-full bg-muted/10 border border-border/50 rounded-2xl p-4 text-sm font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-muted-foreground px-1">IBAN</label>
                  <input name="receiver_iban" defaultValue={t.receiverIban || ''} className="w-full bg-muted/10 border border-border/50 rounded-2xl p-4 text-sm font-bold outline-none uppercase" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground px-1">Zusätzliche Notizen</label>
                <textarea name="details" defaultValue={t.details || ''} rows={3} className="w-full bg-muted/10 border border-border/50 rounded-[28px] p-4 text-sm font-bold outline-none focus:border-primary resize-none" />
              </div>
            </div>

            <button type="submit" className="w-full bg-primary text-primary-foreground font-black py-6 rounded-[30px] uppercase tracking-[0.4em] text-[10px] hover:brightness-110 shadow-2xl transition-all">
              Änderungen Speichern
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}