'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled = false, size = 'md', className, ...props }, ref) => {
    const sizes = {
      sm: {
        switch: 'h-4 w-7',
        thumb: 'h-3 w-3 data-[state=checked]:translate-x-3',
      },
      md: {
        switch: 'h-5 w-9',
        thumb: 'h-4 w-4 data-[state=checked]:translate-x-4',
      },
      lg: {
        switch: 'h-6 w-11',
        thumb: 'h-5 w-5 data-[state=checked]:translate-x-5',
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        data-state={checked ? 'checked' : 'unchecked'}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50',
          checked
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-gray-200 hover:bg-gray-300',
          sizes[size].switch,
          className
        )}
        {...props}
      >
        <span
          data-state={checked ? 'checked' : 'unchecked'}
          className={cn(
            'pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform',
            sizes[size].thumb
          )}
        />
      </button>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };
