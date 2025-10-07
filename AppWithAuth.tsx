import React, { useState, useEffect } from 'react';
import { HomeHealthcareProvider, useHomeHealthcare } from './context/HomeHealthcareContext';
import { AuthService } from './utils/firebase';
import Login from './components/Login';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PatientList from './components/PatientList';
import TodayVisits from './components/TodayVisits';
import DriverView from './components/DriverView';
import Settings from './components/Settings';
import { Role } from './types';
import { Menu, X, Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';

const SyncStatusIndicator: React.FC = () => {
  // Simplified for now - no Firebase sync
  return null;
};

interface AppContentProps {
  currentUser: any;
}

const AppContent: React.FC<AppContentProps> = ({ currentUser }) => {
  const { state } = useHomeHealthcare();
  const [activeView, setActiveView] = useState('patients');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to appropriate view based on role
  useEffect(() => {
    if (currentUser && currentUser.mappedRole === 'Driver') {
      setActiveView('driver');
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      window.location.reload(); // Force reload to clear state
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Authentication is handled by parent component

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
        <SyncStatusIndicator />
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
        
        {/* User Info Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Filter Button */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium text-sm"
            >
              <Menu size={16} />
              Filters
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">
                  {currentUser?.name?.split(' ')[0]?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{currentUser?.role} - {state.currentRole}</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 mobile-spacing">
          <div className="animate-fade-in">
            {activeView === 'patients' && <PatientList />}
            {activeView === 'visits' && <TodayVisits />}
            {activeView === 'settings' && <Settings />}
          </div>
        </div>
      </main>
      
      <SyncStatusIndicator />
    </div>
  );
};

const AppWithAuth: React.FC = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    } else {
      // Auto-login for development - use first authorized user
      AuthService.signIn('salshahrani173@moh.gov.sa', '12345').then(result => {
        if (result.success) {
          setCurrentUser(result.user);
          setIsAuthenticated(true);
        }
      }).catch(console.error);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-white text-lg font-medium">جاري تحميل النظام...</p>
        </div>
      </div>
    );
  }

  // App is ready

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <HomeHealthcareProvider>
      <AppContent currentUser={currentUser} />
    </HomeHealthcareProvider>
  );
};

export default AppWithAuth;