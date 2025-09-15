# SmartCard7 Theme System Guide

This guide provides comprehensive documentation for working with the SmartCard7 theme system, including how to use theme variables, implement new components, and maintain consistency across the application.

## Table of Contents
- [Theme Architecture](#theme-architecture)
- [Using Theme Variables](#using-theme-variables)
- [Creating Theme-Aware Components](#creating-theme-aware-components)
- [Theme Context API](#theme-context-api)
- [Best Practices](#best-practices)
- [Testing Theme Changes](#testing-theme-changes)
- [Troubleshooting](#troubleshooting)

## Theme Architecture

The SmartCard7 theme system is built on top of CSS custom properties (variables) and React Context. The system supports:

- **Light and Dark** themes
- **System preference** detection
- **Persistence** of user preference
- **Smooth transitions** between themes

Key files:
- `src/contexts/theme-context.tsx` - Theme provider and hooks
- `src/styles/design-tokens.css` - Theme variables and styles
- `tailwind.config.js` - Tailwind CSS theme configuration
- `src/app/globals.css` - Global styles using theme variables

## Using Theme Variables

### CSS Variables

All theme variables are defined in `design-tokens.css`. Use these variables directly in your CSS:

```css
.my-component {
  background-color: var(--background);
  color: var(--foreground);
  border: 1px solid var(--border);
}
```

### Tailwind CSS Classes

For Tailwind classes, use the theme-aware variants:

```tsx
<div className="bg-background text-foreground border border-border">
  Content
</div>
```

### Available Theme Variables

| Variable | Light Theme | Dark Theme | Usage |
|----------|-------------|------------|-------|
| `--background` | `#ffffff` | `#0f172a` | Main background |
| `--foreground` | `#111418` | `#f8fafc` | Primary text |
| `--card` | `#f9fafb` | `#1e293b` | Card backgrounds |
| `--card-foreground` | `#111827` | `#f8fafc` | Text on cards |
| `--muted` | `#f1f5f9` | `#334155` | Muted backgrounds |
| `--muted-foreground` | `#64748b` | `#94a3b8` | Muted text |
| `--primary` | `#e11d48` | `#f43f5e` | Primary brand color |
| `--primary-foreground` | `#f8fafc` | `#0f172a` | Text on primary |
| `--border` | `#e2e8f0` | `#334155` | Border color |
| `--input` | `#e2e8f0` | `#334155` | Input borders |
| `--ring` | `#e11d48` | `#f43f5e` | Focus ring color |

## Creating Theme-Aware Components

### Basic Component

Use theme variables for all colors and styles:

```tsx
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive';
}

export function Badge({ 
  className, 
  variant = 'default',
  ...props 
}: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        {
          'border-transparent bg-primary text-primary-foreground': variant === 'default',
          'border-border bg-muted text-muted-foreground': variant === 'secondary',
          'border-destructive/20 bg-destructive/10 text-destructive': variant === 'destructive',
        },
        className
      )}
      {...props}
    />
  );
}
```

### Using Theme Context

Access and modify the current theme using the `useTheme` hook:

```tsx
'use client';

import { useTheme } from '@/contexts/theme-context';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => setTheme('light')}
        className={cn(
          'p-2 rounded-md',
          theme === 'light' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
        )}
      >
        Light
      </button>
      <button 
        onClick={() => setTheme('dark')}
        className={cn(
          'p-2 rounded-md',
          theme === 'dark' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
        )}
      >
        Dark
      </button>
    </div>
  );
}
```

## Theme Context API

### useTheme()

```typescript
const { 
  theme,         // 'light' | 'dark'
  setTheme,      // (theme: 'light' | 'dark') => void
  toggleTheme,   // () => void
} = useTheme();
```

### ThemeProvider

Wrap your application with the `ThemeProvider` in your root layout:

```tsx
import { ThemeProvider } from '@/contexts/theme-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Best Practices

1. **Always use theme variables** for colors, spacing, and other design tokens
2. **Avoid hardcoded colors** in your components
3. **Test in both themes** during development
4. **Use semantic variable names** (e.g., `--primary` instead of `--red-500`)
5. **Keep contrast ratios** accessible (minimum 4.5:1 for normal text)
6. **Use the `cn` utility** for conditional class names

## Testing Theme Changes

1. Use the theme test page at `/theme-test` to verify changes
2. Test all interactive states (hover, focus, active)
3. Verify contrast ratios with the built-in accessibility checker
4. Test on different devices and screen sizes

## Troubleshooting

### Theme not applying
- Ensure the `ThemeProvider` wraps your application
- Check for CSS specificity issues
- Verify no hardcoded colors are overriding theme variables

### Flash of unstyled content (FOUC)
- The theme script in `layout.tsx` should prevent this
- Ensure the script runs before the page renders

### Inconsistent theming
- Verify all components use theme variables
- Check for missing or incorrect theme class names
- Ensure proper nesting of theme providers

## Adding New Theme Variables

1. Add the variable to `design-tokens.css` for both light and dark themes
2. Update the `tailwind.config.js` if needed
3. Document the new variable in this guide
4. Test in both themes

## Performance Considerations

- Theme switching is optimized with CSS variables (no re-renders needed)
- Keep the number of theme variables reasonable
- Avoid complex calculations in CSS variables

## Browser Support

The theme system works in all modern browsers. For older browsers:
- Add appropriate fallbacks
- Consider using a CSS preprocessor for better compatibility

## Contributing

When making changes to the theme system:
1. Update this documentation
2. Add tests if possible
3. Test in both themes
4. Verify accessibility

---

For questions or issues, please refer to the project's issue tracker or contact the maintainers.
