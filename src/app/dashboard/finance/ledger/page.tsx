import type { Metadata } from "next";
import LedgerPageClient from "@/components/finance/LedgerPageClient";

export const metadata: Metadata = {
  title: "Financeiro — Entradas & Saídas",
};

export default async function FinanceLedgerPage() {
  // Se você tiver multi-loja, injete storeId aqui via sessão/URL.
  // Para primeiro corte, mantemos indefinido (todas).
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Entradas & Saídas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registre receitas e despesas, e acompanhe o saldo por período.
        </p>
        <div className="mt-6">
          <LedgerPageClient />
        </div>
      </div>
    </div>
  );
}
