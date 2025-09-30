import React, { createContext, useReducer, useContext, useMemo } from 'react';
import { AppState, Action, Role, Patient, Staff, Visit, Team, DoctorFollowUpData, NurseFollowUpData, PtFollowUpData, SwFollowUpData, ContactAttempt, CustomList } from '../types';
import { processInitialData, getRiskLevel } from '../utils/helpers';
import { DATA } from '../data';

const initialData = processInitialData();

const doctorStaff = initialData.staff.filter(s => s.المهنة === 'طبيب');
const nurseStaff = initialData.staff.filter(s => s.المهنة === 'ممرض');

const initialState: AppState = {
    ...initialData,
    filters: {
        search: '',
        areas: [],
        tags: [],
        sex: [],
        risk: [],
    },
    selectedPatientIds: new Set(),
    currentRole: Role.Coordinator,
    visits: [],
    teams: [
        { id: 'team1', name: 'Team 1', members: [doctorStaff[0], nurseStaff[0], nurseStaff[1]] },
        { id: 'team2', name: 'Team 2', members: [doctorStaff[1], nurseStaff[2], nurseStaff[3]] },
        { id: 'team3', name: 'Team 3', members: [doctorStaff[2], nurseStaff[4], nurseStaff[5]] },
    ],
    customLists: [],
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
                        return { ...p, assessments: updatedAssessments, bradenScore: newBraden || p.bradenScore };
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
                        const newAttempt: ContactAttempt = {
                            date: new Date().toISOString(),
                            type: action.payload.type,
                            staffName: action.payload.staffName,
                        };
                        return { ...p, contactAttempts: [newAttempt, ...(p.contactAttempts || [])] };
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
            if (action.payload && action.payload.patients && action.payload.filters) {
                const importedData = action.payload;
                // Re-hydrate Sets and other non-serializable data structures
                const rehydratedState = {
                    ...initialState, // Start with a clean base
                    ...importedData,
                    patients: importedData.patients || initialState.patients,
                    visits: importedData.visits || initialState.visits,
                    customLists: importedData.customLists || initialState.customLists,
                    selectedPatientIds: new Set(Array.isArray(importedData.selectedPatientIds) ? importedData.selectedPatientIds : []),
                };
                return rehydratedState;
            }
            return state;
        }
        case 'CREATE_CUSTOM_LIST': {
            if (state.selectedPatientIds.size === 0 || !action.payload.name) {
                return state;
            }
            const newList: CustomList = {
                id: Date.now().toString(),
                name: action.payload.name,
                patientIds: Array.from(state.selectedPatientIds),
                createdAt: new Date().toISOString(),
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

const HomeHealthcareContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action>, filteredPatients: Patient[] } | undefined>(undefined);

export const HomeHealthcareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const filteredPatients = useMemo(() => {
        const { patients, filters } = state;
        const { search, areas, tags, sex, risk } = filters;
        const lowerCaseSearch = search.toLowerCase();

        return patients.filter(p => {
            if (p.status === 'deceased') return false;
            
            const riskLevel = getRiskLevel(p.admissionDate).level;
            const nameMatch = p.nameAr.toLowerCase().includes(lowerCaseSearch);
            const idMatch = p.nationalId.includes(search);
            const searchMatch = search === '' || nameMatch || idMatch;

            const areaMatch = areas.length === 0 || (p.areaId && areas.includes(p.areaId));
            const tagMatch = tags.length === 0 || tags.every(tag => p.tags.includes(tag));
            const sexMatch = sex.length === 0 || (p.sex && sex.includes(p.sex));
            const riskMatch = risk.length === 0 || risk.includes(riskLevel);

            return searchMatch && areaMatch && tagMatch && sexMatch && riskMatch;
        });
    }, [state.patients, state.filters]);

    return (
        <HomeHealthcareContext.Provider value={{ state, dispatch, filteredPatients }}>
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