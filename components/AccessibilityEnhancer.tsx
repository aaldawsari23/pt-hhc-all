/**
 * Accessibility Enhancer Component
 * Provides comprehensive accessibility features and RTL support for healthcare applications
 */

import React, { useEffect, useState } from 'react';

interface AccessibilityEnhancerProps {
    children: React.ReactNode;
}

interface AccessibilityState {
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
    screenReader: boolean;
    rtlMode: boolean;
}

const AccessibilityEnhancer: React.FC<AccessibilityEnhancerProps> = ({ children }) => {
    const [a11yState, setA11yState] = useState<AccessibilityState>({
        highContrast: false,
        reducedMotion: false,
        largeText: false,
        screenReader: false,
        rtlMode: true, // Default to RTL for Arabic healthcare system
    });

    // Detect system preferences
    useEffect(() => {
        const detectPreferences = () => {
            const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const largeText = window.matchMedia('(prefers-font-size: large)').matches;
            
            // Detect screen reader usage
            const screenReader = window.speechSynthesis !== undefined || 
                                document.body.getAttribute('role') === 'application' ||
                                navigator.userAgent.includes('NVDA') ||
                                navigator.userAgent.includes('JAWS');

            setA11yState(prev => ({
                ...prev,
                highContrast,
                reducedMotion,
                largeText,
                screenReader
            }));
        };

        detectPreferences();

        // Listen for preference changes
        const contrastQuery = window.matchMedia('(prefers-contrast: high)');
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleContrastChange = () => detectPreferences();
        const handleMotionChange = () => detectPreferences();

        contrastQuery.addEventListener('change', handleContrastChange);
        motionQuery.addEventListener('change', handleMotionChange);

        return () => {
            contrastQuery.removeEventListener('change', handleContrastChange);
            motionQuery.removeEventListener('change', handleMotionChange);
        };
    }, []);

    // Apply accessibility classes to document
    useEffect(() => {
        const documentClasses = [];
        
        if (a11yState.highContrast) documentClasses.push('high-contrast');
        if (a11yState.reducedMotion) documentClasses.push('reduced-motion');
        if (a11yState.largeText) documentClasses.push('large-text');
        if (a11yState.screenReader) documentClasses.push('screen-reader-active');
        if (a11yState.rtlMode) documentClasses.push('rtl-mode');

        // Apply classes to document element
        document.documentElement.className = 
            document.documentElement.className
                .split(' ')
                .filter(cls => !['high-contrast', 'reduced-motion', 'large-text', 'screen-reader-active', 'rtl-mode'].includes(cls))
                .concat(documentClasses)
                .join(' ');

        // Set dir attribute for RTL
        document.documentElement.dir = a11yState.rtlMode ? 'rtl' : 'ltr';
        document.documentElement.lang = a11yState.rtlMode ? 'ar' : 'en';

    }, [a11yState]);

    // Skip link for keyboard navigation
    const SkipLink: React.FC = () => (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-blue-600 focus:text-white focus:p-4 focus:rounded-br-lg focus:shadow-lg"
            onFocus={(e) => e.currentTarget.classList.remove('sr-only')}
            onBlur={(e) => e.currentTarget.classList.add('sr-only')}
        >
            {a11yState.rtlMode ? 'تخطي إلى المحتوى الرئيسي' : 'Skip to main content'}
        </a>
    );

    // Live region for announcements
    const LiveRegion: React.FC = () => (
        <>
            <div 
                id="live-region-polite" 
                aria-live="polite" 
                aria-atomic="false" 
                className="sr-only"
                role="status"
            />
            <div 
                id="live-region-assertive" 
                aria-live="assertive" 
                aria-atomic="true" 
                className="sr-only"
                role="alert"
            />
        </>
    );

    // Accessibility toolbar for manual controls
    const AccessibilityToolbar: React.FC = () => {
        const [toolbarOpen, setToolbarOpen] = useState(false);

        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => setToolbarOpen(!toolbarOpen)}
                    className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300"
                    aria-label={a11yState.rtlMode ? 'إعدادات إمكانية الوصول' : 'Accessibility Settings'}
                    aria-expanded={toolbarOpen}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9M15 11.5L21 12V14L15 13.5V15.5L21 16V18L15 17.5V19.5L21 20V22H3V20L9 19.5V17.5L3 18V16L9 15.5V13.5L3 14V12L9 11.5V9.5L3 10V8L9 9V7L3 7.5V5.5L9 6V4L3 4.5V3H21V5L15 5.5V7L21 7.5V9M12 8C10.34 8 9 9.34 9 11V22H11V19H13V22H15V11C15 9.34 13.66 8 12 8Z"/>
                    </svg>
                </button>

                {toolbarOpen && (
                    <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl p-4 w-64 border border-gray-200">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">
                            {a11yState.rtlMode ? 'إعدادات إمكانية الوصول' : 'Accessibility Settings'}
                        </h3>
                        
                        <div className="space-y-3">
                            <label className="flex items-center space-x-2 rtl:space-x-reverse">
                                <input
                                    type="checkbox"
                                    checked={a11yState.highContrast}
                                    onChange={(e) => setA11yState(prev => ({ ...prev, highContrast: e.target.checked }))}
                                    className="rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                    {a11yState.rtlMode ? 'التباين العالي' : 'High Contrast'}
                                </span>
                            </label>

                            <label className="flex items-center space-x-2 rtl:space-x-reverse">
                                <input
                                    type="checkbox"
                                    checked={a11yState.reducedMotion}
                                    onChange={(e) => setA11yState(prev => ({ ...prev, reducedMotion: e.target.checked }))}
                                    className="rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                    {a11yState.rtlMode ? 'تقليل الحركة' : 'Reduce Motion'}
                                </span>
                            </label>

                            <label className="flex items-center space-x-2 rtl:space-x-reverse">
                                <input
                                    type="checkbox"
                                    checked={a11yState.largeText}
                                    onChange={(e) => setA11yState(prev => ({ ...prev, largeText: e.target.checked }))}
                                    className="rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                    {a11yState.rtlMode ? 'نص كبير' : 'Large Text'}
                                </span>
                            </label>

                            <label className="flex items-center space-x-2 rtl:space-x-reverse">
                                <input
                                    type="checkbox"
                                    checked={a11yState.rtlMode}
                                    onChange={(e) => setA11yState(prev => ({ ...prev, rtlMode: e.target.checked }))}
                                    className="rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                    {a11yState.rtlMode ? 'وضع العربية (من اليمين لليسار)' : 'Arabic RTL Mode'}
                                </span>
                            </label>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <SkipLink />
            <LiveRegion />
            <div id="main-content" tabIndex={-1}>
                {children}
            </div>
            <AccessibilityToolbar />
        </>
    );
};

// Utility function to announce messages to screen readers
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const region = document.getElementById(priority === 'polite' ? 'live-region-polite' : 'live-region-assertive');
    if (region) {
        region.textContent = message;
        // Clear after announcement
        setTimeout(() => {
            region.textContent = '';
        }, 1000);
    }
};

export default AccessibilityEnhancer;