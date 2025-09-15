"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { Menu } from "lucide-react";

type Props = {
  label: string; // Texto da etiqueta (nome da marca)
  onMenuToggle?: () => void; // Callback do hambúrguer (mobile)
  rightSlot?: React.ReactNode; // Ações opcionais (desktop)
  className?: string;
};

export default function Topbar({
  label,
  onMenuToggle,
  rightSlot,
  className,
}: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.scrollingElement || document.documentElement;
    const onScroll = () => setScrolled((el?.scrollTop || 0) > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={clsx(
        "sticky top-0 z-[2147483647] h-0 pointer-events-none",
        className
      )}
      style={
        { "--safe-top": "env(safe-area-inset-top, 0px)" } as React.CSSProperties
      }
    >
      <div
        className={clsx(
          "pointer-events-auto relative mx-auto w-full max-w-screen-md",
          "transition-all duration-200 ease-out",
          // padding vertical da SHELL (não da etiqueta)
          scrolled ? "py-1" : "py-2",
          // efeito de elevação da shell no scroll
          scrolled ? "shadow-sm" : "shadow-none",
          // fundos
          "bg-white/85 dark:bg-neutral-900/70",
          "backdrop-blur supports-[backdrop-filter]:backdrop-blur",
          // sem arredondar topo: borda apenas em baixo dá a leitura de bloco
          "rounded-b-2xl rounded-t-none"
        )}
        role="region"
        aria-label="Barra superior"
      >
        {/* Botão ÚNICO (mobile) — canto superior esquerdo */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            aria-label="Abrir menu"
            className={clsx(
              "md:hidden absolute left-3 top-2",
              "p-2 rounded-full bg-white dark:bg-neutral-800 shadow"
            )}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* ETIQUETA — topo reto, base arredondada */}
        <div className="flex justify-center">
          <a
            className={clsx(
              "select-none",
              "bg-white dark:bg-neutral-900",
              "shadow-md",
              // tamanhos
              "px-3 py-1 md:px-4 md:py-1.5",
              // tipografia
              "font-semibold text-blue-600 text-sm md:text-base",
              // forma: apenas base arredondada
              "rounded-b-xl rounded-t-none",
              // largura ao conteúdo + centralização
              "w-fit mx-auto",
              // reserva área segura do iOS e respiro do topo
              "mt-[calc(var(--safe-top)+4px)]"
            )}
          >
            {label}
          </a>
        </div>

        {/* Ações à direita (desktop) */}
        {rightSlot && (
          <div className="hidden md:flex items-center gap-2 absolute right-3 top-2">
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
}
