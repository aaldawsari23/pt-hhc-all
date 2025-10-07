/**
 * Mobile-First Layout Component
 * Provides comprehensive mobile-first responsive layout with healthcare-optimized design
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import Header from './Header';
import Sidebar from './Sidebar';
import PatientList from './PatientList';
import TodayVisits from './TodayVisits';
import DriverView from './DriverView';
import Settings from './Settings';
import { Role } from '../types';
import { Menu, X, AlertCircle, Loader2, Wifi, WifiOff } from 'lucide-react';

interface MobileFirstLayoutProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

const LoadingScreen: React.FC = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
            <div className="mb-6">
                <Loader2 size={48} className="text-blue-600 animate-spin mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Healthcare System</h2>
            <p className="text-gray-600">تحميل نظام الرعاية الصحية المنزلية...</p>
        </div>
    </div>
);

const ErrorScreen: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full border border-red-200">
            <div className="text-center">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Error</h2>
                <p className="text-gray-600 mb-4">خطأ في تحميل البيانات</p>
                <p className="text-sm text-red-600 mb-6 bg-red-50 p-3 rounded-lg">{error}</p>
                <button
                    onClick={onRetry}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    Try Again / إعادة المحاولة
                </button>
            </div>
        </div>
    </div>
);

const NetworkStatus: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-orange-500 text-white p-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up">
            <WifiOff size={20} />
            <span className="text-sm font-medium">Offline Mode / وضع عدم الاتصال</span>
        </div>
    );
};

const MobileFirstLayout: React.FC<MobileFirstLayoutProps> = ({ activeView, setActiveView }) => {
    const { state, loading, error } = useHomeHealthcare();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

    // Screen size detection with debouncing
    useEffect(() => {
        const updateScreenSize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setScreenSize('mobile');
            } else if (width < 1024) {
                setScreenSize('tablet');
            } else {
                setScreenSize('desktop');
            }
        };

        updateScreenSize();
        
        let timeoutId: NodeJS.Timeout;
        const debouncedUpdate = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(updateScreenSize, 150);
        };

        window.addEventListener('resize', debouncedUpdate);
        return () => {
            window.removeEventListener('resize', debouncedUpdate);
            clearTimeout(timeoutId);
        };
    }, []);

    // Auto-close sidebar on route change for mobile
    useEffect(() => {
        if (screenSize === 'mobile') {
            setSidebarOpen(false);
        }
    }, [activeView, screenSize]);

    const handleRetry = () => {
        window.location.reload();
    };

    // Render loading screen
    if (loading) {
        return <LoadingScreen />;
    }

    // Render error screen
    if (error) {
        return <ErrorScreen error={error} onRetry={handleRetry} />;
    }

    // Special layout for Driver role
    if (state.currentRole === Role.Driver) {
        return (
            <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 font-sans text-gray-800">
                <main className="flex-1 flex flex-col overflow-hidden">
                    <Header activeView={activeView} setActiveView={setActiveView} />
                    <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6">
                        <div className="animate-fade-in">
                            <DriverView />
                        </div>
                    </div>
                </main>
                <NetworkStatus />
            </div>
        );
    }

    // Main layout for other roles
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 font-sans text-gray-800">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && screenSize === 'mobile' && (
                <div className="fixed inset-0 z-40">
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" 
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close sidebar"
                    />
                    <div className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-out">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <h2 className="text-lg font-bold text-gray-800">Filters & Search</h2>
                            <button 
                                onClick={() => setSidebarOpen(false)} 
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target-44"
                                aria-label="Close sidebar"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="h-full overflow-hidden">
                            <Sidebar />
                        </div>
                    </div>
                </div>
            )}
            
            {/* Desktop/Tablet Sidebar */}
            {screenSize !== 'mobile' && (
                <div className="flex-shrink-0">
                    <Sidebar />
                </div>
            )}
            
            <main className="flex-1 flex flex-col overflow-hidden min-w-0">
                <Header activeView={activeView} setActiveView={setActiveView} />
                
                {/* Mobile Filter Button */}
                {screenSize === 'mobile' && (
                    <div className="border-b border-gray-200 p-3 bg-white/95 backdrop-blur-sm sticky top-[120px] z-30">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium touch-target-44 shadow-lg w-full justify-center transition-all hover:bg-blue-700 active:scale-95"
                            aria-label="Open filters and search"
                        >
                            <Menu size={18} />
                            <span>Filters & Search</span>
                            {state.selectedPatientIds.size > 0 && (
                                <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-bold">
                                    {state.selectedPatientIds.size}
                                </span>
                            )}
                        </button>
                    </div>
                )}
                
                <div className="flex-1 overflow-y-auto">
                    <div className="p-3 md:p-4 lg:p-6">
                        <div className="animate-fade-in">
                            {activeView === 'patients' && <PatientList />}
                            {activeView === 'visits' && <TodayVisits />}
                            {activeView === 'settings' && <Settings />}
                        </div>
                    </div>
                </div>
            </main>
            
            <NetworkStatus />
        </div>
    );
};

export default MobileFirstLayout;