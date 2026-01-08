// components/ledger-filters.tsx
'use client'

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Calendar, CreditCard, LayoutGrid } from "lucide-react";

export function LedgerFilters({ accounts, categories }: { accounts: any[], categories: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Zurück auf Seite 1 bei Filteränderung
    params.set('page', '1'); 
    
    // Navigation ohne nach oben zu springen
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 px-2">
      
      {/* --- DAS SUCHFELD (Hier ist die Suche) --- */}
      <div className="flex-1 min-w-[280px] relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
        <input 
          type="text"
          placeholder="Buchungen oder Empfänger suchen..."
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => updateFilter('q', e.target.value)}
          className="w-full bg-card border border-border/40 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-foreground placeholder:text-muted-foreground/50"
        />
      </div>

      {/* DATUMS-FILTER */}
      <div className="flex items-center gap-3 bg-card border border-border/40 rounded-2xl px-4 py-2.5 shadow-sm">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground/30" />
        <input 
          type="date" 
          value={searchParams.get('from') || ''} 
          onChange={(e) => updateFilter('from', e.target.value)}
          className="bg-transparent text-[10px] font-black uppercase outline-none text-foreground cursor-pointer"
        />
        <span className="opacity-20 text-[10px] font-black">→</span>
        <input 
          type="date" 
          value={searchParams.get('to') || ''} 
          onChange={(e) => updateFilter('to', e.target.value)}
          className="bg-transparent text-[10px] font-black uppercase outline-none text-foreground cursor-pointer"
        />
      </div>

      {/* KONTEN-FILTER */}
      <div className="relative">
        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" />
        <select 
          value={searchParams.get('acc') || ''} 
          onChange={(e) => updateFilter('acc', e.target.value)}
          className="bg-card border border-border/40 rounded-2xl pl-9 pr-4 py-2.5 text-[10px] font-black uppercase outline-none appearance-none cursor-pointer"
        >
          <option value="">Alle Konten</option>
          {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
        </select>
      </div>

      {/* KATEGORIEN-FILTER */}
      <div className="relative">
        <LayoutGrid className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" />
        <select 
          value={searchParams.get('cat') || ''} 
          onChange={(e) => updateFilter('cat', e.target.value)}
          className="bg-card border border-border/40 rounded-2xl pl-9 pr-4 py-2.5 text-[10px] font-black uppercase outline-none appearance-none cursor-pointer"
        >
          <option value="">Alle Kategorien</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
        </select>
      </div>

      {/* LIMIT */}
      <select 
        value={searchParams.get('limit') || '10'} 
        onChange={(e) => updateFilter('limit', e.target.value)}
        className="bg-zinc-900/50 border border-border/20 rounded-2xl px-4 py-2.5 text-[10px] font-black uppercase outline-none cursor-pointer"
      >
        <option value="10">10 / Seite</option>
        <option value="25">25 / Seite</option>
        <option value="50">50 / Seite</option>
      </select>
    </div>
  );
}