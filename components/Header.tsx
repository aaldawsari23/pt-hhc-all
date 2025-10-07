import React from 'react';
import { Briefcase, Calendar, Users, Stethoscope, Car, HandHeart, UserCog, HeartPulse, Accessibility, Settings } from 'lucide-react';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import { Role } from '../types';

interface HeaderProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

const RoleButton: React.FC<{ role: Role, currentRole: Role, onClick: (role: Role) => void, icon: React.ReactNode }> = ({ role, currentRole, onClick, icon }) => {
    const getRoleDisplayName = (role: Role) => {
        switch (role) {
            case Role.Doctor: return 'طبيب';
            case Role.Nurse: return 'ممرض';
            case Role.PhysicalTherapist: return 'علاج طبيعي';
            case Role.SocialWorker: return 'اجتماعي';
            case Role.Driver: return 'سائق';
            default: return role;
        }
    };

    return (
        <button
            onClick={() => onClick(role)}
            className={`flex flex-col items-center gap-1 px-2 md:px-3 py-2 text-xs rounded-xl font-bold transition-all duration-300 touch-target-44 transform active:scale-95 min-w-[60px] ${
                currentRole === role
                    ? 'bg-white text-blue-700 shadow-xl scale-110 ring-2 ring-blue-300 border-2 border-blue-200'
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm hover:scale-105 hover:shadow-lg border border-white/30'
            }`}
            title={`تبديل إلى دور ${getRoleDisplayName(role)}`}
        >
            <span className="flex-shrink-0">{icon}</span>
            <span className="text-[10px] leading-tight text-center">{getRoleDisplayName(role)}</span>
        </button>
    );
};


const ViewSwitcher: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
    const views = [
        { id: 'patients', label: 'Patients', icon: <Users size={16} /> },
        { id: 'visits', label: 'Today\'s Visits', icon: <Briefcase size={16} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
    ];

    return (
        <div className="flex items-center bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-xl border border-white/30">
            {views.map(view => (
                 <button
                    key={view.id}
                    onClick={() => setActiveView(view.id)}
                    className={`flex items-center gap-1.5 px-2 md:px-4 py-2 text-xs md:text-sm rounded-lg font-medium transition-all duration-300 touch-target-44 transform active:scale-95 ${
                        activeView === view.id
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                            : 'text-blue-700 hover:bg-blue-50 hover:scale-102'
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
      { role: Role.Doctor, icon: <Stethoscope size={16} /> },
      { role: Role.Nurse, icon: <HandHeart size={16} /> },
      { role: Role.PhysicalTherapist, icon: <HeartPulse size={16} />},
      { role: Role.SocialWorker, icon: <Accessibility size={16} />},
      { role: Role.Driver, icon: <Car size={16} /> },
    ];

    return (
        <header className="mobile-nav bg-gradient-to-r from-blue-700 to-blue-600 border-b border-blue-800 safe-area-inset-top flex flex-col lg:flex-row items-center justify-between gap-3 md:gap-4 sticky top-0 z-50 shadow-lg">
            <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto justify-center lg:justify-start px-3 md:px-4 py-2">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-md p-1 flex-shrink-0">
                    <img 
                        src="/logo.png" 
                        alt="Aseer Health Cluster Logo" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            // Fallback if logo doesn't load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                        }}
                    />
                    <div className="w-full h-full bg-blue-600 rounded-full items-center justify-center hidden">
                        <span className="text-white font-bold text-sm md:text-base">AHC</span>
                    </div>
                 </div>
                <div className="text-center lg:text-left">
                     <h1 className="text-lg md:text-xl font-bold text-white leading-tight">Home Healthcare Department</h1>
                     <p className="text-xs md:text-sm text-blue-100 font-medium">تجمع عسير الصحي – مستشفى الملك عبدالله ببيشة</p>
                     <p className="text-xs text-blue-200">الرعاية الصحية المنزلية</p>
                </div>
            </div>
            
            <div className="flex-grow flex items-center justify-center w-full lg:w-auto order-3 lg:order-2">
                 {state.currentRole !== Role.Driver && <ViewSwitcher activeView={activeView} setActiveView={setActiveView} />}
            </div>

            <div className="flex items-center gap-1.5 p-1.5 bg-white/10 rounded-xl overflow-x-auto w-full lg:w-auto justify-center lg:justify-end order-2 lg:order-3 backdrop-blur-md border border-white/20">
               {roles.map(r => (
                 <RoleButton key={r.role} role={r.role} currentRole={state.currentRole} onClick={handleRoleChange} icon={r.icon} />
               ))}
            </div>
        </header>
    );
};

export default Header;