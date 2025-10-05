import React, { useState } from 'react';
import { Patient, Staff, SwAssessmentData, Role } from '../types';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import EnhancedSwAssessmentForm from './forms/sw/EnhancedSwAssessmentForm';
import SmartSocialWorkReport from './forms/sw/SmartSocialWorkReport';

interface SmartSocialWorkModalProps {
  patient: Patient;
  onClose: () => void;
}

type ModalStep = 'assessment' | 'report';

const SmartSocialWorkModal: React.FC<SmartSocialWorkModalProps> = ({
  patient,
  onClose
}) => {
  const { state, dispatch } = useHomeHealthcare();
  const [currentStep, setCurrentStep] = useState<ModalStep>('assessment');
  const [assessmentData, setAssessmentData] = useState<any>(null);

  // Get current user or default
  const currentUser = state.staff.find(s => s.المهنة === 'أخصائي اجتماعي') || {
    الاسم: 'أخصائي اجتماعي',
    المهنة: 'أخصائي اجتماعي',
    الايميل: '',
    الجوال: '',
    رقم_الهوية: ''
  };

  const handleAssessmentSave = (assessment: SwAssessmentData) => {
    // Save to context
    dispatch({
      type: 'SAVE_ASSESSMENT',
      payload: {
        patientId: patient.nationalId,
        assessment
      }
    });

    // Prepare data for report generation
    setAssessmentData({
      patient,
      assessor: currentUser,
      formData: assessment // This would contain the detailed form data
    });

    // Move to report step
    setCurrentStep('report');
  };

  const handleReportClose = () => {
    setCurrentStep('assessment');
    onClose();
  };

  return (
    <>
      {currentStep === 'assessment' && (
        <EnhancedSwAssessmentForm
          patient={patient}
          onSave={handleAssessmentSave}
          onCancel={onClose}
        />
      )}
      
      {currentStep === 'report' && assessmentData && (
        <SmartSocialWorkReport
          data={assessmentData}
          onClose={handleReportClose}
        />
      )}
    </>
  );
};

export default SmartSocialWorkModal;