"use client";
import Topbar from "@/components/topbar";
import { useSidebar } from "@/components/providers/sidebar-provider";

export default function TopbarHUD({ label }: { label: string }) {
  const { toggle } = useSidebar();
  return <Topbar label={label} onMenuToggle={toggle} />;
}
