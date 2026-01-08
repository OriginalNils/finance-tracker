// components/budget-item.tsx
'use client'

import { useState } from "react";
import { deleteBudget } from "@/app/actions";
import { Trash2, AlertTriangle, X, Check } from "lucide-react";

interface BudgetItemProps {
  id: string;
  category: string;
  limitAmount: number;
  currentAmount: number;
}

export function BudgetItem({ id, category, limitAmount, currentAmount }: BudgetItemProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const percent = Math.min(Math.round((currentAmount / limitAmount) * 100), 100);
  const isOverBudget = currentAmount > limitAmount;

  return (
    <div className="bg-card p-5 rounded-[24px] border border-border/50 shadow-sm relative group transition-all hover:border-primary/20">
      {!showConfirm ? (
        <>
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{category}</p>
              <p className="text-lg font-black italic tracking-tighter">
                {currentAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € 
                <span className="text-[10px] text-muted-foreground font-bold not-italic ml-2">/ {limitAmount} €</span>
              </p>
            </div>
            <button 
              onClick={() => setShowConfirm(true)}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-rose-500/50 hover:text-rose-500"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${isOverBudget ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-primary'}`} 
              style={{ width: `${percent}%` }} 
            />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between py-1 animate-in slide-in-from-right-2 duration-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-rose-500 animate-pulse" />
            <p className="text-[9px] font-black uppercase text-rose-500 tracking-tighter">Budget löschen?</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={async () => { await deleteBudget(id); setShowConfirm(false); }}
              className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
            >
              <Check className="h-3 w-3" />
            </button>
            <button 
              onClick={() => setShowConfirm(false)}
              className="p-2 bg-muted text-foreground rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}