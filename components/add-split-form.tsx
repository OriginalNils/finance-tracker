// components/add-split-form.tsx
'use client'

import { addSplit } from "@/app/actions";
import { useState } from "react";
import { X } from "lucide-react";

export function AddSplitForm() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-4 rounded-[30px] border-2 border-dashed border-zinc-800 text-muted-foreground font-black uppercase text-[10px] tracking-widest hover:border-primary hover:text-primary transition-all mt-4"
      >
        + Neuer Split
      </button>
    );
  }

  return (
    <div className="bg-zinc-900/50 p-6 rounded-[32px] border border-border mt-4 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">Split hinzufügen</h3>
        <button onClick={() => setIsOpen(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
      </div>
      <form action={async (formData) => {
        await addSplit(formData);
        setIsOpen(false);
      }} className="space-y-4">
        <input name="title" placeholder="Was? (z.B. Pizza)" required className="w-full bg-background border border-border rounded-xl p-3 text-sm outline-none focus:border-primary" />
        <input name="amount" type="number" step="0.01" placeholder="Betrag" required className="w-full bg-background border border-border rounded-xl p-3 text-sm outline-none focus:border-primary" />
        <input name="user" placeholder="Wer? (z.B. Nils)" required className="w-full bg-background border border-border rounded-xl p-3 text-sm outline-none focus:border-primary" />
        <select name="icon" className="w-full bg-background border border-border rounded-xl p-3 text-sm outline-none focus:border-primary text-muted-foreground">
          <option value="🍴">Essen 🍴</option>
          <option value="🚗">Fahrt 🚗</option>
          <option value="✈️">Reise ✈️</option>
          <option value="🍻">Party 🍻</option>
        </select>
        <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl text-sm hover:opacity-90">
          Hinzufügen
        </button>
      </form>
    </div>
  );
}