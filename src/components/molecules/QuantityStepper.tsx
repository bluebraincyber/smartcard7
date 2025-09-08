'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button, MinusIcon, PlusIcon } from '@/components/ui';

export interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'minimal';
  disabled?: boolean;
  showInput?: boolean;
  onChange: (value: number) => void;
  onBlur?: () => void;
  className?: string;
}

const QuantityStepper = React.forwardRef<HTMLDivElement, QuantityStepperProps>(
  ({
    value,
    min = 0,
    max = 99,
    step = 1,
    size = 'md',
    variant = 'default',
    disabled = false,
    showInput = true,
    onChange,
    onBlur,
    className,
    ...props
  }, ref) => {
    const [inputValue, setInputValue] = React.useState(value.toString());
    const [isFocused, setIsFocused] = React.useState(false);

    const sizes = {
      sm: {
        button: 'h-6 w-6 text-xs',
        input: 'h-6 w-8 text-xs',
        container: 'gap-1'
      },
      md: {
        button: 'h-8 w-8 text-sm', // 32dp conforme especificação
        input: 'h-8 w-10 text-sm',
        container: 'gap-1'
      },
      lg: {
        button: 'h-10 w-10 text-base',
        input: 'h-10 w-12 text-base',
        container: 'gap-2'
      }
    };

    const canDecrease = value > min;
    const canIncrease = value < max;

    const handleDecrease = () => {
      if (canDecrease && !disabled) {
        const newValue = Math.max(min, value - step);
        onChange(newValue);
        setInputValue(newValue.toString());
      }
    };

    const handleIncrease = () => {
      if (canIncrease && !disabled) {
        const newValue = Math.min(max, value + step);
        onChange(newValue);
        setInputValue(newValue.toString());
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputVal = e.target.value;
      setInputValue(inputVal);
      
      // Validar e atualizar apenas se for um número válido
      const numValue = parseInt(inputVal, 10);
      if (!isNaN(numValue)) {
        const clampedValue = Math.max(min, Math.min(max, numValue));
        if (clampedValue !== value) {
          onChange(clampedValue);
        }
      }
    };

    const handleInputBlur = () => {
      setIsFocused(false);
      
      // Corrigir valor se inválido
      const numValue = parseInt(inputValue, 10);
      if (isNaN(numValue) || numValue < min || numValue > max) {
        setInputValue(value.toString());
      } else {
        const clampedValue = Math.max(min, Math.min(max, numValue));
        setInputValue(clampedValue.toString());
        if (clampedValue !== value) {
          onChange(clampedValue);
        }
      }
      
      onBlur?.();
    };

    const handleInputFocus = () => {
      setIsFocused(true);
    };

    // Sincronizar inputValue com value quando value muda externamente
    React.useEffect(() => {
      if (!isFocused) {
        setInputValue(value.toString());
      }
    }, [value, isFocused]);

    const getVariantClasses = () => {
      switch (variant) {
        case 'outlined':
          return 'border border-gray-300 rounded-lg bg-white';
        case 'minimal':
          return 'bg-transparent';
        default:
          return 'bg-gray-50 border border-gray-200 rounded-lg';
      }
    };

    const getButtonVariant = () => {
      switch (variant) {
        case 'minimal':
          return 'ghost';
        default:
          return 'outline';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center',
          sizes[size].container,
          getVariantClasses(),
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        <Button
          variant={getButtonVariant()}
          size="sm"
          className={cn(
            sizes[size].button,
            'flex-shrink-0 border-0 bg-transparent hover:bg-gray-100',
            !canDecrease && 'opacity-50 cursor-not-allowed',
            variant === 'minimal' && 'hover:bg-gray-50'
          )}
          onClick={handleDecrease}
          disabled={disabled || !canDecrease}
          aria-label="Diminuir quantidade"
        >
          <MinusIcon className="h-3 w-3" />
        </Button>

        {showInput ? (
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            disabled={disabled}
            className={cn(
              'text-center font-medium bg-transparent border-0 outline-none',
              'focus:ring-0 focus:outline-none',
              sizes[size].input,
              disabled && 'cursor-not-allowed'
            )}
            aria-label="Quantidade"
            min={min}
            max={max}
          />
        ) : (
          <span className={cn(
            'text-center font-medium flex items-center justify-center',
            sizes[size].input
          )}>
            {value}
          </span>
        )}

        <Button
          variant={getButtonVariant()}
          size="sm"
          className={cn(
            sizes[size].button,
            'flex-shrink-0 border-0 bg-transparent hover:bg-gray-100',
            !canIncrease && 'opacity-50 cursor-not-allowed',
            variant === 'minimal' && 'hover:bg-gray-50'
          )}
          onClick={handleIncrease}
          disabled={disabled || !canIncrease}
          aria-label="Aumentar quantidade"
        >
          <PlusIcon className="h-3 w-3" />
        </Button>
      </div>
    );
  }
);

QuantityStepper.displayName = 'QuantityStepper';

export { QuantityStepper };
