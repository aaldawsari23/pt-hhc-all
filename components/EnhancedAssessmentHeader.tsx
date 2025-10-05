import React, { useState } from 'react';
import { Patient, Role, Staff } from '../types';
import { User, ChevronDown } from 'lucide-react';

interface EnhancedAssessmentHeaderProps {
  title: string;
  titleAr: string;
  patient?: Patient;
  role?: Role;
  subtitle?: string;
  showIcons?: boolean;
  staff: Staff[];
  onDoctorSelect?: (doctor: Staff) => void;
  onNurseSelect?: (nurse: Staff) => void;
  selectedDoctor?: Staff | null;
  selectedNurse?: Staff | null;
}

const EnhancedAssessmentHeader: React.FC<EnhancedAssessmentHeaderProps> = ({ 
  title, 
  titleAr, 
  patient, 
  role, 
  subtitle,
  showIcons = true,
  staff,
  onDoctorSelect,
  onNurseSelect,
  selectedDoctor,
  selectedNurse
}) => {
  const [showDoctorSelector, setShowDoctorSelector] = useState(false);
  const [showNurseSelector, setShowNurseSelector] = useState(false);

  const getRoleColor = (role?: Role) => {
    switch (role) {
      case Role.Doctor: return 'from-blue-600 to-blue-700';
      case Role.Nurse: return 'from-green-600 to-green-700';
      case Role.PhysicalTherapist: return 'from-purple-600 to-purple-700';
      case Role.SocialWorker: return 'from-orange-600 to-orange-700';
      default: return 'from-blue-600 to-blue-700';
    }
  };

  const doctors = staff.filter(s => s.المهنة === 'طبيب');
  const nurses = staff.filter(s => s.المهنة === 'ممرض');

  return (
    <div className={`bg-gradient-to-r ${getRoleColor(role)} text-white p-4 md:p-6 rounded-t-lg`}>
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        {/* Left Side - Logos and Title */}
        <div className="flex items-start gap-3 md:gap-4">
          {showIcons && (
            <div className="flex flex-col gap-2 flex-shrink-0">
              {/* MOH Logo */}
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <div className="text-green-600 font-bold text-lg md:text-xl">🇸🇦</div>
                  <div className="text-xs text-green-600 font-bold">MOH</div>
                </div>
              </div>
              {/* Hospital Logo */}
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <div className="text-blue-600 font-bold text-sm">KAH</div>
                  <div className="text-xs text-blue-600">Bisha</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Title Section */}
          <div className="flex-1">
            <div className="mb-3">
              <h1 className="text-xl md:text-2xl font-bold leading-tight">
                King Abdullah Hospital - Bisha
              </h1>
              <p className="text-sm md:text-base opacity-90">
                مستشفى الملك عبدالله - بيشه
              </p>
              <p className="text-xs md:text-sm opacity-80 mt-1">
                Home Healthcare Division | قسم الرعاية الصحية المنزلية
              </p>
            </div>
            
            <div className="border-t border-white/20 pt-3">
              <h2 className="text-lg md:text-xl font-bold">{title}</h2>
              <p className="text-sm md:text-base opacity-90">{titleAr}</p>
              {subtitle && (
                <p className="text-xs md:text-sm opacity-80 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Date and Document Info */}
        <div className="text-right bg-white/10 rounded-lg p-3 md:p-4 flex-shrink-0">
          <p className="text-xs opacity-80 mb-1">Assessment Date | تاريخ التقييم</p>
          <p className="font-bold text-sm md:text-base">{new Date().toLocaleDateString()}</p>
          <p className="text-xs opacity-80">
            {new Date().toLocaleDateString('ar-SA')}
          </p>
          <div className="mt-2 text-xs opacity-70">
            <p>Doc ID: ASS-{Date.now().toString().slice(-6)}</p>
          </div>
        </div>
      </div>

      {/* Patient Information */}
      {patient && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div className="bg-white/10 rounded-lg p-3">
              <span className="opacity-80 block mb-1">Patient Name | اسم المريض</span>
              <p className="font-bold truncate">{patient.nameAr}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <span className="opacity-80 block mb-1">National ID | رقم الهوية</span>
              <p className="font-bold">{patient.nationalId}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <span className="opacity-80 block mb-1">Phone | الهاتف</span>
              <p className="font-bold truncate">{patient.phone || 'N/A'}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <span className="opacity-80 block mb-1">Area | المنطقة</span>
              <p className="font-bold truncate">{patient.areaId || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Staff Selection Section */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <h3 className="text-sm font-semibold mb-3 opacity-90">Assessment Team Selection | اختيار فريق التقييم</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          {/* Doctor Selection */}
          <div className="relative">
            <label className="block text-xs opacity-80 mb-1">Attending Doctor | الطبيب المعالج</label>
            <div className="relative">
              <button
                onClick={() => setShowDoctorSelector(!showDoctorSelector)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-white/20 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <User size={14} />
                  <span>{selectedDoctor?.الاسم || 'اختر الطبيب'}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform ${showDoctorSelector ? 'rotate-180' : ''}`} />
              </button>
              
              {showDoctorSelector && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-40 overflow-y-auto">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor.رقم_الهوية}
                      onClick={() => {
                        onDoctorSelect?.(doctor);
                        setShowDoctorSelector(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-blue-50 flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                    >
                      <User size={14} className="text-blue-600" />
                      <div>
                        <div className="font-medium">{doctor.الاسم}</div>
                        <div className="text-xs text-gray-500">{doctor.المهنة}</div>
                      </div>
                    </button>
                  ))}
                  {doctors.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500 text-center">
                      لا يوجد أطباء متاحين
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Nurse Selection */}
          <div className="relative">
            <label className="block text-xs opacity-80 mb-1">Attending Nurse | الممرض المرافق</label>
            <div className="relative">
              <button
                onClick={() => setShowNurseSelector(!showNurseSelector)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-white/20 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <User size={14} />
                  <span>{selectedNurse?.الاسم || 'اختر الممرض'}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform ${showNurseSelector ? 'rotate-180' : ''}`} />
              </button>
              
              {showNurseSelector && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-40 overflow-y-auto">
                  {nurses.map((nurse) => (
                    <button
                      key={nurse.رقم_الهوية}
                      onClick={() => {
                        onNurseSelect?.(nurse);
                        setShowNurseSelector(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-green-50 flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                    >
                      <User size={14} className="text-green-600" />
                      <div>
                        <div className="font-medium">{nurse.الاسم}</div>
                        <div className="text-xs text-gray-500">{nurse.المهنة}</div>
                      </div>
                    </button>
                  ))}
                  {nurses.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500 text-center">
                      لا يوجد ممرضين متاحين
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Selected Staff Display */}
        {(selectedDoctor || selectedNurse) && (
          <div className="mt-3 p-3 bg-white/10 rounded-lg">
            <p className="text-xs opacity-80 mb-2">Assessment Team | فريق التقييم:</p>
            <div className="flex flex-wrap gap-2">
              {selectedDoctor && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-100 text-xs rounded-full">
                  <User size={12} />
                  د. {selectedDoctor.الاسم}
                </span>
              )}
              {selectedNurse && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-100 text-xs rounded-full">
                  <User size={12} />
                  {selectedNurse.الاسم}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedAssessmentHeader;