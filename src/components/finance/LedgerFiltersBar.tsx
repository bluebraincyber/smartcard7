"use client";
import { useId } from "react";

export type Filters = { from: string; to: string; q?: string; storeId?: string };

export default function LedgerFiltersBar({
  value,
  onChange,
  onNewIncome,
  onNewExpense,
  onExport,
}: {
  value: Filters;
  onChange: (f: Filters) => void;
  onNewIncome: () => void;
  onNewExpense: () => void;
  onExport: () => void;
}) {
  const idFrom = useId();
  const idTo = useId();

  return (
    <div className="sticky top-0 z-10 -mx-6 mb-1 bg-white/70 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={idFrom} className="text-sm text-zinc-600">
            Período
          </label>
          <input
            id={idFrom}
            type="date"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="h-10 rounded-xl border border-gray-200 px-3 text-sm"
          />
          <span className="text-zinc-400">—</span>
          <input
            id={idTo}
            type="date"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="h-10 rounded-xl border border-gray-200 px-3 text-sm"
          />
          <input
            placeholder="Buscar por título ou categoria… /"
            value={value.q ?? ""}
            onChange={(e) => onChange({ ...value, q: e.target.value })}
            className="h-10 w-64 rounded-xl border border-gray-200 px-3 text-sm focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground hover:bg-muted transition-colors"
            aria-label="Exportar CSV"
          >
            Exportar
          </button>
          <button
            onClick={onNewExpense}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground hover:bg-muted transition-colors"
            aria-label="Nova despesa"
          >
            + Despesa
          </button>
          <button
            onClick={onNewIncome}
            className="h-10 rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            aria-label="Nova receita"
          >
            + Receita
          </button>
        </div>
      </div>
    </div>
  );
}
