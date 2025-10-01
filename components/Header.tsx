import React from 'react';
import { Briefcase, Calendar, Users, Stethoscope, Car, HandHeart, UserCog, HeartPulse, Accessibility, Settings } from 'lucide-react';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import { Role } from '../types';

interface HeaderProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

const RoleButton: React.FC<{ role: Role, currentRole: Role, onClick: (role: Role) => void, icon: React.ReactNode }> = ({ role, currentRole, onClick, icon }) => (
    <button
        onClick={() => onClick(role)}
        className={`flex items-center gap-1.5 px-2 md:px-3 py-1.5 text-xs md:text-sm rounded-lg font-medium transition-all duration-200 touch-target-44 ${
            currentRole === role
                ? 'bg-white text-blue-700 shadow-md scale-105'
                : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
        }`}
    >
        <span className="flex-shrink-0">{icon}</span>
        <span className="hidden sm:inline truncate">{role}</span>
    </button>
);


const ViewSwitcher: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
    const views = [
        { id: 'patients', label: 'Patients', icon: <Users size={16} /> },
        { id: 'visits', label: 'Today\'s Visits', icon: <Briefcase size={16} /> },
        { id: 'scheduler', label: 'Scheduler', icon: <Calendar size={16} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
    ];

    return (
        <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-white/20">
            {views.map(view => (
                 <button
                    key={view.id}
                    onClick={() => setActiveView(view.id)}
                    className={`flex items-center gap-1.5 px-2 md:px-4 py-2 text-xs md:text-sm rounded-lg font-medium transition-all duration-200 touch-target-44 ${
                        activeView === view.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-blue-700 hover:bg-blue-50'
                    }`}
                >
                    {view.icon}
                    <span className="hidden md:inline">{view.label}</span>
                </button>
            ))}
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
    const { state, dispatch } = useHomeHealthcare();

    const handleRoleChange = (role: Role) => {
        dispatch({ type: 'SET_ROLE', payload: role });
    };

    const roles = [
      { role: Role.Coordinator, icon: <UserCog size={16} /> },
      { role: Role.Doctor, icon: <Stethoscope size={16} /> },
      { role: Role.Nurse, icon: <HandHeart size={16} /> },
      { role: Role.PhysicalTherapist, icon: <HeartPulse size={16} />},
      { role: Role.SocialWorker, icon: <Accessibility size={16} />},
      { role: Role.Driver, icon: <Car size={16} /> },
    ];

    return (
        <header className="bg-gradient-to-r from-blue-700 to-blue-600 border-b border-blue-800 p-3 md:p-4 flex flex-col lg:flex-row items-center justify-between gap-3 md:gap-4 sticky top-0 z-50 shadow-lg">
            <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto justify-center lg:justify-start">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm md:text-base">KA</span>
                    </div>
                 </div>
                <div className="text-center lg:text-left">
                     <h1 className="text-lg md:text-xl font-bold text-white leading-tight">Home Healthcare</h1>
                     <p className="text-xs md:text-sm text-blue-100">مستشفى الملك عبدالله - بيشه</p>
                </div>
            </div>
            
            <div className="flex-grow flex items-center justify-center w-full lg:w-auto order-3 lg:order-2">
                 {state.currentRole !== Role.Driver && <ViewSwitcher activeView={activeView} setActiveView={setActiveView} />}
            </div>

            <div className="flex items-center gap-1 p-1 bg-white/10 rounded-lg overflow-x-auto w-full lg:w-auto justify-center lg:justify-end order-2 lg:order-3">
               {roles.map(r => (
                 <RoleButton key={r.role} role={r.role} currentRole={state.currentRole} onClick={handleRoleChange} icon={r.icon} />
               ))}
            </div>
        </header>
    );
};

export default Header;