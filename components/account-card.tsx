// components/account-card.tsx
'use client'

import { useState } from "react";
import { deleteAccount } from "@/app/actions";
import { Trash2, AlertTriangle, Check, X, CreditCard } from "lucide-react";

export function AccountCard({ acc }: { acc: any }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="relative group bg-card border border-border/40 p-8 rounded-[32px] shadow-2xl transition-all hover:border-primary/20 min-h-[160px] flex flex-col justify-between overflow-hidden">
      {!showConfirm ? (
        <>
          <div>
            <div className="flex justify-between items-start">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              {/* LÖSCH-BUTTON */}
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // WICHTIG: Stoppt Drag-and-Drop
                  setShowConfirm(true);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 text-rose-500/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-4">{acc.name}</h3>
          </div>
          <p className="text-2xl font-black tabular-nums tracking-tighter mt-2">
            {acc.balance.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
          </p>
        </>
      ) : (
        <div className="absolute inset-0 bg-rose-500/10 backdrop-blur-md p-6 flex flex-col justify-center items-center text-center animate-in fade-in duration-200">
          <AlertTriangle className="h-6 w-6 text-rose-500 mb-2" />
          <p className="text-[9px] font-black uppercase text-rose-500 tracking-widest mb-4">Konto & alle Daten löschen?</p>
          <div className="flex gap-2 w-full">
            <button 
              onClick={async (e) => {
                e.stopPropagation();
                await deleteAccount(acc.id);
              }}
              className="flex-1 bg-rose-500 text-white rounded-xl py-2 flex justify-center hover:bg-rose-600 transition-colors"
            >
              <Check className="h-4 w-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirm(false);
              }}
              className="flex-1 bg-muted text-foreground rounded-xl py-2 flex justify-center hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}