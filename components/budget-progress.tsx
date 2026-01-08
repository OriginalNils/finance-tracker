// components/budget-progress.tsx
import { Progress } from "@/components/ui/progress";

interface BudgetItem {
  category: string;
  limitAmount: number;
  currentAmount: number;
}

export function BudgetProgress({ budgets }: { budgets: BudgetItem[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xs font-black uppercase tracking-widest opacity-50">Budget-Kontrolle</h2>
      </div>
      
      <div className="grid gap-4">
        {budgets.map((budget) => {
          const percent = Math.min(Math.round((budget.currentAmount / budget.limitAmount) * 100), 100);
          const isOver = budget.currentAmount > budget.limitAmount;

          return (
            <div key={budget.category} className="bg-card p-5 rounded-[24px] border border-border/50 shadow-sm">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{budget.category}</p>
                  <p className="text-lg font-black italic">{budget.currentAmount.toFixed(2)} €</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Limit: {budget.limitAmount} €</p>
                  <p className={`text-xs font-black ${isOver ? 'text-rose-500' : 'text-primary'}`}>{percent}%</p>
                </div>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${isOver ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-primary'}`} 
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
        {budgets.length === 0 && (
          <p className="text-center text-[10px] font-bold text-muted-foreground uppercase p-8 border-2 border-dashed border-muted rounded-[24px]">
            Keine Budgets definiert
          </p>
        )}
      </div>
    </div>
  );
}