"use client";

import { cn } from "@/lib/utils";
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
        className="fixed left-0 top-0 z-[70] flex h-screen w-64 flex-col bg-background shadow-xl transition-transform duration-300 ease-in-out transform md:hidden border-r border-border"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <span className="text-lg font-semibold text-foreground">Menu</span>
          <button 
            onClick={close}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
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
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={close}
                >
                  <Icon 
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )} 
                  />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User profile at the bottom */}
        <div className="border-t border-border p-4 mt-auto">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">US</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">Usuário</p>
              <button
                onClick={handleSignOut}
                className="mt-1 flex w-full items-center text-sm font-medium text-primary hover:bg-primary/10 rounded-md px-2 py-1.5 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
