import React, { useState, useEffect } from 'react';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import MobileNavigationBar from './MobileNavigationBar';
import PatientList from './PatientList';
import TodayVisits from './TodayVisits';
import Settings from './Settings';

interface MobileLayoutWrapperProps {
  children?: React.ReactNode;
}

const MobileLayoutWrapper: React.FC<MobileLayoutWrapperProps> = ({ children }) => {
  const { state } = useHomeHealthcare();
  const [currentView, setCurrentView] = useState('patients');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const selectedPatientCount = state.selectedPatientIds.size;

  // Monitor online/offline status
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

  // Prevent zoom on double-tap (iOS Safari)
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    let lastTouchEnd = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchstart', preventDefault, { passive: false });
    document.addEventListener('touchend', preventZoom, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventDefault);
      document.removeEventListener('touchend', preventZoom);
    };
  }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="mobile-container space-y-6 py-6">
            <div className="text-center">
              <h1 className="mobile-heading-1 text-gray-900 mb-2">
                Welcome to MHHC
              </h1>
              <p className="mobile-text-base text-gray-600 mb-6">
                مرحباً بك في نظام الرعاية الصحية المنزلية
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mobile-card text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {state.patients.filter(p => p.status === 'active').length}
                </div>
                <div className="mobile-text-sm text-gray-600">Active Patients</div>
              </div>
              
              <div className="mobile-card text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {state.visits.filter(v => v.date === new Date().toISOString().split('T')[0]).length}
                </div>
                <div className="mobile-text-sm text-gray-600">Today's Visits</div>
              </div>
              
              <div className="mobile-card text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {state.teams.length}
                </div>
                <div className="mobile-text-sm text-gray-600">Active Teams</div>
              </div>
              
              <div className="mobile-card text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {state.patients.reduce((sum, p) => sum + (p.assessments?.length || 0), 0)}
                </div>
                <div className="mobile-text-sm text-gray-600">Assessments</div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="space-y-3">
              <h2 className="mobile-heading-3 text-gray-900">Quick Actions</h2>
              
              <button
                onClick={() => setCurrentView('patients')}
                className="mobile-btn-primary"
              >
                View Patients | عرض المرضى
              </button>
              
              <button
                onClick={() => setCurrentView('visits')}
                className="mobile-btn-secondary"
              >
                Today's Visits | زيارات اليوم
              </button>
            </div>
          </div>
        );
        
      case 'patients':
        return (
          <div className="mobile-container py-6 mobile-nav-safe">
            <PatientList />
          </div>
        );
        
      case 'visits':
        return (
          <div className="mobile-container py-6 mobile-nav-safe">
            <TodayVisits />
          </div>
        );
        
      case 'assessments':
        return (
          <div className="mobile-container py-6 mobile-nav-safe">
            <div className="text-center py-12">
              <div className="mobile-text-lg font-semibold text-gray-900 mb-2">
                Assessments View
              </div>
              <div className="mobile-text-base text-gray-600">
                Assessment management interface will be displayed here
              </div>
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div className="mobile-container py-6 mobile-nav-safe">
            <Settings />
          </div>
        );
        
      default:
        return children || (
          <div className="mobile-container py-6 mobile-nav-safe">
            <div className="text-center py-12">
              <div className="mobile-text-lg font-semibold text-gray-900 mb-2">
                Welcome to MHHC
              </div>
              <div className="mobile-text-base text-gray-600">
                Select a view from the navigation below
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 mobile-scroll-smooth">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 text-sm font-medium z-50 mobile-safe-area-top">
          <span>Offline Mode | وضع غير متصل</span>
        </div>
      )}
      
      {/* Main Content Area */}
      <main className={`min-h-screen ${!isOnline ? 'pt-10' : ''}`}>
        {renderCurrentView()}
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigationBar
        currentView={currentView}
        onViewChange={setCurrentView}
        selectedPatientCount={selectedPatientCount}
      />
      
      {/* Bottom Safe Area */}
      <div className="mobile-safe-area-bottom"></div>
    </div>
  );
};

export default MobileLayoutWrapper;