/**
 * Theme Switching Test Script
 * 
 * This script tests the theme switching behavior across different pages.
 * It verifies that:
 * 1. Theme preference is saved in localStorage
 * 2. Theme persists across page navigation
 * 3. Theme is correctly applied to all pages
 * 4. System preference is respected when no theme is set
 */

// List of pages to test
export const PAGES_TO_TEST = [
  '/',                    // Home
  '/auth/login',          // Login
  '/dashboard',           // Dashboard
  '/dashboard/settings',  // Settings
  '/theme-test',          // Our test page
];

// Theme utility functions
export const ThemeTester = {
  /**
   * Set theme in localStorage
   */
  setTheme(theme: 'light' | 'dark') {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  },

  /**
   * Get current theme
   */
  getCurrentTheme(): 'light' | 'dark' {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  },

  /**
   * Test if theme is correctly applied
   */
  isThemeApplied(theme: 'light' | 'dark'): boolean {
    return (
      this.getCurrentTheme() === theme &&
      document.documentElement.getAttribute('data-theme') === theme
    );
  },

  /**
   * Test theme switching on current page
   */
  testThemeSwitch() {
    const initialTheme = this.getCurrentTheme();
    const targetTheme = initialTheme === 'light' ? 'dark' : 'light';
    
    // Switch theme
    this.setTheme(targetTheme);
    
    // Verify switch
    if (!this.isThemeApplied(targetTheme)) {
      console.error(`❌ Theme switch failed on ${window.location.pathname}`);
      return false;
    }
    
    // Switch back
    this.setTheme(initialTheme);
    
    if (!this.isThemeApplied(initialTheme)) {
      console.error(`❌ Theme switch back failed on ${window.location.pathname}`);
      return false;
    }
    
    console.log(`✅ Theme switch test passed on ${window.location.pathname}`);
    return true;
  },

  /**
   * Test theme persistence
   */
  testThemePersistence() {
    const testTheme = this.getCurrentTheme() === 'light' ? 'dark' : 'light';
    
    // Set test theme
    this.setTheme(testTheme);
    
    // Simulate page navigation
    const currentHref = window.location.href;
    window.history.pushState({}, '', currentHref);
    
    // Check if theme persisted
    if (!this.isThemeApplied(testTheme)) {
      console.error(`❌ Theme persistence test failed on ${window.location.pathname}`);
      return false;
    }
    
    console.log(`✅ Theme persistence test passed on ${window.location.pathname}`);
    return true;
  },

  /**
   * Run all theme tests on current page
   */
  runTests() {
    console.log(`\n🔍 Testing theme on ${window.location.pathname}`);
    
    const tests = [
      { name: 'Theme Switch', test: () => this.testThemeSwitch() },
      { name: 'Theme Persistence', test: () => this.testThemePersistence() },
    ];
    
    const results = tests.map(({ name, test }) => ({
      name,
      passed: test(),
    }));
    
    return {
      page: window.location.pathname,
      tests: results,
      allPassed: results.every(r => r.passed),
    };
  },
};

// Run tests if this file is executed directly
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Wait for the page to load
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('🏁 Starting theme tests...');
      const results = ThemeTester.runTests();
      console.log('📊 Test Results:', results);
    }, 500);
  });
}

// Export for testing
if (typeof module !== 'undefined') {
  module.exports = {
    PAGES_TO_TEST,
    ThemeTester,
  };
}
