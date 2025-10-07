/**
 * Production Validation Utilities
 * Comprehensive validation for production readiness
 */

interface ValidationResult {
    passed: boolean;
    message: string;
    severity: 'error' | 'warning' | 'info';
    category: string;
}

interface ValidationReport {
    overall: 'PASS' | 'FAIL' | 'WARNING';
    score: number;
    results: ValidationResult[];
    recommendations: string[];
}

class ProductionValidator {
    private results: ValidationResult[] = [];

    // Mobile-First Design Validation
    validateMobileFirst(): ValidationResult[] {
        const results: ValidationResult[] = [];

        // Check for mobile-first CSS classes
        const hasMobileClasses = document.querySelector('.mobile-grid, .mobile-card, .mobile-button, .touch-target-44');
        results.push({
            passed: !!hasMobileClasses,
            message: hasMobileClasses ? 'Mobile-first CSS classes detected' : 'Missing mobile-first CSS classes',
            severity: hasMobileClasses ? 'info' : 'warning',
            category: 'Mobile Design'
        });

        // Check viewport meta tag
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        const hasCorrectViewport = viewportMeta?.getAttribute('content')?.includes('width=device-width');
        results.push({
            passed: !!hasCorrectViewport,
            message: hasCorrectViewport ? 'Correct viewport meta tag found' : 'Missing or incorrect viewport meta tag',
            severity: hasCorrectViewport ? 'info' : 'error',
            category: 'Mobile Design'
        });

        // Check for responsive images
        const responsiveImages = document.querySelectorAll('img[srcset], picture source');
        results.push({
            passed: responsiveImages.length > 0,
            message: responsiveImages.length > 0 ? 'Responsive images detected' : 'No responsive images found',
            severity: responsiveImages.length > 0 ? 'info' : 'warning',
            category: 'Mobile Design'
        });

        return results;
    }

    // Accessibility Validation
    validateAccessibility(): ValidationResult[] {
        const results: ValidationResult[] = [];

        // Check for skip links
        const skipLinks = document.querySelectorAll('a[href="#main-content"], .sr-only');
        results.push({
            passed: skipLinks.length > 0,
            message: skipLinks.length > 0 ? 'Skip links found for keyboard navigation' : 'Missing skip links',
            severity: skipLinks.length > 0 ? 'info' : 'warning',
            category: 'Accessibility'
        });

        // Check for alt attributes on images
        const images = document.querySelectorAll('img');
        const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt'));
        results.push({
            passed: imagesWithoutAlt.length === 0,
            message: imagesWithoutAlt.length === 0 ? 'All images have alt attributes' : `${imagesWithoutAlt.length} images missing alt attributes`,
            severity: imagesWithoutAlt.length === 0 ? 'info' : 'error',
            category: 'Accessibility'
        });

        // Check for ARIA labels on interactive elements
        const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        const unlabeledButtons = Array.from(buttons).filter(btn => !btn.textContent?.trim());
        results.push({
            passed: unlabeledButtons.length === 0,
            message: unlabeledButtons.length === 0 ? 'All buttons have accessible labels' : `${unlabeledButtons.length} buttons missing accessible labels`,
            severity: unlabeledButtons.length === 0 ? 'info' : 'warning',
            category: 'Accessibility'
        });

        // Check for live regions
        const liveRegions = document.querySelectorAll('[aria-live]');
        results.push({
            passed: liveRegions.length > 0,
            message: liveRegions.length > 0 ? 'Live regions found for screen readers' : 'No live regions found',
            severity: liveRegions.length > 0 ? 'info' : 'warning',
            category: 'Accessibility'
        });

        return results;
    }

