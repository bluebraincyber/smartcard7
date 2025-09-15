import type { LedgerSummary } from "@/types/finance";
import { fmtBRL } from "@/lib/format";

export default function LedgerSummaryCards({ loading, data }: { loading: boolean; data?: LedgerSummary | null }) {
  const cards = [
    { key: "opening", label: "Saldo inicial" },
    { key: "inflow", label: "Entradas" },
    { key: "outflow", label: "Saídas" },
    { key: "result", label: "Resultado" },
    { key: "closing", label: "Saldo atual" },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((c) => (
        <div key={c.key} className="rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="text-sm text-zinc-600">{c.label}</div>
          {loading || !data ? (
            <div className="mt-2 h-6 w-28 animate-pulse rounded bg-zinc-200" />
          ) : (
            <div
              className={
                "mt-1 text-2xl font-semibold " +
                (c.key === "inflow"
                  ? "text-green-700"
                  : c.key === "outflow"
                  ? "text-red-700"
                  : "")
              }
            >
              {fmtBRL(data[c.key])}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
