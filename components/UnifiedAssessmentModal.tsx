import React, { useState, useEffect, useCallback } from 'react';
import { X, Save, FileText, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Patient, Role, Assessment, DoctorFollowUpData, NurseFollowUpData, PtFollowUpData, SwFollowUpData } from '../types';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import { useDraftStorage } from '../utils/draftStorage';
import UnifiedFormHeader from './UnifiedFormHeader';
import DoctorAssessmentForm from './forms/doctor/DoctorAssessmentForm';
import NurseAssessmentForm from './forms/nurse/NurseAssessmentForm';
import PtAssessmentForm from './forms/pt/PtAssessmentForm';
import SwAssessmentForm from './forms/sw/SwAssessmentForm';
import SmartSocialWorkModal from './SmartSocialWorkModal';
import DoctorFollowUpForm from './forms/doctor/DoctorFollowUpForm';
import NurseFollowUpForm from './forms/nurse/NurseFollowUpForm';
import PtFollowUpForm from './forms/pt/PtFollowUpForm';
import SwFollowUpForm from './forms/sw/SwFollowUpForm';

interface UnifiedAssessmentModalProps {
  patient: Patient;
  role: Role;
  assessmentType: 'initial' | 'followup';
  visitDate?: string; // For visit notes
  onClose: () => void;
  onSave: (data: Assessment | any) => void;
}

