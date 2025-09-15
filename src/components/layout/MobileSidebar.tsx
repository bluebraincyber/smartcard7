"use client";

import { useSidebar } from "@/components/providers/sidebar-provider";
import { Home, Store, Boxes, Banknote, BarChart3, Settings, X, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = () => [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/store", icon: Store, label: "Minha Loja" },
  { href: "/dashboard/products", icon: Boxes, label: "Categorias e Produtos" },
  { href: "/dashboard/finance", icon: Banknote, label: "Financeiro" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/settings", icon: Settings, label: "Configurações" },
];

export function MobileSidebar() {
  const { isOpen, close } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  if (!isOpen) return null;
  
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  return (
    <>
      {/* Backdrop with higher z-index */}
      <div 
        className="fixed inset-0 z-[60] bg-black/50 transition-opacity md:hidden"
        onClick={close}
      />
      
      {/* Sidebar with transform for smooth slide-in */}
      <div 
        className="fixed left-0 top-0 z-[70] flex h-screen w-64 flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out transform md:hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex h-14 items-center justify-between px-4">
          <span className="text-lg font-semibold text-gray-900">Menu</span>
          <button 
            onClick={close}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Fechar menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <div className="space-y-1 px-2">
            {NAV_ITEMS().map((item) => {
              const { href, icon: Icon, label } = item;
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={close}
                >
                  <Icon 
                    className={`h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} 
                  />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User profile at the bottom */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-sm font-medium text-indigo-600">US</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">Usuário</p>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center space-x-2 px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
              >
                <LogOut className="mr-1 h-3.5 w-3.5" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
