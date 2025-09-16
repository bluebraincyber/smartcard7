'use client'

import { HTMLAttributes, forwardRef } from 'react'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  center?: boolean
}

export const ResponsiveContainer = forwardRef<HTMLDivElement, ContainerProps>(
  ({ 
    children, 
    size = 'xl', 
    padding = 'md', 
    center = false,
    className = '', 
    ...props 
  }, ref) => {
    
    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-2xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-full'
    }
    
    const paddingClasses = {
      none: '',
      sm: 'px-4 py-2',
      md: 'px-4 sm:px-6 lg:px-8 py-4',
      lg: 'px-4 sm:px-6 lg:px-8 py-8'
    }

    return (
      <div
        ref={ref}
        className={`
          w-full mx-auto
          ${sizeClasses[size]}
          ${paddingClasses[padding]}
          ${center ? 'text-center' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveContainer.displayName = 'ResponsiveContainer'

// Section Component
interface SectionProps extends HTMLAttributes<HTMLElement> {
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  background?: 'transparent' | 'muted' | 'card'
}

export const ResponsiveSection = forwardRef<HTMLElement, SectionProps>(
  ({ 
    children, 
    spacing = 'md', 
    background = 'transparent',
    className = '', 
    ...props 
  }, ref) => {
    
    const spacingClasses = {
      none: '',
      sm: 'py-4',
      md: 'py-8',
      lg: 'py-12',
      xl: 'py-16'
    }
    
    const backgroundClasses = {
      transparent: 'bg-transparent',
      muted: 'bg-muted/30',
      card: 'bg-card border-y border-border'
    }

    return (
      <section
        ref={ref}
        className={`
          ${spacingClasses[spacing]}
          ${backgroundClasses[background]}
          ${className}
        `}
        {...props}
      >
        {children}
      </section>
    )
  }
)

ResponsiveSection.displayName = 'ResponsiveSection'

// Page Header Component
interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumbs?: React.ReactNode
  className?: string
}

export function ResponsivePageHeader({ 
  title, 
  description, 
  actions, 
  breadcrumbs,
  className = '' 
}: PageHeaderProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {breadcrumbs && (
        <div className="text-sm">
          {breadcrumbs}
        </div>
      )}
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

// Card Component
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  clickable?: boolean
}

export const ResponsiveCard = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    children, 
    padding = 'md', 
    hover = false, 
    clickable = false,
    className = '', 
    ...props 
  }, ref) => {
    
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    }

    return (
      <div
        ref={ref}
        className={`
          card-responsive
          ${paddingClasses[padding]}
          ${hover || clickable ? 'card-hover' : ''}
          ${clickable ? 'cursor-pointer' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveCard.displayName = 'ResponsiveCard'

// Grid Component
interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: {
    default?: number
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'none' | 'sm' | 'md' | 'lg'
  auto?: boolean
}

export const ResponsiveGrid = forwardRef<HTMLDivElement, GridProps>(
  ({ 
    children, 
    cols = { default: 1, sm: 2, md: 3, lg: 4 }, 
    gap = 'md', 
    auto = false,
    className = '', 
    ...props 
  }, ref) => {
    
    const gapClasses = {
      none: 'gap-0',
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6'
    }
    
    const getGridCols = () => {
      let classes = 'grid '
      
      if (auto) {
        classes += 'grid-cols-auto-fit '
      } else {
        if (cols.default) classes += `grid-cols-${cols.default} `
        if (cols.xs) classes += `xs:grid-cols-${cols.xs} `
        if (cols.sm) classes += `sm:grid-cols-${cols.sm} `
        if (cols.md) classes += `md:grid-cols-${cols.md} `
        if (cols.lg) classes += `lg:grid-cols-${cols.lg} `
        if (cols.xl) classes += `xl:grid-cols-${cols.xl} `
      }
      
      return classes
    }

    return (
      <div
        ref={ref}
        className={`
          ${getGridCols()}
          ${gapClasses[gap]}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveGrid.displayName = 'ResponsiveGrid'

// Flex Component
interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  gap?: 'none' | 'sm' | 'md' | 'lg'
  responsive?: {
    sm?: Partial<Pick<FlexProps, 'direction' | 'align' | 'justify'>>
    md?: Partial<Pick<FlexProps, 'direction' | 'align' | 'justify'>>
    lg?: Partial<Pick<FlexProps, 'direction' | 'align' | 'justify'>>
  }
}

export const ResponsiveFlex = forwardRef<HTMLDivElement, FlexProps>(
  ({ 
    children, 
    direction = 'row', 
    align = 'stretch', 
    justify = 'start',
    wrap = false,
    gap = 'none',
    responsive = {},
    className = '', 
    ...props 
  }, ref) => {
    
    const directionClasses = {
      row: 'flex-row',
      col: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'col-reverse': 'flex-col-reverse'
    }
    
    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch'
    }
    
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    }
    
    const gapClasses = {
      none: '',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6'
    }
    
    const getResponsiveClasses = () => {
      let classes = ''
      
      if (responsive.sm) {
        if (responsive.sm.direction) classes += `sm:${directionClasses[responsive.sm.direction]} `
        if (responsive.sm.align) classes += `sm:${alignClasses[responsive.sm.align]} `
        if (responsive.sm.justify) classes += `sm:${justifyClasses[responsive.sm.justify]} `
      }
      
      if (responsive.md) {
        if (responsive.md.direction) classes += `md:${directionClasses[responsive.md.direction]} `
        if (responsive.md.align) classes += `md:${alignClasses[responsive.md.align]} `
        if (responsive.md.justify) classes += `md:${justifyClasses[responsive.md.justify]} `
      }
      
      if (responsive.lg) {
        if (responsive.lg.direction) classes += `lg:${directionClasses[responsive.lg.direction]} `
        if (responsive.lg.align) classes += `lg:${alignClasses[responsive.lg.align]} `
        if (responsive.lg.justify) classes += `lg:${justifyClasses[responsive.lg.justify]} `
      }
      
      return classes
    }

    return (
      <div
        ref={ref}
        className={`
          flex
          ${directionClasses[direction]}
          ${alignClasses[align]}
          ${justifyClasses[justify]}
          ${wrap ? 'flex-wrap' : ''}
          ${gapClasses[gap]}
          ${getResponsiveClasses()}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveFlex.displayName = 'ResponsiveFlex'

// Stack Component (vertical flex with gap)
interface StackProps extends HTMLAttributes<HTMLDivElement> {
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
}

export const ResponsiveStack = forwardRef<HTMLDivElement, StackProps>(
  ({ 
    children, 
    spacing = 'md', 
    align = 'stretch',
    className = '', 
    ...props 
  }, ref) => {
    
    const spacingClasses = {
      none: 'space-y-0',
      xs: 'space-y-1',
      sm: 'space-y-2',
      md: 'space-y-4',
      lg: 'space-y-6',
      xl: 'space-y-8'
    }
    
    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch'
    }

    return (
      <div
        ref={ref}
        className={`
          flex flex-col
          ${spacingClasses[spacing]}
          ${alignClasses[align]}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveStack.displayName = 'ResponsiveStack'

// Main Layout Component
interface MainLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  sidebar?: React.ReactNode
  footer?: React.ReactNode
  bottomNav?: React.ReactNode
  className?: string
}

export function ResponsiveMainLayout({
  children,
  header,
  sidebar,
  footer,
  bottomNav,
  className = ''
}: MainLayoutProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Header */}
      {header && (
        <header className="sticky top-0 z-30 bg-card border-b border-border safe-top">
          {header}
        </header>
      )}
      
      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar - Desktop Only */}
        {sidebar && (
          <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
            <div className="flex-1 overflow-y-auto bg-card border-r border-border">
              {sidebar}
            </div>
          </aside>
        )}
        
        {/* Main Content */}
        <main className={`
          flex-1 min-w-0
          ${sidebar ? 'md:ml-64' : ''}
          main-content
        `}>
          {children}
        </main>
      </div>
      
      {/* Footer */}
      {footer && (
        <footer className="bg-card border-t border-border safe-bottom">
          {footer}
        </footer>
      )}
      
      {/* Bottom Navigation - Mobile Only */}
      {bottomNav}
    </div>
  )
}
