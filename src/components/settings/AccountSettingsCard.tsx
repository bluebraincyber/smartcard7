"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react";

type State = "idle" | "saving" | "success" | "error" | "loading";

export default function AccountSettingsCard() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState<string | null>(null);

  // Load user data on mount
  useEffect(() => {
    async function loadUserData() {
      setState('loading');
      try {
        const res = await fetch("/api/user/profile");
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Erro ao carregar perfil');
        }
        
        const user = await res.json();
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || ""
        });
        setState('idle');
        
      } catch (err) {
        const error = err as Error;
        setMessage(`Falha ao carregar os dados: ${error.message}`);
        setState('error');
      }
    }
    
    loadUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    setMessage(null);
    
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Falha ao salvar as alterações");
      }
      
      setState("success");
      setMessage("Dados atualizados com sucesso!");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      const error = err as Error;
      setMessage(error.message);
      setState("error");
    } finally {
      setState("idle");
    }
  }

  const isLoading = state === 'loading' || state === 'saving';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Dados da Conta</CardTitle>
        <CardDescription>
          Atualize suas informações de perfil e endereço de e-mail.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Nome completo
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="phone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Telefone
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                disabled={isLoading}
              />
            </div>
          </div>
          
          {message && (
            <div className={`flex items-center p-4 rounded-md text-sm ${
              state === 'error' 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {state === 'error' ? (
                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              ) : state === 'success' ? (
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
              ) : (
                <Info className="h-5 w-5 mr-2 text-blue-500" />
              )}
              <span>{message}</span>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-[150px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar alterações'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
