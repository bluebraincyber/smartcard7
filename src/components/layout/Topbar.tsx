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
    <header className="sticky top-0 z-30">
      {/* Floating hamburger menu */}
      <button
        type="button"
        onClick={toggle}
        className="fixed top-4 left-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md text-gray-500 hover:bg-gray-100 md:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      
      {/* Centered SmartCard */}
      <div className="flex justify-center w-full">
        <div className="bg-white shadow-md rounded-b-lg py-2 px-3 w-auto min-w-[120px] text-center">
          <div className="flex items-center justify-center w-full">
            {/* Center: Brand */}
            <a 
              href="/dashboard" 
              className="text-blue-600 text-sm font-semibold hover:underline whitespace-nowrap mx-auto"
            >
              SmartCard
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