const UnifiedAssessmentModal: React.FC<UnifiedAssessmentModalProps> = ({
  patient,
  role,
  assessmentType,
  visitDate,
  onClose,
  onSave
}) => {
  const { state } = useHomeHealthcare();
  const draftStorage = useDraftStorage();
  
  const [currentFormData, setCurrentFormData] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load draft on mount
  useEffect(() => {
    const loadDraft = () => {
      if (visitDate) {
        // Load visit note draft
        const draft = draftStorage.getDraftVisitNote(patient.nationalId, visitDate, role);
        if (draft) {
          setCurrentFormData(draft.formData);
          setLastSaved(new Date(draft.lastSaved));
          console.log('📄 Loaded draft visit note:', draft);
        }
      } else {
        // Load assessment draft
        const draft = draftStorage.getDraftAssessment(patient.nationalId, role);
        if (draft) {
          setCurrentFormData(draft.formData);
          setLastSaved(new Date(draft.lastSaved));
          console.log('📄 Loaded draft assessment:', draft);
        }
      }
    };

    loadDraft();
  }, [patient.nationalId, role, visitDate, draftStorage]);

  // Auto-save functionality
  const autoSave = useCallback(async (formData: any) => {
    if (!draftStorage.getAutoSaveEnabled() || !isDirty) return;

    try {
      setAutoSaveStatus('saving');
      
      if (visitDate) {
        draftStorage.saveDraftVisitNote(patient.nationalId, visitDate, role, formData, false);
      } else {
        draftStorage.saveDraftAssessment(patient.nationalId, role, formData, false);
      }
      
      setLastSaved(new Date());
      setAutoSaveStatus('saved');
      
      // Clear status after 2 seconds
      setTimeout(() => setAutoSaveStatus(null), 2000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('error');
    }
  }, [patient.nationalId, role, visitDate, isDirty, draftStorage]);

  // Auto-save timer
  useEffect(() => {
    if (!isDirty || !currentFormData) return;

    const timer = setTimeout(() => {
      autoSave(currentFormData);
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(timer);
  }, [currentFormData, isDirty, autoSave]);

  const handleFormChange = useCallback((formData: any) => {
    setCurrentFormData(formData);
    setIsDirty(true);
  }, []);

  const handleSave = async (finalData: any) => {
    try {
      setIsSaving(true);
      
      // Create the final assessment/note
      if (visitDate) {
        // Save as visit note
        onSave(finalData);
        // Clear the draft after successful save
        draftStorage.deleteDraftVisitNote(patient.nationalId, visitDate, role);
      } else {
        // Create assessment object
        const assessment: Assessment = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          role,
          assessorName: 'Current User', // Should come from context
          assessorId: 'user-id', // Should come from context
          ...finalData
        };
        
        onSave(assessment);
        // Clear the draft after successful save
        draftStorage.deleteDraftAssessment(patient.nationalId, role);
      }
      
      onClose();
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmDiscard = window.confirm(
        'You have unsaved changes. They will be saved as a draft. Do you want to continue?'
      );
      if (!confirmDiscard) return;
      
      // Save as draft before closing
      if (currentFormData) {
        if (visitDate) {
          draftStorage.saveDraftVisitNote(patient.nationalId, visitDate, role, currentFormData, false);
        } else {
          draftStorage.saveDraftAssessment(patient.nationalId, role, currentFormData, false);
        }
      }
    }
    onClose();
  };

  const renderAssessmentForm = () => {
    const commonProps = {
      initialData: currentFormData,
      onSave: handleSave,
      onCancel: handleCancel,
      onChange: handleFormChange,
      patient
    };

    if (assessmentType === 'initial') {
      switch (role) {
        case Role.Doctor:
          return <DoctorAssessmentForm {...commonProps} />;
        case Role.Nurse:
          return <NurseAssessmentForm {...commonProps} />;
        case Role.PhysicalTherapist:
          return <PtAssessmentForm {...commonProps} />;
        case Role.SocialWorker:
          return <SwAssessmentForm {...commonProps} />;
        default:
          return null;
      }
    } else {
      switch (role) {
        case Role.Doctor:
          return <DoctorFollowUpForm {...commonProps} />;
        case Role.Nurse:
          return <NurseFollowUpForm {...commonProps} />;
        case Role.PhysicalTherapist:
          return <PtFollowUpForm {...commonProps} />;
        case Role.SocialWorker:
          return <SwFollowUpForm {...commonProps} />;
        default:
          return null;
      }
    }
  };

  const getTitle = () => {
    const type = assessmentType === 'initial' ? 'Initial Assessment' : 'Follow-up Assessment';
    return visitDate ? `Visit Note - ${type}` : type;
  };

  const getTitleAr = () => {
    const type = assessmentType === 'initial' ? 'التقييم الأولي' : 'تقييم المتابعة';
    return visitDate ? `ملاحظة الزيارة - ${type}` : type;
  };

  const getSubtitle = () => {
    let base = `${role} - ${assessmentType === 'initial' ? 'التقييم الأولي' : 'تقييم المتابعة'}`;
    if (visitDate) {
      base += ` - زيارة ${new Date(visitDate).toLocaleDateString('ar-SA')}`;
    }
    return base;
  };

  const AutoSaveIndicator = () => {
    if (!draftStorage.getAutoSaveEnabled()) return null;

    return (
      <div className="flex items-center gap-2 text-xs">
        {autoSaveStatus === 'saving' && (
          <div className="flex items-center gap-1 text-blue-600">
            <Clock size={12} className="animate-spin" />
            <span>Saving...</span>
          </div>
        )}
        {autoSaveStatus === 'saved' && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle2 size={12} />
            <span>Auto-saved</span>
          </div>
        )}
        {autoSaveStatus === 'error' && (
          <div className="flex items-center gap-1 text-red-600">
            <AlertCircle size={12} />
            <span>Save failed</span>
          </div>
        )}
        {lastSaved && !autoSaveStatus && (
          <div className="text-gray-500">
            Last saved: {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border-2 border-blue-500 ring-4 ring-blue-200/50 mx-auto my-auto">
        {/* Header */}
        <UnifiedFormHeader 
          title={getTitle()}
          titleAr={getTitleAr()}
          patient={patient}
          role={role}
          subtitle={getSubtitle()}
        />

        {/* Status Bar */}
        <div className="px-4 md:px-6 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AutoSaveIndicator />
              {isDirty && (
                <div className="flex items-center gap-1 text-orange-600 text-xs">
                  <AlertCircle size={12} />
                  <span>Unsaved changes</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="text-xs px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
              >
                Cancel
              </button>
              
              <button
                onClick={() => handleSave(currentFormData)}
                disabled={isSaving || !currentFormData}
                className="text-xs px-4 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
              >
                {isSaving ? (
                  <>
                    <Clock size={12} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={12} />
                    Save & Complete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-auto">
          {renderAssessmentForm()}
        </div>
      </div>
    </div>
  );
};

export default UnifiedAssessmentModal;