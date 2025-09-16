'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeAccessibilityTest } from '@/components/theme/ThemeAccessibilityTest';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/theme-context';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

// List of pages to test theme consistency
const PAGES_TO_TEST = [
  { path: '/', name: 'Home' },
  { path: '/auth/login', name: 'Login' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/dashboard/settings', name: 'Settings' },
];

export default function ThemeTestPage() {
  const router = useRouter();
  const { theme, toggleTheme, setTheme } = useTheme();
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  // Run theme tests
  const runThemeTests = async () => {
    setIsTesting(true);
    const results: Record<string, boolean> = {};

    // Test current page first
    try {
      setCurrentTest('Current Page');
      const themeBefore = theme;
      const targetTheme = theme === 'light' ? 'dark' : 'light';
      
      // Test theme toggle
      setTheme(targetTheme);
      await new Promise(resolve => setTimeout(resolve, 100));
      results['Theme Toggle'] = document.documentElement.classList.contains(targetTheme);
      
      // Test persistence
      window.history.pushState({}, '', window.location.href);
      await new Promise(resolve => setTimeout(resolve, 100));
      results['Theme Persistence'] = document.documentElement.classList.contains(targetTheme);
      
      // Restore theme
      setTheme(themeBefore);
    } catch (error) {
      console.error('Error running theme tests:', error);
      results['Current Page'] = false;
    }

    setTestResults(results);
    setIsTesting(false);
    setCurrentTest('');
  };

  // Navigate to a page and test theme
  const testPage = async (path: string, name: string) => {
    setCurrentTest(`Navigating to ${name}...`);
    router.push(path);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Theme Testing Suite</h1>
      
      <div className="space-y-8">
        {/* Theme Controls */}
        <section className="space-y-4 p-6 bg-card rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Theme Controls</h2>
              <p className="text-muted-foreground">
                Current Theme: <span className="font-medium capitalize">{theme}</span>
              </p>
            </div>
            <Button onClick={toggleTheme} disabled={isTesting}>
              Toggle Theme
            </Button>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={() => setTheme('light')} disabled={theme === 'light' || isTesting}>
              Set Light
            </Button>
            <Button variant="outline" onClick={() => setTheme('dark')} disabled={theme === 'dark' || isTesting}>
              Set Dark
            </Button>
            <Button variant="outline" onClick={runThemeTests} disabled={isTesting}>
              {isTesting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                'Run Tests'
              )}
            </Button>
          </div>
          
          {isTesting && (
            <div className="pt-2 text-sm text-muted-foreground flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              {currentTest || 'Running tests...'}
            </div>
          )}
        </section>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <section className="space-y-4 p-6 bg-card rounded-lg border">
            <h2 className="text-2xl font-semibold">Test Results</h2>
            <div className="space-y-2">
              {Object.entries(testResults).map(([test, passed]) => (
                <div key={test} className="flex items-center gap-2">
                  {passed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-brand-blue" />
                  )}
                  <span>{test}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Page Navigation */}
        <section className="space-y-4 p-6 bg-card rounded-lg border">
          <h2 className="text-2xl font-semibold">Test Pages</h2>
          <p className="text-muted-foreground">
            Navigate to different pages to test theme consistency.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PAGES_TO_TEST.map((page) => (
              <Button
                key={page.path}
                variant="outline"
                onClick={() => testPage(page.path, page.name)}
                className="justify-start"
              >
                {page.name}
              </Button>
            ))}
          </div>
        </section>

        {/* Accessibility Tests */}
        <section className="space-y-4 p-6 bg-card rounded-lg border">
          <h2 className="text-2xl font-semibold">Accessibility Checks</h2>
          <p className="text-muted-foreground">
            Verify that text and UI elements maintain proper contrast ratios.
          </p>
          <ThemeAccessibilityTest />
        </section>

        {/* Theme Colors */}
        <section className="space-y-4 p-6 bg-card rounded-lg border">
          <h2 className="text-2xl font-semibold">Theme Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Background Colors */}
            <div className="space-y-2">
              <h3 className="font-medium">Backgrounds</h3>
              <div className="space-y-2">
                <div className="p-4 bg-background border rounded-md">
                  <p className="text-foreground">Background</p>
                  <p className="text-muted-foreground text-sm">var(--background)</p>
                </div>
                <div className="p-4 bg-card border rounded-md">
                  <p className="text-foreground">Card</p>
                  <p className="text-muted-foreground text-sm">var(--card)</p>
                </div>
                <div className="p-4 bg-muted border rounded-md">
                  <p className="text-foreground">Muted</p>
                  <p className="text-muted-foreground text-sm">var(--muted)</p>
                </div>
              </div>
            </div>
            
            {/* Text Colors */}
            <div className="space-y-2">
              <h3 className="font-medium">Text & UI</h3>
              <div className="space-y-2">
                <div className="p-4 bg-card border rounded-md space-y-2">
                  <p className="text-foreground">Default Text</p>
                  <p className="text-muted-foreground">Muted Text</p>
                  <p className="text-primary">Primary Text</p>
                  <p className="text-destructive">Destructive Text</p>
                  <div className="pt-2">
                    <Button size="sm">Primary Button</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
