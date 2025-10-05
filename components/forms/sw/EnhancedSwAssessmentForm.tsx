import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronRight, Plus, User, Home, Brain, FileText, Check, X, MessageSquare, Lightbulb } from 'lucide-react';
import { Patient, Staff, SwAssessmentData, Role } from '../../../types';
import { useHomeHealthcare } from '../../../context/HomeHealthcareContext';

interface EnhancedSwAssessmentFormProps {
  patient: Patient;
  onSave: (assessment: SwAssessmentData) => void;
  onCancel: () => void;
}

interface AccordionSection {
  id: string;
  title: string;
  titleAr: string;
  icon: React.ElementType;
  isCompleted: boolean;
  isOpen: boolean;
}

interface FamilyMember {
  id: string;
  relation: string;
  relationBeforeIllness: 'جيدة' | 'متوسطة' | 'سيئة';
  relationAfterIllness: 'جيدة' | 'متوسطة' | 'سيئة';
}

interface FormData {
  dataSource: string[];
  maritalStatus: 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل' | '';
  wivesCount: number;
  educationLevel: 'أمي' | 'ابتدائي' | 'متوسط' | 'ثانوي' | 'جامعي' | '';
  profession: 'طالب' | 'موظف' | 'عاطل' | 'متقاعد' | 'عامل' | 'ربة منزل' | '';
  socialNotes: string;
  housingType: 'فيلا' | 'شقة' | 'بيت شعبي' | 'غرفة' | 'سكن خيري' | 'بلا مسكن' | '';
  housingOwnership: 'ملك' | 'إيجار' | '';
  housingCondition: number; // 1-5 scale
  incomeSources: string[];
  incomeAmount: string;
  familyMembers: FamilyMember[];
  psychologicalImpact: string[];
  physicalStatus: string[];
  assessmentSpeech: 'سليم' | 'ضعف بسيط' | 'ضعف شديد' | '';
  assessmentSight: 'سليم' | 'ضعف بسيط' | 'ضعف شديد' | '';
  assessmentHearing: 'سليم' | 'ضعف بسيط' | 'ضعف شديد' | '';
  assessmentMovement: 'كاملة' | 'ضعف أطراف' | 'شلل نصفي' | 'شلل رباعي' | '';
  assessmentNotes: Record<string, string>;
  equipmentNeeds: string[];
  interventionSummary: string;
  educationStatus: 'تم التثقيف' | 'يحتاج تثقيف لاحق' | '';
}

