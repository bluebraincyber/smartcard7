'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

interface ResponsiveModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
  className?: string
}

export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  className = ''
}: ResponsiveModalProps) {
  
  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Add padding to prevent layout shift
      document.body.style.paddingRight = '0px'
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
    
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  }

  const modalContent = (
    <div className="modal-responsive">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />
      
      {/* Modal Content */}
      <div className={`
        modal-content relative
        ${sizeClasses[size]}
        ${className}
      `}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            {title && (
              <h2 className="text-lg font-semibold text-foreground">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="
                  touch-target rounded-lg hover:bg-muted
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-primary/50
                "
                aria-label="Fechar modal"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-4 space-mobile">
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

// Mobile-optimized drawer component
interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  position?: 'bottom' | 'right'
  showCloseButton?: boolean
}

export function MobileDrawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'bottom',
  showCloseButton = true
}: MobileDrawerProps) {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const positionClasses = {
    bottom: 'bottom-0 left-0 right-0 rounded-t-xl max-h-[90vh]',
    right: 'top-0 right-0 bottom-0 rounded-l-xl w-full max-w-sm'
  }

  const animationClasses = {
    bottom: isOpen ? 'translate-y-0' : 'translate-y-full',
    right: isOpen ? 'translate-x-0' : 'translate-x-full'
  }

  const drawerContent = (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer Content */}
      <div className={`
        relative bg-card border border-border
        ${positionClasses[position]}
        transform transition-transform duration-300 ease-out
        ${animationClasses[position]}
        overflow-y-auto
      `}>
        {/* Handle for bottom drawer */}
        {position === 'bottom' && (
          <div className="flex justify-center p-2">
            <div className="w-8 h-1 bg-muted rounded-full" />
          </div>
        )}
        
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            {title && (
              <h2 className="text-lg font-semibold text-foreground">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="touch-target rounded-lg hover:bg-muted transition-colors duration-200"
                aria-label="Fechar drawer"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(drawerContent, document.body)
}

// Adaptive modal that shows as drawer on mobile, modal on desktop
interface AdaptiveModalProps extends ResponsiveModalProps {
  drawerPosition?: 'bottom' | 'right'
}

export function AdaptiveModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  className = '',
  drawerPosition = 'bottom'
}: AdaptiveModalProps) {
  
  return (
    <>
      {/* Mobile Drawer */}
      <div className="md:hidden">
        <MobileDrawer
          isOpen={isOpen}
          onClose={onClose}
          title={title}
          position={drawerPosition}
          showCloseButton={showCloseButton}
        >
          {children}
        </MobileDrawer>
      </div>
      
      {/* Desktop Modal */}
      <div className="hidden md:block">
        <ResponsiveModal
          isOpen={isOpen}
          onClose={onClose}
          title={title}
          size={size}
          showCloseButton={showCloseButton}
          closeOnBackdropClick={closeOnBackdropClick}
          className={className}
        >
          {children}
        </ResponsiveModal>
      </div>
    </>
  )
}
