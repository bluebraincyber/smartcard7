"use client";
import Link from "next/link";
import { useState } from "react";

type Store = {
  id: string;
  name: string;
  slug: string;
  url: string;
  status: "active" | "archived";
  categories: number;
  products: number;
  views30d?: number;
  updatedAt?: string;     // ISO
};

type Props = {
  store: Store;
  onToggleStatus: (id: string, next: "active"|"archived") => Promise<void>;
  onEdit: (id: string) => void;
  onProducts: (id: string) => void;
  onAnalytics: (id: string) => void;
};

export default function StoreCard({ store, onToggleStatus, onEdit, onProducts, onAnalytics }: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function toggle() {
    setLoading(true);
    const next = store.status === "active" ? "archived" : "active";
    await onToggleStatus(store.id, next).catch(() => null);
    setLoading(false);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(store.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  }

  function openStore() {
    window.open(store.url, "_blank");
  }

  return (
    <div
      className="group relative flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
      role="region"
      aria-label={`Loja ${store.name}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link href={`/dashboard/store/${store.id}`} className="block">
            <h3 className="truncate text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              {store.name}
            </h3>
          </Link>
          <button 
            onClick={copyLink}
            className="truncate text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors mt-1"
            title="Clique para copiar o link"
          >
            {store.url}
          </button>
          {copied && (
            <div className="text-xs text-green-600 mt-1">
              ✓ Link copiado!
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={
              "rounded-full px-2.5 py-1 text-xs font-medium " +
              (store.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-700")
            }
            title={store.status === "active" ? "Loja ativa" : "Loja arquivada"}
          >
            {store.status === "active" ? "Ativa" : "Arquivada"}
          </span>
        </div>
      </div>

      {/* Quick metrics */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Metric label="Categorias" value={store.categories} />
        <Metric label="Produtos" value={store.products} />
        <Metric label="Views (30d)" value={store.views30d ?? 0} />
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button 
          onClick={openStore}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          title="Abrir loja"
        >
          🔗 Abrir
        </button>
        
        <button 
          onClick={() => onAnalytics(store.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          title="Ver analytics"
        >
          📊 Analytics
        </button>
        
        <button 
          onClick={() => onProducts(store.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          title="Gerenciar produtos"
        >
          📦 Produtos
        </button>
        
        <button 
          onClick={() => onEdit(store.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          title="Editar loja"
        >
          ✏️ Editar
        </button>
        
        <button 
          onClick={toggle} 
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            store.status === "active"
              ? "text-red-600 bg-red-50 border-red-200 hover:bg-red-100"
              : "text-green-600 bg-green-50 border-green-200 hover:bg-green-100"
          }`}
          title={store.status === "active" ? "Arquivar loja" : "Ativar loja"}
          disabled={loading}
          aria-label={store.status === "active" ? "Arquivar loja" : "Ativar loja"}
        >
          {loading ? "..." : (store.status === "active" ? "🗄️ Arquivar" : "✅ Ativar")}
        </button>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 text-xs text-gray-500 border-t border-gray-100">
        {store.updatedAt ? (
          <span>Atualizada em {new Date(store.updatedAt).toLocaleDateString('pt-BR')}</span>
        ) : (
          <span>Sem data de atualização</span>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
      <div className="text-sm font-semibold text-gray-900">{value}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
    </div>
  );
}
