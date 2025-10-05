import React, { useState } from 'react';
import { Home, Users, Calendar, ClipboardList, Settings, Menu, X, Plus, UserCheck, Filter, Bell } from 'lucide-react';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import { Role } from '../types';
import MobileOptimizedFilters from './MobileOptimizedFilters';
import EnhancedTeamAssignment from './EnhancedTeamAssignment';

interface MobileNavigationBarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  selectedPatientCount: number;
}

const MobileNavigationBar: React.FC<MobileNavigationBarProps> = ({
  currentView,
  onViewChange,
  selectedPatientCount
}) => {
  const { state, dispatch, filteredPatients } = useHomeHealthcare();
  const [showFilters, setShowFilters] = useState(false);
  const [showTeamAssignment, setShowTeamAssignment] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const selectedPatients = filteredPatients.filter(p => state.selectedPatientIds.has(p.nationalId));

  const navigationItems = [
    {
      key: 'home',
      label: 'Home',
      labelAr: 'الرئيسية',
      icon: Home,
      color: 'blue',
      badge: null
    },
    {
      key: 'patients',
      label: 'Patients',
      labelAr: 'المرضى',
      icon: Users,
      color: 'green',
      badge: filteredPatients.length
    },
    {
      key: 'visits',
      label: 'Visits',
      labelAr: 'الزيارات',
      icon: Calendar,
      color: 'purple',
      badge: state.visits.filter(v => v.date === new Date().toISOString().split('T')[0]).length
    },
    {
      key: 'assessments',
      label: 'Assessments',
      labelAr: 'التقييمات',
      icon: ClipboardList,
      color: 'orange',
      badge: state.patients.reduce((sum, p) => sum + (p.assessments?.length || 0), 0)
    },
    {
      key: 'settings',
      label: 'Settings',
      labelAr: 'الإعدادات',
      icon: Settings,
      color: 'gray',
      badge: null
    }
  ];

  const handleSelectAll = () => {
    if (selectedPatientCount === filteredPatients.length) {
      dispatch({ type: 'CLEAR_SELECTIONS' });
    } else {
      dispatch({ 
        type: 'SELECT_ALL_FILTERED', 
        payload: filteredPatients.map(p => p.nationalId) 
      });
    }
  };

  const handleTeamAssignment = () => {
    if (selectedPatients.length > 0) {
      setShowTeamAssignment(true);
    }
  };

  const renderNavigationItem = (item: typeof navigationItems[0]) => {
    const Icon = item.icon;
    const isActive = currentView === item.key;
    
    return (
      <button
        key={item.key}
        onClick={() => {
          onViewChange(item.key);
          setShowMenu(false);
        }}
        className={`flex flex-col items-center justify-center py-2 px-1 transition-all ${
          isActive 
            ? `text-${item.color}-600 bg-${item.color}-50` 
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <div className="relative">
          <Icon size={20} />
          {item.badge !== null && item.badge > 0 && (
            <span className={`absolute -top-2 -right-2 bg-${item.color}-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center`}>
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
        </div>
        <span className="text-xs mt-1 leading-tight text-center">
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <>
      {/* Top Action Bar - Only show on patients view */}
      {currentView === 'patients' && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedPatientCount > 0
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UserCheck size={16} />
              {selectedPatientCount === filteredPatients.length ? 'Clear All' : 'Select All'}
              {selectedPatientCount > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {selectedPatientCount}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setShowFilters(true)}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 text-sm font-medium"
            >
              <Filter size={16} />
              Filters
              {(state.filters.areas.length + state.filters.tags.length + state.filters.sex.length + state.filters.risk.length) > 0 && (
                <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {state.filters.areas.length + state.filters.tags.length + state.filters.sex.length + state.filters.risk.length}
                </span>
              )}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedPatientCount > 0 && (
              <button
                onClick={handleTeamAssignment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 text-sm font-medium"
              >
                <Plus size={16} />
                Assign ({selectedPatientCount})
              </button>
            )}
            
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-5 h-16">
          {navigationItems.map(renderNavigationItem)}
        </div>
      </div>

      {/* Role and Status Indicator */}
      <div className="fixed top-4 right-4 z-30">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            state.currentRole === Role.Doctor ? 'bg-blue-500' :
            state.currentRole === Role.Nurse ? 'bg-green-500' :
            state.currentRole === Role.PhysicalTherapist ? 'bg-purple-500' :
            state.currentRole === Role.SocialWorker ? 'bg-orange-500' :
            'bg-gray-500'
          }`}></div>
          <span className="text-xs font-medium text-gray-700">
            {state.currentRole}
          </span>
        </div>
      </div>

      {/* Quick Stats Overlay */}
      {currentView === 'patients' && (
        <div className="fixed top-16 left-4 right-4 z-30">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white shadow-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{state.patients.length}</div>
                <div className="text-xs opacity-90">Total Patients</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{filteredPatients.length}</div>
                <div className="text-xs opacity-90">Filtered</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{selectedPatientCount}</div>
                <div className="text-xs opacity-90">Selected</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
          <div className="bg-white w-80 h-full shadow-2xl flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-blue-900">King Abdullah Hospital</h3>
                  <p className="text-sm text-blue-700">Home Healthcare System</p>
                </div>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4 space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Quick Actions</h4>
                
                <button
                  onClick={() => {
                    setShowFilters(true);
                    setShowMenu(false);
                  }}
                  className="w-full p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-all flex items-center gap-3 text-left"
                >
                  <Filter size={16} className="text-orange-600" />
                  <div>
                    <div className="font-medium text-orange-900">Advanced Filters</div>
                    <div className="text-sm text-orange-700">المرشحات المتقدمة</div>
                  </div>
                </button>
                
                {selectedPatientCount > 0 && (
                  <button
                    onClick={() => {
                      handleTeamAssignment();
                      setShowMenu(false);
                    }}
                    className="w-full p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-all flex items-center gap-3 text-left"
                  >
                    <UserCheck size={16} className="text-green-600" />
                    <div>
                      <div className="font-medium text-green-900">Team Assignment</div>
                      <div className="text-sm text-green-700">Assign {selectedPatientCount} patients</div>
                    </div>
                  </button>
                )}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">System Status</h4>
                
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500">Active Patients</div>
                      <div className="font-bold text-gray-900">
                        {state.patients.filter(p => p.status === 'active').length}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Today's Visits</div>
                      <div className="font-bold text-gray-900">
                        {state.visits.filter(v => v.date === new Date().toISOString().split('T')[0]).length}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Teams</div>
                      <div className="font-bold text-gray-900">{state.teams.length}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Current Role</div>
                      <div className="font-bold text-gray-900">{state.currentRole}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1" onClick={() => setShowMenu(false)}></div>
        </div>
      )}

      {/* Filters Modal */}
      <MobileOptimizedFilters
        isVisible={showFilters}
        onClose={() => setShowFilters(false)}
      />

      {/* Team Assignment Modal */}
      {showTeamAssignment && (
        <EnhancedTeamAssignment
          selectedPatients={selectedPatients}
          onClose={() => setShowTeamAssignment(false)}
          onAssign={(assignments) => {
            assignments.forEach(assignment => {
              dispatch({
                type: 'ASSIGN_TO_VISITS',
                payload: {
                  patientIds: assignment.patientIds,
                  date: assignment.date,
                  teamId: assignment.teamId
                }
              });
            });
            setShowTeamAssignment(false);
          }}
        />
      )}
    </>
  );
};

export default MobileNavigationBar;