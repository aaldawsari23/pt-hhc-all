import React from 'react';
import { Briefcase, Calendar, Users, Stethoscope, Car, HandHeart, UserCog, HeartPulse, Accessibility } from 'lucide-react';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import { Role } from '../types';

interface HeaderProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

const RoleButton: React.FC<{ role: Role, currentRole: Role, onClick: (role: Role) => void, icon: React.ReactNode }> = ({ role, currentRole, onClick, icon }) => (
    <button
        onClick={() => onClick(role)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors duration-200 ${
            currentRole === role
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-blue-50'
        }`}
    >
        {icon}
        <span className="hidden sm:inline">{role}</span>
    </button>
);


const ViewSwitcher: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
    const views = [
        { id: 'patients', label: 'Patients', icon: <Users size={18} /> },
        { id: 'visits', label: 'Today\'s Visits', icon: <Briefcase size={18} /> },
        { id: 'scheduler', label: 'Scheduler', icon: <Calendar size={18} /> },
    ];

    return (
        <div className="flex items-center bg-white rounded-lg p-1 shadow-inner">
            {views.map(view => (
                 <button
                    key={view.id}
                    onClick={() => setActiveView(view.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors duration-200 ${
                        activeView === view.id
                            ? 'bg-blue-100 text-blue-700 font-semibold'
                            : 'text-gray-600 hover:bg-gray-100'
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
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-3 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-10">
            <div className="flex items-center gap-3">
                 <img src="https://i.imgur.com/8Q9Z3v1.png" alt="Logo" className="h-10 w-10 object-contain" />
                <div>
                     <h1 className="text-xl font-bold text-gray-800">Home Healthcare</h1>
                     <p className="text-xs text-gray-500">مستشفى الملك عبدالله - بيشه</p>
                </div>
            </div>
            
            <div className="flex-grow flex items-center justify-center">
                 {state.currentRole !== Role.Driver && <ViewSwitcher activeView={activeView} setActiveView={setActiveView} />}
            </div>

            <div className="flex items-center gap-1 p-1 bg-gray-200/50 rounded-lg overflow-x-auto">
               {roles.map(r => (
                 <RoleButton key={r.role} role={r.role} currentRole={state.currentRole} onClick={handleRoleChange} icon={r.icon} />
               ))}
            </div>
        </header>
    );
};

export default Header;