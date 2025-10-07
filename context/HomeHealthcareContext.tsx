import React, { createContext, useReducer, useContext, useMemo, useEffect, useState, useCallback } from 'react';
import { AppState, Action, Role, Patient, Staff, Visit, Team, DoctorFollowUpData, NurseFollowUpData, PtFollowUpData, SwFollowUpData, ContactAttempt, CustomList } from '../types';
import { getRiskLevel } from '../utils/helpers';

// Define the LoadedData interface
interface LoadedData {
    patients: Patient[];
    staff: Staff[];
    areas: string[];
    criticalCases: {
        catheter: Partial<Patient>[];
        pressureSore: Partial<Patient>[];
        tubeFeeding: Partial<Patient>[];
        fallRisk: Partial<Patient>[];
        ivTherapy: Partial<Patient>[];
        ventilation: Partial<Patient>[];
    };
}

let initialData: LoadedData | null = null;

// Define the loadPatients function
async function loadPatients(): Promise<LoadedData> {
    try {
        // Try to load from the public JSON file
        const response = await fetch('/homecare_db_bundle_ar.v3.json');
        if (response.ok) {
            const data = await response.json();
            
            // Validate and structure the data
            const patients: Patient[] = (data.المرضى || []).map((p: any) => ({
                ...p,
                tags: p.tags || [],
                assessments: p.assessments || [],
                contactAttempts: p.contactAttempts || []
            }));
            const staff: Staff[] = data.طاقم || [];
            const areas: string[] = data.الأحياء || [];
            
            // Calculate critical cases from patients
            const criticalCases = {
                catheter: patients.filter(p => p.hasCatheter),
                pressureSore: patients.filter(p => p.wounds?.presentCount && p.wounds.presentCount > 0),
                tubeFeeding: patients.filter(p => p.ngTube || p.gTube),
                fallRisk: patients.filter(p => p.fallHighRisk),
                ivTherapy: patients.filter(p => p.ivTherapy),
                ventilation: patients.filter(p => p.ventSupport),
            };
            
            return {
                patients,
                staff,
                areas,
                criticalCases
            };
        }
    } catch (error) {
        console.warn('Failed to load data from JSON file:', error);
    }
    
    // Return empty data structure as fallback
    return {
        patients: [],
        staff: [],
        areas: [],
        criticalCases: {
            catheter: [],
            pressureSore: [],
            tubeFeeding: [],
            fallRisk: [],
            ivTherapy: [],
            ventilation: [],
        }
    };
}

const getInitialState = (data: LoadedData | null): AppState => {
    if (!data) {
        return {
            patients: [],
            staff: [],
            areas: [],
            criticalCases: {
                catheter: [],
                pressureSore: [],
                tubeFeeding: [],
                fallRisk: [],
                ivTherapy: [],
                ventilation: [],
            },
            filters: {
                search: '',
                areas: [],
                tags: [],
                sex: [],
                risk: [],
            },
            selectedPatientIds: new Set(),
            currentRole: Role.Doctor,
            visits: [],
            teams: [],
            customLists: [],
        };
    }

    const doctorStaff = data.staff.filter(s => s.المهنة === 'طبيب');
    const nurseStaff = data.staff.filter(s => s.المهنة === 'ممرض');

    return {
        ...data,
        filters: {
            search: '',
            areas: [],
            tags: [],
            sex: [],
            risk: [],
        },
        selectedPatientIds: new Set(),
        currentRole: Role.Doctor,
        visits: [],
        teams: [
            { id: 'team1', name: 'Team 1', members: [doctorStaff[0], nurseStaff[0], nurseStaff[1]].filter(Boolean) },
            { id: 'team2', name: 'Team 2', members: [doctorStaff[1], nurseStaff[2], nurseStaff[3]].filter(Boolean) },
            { id: 'team3', name: 'Team 3', members: [doctorStaff[2], nurseStaff[4], nurseStaff[5]].filter(Boolean) },
        ].filter(team => team.members.length > 0),
        customLists: [],
    };
};

const reducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'SET_SEARCH':
            return { ...state, filters: { ...state.filters, search: action.payload } };
        case 'TOGGLE_AREA_FILTER':
            const newAreas = state.filters.areas.includes(action.payload)
                ? state.filters.areas.filter(a => a !== action.payload)
                : [...state.filters.areas, action.payload];
            return { ...state, filters: { ...state.filters, areas: newAreas } };
        case 'TOGGLE_TAG_FILTER':
             const newTags = state.filters.tags.includes(action.payload)
                ? state.filters.tags.filter(a => a !== action.payload)
                : [...state.filters.tags, action.payload];
            return { ...state, filters: { ...state.filters, tags: newTags } };
        case 'TOGGLE_SEX_FILTER':
             const newSex = state.filters.sex.includes(action.payload)
                ? state.filters.sex.filter(a => a !== action.payload)
                : [...state.filters.sex, action.payload];
            return { ...state, filters: { ...state.filters, sex: newSex } };
        case 'TOGGLE_RISK_FILTER':
             const newRisk = state.filters.risk.includes(action.payload)
                ? state.filters.risk.filter(a => a !== action.payload)
                : [...state.filters.risk, action.payload];
            return { ...state, filters: { ...state.filters, risk: newRisk } };
        case 'CLEAR_FILTERS':
            return { ...state, filters: { search: '', areas: [], tags: [], sex: [], risk: [] } };
        case 'TOGGLE_PATIENT_SELECTION':
            const newSelectedIds = new Set(state.selectedPatientIds);
            if (newSelectedIds.has(action.payload)) {
                newSelectedIds.delete(action.payload);
            } else {
                newSelectedIds.add(action.payload);
            }
            return { ...state, selectedPatientIds: newSelectedIds };
        case 'CLEAR_SELECTIONS':
            return { ...state, selectedPatientIds: new Set() };
        case 'SELECT_ALL_FILTERED':
            return {...state, selectedPatientIds: new Set(action.payload)};
        case 'SET_ROLE':
            return { ...state, currentRole: action.payload };
        case 'ASSIGN_TO_VISITS': {
            const newVisits: Visit[] = action.payload.patientIds.map(patientId => ({
                patientId,
                date: action.payload.date,
                teamId: action.payload.teamId,
                status: 'Scheduled',
            }));
            // Avoid adding duplicate visits for the same patient on the same day
            const existingVisitKeys = new Set(state.visits.map(v => `${v.patientId}-${v.date}`));
            const filteredNewVisits = newVisits.filter(v => !existingVisitKeys.has(`${v.patientId}-${v.date}`));
            return { ...state, visits: [...state.visits, ...filteredNewVisits], selectedPatientIds: new Set() };
        }
        case 'SAVE_VISIT_NOTE': {
            const { visitId, role, note, user } = action.payload;
            const [patientId, date] = visitId.split('_');

            return {
                ...state,
                visits: state.visits.map(v => {
                    if (v.patientId === patientId && v.date === date) {
                        const updatedVisit = { ...v };
                        
                        if (role === Role.Doctor) {
                            updatedVisit.doctorNote = note as DoctorFollowUpData;
                            updatedVisit.doctorSign = user;
                        } else if (role === Role.Nurse) {
                            updatedVisit.nurseNote = note as NurseFollowUpData;
                            updatedVisit.nurseSign = user;
                        } else if (role === Role.PhysicalTherapist) {
                            updatedVisit.ptNote = note as PtFollowUpData;
                            updatedVisit.ptSign = user;
                        } else if (role === Role.SocialWorker) {
                            updatedVisit.swNote = note as SwFollowUpData;
                            updatedVisit.swSign = user;
                        }

                        const doctorCompleted = !!updatedVisit.doctorNote;
                        const nurseCompleted = !!updatedVisit.nurseNote;
                        
                        let newStatus: Visit['status'] = 'Scheduled';
                        if(doctorCompleted && nurseCompleted) newStatus = 'Completed';
                        else if (doctorCompleted) newStatus = 'DoctorCompleted';
                        else if (nurseCompleted) newStatus = 'NurseCompleted';
                        
                        updatedVisit.status = newStatus;
                        
                        return updatedVisit;
                    }
                    return v;
                }),
            };
        }
        case 'SAVE_ASSESSMENT': {
            const { patientId, assessment } = action.payload;
            return {
                ...state,
                patients: state.patients.map(p => {
                    if (p.nationalId === patientId) {
                        const updatedAssessments = [assessment, ...(p.assessments || [])];
                        let newBraden = p.bradenScore;
                        if(assessment.role === Role.Nurse && 'bradenScore' in assessment && assessment.bradenScore) {
                           newBraden = parseInt(String(assessment.bradenScore), 10);
                        }
                        return { 
                            ...p, 
                            assessments: updatedAssessments, 
                            bradenScore: newBraden || p.bradenScore,
                            tags: p.tags || [],
                            contactAttempts: p.contactAttempts || []
                        };
                    }
                    return p;
                }),
            };
        }
        case 'LOG_CONTACT_ATTEMPT': {
            return {
                ...state,
                patients: state.patients.map(p => {
                    if (p.nationalId === action.payload.patientId) {
                        return { 
                            ...p, 
                            contactAttempts: [action.payload.contactAttempt, ...(p.contactAttempts || [])] 
                        };
                    }
                    return p;
                })
            };
        }
        case 'CANCEL_VISIT': {
            return {
                ...state,
                visits: state.visits.filter(v => !(v.patientId === action.payload.patientId && v.date === action.payload.date))
            };
        }
        case 'IMPORT_STATE': {
            // Basic validation
            if (action.payload && action.payload.patients && action.payload.filters) {
                // Re-hydrate the Set for selectedPatientIds from the imported array
                const rehydratedState = {
                    ...getInitialState(null), // Start with a clean slate
                    ...action.payload,
                    selectedPatientIds: new Set(action.payload.selectedPatientIds || []),
                };
                return rehydratedState;
            }
            return state; // Or show an error
        }
        case 'CREATE_CUSTOM_LIST': {
            if (state.selectedPatientIds.size === 0 || !action.payload.name) {
                return state;
            }
            const newList: CustomList = {
                id: Date.now().toString(),
                name: action.payload.name,
                patientIds: Array.from(state.selectedPatientIds),
            };
            return { ...state, customLists: [...state.customLists, newList] };
        }
        case 'DELETE_CUSTOM_LIST': {
            return {
                ...state,
                customLists: state.customLists.filter(list => list.id !== action.payload.id),
            };
        }
        case 'APPLY_CUSTOM_LIST': {
            const list = state.customLists.find(l => l.id === action.payload.id);
            if (list) {
                return { ...state, selectedPatientIds: new Set(list.patientIds) };
            }
            return state;
        }
        default:
            return state;
    }
};

