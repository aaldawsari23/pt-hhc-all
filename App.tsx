/**
 * King Abdullah Hospital - Bisha
 * Home Healthcare Management System
 * 
 * A comprehensive healthcare application for managing home healthcare services
 * including patient management, team coordination, assessments, and documentation.
 * 
 * Features:
 * - ✅ Enhanced Patient Cards with comprehensive medical information display
 * - ✅ Centralized Assessment System with initial and follow-up forms
 * - ✅ Smart Note Logic with prefilled values and auto-responses
 * - ✅ Professional Print Templates with hospital branding
 * - ✅ Mobile-First Responsive Design
 * - ✅ Role-Based Access Control
 * - ✅ Real-time Assessment Tracking
 * - ✅ QR Code Integration
 * - ✅ Multilingual Support (Arabic/English)
 * 
 * @version 2.0.0
 * @author Healthcare IT Team
 * @organization Aseer Health Cluster - King Abdullah Hospital, Bisha
 */

import React, { useState, useEffect } from 'react';
import { HomeHealthcareProvider } from './context/HomeHealthcareContext';
import MobileFirstLayout from './components/MobileFirstLayout';
import AccessibilityEnhancer from './components/AccessibilityEnhancer';
import MobileResponsiveUpdater from './components/MobileResponsiveUpdater';
import PerformanceMonitor from './components/PerformanceMonitor';
import ErrorBoundary from './ErrorBoundary';
import { initializePerformanceOptimizations, measurePerformance } from './utils/performance';
import { validateProduction, logValidationReport } from './utils/productionValidation';

const AppContent: React.FC = () => {
    const [activeView, setActiveView] = useState('patients');

    return (
        <MobileFirstLayout 
            activeView={activeView} 
            setActiveView={setActiveView} 
        />
    );
};

const App: React.FC = () => {
    useEffect(() => {
        const measure = measurePerformance('App Initialization');
        
        // Initialize performance optimizations
        initializePerformanceOptimizations();
        
        // Log app startup completion
        setTimeout(() => {
            measure();
            console.log('✅ Home Healthcare Management System loaded successfully');
            
            // Run production validation
            if (process.env.NODE_ENV === 'development') {
                setTimeout(() => {
                    const validationReport = validateProduction();
                    logValidationReport(validationReport);
                }, 2000); // Wait for DOM to settle
            }
        }, 100);
        
    }, []);

    return (
        <ErrorBoundary>
            <HomeHealthcareProvider>
                <AccessibilityEnhancer>
                    <MobileResponsiveUpdater />
                    <AppContent />
                    <PerformanceMonitor enabled={process.env.NODE_ENV === 'development'} />
                </AccessibilityEnhancer>
            </HomeHealthcareProvider>
        </ErrorBoundary>
    );
};

export default App;