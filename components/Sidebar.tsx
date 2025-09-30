import React, { useState, useMemo } from 'react';
import { Search, X, Filter, Tag, Users, MapPin, BarChart2, Check, UserPlus } from 'lucide-react';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';

const FilterChip: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 text-xs rounded-full border transition-all duration-200 flex-shrink-0 ${
            isActive
                ? 'bg-blue-500 text-white border-blue-500 font-semibold'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-500'
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
        <div className="p-4 border-t border-gray-200 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-700 mb-3">{state.selectedPatientIds.size} patients selected</h3>
            <div className="space-y-3">
                 <div>
                    <label className="text-xs font-semibold text-gray-600 mb-2 block">Assign to Team</label>
                    <div className="flex gap-2">
                        {state.teams.map(team => (
                             <button key={team.id} onClick={() => setSelectedTeam(team.id)} className={`px-3 py-1 text-xs rounded-full border transition-all duration-200 ${selectedTeam === team.id ? 'bg-blue-500 text-white border-blue-500' : 'bg-white'}`}>
                                {team.name}
                             </button>
                        ))}
                    </div>
                </div>
                <button onClick={handleAssign} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <UserPlus size={16} />
                    Add to Today's Visits
                </button>
                 <button onClick={() => dispatch({type: 'CLEAR_SELECTIONS'})} className="w-full text-center text-xs text-gray-500 hover:text-red-500">
                    Clear Selection
                </button>
            </div>
        </div>
    );
}

const Sidebar: React.FC = () => {
    const { state, dispatch, filteredPatients } = useHomeHealthcare();
    const { filters, areas, selectedPatientIds } = state;
    
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        state.patients.forEach(p => p.tags.forEach(t => tags.add(t)));
        return Array.from(tags);
    }, [state.patients]);

    const handleSelectAll = () => {
        const filteredIds = filteredPatients.map(p => p.nationalId);
        dispatch({type: 'SELECT_ALL_FILTERED', payload: filteredIds});
    }

    return (
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-full overflow-y-hidden">
            <div className="p-4 border-b border-gray-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, ID..."
                        value={filters.search}
                        onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
                        className="w-full bg-gray-100 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex items-center justify-between mt-3 text-xs">
                    <div className="flex items-center gap-2">
                         <input 
                            type="checkbox"
                            id="select-all" 
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            onChange={e => e.target.checked ? handleSelectAll() : dispatch({type: 'CLEAR_SELECTIONS'})}
                            checked={filteredPatients.length > 0 && selectedPatientIds.size === filteredPatients.length}
                         />
                         <label htmlFor="select-all" className="text-gray-600">{filteredPatients.length} Results</label>
                    </div>
                   <button onClick={() => dispatch({type: 'CLEAR_FILTERS'})} className="flex items-center gap-1 text-gray-500 hover:text-red-500">
                     <X size={12}/> Clear All Filters
                   </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                    <FilterSection icon={<MapPin size={16} />} title="Areas">
                        {areas.map(area => (
                            <FilterChip key={area} label={area} isActive={filters.areas.includes(area)} onClick={() => dispatch({ type: 'TOGGLE_AREA_FILTER', payload: area })} />
                        ))}
                    </FilterSection>

                    <FilterSection icon={<Tag size={16} />} title="Tags">
                        {allTags.map(tag => (
                            <FilterChip key={tag} label={tag} isActive={filters.tags.includes(tag)} onClick={() => dispatch({ type: 'TOGGLE_TAG_FILTER', payload: tag })} />
                        ))}
                    </FilterSection>
                     
                    <FilterSection icon={<Users size={16} />} title="Sex">
                        {['Male', 'Female'].map(s => (
                            <FilterChip key={s} label={s} isActive={filters.sex.includes(s)} onClick={() => dispatch({ type: 'TOGGLE_SEX_FILTER', payload: s })} />
                        ))}
                    </FilterSection>
                     
                    <FilterSection icon={<BarChart2 size={16} />} title="Last Visit Risk">
                        {['green', 'yellow', 'red'].map(r => (
                            <FilterChip key={r} label={r.charAt(0).toUpperCase() + r.slice(1)} isActive={filters.risk.includes(r)} onClick={() => dispatch({ type: 'TOGGLE_RISK_FILTER', payload: r })} />
                        ))}
                    </FilterSection>
                </div>
            </div>
            
            <BulkActions />
        </aside>
    );
};

const FilterSection: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            {icon} {title}
        </h3>
        <div className="flex flex-wrap gap-2">
            {children}
        </div>
    </div>
);

export default Sidebar;