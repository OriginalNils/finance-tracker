// components/add-entry-form.tsx
'use client'

import { addSubscription } from "@/app/actions";
import { useState } from "react";
import { X } from "lucide-react";

export function AddSubscriptionForm() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-4 rounded-[30px] border-2 border-dashed border-zinc-800 text-muted-foreground font-black uppercase text-[10px] tracking-widest hover:border-primary hover:text-primary transition-all"
      >
        + Abo hinzufügen
      </button>
    );
  }

  return (
    <div className="bg-zinc-900/50 p-6 rounded-[32px] border border-border animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest">Neues Abo</h3>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-primary">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form action={async (formData) => {
        await addSubscription(formData);
        setIsOpen(false);
      }} className="space-y-4">
        <input name="name" placeholder="Name (z.B. Disney+)" required className="w-full bg-background border border-border rounded-xl p-3 text-sm outline-none focus:border-primary text-foreground" />
        <input name="amount" type="number" step="0.01" placeholder="Betrag (z.B. 8.99)" required className="w-full bg-background border border-border rounded-xl p-3 text-sm outline-none focus:border-primary text-foreground" />
        <input name="dueDate" placeholder="Fällig (z.B. Monatlich)" required className="w-full bg-background border border-border rounded-xl p-3 text-sm outline-none focus:border-primary text-foreground" />
        <input name="icon" placeholder="Emoji (z.B. 🍿)" className="w-full bg-background border border-border rounded-xl p-3 text-sm outline-none focus:border-primary text-foreground" />
        <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity">
          Speichern
        </button>
      </form>
    </div>
  );
}