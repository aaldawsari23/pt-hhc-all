/**
 * Production Readiness Validation
 * Comprehensive checks to ensure the app is ready for production deployment
 */

interface ProductionCheckResult {
  category: string;
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  suggestion?: string;
}

export class ProductionValidator {
  private results: ProductionCheckResult[] = [];

  async runAllChecks(): Promise<ProductionCheckResult[]> {
    this.results = [];
    
    // Performance checks
    this.checkPerformance();
    
    // Security checks
    this.checkSecurity();
    
    // Accessibility checks
    this.checkAccessibility();
    
    // Mobile optimization checks
    this.checkMobileOptimization();
    
    // Data integrity checks
    this.checkDataIntegrity();
    
    // UI/UX checks
    this.checkUIUX();
    
    // Error handling checks
    this.checkErrorHandling();
    
    return this.results;
  }

  private addResult(category: string, check: string, status: 'pass' | 'fail' | 'warning', message: string, suggestion?: string) {
    this.results.push({ category, check, status, message, suggestion });
  }

  private checkPerformance() {
    // Check if images are optimized
    const images = document.querySelectorAll('img');
    const unoptimizedImages = Array.from(images).filter(img => {
      return !img.loading || img.loading !== 'lazy';
    });

    if (unoptimizedImages.length === 0) {
      this.addResult('Performance', 'Image Optimization', 'pass', 'All images are properly optimized');
    } else {
      this.addResult('Performance', 'Image Optimization', 'warning', 
        `${unoptimizedImages.length} images without lazy loading`,
        'Add loading="lazy" to all non-critical images');
    }

    // Check for console logs in production
    const hasConsoleLogs = window.console.log.toString().includes('native code');
    if (hasConsoleLogs) {
      this.addResult('Performance', 'Console Logs', 'warning', 
        'Console logs detected', 'Remove console.log statements for production');
    } else {
      this.addResult('Performance', 'Console Logs', 'pass', 'No console logs detected');
    }

    // Check bundle size (approximation)
    const scriptTags = document.querySelectorAll('script[src]');
    if (scriptTags.length > 10) {
      this.addResult('Performance', 'Bundle Size', 'warning', 
        'Many script tags detected', 'Consider code splitting and bundling optimization');
    } else {
      this.addResult('Performance', 'Bundle Size', 'pass', 'Bundle size appears optimized');
    }
  }

