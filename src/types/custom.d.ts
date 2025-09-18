// Tipos para módulos personalizados
declare module '@/hooks/useMobileLayout' {
  export function useMobileLayout(breakpoint?: number): boolean;
}

declare module '@/components/layout/PageHeader' {
  import { LucideIcon } from 'lucide-react';
  
  interface PageHeaderProps {
    title: string;
    description: string | React.ReactNode;
    icon?: LucideIcon;
    className?: string;
    iconClassName?: string;
  }
  
  export const PageHeader: React.FC<PageHeaderProps>;
}
