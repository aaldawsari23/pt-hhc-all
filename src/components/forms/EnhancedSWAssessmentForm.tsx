import React, { useState } from 'react';
import { X, Save, Users, Home, DollarSign, Heart, AlertTriangle, HelpCircle } from 'lucide-react';
import { repo } from '../../data/local/repo';

interface EnhancedSWAssessmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onSuccess: () => void;
}

export function EnhancedSWAssessmentForm({ isOpen, onClose, patientId, onSuccess }: EnhancedSWAssessmentFormProps) {
  const [formData, setFormData] = useState({
    // تقييم الحالة العامة
    currentStatus: 'مستقر', // مستقر، تحسن، تدهور
    priorityLevel: 'متوسط', // عالي، متوسط، منخفض
    assessmentDate: new Date().toISOString().split('T')[0],
    
    // الوضع الأسري والاجتماعي
    familyStructure: {
      livingArrangement: 'مع الأسرة', // مع الأسرة، مع الزوج/الزوجة، مع أحد الأبناء، بمفرده، دار رعاية
      primaryCaregiver: 'ابن/ابنة', // ابن/ابنة، زوج/زوجة، والد/والدة، أخ/أخت، عامل منزلي، لا يوجد
      caregiverAvailability: '24/7', // 24/7، نهاري فقط، ليلي فقط، محدود، غير متوفر
      familySupport: 'قوي', // قوي، متوسط، ضعيف، غير موجود
      familyDynamics: 'متعاون', // متعاون، متوتر، متضارب، غير مبالي
    },
    
    // الوضع السكني
    housing: {
      ownershipType: 'ملك', // ملك، إيجار، سكن مؤقت، دار رعاية
      housingSuitability: 'مناسب', // مناسب، يحتاج تعديل، غير مناسب، خطير
      accessibility: {
        stairs: false,
        ramps: false,
        wideDooors: false,
        grabBars: false,
        elevator: false,
      },
      utilities: {
        electricity: true,
        water: true,
        airConditioning: false,
        heating: false,
        internet: false,
      },
      safetyHazards: [], // سلالم بدون درابزين، أرضية زلقة، إضاءة ضعيفة، أسلاك مكشوفة، أخرى
    },
    
    // الوضع الاقتصادي
    economic: {
      incomeLevel: 'كافي', // كافي، محدود، غير كافي، لا يوجد دخل
      incomeSource: 'راتب تقاعدي', // راتب تقاعدي، ضمان اجتماعي، دعم أسري، عمل جزئي، لا يوجد
      financialStress: 'لا', // نعم، لا، أحياناً
      insuranceCoverage: 'حكومي', // حكومي، خاص، مختلط، لا يوجد
      transportationAccess: 'متوفر', // متوفر، محدود، غير متوفر، يحتاج مساعدة
    },
    
    // الحالة النفسية والسلوكية
    psychological: {
      mood: 'مستقر', // مستقر، قلق، حزين، سعيد، متقلب
      cognitiveStatus: 'طبيعي', // طبيعي، تدهور طفيف، تدهور متوسط، تدهور شديد
      behavioralIssues: [], // عدوانية، انطواء، رفض العلاج، تشويش، لا يوجد
      copingMechanisms: [], // الصلاة، القراءة، مشاهدة التلفاز، الهوايات، التواصل الاجتماعي
      stressFactors: [], // المرض، الألم، الوضع المالي، القلق على الأسرة، الوحدة
    },
    
    // الدعم الاجتماعي والمجتمعي
    socialSupport: {
      socialNetwork: 'واسع', // واسع، محدود، ضعيف، معدوم
      communityInvolvement: 'نشط', // نشط، محدود، منعزل
      religiousSupport: 'قوي', // قوي، متوسط، ضعيف، لا يوجد
      friendsVisits: 'منتظم', // منتظم، أحياناً، نادراً، لا يوجد
      neighborhoodSupport: 'متعاون', // متعاون، محايد، غير مهتم
    },
    
    // التحديات والمخاطر الاجتماعية
    challenges: {
      socialIsolation: false,
      elderAbuse: false,
      neglect: false,
      financialExploitation: false,
      inadequateCaregiver: false,
      unsafeEnvironment: false,
      medicationNonCompliance: false,
      lackOfServices: false,
    },
    
    // الاحتياجات المحددة
    needs: {
      homeModifications: false,
      caregiverTraining: false,
      financialAssistance: false,
      transportationHelp: false,
      socialActivities: false,
      counselingSupport: false,
      respiteCare: false,
      nutritionSupport: false,
    },
    
    // الموارد والخدمات الخارجية
    externalResources: {
      charitableOrganizations: false,
      governmentPrograms: false,
      communityVolunteers: false,
      religiousInstitutions: false,
      healthcareServices: false,
      socialServices: false,
    },
    
    // خطة التدخل الاجتماعي
    interventionPlan: {
      shortTermGoals: [], // تحسين السلامة المنزلية، تعزيز الدعم الأسري، تأمين الموارد المالية
      longTermGoals: [], // الاستقلالية القصوى، التكامل المجتمعي، الرفاهية الشاملة
      interventions: [], // زيارات منزلية، تدريب مقدمي الرعاية، ربط بالخدمات، استشارة أسرية
      followUpFrequency: 'أسبوعي', // يومي، أسبوعي، شهري، حسب الحاجة
    },
    
    // ملاحظات شاملة
    comprehensiveNotes: '',
    riskAssessment: 'منخفض', // منخفض، متوسط، عالي، حرج
    recommendedActions: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCheckboxChange = (section: string, field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: checked
      }
    }));
  };

  const handleArrayToggle = (section: string, field: string, value: string) => {
    setFormData(prev => {
      const currentArray = prev[section][field] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray
        }
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');

      // إنشاء نوت شامل للتقييم الاجتماعي
      const assessmentNote = `
تقييم اجتماعي شامل - ${formData.assessmentDate}

الحالة العامة:
• الحالة الحالية: ${formData.currentStatus}
• مستوى الأولوية: ${formData.priorityLevel}
• تقييم الخطر: ${formData.riskAssessment}

الوضع الأسري والاجتماعي:
• الترتيب السكني: ${formData.familyStructure.livingArrangement}
• مقدم الرعاية الأساسي: ${formData.familyStructure.primaryCaregiver}
• توفر مقدم الرعاية: ${formData.familyStructure.caregiverAvailability}
• دعم الأسرة: ${formData.familyStructure.familySupport}
• ديناميكية الأسرة: ${formData.familyStructure.familyDynamics}

الوضع السكني:
• نوع السكن: ${formData.housing.ownershipType}
• مدى الملاءمة: ${formData.housing.housingSuitability}
• التسهيلات المتاحة: ${Object.entries(formData.housing.accessibility).filter(([_, value]) => value).map(([key, _]) => key).join('، ') || 'لا يوجد'}
• المرافق: ${Object.entries(formData.housing.utilities).filter(([_, value]) => value).map(([key, _]) => key).join('، ') || 'أساسية فقط'}

الوضع الاقتصادي:
• مستوى الدخل: ${formData.economic.incomeLevel}
• مصدر الدخل: ${formData.economic.incomeSource}
• ضغوط مالية: ${formData.economic.financialStress}
• التأمين الصحي: ${formData.economic.insuranceCoverage}
• وسائل النقل: ${formData.economic.transportationAccess}

الحالة النفسية والسلوكية:
• المزاج: ${formData.psychological.mood}
• الحالة المعرفية: ${formData.psychological.cognitiveStatus}
• آليات التكيف: ${formData.psychological.copingMechanisms.join('، ') || 'لم يُحدد'}
• عوامل الضغط: ${formData.psychological.stressFactors.join('، ') || 'لا يوجد'}

الدعم الاجتماعي:
• الشبكة الاجتماعية: ${formData.socialSupport.socialNetwork}
• المشاركة المجتمعية: ${formData.socialSupport.communityInvolvement}
• الدعم الديني: ${formData.socialSupport.religiousSupport}
• زيارات الأصدقاء: ${formData.socialSupport.friendsVisits}

التحديات المحددة:
${Object.entries(formData.challenges).filter(([_, value]) => value).map(([key, _]) => `• ${key}`).join('\n') || '• لا توجد تحديات كبيرة'}

الاحتياجات:
${Object.entries(formData.needs).filter(([_, value]) => value).map(([key, _]) => `• ${key}`).join('\n') || '• لا توجد احتياجات محددة'}

الموارد الخارجية المطلوبة:
${Object.entries(formData.externalResources).filter(([_, value]) => value).map(([key, _]) => `• ${key}`).join('\n') || '• لا توجد موارد مطلوبة حالياً'}

خطة التدخل:
• الأهداف قصيرة المدى: ${formData.interventionPlan.shortTermGoals.join('، ') || 'سيتم تحديدها'}
• الأهداف طويلة المدى: ${formData.interventionPlan.longTermGoals.join('، ') || 'سيتم تحديدها'}
• التدخلات المطلوبة: ${formData.interventionPlan.interventions.join('، ') || 'سيتم تحديدها'}
• تكرار المتابعة: ${formData.interventionPlan.followUpFrequency}

الإجراءات الموصى بها:
${formData.recommendedActions || 'متابعة روتينية'}

ملاحظات شاملة:
${formData.comprehensiveNotes || 'لا توجد ملاحظات إضافية'}

تم إجراء التقييم من قبل: أخصائي اجتماعي
التاريخ: ${new Date().toLocaleDateString('ar-SA')}
      `.trim();

      await repo.addNote({
        patientId,
        type: 'assessment',
        authorRole: 'Social Worker',
        authorName: 'أخصائي اجتماعي',
        text: assessmentNote,
        tags: ['تقييم اجتماعي', 'خدمة اجتماعية', formData.priorityLevel, formData.riskAssessment],
      });

      // إعادة تعيين النموذج
      setFormData(prev => ({
        ...prev,
        comprehensiveNotes: '',
        recommendedActions: '',
      }));

      onSuccess();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">التقييم الاجتماعي الشامل</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* تقييم الحالة العامة */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium text-gray-900">
              <AlertTriangle className="w-4 h-4" />
              تقييم الحالة العامة
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الحالة الحالية
                </label>
                <select
                  value={formData.currentStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentStatus: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="مستقر">مستقر</option>
                  <option value="تحسن">تحسن</option>
                  <option value="تدهور">تدهور</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  مستوى الأولوية
                </label>
                <select
                  value={formData.priorityLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, priorityLevel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="منخفض">منخفض</option>
                  <option value="متوسط">متوسط</option>
                  <option value="عالي">عالي</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تقييم الخطر
                </label>
                <select
                  value={formData.riskAssessment}
                  onChange={(e) => setFormData(prev => ({ ...prev, riskAssessment: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="منخفض">منخفض</option>
                  <option value="متوسط">متوسط</option>
                  <option value="عالي">عالي</option>
                  <option value="حرج">حرج</option>
                </select>
              </div>
            </div>
          </div>

          {/* الوضع الأسري والاجتماعي */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium text-gray-900">
              <Users className="w-4 h-4" />
              الوضع الأسري والاجتماعي
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الترتيب السكني
                </label>
                <select
                  value={formData.familyStructure.livingArrangement}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    familyStructure: { ...prev.familyStructure, livingArrangement: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="مع الأسرة">مع الأسرة</option>
                  <option value="مع الزوج/الزوجة">مع الزوج/الزوجة</option>
                  <option value="مع أحد الأبناء">مع أحد الأبناء</option>
                  <option value="بمفرده">بمفرده</option>
                  <option value="دار رعاية">دار رعاية</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  مقدم الرعاية الأساسي
                </label>
                <select
                  value={formData.familyStructure.primaryCaregiver}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    familyStructure: { ...prev.familyStructure, primaryCaregiver: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ابن/ابنة">ابن/ابنة</option>
                  <option value="زوج/زوجة">زوج/زوجة</option>
                  <option value="والد/والدة">والد/والدة</option>
                  <option value="أخ/أخت">أخ/أخت</option>
                  <option value="عامل منزلي">عامل منزلي</option>
                  <option value="لا يوجد">لا يوجد</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  توفر مقدم الرعاية
                </label>
                <select
                  value={formData.familyStructure.caregiverAvailability}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    familyStructure: { ...prev.familyStructure, caregiverAvailability: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="24/7">24/7</option>
                  <option value="نهاري فقط">نهاري فقط</option>
                  <option value="ليلي فقط">ليلي فقط</option>
                  <option value="محدود">محدود</option>
                  <option value="غير متوفر">غير متوفر</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  دعم الأسرة
                </label>
                <select
                  value={formData.familyStructure.familySupport}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    familyStructure: { ...prev.familyStructure, familySupport: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="قوي">قوي</option>
                  <option value="متوسط">متوسط</option>
                  <option value="ضعيف">ضعيف</option>
                  <option value="غير موجود">غير موجود</option>
                </select>
              </div>
            </div>
          </div>

          {/* الوضع السكني */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium text-gray-900">
              <Home className="w-4 h-4" />
              الوضع السكني
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نوع السكن
                </label>
                <select
                  value={formData.housing.ownershipType}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    housing: { ...prev.housing, ownershipType: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ملك">ملك</option>
                  <option value="إيجار">إيجار</option>
                  <option value="سكن مؤقت">سكن مؤقت</option>
                  <option value="دار رعاية">دار رعاية</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  مدى الملاءمة
                </label>
                <select
                  value={formData.housing.housingSuitability}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    housing: { ...prev.housing, housingSuitability: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="مناسب">مناسب</option>
                  <option value="يحتاج تعديل">يحتاج تعديل</option>
                  <option value="غير مناسب">غير مناسب</option>
                  <option value="خطير">خطير</option>
                </select>
              </div>
            </div>

            {/* التسهيلات المتاحة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التسهيلات المتاحة
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries({
                  stairs: 'سلالم آمنة',
                  ramps: 'منحدرات',
                  wideDooors: 'أبواب واسعة',
                  grabBars: 'مقابض أمان',
                  elevator: 'مصعد'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.housing.accessibility[key]}
                      onChange={(e) => handleCheckboxChange('housing', `accessibility.${key}`, e.target.checked)}
                      className="mr-2"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* الوضع الاقتصادي */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium text-gray-900">
              <DollarSign className="w-4 h-4" />
              الوضع الاقتصادي
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  مستوى الدخل
                </label>
                <select
                  value={formData.economic.incomeLevel}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    economic: { ...prev.economic, incomeLevel: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="كافي">كافي</option>
                  <option value="محدود">محدود</option>
                  <option value="غير كافي">غير كافي</option>
                  <option value="لا يوجد دخل">لا يوجد دخل</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  مصدر الدخل
                </label>
                <select
                  value={formData.economic.incomeSource}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    economic: { ...prev.economic, incomeSource: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="راتب تقاعدي">راتب تقاعدي</option>
                  <option value="ضمان اجتماعي">ضمان اجتماعي</option>
                  <option value="دعم أسري">دعم أسري</option>
                  <option value="عمل جزئي">عمل جزئي</option>
                  <option value="لا يوجد">لا يوجد</option>
                </select>
              </div>
            </div>
          </div>

          {/* التحديات الاجتماعية */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium text-gray-900">
              <AlertTriangle className="w-4 h-4" />
              التحديات والمخاطر الاجتماعية
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries({
                socialIsolation: 'عزلة اجتماعية',
                elderAbuse: 'إساءة معاملة',
                neglect: 'إهمال',
                financialExploitation: 'استغلال مالي',
                inadequateCaregiver: 'رعاية غير كافية',
                unsafeEnvironment: 'بيئة غير آمنة',
                medicationNonCompliance: 'عدم الالتزام بالأدوية',
                lackOfServices: 'نقص في الخدمات'
              }).map(([key, label]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.challenges[key]}
                    onChange={(e) => handleCheckboxChange('challenges', key, e.target.checked)}
                    className="mr-2"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* الاحتياجات المحددة */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium text-gray-900">
              <HelpCircle className="w-4 h-4" />
              الاحتياجات المحددة
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries({
                homeModifications: 'تعديلات منزلية',
                caregiverTraining: 'تدريب مقدمي الرعاية',
                financialAssistance: 'مساعدة مالية',
                transportationHelp: 'مساعدة في النقل',
                socialActivities: 'أنشطة اجتماعية',
                counselingSupport: 'دعم نفسي',
                respiteCare: 'رعاية استراحة',
                nutritionSupport: 'دعم غذائي'
              }).map(([key, label]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.needs[key]}
                    onChange={(e) => handleCheckboxChange('needs', key, e.target.checked)}
                    className="mr-2"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* خطة التدخل */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium text-gray-900">
              <Heart className="w-4 h-4" />
              خطة التدخل الاجتماعي
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تكرار المتابعة
              </label>
              <select
                value={formData.interventionPlan.followUpFrequency}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  interventionPlan: { ...prev.interventionPlan, followUpFrequency: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="يومي">يومي</option>
                <option value="أسبوعي">أسبوعي</option>
                <option value="شهري">شهري</option>
                <option value="حسب الحاجة">حسب الحاجة</option>
              </select>
            </div>
          </div>

          {/* ملاحظات شاملة */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ملاحظات شاملة
              </label>
              <textarea
                value={formData.comprehensiveNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, comprehensiveNotes: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ملاحظات تفصيلية حول الحالة الاجتماعية للمريض..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الإجراءات الموصى بها
              </label>
              <textarea
                value={formData.recommendedActions}
                onChange={(e) => setFormData(prev => ({ ...prev, recommendedActions: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="الإجراءات والتوصيات المطلوبة..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={saving}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'جاري الحفظ...' : 'حفظ التقييم'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}