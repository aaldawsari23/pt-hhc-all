import { migrateToV3 } from '../src/data/local/migrateToV3';
import { repo } from '../src/data/local/repo';

export interface LoadedData {
  patients: any[];
  staff: any[];
  areas: string[];
  criticalCases: {
    catheter: any[];
    pressureSore: any[];
    tubeFeeding: any[];
    fallRisk: any[];
    ivTherapy: any[];
    ventilation: any[];
  };
}

// Cache to avoid repeated network requests
let dataCache: LoadedData | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const loadPatients = async (): Promise<LoadedData> => {
  // Initialize or migrate database first
  await migrateToV3();
  
  // Return cached data if still valid
  const now = Date.now();
  if (dataCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return dataCache;
  }

  try {
    // Primary: Try IndexedDB first
    console.log('Attempting to load data from IndexedDB...');
    const patients = await repo.listPatients();
    
    if (patients.length > 0) {
      console.log('Successfully loaded data from IndexedDB');
      const processedData = {
        patients,
        staff: [], // TODO: load from rolesDirectory
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
      dataCache = processedData;
      cacheTimestamp = now;
      return processedData;
    }
  } catch (error) {
    console.warn('IndexedDB failed, falling back to JSON bundle:', error);
  }

  // Fallback: Load from JSON bundle
  try {
    console.log('Loading data from JSON bundle fallback...');
    const response = await fetch('/homecare_db_bundle_ar.v3.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const jsonData = await response.json();
    console.log('Successfully loaded data from JSON bundle');
    
    const processedData = processJsonData(jsonData);
    
    // Validate processed data
    if (!processedData || !processedData.patients || !Array.isArray(processedData.patients)) {
      throw new Error('Invalid processed data structure');
    }
    
    console.log('✅ Data validation passed:', {
      patientsCount: processedData.patients.length,
      staffCount: processedData.staff.length,
      areasCount: processedData.areas.length
    });
    
    dataCache = processedData;
    cacheTimestamp = now;
    return processedData;
  } catch (error) {
    console.error('Both data sources failed, using minimal fallback:', error);
    
    // Last resort: return minimal working data structure
    const fallbackData: LoadedData = {
      patients: [],
      staff: [
        {
          الاسم: 'د. أحمد محمد',
          المهنة: 'طبيب',
          الايميل: 'doctor@hospital.sa',
          الجوال: '0501234567',
          رقم_الهوية: '1234567890'
        },
        {
          الاسم: 'أ. فاطمة علي',
          المهنة: 'ممرض',
          الايميل: 'nurse@hospital.sa',
          الجوال: '0507654321',
          رقم_الهوية: '0987654321'
        },
        {
          الاسم: 'أ. سارة أحمد',
          المهنة: 'أخصائي اجتماعي',
          الايميل: 'social@hospital.sa',
          الجوال: '0505555555',
          رقم_الهوية: '5555555555'
        }
      ],
      areas: ['الحي الأول', 'الحي الثاني', 'الحي الثالث'],
      criticalCases: {
        catheter: [],
        pressureSore: [],
        tubeFeeding: [],
        fallRisk: [],
        ivTherapy: [],
        ventilation: []
      }
    };
    
    console.log('⚠️ Using minimal fallback data structure');
    dataCache = fallbackData;
    cacheTimestamp = now;
    return fallbackData;
  }
};

// Process Netlify DB data into expected format
const processNetlifyData = (patients: any[], staff: any[]): LoadedData => {
  // Convert Netlify DB format to app format
  const processedPatients = patients.map((p, index) => {
    const tags: string[] = JSON.parse(p.tags || '[]');
    const assessments = JSON.parse(p.assessments || '[]');
    const contactAttempts = JSON.parse(p.contact_attempts || '[]');
    
    const sex: 'Male' | 'Female' = index % 3 === 0 ? 'Female' : 'Male';
    
    return {
      nationalId: p.national_id,
      nameAr: p.name_ar,
      phone: p.phone,
      areaId: p.area_id,
      status: p.status as 'active' | 'deceased',
      level: "4", // Default level
      bradenScore: p.braden_score,
      minMonthlyRequired: 1, // Default
      admissionDate: p.admission_date,
      gmapsUrl: false,
      tags,
      sex,
      assessments,
      contactAttempts
    };
  });

  const processedStaff = staff.map(s => ({
    الاسم: s.name_ar,
    المهنة: s.profession_ar,
    الايميل: s.email,
    الجوال: s.phone,
    رقم_الهوية: s.id?.toString() || s.national_id
  }));

  // Extract unique areas from patients
  const areas = [...new Set(processedPatients.map(p => p.areaId).filter(Boolean))];

  // Build critical cases by filtering patients with specific tags
  const criticalCases = {
    catheter: processedPatients.filter(p => p.tags.includes('Catheter')).map(p => ({ nationalId: p.nationalId, hasCatheter: true })),
    pressureSore: processedPatients.filter(p => p.tags.includes('Pressure Ulcer')).map(p => ({ nationalId: p.nationalId, wounds: { presentCount: 1, statusRaw: "Active Wound" } })),
    tubeFeeding: processedPatients.filter(p => p.tags.includes('Tube Feeding')).map(p => ({ nationalId: p.nationalId, ngTube: true })),
    fallRisk: processedPatients.filter(p => p.tags.includes('Fall Risk')).map(p => ({ nationalId: p.nationalId, fallHighRisk: true })),
    ivTherapy: processedPatients.filter(p => p.tags.includes('IV Therapy')).map(p => ({ nationalId: p.nationalId, ivTherapy: true })),
    ventilation: processedPatients.filter(p => p.tags.includes('Ventilation')).map(p => ({ nationalId: p.nationalId, ventSupport: true }))
  };

  return {
    patients: processedPatients,
    staff: processedStaff,
    areas,
    criticalCases
  };
};

// Process JSON bundle data into expected format
const processJsonData = (jsonData: any): LoadedData => {
  const allPatients = jsonData.المرضى.map((p: any, index: number) => {
    const tags: string[] = [];
    if (jsonData.حالات_حرجة.مرضى_القساطر.some((cp: any) => cp.nationalId === p.nationalId)) tags.push('Catheter');
    if (jsonData.حالات_حرجة.مرضى_قرح_الفراش.some((cp: any) => cp.nationalId === p.nationalId)) tags.push('Pressure Ulcer');
    if (jsonData.حالات_حرجة.مرضى_التغذية_الأنبوبية.some((cp: any) => cp.nationalId === p.nationalId)) tags.push('Tube Feeding');
    if (jsonData.حالات_حرجة.مرضى_خطر_السقوط.some((cp: any) => cp.nationalId === p.nationalId)) tags.push('Fall Risk');
    if (jsonData.حالات_حرجة.مرضى_العلاج_الوريدي.some((cp: any) => cp.nationalId === p.nationalId)) tags.push('IV Therapy');
    if (jsonData.حالات_حرجة.مرضى_التهوية.some((cp: any) => cp.nationalId === p.nationalId)) tags.push('Ventilation');
    
    const sex: 'Male' | 'Female' = index % 3 === 0 ? 'Female' : 'Male';

    return { 
      ...p, 
      tags, 
      sex, 
      status: p.status as 'active' | 'deceased', 
      assessments: [], 
      contactAttempts: [] 
    };
  });

  return {
    patients: allPatients,
    staff: jsonData.طاقم,
    areas: jsonData.الأحياء,
    criticalCases: {
      catheter: jsonData.حالات_حرجة.مرضى_القساطر,
      pressureSore: jsonData.حالات_حرجة.مرضى_قرح_الفراش,
      tubeFeeding: jsonData.حالات_حرجة.مرضى_التغذية_الأنبوبية,
      fallRisk: jsonData.حالات_حرجة.مرضى_خطر_السقوط,
      ivTherapy: jsonData.حالات_حرجة.مرضى_العلاج_الوريدي,
      ventilation: jsonData.حالات_حرجة.مرضى_التهوية,
    }
  };
};

// Clear cache (useful for testing or manual refresh)
export const clearDataCache = () => {
  dataCache = null;
  cacheTimestamp = 0;
};