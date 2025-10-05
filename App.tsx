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
import { HomeHealthcareProvider, useHomeHealthcare } from './context/HomeHealthcareContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PatientList from './components/PatientList';
import TodayVisits from './components/TodayVisits';
import Scheduler from './components/Scheduler';
import DriverView from './components/DriverView';
import Settings from './components/Settings';
import MobileResponsiveUpdater from './components/MobileResponsiveUpdater';
import { Role } from './types';
import { Menu, X } from 'lucide-react';
import { initializePerformanceOptimizations, measurePerformance } from './utils/performance';

const AppContent: React.FC = () => {
    const { state } = useHomeHealthcare();
    const [activeView, setActiveView] = useState('patients');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (state.currentRole === Role.Driver) {
        return (
            <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50 font-sans text-gray-800" dir="ltr">
                <main className="flex-1 flex flex-col overflow-hidden">
                    <Header activeView={activeView} setActiveView={setActiveView} />
                    <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 mobile-spacing">
                        <div className="animate-fade-in">
                            <DriverView />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50 font-sans text-gray-800" dir="ltr">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
                    <div className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-xl z-50">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-800">Filters & Search</h2>
                            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="h-full overflow-hidden">
                            <Sidebar />
                        </div>
                    </div>
                </div>
            )}
            
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>
            
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header activeView={activeView} setActiveView={setActiveView} />
                
                {/* Mobile Filter Button */}
                <div className="lg:hidden p-3 border-b border-gray-200">
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium touch-target-44 shadow-lg"
                    >
                        <Menu size={18} />
                        Filters & Search
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 mobile-spacing">
                    <div className="animate-fade-in">
                        {activeView === 'patients' && <PatientList />}
                        {activeView === 'visits' && <TodayVisits />}
                        {activeView === 'scheduler' && <Scheduler />}
                        {activeView === 'settings' && <Settings />}
                    </div>
                </div>
            </main>
        </div>
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
        }, 100);
        
    }, []);

    return (
        <HomeHealthcareProvider>
            <MobileResponsiveUpdater />
            <AppContent />
        </HomeHealthcareProvider>
    );
};

export default App;