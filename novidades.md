Carilo, aqui vai a **especificação fechada + instruções operacionais** para o dev implementar a **Etiqueta SmartCard** no **Topbar** — sem debate, pronto pra colar.

# 1) Objetivo do componente

- **O que é:** uma etiqueta de marca **centralizada**, **colada no topo do contêiner que rola**, **sem arredondamento em cima** e **com arredondamento apenas nos cantos inferiores**.
  sempre à vista, **ocupando pouco espaço**, com leitura clara em mobile e desktop.

---

# 2) Anatomia (DOM & responsabilidades)

```
TopbarHUD (cola no topo do contêiner que rola)
└─ <div class="sticky-wrapper">  // controla sticky + z-index + safe-area
   └─ <div class="topbar-shell"> // largura, blur, sombra no scroll
      ├─ <button class="menu-btn md:hidden"> // ÚNICO botão para abrir/fechar sidebar (mobile)
      ├─ <a class="etiqueta">SmartCard</a>   // A estrela do show (topo reto, base arredondada)
      └─ <div class="right-slot md:flex">    // ações opcionais (desktop)
```

---

# 3) Regras visuais da **Etiqueta**

- **Topo:** reto (**sem** `rounded-t`).
- **Base:** `rounded-b-xl` (12–16px).
- **Fundo:** `bg-white` (modo dark: `dark:bg-neutral-900`).
- **Sombra:** `shadow-md` constante (não depende do scroll).
- **Texto:** `text-blue-600 font-semibold`, centralizado, `truncate`.
- **Tamanhos:** `px-3 py-1` (mobile), `px-4 py-1.5` (≥ md).
- **Largura:** `w-fit` e `mx-auto`.

> É uma “aba” que nasce do topo: **forma retangular**, **colada no topo**, **só os cantos de baixo arredondados**.

---

# 4) Comportamento do **Topbar**

- **Sticky dentro do contêiner que rola** (não usar `position: fixed`).
- **Z-index alto** para ficar acima do conteúdo.
- **Safe area**: respeitar `env(safe-area-inset-top)` em iOS.
- **Efeito de scroll:** a _shell_ do topbar ganha `shadow-sm` e comprime `padding` quando `scrollTop > 0` (a **Etiqueta não muda**).
- **Mobile:** mostrar **apenas um** botão hambúrguer (o **de cima**, à esquerda).
- **Desktop:** hambúrguer opcional; `right-slot` pode exibir ações.

---

# 5) Acessibilidade

- **Botão hambúrguer:** `aria-label="Abrir menu"`, foco visível, acionável com Enter/Espaço.
- **Região da barra:** `role="region" aria-label="Barra superior"`.
- **Contraste AA** para texto azul sobre branco.
- **`prefers-reduced-motion`**: transições discretas.

---

# 6) Implementação (código pronto)

## `components/topbar.tsx`

```tsx
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
```

## `components/TopbarHUD.tsx`

```tsx
"use client";
import Topbar from "@/components/topbar";
import { useSidebar } from "@/components/providers/sidebar-provider";

export default function TopbarHUD({ label }: { label: string }) {
  const { toggle } = useSidebar();
  return <Topbar label={label} onMenuToggle={toggle} />;
}
```

---

# 7) Tailwind: classes-chave da **Etiqueta**

```
bg-white dark:bg-neutral-900
shadow-md
px-3 py-1 md:px-4 md:py-1.5
font-semibold text-blue-600 text-sm md:text-base
rounded-b-xl rounded-t-none
w-fit mx-auto
mt-[calc(var(--safe-top)+4px)]
```

---

# 8) Regras de integração (evita dor de cabeça)

- **Sticky no contêiner certo:** a wrapper sticky deve ser filha direta do **contêiner que tem `overflow: auto`**. Se o scroll é no `main`, colocar o TopbarHUD dentro do `main`.
- **Somente um botão** para a sidebar (o **de cima**). Não duplique.
- **Nada de `position: fixed`** na barra: quebra o fluxo e safe-areas.
- **Dark mode:** preservar as classes `dark:*` já especificadas.
- **Sem rounded no topo** em hipótese alguma: **garanta** `rounded-t-none`.

---

# 9) Testes de aceitação (checklist rápido)

- **Formato correto:** topo reto, base arredondada; sombra perceptível.
- **Posição:** centralizada, colada visualmente ao topo; respeita `safe-area`.
- **Mobile:** botão hambúrguer **único** abre/fecha sidebar; foco acessível.
- **Desktop:** etiqueta central, `right-slot` aparece quando usado.
- **Scroll:** shell ganha `shadow-sm` e comprime padding; etiqueta **não** muda.
- **Performance:** sem layout shift; scroll suave; sem listeners duplicados.

---

# 10) Entregável

- Arquivos: `components/topbar.tsx` e `components/TopbarHUD.tsx` conforme acima.
- **Sem ajustes adicionais** em páginas internas. Usar o HUD **apenas** nas páginas públicas do cartão.

Quando for integrar com o design system, dá pra promover `label`, `sizes` e `tone` a tokens; mas o núcleo acima já entrega **pixel-perfect** igual ao print.
