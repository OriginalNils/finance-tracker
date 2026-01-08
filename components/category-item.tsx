// components/category-item.tsx
'use client'

import { useState } from "react";
import { deleteCategory } from "@/app/actions";
import { Trash2, AlertTriangle, Check, X } from "lucide-react";

export function CategoryItem({ cat, allCategories }: { cat: any, allCategories: any[] }) {
  const [showConfirm, setShowConfirm] = useState(false);

  // Finde alle Unterkategorien, die an dieser Kategorie hängen
  const subCategories = allCategories.filter(c => c.parentId === cat.id);
  const hasSubs = subCategories.length > 0;

  return (
    <div className="bg-muted/10 rounded-2xl border border-transparent hover:border-border/50 transition-all overflow-hidden">
      {!showConfirm ? (
        <div className="flex justify-between items-center p-4 group">
          <div className="flex items-center gap-3">
            <span className="text-xl">{cat.icon}</span>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-tight text-foreground">{cat.name}</span>
              {cat.parentId && (
                <span className="text-[7px] font-black text-primary uppercase tracking-widest opacity-60">Unterkategorie</span>
              )}
            </div>
          </div>
          <button 
            onClick={() => setShowConfirm(true)}
            className="p-2 text-rose-500/20 group-hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="p-4 bg-rose-500/5 animate-in slide-in-from-right-2 duration-200">
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase text-rose-500 tracking-tighter leading-tight">
                  Wirklich löschen?
                </p>
                {hasSubs && (
                  <p className="text-[7px] font-bold text-rose-500/70 uppercase leading-tight">
                    Inkl. Unterkategorien: <br/>
                    <span className="italic">{subCategories.map(s => s.name).join(", ")}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={async () => { await deleteCategory(cat.id); setShowConfirm(false); }}
                className="flex-1 bg-rose-500 text-white rounded-xl py-2 flex justify-center hover:bg-rose-600 transition-colors"
              >
                <Check className="h-3 w-3" />
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-muted text-foreground rounded-xl py-2 flex justify-center hover:bg-zinc-800 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}