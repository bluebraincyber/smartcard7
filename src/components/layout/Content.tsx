"use client";

import { cn } from "@/lib/utils";

type ContentProps = {
  children: React.ReactNode;
  className?: string;
};

export function Content({ children, className }: ContentProps) {
  return (
    <main className={cn("mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6", className)}>
      {children}
    </main>
  );
}
