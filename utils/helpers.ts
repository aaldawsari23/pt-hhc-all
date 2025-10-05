import { Patient, Role } from '../types';

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


// This function has been moved to src/services/dataSource.ts
// and is no longer needed here since data loading is now centralized

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
