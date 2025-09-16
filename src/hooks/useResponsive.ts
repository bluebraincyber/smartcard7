'use client'

import { useState, useEffect } from 'react'

// Breakpoints configuration
const BREAKPOINTS = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

type Breakpoint = keyof typeof BREAKPOINTS

// Custom hook for responsive behavior
export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  })

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg')

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setWindowSize({ width, height })

      // Determine current breakpoint
      if (width >= BREAKPOINTS['2xl']) {
        setCurrentBreakpoint('2xl')
      } else if (width >= BREAKPOINTS.xl) {
        setCurrentBreakpoint('xl')
      } else if (width >= BREAKPOINTS.lg) {
        setCurrentBreakpoint('lg')
      } else if (width >= BREAKPOINTS.md) {
        setCurrentBreakpoint('md')
      } else if (width >= BREAKPOINTS.sm) {
        setCurrentBreakpoint('sm')
      } else {
        setCurrentBreakpoint('xs')
      }
    }

    // Set initial size
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowSize.width < BREAKPOINTS.md
  const isTablet = windowSize.width >= BREAKPOINTS.md && windowSize.width < BREAKPOINTS.lg
  const isDesktop = windowSize.width >= BREAKPOINTS.lg
  const isSmallMobile = windowSize.width < BREAKPOINTS.sm

  const isBreakpoint = (breakpoint: Breakpoint) => {
    return windowSize.width >= BREAKPOINTS[breakpoint]
  }

  const isBetween = (min: Breakpoint, max: Breakpoint) => {
    return windowSize.width >= BREAKPOINTS[min] && windowSize.width < BREAKPOINTS[max]
  }

  return {
    windowSize,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isSmallMobile,
    isBreakpoint,
    isBetween,
    breakpoints: BREAKPOINTS
  }
}

// Hook for media queries
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', listener)
    } else {
      // Fallback for older browsers
      media.addListener(listener)
    }

    return () => {
      if (typeof media.removeEventListener === 'function') {
        media.removeEventListener('change', listener)
      } else {
        media.removeListener(listener)
      }
    }
  }, [matches, query])

  return matches
}

// Hook for orientation
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const updateOrientation = () => {
      if (typeof window !== 'undefined' && window.screen?.orientation) {
        setOrientation(window.screen.orientation.angle === 0 || window.screen.orientation.angle === 180 ? 'portrait' : 'landscape')
      } else {
        // Fallback
        setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
      }
    }

    updateOrientation()

    window.addEventListener('orientationchange', updateOrientation)
    window.addEventListener('resize', updateOrientation)

    return () => {
      window.removeEventListener('orientationchange', updateOrientation)
      window.removeEventListener('resize', updateOrientation)
    }
  }, [])

  return orientation
}

// Hook for touch device detection
export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const checkTouchDevice = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      )
    }

    setIsTouchDevice(checkTouchDevice())
  }, [])

  return isTouchDevice
}

// Hook for viewport height (useful for mobile browsers)
export function useViewportHeight() {
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 768
  )

  useEffect(() => {
    const updateHeight = () => {
      setViewportHeight(window.innerHeight)
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    window.addEventListener('orientationchange', updateHeight)

    return () => {
      window.removeEventListener('resize', updateHeight)
      window.removeEventListener('orientationchange', updateHeight)
    }
  }, [])

  return viewportHeight
}

// Hook for safe area insets (iOS)
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  })

  useEffect(() => {
    const updateSafeArea = () => {
      if (typeof window !== 'undefined' && CSS.supports('padding', 'env(safe-area-inset-top)')) {
        const computedStyle = getComputedStyle(document.documentElement)
        
        setSafeArea({
          top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)')) || 0,
          right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)')) || 0,
          bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
          left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)')) || 0
        })
      }
    }

    updateSafeArea()
    window.addEventListener('orientationchange', updateSafeArea)

    return () => {
      window.removeEventListener('orientationchange', updateSafeArea)
    }
  }, [])

  return safeArea
}

// Hook for preferred color scheme
export function useColorScheme() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    setColorScheme(mediaQuery.matches ? 'dark' : 'light')

    const handleChange = (e: MediaQueryListEvent) => {
      setColorScheme(e.matches ? 'dark' : 'light')
    }

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  return colorScheme
}

// Hook for responsive component behavior
export function useResponsiveComponent<T extends Record<string, any>>(
  values: Partial<Record<Breakpoint, T>> & { default: T }
): T {
  const { currentBreakpoint, isBreakpoint } = useResponsive()

  // Find the appropriate value based on current breakpoint
  const getValue = (): T => {
    const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    
    // Find the largest breakpoint that matches
    for (let i = breakpointOrder.length - 1; i >= 0; i--) {
      const bp = breakpointOrder[i]
      if (values[bp] && isBreakpoint(bp)) {
        return { ...values.default, ...values[bp] }
      }
    }

    return values.default
  }

  const [value, setValue] = useState<T>(getValue)

  useEffect(() => {
    setValue(getValue())
  }, [currentBreakpoint])

  return value
}

// Hook for responsive grid columns
export function useResponsiveColumns(
  columns: Partial<Record<Breakpoint, number>> & { default: number }
): number {
  return useResponsiveComponent(columns)
}

// Utility function to create responsive classes
export function createResponsiveClasses(
  prefix: string,
  values: Partial<Record<Breakpoint, string | number>> & { default: string | number }
): string {
  const classes = [
    `${prefix}-${values.default}`
  ]

  Object.entries(values).forEach(([breakpoint, value]) => {
    if (breakpoint !== 'default') {
      classes.push(`${breakpoint}:${prefix}-${value}`)
    }
  })

  return classes.join(' ')
}

// Hook for responsive spacing
export function useResponsiveSpacing(
  spacing: Partial<Record<Breakpoint, number>> & { default: number }
): string {
  const currentSpacing = useResponsiveComponent(spacing)
  return `${currentSpacing * 0.25}rem` // Convert to rem (assuming 1 = 4px)
}

// Hook to detect if component should show mobile layout
export function useMobileLayout(threshold: Breakpoint = 'md'): boolean {
  const { isBreakpoint } = useResponsive()
  return !isBreakpoint(threshold)
}

// Hook for container queries (experimental)
export function useContainerQuery(containerRef: React.RefObject<HTMLElement>) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        })
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [containerRef])

  return containerSize
}
