"use client";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function ScrollPortal({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<Element | null>(null);
  
  useEffect(() => {
    const el = document.querySelector("[data-scroll-root]");
    setTarget(el ?? document.scrollingElement ?? document.body);
  }, []);
  
  if (!target) return null;
  return createPortal(children, target);
}
