// components/import-dialog.tsx
'use client'

import { useState } from "react";
import { importTransactions } from "@/app/actions";
import { 
  Upload, X, FileText, ArrowRight, Table as TableIcon, 
  Calendar, User, CreditCard, Info, PlusCircle, Split, Settings2 
} from "lucide-react";

export function ImportDialog({ accounts, categories }: { accounts: any[], categories: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'upload' | 'mapping'>('upload');
  const [csvData, setCsvData] = useState<{ headers: string[], rows: string[][] }>({ headers: [], rows: [] });
  
  // Konfiguration
  const [amountMode, setAmountMode] = useState<'single' | 'split'>('single');
  const [decimalSeparator, setDecimalSeparator] = useState<',' | '.'>(',');
  
  // Spalten-Indizes (-1 bedeutet nicht zugewiesen)
  const [mapping, setMapping] = useState<Record<string, number>>({ 
    date: -1, description: -1, amount: -1, credit: -1, debit: -1, 
    receiver: -1, receiver_iban: -1, details: -1 
  });
  
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // CSV einlesen
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter(l => l.trim() !== "");
      if (lines.length === 0) return;

      // Trenner-Erkennung
      const delimiter = lines[0].includes(';') ? ';' : ',';
      const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map(line => line.split(delimiter).map(c => c.trim().replace(/"/g, '')));
      
      setCsvData({ headers, rows });
      setStep('mapping');
    };
    reader.readAsText(file);
  };

  // Zahlen-Parser basierend auf gewählter Logik
  const parseAmount = (val: string | undefined) => {
    if (!val) return 0;
    let clean = val.trim();
    
    if (decimalSeparator === ',') {
      // DE: 1.250,50 -> 1250.50
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
      // US: 1,250.50 -> 1250.50
      clean = clean.replace(/,/g, '');
    }
    
    const parsed = parseFloat(clean.replace(/[^-0-9.]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  const startImport = async () => {
    if (!selectedAccountId || mapping.date === -1) return;
    setIsUploading(true);

    // Automatische Fallback-Kategorie finden
    const fallbackCat = categories.find(c => c.name.toLowerCase().includes('import')) || categories[0];

    const transactionsToImport = csvData.rows.map(row => {
      let finalAmount = 0;
      if (amountMode === 'single') {
        finalAmount = parseAmount(row[mapping.amount]);
      } else {
        const credit = Math.abs(parseAmount(row[mapping.credit])); // Einbuchung
        const debit = Math.abs(parseAmount(row[mapping.debit]));   // Abbuchung
        finalAmount = credit !== 0 ? credit : -debit;
      }

      return {
        accountId: selectedAccountId,
        categoryId: fallbackCat?.id,
        description: row[mapping.description] || "CSV Import",
        receiver: mapping.receiver !== -1 ? row[mapping.receiver] : null,
        receiverIban: mapping.receiver_iban !== -1 ? row[mapping.receiver_iban] : null,
        details: mapping.details !== -1 ? row[mapping.details] : null,
        amount: finalAmount,
        date: row[mapping.date] || new Date().toISOString(),
      };
    }).filter(t => t.amount !== 0);

    await importTransactions(transactionsToImport);
    setIsUploading(false);
    setIsOpen(false);
    setStep('upload');
  };

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-muted/30 hover:bg-muted/50 text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
      <Upload className="h-4 w-4"/> Smart Import
    </button>
  );

  return (
    <div className="fixed inset-0 bg-background/98 backdrop-blur-3xl z-[10000] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-5xl rounded-[40px] border border-border/50 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-8 md:p-10 border-b border-border/10 shrink-0">
          <div className="space-y-1">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Pro-Mapper v11.5</h2>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
              {step === 'upload' ? 'Upload & Zielkonto' : 'Formatierung & Spalten-Mapping'}
            </p>
          </div>
          <button onClick={() => {setIsOpen(false); setStep('upload');}} className="p-3 bg-muted rounded-full hover:bg-zinc-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 md:p-10 overflow-y-auto flex-1" style={{ scrollbarWidth: 'none' }}>
          <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>

          {step === 'upload' ? (
            <div className="max-w-xl mx-auto space-y-10 py-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-primary tracking-widest px-1">1. Konto für Import wählen</label>
                <select 
                  value={selectedAccountId} 
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-muted/20 border-none rounded-2xl p-6 text-sm font-bold outline-none ring-1 ring-border/50"
                >
                  <option value="">Konto auswählen...</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>

              <div className="relative group border-2 border-dashed border-zinc-800 rounded-[40px] hover:border-primary/50 transition-all bg-muted/5">
                <input type="file" accept=".csv" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="p-20 flex flex-col items-center text-center">
                  <div className="p-6 bg-primary/10 rounded-full mb-6 group-hover:scale-110 transition-all"><Upload className="h-10 w-10 text-primary" /></div>
                  <h3 className="text-sm font-black uppercase tracking-widest mb-2">CSV Datei wählen</h3>
                  <p className="text-[10px] text-muted-foreground">Unterstützt alle gängigen Bank-Exporte</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              
              {/* FORMAT-EINSTELLUNGEN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-muted/10 p-8 rounded-[32px] border border-border/20">
                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                    <Split className="h-3 w-3" /> Betrags-Darstellung
                  </label>
                  <div className="flex bg-background p-1.5 rounded-2xl gap-1">
                    <button onClick={() => setAmountMode('single')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${amountMode === 'single' ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-muted/50'}`}>Eine Spalte</button>
                    <button onClick={() => setAmountMode('split')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${amountMode === 'split' ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-muted/50'}`}>Soll / Haben</button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                    <Settings2 className="h-3 w-3" /> Dezimal-Trenner
                  </label>
                  <div className="flex bg-background p-1.5 rounded-2xl gap-1">
                    <button onClick={() => setDecimalSeparator(',')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${decimalSeparator === ',' ? 'bg-zinc-800 text-foreground ring-1 ring-border' : 'text-muted-foreground hover:bg-muted/50'}`}>1.250<span className="text-primary">,</span>50</button>
                    <button onClick={() => setDecimalSeparator('.')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${decimalSeparator === '.' ? 'bg-zinc-800 text-foreground ring-1 ring-border' : 'text-muted-foreground hover:bg-muted/50'}`}>1,250<span className="text-primary">.</span>50</button>
                  </div>
                </div>
              </div>

              {/* MAPPING-FELDER */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-primary flex items-center gap-2"><Calendar className="h-3 w-3"/> Datum</label>
                  <select onChange={(e) => setMapping(p => ({...p, date: parseInt(e.target.value)}))} className="w-full bg-muted/20 rounded-xl p-3 text-[10px] font-bold">
                    <option value="-1">Wählen...</option>
                    {csvData.headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-primary flex items-center gap-2"><FileText className="h-3 w-3"/> Beschreibung</label>
                  <select onChange={(e) => setMapping(p => ({...p, description: parseInt(e.target.value)}))} className="w-full bg-muted/20 rounded-xl p-3 text-[10px] font-bold">
                    <option value="-1">Wählen...</option>
                    {csvData.headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                  </select>
                </div>

                {amountMode === 'single' ? (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-primary flex items-center gap-2"><ArrowRight className="h-3 w-3"/> Betrag</label>
                    <select onChange={(e) => setMapping(p => ({...p, amount: parseInt(e.target.value)}))} className="w-full bg-muted/20 rounded-xl p-3 text-[10px] font-bold">
                      <option value="-1">Wählen...</option>
                      {csvData.headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-emerald-500">Einbuchung (+)</label>
                      <select onChange={(e) => setMapping(p => ({...p, credit: parseInt(e.target.value)}))} className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-[10px] font-bold">
                        <option value="-1">Wählen...</option>
                        {csvData.headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-rose-500">Abbuchung (-)</label>
                      <select onChange={(e) => setMapping(p => ({...p, debit: parseInt(e.target.value)}))} className="w-full bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 text-[10px] font-bold">
                        <option value="-1">Wählen...</option>
                        {csvData.headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* DETAIL-MAPPING */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-2 opacity-30"><Info className="h-3 w-3"/><p className="text-[8px] font-black uppercase tracking-widest">Optionales Matching</p></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-muted-foreground flex items-center gap-2"><User className="h-3 w-3"/> Empfänger</label>
                    <select onChange={(e) => setMapping(p => ({...p, receiver: parseInt(e.target.value)}))} className="w-full bg-muted/10 rounded-xl p-3 text-[10px] font-bold">
                      <option value="-1">Nicht zuweisen</option>
                      {csvData.headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-muted-foreground flex items-center gap-2"><CreditCard className="h-3 w-3"/> IBAN</label>
                    <select onChange={(e) => setMapping(p => ({...p, receiver_iban: parseInt(e.target.value)}))} className="w-full bg-muted/10 rounded-xl p-3 text-[10px] font-bold">
                      <option value="-1">Nicht zuweisen</option>
                      {csvData.headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-muted-foreground flex items-center gap-2"><TableIcon className="h-3 w-3"/> Notizen</label>
                    <select onChange={(e) => setMapping(p => ({...p, details: parseInt(e.target.value)}))} className="w-full bg-muted/10 rounded-xl p-3 text-[10px] font-bold">
                      <option value="-1">Nicht zuweisen</option>
                      {csvData.headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* VORSCHAU */}
              <div className="border border-border/20 rounded-[32px] overflow-x-auto bg-muted/5">
                <table className="w-full text-[10px] text-left">
                  <thead>
                    <tr className="bg-muted/10">
                      {csvData.headers.map((h, i) => {
                        const isMapped = Object.values(mapping).includes(i);
                        return (
                          <th key={i} className={`p-4 font-black uppercase tracking-tighter whitespace-nowrap transition-all ${isMapped ? 'text-primary bg-primary/5' : 'text-muted-foreground opacity-20'}`}>
                            {h}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    {csvData.rows.slice(0, 5).map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => {
                          const isMapped = Object.values(mapping).includes(ci);
                          return (
                            <td key={ci} className={`p-4 font-medium transition-all ${isMapped ? 'bg-primary/5 font-black text-foreground' : 'opacity-10'}`}>
                              {cell}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button 
                onClick={startImport}
                disabled={isUploading || mapping.date === -1 || (amountMode === 'single' ? mapping.amount === -1 : (mapping.credit === -1 && mapping.debit === -1))}
                className="w-full bg-primary text-primary-foreground font-black py-6 rounded-[28px] uppercase tracking-[0.4em] text-[10px] hover:scale-[1.01] transition-all shadow-xl shadow-primary/20 disabled:opacity-20"
              >
                {isUploading ? "Verarbeite Import..." : "Mapping bestätigen & Importieren"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}