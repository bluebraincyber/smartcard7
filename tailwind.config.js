import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"], // controle via classe .dark na <html> ou <body>
  content: [
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:        "hsl(var(--bg) / <alpha-value>)",
        fg:        "hsl(var(--fg) / <alpha-value>)",

        card:      "hsl(var(--card) / <alpha-value>)",
        "card-fg": "hsl(var(--card-fg) / <alpha-value>)",

        muted:     "hsl(var(--muted) / <alpha-value>)",
        "muted-fg":"hsl(var(--muted-fg) / <alpha-value>)",

        popover:   "hsl(var(--popover) / <alpha-value>)",
        "popover-fg":"hsl(var(--popover-fg) / <alpha-value>)",

        border:    "hsl(var(--border) / <alpha-value>)",
        input:     "hsl(var(--input) / <alpha-value>)",
        ring:      "hsl(var(--ring) / <alpha-value>)",

        primary:   "hsl(var(--primary) / <alpha-value>)",
        "primary-fg":"hsl(var(--primary-fg) / <alpha-value>)",

        secondary: "hsl(var(--secondary) / <alpha-value>)",
        "secondary-fg":"hsl(var(--secondary-fg) / <alpha-value>)",

        accent:    "hsl(var(--accent) / <alpha-value>)",
        "accent-fg":"hsl(var(--accent-fg) / <alpha-value>)",

        success:   "hsl(var(--success) / <alpha-value>)",
        "success-fg":"hsl(var(--success-fg) / <alpha-value>)",

        warning:   "hsl(var(--warning) / <alpha-value>)",
        "warning-fg":"hsl(var(--warning-fg) / <alpha-value>)",

        destructive:"hsl(var(--destructive) / <alpha-value>)",
        "destructive-fg":"hsl(var(--destructive-fg) / <alpha-value>)",

        info:      "hsl(var(--info) / <alpha-value>)",
        "info-fg": "hsl(var(--info-fg) / <alpha-value>)",

        // Mantendo algumas cores do sistema atual para compatibilidade
        background: "hsl(var(--bg) / <alpha-value>)",
        foreground: "hsl(var(--fg) / <alpha-value>)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
      },
      borderRadius: {
        xl: "1rem",
        '2xl': "1.25rem",
      },
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
