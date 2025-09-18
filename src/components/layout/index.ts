// Re-export all layout components from one convenient location
export * from './LayoutPrimitives';
export { default as Header } from './Header';
export { DashboardLayoutWrapper } from './DashboardLayoutWrapper';

// Types
type LayoutProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
};

export type { LayoutProps };

// Default export with all layout components
import * as Layout from './LayoutPrimitives';
import Header from './Header';
import { DashboardLayoutWrapper as DashboardLayout } from './DashboardLayoutWrapper';

const LayoutComponents = {
  ...Layout,
  Header,
  DashboardLayout,
};

export default LayoutComponents;
