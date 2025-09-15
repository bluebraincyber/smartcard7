"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/Switch";
import { Mail, MessageSquare, Bell, BellRing, AlertTriangle, Tag } from "lucide-react";

type NotificationChannel = 'email' | 'whatsapp' | 'push';
type NotificationType = 'newOrder' | 'newMessage' | 'lowStock' | 'promotions';

interface NotificationPrefs {
  channels: {
    [key in NotificationChannel]: boolean;
  };
  types: {
    [key in NotificationType]: boolean;
  };
}

type State = "idle" | "saving" | "success" | "error";

const notificationTypeLabels: Record<NotificationType, { label: string; description: string; icon: React.ReactNode }> = {
  newOrder: {
    label: "Novos pedidos",
    description: "Receba notificações quando novos pedidos forem realizados",
    icon: <BellRing className="h-5 w-5 text-blue-500" />
  },
  newMessage: {
    label: "Novas mensagens",
    description: "Seja notificado sobre novas mensagens dos clientes",
    icon: <MessageSquare className="h-5 w-5 text-green-500" />
  },
  lowStock: {
    label: "Estoque baixo",
    description: "Alertas quando os produtos estiverem com estoque baixo",
    icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />
  },
  promotions: {
    label: "Promoções",
    description: "Receba novidades e ofertas especiais",
    icon: <Tag className="h-5 w-5 text-purple-500" />
  }
};

const channelLabels: Record<NotificationChannel, { label: string; description: string; icon: React.ReactNode }> = {
  email: {
    label: "E-mail",
    description: "Notificações por e-mail",
    icon: <Mail className="h-5 w-5 text-blue-500" />
  },
  whatsapp: {
    label: "WhatsApp",
    description: "Mensagens via WhatsApp",
    icon: <MessageSquare className="h-5 w-5 text-green-500" />
  },
  push: {
    label: "Push notifications",
    description: "Notificações do navegador",
    icon: <Bell className="h-5 w-5 text-blue-500" />
  }
};

export default function NotificationsSettingsCard() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    channels: {
      email: true,
      whatsapp: true,
      push: true,
    },
    types: {
      newOrder: true,
      newMessage: true,
      lowStock: true,
      promotions: false,
    },
  });

  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string | null>(null);

  // Load user preferences on mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        const res = await fetch("/api/user/notifications");
        if (res.ok) {
          const data = await res.json();
          setPrefs(prev => ({
            channels: { ...prev.channels, ...(data.channels || {}) },
            types: { ...prev.types, ...(data.types || {}) },
          }));
        }
      } catch (error) {
        console.error("Failed to load notification preferences:", error);
      }
    }
    loadPreferences();
  }, []);

  const toggleChannel = (channel: NotificationChannel) => {
    setPrefs(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel],
      },
    }));
  };

  const toggleType = (type: NotificationType) => {
    setPrefs(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type],
      },
    }));
  };

  async function onSave() {
    setState("saving");
    setMessage(null);
    
    try {
      const res = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to save preferences");
      }
      
      setState("success");
      setMessage("Preferências de notificação salvas com sucesso!");
      setTimeout(() => setState("idle"), 3000);
    } catch (e: any) {
      setState("error");
      setMessage(e?.message ?? "Ocorreu um erro ao salvar as preferências.");
    }
  }

  return (
    <div className="space-y-8">
      {/* Notification Channels */}
      <div>
        <h3 className="text-base font-medium text-gray-900 mb-2">
          Canais de notificação
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Escolha como você gostaria de receber as notificações
        </p>
        
        <div className="space-y-4">
          {(Object.entries(channelLabels) as [NotificationChannel, { label: string; description: string; icon: React.ReactNode }][])
            .map(([channel, { label, description, icon }]) => (
              <div key={channel} className="flex items-center justify-between py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {label}
                    </p>
                    <p className="text-sm text-gray-500">
                      {description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={prefs.channels[channel]}
                  onCheckedChange={() => toggleChannel(channel)}
                />
              </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Notification Types */}
      <div>
        <h3 className="text-base font-medium text-gray-900 mb-2">
          Tipos de notificação
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Escolha quais tipos de notificações você deseja receber
        </p>
        
        <div className="space-y-4">
          {(Object.entries(notificationTypeLabels) as [NotificationType, { label: string; description: string; icon: React.ReactNode }][])
            .map(([type, { label, description, icon }]) => (
              <div key={type} className="flex items-center justify-between py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {label}
                    </p>
                    <p className="text-sm text-gray-500">
                      {description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={prefs.types[type]}
                  onCheckedChange={() => toggleType(type)}
                />
              </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {message && (
            <div className={`text-sm ${state === "error" ? "text-red-600" : "text-green-600"}`}>
              {message}
            </div>
          )}
        </div>
        <button
          onClick={onSave}
          disabled={state === "saving"}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {state === "saving" ? "Salvando..." : "Salvar preferências"}
        </button>
      </div>
    </div>
  );
}
