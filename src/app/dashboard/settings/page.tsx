import { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { User, Shield, Bell, Zap, Download, RefreshCw, HelpCircle, LogOut, Trash2 } from 'lucide-react';
import { Skeleton } from "@/components/ui";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";

// Dynamically import cards with no SSR for client-side interactivity
const AccountSettingsCard = dynamic(
  () => import("@/components/settings/AccountSettingsCard"),
  { ssr: false, loading: () => <SettingsCardSkeleton /> }
);

const SecuritySettingsCard = dynamic(
  () => import("@/components/settings/SecuritySettingsCard"),
  { ssr: false, loading: () => <SettingsCardSkeleton /> }
);

const NotificationsSettingsCard = dynamic(
  () => import("@/components/settings/NotificationsSettingsCard"),
  { ssr: false, loading: () => <SettingsCardSkeleton /> }
);

const IntegrationsCard = dynamic(
  () => import("@/components/settings/IntegrationsCard"),
  { ssr: false, loading: () => <SettingsCardSkeleton /> }
);

export const metadata: Metadata = {
  title: "Configurações — SmartCard",
  description: "Gerencie as configurações da sua conta, notificações e integrações"
};

function SettingsCardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Skeleton variant="text" width={96} height={16} />
        <Skeleton variant="rect" height={40} />
      </div>
      <div className="space-y-3">
        <Skeleton variant="text" width={128} height={16} />
        <Skeleton variant="rect" height={40} />
      </div>
      <div className="pt-2">
        <Skeleton variant="rect" width={128} height={40} />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Configurações
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Gerencie suas preferências e configurações de conta
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Account Settings */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-medium text-gray-900">
                    Informações da Conta
                  </h2>
                  <p className="text-sm text-gray-500">
                    Atualize suas informações pessoais
                  </p>
                </div>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <Suspense fallback={<SettingsCardSkeleton />}>
                <AccountSettingsCard />
              </Suspense>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-medium text-gray-900">
                    Segurança
                  </h2>
                  <p className="text-sm text-gray-500">
                    Gerencie sua senha e configurações de segurança
                  </p>
                </div>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <Suspense fallback={<SettingsCardSkeleton />}>
                <SecuritySettingsCard />
              </Suspense>
            </div>
          </div>

          {/* Notifications Settings */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-medium text-gray-900">
                    Notificações
                  </h2>
                  <p className="text-sm text-gray-500">
                    Configure suas preferências de notificação
                  </p>
                </div>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <Suspense fallback={<SettingsCardSkeleton />}>
                <NotificationsSettingsCard />
              </Suspense>
            </div>
          </div>

          {/* Integrations */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Zap className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-medium text-gray-900">
                    Integrações
                  </h2>
                  <p className="text-sm text-gray-500">
                    Conecte seus serviços favoritos
                  </p>
                </div>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <Suspense fallback={<SettingsCardSkeleton />}>
                <IntegrationsCard />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ações rápidas
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar dados
                </button>
                <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sincronizar conta
                </button>
                <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Central de ajuda
                </button>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Status da conta
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Conta verificada</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">E-mail confirmado</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">2FA desabilitado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white overflow-hidden shadow rounded-lg border-red-200">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-red-600 mb-4">
                Zona de perigo
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair de todos os dispositivos
                </button>
                <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
