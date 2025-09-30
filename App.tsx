import React, { useState } from 'react';
import { HomeHealthcareProvider, useHomeHealthcare } from './context/HomeHealthcareContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PatientList from './components/PatientList';
import TodayVisits from './components/TodayVisits';
import Scheduler from './components/Scheduler';
import DriverView from './components/DriverView';
import { Role } from './types';
import { ToastProvider } from './context/ToastContext';
import Toast from './components/Toast';

const AppContent: React.FC = () => {
    const { state } = useHomeHealthcare();
    const [activeView, setActiveView] = useState('patients');

    if (state.currentRole === Role.Driver) {
        return (
            <div className="flex h-screen bg-gray-100 font-sans text-gray-800" dir="ltr">
                <main className="flex-1 flex flex-col overflow-hidden">
                    <Header activeView={activeView} setActiveView={setActiveView} />
                    <DriverView />
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans text-gray-800" dir="ltr">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header activeView={activeView} setActiveView={setActiveView} />
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {activeView === 'patients' && <PatientList />}
                    {activeView === 'visits' && <TodayVisits />}
                    {activeView === 'scheduler' && <Scheduler />}
                </div>
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <HomeHealthcareProvider>
            <ToastProvider>
                <AppContent />
                <Toast />
            </ToastProvider>
        </HomeHealthcareProvider>
    );
};

export default App;