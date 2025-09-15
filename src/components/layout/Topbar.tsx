"use client";

import { MenuIcon } from "lucide-react";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSidebar } from "@/components/providers/sidebar-provider";

export function Topbar() {
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-40 w-full bg-transparent p-2">
      <div className="container flex h-12 items-center justify-between py-2">
        <div className="flex items-center">
          <button
            onClick={toggle}
            className="
              md:hidden self-center w-10 h-10 flex items-center justify-center p-0 text-base 
              bg-card border border-border rounded-full shadow-md 
              hover:bg-muted focus-visible:bg-muted focus-visible:ring-0
              text-foreground transition-colors
            "
          >
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </button>
          <MobileSidebar />
        </div>
        
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="
            px-3 py-1 rounded-full 
            bg-card/90 backdrop-blur-sm shadow-md 
            border border-border
            text-primary text-sm font-medium
            transition-colors
          ">
            SmartCard
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <nav className="flex items-center">
            {/* Navigation items if needed */}
          </nav>
        </div>
      </div>
    </header>
  );
}
