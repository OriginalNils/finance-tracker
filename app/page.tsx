// app/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { 
  transactions as transTable, 
  budgets as budgetTable, 
  bankAccounts as accountTable, 
  categories as catTable 
} from "@/db/schema";
import { asc, eq, and } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  Trash2, 
  PieChart as PieIcon, 
  Target, 
  User,
} from "lucide-react";

// Komponenten-Imports
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { AddTransferDialog } from "@/components/add-transfer-dialog";
import { AddCategoryDialog } from "@/components/add-category-dialog";
import { AddBudgetDialog } from "@/components/add-budget-dialog";
import { BudgetItem } from "@/components/budget-item";
import { TrendChart } from "@/components/trend-chart";
import { TimeframeToggle } from "@/components/timeframe-toggle";
import { CategoryDistribution } from "@/components/category-distribution";
import { LedgerFilters } from "@/components/ledger-filters";
import { Pagination } from "@/components/pagination";
import { ImportDialog } from "@/components/import-dialog";
import { EditTransactionDialog } from "@/components/edit-transaction-dialog";
import { SortableAccountList } from "@/components/sortable-account-list";
import { deleteTransaction } from "./actions";

export default async function FinanceCommandCenter({ 
  searchParams 
}: { 
  searchParams: Promise<{ 
    range?: string; 
    interval?: string; 
    q?: string; 
    acc?: string; 
    cat?: string;
    page?: string;
    limit?: string;
    from?: string;
    to?: string;
  }> 
}) {
  // 1. AUTHENTIFIZIERUNG PRÜFEN
  const session = await auth();
  
  // Falls keine Session existiert, sofort zum Login umleiten
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const params = await searchParams;
  
  // 2. PARAMETER INITIALISIERUNG
  const range = params.range || '7D';
  const interval = params.interval || 'day';
  const query = params.q || '';
  const filterAcc = params.acc ? parseInt(params.acc) : null;
  const filterCat = params.cat ? parseInt(params.cat) : null;
  const page = parseInt(params.page || '1');
  const limit = parseInt(params.limit || '10');
  const fromDateStr = params.from || '';
  const toDateStr = params.to || '';

  // 3. DATENABFRAGE (STRENG GEFILTERT NACH USER_ID)
  const userAccounts = await db.select()
    .from(accountTable)
    .where(eq(accountTable.userId, userId))
    .orderBy(asc(accountTable.sortOrder));

  const allCategories = await db.select().from(catTable);
  
  const rawTransactions = await db.select()
    .from(transTable)
    .where(eq(transTable.userId, userId))
    .orderBy(asc(transTable.date));

  const categoryLimits = await db.select()
    .from(budgetTable)
    .where(eq(budgetTable.userId, userId));

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 4. CHART-LOGIK (Filtert nur User-Daten)
  let startDate = new Date(today);
  if (range === '7D') startDate.setDate(today.getDate() - 6);
  else if (range === '1M') startDate.setMonth(today.getMonth() - 1);
  else if (range === '3M') startDate.setMonth(today.getMonth() - 3);
  else if (range === 'YTD') startDate = new Date(today.getFullYear(), 0, 1);
  else if (range === '1Y') startDate.setFullYear(today.getFullYear() - 1);

  let runningBalance = rawTransactions
    .filter(t => new Date(t.date) < startDate)
    .reduce((sum, t) => sum + t.amount, 0);

  let chartData: { date: string, balance: number }[] = [];
  let currentStep = new Date(startDate);

  while (currentStep <= today) {
    const stepNet = rawTransactions.filter(t => {
      const d = new Date(t.date);
      if (interval === 'day') return d.toDateString() === currentStep.toDateString();
      if (interval === 'month') return d.getMonth() === currentStep.getMonth() && d.getFullYear() === currentStep.getFullYear();
      return false;
    }).reduce((sum, t) => sum + t.amount, 0);

    runningBalance += stepNet;
    const label = interval === 'month' 
      ? currentStep.toLocaleDateString('de-DE', { month: 'short' })
      : currentStep.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });

    chartData.push({ date: label, balance: runningBalance });

    if (interval === 'day') currentStep.setDate(currentStep.getDate() + 1);
    else if (interval === 'month') currentStep.setMonth(currentStep.getMonth() + 1);
  }

  // 5. LEDGER FILTERUNG & PAGINATION
  const displayTransactions = [...rawTransactions].reverse().filter(t => {
    const mQ = !query || t.description.toLowerCase().includes(query.toLowerCase()) || (t.receiver?.toLowerCase().includes(query.toLowerCase()));
    const mA = !filterAcc || t.accountId === filterAcc;
    const mC = !filterCat || t.categoryId === filterCat;
    
    const tDate = new Date(t.date).toISOString().split('T')[0];
    const mFrom = !fromDateStr || tDate >= fromDateStr;
    const mTo = !toDateStr || tDate <= toDateStr;
    
    return mQ && mA && mC && mFrom && mTo;
  });

  const totalTransactions = displayTransactions.length;
  const totalPages = Math.ceil(totalTransactions / limit);
  const paginatedTransactions = displayTransactions.slice((page - 1) * limit, page * limit);

  // 6. SALDEN-BERECHNUNG
  const accountsWithBalance = userAccounts.map(acc => ({
    ...acc,
    balance: rawTransactions.filter(t => t.accountId === acc.id).reduce((sum, t) => sum + t.amount, 0)
  }));
  const totalBalance = accountsWithBalance.reduce((sum, a) => sum + a.balance, 0);

  // 7. ANALYTICS
  const categoryMap: Record<string, number> = {};
  rawTransactions.filter(t => new Date(t.date) >= startDate && t.amount < 0).forEach(t => {
    const cat = allCategories.find(c => c.id === t.categoryId);
    if (cat?.name !== 'Transfer') {
      const label = cat ? `${cat.icon} ${cat.name}` : "Allgemein";
      categoryMap[label] = (categoryMap[label] || 0) + Math.abs(t.amount);
    }
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  return (
    <div className="flex min-h-screen bg-background text-foreground relative">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-border p-8 flex flex-col gap-10 hidden lg:flex bg-card/10 sticky top-0 h-screen z-30">
        <div className="space-y-1">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-foreground">FF<span className="text-muted-foreground/30">.OS</span></h1>
          <p className="text-[8px] font-bold text-muted-foreground tracking-[0.4em] uppercase opacity-50">Private Terminal v11.0</p>
        </div>

        <div className="p-6 bg-primary text-primary-foreground rounded-[32px] shadow-2xl shadow-primary/20">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Total Assets</p>
          <p className="text-2xl font-black tabular-nums tracking-tighter">{totalBalance.toLocaleString('de-DE')} €</p>
        </div>

        <nav className="space-y-4 flex-1">
          <div className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest bg-muted/50 rounded-2xl border border-border/50">
            <LayoutDashboard className="h-4 w-4"/> Dashboard
          </div>
          <AddCategoryDialog categories={allCategories} />
        </nav>

        {/* USER INFO & LOGOUT */}
        <div className="pt-6 border-t border-border/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Authenticated as</p>
            <p className="text-xs font-bold text-foreground truncate">{session.user.email}</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto z-10 relative">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <header className="flex flex-col md:flex-row justify-between items-center gap-6">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-foreground">Finance Hub</h2>
            <div className="flex items-center gap-4">
               <ImportDialog accounts={userAccounts} categories={allCategories} />
               <AddTransferDialog accounts={userAccounts} />
               <AddTransactionDialog accounts={userAccounts} categories={allCategories} />
            </div>
          </header>

          {/* ACCOUNTS LIST */}
          <SortableAccountList initialAccounts={accountsWithBalance} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8 space-y-12">
              <section className="space-y-6">
                <div className="flex justify-between items-end px-2">
                   <div className="space-y-1">
                     <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic underline decoration-primary underline-offset-8">Equity Evolution</h2>
                     <p className="text-[8px] font-bold text-muted-foreground uppercase">{range} Snapshot</p>
                   </div>
                   <TimeframeToggle />
                </div>
                <Card className="bg-card border border-border/40 shadow-2xl rounded-[40px] p-8">
                  <TrendChart data={chartData} />
                </Card>
              </section>

              {/* LEDGER */}
              <section className="space-y-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 px-2 italic underline decoration-primary underline-offset-8">Operations Ledger</h2>
                <LedgerFilters accounts={userAccounts} categories={allCategories} />
                
                <div className="bg-card rounded-[40px] border border-border/40 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-border/30">
                      {paginatedTransactions.map(t => {
                        const cat = allCategories.find(c => c.id === t.categoryId);
                        const acc = userAccounts.find(a => a.id === t.accountId);
                        return (
                          <tr key={t.id} className="hover:bg-muted/10 transition-colors group">
                            <td className="p-6 text-[10px] font-black text-muted-foreground tabular-nums whitespace-nowrap align-middle">
                                {new Date(t.date).toLocaleDateString('de-DE')}
                            </td>
                            <td className="p-6 align-middle">
                               <p className="text-sm font-black tracking-tight leading-tight text-foreground">{t.description}</p>
                               <div className="flex flex-wrap items-center gap-2 mt-2">
                                 {t.receiver && (
                                   <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                                     <User className="h-2 w-2" /> {t.receiver}
                                   </div>
                                 )}
                                 <span className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest opacity-50">{acc?.name}</span>
                                 <span className="text-[8px] font-bold uppercase text-primary tracking-widest">{cat?.icon} {cat?.name}</span>
                               </div>
                            </td>
                            <td className={`p-6 text-right font-black tabular-nums text-base align-middle ${t.amount < 0 ? 'text-rose-500/80' : 'text-emerald-500/80'}`}>
                              {t.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                            </td>
                            <td className="p-6 text-center align-middle">
                              <div className="flex items-center justify-center gap-1">
                                <EditTransactionDialog t={t} accounts={userAccounts} categories={allCategories} />
                                <form action={async () => { 'use server'; await deleteTransaction(t.id); }}>
                                  <button className="p-2 text-muted-foreground/10 hover:text-rose-500 transition-all active:scale-90">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </form>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="p-8 border-t border-border/10 bg-muted/5 flex flex-col md:flex-row justify-between items-center gap-6 mt-auto">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Seite {page} von {totalPages}</p>
                    <Pagination currentPage={page} totalPages={totalPages} />
                  </div>
                </div>
              </section>
            </div>

            {/* ANALYTICS & BUDGETS */}
            <aside className="lg:col-span-4 space-y-12">
              <section className="space-y-6">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 px-2 flex items-center gap-2 text-foreground">
                  <PieIcon className="h-4 w-4" /> Category Share
                </h2>
                <Card className="bg-card border border-border/40 shadow-2xl rounded-[32px] p-6">
                  <CategoryDistribution data={categoryData} />
                </Card>
              </section>
              <section className="space-y-6">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 px-2 flex items-center gap-2 text-foreground">
                  <Target className="h-4 w-4" /> Monitoring Hub
                </h2>
                <div className="space-y-4">
                  {categoryLimits.map(limit => {
                    const currentAmount = rawTransactions
                        .filter(t => t.categoryId === limit.categoryId && t.amount < 0 && new Date(t.date).getMonth() === now.getMonth())
                        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                    return <BudgetItem key={limit.id} id={limit.id} category={allCategories.find(c => c.id === limit.categoryId)?.name || "Unbekannt"} limitAmount={limit.limitAmount} currentAmount={currentAmount} />;
                  })}
                  <AddBudgetDialog categories={allCategories} />
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}