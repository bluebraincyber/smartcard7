/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	screens: {
  		xs: '360px',
  		sm: '640px',
  		md: '768px',
  		lg: '1024px',
  		xl: '1280px',
  		'2xl': '1536px'
  	},
  	extend: {
  		fontSize: {
  			xs: 'var(--text-xs)',
  			sm: 'var(--text-sm)',
  			base: 'var(--text-base)',
  			lg: 'var(--text-lg)',
  			xl: 'var(--text-xl)',
  			'2xl': 'var(--text-2xl)',
  			'3xl': 'var(--text-3xl)',
  			'4xl': 'var(--text-4xl)'
  		},
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
  			'20': 'var(--space-20)'
  		},
  		colors: {
  			brand: {
  				blue: '#3072F9'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			'accent-purple': 'var(--accent-purple)',
  			'accent-purple-hover': 'var(--accent-purple-hover)',
  			success: 'var(--success)',
  			warning: 'var(--warning)',
  			error: 'var(--error)',
  			'bg-soft': 'var(--bg-soft)',
  			'bg-muted': 'var(--bg-muted)',
  			'bg-input': 'var(--bg-input)',
  			'bg-input-disabled': 'var(--bg-input-disabled)',
  			'chip-bg': 'var(--chip-bg)',
  			'text-strong': 'var(--text-strong)',
  			'text-muted': 'var(--text-muted)',
  			'text-light': 'var(--text-light)',
  			'text-placeholder': 'var(--text-placeholder)',
  			'text-inverse': 'var(--text-inverse)',
  			'border-light': 'var(--border-light)',
  			'border-input': 'var(--border-input)',
  			'border-focus': 'var(--border-focus)',
  			'border-error': 'var(--border-error)',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			sm: 'calc(var(--radius) - 4px)',
  			DEFAULT: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			lg: 'var(--radius)',
  			xl: 'var(--radius-xl)',
  			full: 'var(--radius-full)'
  		},
  		fontFamily: {
  			primary: 'var(--font-family-primary)',
  			secondary: 'var(--font-family-secondary)',
  			mono: 'var(--font-family-mono)'
  		},
  		fontWeight: {
  			normal: 'var(--font-normal)',
  			medium: 'var(--font-medium)',
  			semibold: 'var(--font-semibold)',
  			bold: 'var(--font-bold)'
  		},
  		lineHeight: {
  			tight: 'var(--leading-tight)',
  			normal: 'var(--leading-normal)',
  			relaxed: 'var(--leading-relaxed)'
  		},
  		boxShadow: {
  			sm: 'var(--shadow-sm)',
  			DEFAULT: 'var(--shadow)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  			'elevation-1': 'var(--elevation-1)',
  			'elevation-2': 'var(--elevation-2)',
  			'elevation-6': 'var(--elevation-6)',
  			'elevation-8': 'var(--elevation-8)'
  		},
  		height: {
  			button: 'var(--height-button)',
  			'button-lg': 'var(--height-button-lg)',
  			input: 'var(--height-input)',
  			'touch-target': 'var(--height-touch-target)',
  			appbar: 'var(--height-appbar)',
  			'appbar-lg': 'var(--height-appbar-lg)'
  		},
  		transitionDuration: {
  			fast: 'var(--duration-fast)',
  			normal: 'var(--duration-normal)',
  			slow: 'var(--duration-slow)'
  		},
  		transitionTimingFunction: {
  			'ease-in': 'var(--ease-in)',
  			'ease-out': 'var(--ease-out)',
  			'ease-in-out': 'var(--ease-in-out)'
  		},
  		zIndex: {
  			dropdown: 'var(--z-dropdown)',
  			sticky: 'var(--z-sticky)',
  			fixed: 'var(--z-fixed)',
  			'modal-backdrop': 'var(--z-modal-backdrop)',
  			modal: 'var(--z-modal)',
  			popover: 'var(--z-popover)',
  			tooltip: 'var(--z-tooltip)',
  			toast: 'var(--z-toast)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
