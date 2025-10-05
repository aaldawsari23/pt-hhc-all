import React, { useState, useEffect } from 'react';
import { Save, Clock, CheckCircle2, AlertCircle, User, Calendar, MapPin, Phone, Heart, Activity, Shield, Droplets, Thermometer, Zap, Eye, Ear, Brain, Pill } from 'lucide-react';
import { Patient, Role, DoctorAssessmentData, NurseAssessmentData, PtAssessmentData, SwAssessmentData, VitalSigns } from '../types';
import { useDraftStorage } from '../utils/draftStorage';
import UnifiedFormHeader from './UnifiedFormHeader';

interface ComprehensiveHomeCareFormProps {
  patient: Patient;
  role: Role;
  assessmentType: 'initial' | 'followup';
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

interface FormSection {
  id: string;
  title: string;
  titleAr: string;
  icon: React.ElementType;
  color: string;
  required?: boolean;
  fields: FormField[];
}

interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'number' | 'chips' | 'vitals' | 'pain-scale' | 'range';
  label: string;
  labelAr: string;
  placeholder?: string;
  options?: string[];
  optionsAr?: string[];
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
  dependsOn?: string;
  dependsValue?: any;
  validation?: (value: any) => string | null;
  help?: string;
}

const ComprehensiveHomeCareForm: React.FC<ComprehensiveHomeCareFormProps> = ({
  patient,
  role,
  assessmentType,
  initialData,
  onSave,
  onCancel
}) => {
  const draftStorage = useDraftStorage();
  const [formData, setFormData] = useState<any>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get comprehensive form sections based on role
  const getFormSections = (): FormSection[] => {
    const commonPatientInfo: FormSection = {
      id: 'patient-info',
      title: 'Patient Information',
      titleAr: 'معلومات المريض',
      icon: User,
      color: 'blue',
      required: true,
      fields: [
        {
          id: 'assessment-date',
          type: 'text',
          label: 'Assessment Date',
          labelAr: 'تاريخ التقييم',
          defaultValue: new Date().toLocaleDateString(),
          required: true
        },
        {
          id: 'primary-complaint',
          type: 'textarea',
          label: 'Primary Complaint/Concern',
          labelAr: 'الشكوى الرئيسية/المشكلة',
          placeholder: 'Describe the main reason for this assessment...',
          required: assessmentType === 'initial'
        },
        {
          id: 'current-medications',
          type: 'textarea',
          label: 'Current Medications',
          labelAr: 'الأدوية الحالية',
          placeholder: 'List all current medications, dosages, and frequency...'
        },
        {
          id: 'allergies',
          type: 'textarea',
          label: 'Known Allergies',
          labelAr: 'الحساسيات المعروفة',
          placeholder: 'List any known allergies or drug reactions...'
        }
      ]
    };

    switch (role) {
      case Role.Doctor:
        return [
          commonPatientInfo,
          {
            id: 'clinical-assessment',
            title: 'Clinical Assessment',
            titleAr: 'التقييم السريري',
            icon: Heart,
            color: 'red',
            required: true,
            fields: [
              {
                id: 'chief-focus',
                type: 'multiselect',
                label: 'Primary Focus Areas',
                labelAr: 'مجالات التركيز الرئيسية',
                options: ['Wound care', 'Infection suspicion', 'Pain mgmt', 'DM', 'HTN', 'CHF/COPD', 'CKD', 'Post-op', 'Catheter', 'Tube feeding'],
                optionsAr: ['رعاية الجروح', 'اشتباه عدوى', 'إدارة الألم', 'السكري', 'الضغط', 'القلب/الرئة', 'الكلى', 'بعد العملية', 'القسطرة', 'التغذية الأنبوبية'],
                required: true
              },
              {
                id: 'red-flags',
                type: 'multiselect',
                label: 'Red Flag Symptoms',
                labelAr: 'أعراض الإنذار المبكر',
                options: ['Fever ≥38°C', 'SpO₂ <90%', 'Chest pain', 'Active bleeding', 'New neuro deficit', 'Sepsis concern'],
                optionsAr: ['حمى ≥38°م', 'أكسجين <90%', 'ألم صدر', 'نزيف نشط', 'عجز عصبي جديد', 'قلق إنتان']
              },
              {
                id: 'pain-assessment',
                type: 'pain-scale',
                label: 'Pain Level (0-10)',
                labelAr: 'مستوى الألم (0-10)',
                min: 0,
                max: 10,
                required: true
              },
              {
                id: 'clinical-impression',
                type: 'textarea',
                label: 'Clinical Impression',
                labelAr: 'الانطباع السريري',
                placeholder: 'Describe your clinical assessment and findings...',
                required: true
              },
              {
                id: 'treatment-plan',
                type: 'textarea',
                label: 'Treatment Plan',
                labelAr: 'خطة العلاج',
                placeholder: 'Outline the treatment approach and interventions...',
                required: true
              }
            ]
          },
          {
            id: 'orders-referrals',
            title: 'Orders & Referrals',
            titleAr: 'الطلبات والإحالات',
            icon: Pill,
            color: 'purple',
            fields: [
              {
                id: 'lab-orders',
                type: 'multiselect',
                label: 'Laboratory Orders',
                labelAr: 'طلبات المختبر',
                options: ['CBC', 'CRP', 'BMP', 'HbA1c', 'INR', 'Wound swab', 'Blood culture', 'Urine analysis']
              },
              {
                id: 'imaging-orders',
                type: 'multiselect',
                label: 'Imaging Orders',
                labelAr: 'طلبات الأشعة',
                options: ['CXR', 'X-ray', 'Ultrasound', 'CT scan', 'MRI']
              },
              {
                id: 'medication-changes',
                type: 'multiselect',
                label: 'Medication Changes',
                labelAr: 'تغييرات الأدوية',
                options: ['None', 'Increase dose', 'Decrease dose', 'New medication', 'Stop medication', 'Change medication']
              },
              {
                id: 'follow-up-timing',
                type: 'select',
                label: 'Next Follow-up',
                labelAr: 'المتابعة القادمة',
                options: ['24-48h', '3-7d', '2-4w', '1-3m', 'PRN'],
                required: true
              }
            ]
          }
        ];

      case Role.Nurse:
        return [
          commonPatientInfo,
          {
            id: 'vital-signs',
            title: 'Vital Signs',
            titleAr: 'العلامات الحيوية',
            icon: Activity,
            color: 'green',
            required: true,
            fields: [
              {
                id: 'vitals',
                type: 'vitals',
                label: 'Vital Signs Assessment',
                labelAr: 'تقييم العلامات الحيوية',
                required: true
              },
              {
                id: 'pain-level',
                type: 'pain-scale',
                label: 'Pain Level (0-10)',
                labelAr: 'مستوى الألم (0-10)',
                min: 0,
                max: 10,
                required: true
              },
              {
                id: 'consciousness-level',
                type: 'select',
                label: 'Level of Consciousness',
                labelAr: 'مستوى الوعي',
                options: ['Alert', 'Drowsy', 'Confused', 'Unresponsive'],
                optionsAr: ['يقظ', 'نعسان', 'مشوش', 'غير مستجيب'],
                required: true
              }
            ]
          },
          {
            id: 'physical-assessment',
            title: 'Physical Assessment',
            titleAr: 'التقييم الجسدي',
            icon: Shield,
            color: 'blue',
            fields: [
              {
                id: 'skin-assessment',
                type: 'multiselect',
                label: 'Skin Condition',
                labelAr: 'حالة الجلد',
                options: ['Intact', 'Dry', 'Moist', 'Warm', 'Cool', 'Pale', 'Flushed', 'Bruised', 'Rash', 'Wound present']
              },
              {
                id: 'wound-details',
                type: 'textarea',
                label: 'Wound Description (if present)',
                labelAr: 'وصف الجرح (إن وجد)',
                placeholder: 'Describe location, size, appearance, drainage...',
                dependsOn: 'skin-assessment',
                dependsValue: 'Wound present'
              },
              {
                id: 'braden-score',
                type: 'number',
                label: 'Braden Score',
                labelAr: 'نقاط برادن',
                min: 6,
                max: 23,
                help: 'Pressure ulcer risk assessment (6-23, lower = higher risk)'
              },
              {
                id: 'fall-risk',
                type: 'select',
                label: 'Fall Risk Assessment',
                labelAr: 'تقييم خطر السقوط',
                options: ['Low', 'Moderate', 'High'],
                optionsAr: ['منخفض', 'متوسط', 'عالي'],
                required: true
              }
            ]
          },
          {
            id: 'devices-care',
            title: 'Medical Devices & Care',
            titleAr: 'الأجهزة الطبية والرعاية',
            icon: Zap,
            color: 'orange',
            fields: [
              {
                id: 'devices-present',
                type: 'multiselect',
                label: 'Medical Devices Present',
                labelAr: 'الأجهزة الطبية الموجودة',
                options: ['Urinary catheter', 'PEG/NG tube', 'IV/Port', 'Tracheostomy', 'Oxygen therapy', 'CPAP/BiPAP']
              },
              {
                id: 'device-care-provided',
                type: 'multiselect',
                label: 'Device Care Provided',
                labelAr: 'الرعاية المقدمة للأجهزة',
                options: ['Catheter care', 'Tube feeding', 'IV medication', 'Dressing change', 'Site assessment', 'Flushing']
              },
              {
                id: 'nursing-interventions',
                type: 'multiselect',
                label: 'Nursing Interventions',
                labelAr: 'التدخلات التمريضية',
                options: ['Medication administration', 'Wound care', 'Vital signs monitoring', 'Patient education', 'Family education', 'Specimen collection']
              }
            ]
          }
        ];

      case Role.PhysicalTherapist:
        return [
          commonPatientInfo,
          {
            id: 'functional-assessment',
            title: 'Functional Assessment',
            titleAr: 'التقييم الوظيفي',
            icon: Activity,
            color: 'purple',
            required: true,
            fields: [
              {
                id: 'mobility-level',
                type: 'select',
                label: 'Current Mobility Level',
                labelAr: 'مستوى الحركة الحالي',
                options: ['Independent', 'Supervision needed', 'Minimal assist', 'Moderate assist', 'Maximum assist', 'Dependent'],
                optionsAr: ['مستقل', 'يحتاج إشراف', 'مساعدة قليلة', 'مساعدة متوسطة', 'مساعدة كبيرة', 'معتمد كلياً'],
                required: true
              },
              {
                id: 'assistive-devices',
                type: 'multiselect',
                label: 'Assistive Devices Used',
                labelAr: 'الأجهزة المساعدة المستخدمة',
                options: ['None', 'Cane', 'Walker', 'Crutches', 'Wheelchair', 'Rollator']
              },
              {
                id: 'pain-with-movement',
                type: 'pain-scale',
                label: 'Pain with Movement (0-10)',
                labelAr: 'الألم مع الحركة (0-10)',
                min: 0,
                max: 10,
                required: true
              },
              {
                id: 'range-of-motion',
                type: 'select',
                label: 'Range of Motion',
                labelAr: 'مدى الحركة',
                options: ['Within normal limits', 'Mildly limited', 'Moderately limited', 'Severely limited'],
                optionsAr: ['ضمن الحدود الطبيعية', 'محدود قليلاً', 'محدود متوسط', 'محدود بشدة'],
                required: true
              }
            ]
          },
          {
            id: 'strength-balance',
            title: 'Strength & Balance',
            titleAr: 'القوة والتوازن',
            icon: Shield,
            color: 'indigo',
            fields: [
              {
                id: 'muscle-strength',
                type: 'select',
                label: 'Overall Muscle Strength',
                labelAr: 'القوة العضلية العامة',
                options: ['Normal (5/5)', 'Good (4/5)', 'Fair (3/5)', 'Poor (2/5)', 'Trace (1/5)', 'Zero (0/5)'],
                required: true
              },
              {
                id: 'balance-assessment',
                type: 'select',
                label: 'Balance Assessment',
                labelAr: 'تقييم التوازن',
                options: ['Good static & dynamic', 'Good static, fair dynamic', 'Fair static & dynamic', 'Poor balance'],
                optionsAr: ['جيد ثابت وحركي', 'جيد ثابت، متوسط حركي', 'متوسط ثابت وحركي', 'توازن ضعيف'],
                required: true
              },
              {
                id: 'endurance',
                type: 'select',
                label: 'Endurance Level',
                labelAr: 'مستوى التحمل',
                options: ['Excellent', 'Good', 'Fair', 'Poor'],
                optionsAr: ['ممتاز', 'جيد', 'متوسط', 'ضعيف'],
                required: true
              }
            ]
          },
          {
            id: 'treatment-goals',
            title: 'Treatment & Goals',
            titleAr: 'العلاج والأهداف',
            icon: CheckCircle2,
            color: 'green',
            fields: [
              {
                id: 'treatment-focus',
                type: 'multiselect',
                label: 'Treatment Focus Areas',
                labelAr: 'مجالات التركيز العلاجي',
                options: ['Range of motion', 'Strength training', 'Balance training', 'Gait training', 'Pain management', 'Functional mobility'],
                required: true
              },
              {
                id: 'short-term-goals',
                type: 'textarea',
                label: 'Short-term Goals (2-4 weeks)',
                labelAr: 'الأهداف قصيرة المدى (2-4 أسابيع)',
                placeholder: 'List specific, measurable goals...',
                required: true
              },
              {
                id: 'long-term-goals',
                type: 'textarea',
                label: 'Long-term Goals (1-3 months)',
                labelAr: 'الأهداف طويلة المدى (1-3 أشهر)',
                placeholder: 'List functional outcome goals...'
              }
            ]
          }
        ];

      case Role.SocialWorker:
        return [
          commonPatientInfo,
          {
            id: 'psychosocial-assessment',
            title: 'Psychosocial Assessment',
            titleAr: 'التقييم النفسي الاجتماعي',
            icon: Brain,
            color: 'orange',
            required: true,
            fields: [
              {
                id: 'living-situation',
                type: 'select',
                label: 'Living Situation',
                labelAr: 'وضع السكن',
                options: ['Lives alone', 'With family', 'With caregiver', 'Assisted living', 'Other'],
                optionsAr: ['يعيش بمفرده', 'مع الأسرة', 'مع مُعيل', 'سكن مساعد', 'أخرى'],
                required: true
              },
              {
                id: 'primary-caregiver',
                type: 'text',
                label: 'Primary Caregiver',
                labelAr: 'مُقدم الرعاية الأساسي',
                placeholder: 'Name and relationship'
              },
              {
                id: 'caregiver-availability',
                type: 'select',
                label: 'Caregiver Availability',
                labelAr: 'توفر مُقدم الرعاية',
                options: ['24/7 available', '12+ hours/day', '8-12 hours/day', '4-8 hours/day', 'Limited availability', 'No caregiver'],
                optionsAr: ['متوفر 24/7', '12+ ساعة/يوم', '8-12 ساعة/يوم', '4-8 ساعة/يوم', 'توفر محدود', 'لا يوجد مُعيل']
              },
              {
                id: 'mood-assessment',
                type: 'select',
                label: 'Mood/Mental State',
                labelAr: 'المزاج/الحالة النفسية',
                options: ['Positive/cooperative', 'Neutral', 'Anxious/worried', 'Depressed/sad', 'Agitated/angry', 'Confused'],
                optionsAr: ['إيجابي/متعاون', 'محايد', 'قلق/متوتر', 'مكتئب/حزين', 'منفعل/غاضب', 'مشوش'],
                required: true
              }
            ]
          },
          {
            id: 'support-resources',
            title: 'Support & Resources',
            titleAr: 'الدعم والموارد',
            icon: Heart,
            color: 'pink',
            fields: [
              {
                id: 'financial-status',
                type: 'select',
                label: 'Financial Status',
                labelAr: 'الوضع المالي',
                options: ['Adequate income', 'Limited income', 'Financial hardship', 'Unknown'],
                optionsAr: ['دخل كافي', 'دخل محدود', 'صعوبة مالية', 'غير معروف']
              },
              {
                id: 'insurance-coverage',
                type: 'select',
                label: 'Insurance Coverage',
                labelAr: 'التغطية التأمينية',
                options: ['Government insurance', 'Private insurance', 'Mixed coverage', 'No insurance'],
                optionsAr: ['تأمين حكومي', 'تأمين خاص', 'تغطية مختلطة', 'لا يوجد تأمين']
              },
              {
                id: 'transportation',
                type: 'select',
                label: 'Transportation Access',
                labelAr: 'إمكانية النقل',
                options: ['Available', 'Limited', 'Not available'],
                optionsAr: ['متوفر', 'محدود', 'غير متوفر']
              },
              {
                id: 'community-resources',
                type: 'multiselect',
                label: 'Community Resources Needed',
                labelAr: 'الموارد المجتمعية المطلوبة',
                options: ['Home health aide', 'Meal delivery', 'Transportation', 'Financial assistance', 'Equipment/supplies', 'Respite care']
              }
            ]
          },
          {
            id: 'safety-concerns',
            title: 'Safety & Concerns',
            titleAr: 'السلامة والمخاوف',
            icon: Shield,
            color: 'red',
            fields: [
              {
                id: 'home-safety',
                type: 'multiselect',
                label: 'Home Safety Concerns',
                labelAr: 'مخاوف السلامة المنزلية',
                options: ['Stairs without rails', 'Poor lighting', 'Bathroom hazards', 'Loose rugs', 'Cluttered pathways', 'No safety concerns']
              },
              {
                id: 'abuse-neglect',
                type: 'select',
                label: 'Signs of Abuse/Neglect',
                labelAr: 'علامات الإساءة/الإهمال',
                options: ['None observed', 'Possible concern', 'Clear signs present'],
                optionsAr: ['لم يُلاحظ', 'قلق محتمل', 'علامات واضحة'],
                required: true
              },
              {
                id: 'emergency-plan',
                type: 'textarea',
                label: 'Emergency Contact Plan',
                labelAr: 'خطة الاتصال الطارئة',
                placeholder: 'List emergency contacts and procedures...'
              }
            ]
          }
        ];

      default:
        return [commonPatientInfo];
    }
  };

  const sections = getFormSections();

  // Load initial data and drafts
  useEffect(() => {
    let loadedData = { ...initialData };
    
    // Load draft if available
    const draft = draftStorage.getDraftAssessment(patient.nationalId, role);
    if (draft && draft.formData) {
      loadedData = { ...loadedData, ...draft.formData };
      setLastSaved(new Date(draft.lastSaved));
    }

    // Load previous assessment data for follow-up
    if (assessmentType === 'followup') {
      const previousAssessments = patient.assessments?.filter(a => a.role === role) || [];
      if (previousAssessments.length > 0) {
        const latest = previousAssessments[0];
        // Pre-fill some fields from previous assessment
        loadedData = { ...latest, ...loadedData };
      }
    }

    setFormData(loadedData);
  }, [initialData, patient.nationalId, role, assessmentType, draftStorage]);

  // Auto-save functionality
  useEffect(() => {
    if (Object.keys(formData).length === 0) return;

    const saveTimer = setTimeout(() => {
      draftStorage.saveDraftAssessment(patient.nationalId, role, formData, false);
      setLastSaved(new Date());
    }, 3000);

    return () => clearTimeout(saveTimer);
  }, [formData, patient.nationalId, role, draftStorage]);

  const updateFormData = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Clear any existing error for this field
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      return field.validation(value);
    }

    return null;
  };

  const validateSection = (sectionIndex: number): boolean => {
    const section = sections[sectionIndex];
    const sectionErrors: Record<string, string> = {};
    let isValid = true;

    section.fields.forEach(field => {
      // Check dependencies
      if (field.dependsOn && formData[field.dependsOn] !== field.dependsValue) {
        return; // Skip validation if dependency not met
      }

      const error = validateField(field, formData[field.id]);
      if (error) {
        sectionErrors[field.id] = error;
        isValid = false;
      }
    });

    setErrors(prev => ({ ...prev, ...sectionErrors }));
    return isValid;
  };

  const handleNextSection = () => {
    if (validateSection(currentSection)) {
      setCompletedSections(prev => new Set([...prev, currentSection]));
      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
      }
    }
  };

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate all sections
    let allValid = true;
    for (let i = 0; i < sections.length; i++) {
      if (!validateSection(i)) {
        allValid = false;
      }
    }

    if (!allValid) {
      alert('Please complete all required fields before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create assessment object
      const assessmentData = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        role,
        assessorName: 'Current User', // Should come from context
        assessorId: 'user-id', // Should come from context
        status: formData['clinical-impression'] ? 'Completed' : 'In Progress',
        plan: formData['treatment-plan'] || 'Continue current plan',
        ...formData
      };

      await onSave(assessmentData);
      
      // Clear draft after successful save
      draftStorage.deleteDraftAssessment(patient.nationalId, role);
      
    } catch (error) {
      console.error('Error saving assessment:', error);
      alert('Error saving assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] || field.defaultValue || '';
    const hasError = !!errors[field.id];
    
    // Check if field should be shown based on dependencies
    if (field.dependsOn && formData[field.dependsOn] !== field.dependsValue) {
      return null;
    }

    const baseClasses = `w-full p-3 border-2 rounded-lg transition-all ${
      hasError 
        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
    } focus:ring-2 focus:outline-none`;

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
              <span className="block text-xs text-gray-500 font-normal">{field.labelAr}</span>
            </label>
            <input
              type={field.type}
              value={value}
              onChange={(e) => updateFormData(field.id, field.type === 'number' ? Number(e.target.value) : e.target.value)}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step}
              className={baseClasses}
            />
            {field.help && <p className="text-xs text-gray-500">{field.help}</p>}
            {hasError && <p className="text-xs text-red-600">{errors[field.id]}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
              <span className="block text-xs text-gray-500 font-normal">{field.labelAr}</span>
            </label>
            <textarea
              value={value}
              onChange={(e) => updateFormData(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className={baseClasses}
            />
            {field.help && <p className="text-xs text-gray-500">{field.help}</p>}
            {hasError && <p className="text-xs text-red-600">{errors[field.id]}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
              <span className="block text-xs text-gray-500 font-normal">{field.labelAr}</span>
            </label>
            <select
              value={value}
              onChange={(e) => updateFormData(field.id, e.target.value)}
              className={baseClasses}
            >
              <option value="">Select an option...</option>
              {field.options?.map((option, index) => (
                <option key={option} value={option}>
                  {option} {field.optionsAr?.[index] && `| ${field.optionsAr[index]}`}
                </option>
              ))}
            </select>
            {field.help && <p className="text-xs text-gray-500">{field.help}</p>}
            {hasError && <p className="text-xs text-red-600">{errors[field.id]}</p>}
          </div>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
              <span className="block text-xs text-gray-500 font-normal">{field.labelAr}</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {field.options?.map((option, index) => (
                <label key={option} className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFormData(field.id, [...selectedValues, option]);
                      } else {
                        updateFormData(field.id, selectedValues.filter(v => v !== option));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    {option} {field.optionsAr?.[index] && (
                      <span className="text-gray-500">| {field.optionsAr[index]}</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
            {field.help && <p className="text-xs text-gray-500">{field.help}</p>}
            {hasError && <p className="text-xs text-red-600">{errors[field.id]}</p>}
          </div>
        );

      case 'pain-scale':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
              <span className="block text-xs text-gray-500 font-normal">{field.labelAr}</span>
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">0 (No pain)</span>
              <input
                type="range"
                min={field.min || 0}
                max={field.max || 10}
                value={value || 0}
                onChange={(e) => updateFormData(field.id, Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-500">10 (Worst pain)</span>
              <div className="text-lg font-bold text-blue-600 min-w-[2rem] text-center">
                {value || 0}
              </div>
            </div>
            {field.help && <p className="text-xs text-gray-500">{field.help}</p>}
            {hasError && <p className="text-xs text-red-600">{errors[field.id]}</p>}
          </div>
        );

      case 'vitals':
        const vitals = value || {};
        return (
          <div key={field.id} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
              <span className="block text-xs text-gray-500 font-normal">{field.labelAr}</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'bp', label: 'Blood Pressure', labelAr: 'ضغط الدم', unit: 'mmHg', placeholder: '120/80' },
                { key: 'hr', label: 'Heart Rate', labelAr: 'معدل النبض', unit: 'bpm', placeholder: '72' },
                { key: 'temp', label: 'Temperature', labelAr: 'درجة الحرارة', unit: '°C', placeholder: '36.5' },
                { key: 'rr', label: 'Respiratory Rate', labelAr: 'معدل التنفس', unit: '/min', placeholder: '16' },
                { key: 'o2sat', label: 'Oxygen Saturation', labelAr: 'تشبع الأكسجين', unit: '%', placeholder: '98' },
                { key: 'pain', label: 'Pain Level', labelAr: 'مستوى الألم', unit: '/10', placeholder: '0' }
              ].map(vital => (
                <div key={vital.key} className="space-y-1">
                  <label className="block text-xs font-medium text-gray-600">
                    {vital.label} ({vital.unit})
                    <span className="block text-xs text-gray-500 font-normal">{vital.labelAr}</span>
                  </label>
                  <input
                    type="text"
                    value={vitals[vital.key] || ''}
                    onChange={(e) => updateFormData(field.id, { ...vitals, [vital.key]: e.target.value })}
                    placeholder={vital.placeholder}
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  />
                </div>
              ))}
            </div>
            {field.help && <p className="text-xs text-gray-500">{field.help}</p>}
            {hasError && <p className="text-xs text-red-600">{errors[field.id]}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  const currentSectionData = sections[currentSection];
  const Icon = currentSectionData.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 md:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <UnifiedFormHeader 
          title={`${role} ${assessmentType === 'initial' ? 'Initial' : 'Follow-up'} Assessment`}
          titleAr={`تقييم ${role} ${assessmentType === 'initial' ? 'الأولي' : 'المتابعة'}`}
          patient={patient}
          role={role}
          subtitle={`Comprehensive ${role.toLowerCase()} evaluation and care planning`}
        />

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Section {currentSection + 1} of {sections.length}: {currentSectionData.title}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentSection + 1) / sections.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`bg-${currentSectionData.color}-500 h-2 rounded-full transition-all`}
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex space-x-2 overflow-x-auto">
            {sections.map((section, index) => {
              const SectionIcon = section.icon;
              const isCompleted = completedSections.has(index);
              const isCurrent = index === currentSection;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(index)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isCurrent
                      ? `bg-${section.color}-500 text-white`
                      : isCompleted
                      ? `bg-${section.color}-100 text-${section.color}-700`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <SectionIcon size={16} />
                  <span className="hidden md:inline">{section.title}</span>
                  {isCompleted && <CheckCircle2 size={14} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className={`bg-${currentSectionData.color}-50 rounded-lg p-4 mb-6 border border-${currentSectionData.color}-200`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 bg-${currentSectionData.color}-500 rounded-lg flex items-center justify-center text-white`}>
                <Icon size={16} />
              </div>
              <div>
                <h3 className={`font-bold text-${currentSectionData.color}-800`}>{currentSectionData.title}</h3>
                <p className={`text-sm text-${currentSectionData.color}-600`}>{currentSectionData.titleAr}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {currentSectionData.fields.map(renderField)}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {lastSaved && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock size={14} />
                  Auto-saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>

              {currentSection > 0 && (
                <button
                  onClick={handlePreviousSection}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Previous
                </button>
              )}

              {currentSection < sections.length - 1 ? (
                <button
                  onClick={handleNextSection}
                  className={`px-4 py-2 bg-${currentSectionData.color}-600 text-white rounded-lg hover:bg-${currentSectionData.color}-700 transition-all`}
                >
                  Next Section
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Complete Assessment
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveHomeCareForm;