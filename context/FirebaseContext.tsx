import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { AppState, Action, Role, Patient, Staff, Visit, Team, Assessment } from '../types';
import { processInitialData, getRiskLevel } from '../utils/helpers';
import { DATA } from '../data';
import { AuthService, FirestoreService, SyncService, StorageService } from '../utils/firebase';
import { NetlifyDbService } from '../utils/netlifyDb';

interface FirebaseContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  filteredPatients: Patient[];
  currentUser: any;
  isAuthenticated: boolean;
  syncStatus: any;
  useNetlifyDb: boolean;
  switchToNetlifyDb: () => void;
  switchToFirebase: () => void;
}

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
      return { ...state, selectedPatientIds: new Set(action.payload) };
    
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
      
      // Save to Firebase
      filteredNewVisits.forEach(visit => {
        SyncService.queueForSync('saveVisit', visit);
        FirestoreService.logActivity('assign_visit', {
          patientIds: action.payload.patientIds,
          teamId: action.payload.teamId,
          date: action.payload.date
        });
      });
      
      return { ...state, visits: [...state.visits, ...filteredNewVisits], selectedPatientIds: new Set() };
    }
    
    case 'SAVE_VISIT_NOTE': {
      const { visitId, role, note, user } = action.payload;
      const [patientId, date] = visitId.split('_');

      const updatedVisits = state.visits.map(v => {
        if (v.patientId === patientId && v.date === date) {
          const updatedVisit = { ...v };
          
          if (role === Role.Doctor) {
            updatedVisit.doctorNote = note;
            updatedVisit.doctorSign = user;
          } else if (role === Role.Nurse) {
            updatedVisit.nurseNote = note;
            updatedVisit.nurseSign = user;
          } else if (role === Role.PhysicalTherapist) {
            updatedVisit.ptNote = note;
            updatedVisit.ptSign = user;
          } else if (role === Role.SocialWorker) {
            updatedVisit.swNote = note;
            updatedVisit.swSign = user;
          }

          const doctorCompleted = !!updatedVisit.doctorNote;
          const nurseCompleted = !!updatedVisit.nurseNote;
          
          let newStatus: Visit['status'] = 'Scheduled';
          if (doctorCompleted && nurseCompleted) newStatus = 'Completed';
          else if (doctorCompleted) newStatus = 'DoctorCompleted';
          else if (nurseCompleted) newStatus = 'NurseCompleted';
          
          updatedVisit.status = newStatus;
          
          // Save to Firebase
          SyncService.queueForSync('saveVisit', updatedVisit);
          FirestoreService.logActivity('save_visit_note', {
            visitId,
            role,
            status: newStatus
          });
          
          return updatedVisit;
        }
        return v;
      });

      return { ...state, visits: updatedVisits };
    }
    
    case 'SAVE_ASSESSMENT': {
      const { patientId, assessment } = action.payload;
      
      const updatedPatients = state.patients.map(p => {
        if (p.nationalId === patientId) {
          const updatedAssessments = [assessment, ...(p.assessments || [])];
          let newBraden = p.bradenScore;
          if (assessment.role === Role.Nurse && 'bradenScore' in assessment && assessment.bradenScore) {
            newBraden = parseInt(String(assessment.bradenScore), 10);
          }
          
          const updatedPatient = { 
            ...p, 
            assessments: updatedAssessments, 
            bradenScore: newBraden || p.bradenScore 
          };
          
          // Save to Firebase
          SyncService.queueForSync('savePatient', updatedPatient);
          SyncService.queueForSync('saveAssessment', assessment);
          FirestoreService.logActivity('save_assessment', {
            patientId,
            assessmentId: assessment.id,
            role: assessment.role
          });
          
          return updatedPatient;
        }
        return p;
      });

      return { ...state, patients: updatedPatients };
    }
    
    case 'LOG_CONTACT_ATTEMPT': {
      const updatedPatients = state.patients.map(p => {
        if (p.nationalId === action.payload.patientId) {
          const newAttempt = {
            date: new Date().toISOString(),
            type: action.payload.type,
            staffName: action.payload.staffName,
          };
          
          const updatedPatient = { 
            ...p, 
            contactAttempts: [newAttempt, ...(p.contactAttempts || [])] 
          };
          
          // Save to Firebase
          SyncService.queueForSync('savePatient', updatedPatient);
          FirestoreService.logActivity('log_contact_attempt', {
            patientId: action.payload.patientId,
            type: action.payload.type,
            staffName: action.payload.staffName
          });
          
          return updatedPatient;
        }
        return p;
      });

      return { ...state, patients: updatedPatients };
    }
    
    case 'CANCEL_VISIT': {
      const filteredVisits = state.visits.filter(v => 
        !(v.patientId === action.payload.patientId && v.date === action.payload.date)
      );
      
      // Log activity
      FirestoreService.logActivity('cancel_visit', {
        patientId: action.payload.patientId,
        date: action.payload.date
      });
      
      return { ...state, visits: filteredVisits };
    }
    
    case 'IMPORT_STATE': {
      // Basic validation
      if (action.payload && action.payload.patients && action.payload.filters) {
        // Re-hydrate the Set for selectedPatientIds from the imported array
        const rehydratedState = {
          ...initialState, // Start with a clean slate
          ...action.payload,
          selectedPatientIds: new Set(action.payload.selectedPatientIds || []),
        };
        return rehydratedState;
      }
      return state;
    }
    
    case 'CREATE_CUSTOM_LIST': {
      if (state.selectedPatientIds.size === 0 || !action.payload.name) {
        return state;
      }
      const newList = {
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

    case 'LOAD_NETLIFY_DATA': {
      return {
        ...state,
        patients: action.payload.patients || state.patients,
        staff: action.payload.staff || state.staff,
        visits: action.payload.visits || state.visits,
        selectedPatientIds: new Set() // Clear selections when loading new data
      };
    }
    
    default:
      return state;
  }
};

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [syncStatus, setSyncStatus] = React.useState({ isOnline: true, queueLength: 0, syncInProgress: false });
  const [useNetlifyDb, setUseNetlifyDb] = React.useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      // Set user role based on their job title
      const mappedRole = user.mappedRole;
      if (mappedRole && Object.values(Role).includes(mappedRole)) {
        dispatch({ type: 'SET_ROLE', payload: mappedRole });
      }
    }
  }, []);

  // Load data from Firebase on authentication
  useEffect(() => {
    if (isAuthenticated) {
      if (useNetlifyDb) {
        loadDataFromNetlifyDb();
      } else {
        loadDataFromFirebase();
      }
    }
  }, [isAuthenticated, useNetlifyDb]);

  // Update sync status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(SyncService.getSyncStatus());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDataFromFirebase = async () => {
    try {
      // Load patients from Firebase
      const patients = await FirestoreService.getAllPatients();
      if (patients.length > 0) {
        // Update state with Firebase data
        // Note: This would need a new action type to replace all data
        console.log('Loaded patients from Firebase:', patients.length);
      }

      // Load recent visits
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const visits = await FirestoreService.getVisitsByDateRange(weekAgo, today);
      console.log('Loaded visits from Firebase:', visits.length);
      
    } catch (error) {
      console.error('Error loading data from Firebase:', error);
    }
  };

  const loadDataFromNetlifyDb = async () => {
    try {
      // Load patients from Netlify DB
      const dbPatients = await NetlifyDbService.getAllPatients();
      console.log('Loaded patients from Netlify DB:', dbPatients.length);
      
      // Load staff from Netlify DB
      const dbStaff = await NetlifyDbService.getAllStaff();
      console.log('Loaded staff from Netlify DB:', dbStaff.length);
      
      if (dbPatients.length > 0) {
        // Convert PostgreSQL data to app format
        const convertedPatients = dbPatients.map(p => ({
          nationalId: p.national_id,
          nameAr: p.name_ar,
          nameEn: p.name_en || '',
          age: p.age || 0,
          sex: p.sex || '',
          admissionDate: p.admission_date || '',
          areaId: p.area_id || '',
          phone: p.phone || '',
          address: p.address || '',
          medicalDiagnosis: p.medical_diagnosis || '',
          bradenScore: p.braden_score || 0,
          status: p.status || 'active',
          tags: p.tags || [],
          contactAttempts: p.contact_attempts || [],
          assessments: p.assessments || []
        }));

        // Convert staff data
        const convertedStaff = dbStaff.map(s => ({
          id: s.id,
          الاسم: s.name_ar,
          nameEn: s.name_en || s.name_ar,
          المهنة: s.profession_ar,
          professionEn: s.profession_en || s.profession_ar,
          phone: s.phone || '',
          email: s.email || '',
          areaId: s.area_id || ''
        }));

        // Update state with Netlify DB data
        dispatch({
          type: 'LOAD_NETLIFY_DATA',
          payload: {
            patients: convertedPatients,
            staff: convertedStaff
          }
        });

        console.log(`✅ Loaded ${convertedPatients.length} patients and ${convertedStaff.length} staff from Netlify DB`);
      }
      
    } catch (error) {
      console.error('Error loading data from Netlify DB:', error);
    }
  };

  const switchToNetlifyDb = async () => {
    setUseNetlifyDb(true);
    localStorage.setItem('useNetlifyDb', 'true');
    
    // Load data from Netlify DB immediately
    if (isAuthenticated) {
      await loadDataFromNetlifyDb();
    }
  };

  const switchToFirebase = () => {
    setUseNetlifyDb(false);
    localStorage.setItem('useNetlifyDb', 'false');
  };

  // Check localStorage for database preference on mount and load data
  useEffect(() => {
    const savedPreference = localStorage.getItem('useNetlifyDb');
    if (savedPreference === 'true') {
      setUseNetlifyDb(true);
    } else {
      // Default to Netlify DB since it has the imported data
      setUseNetlifyDb(true);
      localStorage.setItem('useNetlifyDb', 'true');
    }
    
    // Force data load if authenticated and using Netlify DB
    if (isAuthenticated && (savedPreference === 'true' || !savedPreference)) {
      console.log('🔄 Force loading Netlify DB data on mount...');
      loadDataFromNetlifyDb();
    }
  }, [isAuthenticated]);

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

  const contextValue: FirebaseContextType = {
    state,
    dispatch,
    filteredPatients,
    currentUser,
    isAuthenticated,
    syncStatus,
    useNetlifyDb,
    switchToNetlifyDb,
    switchToFirebase
  };

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};