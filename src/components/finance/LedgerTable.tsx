"use client";
import { useMemo } from "react";
import type { LedgerEntry } from "@/types/finance";
import { fmtBRL } from "@/lib/format";

export default function LedgerTable({
  rows,
  loading,
  onEdit,
  onDelete,
}: {
  rows: LedgerEntry[];
  loading: boolean;
  onEdit: (e: LedgerEntry) => void;
  onDelete: (e: LedgerEntry) => void;
}) {
  const hasData = rows.length > 0;

  return (
    <div className="rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">Lançamentos</h2>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-xl bg-zinc-100" />
      ) : !hasData ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-zinc-600">
          Sem lançamentos no período. Adicione uma receita ou despesa.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-zinc-500">
              <tr>
                <th className="py-2">Data</th>
                <th>Título</th>
                <th>Categoria</th>
                <th>Forma</th>
                <th className="text-right">Entrada</th>
                <th className="text-right">Saída</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="py-2 align-top">{fmtDate(e.date)}</td>
                  <td className="align-top">{e.title}</td>
                  <td className="align-top">{e.category ?? "–"}</td>
                  <td className="align-top">{e.method ?? "–"}</td>
                  <td className="align-top text-right text-green-700">{e.type === "IN" ? fmtBRL(e.amount) : ""}</td>
                  <td className="align-top text-right text-red-700">{e.type === "OUT" ? fmtBRL(e.amount) : ""}</td>
                  <td className="align-top text-right">
                    <button className="icon-btn" title="Editar" onClick={() => onEdit(e)}>
                      ✏️
                    </button>
                    <button className="icon-btn" title="Excluir" onClick={() => onDelete(e)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .icon-btn { display:inline-flex;align-items:center;justify-content:center; width:32px;height:32px; border:1px solid #e5e7eb; border-radius:10px; margin-left:6px; background:#fff; }
        .icon-btn:hover { border-color:#c7cdd4; }
      `}</style>
    </div>
  );
}

function fmtDate(iso: string) {
  try {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, (m - 1) as number, d).toLocaleDateString("pt-BR");
  } catch {
    return iso;
  }
}
