import { Patient, Role } from '../types';
import { DATA } from '../data';

export const getRiskLevel = (dateString: string | null): { level: 'red' | 'yellow' | 'green' | 'gray'; label: string } => {
    if (!dateString) return { level: 'gray', label: 'No Data' };

    const lastVisit = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastVisit.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = diffDays / 7;

    if (diffWeeks >= 8) return { level: 'red', label: '8+ weeks' };
    if (diffWeeks >= 6) return { level: 'yellow', label: '6-8 weeks' };
    return { level: 'green', label: '< 6 weeks' };
};

export const riskLevelToColor = {
    red: 'bg-red-100 text-red-800 border-red-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    gray: 'bg-gray-100 text-gray-800 border-gray-300',
};

export const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};


export const processInitialData = () => {
  const allPatients = DATA.المرضى.map((p, index) => {
    const tags: string[] = [];
    if (DATA.حالات_حرجة.مرضى_القساطر.some(cp => cp.nationalId === p.nationalId)) tags.push('Catheter');
    if (DATA.حالات_حرجة.مرضى_قرح_الفراش.some(cp => cp.nationalId === p.nationalId)) tags.push('Pressure Ulcer');
    if (DATA.حالات_حرجة.مرضى_التغذية_الأنبوبية.some(cp => cp.nationalId === p.nationalId)) tags.push('Tube Feeding');
    if (DATA.حالات_حرجة.مرضى_خطر_السقوط.some(cp => cp.nationalId === p.nationalId)) tags.push('Fall Risk');
    if (DATA.حالات_حرجة.مرضى_العلاج_الوريدي.some(cp => cp.nationalId === p.nationalId)) tags.push('IV Therapy');
    if (DATA.حالات_حرجة.مرضى_التهوية.some(cp => cp.nationalId === p.nationalId)) tags.push('Ventilation');
    
    // Simulate some missing data for realism
    // FIX: Explicitly type `sex` to ensure it is not widened to a generic `string` type.
    const sex: 'Male' | 'Female' = index % 3 === 0 ? 'Female' : 'Male';

    // FIX: Cast status to the correct literal type to match the Patient interface.
    return { ...p, tags, sex, status: p.status as 'active' | 'deceased', assessments: [] };
  });

  return {
    patients: allPatients,
    staff: DATA.طاقم,
    areas: DATA.الأحياء,
    criticalCases: {
      catheter: DATA.حالات_حرجة.مرضى_القساطر,
      pressureSore: DATA.حالات_حرجة.مرضى_قرح_الفراش,
      tubeFeeding: DATA.حالات_حرجة.مرضى_التغذية_الأنبوبية,
      fallRisk: DATA.حالات_حرجة.مرضى_خطر_السقوط,
      ivTherapy: DATA.حالات_حرجة.مرضى_العلاج_الوريدي,
      ventilation: DATA.حالات_حرجة.مرضى_التهوية,
    }
  };
};

export const getRoleBasedStaff = (staff: any[], role: Role) => {
  const roleMapping: { [key in Role]?: string[] } = {
    [Role.Doctor]: ['طبيب'],
    [Role.Nurse]: ['ممرض'],
    [Role.PhysicalTherapist]: ['اخصائي علاج طبيعي', 'فني علاج طبيعي'],
    [Role.SocialWorker]: ['أخصائي اجتماعي'],
    [Role.Driver]: ['سائق'],
  };
  const targetProfessions = roleMapping[role] || [];
  return staff.filter(s => targetProfessions.includes(s.المهنة));
};