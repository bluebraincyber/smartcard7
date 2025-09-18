'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input, InputProps } from '@/components/ui/input'
import { Textarea, TextareaProps } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FieldError } from 'react-hook-form'

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  description?: string
  error?: FieldError
  required?: boolean
}

export function FormField({ 
  className, 
  label, 
  description, 
  error, 
  required = false, 
  children, 
  ...props 
}: React.PropsWithChildren<FormFieldProps>) {
  return (
    <div className={cn('grid gap-1.5', className)} {...props}>
      {label && (
        <Label htmlFor={props.id}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {children}
      {error && <p className="text-sm font-medium text-destructive">{error.message}</p>}
    </div>
  )
}

interface FormInputProps extends InputProps {
  label?: string
  description?: string
  error?: FieldError
  required?: boolean
}

export function FormInput({ 
  className, 
  label, 
  description, 
  error,
  required = false,
  ...props 
}: FormInputProps) {
  return (
    <FormField 
      label={label} 
      description={description} 
      error={error}
      required={required}
    >
      <Input 
        className={cn(error && 'border-destructive focus-visible:ring-destructive', className)} 
        {...props} 
      />
    </FormField>
  )
}

interface FormTextareaProps extends TextareaProps {
  label?: string
  description?: string
  error?: FieldError
  required?: boolean
}

export function FormTextarea({ 
  className, 
  label, 
  description, 
  error,
  required = false,
  ...props 
}: FormTextareaProps) {
  return (
    <FormField 
      label={label} 
      description={description} 
      error={error}
      required={required}
    >
      <Textarea 
        className={cn(error && 'border-destructive focus-visible:ring-destructive', className)} 
        {...props} 
      />
    </FormField>
  )
}

interface FormSelectProps extends React.ComponentProps<typeof Select> {
  label?: string
  description?: string
  error?: FieldError
  required?: boolean
  placeholder?: string
  options: { value: string; label: string }[]
}

export function FormSelect({
  className,
  label,
  description,
  error,
  required = false,
  placeholder = 'Selecione uma opção',
  options,
  ...props
}: FormSelectProps) {
  return (
    <FormField 
      label={label} 
      description={description} 
      error={error}
      required={required}
    >
      <Select {...props}>
        <SelectTrigger 
          className={cn(
            'w-full',
            error && 'border-destructive focus:ring-destructive',
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  )
}
