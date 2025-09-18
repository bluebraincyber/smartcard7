import { ReactNode, ElementType, HTMLAttributes } from 'react';

type LayoutProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

// Stack: Empilha itens verticalmente com espaçamento fluido
export const Stack = ({
  as: Tag = 'div',
  className = '',
  children,
  ...props
}: LayoutProps) => (
  <Tag className={`flex flex-col gap-fluid-3 ${className}`} {...props}>
    {children}
  </Tag>
);

// Cluster: Agrupa itens em linha com wrap e espaçamento fluido
export const Cluster = ({
  as: Tag = 'div',
  className = '',
  children,
  ...props
}: LayoutProps) => (
  <Tag className={`flex flex-wrap items-center gap-fluid-2 ${className}`} {...props}>
    {children}
  </Tag>
);

// AutoGrid: Grid responsivo com tamanho mínimo configurável
export const AutoGrid = ({
  as: Tag = 'div',
  min = 240,
  className = '',
  children,
  ...props
}: LayoutProps & { min?: number }) => (
  <Tag
    className={`grid gap-fluid-3 [grid-template-columns:repeat(auto-fill,minmax(${min}px,1fr))] ${className}`}
    {...props}
  >
    {children}
  </Tag>
);

// Page: Container principal com largura máxima e padding responsivo
export const Page = ({
  as: Tag = 'main',
  className = '',
  children,
  ...props
}: LayoutProps) => (
  <Tag
    className={`mx-auto w-full max-w-[1200px] px-fluid-3 sm:px-fluid-4 pt-[calc(env(safe-area-inset-top,0)+12px)] ${className}`}
    {...props}
  >
    {children}
  </Tag>
);

// Exportar componentes nomeados individualmente
export { Stack, Cluster, AutoGrid, Page };

// Exportar objeto com todos os componentes para importação nomeada
const LayoutPrimitives = {
  Stack,
  Cluster,
  AutoGrid,
  Page,
};

export default LayoutPrimitives;
