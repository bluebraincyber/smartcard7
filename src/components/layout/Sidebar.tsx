"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { Home, Store, Boxes, Banknote, BarChart3, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = () => [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/store", icon: Store, label: "Minha Loja" },
  { href: "/dashboard/products", icon: Boxes, label: "Categorias e Produtos" },
  { href: "/dashboard/finance", icon: Banknote, label: "Financeiro" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/settings", icon: Settings, label: "Configurações" },
];

export function Sidebar() {
  const { isOpen, toggle } = useSidebar();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen bg-white transition-all duration-300 ease-in-out md:block",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-14 items-center justify-end px-3">
        <button
          onClick={toggle}
          className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
          aria-label={isOpen ? "Recolher menu" : "Expandir menu"}
        >
          {isOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="mt-2 px-2">
        {NAV_ITEMS().map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                !isOpen && "justify-center"
              )}
              title={!isOpen ? label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span
                className={cn(
                  "whitespace-nowrap transition-opacity duration-200",
                  isOpen ? "opacity-100" : "absolute left-full ml-2 opacity-0"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User profile at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <div className="flex items-center gap-2 rounded-lg p-2 text-sm text-gray-700 hover:bg-gray-100">
          <div className="h-8 w-8 flex-shrink-0 rounded-full bg-indigo-100" />
          <span className={cn(isOpen ? "block" : "md:sr-only")}>Usuário</span>
        </div>
      </div>
    </aside>
  );
}
