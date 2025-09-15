"use client";
import { useEffect, useState } from "react";
import LedgerFiltersBar, { Filters } from "./LedgerFiltersBar";
import LedgerSummaryCards from "./LedgerSummaryCards";
import LedgerTable from "./LedgerTable";
import EntryDrawer from "./EntryDrawer";
import type { LedgerEntry, LedgerSummary } from "@/types/finance";

export default function LedgerPageClient() {
  const [filters, setFilters] = useState<Filters>({
    from: todayOffset(-30),
    to: todayOffset(0),
    q: "",
    storeId: undefined,
  });

  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState<LedgerSummary>({
    opening: 0,
    inflow: 0,
    outflow: 0,
    result: 0,
    closing: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<"IN" | "OUT">("IN");
  const [editing, setEditing] = useState<LedgerEntry | null>(null);

  // Fetch entries
  useEffect(() => {
    let alive = true;
    setError(null);
    setIsLoading(true);
    
    const fetchData = async () => {
      try {
        const url = new URL("/api/finance/entries", location.origin);
        url.searchParams.set("from", filters.from);
        url.searchParams.set("to", filters.to);
        if (filters.q) url.searchParams.set("q", filters.q);
        if (filters.storeId) url.searchParams.set("storeId", filters.storeId);

        const response = await fetch(url.toString(), { cache: "no-store" });
        if (!response.ok) throw new Error("Falha ao carregar lançamentos");
        
        const data = await response.json();
        if (!alive) return;
        
        setEntries(Array.isArray(data) ? data : data?.entries || []);
      } catch (e) {
        if (alive) {
          setError(e instanceof Error ? e.message : String(e));
          setEntries([]);
        }
      } finally {
        if (alive) setIsLoading(false);
      }
    };

    fetchData();
    return () => { alive = false; };
  }, [filters.from, filters.to, filters.q, filters.storeId]);

  // Fetch summary
  useEffect(() => {
    let alive = true;
    
    const fetchSummary = async () => {
      try {
        const url = new URL("/api/finance/summary", location.origin);
        url.searchParams.set("from", filters.from);
        url.searchParams.set("to", filters.to);
        if (filters.storeId) url.searchParams.set("storeId", filters.storeId);

        const response = await fetch(url.toString(), { next: { revalidate: 60 } as any });
        if (!response.ok) throw new Error("Falha ao carregar resumo");
        
        const data = await response.json();
        if (alive) {
          setSummary({
            opening: data.opening || 0,
            inflow: data.inflow || 0,
            outflow: data.outflow || 0,
            result: data.result || 0,
            closing: data.closing || 0
          });
        }
      } catch (e) {
        if (alive) {
          setError(e instanceof Error ? e.message : String(e));
        }
      }
    };

    fetchSummary();
    return () => { alive = false; };
  }, [filters.from, filters.to, filters.storeId]);

  function onNew(type: "IN" | "OUT") {
    setEditing(null);
    setDrawerType(type);
    setDrawerOpen(true);
  }

  function onEdit(entry: LedgerEntry) {
    setEditing(entry);
    setDrawerType(entry.type);
    setDrawerOpen(true);
  }

  async function onDelete(entry: LedgerEntry) {
    const ok = confirm(`Excluir lançamento "${entry.title}"?`);
    if (!ok) return;
    // Otimista
    const prev = entries ?? [];
    setEntries(prev.filter((e) => e.id !== entry.id));
    try {
      const res = await fetch(`/api/finance/entries/${entry.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir");
    } catch (e) {
      alert("Erro ao excluir. Revertendo.");
      setEntries(prev);
    }
  }

  async function onSave(data: Partial<LedgerEntry> & { type: "IN" | "OUT" }) {
    // Criação/edição otimista
    const isEdit = Boolean(editing);
    const body = JSON.stringify({ ...editing, ...data });
    const method = isEdit ? "PATCH" : "POST";
    const url = isEdit ? `/api/finance/entries/${editing!.id}` : "/api/finance/entries";

    // Otimista
    const prev = entries ?? [];
    if (!isEdit) {
      const temp: LedgerEntry = {
        id: `tmp-${Date.now()}`,
        storeId: data.storeId ?? filters.storeId ?? "default",
        type: data.type,
        title: data.title ?? "",
        amount: data.amount ?? 0,
        category: data.category,
        method: data.method,
        date: data.date ?? new Date().toISOString().slice(0, 10),
        note: data.note,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setEntries([temp, ...prev]);
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok) throw new Error("Falha ao salvar");
    } catch (e) {
      alert("Erro ao salvar. Atualize a página.");
      setEntries(prev);
    } finally {
      setDrawerOpen(false);
      setEditing(null);
      // Recarrega para refletir saldo preciso
      setFilters({ ...filters });
    }
  }

  function onExport() {
    try {
      const headers = ["Data", "Título", "Tipo", "Categoria", "Forma", "Valor (R$)"];
      const rows = entries.map((e) => [
        e.date,
        e.title,
        e.type === 'IN' ? 'Entrada' : 'Saída',
        e.category || '',
        e.method || '',
        (e.amount / 100).toFixed(2).replace('.', ',')
      ]);
      
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');
      
      // Create and trigger download
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `financeiro_${filters.from}_a_${filters.to}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      setError('Falha ao exportar os dados. Tente novamente.');
    }
  }

  const loading = isLoading;

  return (
    <div className="flex flex-col gap-6">
      <LedgerFiltersBar
        value={filters}
        onChange={setFilters}
        onNewIncome={() => onNew("IN")}
        onNewExpense={() => onNew("OUT")}
        onExport={onExport}
      />

      <LedgerSummaryCards loading={loading} data={summary ?? undefined} />

      <LedgerTable
        loading={entries === null}
        rows={entries ?? []}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <EntryDrawer
        open={drawerOpen}
        type={drawerType}
        initial={editing ?? undefined}
        onClose={() => setDrawerOpen(false)}
        onSave={onSave}
      />

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error} <button className="underline" onClick={() => setFilters({ ...filters })}>Tentar novamente</button>
        </div>
      )}
    </div>
  );
}

function todayOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
