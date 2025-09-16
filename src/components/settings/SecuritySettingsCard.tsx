"use client";

import { useMemo, useState } from "react";
import { Switch } from "@/components/ui/Switch";
import { Eye, EyeOff } from "lucide-react";

type State = "idle" | "saving" | "success" | "error";

export default function SecuritySettingsCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const strength = useMemo(() => {
    let score = 0;
    if (next.length >= 8) score++;
    if (/[A-Z]/.test(next)) score++;
    if (/[a-z]/.test(next)) score++;
    if (/\d/.test(next)) score++;
    if (/[^A-Za-z0-9]/.test(next)) score++;
    return Math.min(score, 4);
  }, [next]);

  const strengthText = useMemo(() => {
    if (!next) return "";
    const texts = ["Muito fraca", "Fraca", "Média", "Forte", "Muito forte"];
    return texts[strength];
  }, [strength, next]);

  const strengthColor = useMemo(() => {
    const colors = ["bg-destructive", "bg-warning", "bg-warning", "bg-secondary", "bg-success"];
    return colors[strength];
  }, [strength]);

  async function onChangePassword() {
    if (next !== confirm) {
      setMessage("As senhas não coincidem");
      setState("error");
      return;
    }

    if (next.length < 8) {
      setMessage("A senha deve ter pelo menos 8 caracteres");
      setState("error");
      return;
    }

    setState("saving");
    setMessage(null);
    
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Não foi possível alterar a senha");
      }

      setState("success");
      setMessage("Senha alterada com sucesso!");
      setCurrent("");
      setNext("");
      setConfirm("");
      setTimeout(() => setState("idle"), 3000);
    } catch (e: any) {
      setState("error");
      setMessage(e?.message || "Erro ao alterar a senha. Verifique os dados e tente novamente.");
    }
  }

  const isFormValid = current && next && next === confirm && next.length >= 8;

  return (
    <div className="space-y-6">
      {/* Password Change Section */}
      <div className="space-y-6">
        <div>
          <label htmlFor="current-password" className="block text-sm font-medium text-foreground mb-2">
            Senha atual
          </label>
          <div className="relative">
            <input
              id="current-password"
              type={showCurrent ? "text" : "password"}
              className="block w-full px-3 py-2 pr-10 text-sm rounded-md border border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary focus:outline-none"
              placeholder="Digite sua senha atual"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              aria-label={showCurrent ? "Ocultar senha" : "Mostrar senha"}
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-foreground mb-2">
              Nova senha
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showNew ? "text" : "password"}
                className="block w-full px-3 py-2 pr-10 text-sm rounded-md border border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary focus:outline-none"
                placeholder="Nova senha"
                value={next}
                onChange={(e) => setNext(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                aria-label={showNew ? "Ocultar senha" : "Mostrar senha"}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {next && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Força da senha: {strengthText}</span>
                </div>
                <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${strengthColor} transition-all duration-300`} 
                    style={{ width: `${(strength + 1) * 20}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Use 8 ou mais caracteres com uma combinação de letras, números e símbolos
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-2">
              Confirmar nova senha
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                className="block w-full px-3 py-2 pr-10 text-sm rounded-md border border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary focus:outline-none"
                placeholder="Confirme a nova senha"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
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
          onClick={onChangePassword}
          disabled={!isFormValid || state === "saving"}
          className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md shadow-sm text-foreground bg-card hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
          {state === "saving" ? "Atualizando..." : "Alterar senha"}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border"></div>

      {/* Two-Factor Authentication */}
      <div className="flex items-center justify-between py-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Autenticação de dois fatores
          </p>
          <p className="text-sm text-muted-foreground">
            Adicione uma camada extra de segurança à sua conta
          </p>
        </div>
        <Switch
          checked={twoFactorEnabled}
          onCheckedChange={setTwoFactorEnabled}
        />
      </div>
    </div>
  );
}
