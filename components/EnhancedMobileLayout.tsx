import React, { useState, useEffect, useCallback } from 'react';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import { Users, Calendar, Settings, Activity, ChevronUp, Wifi, WifiOff } from 'lucide-react';

interface EnhancedMobileLayoutProps {
  children: React.ReactNode;
}

const EnhancedMobileLayout: React.FC<EnhancedMobileLayoutProps> = ({ children }) => {
  const { state } = useHomeHealthcare();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);

  // Network status monitoring
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

  // Smart header hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show scroll to top button
      setShowScrollTop(currentScrollY > 400);
      
      // Hide/show header based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Prevent zoom on double tap
  useEffect(() => {
    let lastTouchEnd = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', preventZoom, { passive: false });
    return () => document.removeEventListener('touchend', preventZoom);
  }, []);

  const selectedPatientCount = state.selectedPatientIds.size;
  const activePatientCount = state.patients.filter(p => p.status === 'active').length;
  const todayVisitsCount = state.visits.filter(v => 
    v.date === new Date().toISOString().split('T')[0]
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative">
      {/* Network Status Indicator */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        !isOnline ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="bg-red-600 text-white text-center py-2 px-4 flex items-center justify-center gap-2">
          <WifiOff size={16} />
          <span className="text-sm font-medium">Offline Mode | وضع غير متصل</span>
        </div>
      </div>

      {/* Enhanced Header - Mobile Optimized */}
      <div className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${
        headerVisible ? 'translate-y-0' : '-translate-y-full'
      } ${!isOnline ? 'mt-10' : ''}`}>
        <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Activity size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">MHHC</h1>
                <p className="text-xs text-gray-500">Home Healthcare</p>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi size={12} />
                  <span className="text-xs">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <WifiOff size={12} />
                  <span className="text-xs">Offline</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-blue-600">{activePatientCount}</div>
              <div className="text-xs text-blue-600">Active Patients</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-green-600">{todayVisitsCount}</div>
              <div className="text-xs text-green-600">Today's Visits</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-purple-600">{selectedPatientCount}</div>
              <div className="text-xs text-purple-600">Selected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${
        headerVisible ? 'pt-32' : 'pt-4'
      } ${!isOnline ? 'pt-42' : ''} pb-20`}>
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>

      {/* Enhanced Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2 z-40">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg active:bg-gray-100 transition-colors">
            <Users size={20} className="text-blue-600" />
            <span className="text-xs text-gray-600">Patients</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg active:bg-gray-100 transition-colors">
            <Calendar size={20} className="text-green-600" />
            <span className="text-xs text-gray-600">Visits</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg active:bg-gray-100 transition-colors">
            <Activity size={20} className="text-purple-600" />
            <span className="text-xs text-gray-600">Stats</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg active:bg-gray-100 transition-colors">
            <Settings size={20} className="text-gray-600" />
            <span className="text-xs text-gray-600">Settings</span>
          </button>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-50 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110 active:scale-95"
          aria-label="Scroll to top"
        >
          <ChevronUp size={20} />
        </button>
      )}

      {/* Performance Optimization: Reduce paint operations */}
      <style jsx>{`
        * {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          -webkit-perspective: 1000;
          perspective: 1000;
        }
        
        .container {
          contain: layout style paint;
        }
      `}</style>
    </div>
  );
};

export default EnhancedMobileLayout;