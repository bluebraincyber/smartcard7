"use client";
import { useEffect, useMemo, useState } from "react";
import type { LedgerEntry, PayMethod } from "@/types/finance";
import { parseBRLToCents, fmtBRL } from "@/lib/format";

export default function EntryDrawer({
  open,
  type,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  type: "IN" | "OUT";
  initial?: LedgerEntry;
  onClose: () => void;
  onSave: (data: Partial<LedgerEntry> & { type: "IN" | "OUT" }) => void;
}) {
  const [form, setForm] = useState({
    type,
    title: "",
    amountText: "",
    date: new Date().toISOString().slice(0, 10),
    category: "",
    method: "pix" as PayMethod,
    note: "",
  });

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        type: initial.type,
        title: initial.title,
        amountText: (initial.amount / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
        date: initial.date,
        category: initial.category ?? "",
        method: (initial.method ?? "pix") as PayMethod,
        note: initial.note ?? "",
      });
    } else {
      setForm({
        type,
        title: "",
        amountText: "",
        date: new Date().toISOString().slice(0, 10),
        category: "",
        method: "pix",
        note: "",
      });
    }
  }, [open, initial, type]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseBRLToCents(form.amountText);
    if (!form.title || !amount) return alert("Preencha título e valor.");
    onSave({
      type: form.type,
      title: form.title,
      amount,
      date: form.date,
      category: form.category || undefined,
      method: form.method,
      note: form.note || undefined,
    });
  }

  return (
    <div className={"fixed inset-0 z-50 " + (open ? "" : "pointer-events-none")}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={
          "absolute inset-0 bg-black/30 transition-opacity " + (open ? "opacity-100" : "opacity-0")
        }
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={
          "absolute right-0 top-0 h-full w-full max-w-md transform bg-background p-6 shadow-xl transition-transform border-l border-border " +
          (open ? "translate-x-0" : "translate-x-full")
        }
        role="dialog"
        aria-modal="true"
        aria-label="Lançamento"
      >
        <h3 className="text-lg font-semibold text-foreground">{initial ? "Editar Lançamento" : "Novo Lançamento"}</h3>

        {/* Tipo */}
        <div className="mt-4 inline-flex rounded-xl border border-border p-1 bg-muted/30" role="tablist">
          {(["IN", "OUT"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setForm((f) => ({ ...f, type: t }))}
              className={
                "h-9 rounded-lg px-3 text-sm transition-colors " +
                (form.type === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted")
              }
              role="tab"
              aria-selected={form.type === t}
            >
              {t === "IN" ? "Entrada" : "Saída"}
            </button>
          ))}
        </div>

        <form className="mt-4 space-y-4" onSubmit={submit}>
          <label className="block text-sm">
            <span className="text-muted-foreground">Título</span>
            <input
              className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ex.: Venda via Pix"
            />
          </label>

          <label className="block text-sm">
            <span className="text-muted-foreground">Valor</span>
            <input
              className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={form.amountText}
              onChange={(e) => setForm((f) => ({ ...f, amountText: e.target.value }))}
              placeholder="0,00"
              inputMode="decimal"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-muted-foreground">Data</span>
              <input
                type="date"
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </label>

            <label className="block text-sm">
              <span className="text-muted-foreground">Categoria</span>
              <input
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="Vendas, Taxas, Fornecedor…"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="text-muted-foreground">Forma</span>
            <select
              className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={form.method}
              onChange={(e) => setForm((f) => ({ ...f, method: e.target.value as any }))}
            >
              <option value="pix">Pix</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="debito">Cartão Débito</option>
              <option value="credito">Cartão Crédito</option>
              <option value="transferencia">Transferência</option>
              <option value="outro">Outro</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="text-muted-foreground">Observações</span>
            <textarea
              className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              rows={3}
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Opcional"
            />
          </label>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button type="submit" className="h-10 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Salvar
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
