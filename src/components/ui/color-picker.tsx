'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { HexColorPicker } from 'react-colorful'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  className?: string
  buttonClassName?: string
}

export function ColorPicker({
  value,
  onChange,
  className,
  buttonClassName,
}: ColorPickerProps) {
  const [open, setOpen] = React.useState(false)
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal flex items-center gap-2',
            !value && 'text-muted-foreground',
            buttonClassName
          )}
        >
          <div 
            className="h-4 w-4 rounded-full border"
            style={{ backgroundColor: value }}
          />
          {value.toUpperCase()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <HexColorPicker 
          color={value} 
          onChange={onChange} 
          className={className}
        />
        <div className="p-3 border-t">
          <div className="grid grid-cols-7 gap-2">
            {[
              '#3b82f6', // blue-500
              '#8b5cf6', // violet-500
              '#ec4899', // pink-500
              '#ef4444', // red-500
              '#f59e0b', // amber-500
              '#10b981', // emerald-500
              '#06b6d4', // cyan-500
            ].map((color) => (
              <button
                key={color}
                type="button"
                className="w-6 h-6 rounded-full border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                style={{ backgroundColor: color }}
                onClick={() => {
                  onChange(color)
                  setOpen(false)
                }}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
