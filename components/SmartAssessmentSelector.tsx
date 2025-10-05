import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, FileText, Calendar, User, Activity, Stethoscope, HandHeart, HeartPulse, Accessibility, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Patient, Role, Assessment } from '../types';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import UnifiedFormHeader from './UnifiedFormHeader';
import UnifiedAssessmentModal from './UnifiedAssessmentModal';
import SmartSocialWorkModal from './SmartSocialWorkModal';

interface SmartAssessmentSelectorProps {
  patient: Patient;
  onClose: () => void;
}

const SmartAssessmentSelector: React.FC<SmartAssessmentSelectorProps> = ({
  patient,
  onClose
}) => {
  const { state } = useHomeHealthcare();
  // Consolidated state for better performance
  const [selectionState, setSelectionState] = useState({
    selectedRole: null as Role | null,
    assessmentType: null as 'initial' | 'followup' | null,
    showAssessmentModal: false
  });

  const currentUserRole = state.currentRole;
  
  // Available clinical roles
  const clinicalRoles = [
    {
      role: Role.Doctor,
      title: 'Doctor Assessment',
      titleAr: 'تقييم طبي أولي/متابعة',
      icon: Stethoscope,
      color: 'blue',
      description: 'تقييم طبي شامل - تشخيص وخطة علاج'
    },
    {
      role: Role.Nurse,
      title: 'Nursing Assessment', 
      titleAr: 'تقييم تمريضي أولي/متابعة',
      icon: HandHeart,
      color: 'green',
      description: 'فحص العلامات الحيوية والجروح والأدوية'
    },
    {
      role: Role.PhysicalTherapist,
      title: 'Physical Therapy',
      titleAr: 'تقييم علاج طبيعي',
      icon: HeartPulse,
      color: 'purple',
      description: 'تقييم الحركة والقوة وإعادة التأهيل'
    },
    {
      role: Role.SocialWorker,
      title: 'Social Work Assessment',
      titleAr: 'تقييم اجتماعي ذكي',
      icon: Accessibility,
      color: 'orange',
      description: 'تقييم اجتماعي شامل مع تقرير ذكي'
    }
  ];

  // Memoized assessment history for performance
  const assessmentHistoryByRole = useMemo(() => {
    if (!patient.assessments) return {};
    return patient.assessments.reduce((acc, assessment) => {
      if (!acc[assessment.role]) acc[assessment.role] = [];
      acc[assessment.role].push(assessment);
      return acc;
    }, {} as Record<Role, typeof patient.assessments>);
  }, [patient.assessments]);

  const getAssessmentHistory = useCallback((role: Role) => {
    return assessmentHistoryByRole[role] || [];
  }, [assessmentHistoryByRole]);

  const getLatestAssessment = useCallback((role: Role) => {
    const assessments = getAssessmentHistory(role);
    return assessments.length > 0 ? assessments[0] : null;
  }, [getAssessmentHistory]);

  const handleRoleSelection = useCallback((role: Role) => {
    const history = getAssessmentHistory(role);
    setSelectionState(prev => ({
      ...prev,
      selectedRole: role,
      assessmentType: history.length === 0 ? 'initial' : null
    }));
  }, [getAssessmentHistory]);

  const handleTypeSelection = useCallback((type: 'initial' | 'followup') => {
    setSelectionState(prev => ({
      ...prev,
      assessmentType: type,
      showAssessmentModal: true
    }));
  }, []);

  const handleAssessmentSave = useCallback((assessmentData: Assessment) => {
    // This will be handled by the UnifiedAssessmentModal
    setSelectionState({
      selectedRole: null,
      assessmentType: null,
      showAssessmentModal: false
    });
    onClose();
  }, [onClose]);

  const renderRoleCard = (roleInfo: typeof clinicalRoles[0]) => {
    const history = getAssessmentHistory(roleInfo.role);
    const latestAssessment = getLatestAssessment(roleInfo.role);
    const canAssess = currentUserRole === roleInfo.role || currentUserRole === Role.Coordinator;
    const Icon = roleInfo.icon;
    
    const daysSinceLastAssessment = latestAssessment 
      ? Math.floor((Date.now() - new Date(latestAssessment.date).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return (
      <button
        key={roleInfo.role}
        onClick={() => canAssess && handleRoleSelection(roleInfo.role)}
        disabled={!canAssess}
        className={`w-full text-left p-4 rounded-lg border-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
          selectionState.selectedRole === roleInfo.role
            ? `border-${roleInfo.color}-500 bg-${roleInfo.color}-50 shadow-lg`
            : canAssess
            ? `border-gray-200 hover:border-${roleInfo.color}-300 bg-white hover:shadow-md`
            : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
            selectionState.selectedRole === roleInfo.role 
              ? `bg-${roleInfo.color}-500 text-white` 
              : `bg-${roleInfo.color}-100 text-${roleInfo.color}-600`
          }`}>
            <Icon size={20} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-gray-900">{roleInfo.title}</h3>
                <p className="text-sm text-gray-600">{roleInfo.titleAr}</p>
              </div>
              
              {/* Status indicator */}
              <div className="flex items-center gap-2">
                {history.length > 0 ? (
                  <span className={`px-2 py-1 bg-${roleInfo.color}-100 text-${roleInfo.color}-700 text-xs rounded-full flex items-center gap-1`}>
                    <CheckCircle2 size={12} />
                    {history.length} assessment{history.length > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1">
                    <Clock size={12} />
                    No assessments
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mb-3">{roleInfo.description}</p>
            
            {/* Assessment history summary */}
            {latestAssessment && (
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last assessment:</span>
                  <span className="font-medium">
                    {new Date(latestAssessment.date).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                
                {daysSinceLastAssessment !== null && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Days ago:</span>
                    <span className={`font-medium ${
                      daysSinceLastAssessment > 30 ? 'text-red-600' :
                      daysSinceLastAssessment > 14 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {daysSinceLastAssessment} days
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{latestAssessment.status}</span>
                </div>
              </div>
            )}
            
            {!canAssess && (
              <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                Only {roleInfo.role} can perform this assessment
              </div>
            )}
          </div>
        </div>
      </button>
    );
  };

  const renderTypeSelection = () => {
    if (!selectionState.selectedRole || selectionState.assessmentType !== null) return null;

    const history = getAssessmentHistory(selectionState.selectedRole);
    const roleInfo = clinicalRoles.find(r => r.role === selectionState.selectedRole)!;

    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Calendar size={16} />
          Select Assessment Type | اختر نوع التقييم
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Initial Assessment */}
          <button
            onClick={() => handleTypeSelection('initial')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              history.length === 0
                ? `border-${roleInfo.color}-500 bg-${roleInfo.color}-50`
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                history.length === 0 
                  ? `bg-${roleInfo.color}-500 text-white` 
                  : `bg-gray-100 text-gray-600`
              }`}>
                <Plus size={16} />
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900">Initial Assessment</h4>
                <p className="text-sm text-gray-600 mb-2">التقييم الأولي</p>
                <p className="text-xs text-gray-500">
                  {history.length === 0 
                    ? 'Recommended: No previous assessments found'
                    : 'Create new initial baseline assessment'
                  }
                </p>
              </div>
            </div>
          </button>

          {/* Follow-up Assessment */}
          <button
            onClick={() => handleTypeSelection('followup')}
            disabled={history.length === 0}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              history.length > 0
                ? `border-${roleInfo.color}-500 bg-${roleInfo.color}-50 hover:bg-${roleInfo.color}-100`
                : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                history.length > 0 
                  ? `bg-${roleInfo.color}-500 text-white` 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                <Activity size={16} />
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900">Follow-up Assessment</h4>
                <p className="text-sm text-gray-600 mb-2">تقييم المتابعة</p>
                <p className="text-xs text-gray-500">
                  {history.length > 0 
                    ? `Based on ${history.length} previous assessment${history.length > 1 ? 's' : ''}`
                    : 'Requires initial assessment first'
                  }
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col mx-auto my-auto">
          {/* Header */}
          <UnifiedFormHeader 
            title="Smart Assessment Selector"
            titleAr="محدد التقييم الذكي"
            patient={patient}
            subtitle="Choose the appropriate assessment type for optimal care documentation"
            showIcons={true}
          />

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Patient Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-200">
              <h3 className="font-bold text-blue-800 mb-3">Patient Assessment Overview</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {clinicalRoles.map(roleInfo => {
                  const count = getAssessmentHistory(roleInfo.role).length;
                  const latest = getLatestAssessment(roleInfo.role);
                  
                  return (
                    <div key={roleInfo.role} className="bg-white rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center gap-2 mb-1">
                        <roleInfo.icon size={14} className={`text-${roleInfo.color}-600`} />
                        <span className="font-medium text-gray-900">{roleInfo.role}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <div>{count} assessment{count !== 1 ? 's' : ''}</div>
                        {latest && (
                          <div className="text-blue-600">
                            Last: {new Date(latest.date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-lg mb-4">
                Select Healthcare Role | اختر التخصص الطبي
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clinicalRoles.map(renderRoleCard)}
              </div>
            </div>

            {/* Type Selection */}
            {renderTypeSelection()}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Current Role: <span className="font-medium">{currentUserRole}</span>
              </div>
              
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel | إلغاء
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Modal */}
      {selectionState.showAssessmentModal && selectionState.selectedRole && selectionState.assessmentType && (
        <>
          {selectionState.selectedRole === Role.SocialWorker ? (
            <SmartSocialWorkModal
              patient={patient}
              onClose={() => {
                setSelectionState(prev => ({
                  ...prev,
                  showAssessmentModal: false,
                  selectedRole: null,
                  assessmentType: null
                }));
                onClose();
              }}
            />
          ) : (
            <UnifiedAssessmentModal
              patient={patient}
              role={selectionState.selectedRole}
              assessmentType={selectionState.assessmentType}
              onClose={() => {
                setSelectionState(prev => ({
                  ...prev,
                  showAssessmentModal: false,
                  selectedRole: null,
                  assessmentType: null
                }));
              }}
              onSave={handleAssessmentSave}
            />
          )}
        </>
      )}
    </>
  );
};

export default SmartAssessmentSelector;