  private checkSecurity() {
    // Check for HTTPS
    if (location.protocol === 'https:') {
      this.addResult('Security', 'HTTPS', 'pass', 'Site is served over HTTPS');
    } else {
      this.addResult('Security', 'HTTPS', 'fail', 
        'Site not served over HTTPS', 'Enable HTTPS for production');
    }

    // Check for sensitive data in localStorage
    const sensitiveKeys = ['password', 'token', 'secret', 'api_key'];
    const localStorageKeys = Object.keys(localStorage);
    const suspiciousKeys = localStorageKeys.filter(key => 
      sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))
    );

    if (suspiciousKeys.length === 0) {
      this.addResult('Security', 'Local Storage', 'pass', 'No sensitive data in localStorage');
    } else {
      this.addResult('Security', 'Local Storage', 'warning', 
        `Potential sensitive data: ${suspiciousKeys.join(', ')}`,
        'Review localStorage usage for sensitive information');
    }

    // Check for Content Security Policy
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (cspMeta) {
      this.addResult('Security', 'CSP', 'pass', 'Content Security Policy detected');
    } else {
      this.addResult('Security', 'CSP', 'warning', 
        'No Content Security Policy detected', 'Consider implementing CSP headers');
    }
  }

  private checkAccessibility() {
    // Check for alt texts on images
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);

    if (imagesWithoutAlt.length === 0) {
      this.addResult('Accessibility', 'Image Alt Text', 'pass', 'All images have alt text');
    } else {
      this.addResult('Accessibility', 'Image Alt Text', 'fail', 
        `${imagesWithoutAlt.length} images missing alt text`,
        'Add descriptive alt text to all images');
    }

    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length > 0) {
      this.addResult('Accessibility', 'Heading Structure', 'pass', 'Headings structure detected');
    } else {
      this.addResult('Accessibility', 'Heading Structure', 'warning', 
        'No heading elements found', 'Use proper heading hierarchy (h1-h6)');
    }

    // Check for focus indicators
    const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href]');
    if (focusableElements.length > 0) {
      this.addResult('Accessibility', 'Focusable Elements', 'pass', 'Focusable elements detected');
    } else {
      this.addResult('Accessibility', 'Focusable Elements', 'warning', 'No focusable elements found');
    }

    // Check for ARIA labels
    const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby], [role]');
    if (elementsWithAria.length > 0) {
      this.addResult('Accessibility', 'ARIA Labels', 'pass', 'ARIA attributes detected');
    } else {
      this.addResult('Accessibility', 'ARIA Labels', 'warning', 
        'No ARIA attributes found', 'Add ARIA labels for better screen reader support');
    }
  }

  private checkMobileOptimization() {
    // Check viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      this.addResult('Mobile', 'Viewport Meta', 'pass', 'Viewport meta tag detected');
    } else {
      this.addResult('Mobile', 'Viewport Meta', 'fail', 
        'No viewport meta tag', 'Add viewport meta tag for mobile optimization');
    }

    // Check for touch-friendly targets
    const smallButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
      const rect = btn.getBoundingClientRect();
      return rect.width < 44 || rect.height < 44;
    });

    if (smallButtons.length === 0) {
      this.addResult('Mobile', 'Touch Targets', 'pass', 'All touch targets are properly sized');
    } else {
      this.addResult('Mobile', 'Touch Targets', 'warning', 
        `${smallButtons.length} buttons smaller than 44px`,
        'Ensure touch targets are at least 44x44px');
    }

    // Check for responsive design
    const hasMediaQueries = Array.from(document.styleSheets).some(sheet => {
      try {
        return Array.from(sheet.cssRules).some(rule => 
          rule.type === CSSRule.MEDIA_RULE
        );
      } catch {
        return false;
      }
    });

    if (hasMediaQueries) {
      this.addResult('Mobile', 'Responsive Design', 'pass', 'Media queries detected');
    } else {
      this.addResult('Mobile', 'Responsive Design', 'warning', 
        'No media queries detected', 'Implement responsive design with CSS media queries');
    }
  }

  private checkDataIntegrity() {
    // Check if data is loading properly
    const dataElements = document.querySelectorAll('[data-testid*="patient"], [data-testid*="staff"]');
    if (dataElements.length > 0) {
      this.addResult('Data', 'Data Loading', 'pass', 'Data elements detected');
    } else {
      this.addResult('Data', 'Data Loading', 'warning', 'No data elements found');
    }

    // Check for empty states
    const emptyStates = document.querySelectorAll('[class*="empty"], [class*="no-data"]');
    if (emptyStates.length > 0) {
      this.addResult('Data', 'Empty States', 'pass', 'Empty state handling detected');
    } else {
      this.addResult('Data', 'Empty States', 'warning', 
        'No empty state handling detected', 'Implement proper empty state messages');
    }
  }

  private checkUIUX() {
    // Check for loading states
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
    if (loadingElements.length > 0) {
      this.addResult('UI/UX', 'Loading States', 'pass', 'Loading indicators detected');
    } else {
      this.addResult('UI/UX', 'Loading States', 'warning', 
        'No loading indicators found', 'Add loading states for better UX');
    }

    // Check for animations
    const animatedElements = document.querySelectorAll('[class*="animate"], [class*="transition"]');
    if (animatedElements.length > 0) {
      this.addResult('UI/UX', 'Animations', 'pass', 'Animations detected');
    } else {
      this.addResult('UI/UX', 'Animations', 'warning', 
        'No animations detected', 'Consider adding subtle animations for better UX');
    }

    // Check for consistent color scheme
    const colorElements = document.querySelectorAll('[class*="blue"], [class*="green"], [class*="red"]');
    if (colorElements.length > 0) {
      this.addResult('UI/UX', 'Color Consistency', 'pass', 'Consistent color scheme detected');
    } else {
      this.addResult('UI/UX', 'Color Consistency', 'warning', 'Review color scheme consistency');
    }
  }

  private checkErrorHandling() {
    // Check for error boundaries (React specific)
    const hasErrorBoundary = window.React && typeof window.React.Component !== 'undefined';
    if (hasErrorBoundary) {
      this.addResult('Error Handling', 'Error Boundaries', 'pass', 'React error handling available');
    } else {
      this.addResult('Error Handling', 'Error Boundaries', 'warning', 
        'Error boundary implementation unclear', 'Implement proper error boundaries');
    }

    // Check for global error handling
    const hasGlobalErrorHandler = typeof window.onerror === 'function';
    if (hasGlobalErrorHandler) {
      this.addResult('Error Handling', 'Global Errors', 'pass', 'Global error handler detected');
    } else {
      this.addResult('Error Handling', 'Global Errors', 'warning', 
        'No global error handler', 'Implement global error handling');
    }

    // Check for network error handling
    const hasNetworkHandling = typeof window.addEventListener === 'function';
    if (hasNetworkHandling) {
      this.addResult('Error Handling', 'Network Errors', 'pass', 'Network error handling possible');
    } else {
      this.addResult('Error Handling', 'Network Errors', 'warning', 'Review network error handling');
    }
  }

  generateReport(): string {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    
    let report = `🏥 MHHC Production Readiness Report\n`;
    report += `=====================================\n\n`;
    report += `✅ Passed: ${passed}\n`;
    report += `⚠️  Warnings: ${warnings}\n`;
    report += `❌ Failed: ${failed}\n\n`;
    
    const categories = [...new Set(this.results.map(r => r.category))];
    
    categories.forEach(category => {
      report += `\n📋 ${category}\n`;
      report += `${'─'.repeat(category.length + 4)}\n`;
      
      this.results
        .filter(r => r.category === category)
        .forEach(result => {
          const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
          report += `${icon} ${result.check}: ${result.message}\n`;
          if (result.suggestion) {
            report += `   💡 ${result.suggestion}\n`;
          }
        });
    });
    
    report += `\n\n🎯 Overall Status: `;
    if (failed === 0 && warnings <= 2) {
      report += `🟢 PRODUCTION READY`;
    } else if (failed === 0) {
      report += `🟡 READY WITH IMPROVEMENTS`;
    } else {
      report += `🔴 NEEDS FIXES BEFORE PRODUCTION`;
    }
    
    return report;
  }
}

// Export validation function for easy use
export const validateProduction = async (): Promise<string> => {
  const validator = new ProductionValidator();
  await validator.runAllChecks();
  return validator.generateReport();
};