    // Performance Validation
    validatePerformance(): ValidationResult[] {
        const results: ValidationResult[] = [];

        // Check for performance API support
        const hasPerformanceAPI = 'performance' in window && 'getEntriesByType' in performance;
        results.push({
            passed: hasPerformanceAPI,
            message: hasPerformanceAPI ? 'Performance API available' : 'Performance API not supported',
            severity: hasPerformanceAPI ? 'info' : 'warning',
            category: 'Performance'
        });

        if (hasPerformanceAPI) {
            // Check navigation timing
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            if (navigation) {
                const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
                results.push({
                    passed: loadTime < 3000,
                    message: `Page load time: ${loadTime.toFixed(0)}ms`,
                    severity: loadTime < 1000 ? 'info' : loadTime < 3000 ? 'warning' : 'error',
                    category: 'Performance'
                });

                const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
                results.push({
                    passed: domContentLoaded < 2000,
                    message: `DOM Content Loaded: ${domContentLoaded.toFixed(0)}ms`,
                    severity: domContentLoaded < 800 ? 'info' : domContentLoaded < 2000 ? 'warning' : 'error',
                    category: 'Performance'
                });
            }

            // Check for large resources
            const resources = performance.getEntriesByType('resource');
            const largeResources = resources.filter(r => r.transferSize > 1024 * 1024); // > 1MB
            results.push({
                passed: largeResources.length === 0,
                message: largeResources.length === 0 ? 'No large resources detected' : `${largeResources.length} resources > 1MB`,
                severity: largeResources.length === 0 ? 'info' : 'warning',
                category: 'Performance'
            });
        }

        // Check for lazy loading
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        results.push({
            passed: lazyImages.length > 0,
            message: lazyImages.length > 0 ? 'Lazy loading implemented' : 'No lazy loading detected',
            severity: lazyImages.length > 0 ? 'info' : 'warning',
            category: 'Performance'
        });

        return results;
    }

    // RTL and Arabic Support Validation
    validateRTLSupport(): ValidationResult[] {
        const results: ValidationResult[] = [];

        // Check for RTL classes and attributes
        const hasRTLSupport = document.querySelector('[dir="rtl"], .rtl-mode') || 
                             document.documentElement.dir === 'rtl';
        results.push({
            passed: !!hasRTLSupport,
            message: hasRTLSupport ? 'RTL support detected' : 'No RTL support found',
            severity: hasRTLSupport ? 'info' : 'warning',
            category: 'RTL Support'
        });

        // Check for Arabic text content
        const arabicTextRegex = /[\u0600-\u06FF\u0750-\u077F]/;
        const hasArabicText = arabicTextRegex.test(document.body.textContent || '');
        results.push({
            passed: hasArabicText,
            message: hasArabicText ? 'Arabic text content found' : 'No Arabic text detected',
            severity: hasArabicText ? 'info' : 'warning',
            category: 'RTL Support'
        });

        // Check for Arabic font families
        const styles = getComputedStyle(document.body);
        const fontFamily = styles.fontFamily.toLowerCase();
        const hasArabicFonts = fontFamily.includes('arabic') || 
                              fontFamily.includes('cairo') || 
                              fontFamily.includes('amiri') ||
                              fontFamily.includes('noto sans arabic');
        results.push({
            passed: hasArabicFonts,
            message: hasArabicFonts ? 'Arabic fonts detected' : 'No Arabic fonts in font family',
            severity: hasArabicFonts ? 'info' : 'warning',
            category: 'RTL Support'
        });

        return results;
    }

