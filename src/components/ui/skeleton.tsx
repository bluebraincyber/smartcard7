import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  width?: number | string;
  height?: number | string;
}

export function Skeleton({
  className,
  variant = 'rect',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700 animate-pulse';
  
  const variants = {
    text: 'h-4 rounded',
    rect: 'rounded',
    circle: 'rounded-full',
  };

  return (
    <div
      className={cn(baseClasses, variants[variant], className)}
      style={{
        width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
        height: height ? (typeof height === 'number' ? `${height}px` : height) : '1em',
        ...style,
      }}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" className="w-full" />
      ))}
    </div>
  );
}
