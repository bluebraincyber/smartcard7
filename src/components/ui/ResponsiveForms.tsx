'use client'

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

// Base Input Component
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export const ResponsiveInput = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    hint, 
    leftIcon, 
    rightIcon, 
    size = 'md', 
    className = '', 
    type = 'text',
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    
    const sizeClasses = {
      sm: 'h-10 px-3 text-sm',
      md: 'h-12 px-4 text-base',
      lg: 'h-14 px-5 text-lg'
    }

    const actualType = type === 'password' && showPassword ? 'text' : type

    return (
      <div className="form-group w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
            {props.required && <span className="text-brand-blue ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={actualType}
            className={`
              form-input w-full
              ${sizeClasses[size]}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon || type === 'password' ? 'pr-10' : ''}
              ${error ? 'border-error focus:border-error' : ''}
              ${className}
            `}
            {...props}
          />
          
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
          
          {rightIcon && type !== 'password' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-2 text-sm text-brand-blue dark:text-brand-blue/90">
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p className="mt-2 text-sm text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

ResponsiveInput.displayName = 'ResponsiveInput'

// Textarea Component
interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string
  error?: string
  hint?: string
  size?: 'sm' | 'md' | 'lg'
}

export const ResponsiveTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    label, 
    error, 
    hint, 
    size = 'md', 
    className = '', 
    rows = 4,
    ...props 
  }, ref) => {
    
    const sizeClasses = {
      sm: 'p-3 text-sm',
      md: 'p-4 text-base',
      lg: 'p-5 text-lg'
    }

    return (
      <div className="form-group w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
            {props.required && <span className="text-brand-blue ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          rows={rows}
          className={`
            form-input w-full resize-none
            ${sizeClasses[size]}
            ${error ? 'border-error focus:border-error' : ''}
            ${className}
          `}
          {...props}
        />
        
        {error && (
          <p className="mt-2 text-sm text-brand-blue dark:text-brand-blue/90">
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p className="mt-2 text-sm text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

ResponsiveTextarea.displayName = 'ResponsiveTextarea'

// Select Component
interface SelectProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  hint?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
}

export const ResponsiveSelect = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    label, 
    error, 
    hint, 
    options, 
    placeholder, 
    size = 'md', 
    className = '', 
    ...props 
  }, ref) => {
    
    const sizeClasses = {
      sm: 'h-10 px-3 text-sm',
      md: 'h-12 px-4 text-base',
      lg: 'h-14 px-5 text-lg'
    }

    return (
      <div className="form-group w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
            {props.required && <span className="text-brand-blue ml-1">*</span>}
          </label>
        )}
        
        <select
          ref={ref}
          className={`
            form-input w-full appearance-none cursor-pointer
            ${sizeClasses[size]}
            ${error ? 'border-error focus:border-error' : ''}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value} 
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <p className="mt-2 text-sm text-brand-blue dark:text-brand-blue/90">
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p className="mt-2 text-sm text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

ResponsiveSelect.displayName = 'ResponsiveSelect'

// Checkbox Component
interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  description?: string
  error?: string
  size?: 'sm' | 'md' | 'lg'
}

export const ResponsiveCheckbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    label, 
    description, 
    error, 
    size = 'md', 
    className = '', 
    ...props 
  }, ref) => {
    
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    }

    return (
      <div className="form-group">
        <div className="flex items-start gap-3">
          <input
            ref={ref}
            type="checkbox"
            className={`
              ${sizeClasses[size]}
              rounded border-border text-primary 
              focus:ring-primary/50 focus:ring-2 focus:ring-offset-0
              transition-colors duration-200
              ${error ? 'border-error' : ''}
              ${className}
            `}
            {...props}
          />
          
          {(label || description) && (
            <div className="flex-1 min-w-0">
              {label && (
                <label className="block text-sm font-medium text-foreground">
                  {label}
                  {props.required && <span className="text-brand-blue ml-1">*</span>}
                </label>
              )}
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-2 text-sm text-brand-blue dark:text-brand-blue/90">
            {error}
          </p>
        )}
      </div>
    )
  }
)

ResponsiveCheckbox.displayName = 'ResponsiveCheckbox'

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export const ResponsiveButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    leftIcon, 
    rightIcon, 
    fullWidth = false,
    className = '', 
    disabled,
    ...props 
  }, ref) => {
    
    const baseClasses = 'btn-responsive font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    const variantClasses = {
      primary: 'btn-primary focus:ring-primary/50',
      secondary: 'btn-secondary focus:ring-primary/50',
      outline: 'bg-transparent border border-border text-foreground hover:bg-muted focus:ring-primary/50',
      ghost: 'bg-transparent text-foreground hover:bg-muted focus:ring-primary/50',
      destructive: 'bg-brand-blue/90 text-white hover:bg-brand-blue focus:ring-brand-blue/50'
    }
    
    const sizeClasses = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-12 px-6 text-base',
      lg: 'h-14 px-8 text-lg',
      xl: 'h-16 px-10 text-xl'
    }
    
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div className="mr-2">
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          </div>
        )}
        
        {leftIcon && !loading && (
          <span className="mr-2">
            {leftIcon}
          </span>
        )}
        
        {children}
        
        {rightIcon && (
          <span className="ml-2">
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)

ResponsiveButton.displayName = 'ResponsiveButton'

// Form Container
interface FormContainerProps {
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent) => void
  className?: string
}

export function ResponsiveForm({ children, onSubmit, className = '' }: FormContainerProps) {
  return (
    <form 
      onSubmit={onSubmit}
      className={`form-responsive ${className}`}
      noValidate
    >
      {children}
    </form>
  )
}

// Form Row for responsive layouts
interface FormRowProps {
  children: React.ReactNode
  className?: string
}

export function FormRow({ children, className = '' }: FormRowProps) {
  return (
    <div className={`form-row ${className}`}>
      {children}
    </div>
  )
}