    // Security Validation
    validateSecurity(): ValidationResult[] {
        const results: ValidationResult[] = [];

        // Check for HTTPS
        const isHTTPS = window.location.protocol === 'https:';
        results.push({
            passed: isHTTPS || window.location.hostname === 'localhost',
            message: isHTTPS ? 'Using HTTPS' : 'Not using HTTPS (required for production)',
            severity: isHTTPS || window.location.hostname === 'localhost' ? 'info' : 'error',
            category: 'Security'
        });

        // Check for CSP header
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        results.push({
            passed: !!cspMeta,
            message: cspMeta ? 'Content Security Policy found' : 'No Content Security Policy detected',
            severity: cspMeta ? 'info' : 'warning',
            category: 'Security'
        });

        // Check for sensitive data in localStorage
        const sensitiveKeys = ['password', 'token', 'secret', 'key'];
        const storageKeys = Object.keys(localStorage);
        const sensitivDataFound = storageKeys.some(key => 
            sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))
        );
        results.push({
            passed: !sensitivDataFound,
            message: sensitivDataFound ? 'Sensitive data found in localStorage' : 'No sensitive data in localStorage',
            severity: sensitivDataFound ? 'error' : 'info',
            category: 'Security'
        });

        return results;
    }

    // Healthcare-Specific Validation
    validateHealthcareCompliance(): ValidationResult[] {
        const results: ValidationResult[] = [];

        // Check for patient data protection
        const hasDataProtection = document.querySelector('[data-sensitive], .patient-data, .protected-info');
        results.push({
            passed: !!hasDataProtection,
            message: hasDataProtection ? 'Patient data protection markers found' : 'No patient data protection markers',
            severity: hasDataProtection ? 'info' : 'warning',
            category: 'Healthcare Compliance'
        });

        // Check for error logging
        const hasErrorBoundary = window.localStorage.getItem('healthcare_app_errors') !== null;
        results.push({
            passed: hasErrorBoundary,
            message: hasErrorBoundary ? 'Error logging system active' : 'No error logging detected',
            severity: hasErrorBoundary ? 'info' : 'warning',
            category: 'Healthcare Compliance'
        });

        // Check for session management
        const hasSessionData = sessionStorage.length > 0 || document.cookie.includes('session');
        results.push({
            passed: hasSessionData,
            message: hasSessionData ? 'Session management detected' : 'No session management found',
            severity: hasSessionData ? 'info' : 'warning',
            category: 'Healthcare Compliance'
        });

        return results;
    }

    // Run all validations
    runAllValidations(): ValidationReport {
        this.results = [
            ...this.validateMobileFirst(),
            ...this.validateAccessibility(),
            ...this.validatePerformance(),
            ...this.validateRTLSupport(),
            ...this.validateSecurity(),
            ...this.validateHealthcareCompliance()
        ];

        const errors = this.results.filter(r => r.severity === 'error' && !r.passed);
        const warnings = this.results.filter(r => r.severity === 'warning' && !r.passed);
        const passed = this.results.filter(r => r.passed);

        const score = Math.round((passed.length / this.results.length) * 100);
        
        let overall: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
        if (errors.length > 0) overall = 'FAIL';
        else if (warnings.length > 0) overall = 'WARNING';

        const recommendations = this.generateRecommendations();

        return {
            overall,
            score,
            results: this.results,
            recommendations
        };
    }

    private generateRecommendations(): string[] {
        const recommendations: string[] = [];
        
        const failedResults = this.results.filter(r => !r.passed);
        
        if (failedResults.some(r => r.category === 'Mobile Design')) {
            recommendations.push('Implement comprehensive mobile-first design patterns');
        }
        
        if (failedResults.some(r => r.category === 'Accessibility')) {
            recommendations.push('Improve accessibility compliance for healthcare professionals');
        }
        
        if (failedResults.some(r => r.category === 'Performance')) {
            recommendations.push('Optimize performance for healthcare workflows');
        }
        
        if (failedResults.some(r => r.category === 'RTL Support')) {
            recommendations.push('Enhance Arabic language and RTL support');
        }
        
        if (failedResults.some(r => r.category === 'Security')) {
            recommendations.push('Strengthen security measures for patient data protection');
        }
        
        if (failedResults.some(r => r.category === 'Healthcare Compliance')) {
            recommendations.push('Ensure healthcare industry compliance requirements');
        }

        return recommendations;
    }
}

// Export utility functions
export const validateProduction = (): ValidationReport => {
    const validator = new ProductionValidator();
    return validator.runAllValidations();
};

export const logValidationReport = (report: ValidationReport): void => {
    console.group(`🏥 Production Validation Report - ${report.overall} (${report.score}%)`);
    
    const categories = [...new Set(report.results.map(r => r.category))];
    
    categories.forEach(category => {
        console.group(`📊 ${category}`);
        const categoryResults = report.results.filter(r => r.category === category);
        
        categoryResults.forEach(result => {
            const icon = result.passed ? '✅' : result.severity === 'error' ? '❌' : '⚠️';
            console.log(`${icon} ${result.message}`);
        });
        
        console.groupEnd();
    });
    
    if (report.recommendations.length > 0) {
        console.group('💡 Recommendations');
        report.recommendations.forEach(rec => console.log(`• ${rec}`));
        console.groupEnd();
    }
    
    console.groupEnd();
};

export default ProductionValidator;