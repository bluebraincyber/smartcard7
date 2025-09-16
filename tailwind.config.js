/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // === MOBILE-FIRST BREAKPOINTS ===
    screens: {
      'xs': '375px',   // Mobile pequeno (iPhone SE)
      'sm': '640px',   // Mobile grande / Tablet pequeno
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop pequeno
      'xl': '1280px',  // Desktop médio
      '2xl': '1536px', // Desktop grande
    },
    
    extend: {
      colors: {
        // === CORE THEME COLORS ===
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        
        // === COMPONENT COLORS (seguindo design-tokens.css) ===
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        
        // === BORDERS & INPUTS ===
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        
        // === BRAND COLORS ===
        'brand-red': 'var(--brand-red)',
        'brand-red-hover': 'var(--brand-red-hover)',
        'accent-purple': 'var(--accent-purple)',
        'accent-purple-hover': 'var(--accent-purple-hover)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        
        // === BACKGROUND SYSTEM ===
        'bg-soft': 'var(--bg-soft)',
        'bg-muted': 'var(--bg-muted)',
        'bg-input': 'var(--bg-input)',
        'bg-input-disabled': 'var(--bg-input-disabled)',
        'chip-bg': 'var(--chip-bg)',
        
        // === TEXT COLORS ===
        'text-strong': 'var(--text-strong)',
        'text-muted': 'var(--text-muted)',
        'text-light': 'var(--text-light)',
        'text-placeholder': 'var(--text-placeholder)',
        'text-inverse': 'var(--text-inverse)',
        
        // === BORDER VARIATIONS ===
        'border-light': 'var(--border-light)',
        'border-input': 'var(--border-input)',
        'border-focus': 'var(--border-focus)',
        'border-error': 'var(--border-error)',
      },
      
      // === SPACING (baseado nas variáveis) ===
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
      },
      
      // === BORDER RADIUS ===
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'DEFAULT': 'var(--radius)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        'full': 'var(--radius-full)',
      },
      
      // === TYPOGRAPHY ===
      fontFamily: {
        'primary': 'var(--font-family-primary)',
        'secondary': 'var(--font-family-secondary)',
        'mono': 'var(--font-family-mono)',
      },
      
      fontSize: {
        'xs': 'var(--text-xs)',
        'sm': 'var(--text-sm)',
        'base': 'var(--text-base)',
        'lg': 'var(--text-lg)',
        'xl': 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
      },
      
      fontWeight: {
        'normal': 'var(--font-normal)',
        'medium': 'var(--font-medium)',
        'semibold': 'var(--font-semibold)',
        'bold': 'var(--font-bold)',
      },
      
      lineHeight: {
        'tight': 'var(--leading-tight)',
        'normal': 'var(--leading-normal)',
        'relaxed': 'var(--leading-relaxed)',
      },
      
      // === SHADOWS ===
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'DEFAULT': 'var(--shadow)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'elevation-1': 'var(--elevation-1)',
        'elevation-2': 'var(--elevation-2)',
        'elevation-6': 'var(--elevation-6)',
        'elevation-8': 'var(--elevation-8)',
      },
      
      // === HEIGHTS (para componentes) ===
      height: {
        'button': 'var(--height-button)',
        'button-lg': 'var(--height-button-lg)',
        'input': 'var(--height-input)',
        'touch-target': 'var(--height-touch-target)',
        'appbar': 'var(--height-appbar)',
        'appbar-lg': 'var(--height-appbar-lg)',
      },
      
      // === ANIMATION DURATIONS ===
      transitionDuration: {
        'fast': 'var(--duration-fast)',
        'normal': 'var(--duration-normal)',
        'slow': 'var(--duration-slow)',
      },
      
      // === ANIMATION EASINGS ===
      transitionTimingFunction: {
        'ease-in': 'var(--ease-in)',
        'ease-out': 'var(--ease-out)',
        'ease-in-out': 'var(--ease-in-out)',
      },
      
      // === Z-INDEX ===
      zIndex: {
        'dropdown': 'var(--z-dropdown)',
        'sticky': 'var(--z-sticky)',
        'fixed': 'var(--z-fixed)',
        'modal-backdrop': 'var(--z-modal-backdrop)',
        'modal': 'var(--z-modal)',
        'popover': 'var(--z-popover)',
        'tooltip': 'var(--z-tooltip)',
        'toast': 'var(--z-toast)',
      },
    },
  },
  plugins: [],
}