interface ContextActions {
  selectPatient: (patientId: string) => void;
  clearSelections: () => void;
  updateFilters: (filters: Partial<AppState['filters']>) => void;
  setRole: (role: Role) => void;
  logContactAttempt: (patientId: string, attempt: ContactAttempt) => void;
}

const HomeHealthcareContext = createContext<{ 
  state: AppState; 
  dispatch: React.Dispatch<Action>;
  filteredPatients: Patient[];
  actions: ContextActions;
  loading: boolean;
  error: string | null;
} | undefined>(undefined);

export const HomeHealthcareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [dataLoaded, setDataLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [state, dispatch] = useReducer(reducer, getInitialState(null));

    // Action functions
    const selectPatient = useCallback((patientId: string) => {
        dispatch({ type: 'TOGGLE_PATIENT_SELECTION', payload: patientId });
    }, []);

    const clearSelections = useCallback(() => {
        dispatch({ type: 'CLEAR_SELECTIONS' });
    }, []);

    const updateFilters = useCallback((filters: Partial<AppState['filters']>) => {
        Object.entries(filters).forEach(([key, value]) => {
            switch (key) {
                case 'search':
                    dispatch({ type: 'SET_SEARCH', payload: value as string });
                    break;
                case 'areas':
                    // Handle array updates
                    break;
                // Add other filter types as needed
            }
        });
    }, []);

    const setRole = useCallback((role: Role) => {
        dispatch({ type: 'SET_ROLE', payload: role });
    }, []);

    const logContactAttempt = useCallback((patientId: string, attempt: ContactAttempt) => {
        dispatch({ type: 'LOG_CONTACT_ATTEMPT', payload: { patientId, contactAttempt: attempt } });
    }, []);

    const actions = useMemo(() => ({
        selectPatient,
        clearSelections,
        updateFilters,
        setRole,
        logContactAttempt
    }), [selectPatient, clearSelections, updateFilters, setRole, logContactAttempt]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('🔄 Starting to load patient data...');
                
                const data = await loadPatients();
                
                // Validate loaded data
                if (!data || !data.patients || !Array.isArray(data.patients)) {
                    throw new Error('Invalid data structure received');
                }
                
                console.log('✅ Patient data loaded:', { 
                    patientsCount: data.patients.length, 
                    staffCount: data.staff.length,
                    areasCount: data.areas.length
                });
                
                initialData = data;
                const newState = getInitialState(data);
                dispatch({ type: 'IMPORT_STATE', payload: newState });
                setDataLoaded(true);
                setLoading(false);
                console.log('✅ HomeHealthcare context initialized successfully');
            } catch (error) {
                console.error('❌ Failed to load patient data:', error);
                setError(error instanceof Error ? error.message : 'Unknown error occurred');
                
                // Load empty state as fallback
                const fallbackState = getInitialState(null);
                dispatch({ type: 'IMPORT_STATE', payload: fallbackState });
                setDataLoaded(true);
                setLoading(false);
                
                console.warn('⚠️ Using empty state as fallback');
            }
        };

        if (!dataLoaded) {
            loadData();
        }
    }, [dataLoaded]);

    const filteredPatients = useMemo(() => {
        const { patients, filters } = state;
        
        // Safety check: ensure patients array exists
        if (!patients || !Array.isArray(patients)) {
            console.warn('Patients array is undefined or not an array:', patients);
            return [];
        }
        
        const { search, areas, tags, sex, risk } = filters;
        const lowerCaseSearch = search.toLowerCase();

        return patients.filter(p => {
            if (p.status === 'deceased') return false;
            
            const riskLevel = getRiskLevel(p.admissionDate).level;
            const nameMatch = p.nameAr.toLowerCase().includes(lowerCaseSearch);
            const idMatch = p.nationalId.includes(search);
            const searchMatch = search === '' || nameMatch || idMatch;

            const areaMatch = areas.length === 0 || (p.areaId && areas.includes(p.areaId));
            const tagMatch = tags.length === 0 || tags.every(tag => p.tags?.includes(tag));
            const sexMatch = sex.length === 0 || (p.sex && sex.includes(p.sex));
            const riskMatch = risk.length === 0 || risk.includes(riskLevel);

            return searchMatch && areaMatch && tagMatch && sexMatch && riskMatch;
        });
    }, [state.patients, state.filters]);

    return (
        <HomeHealthcareContext.Provider value={{ state, dispatch, filteredPatients, actions, loading, error }}>
            {children}
        </HomeHealthcareContext.Provider>
    );
};

export const useHomeHealthcare = () => {
    const context = useContext(HomeHealthcareContext);
    if (context === undefined) {
        throw new Error('useHomeHealthcare must be used within a HomeHealthcareProvider');
    }
    return context;
};