// Store page configuration and constants

export const STORE_CONFIG = {
  // Layout
  GRID_COLUMNS: {
    xs: 1,   // 0-639px
    sm: 2,   // 640px+
    md: 2,   // 768px+
    lg: 3,   // 1024px+
    xl: 4,   // 1280px+
    '2xl': 5 // 1536px+
  },
  
  // Product card
  CARD_LAYOUT: {
    default: 'grid', // 'grid' | 'list'
    breakpoints: {
      sm: 'grid',
      md: 'grid',
      lg: 'grid'
    }
  },
  
  // Pagination
  ITEMS_PER_PAGE: 12,
  
  // Image settings
  IMAGE_SIZES: {
    thumb: {
      width: 100,
      height: 100
    },
    small: {
      width: 200,
      height: 200
    },
    medium: {
      width: 400,
      height: 400
    },
    large: {
      width: 800,
      height: 800
    }
  },
  
  // Form validation
  VALIDATION: {
    PRODUCT: {
      NAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 100
      },
      DESCRIPTION: {
        MAX_LENGTH: 1000
      },
      PRICE: {
        MIN: 0,
        MAX: 1000000
      }
    },
    CATEGORY: {
      NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 50
      },
      DESCRIPTION: {
        MAX_LENGTH: 500
      }
    }
  },
  
  // Default values
  DEFAULTS: {
    CURRENCY: 'BRL',
    LOCALE: 'pt-BR',
    DATE_FORMAT: 'dd/MM/yyyy',
    TIME_FORMAT: 'HH:mm',
    DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
    
    // Default product image
    PRODUCT_IMAGE: '/images/product-placeholder.png',
    
    // Default store colors
    COLORS: {
      primary: '#3B82F6',
      secondary: '#6B7280',
      success: '#10B981',
      danger: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
      light: '#F9FAFB',
      dark: '#111827'
    },
    
    // Default store theme
    THEME: {
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        error: '#EF4444',
        onPrimary: '#FFFFFF',
        onSecondary: '#FFFFFF',
        onBackground: '#111827',
        onSurface: '#111827',
        onError: '#FFFFFF'
      },
      typography: {
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        fontSize: '16px',
        fontWeight: 400,
        lineHeight: 1.5,
        h1: {
          fontSize: '2.5rem',
          fontWeight: 700,
          lineHeight: 1.2
        },
        h2: {
          fontSize: '2rem',
          fontWeight: 600,
          lineHeight: 1.25
        },
        h3: {
          fontSize: '1.75rem',
          fontWeight: 600,
          lineHeight: 1.3
        },
        h4: {
          fontSize: '1.5rem',
          fontWeight: 600,
          lineHeight: 1.35
        },
        h5: {
          fontSize: '1.25rem',
          fontWeight: 600,
          lineHeight: 1.4
        },
        h6: {
          fontSize: '1rem',
          fontWeight: 600,
          lineHeight: 1.5
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px'
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        none: 'none'
      },
      transition: {
        DEFAULT: 'all 0.2s ease-in-out',
        none: 'none',
        all: 'all 0.2s ease-in-out',
        colors: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out, fill 0.2s ease-in-out',
        opacity: 'opacity 0.2s ease-in-out',
        shadow: 'box-shadow 0.2s ease-in-out',
        transform: 'transform 0.2s ease-in-out'
      },
      zIndex: {
        auto: 'auto',
        0: '0',
        10: '10',
        20: '20',
        30: '30',
        40: '40',
        50: '50',
        1000: '1000',
        2000: '2000',
        3000: '3000',
        4000: '4000',
        5000: '5000',
        max: '9999'
      }
    }
  },
  
  // API endpoints
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
    ENDPOINTS: {
      PRODUCTS: '/products',
      CATEGORIES: '/categories',
      UPLOADS: '/uploads',
      ORDERS: '/orders',
      CUSTOMERS: '/customers',
      SETTINGS: '/settings'
    },
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 second
  },
  
  // Feature flags
  FEATURES: {
    ENABLE_ANALYTICS: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_OFFLINE_MODE: false,
    ENABLE_PUSH_NOTIFICATIONS: false,
    ENABLE_SOCIAL_LOGIN: true,
    ENABLE_MULTI_CURRENCY: false,
    ENABLE_MULTI_LANGUAGE: false
  },
  
  // Local storage keys
  STORAGE_KEYS: {
    THEME: 'store_theme',
    CART: 'store_cart',
    RECENT_VIEWED: 'store_recent_viewed',
    WISHLIST: 'store_wishlist',
    COMPARE: 'store_compare',
    SESSION: 'store_session',
    SETTINGS: 'store_settings',
    NOTIFICATIONS: 'store_notifications'
  },
  
  // Breakpoints (in pixels)
  BREAKPOINTS: {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  },
  
  // Media queries
  MEDIA_QUERIES: {
    xs: '(min-width: 0px)',
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    '2xl': '(min-width: 1536px)',
    portrait: '(orientation: portrait)',
    landscape: '(orientation: landscape)',
    dark: '(prefers-color-scheme: dark)',
    light: '(prefers-color-scheme: light)',
    motion: '(prefers-reduced-motion: no-preference)',
    hover: '(hover: hover)',
    touch: '(hover: none) and (pointer: coarse)'
  },
  
  // Animation durations (in milliseconds)
  ANIMATION: {
    FAST: 150,
    NORMAL: 250,
    SLOW: 400,
    VERY_SLOW: 600
  }
} as const;

// Export types
export type StoreConfig = typeof STORE_CONFIG;
export type Breakpoint = keyof typeof STORE_CONFIG.BREAKPOINTS;
