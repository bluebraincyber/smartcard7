"use client";

import { useSidebar } from "@/components/providers/sidebar-provider";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

export function Topbar() {
  const { toggle } = useSidebar();
  const pathname = usePathname();

  // Don't show topbar on auth pages
  if (pathname.startsWith('/auth')) return null;

  return (
    <header className="sticky top-0 z-30 flex justify-center">
      <div className="bg-white shadow-md rounded-b-lg py-4 px-8 w-auto inline-block">
        <div className="flex items-center justify-between">
          {/* Left: Mobile menu button only */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={toggle}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Center: Brand */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <a 
              href="#" 
              className="text-blue-600 font-semibold hover:underline"
            >
              SmartCard
            </a>
          </div>

          {/* Right side empty for alignment */}
          <div className="w-9"></div>
        </div>
      </div>
    </header>
  );
}