const EnhancedSwAssessmentForm: React.FC<EnhancedSwAssessmentFormProps> = ({
  patient,
  onSave,
  onCancel
}) => {
  const { state } = useHomeHealthcare();
  const [selectedDoctor, setSelectedDoctor] = useState<Staff | null>(null);
  const [selectedNurse, setSelectedNurse] = useState<Staff | null>(null);

  const [formData, setFormData] = useState<FormData>({
    dataSource: [],
    maritalStatus: '',
    wivesCount: 1,
    educationLevel: '',
    profession: '',
    socialNotes: '',
    housingType: '',
    housingOwnership: '',
    housingCondition: 3,
    incomeSources: [],
    incomeAmount: '',
    familyMembers: [],
    psychologicalImpact: [],
    physicalStatus: [],
    assessmentSpeech: '',
    assessmentSight: '',
    assessmentHearing: '',
    assessmentMovement: '',
    assessmentNotes: {},
    equipmentNeeds: [],
    interventionSummary: '',
    educationStatus: ''
  });

  const [sections, setSections] = useState<AccordionSection[]>([
    { id: 'basic', title: 'Basic Assessment', titleAr: 'المعلومات الأساسية والحالة الاجتماعية', icon: User, isCompleted: false, isOpen: true },
    { id: 'environment', title: 'Environment & Housing', titleAr: 'السكن، الدخل، وتكوين الأسرة', icon: Home, isCompleted: false, isOpen: false },
    { id: 'assessment', title: 'Psychological & Physical', titleAr: 'الأثر النفسي والقدرات البدنية', icon: Brain, isCompleted: false, isOpen: false },
    { id: 'plan', title: 'Plan & Recommendations', titleAr: 'خطة الخروج، التوصيات، والتثقيف', icon: FileText, isCompleted: false, isOpen: false }
  ]);

  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [newFamilyMember, setNewFamilyMember] = useState<Omit<FamilyMember, 'id'>>({
    relation: '',
    relationBeforeIllness: 'جيدة',
    relationAfterIllness: 'جيدة'
  });

  // Data options
  const dataSourceOptions = ['المريض', 'المرافق', 'الملف الطبي'];
  const educationOptions = [
    { value: 'أمي', label: 'أمي' },
    { value: 'ابتدائي', label: 'ابتدائي' },
    { value: 'متوسط', label: 'متوسط' },
    { value: 'ثانوي', label: 'ثانوي' },
    { value: 'جامعي', label: 'جامعي' }
  ];

  const professionOptions = [
    { value: 'طالب', label: 'طالب' },
    { value: 'موظف', label: 'موظف' },
    { value: 'عاطل', label: 'عاطل' },
    { value: 'متقاعد', label: 'متقاعد' },
    { value: 'عامل', label: 'عامل' },
    { value: 'ربة منزل', label: 'ربة منزل' }
  ];

  const housingTypeOptions = ['فيلا', 'شقة', 'بيت شعبي', 'غرفة', 'سكن خيري', 'بلا مسكن'];
  const incomeSourceOptions = ['راتب', 'تقاعد', 'ضمان اجتماعي', 'لا يوجد دخل', 'أخرى'];

  const psychologicalImpactOptions = [
    'انخفاض الروح المعنوية', 'يأس', 'انطوائية', 'غضب وعصبية', 'قلة النوم',
    'رهاب أو وسواس', 'عنف أو عدوانية', 'إنكار المرض', 'اندفاعية'
  ];

  const physicalStatusOptions = [
    'محدود القدرات', 'يمشي بمساعدة', 'يحتاج إشراف', 'طريح الفراش',
    'غسيل كلوي', 'قسطرة', 'عدم تحكم في الإخراج'
  ];

  const equipmentNeedsOptions = [
    'سرير طبي', 'مرتبة هوائية', 'كرسي متحرك', 'كرسي حمام',
    'رافعة مريض', 'جهاز أكسجين'
  ];

  // Sentence generators for intervention summary
  const sentenceGenerators = [
    {
      key: 'family_education',
      label: 'تثقيف أسري',
      text: 'تم عقد جلسة تثقيفية مع أسرة المريض للتركيز على أهمية الوقاية من قرح الفراش وكيفية استخدام الأجهزة الطبية بأمان.'
    },
    {
      key: 'financial_support',
      label: 'تنسيق دعم مالي',
      text: 'تم التنسيق مع الجهات المختصة لتقديم الدعم المالي المناسب للأسرة وربطها بالجمعيات الخيرية الداعمة.'
    },
    {
      key: 'psych_eval',
      label: 'تقييم نفسي',
      text: 'تم إجراء تقييم نفسي شامل للمريض وتقديم الدعم النفسي المناسب للتعامل مع تحديات المرض.'
    },
    {
      key: 'listening_session',
      label: 'جلسة استماع',
      text: 'تم عقد جلسة استماع مع المريض وأسرته للتعبير عن مخاوفهم ومناقشة الحلول المتاحة لتحسين جودة الحياة.'
    }
  ];

  // Helper functions
  const toggleSection = useCallback((sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isOpen: !section.isOpen }
        : section
    ));
  }, []);

  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleChip = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => {
      const currentValues = prev[field] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  }, []);

  const addSentenceToSummary = useCallback((sentence: string) => {
    setFormData(prev => ({
      ...prev,
      interventionSummary: prev.interventionSummary 
        ? `${prev.interventionSummary}\n\n${sentence}`
        : sentence
    }));
  }, []);

  const addFamilyMember = useCallback(() => {
    if (newFamilyMember.relation.trim()) {
      const member: FamilyMember = {
        id: Date.now().toString(),
        ...newFamilyMember
      };
      setFormData(prev => ({
        ...prev,
        familyMembers: [...prev.familyMembers, member]
      }));
      setNewFamilyMember({
        relation: '',
        relationBeforeIllness: 'جيدة',
        relationAfterIllness: 'جيدة'
      });
      setShowFamilyModal(false);
    }
  }, [newFamilyMember]);

  const removeFamilyMember = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter(member => member.id !== id)
    }));
  }, []);

  // Completion check for sections
  const sectionCompletionStatus = useMemo(() => {
    return {
      basic: !!(formData.dataSource.length && formData.maritalStatus && formData.educationLevel && formData.profession),
      environment: !!(formData.housingType && formData.housingOwnership && formData.incomeSources.length),
      assessment: !!(formData.assessmentSpeech && formData.assessmentSight && formData.assessmentHearing && formData.assessmentMovement),
      plan: !!(formData.educationStatus)
    };
  }, [formData]);

  const handleSubmit = useCallback(() => {
    // Create comprehensive assessment data that includes form data for the report
    const assessmentWithFormData = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      assessorId: 'current-user-id',
      assessorName: selectedDoctor?.الاسم || 'أخصائي اجتماعي',
      role: Role.SocialWorker,
      status: 'Improved' as const,
      plan: 'الاستمرار',
      situationChange: 'تحسن',
      actionsTaken: formData.incomeSources.includes('ضمان اجتماعي') ? ['مساعدة مالية'] : ['دعم معيل'],
      swNote: formData.interventionSummary,
      // Include all form data for report generation
      ...formData,
      familyMembers: familyMembers
    };

    onSave(assessmentWithFormData);
  }, [formData, familyMembers, selectedDoctor, onSave]);

  // Render helper components
  const ChipSelector: React.FC<{
    options: string[];
    selected: string[];
    onToggle: (value: string) => void;
    allowCustom?: boolean;
  }> = ({ options, selected, onToggle, allowCustom = false }) => (
    <div className="flex flex-wrap gap-2">
      {options.map(option => (
        <button
          key={option}
          onClick={() => onToggle(option)}
          className={`px-3 py-1.5 text-sm rounded-full border-2 transition-all ${
            selected.includes(option)
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
          }`}
        >
          {option}
        </button>
      ))}
      {allowCustom && (
        <button className="px-3 py-1.5 text-sm rounded-full border-2 border-dashed border-gray-400 text-gray-600 hover:border-blue-400">
          <Plus size={14} className="inline mr-1" />
          إضافة أخرى...
        </button>
      )}
    </div>
  );

  const CardSelector: React.FC<{
    options: { value: string; label: string }[];
    selected: string;
    onSelect: (value: string) => void;
  }> = ({ options, selected, onSelect }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={`p-4 rounded-xl border-2 text-center transition-all ${
            selected === option.value
              ? 'bg-blue-50 border-blue-500 text-blue-700'
              : 'bg-white border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="font-medium">{option.label}</div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                <User className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Social Work Assessment</h1>
                <p className="text-orange-100">تقييم الأخصائي الاجتماعي الذكي</p>
                <p className="text-sm text-orange-200 mt-1">المريض: {patient.nameAr}</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress indicators */}
          <div className="mt-4 flex items-center gap-2">
            {sections.map((section, index) => (
              <div key={section.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  sectionCompletionStatus[section.id as keyof typeof sectionCompletionStatus]
                    ? 'bg-green-500 text-white'
                    : section.isOpen
                    ? 'bg-white text-orange-600'
                    : 'bg-white/30 text-white'
                }`}>
                  {sectionCompletionStatus[section.id as keyof typeof sectionCompletionStatus] ? '✓' : index + 1}
                </div>
                {index < sections.length - 1 && (
                  <div className="w-8 h-0.5 bg-white/30 mx-1"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            
            {/* Section 1: Basic Assessment */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('basic')}
                className="w-full p-4 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User className="text-orange-600" size={20} />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{sections[0].titleAr}</h3>
                    <p className="text-sm text-gray-600">المعلومات الأساسية والحالة الاجتماعية</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sectionCompletionStatus.basic && <Check className="text-green-500" size={18} />}
                  {sections[0].isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </button>
              
              {sections[0].isOpen && (
                <div className="p-6 space-y-6">
                  
                  {/* Data Source */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      مصدر البيانات
                    </label>
                    <ChipSelector
                      options={dataSourceOptions}
                      selected={formData.dataSource}
                      onToggle={(value) => toggleChip('dataSource', value)}
                    />
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      الحالة الاجتماعية
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['أعزب', 'متزوج', 'مطلق', 'أرمل'].map(status => (
                        <button
                          key={status}
                          onClick={() => updateFormData('maritalStatus', status)}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            formData.maritalStatus === status
                              ? 'bg-blue-50 border-blue-500 text-blue-700'
                              : 'bg-white border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="font-medium">{status}</div>
                        </button>
                      ))}
                    </div>
                    
                    {/* Conditional: Number of wives */}
                    {formData.maritalStatus === 'متزوج' && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          عدد الزوجات
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="4"
                          value={formData.wivesCount}
                          onChange={(e) => updateFormData('wivesCount', parseInt(e.target.value))}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>

                  {/* Education Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      المستوى التعليمي
                    </label>
                    <CardSelector
                      options={educationOptions}
                      selected={formData.educationLevel}
                      onSelect={(value) => updateFormData('educationLevel', value)}
                    />
                  </div>

                  {/* Profession */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      المهنة
                    </label>
                    <CardSelector
                      options={professionOptions}
                      selected={formData.profession}
                      onSelect={(value) => updateFormData('profession', value)}
                    />
                  </div>

                  {/* Social Notes */}
                  <div>
                    <button
                      onClick={() => {/* toggle notes */}}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Plus size={16} />
                      إضافة ملاحظة اجتماعية
                    </button>
                    <textarea
                      value={formData.socialNotes}
                      onChange={(e) => updateFormData('socialNotes', e.target.value)}
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="ملاحظات إضافية على الوضع الاجتماعي..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Environment & Housing */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('environment')}
                className="w-full p-4 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Home className="text-orange-600" size={20} />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{sections[1].titleAr}</h3>
                    <p className="text-sm text-gray-600">السكن، الدخل، وتكوين الأسرة</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sectionCompletionStatus.environment && <Check className="text-green-500" size={18} />}
                  {sections[1].isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </button>
              
              {sections[1].isOpen && (
                <div className="p-6 space-y-6">
                  
                  {/* Housing Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      نوع السكن
                    </label>
                    <ChipSelector
                      options={housingTypeOptions}
                      selected={formData.housingType ? [formData.housingType] : []}
                      onToggle={(value) => updateFormData('housingType', value)}
                    />
                  </div>

                  {/* Housing Ownership */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      ملكية السكن
                    </label>
                    <div className="flex gap-3">
                      {['ملك', 'إيجار'].map(ownership => (
                        <button
                          key={ownership}
                          onClick={() => updateFormData('housingOwnership', ownership)}
                          className={`px-6 py-3 rounded-lg border-2 transition-all ${
                            formData.housingOwnership === ownership
                              ? 'bg-blue-50 border-blue-500 text-blue-700'
                              : 'bg-white border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          {ownership}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Housing Condition Slider */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      حالة السكن الصحية
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={formData.housingCondition}
                        onChange={(e) => updateFormData('housingCondition', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>سيئة</span>
                        <span>متوسطة</span>
                        <span>جيدة</span>
                      </div>
                    </div>
                  </div>

                  {/* Income Sources */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      مصادر الدخل
                    </label>
                    <ChipSelector
                      options={incomeSourceOptions}
                      selected={formData.incomeSources}
                      onToggle={(value) => toggleChip('incomeSources', value)}
                      allowCustom
                    />
                    <div className="mt-3">
                      <input
                        type="text"
                        value={formData.incomeAmount}
                        onChange={(e) => updateFormData('incomeAmount', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="المبلغ التقريبي (ريال سعودي)"
                      />
                    </div>
                  </div>

                  {/* Family Composition */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      تكوين الأسرة والعلاقات
                    </label>
                    <button
                      onClick={() => setShowFamilyModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={16} />
                      إضافة فرد بالأسرة
                    </button>
                    
                    {/* Family Members Display */}
                    {formData.familyMembers.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {formData.familyMembers.map(member => (
                          <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <span className="font-medium">{member.relation}</span>
                              <div className="text-sm text-gray-600">
                                قبل المرض: {member.relationBeforeIllness} | بعد المرض: {member.relationAfterIllness}
                              </div>
                            </div>
                            <button
                              onClick={() => removeFamilyMember(member.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Psychological & Physical Assessment */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('assessment')}
                className="w-full p-4 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Brain className="text-orange-600" size={20} />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{sections[2].titleAr}</h3>
                    <p className="text-sm text-gray-600">الأثر النفسي والقدرات البدنية</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sectionCompletionStatus.assessment && <Check className="text-green-500" size={18} />}
                  {sections[2].isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </button>
              
              {sections[2].isOpen && (
                <div className="p-6 space-y-6">
                  
                  {/* Psychological Impact */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      الأثر النفسي على المريض/الأسرة
                    </label>
                    <ChipSelector
                      options={psychologicalImpactOptions}
                      selected={formData.psychologicalImpact}
                      onToggle={(value) => toggleChip('psychologicalImpact', value)}
                      allowCustom
                    />
                  </div>

                  {/* Physical Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      الحالة الصحية والبدنية
                    </label>
                    <ChipSelector
                      options={physicalStatusOptions}
                      selected={formData.physicalStatus}
                      onToggle={(value) => toggleChip('physicalStatus', value)}
                      allowCustom
                    />
                  </div>

                  {/* Functional Assessment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      تقييم القدرات الوظيفية
                    </label>
                    <div className="space-y-4">
                      {[
                        { key: 'assessmentSpeech', label: 'النطق', options: ['سليم', 'ضعف بسيط', 'ضعف شديد'] },
                        { key: 'assessmentSight', label: 'البصر', options: ['سليم', 'ضعف بسيط', 'ضعف شديد'] },
                        { key: 'assessmentHearing', label: 'السمع', options: ['سليم', 'ضعف بسيط', 'ضعف شديد'] },
                        { key: 'assessmentMovement', label: 'الحركة', options: ['كاملة', 'ضعف أطراف', 'شلل نصفي', 'شلل رباعي'] }
                      ].map(assessment => (
                        <div key={assessment.key} className="flex items-center gap-4">
                          <div className="w-20 text-sm font-medium text-gray-700">
                            {assessment.label}:
                          </div>
                          <div className="flex-1 flex items-center gap-2">
                            {assessment.options.map(option => (
                              <label key={option} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={assessment.key}
                                  value={option}
                                  checked={formData[assessment.key as keyof FormData] === option}
                                  onChange={(e) => updateFormData(assessment.key as keyof FormData, e.target.value)}
                                  className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                          <button
                            onClick={() => {/* open notes modal for this assessment */}}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="إضافة ملاحظة"
                          >
                            <MessageSquare size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Plan & Recommendations */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('plan')}
                className="w-full p-4 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-orange-600" size={20} />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{sections[3].titleAr}</h3>
                    <p className="text-sm text-gray-600">خطة الخروج، التوصيات، والتثقيف</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sectionCompletionStatus.plan && <Check className="text-green-500" size={18} />}
                  {sections[3].isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </button>
              
              {sections[3].isOpen && (
                <div className="p-6 space-y-6">
                  
                  {/* Equipment Needs */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      احتياجات الخروج (الأجهزة الطبية)
                    </label>
                    <ChipSelector
                      options={equipmentNeedsOptions}
                      selected={formData.equipmentNeeds}
                      onToggle={(value) => toggleChip('equipmentNeeds', value)}
                      allowCustom
                    />
                  </div>

                  {/* Intervention Summary with Sentence Generators */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      ملخص التدخل والإجراءات
                    </label>
                    
                    {/* Sentence Generators */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">مولدات الجمل الاحترافية:</p>
                      <div className="flex flex-wrap gap-2">
                        {sentenceGenerators.map(generator => (
                          <button
                            key={generator.key}
                            onClick={() => addSentenceToSummary(generator.text)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                          >
                            <Lightbulb size={14} />
                            {generator.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      value={formData.interventionSummary}
                      onChange={(e) => updateFormData('interventionSummary', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={6}
                      placeholder="اكتب ملخص التدخل الاجتماعي أو استخدم مولدات الجمل أعلاه..."
                    />
                  </div>

                  {/* Education Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      تثقيف المريض والأسرة
                    </label>
                    <div className="flex gap-3">
                      {['تم التثقيف', 'يحتاج تثقيف لاحق'].map(status => (
                        <button
                          key={status}
                          onClick={() => updateFormData('educationStatus', status)}
                          className={`px-6 py-3 rounded-lg border-2 transition-all ${
                            formData.educationStatus === status
                              ? 'bg-green-50 border-green-500 text-green-700'
                              : 'bg-white border-gray-200 hover:border-green-300'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            الأقسام المكتملة: {Object.values(sectionCompletionStatus).filter(Boolean).length} من {sections.length}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Check size={16} />
              حفظ التقييم وإنشاء التقرير
            </button>
          </div>
        </div>

        {/* Family Member Modal */}
        {showFamilyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">إضافة فرد بالأسرة</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      صلة القرابة
                    </label>
                    <input
                      type="text"
                      value={newFamilyMember.relation}
                      onChange={(e) => setNewFamilyMember(prev => ({ ...prev, relation: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="مثال: الابن، الابنة، الزوجة"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العلاقة قبل المرض
                    </label>
                    <select
                      value={newFamilyMember.relationBeforeIllness}
                      onChange={(e) => setNewFamilyMember(prev => ({ 
                        ...prev, 
                        relationBeforeIllness: e.target.value as 'جيدة' | 'متوسطة' | 'سيئة'
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="جيدة">جيدة</option>
                      <option value="متوسطة">متوسطة</option>
                      <option value="سيئة">سيئة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العلاقة بعد المرض
                    </label>
                    <select
                      value={newFamilyMember.relationAfterIllness}
                      onChange={(e) => setNewFamilyMember(prev => ({ 
                        ...prev, 
                        relationAfterIllness: e.target.value as 'جيدة' | 'متوسطة' | 'سيئة'
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="جيدة">جيدة</option>
                      <option value="متوسطة">متوسطة</option>
                      <option value="سيئة">سيئة</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowFamilyModal(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={addFamilyMember}
                    disabled={!newFamilyMember.relation.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    إضافة
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedSwAssessmentForm;