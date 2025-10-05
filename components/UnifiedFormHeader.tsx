import React from 'react';
import { Patient, Role } from '../types';

interface UnifiedFormHeaderProps {
  title: string;
  titleAr: string;
  patient?: Patient;
  role?: Role;
  subtitle?: string;
  showIcons?: boolean;
}

const UnifiedFormHeader: React.FC<UnifiedFormHeaderProps> = ({ 
  title, 
  titleAr, 
  patient, 
  role, 
  subtitle,
  showIcons = true 
}) => {
  const getRoleColor = (role?: Role) => {
    switch (role) {
      case Role.Doctor: return 'from-blue-600 to-blue-700';
      case Role.Nurse: return 'from-green-600 to-green-700';
      case Role.PhysicalTherapist: return 'from-purple-600 to-purple-700';
      case Role.SocialWorker: return 'from-orange-600 to-orange-700';
      default: return 'from-blue-600 to-blue-700';
    }
  };

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
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <h1 className="text-lg md:text-2xl font-bold leading-tight">{title}</h1>
              <p className="text-sm md:text-lg text-blue-100 opacity-90">{titleAr}</p>
            </div>
            
            {subtitle && (
              <p className="text-xs md:text-sm text-blue-200">{subtitle}</p>
            )}
            
            <div className="text-xs md:text-sm text-blue-200 mt-1">
              <p>King Abdullah Hospital - Bisha | مستشفى الملك عبدالله - بيشه</p>
              <p className="opacity-75">Home Healthcare Division | قسم الرعاية الصحية المنزلية</p>
            </div>
          </div>
        </div>

        {/* Right Side - Patient Info & Metadata */}
        <div className="flex-shrink-0">
          {patient && (
            <div className="bg-white/10 rounded-lg p-3 md:p-4 text-right">
              <p className="text-xs md:text-sm text-blue-100 mb-1">Patient | المريض</p>
              <p className="font-bold text-sm md:text-lg mb-1">{patient.nameAr}</p>
              <p className="text-xs text-blue-200">ID: {patient.nationalId}</p>
              {patient.areaId && (
                <p className="text-xs text-blue-200">Area: {patient.areaId}</p>
              )}
            </div>
          )}
          
          {/* Date & Role Info */}
          <div className="bg-white/10 rounded-lg p-3 mt-2 text-right text-xs md:text-sm">
            <p className="text-blue-100 mb-1">Date | التاريخ</p>
            <p className="font-bold">{new Date().toLocaleDateString()}</p>
            <p className="text-blue-200">{new Date().toLocaleDateString('ar-SA')}</p>
            {role && (
              <div className="mt-2 pt-2 border-t border-white/20">
                <p className="text-blue-100">Role | الدور</p>
                <p className="font-semibold">{role}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Border */}
      <div className="mt-4 pt-3 border-t border-white/20">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 text-xs text-blue-200">
          <p>Aseer Health Cluster | تجمع عسير الصحي</p>
          <p>Document ID: DOC-{Date.now().toString().slice(-6)}</p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedFormHeader;