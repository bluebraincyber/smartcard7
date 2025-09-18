import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type EmptyStateVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The title of the empty state
   */
  title: string;
  /**
   * The description of the empty state
   */
  description?: string;
  /**
   * The visual variant of the empty state
   * @default 'default'
   */
  variant?: EmptyStateVariant;
  /**
   * Custom icon to display
   */
  icon?: React.ReactNode;
  /**
   * Primary action button
   */
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  /**
   * Secondary action button
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  /**
   * Whether to show a border around the empty state
   * @default true
   */
  bordered?: boolean;
  /**
   * Custom class name for the icon container
   */
  iconClassName?: string;
}

const variantIcons = {
  default: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-12 w-12 text-muted-foreground"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  ),
  success: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-12 w-12 text-emerald-500"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  ),
  warning: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-12 w-12 text-amber-500"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  ),
  error: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-12 w-12 text-destructive"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  info: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-12 w-12 text-blue-500"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  ),
};

export function EmptyState({
  title,
  description,
  variant = 'default',
  icon,
  action,
  secondaryAction,
  bordered = true,
  className,
  iconClassName,
  ...props
}: EmptyStateProps) {
  const displayIcon = icon || variantIcons[variant];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        bordered && 'rounded-lg border border-border bg-card',
        className
      )}
      {...props}
    >
      <div className={cn('mb-4', iconClassName)}>{displayIcon}</div>
      <h3 className="mb-2 text-lg font-medium">{title}</h3>
      {description && (
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap justify-center gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              className="gap-2"
              variant={variant === 'error' ? 'destructive' : 'default'}
            >
              {action.icon && <span>{action.icon}</span>}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="gap-2"
            >
              {secondaryAction.icon && <span>{secondaryAction.icon}</span>}
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
