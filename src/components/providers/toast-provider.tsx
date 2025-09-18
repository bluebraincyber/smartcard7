'use client'

import * as React from 'react'
import { Toast } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'

export function ToastProvider() {
  const { toasts } = useToast()

  return (
    <>
      {toasts.map(({ id, title, description, action, ...props }) => {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <div className="font-semibold">{title as React.ReactNode}</div>}
              {description && (
                <div className="text-sm opacity-90">{description as React.ReactNode}</div>
              )}
            </div>
            {action}
          </Toast>
        )
      })}
    </>
  )
}
