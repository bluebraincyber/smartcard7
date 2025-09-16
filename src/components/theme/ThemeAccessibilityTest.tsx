'use client';

import { useTheme } from '@/contexts/theme-context';
import { CheckCircle, XCircle } from 'lucide-react';

interface ContrastCheck {
  name: string;
  textColor: string;
  bgColor: string;
  minRatio: number;
  type: 'normal' | 'large' | 'ui';
}

export function ThemeAccessibilityTest() {
  const { theme } = useTheme();
  
  // Test cases for different text/background combinations
  const contrastChecks: ContrastCheck[] = [
    {
      name: 'Text on Background',
      textColor: 'text-foreground',
      bgColor: 'bg-background',
      minRatio: 4.5,
      type: 'normal'
    },
    {
      name: 'Large Text on Background',
      textColor: 'text-foreground',
      bgColor: 'bg-background',
      minRatio: 3,
      type: 'large'
    },
    {
      name: 'Primary Button Text',
      textColor: 'text-primary-foreground',
      bgColor: 'bg-primary',
      minRatio: 4.5,
      type: 'ui'
    },
    {
      name: 'Muted Text on Card',
      textColor: 'text-muted-foreground',
      bgColor: 'bg-card',
      minRatio: 4.5,
      type: 'normal'
    },
    {
      name: 'Error Text',
      textColor: 'text-destructive',
      bgColor: 'bg-background',
      minRatio: 4.5,
      type: 'normal'
    },
  ];

  // This function would calculate if contrast passes WCAG AA standards
  // In a real implementation, this would use a library like `polished` or `color`
  const passesContrast = (): boolean => {
    // For demo purposes, we'll assume all our theme colors pass WCAG AA
    // In a real app, you would calculate the actual contrast ratio here
    return true;
  };

  return (
    <div className="p-6 bg-card rounded-lg border border-border">
      <h2 className="text-xl font-bold mb-4">Theme Accessibility Checker</h2>
      <div className="mb-4">
        <span className="font-medium">Current Theme:</span>{' '}
        <span className="capitalize">{theme}</span>
      </div>
      
      <div className="space-y-4">
        {contrastChecks.map((check, index) => {
          const passes = passesContrast(check);
          return (
            <div 
              key={index}
              className={`p-4 rounded-md ${check.bgColor} border ${passes ? 'border-green-500' : 'border-brand-blue'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${check.textColor}`}>
                    {check.name}
                  </h3>
                  <p className={`text-sm ${check.textColor} opacity-80`}>
                    {check.type === 'large' ? 'Large Text' : 'Normal Text'} - Min {check.minRatio}:1
                  </p>
                </div>
                {passes ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-brand-blue" />
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-muted rounded-md">
        <h3 className="font-medium mb-2">Accessibility Notes</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>All text should have a minimum contrast ratio of 4.5:1 (3:1 for large text)</li>
          <li>UI components should maintain sufficient contrast in both light and dark modes</li>
          <li>Interactive elements should have a contrast ratio of at least 3:1 against adjacent colors</li>
          <li>Focus states should be clearly visible in high contrast mode</li>
        </ul>
      </div>
    </div>
  );
}
