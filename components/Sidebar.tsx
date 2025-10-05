import React, { useState, useMemo } from 'react';
import { Search, X, Filter, Tag, Users, MapPin, BarChart2, Check, UserPlus, Save, Trash2, List } from 'lucide-react';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';

const FilterChip: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 md:px-4 py-2 text-xs md:text-sm rounded-xl border-2 transition-all duration-200 flex-shrink-0 font-semibold touch-target-44 ${
            isActive
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 shadow-sm'
        }`}
    >
        {label}
    </button>
);

const BulkActions: React.FC = () => {
    const { state, dispatch } = useHomeHealthcare();
    const [selectedTeam, setSelectedTeam] = useState<string>('team1');
    const hasSelection = state.selectedPatientIds.size > 0;
    
    const handleAssign = () => {
        if(state.selectedPatientIds.size > 0) {
            const today = new Date().toISOString().split('T')[0];
            dispatch({ type: 'ASSIGN_TO_VISITS', payload: { patientIds: Array.from(state.selectedPatientIds), date: today, teamId: selectedTeam } });
        }
    }

    if (!hasSelection) return null;

    return (
        <div className="p-3 md:p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-200">
                <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <Check size={16} />
                    {state.selectedPatientIds.size} مريض محدد
                </h3>
                
                {/* Team Selection - Mobile Optimized */}
                <div className="mb-4">
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">اختيار الفريق</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {state.teams.map(team => (
                            <button 
                                key={team.id} 
                                onClick={() => setSelectedTeam(team.id)} 
                                className={`px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 touch-target-44 ${
                                    selectedTeam === team.id 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-[1.02]' 
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                            >
                                {team.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                    <button 
                        onClick={handleAssign} 
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-md touch-target-44"
                    >
                        <UserPlus size={18} />
                        إضافة لزيارات اليوم
                    </button>
                    
                    <button 
                        onClick={() => dispatch({type: 'CLEAR_SELECTIONS'})} 
                        className="w-full text-center py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        إلغاء التحديد
                    </button>
                </div>
            </div>
        </div>
    );
}

// Custom Lists removed per user request


const Sidebar: React.FC = () => {
    const { state, dispatch, filteredPatients } = useHomeHealthcare();
    const { filters, areas, selectedPatientIds } = state;
    
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        if (state.patients && Array.isArray(state.patients)) {
            state.patients.forEach(p => {
                if (p.tags && Array.isArray(p.tags)) {
                    p.tags.forEach(t => tags.add(t));
                }
            });
        }
        return Array.from(tags);
    }, [state.patients]);

    const handleSelectAll = () => {
        if (filteredPatients && Array.isArray(filteredPatients)) {
            const filteredIds = filteredPatients.map(p => p.nationalId);
            dispatch({type: 'SELECT_ALL_FILTERED', payload: filteredIds});
        }
    }
    


    return (
        <aside className="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-full overflow-y-hidden">
            <div className="p-3 md:p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                    <input
                        type="text"
                        placeholder="Smart search: name, ID, area, diagnosis..."
                        value={filters.search}
                        onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
                        className="w-full bg-white border-2 border-blue-200 rounded-xl pl-11 pr-4 py-3 text-sm md:text-base font-medium focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 shadow-sm placeholder-gray-500 touch-target-44"
                    />
                </div>
                <div className="flex items-center justify-between mt-3 text-xs md:text-sm">
                    <div className="flex items-center gap-2 md:gap-3">
                         <input 
                            type="checkbox"
                            id="select-all" 
                            className="h-5 w-5 md:h-6 md:w-6 rounded-md border-2 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 touch-target-44"
                            onChange={e => e.target.checked ? handleSelectAll() : dispatch({type: 'CLEAR_SELECTIONS'})}
                            checked={filteredPatients.length > 0 && selectedPatientIds.size === filteredPatients.length}
                         />
                         <label htmlFor="select-all" className="text-gray-700 font-medium">
                            <span className="text-blue-600 font-bold">{filteredPatients.length}</span> Results
                            {selectedPatientIds.size > 0 && <span className="text-green-600 ml-1">({selectedPatientIds.size} selected)</span>}
                         </label>
                    </div>
                   <button onClick={() => dispatch({type: 'CLEAR_FILTERS'})} className="flex items-center gap-1 text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors touch-target-44">
                     <X size={14}/> Clear
                   </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-3 md:p-4 space-y-4 md:space-y-5">
                    <FilterSection icon={<MapPin size={16} />} title="Areas">
                        {(areas || []).map(area => (
                            <FilterChip key={area} label={area} isActive={filters.areas.includes(area)} onClick={() => dispatch({ type: 'TOGGLE_AREA_FILTER', payload: area })} />
                        ))}
                    </FilterSection>

                    <FilterSection icon={<Tag size={16} />} title="Tags">
                        {allTags.map(tag => (
                            <FilterChip key={tag} label={tag} isActive={filters.tags.includes(tag)} onClick={() => dispatch({ type: 'TOGGLE_TAG_FILTER', payload: tag })} />
                        ))}
                    </FilterSection>
                     
                    {/* Sex filter removed per user request */}
                     
                    <FilterSection icon={<BarChart2 size={16} />} title="Last Visit Risk">
                        {['green', 'yellow', 'red'].map(r => (
                            <FilterChip key={r} label={r.charAt(0).toUpperCase() + r.slice(1)} isActive={filters.risk.includes(r)} onClick={() => dispatch({ type: 'TOGGLE_RISK_FILTER', payload: r })} />
                        ))}
                    </FilterSection>
                </div>
                 {/* CustomLists removed */}
            </div>
            
            <BulkActions />
        </aside>
    );
};

const FilterSection: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-sm">
        <h3 className="text-sm md:text-base font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="text-blue-600">{icon}</span> {title}
        </h3>
        <div className="flex flex-wrap gap-2 md:gap-3">
            {children}
        </div>
    </div>
);

export default Sidebar;