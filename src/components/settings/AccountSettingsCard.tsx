"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

type State = "idle" | "saving" | "success" | "error";

export default function AccountSettingsCard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string | null>(null);

  // Load user data on mount
  useEffect(() => {
    async function loadUserData() {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const user = await res.json();
          setName(user.name || "");
          setEmail(user.email || "");
          setPhone(user.phone || "");
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    }
    loadUserData();
  }, []);

  async function onSave() {
    setState("saving");
    setMessage(null);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      setState("success");
      setMessage("Dados atualizados com sucesso");
      setTimeout(() => setState("idle"), 2000);
    } catch (e: any) {
      setState("error");
      setMessage(e?.message ?? "Erro ao salvar as alterações");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Nome completo
          </label>
          <input
            id="name"
            type="text"
            className="block w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary focus:outline-none"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            className="block w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary focus:outline-none"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
          Telefone (opcional)
        </label>
        <input
          id="phone"
          type="tel"
          className="block w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary focus:outline-none"
          placeholder="(11) 99999-9999"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          {message && (
            <div className={`text-sm ${state === "error" ? "text-destructive" : "text-success"}`}>
              {message}
            </div>
          )}
        </div>
        <button
          onClick={onSave}
          disabled={state === "saving"}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {state === "saving" ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}
