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

const CustomLists: React.FC = () => {
    const { state, dispatch } = useHomeHealthcare();
    const [newListName, setNewListName] = useState('');
    const hasSelection = state.selectedPatientIds.size > 0;

    const handleCreateList = () => {
        if (newListName.trim() && hasSelection) {
            dispatch({ type: 'CREATE_CUSTOM_LIST', payload: { name: newListName.trim() } });
            setNewListName('');
        }
    };

    return (
        <div className="p-4 border-t border-gray-200">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <List size={16} /> Custom Lists
            </h3>
            {hasSelection && (
                <div className="flex gap-2 mb-3">
                    <input 
                        type="text"
                        value={newListName}
                        onChange={e => setNewListName(e.target.value)}
                        placeholder="New list name..."
                        className="w-full bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <button onClick={handleCreateList} className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50" disabled={!newListName.trim()}>
                        <Save size={16} />
                    </button>
                </div>
            )}
             <div className="flex flex-wrap gap-2">
                {state.customLists.map(list => (
                    <div key={list.id} className="group flex items-center bg-gray-200 rounded-full text-xs">
                        <button onClick={() => dispatch({ type: 'APPLY_CUSTOM_LIST', payload: { id: list.id }})} className="px-3 py-1 hover:bg-gray-300 rounded-l-full">
                            {list.name} <span className="text-gray-500">({list.patientIds.length})</span>
                        </button>
                         <button onClick={() => dispatch({ type: 'DELETE_CUSTOM_LIST', payload: { id: list.id }})} className="px-2 py-1 text-gray-500 hover:bg-red-200 hover:text-red-600 rounded-r-full">
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};


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
    
    const handleExport = () => {
        const stateToExport = {
            ...state,
            selectedPatientIds: Array.from(state.selectedPatientIds),
            customLists: state.customLists,
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stateToExport, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `hhc_export_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedState = JSON.parse(e.target?.result as string);
                    dispatch({ type: 'IMPORT_STATE', payload: importedState });
                    alert('Data imported successfully!');
                } catch (error) {
                    console.error("Failed to import data:", error);
                    alert('Failed to import data. The file might be corrupted.');
                }
            };
            reader.readAsText(file);
        }
        event.target.value = ''; // Reset file input
    };


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
                 <CustomLists />
            </div>
            
            <BulkActions />
            
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Data Management</h3>
                <div className="space-y-2">
                    <button onClick={handleExport} className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm">
                        Export Data
                    </button>
                    <input type="file" id="import-file" accept=".json" onChange={handleImport} className="hidden" />
                    <label htmlFor="import-file" className="w-full block text-center bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer text-sm">
                        Import Data
                    </label>
                </div>
            </div>
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