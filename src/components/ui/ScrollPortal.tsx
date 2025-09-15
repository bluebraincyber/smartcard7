"use client";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const HOST_ID = "topbar-hud-host";

function getScrollRoot(): HTMLElement {
  return (
    (document.querySelector("[data-scroll-root]") as HTMLElement) ||
    (document.scrollingElement as HTMLElement) ||
    document.body
  );
}

export default function ScrollPortal({ children }: { children: React.ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const target = getScrollRoot();

    let el = document.getElementById(HOST_ID) as HTMLElement | null;
    if (!el) {
      el = document.createElement("div");
      el.id = HOST_ID;
      target.appendChild(el);
    } else if (el.parentElement !== target) {
      target.appendChild(el); // move para o novo contêiner que rola
    }

    setHost(el);

    // Flag global: HUD montado (usaremos para esconder duplicata no Topbar)
    document.documentElement.setAttribute("data-hud", "1");
    return () => {
      // não removemos o host (singleton), só limpamos a flag em full unmount
      // (em layout persistente isso não dispara)
    };
  }, [pathname]);

  if (!host) return null;
  return createPortal(children, host);
}
