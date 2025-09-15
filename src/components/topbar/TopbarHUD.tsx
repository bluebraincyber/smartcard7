"use client";
import ScrollPortal from "@/components/ui/ScrollPortal";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/providers/sidebar-provider";

export default function TopbarHUD() {
  const { toggle } = useSidebar();

  return (
    <ScrollPortal>
      {/* Wrapper colado no topo do CONTÊINER que rola */}
      <div
        className="
          sticky top-0 z-[2147483647]
          pointer-events-none
          h-0    /* não empurra layout */
        "
      >
        {/* Botão hamburguer (mobile) */}
        <button
          onClick={toggle}
          aria-label="Abrir menu"
          className="
            pointer-events-auto md:hidden
            absolute left-5
            top-[calc(var(--safe-top,0px)+8px)]
            p-2 rounded-full shadow bg-white text-gray-700 hover:bg-gray-100
            transform-gpu will-change-transform
          "
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Etiqueta central */}
        <div
          className="
            absolute left-1/2 -translate-x-1/2
            top-[calc(var(--safe-top,0px)+8px)]
            transform-gpu will-change-transform
          "
        >
          <div className="bg-white shadow-md rounded-b-lg py-2 px-3 w-auto min-w-[120px] text-center">
            <a
              href="/dashboard"
              className="text-blue-600 text-sm font-semibold hover:underline whitespace-nowrap"
            >
              SmartCard
            </a>
          </div>
        </div>
      </div>
    </ScrollPortal>
  );
}
