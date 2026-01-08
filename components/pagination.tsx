// components/pagination.tsx
'use client'

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ currentPage, totalPages }: { currentPage: number, totalPages: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    
    // FIX: scroll: false hinzugefügt
    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <button 
        disabled={currentPage <= 1}
        onClick={() => setPage(currentPage - 1)}
        className="p-2 bg-muted rounded-xl disabled:opacity-20 hover:bg-zinc-800 transition-all"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      
      <div className="flex gap-1">
        {[...Array(totalPages)].map((_, i) => {
          const p = i + 1;
          // Nur aktuelle Seite, erste, letzte und Nachbarn anzeigen (bei vielen Seiten)
          if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all ${currentPage === p ? 'bg-primary text-primary-foreground' : 'bg-muted/30 hover:bg-muted text-muted-foreground'}`}
              >
                {p}
              </button>
            );
          }
          if (p === currentPage - 2 || p === currentPage + 2) return <span key={p} className="opacity-20">.</span>;
          return null;
        })}
      </div>

      <button 
        disabled={currentPage >= totalPages}
        onClick={() => setPage(currentPage + 1)}
        className="p-2 bg-muted rounded-xl disabled:opacity-20 hover:bg-zinc-800 transition-all"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}