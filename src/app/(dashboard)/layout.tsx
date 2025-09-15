"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { SidebarProvider } from "@/components/providers/sidebar-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-dvh bg-gray-50">
        <Topbar />
        <Sidebar />
        <MobileSidebar />
        <div className="md:pl-16"> {/* Offset for the sidebar */}
          <div className="pt-14"> {/* Offset for the topbar */}
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
