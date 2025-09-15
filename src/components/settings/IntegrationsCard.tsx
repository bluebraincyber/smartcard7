"use client";

import { useState } from "react";
import { 
  MessageSquare, 
  Instagram, 
  CreditCard, 
  ExternalLink, 
  Check, 
  AlertTriangle,
  ChevronRight,
  Loader2
} from "lucide-react";

type IntegrationProvider = "whatsapp" | "instagram" | "pix";

interface IntegrationStatus {
  [key: string]: {
    connected: boolean;
    lastSynced?: string;
    loading: boolean;
    error?: string | null;
  };
}

export default function IntegrationsCard() {
  const [integrations, setIntegrations] = useState<IntegrationStatus>({
    whatsapp: { connected: false, loading: false },
    instagram: { connected: false, loading: false },
    pix: { connected: false, loading: false },
  });

  const connect = async (provider: IntegrationProvider) => {
    setIntegrations(prev => ({
      ...prev,
      [provider]: { ...prev[provider], loading: true, error: null }
    }));

    try {
      // In a real app, this would be an API call to your backend
      // const res = await fetch(`/api/integrations/${provider}/connect`, { 
      //   method: "POST" 
      // });
      // const data = await res.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful connection
      setIntegrations(prev => ({
        ...prev,
        [provider]: { 
          connected: true, 
          loading: false, 
          lastSynced: new Date().toISOString(),
          error: null
        }
      }));
    } catch (error) {
      setIntegrations(prev => ({
        ...prev,
        [provider]: { 
          ...prev[provider], 
          loading: false, 
          error: 'Falha na conexão. Tente novamente.'
        }
      }));
    }
  };

  const disconnect = async (provider: IntegrationProvider) => {
    setIntegrations(prev => ({
      ...prev,
      [provider]: { ...prev[provider], loading: true, error: null }
    }));

    try {
      // In a real app, this would be an API call to your backend
      // await fetch(`/api/integrations/${provider}/disconnect`, { 
      //   method: "POST" 
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setIntegrations(prev => ({
        ...prev,
        [provider]: { 
          connected: false, 
          loading: false, 
          lastSynced: undefined,
          error: null
        }
      }));
    } catch (error) {
      setIntegrations(prev => ({
        ...prev,
        [provider]: { 
          ...prev[provider], 
          loading: false, 
          error: 'Falha ao desconectar. Tente novamente.'
        }
      }));
    }
  };

  const integrationConfigs = [
    {
      id: 'whatsapp',
      title: 'WhatsApp Business',
      description: 'Envie notificações e mensagens automáticas para seus clientes',
      icon: MessageSquare,
      connectedLabel: 'Conectado',
      color: 'green',
    },
    {
      id: 'instagram',
      title: 'Instagram',
      description: 'Sincronize seu catálogo e gerencie mensagens diretas',
      icon: Instagram,
      connectedLabel: 'Conectado',
      color: 'pink',
    },
    {
      id: 'pix',
      title: 'Pix',
      description: 'Receba pagamentos com reconciliação automática',
      icon: CreditCard,
      connectedLabel: 'Ativado',
      color: 'purple',
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header with Documentation Link */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Conecte seus canais para automação e métricas unificadas
          </p>
        </div>
        <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <ExternalLink className="h-4 w-4 mr-2" />
          Documentação
        </button>
      </div>

      {/* Integrations List */}
      <div className="space-y-4">
        {integrationConfigs.map((config) => {
          const integration = integrations[config.id as IntegrationProvider];
          const isConnected = integration?.connected;
          const isLoading = integration?.loading;
          const error = integration?.error;
          
          return (
            <div key={config.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${
                    config.color === 'green' ? 'bg-green-100' :
                    config.color === 'pink' ? 'bg-pink-100' :
                    'bg-purple-100'
                  }`}>
                    <config.icon className={`h-6 w-6 ${
                      config.color === 'green' ? 'text-green-600' :
                      config.color === 'pink' ? 'text-pink-600' :
                      'text-purple-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-base font-medium text-gray-900">
                        {config.title}
                      </h3>
                      {isConnected && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          {config.connectedLabel}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-1">
                      {config.description}
                    </p>
                    
                    {isConnected && integration.lastSynced && (
                      <p className="text-xs text-gray-400 mt-2">
                        Última sincronização: {new Date(integration.lastSynced).toLocaleString('pt-BR')}
                      </p>
                    )}
                    
                    {error && (
                      <div className="flex items-center mt-2">
                        <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
                        <p className="text-xs text-red-500">
                          {error}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  {isConnected ? (
                    <button
                      onClick={() => disconnect(config.id as IntegrationProvider)}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md shadow-sm text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Desconectando...
                        </>
                      ) : (
                        'Desconectar'
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => connect(config.id as IntegrationProvider)}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Conectando...
                        </>
                      ) : (
                        <>
                          Conectar
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Dica:</strong> As integrações permitem sincronizar dados automaticamente e oferecer uma experiência mais fluida aos seus clientes.
        </p>
      </div>
    </div>
  );
}
