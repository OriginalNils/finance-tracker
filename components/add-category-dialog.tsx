// components/add-category-dialog.tsx
'use client'

import { useState } from "react";
import { addCategory, deleteCategory } from "@/app/actions";
import { 
  X, FolderPlus, Trash2, LayoutGrid, PlusCircle, 
  AlertTriangle, Check, ChevronRight 
} from "lucide-react";

// Hilfskomponente für die einzelnen Kategorien in der Liste
function CategoryListItem({ cat, allCategories }: { cat: any, allCategories: any[] }) {
  const [showConfirm, setShowConfirm] = useState(false);

  // Finde alle Unterkategorien, die mitgelöscht würden
  const subCategories = allCategories.filter(c => c.parentId === cat.id);
  const hasSubs = subCategories.length > 0;

  return (
    <div className="bg-muted/10 rounded-2xl border border-transparent hover:border-border/40 transition-all overflow-hidden">
      {!showConfirm ? (
        <div className="flex justify-between items-center p-4 group">
          <div className="flex items-center gap-3">
            <span className="text-xl">{cat.icon}</span>
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-tight text-foreground">{cat.name}</span>
              {cat.parentId && (
                <div className="flex items-center gap-1 opacity-50">
                  <ChevronRight className="h-2 w-2 text-primary" />
                  <span className="text-[7px] font-black text-primary uppercase tracking-widest">Sub-Kategorie</span>
                </div>
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
        <div className="p-4 bg-rose-500/10 animate-in slide-in-from-right-2 duration-200">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase text-rose-500 tracking-tighter leading-tight">
                  Kategorie entfernen?
                </p>
                {hasSubs && (
                  <p className="text-[7px] font-bold text-rose-400 uppercase leading-tight">
                    Achtung: {subCategories.length} Unterkategorien ({subCategories.map(s => s.name).join(", ")}) werden ebenfalls gelöscht!
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

export function AddCategoryDialog({ categories }: { categories: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted/50 rounded-2xl transition-all border border-transparent hover:border-border/30"
      >
        <FolderPlus className="h-4 w-4"/> Kategorie-Editor
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/98 backdrop-blur-3xl z-[10000] flex items-center justify-center p-4 md:p-8">
      <div className="bg-card w-full max-w-5xl rounded-[40px] border border-border/50 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-8 md:p-10 border-b border-border/10 shrink-0">
          <div className="space-y-1">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Taxonomie</h2>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Kategorien Management v9.7</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-3 bg-muted rounded-full hover:bg-zinc-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollbarer Content ohne sichtbare Scrollbar */}
        <div 
          className="overflow-y-auto p-8 md:p-10 flex-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>

          <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
            
            {/* LINKS: Erstellen */}
            <div className="flex-1 space-y-8">
              <div className="flex items-center gap-3 opacity-30">
                <PlusCircle className="h-4 w-4" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Kategorie Hinzufügen</h3>
              </div>
              
              <form action={async (fd) => { await addCategory(fd); }} className="space-y-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-muted-foreground px-1">Bezeichnung</label>
                    <input name="name" placeholder="z.B. Streaming" required className="w-full bg-muted/20 border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-muted-foreground px-1">Struktur-Ebene</label>
                    <select name="parentId" className="w-full bg-muted/20 border-none rounded-2xl p-5 text-sm font-bold outline-none cursor-pointer appearance-none">
                      <option value="">-- Neue Hauptkategorie --</option>
                      {categories.filter(c => !c.parentId).map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-muted-foreground text-center block">Icon</label>
                    <input name="icon" defaultValue="📁" className="w-full bg-muted/20 border-none rounded-2xl p-4 text-2xl text-center outline-none" />
                  </div>
                </div>
                
                <button type="submit" className="w-full bg-primary text-primary-foreground font-black py-5 rounded-[24px] uppercase tracking-[0.3em] text-[10px] hover:brightness-110 shadow-xl shadow-primary/10 transition-all">
                  In System integrieren
                </button>
              </form>
            </div>

            {/* RECHTS: Verwalten */}
            <div className="flex-1 space-y-8 border-t md:border-t-0 md:border-l border-border/10 pt-12 md:pt-0 md:pl-12 lg:pl-20">
              <div className="flex items-center gap-3 opacity-30">
                <LayoutGrid className="h-4 w-4" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Struktur Verwalten</h3>
              </div>

              <div className="grid grid-cols-1 gap-3 pb-10">
                {categories.length === 0 ? (
                  <div className="py-20 text-center opacity-20">
                    <p className="text-[10px] font-black uppercase">Keine Daten</p>
                  </div>
                ) : (
                  categories.map(cat => (
                    <CategoryListItem 
                      key={cat.id} 
                      cat={cat} 
                      allCategories={categories} 
                    />
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}