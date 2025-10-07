import React, { useState } from 'react';
import { Save, X, Activity, Target, FileText } from 'lucide-react';
import { repo } from '../../data/local/repo';

interface EnhancedPTAssessmentFormProps {
  isOpen: boolean;
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EnhancedPTAssessmentForm({ isOpen, patientId, onClose, onSuccess }: EnhancedPTAssessmentFormProps) {
  const [formData, setFormData] = useState({
    // الحالة العامة والعلامات الحيوية
    generalCondition: 'مستقر',
    vitals: {
      hr: '',
      bp: '',
      rr: '',
      temp: '',
      spo2: '',
      pain: '0',
    },

    // التقييم الحركي المفصل
    mobility: {
      bedMobility: 'مستقل',
      transfers: 'مستقل',
      ambulation: 'مستقل',
      assistiveDevice: 'لا يوجد',
      walkingDistance: 'أكثر من 100 متر',
      balance: 'جيد',
      fallRisk: 'منخفض',
    },

    // تقييم المفاصل والعضلات (ROM/MMT)
    romMmtAssessment: [
      { joint: 'الكتف الأيمن', rom: '', mmt: '5', limitations: '' },
      { joint: 'الكتف الأيسر', rom: '', mmt: '5', limitations: '' },
      { joint: 'الكوع الأيمن', rom: '', mmt: '5', limitations: '' },
      { joint: 'الكوع الأيسر', rom: '', mmt: '5', limitations: '' },
      { joint: 'الفخذ الأيمن', rom: '', mmt: '5', limitations: '' },
      { joint: 'الفخذ الأيسر', rom: '', mmt: '5', limitations: '' },
      { joint: 'الركبة اليمنى', rom: '', mmt: '5', limitations: '' },
      { joint: 'الركبة اليسرى', rom: '', mmt: '5', limitations: '' },
      { joint: 'الكاحل الأيمن', rom: '', mmt: '5', limitations: '' },
      { joint: 'الكاحل الأيسر', rom: '', mmt: '5', limitations: '' },
    ],

    // المشاكل الحالية والأهداف
    primaryProblems: [],
    functionalLimitations: [],
    rehabilitationGoals: {
      shortTerm: [],
      longTerm: [],
    },

    // التدخلات العلاجية
    interventions: {
      exercises: [],
      modalities: [],
      education: [],
    },

    // خطة العلاج
    treatmentPlan: {
      frequency: 'مرتين أسبوعياً',
      duration: '4-6 أسابيع',
      location: 'منزلي',
      precautions: [],
    },

    // تقييم التقدم
    progressIndicators: [],
    homeExerciseProgram: '',
    familyEducation: '',

    // نوت إضافي
    additionalNotes: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCheckboxChange = (section: string, item: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].includes(item)
        ? prev[section].filter((i: string) => i !== item)
        : [...prev[section], item]
    }));
  };

  const handleNestedCheckboxChange = (section: string, subsection: string, item: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: prev[section][subsection].includes(item)
          ? prev[section][subsection].filter((i: string) => i !== item)
          : [...prev[section][subsection], item]
      }
    }));
  };

  const handleRomMmtChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      romMmtAssessment: prev.romMmtAssessment.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      // إنشاء نوت مفصل للتقييم
      const assessmentNote = `
تقييم العلاج الطبيعي - تقييم شامل

الحالة العامة: ${formData.generalCondition}

العلامات الحيوية:
• النبض: ${formData.vitals.hr || 'غير مسجل'} نبضة/دقيقة
• ضغط الدم: ${formData.vitals.bp || 'غير مسجل'} mmHg
• التنفس: ${formData.vitals.rr || 'غير مسجل'} نفس/دقيقة
• درجة الحرارة: ${formData.vitals.temp || 'غير مسجل'} °C
• الأكسجين: ${formData.vitals.spo2 || 'غير مسجل'}%
• الألم: ${formData.vitals.pain}/10

التقييم الحركي:
• الحركة في السرير: ${formData.mobility.bedMobility}
• الانتقالات: ${formData.mobility.transfers}
• المشي: ${formData.mobility.ambulation}
• المساعدات: ${formData.mobility.assistiveDevice}
• مسافة المشي: ${formData.mobility.walkingDistance}
• التوازن: ${formData.mobility.balance}
• خطر السقوط: ${formData.mobility.fallRisk}

تقييم المفاصل والعضلات (ROM/MMT):
${formData.romMmtAssessment.map(item => 
  `• ${item.joint}: ROM ${item.rom || 'طبيعي'}, MMT ${item.mmt}/5${item.limitations ? ` (محدودية: ${item.limitations})` : ''}`
).join('\n')}

المشاكل الأساسية:
${formData.primaryProblems.length > 0 ? formData.primaryProblems.map(p => `• ${p}`).join('\n') : '• لا توجد مشاكل محددة'}

القيود الوظيفية:
${formData.functionalLimitations.length > 0 ? formData.functionalLimitations.map(l => `• ${l}`).join('\n') : '• لا توجد قيود وظيفية'}

أهداف إعادة التأهيل:

أهداف قصيرة المدى (2-4 أسابيع):
${formData.rehabilitationGoals.shortTerm.length > 0 ? formData.rehabilitationGoals.shortTerm.map(g => `• ${g}`).join('\n') : '• لم يتم تحديد أهداف قصيرة'}

أهداف طويلة المدى (1-3 أشهر):
${formData.rehabilitationGoals.longTerm.length > 0 ? formData.rehabilitationGoals.longTerm.map(g => `• ${g}`).join('\n') : '• لم يتم تحديد أهداف طويلة'}

التدخلات العلاجية:

التمارين العلاجية:
${formData.interventions.exercises.length > 0 ? formData.interventions.exercises.map(e => `• ${e}`).join('\n') : '• لم يتم تطبيق تمارين بعد'}

الوسائل العلاجية:
${formData.interventions.modalities.length > 0 ? formData.interventions.modalities.map(m => `• ${m}`).join('\n') : '• لم يتم استخدام وسائل علاجية'}

التثقيف والتوجيه:
${formData.interventions.education.length > 0 ? formData.interventions.education.map(e => `• ${e}`).join('\n') : '• لم يتم تقديم تثقيف بعد'}

خطة العلاج:
• التكرار: ${formData.treatmentPlan.frequency}
• المدة المتوقعة: ${formData.treatmentPlan.duration}
• مكان العلاج: ${formData.treatmentPlan.location}
• الاحتياطات: ${formData.treatmentPlan.precautions.length > 0 ? formData.treatmentPlan.precautions.join(', ') : 'لا توجد احتياطات خاصة'}

مؤشرات التقدم المطلوبة:
${formData.progressIndicators.length > 0 ? formData.progressIndicators.map(p => `• ${p}`).join('\n') : '• سيتم تحديدها في الجلسات القادمة'}

برنامج التمارين المنزلية:
${formData.homeExerciseProgram || 'سيتم إعداد برنامج مخصص في الجلسة القادمة'}

تثقيف العائلة:
${formData.familyEducation || 'سيتم تقديم التوجيهات المناسبة للأسرة'}

${formData.additionalNotes ? `\nملاحظات إضافية:\n${formData.additionalNotes}` : ''}

تم التقييم بواسطة: أخصائي العلاج الطبيعي
التاريخ: ${new Date().toLocaleDateString('ar-SA')}
      `.trim();

      // حفظ النوت
      await repo.addNote({
        patientId,
        type: 'assessment',
        authorRole: 'PT',
        authorName: 'أخصائي العلاج الطبيعي',
        text: assessmentNote,
        tags: ['علاج طبيعي', 'تقييم شامل', 'خطة علاج'],
      });

      onSuccess();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const primaryProblemsOptions = [
    'ضعف عضلي عام', 'تيبس مفصلي', 'آلام مزمنة', 'اضطراب التوازن',
    'صعوبة المشي', 'اضطراب الوضعية', 'ضعف التحمل', 'مشاكل التنقل',
    'خطر السقوط', 'ضعف الوظائف الحركية', 'مشاكل التنفس', 'أخرى'
  ];

  const functionalLimitationsOptions = [
    'صعوبة النهوض من السرير', 'صعوبة الجلوس والقيام', 'مشاكل صعود الدرج',
    'صعوبة المشي لمسافات طويلة', 'مشاكل الاستحمام', 'صعوبة ارتداء الملابس',
    'مشاكل استخدام المرحاض', 'صعوبة الوصول للأشياء', 'مشاكل القيادة'
  ];

  const shortTermGoalsOptions = [
    'تحسين قوة العضلات', 'زيادة مدى الحركة', 'تحسين التوازن',
    'تقليل الألم', 'تحسين القدرة على المشي', 'تحسين التحمل',
    'تحسين الوضعية', 'تقليل خطر السقوط'
  ];

  const longTermGoalsOptions = [
    'استقلالية كاملة في المشي', 'العودة للأنشطة اليومية',
    'تحسين جودة الحياة', 'منع تدهور الحالة', 'العودة للعمل',
    'ممارسة الرياضة', 'استقلالية في الرعاية الذاتية'
  ];

  const exercisesOptions = [
    'تمارين التقوية', 'تمارين الإطالة', 'تمارين التوازن',
    'تمارين التحمل', 'تمارين التنفس', 'تمارين الوضعية',
    'تمارين المشي', 'تمارين الوظائف الحركية'
  ];

  const modalitiesOptions = [
    'العلاج بالحرارة', 'العلاج بالبرودة', 'التحفيز الكهربائي',
    'الموجات فوق الصوتية', 'العلاج بالليزر', 'التدليك العلاجي',
    'العلاج المائي', 'الوخز بالإبر'
  ];

  const educationOptions = [
    'تعليم التمارين المنزلية', 'تعليم الوضعيات الصحيحة',
    'تعليم تقنيات الحماية', 'تعليم استخدام المساعدات',
    'تعليم برنامج المشي', 'تعليم تقنيات التنفس',
    'تعليم الوقاية من السقوط', 'تعليم إدارة الألم'
  ];

  const precautionsOptions = [
    'تجنب الحركات السريعة', 'تجنب الأوضاع المؤلمة',
    'عدم حمل أوزان ثقيلة', 'استخدام المساعدات',
    'تجنب الأسطح الزلقة', 'مراقبة ضغط الدم',
    'أخذ فترات راحة', 'مراقبة الألم'
  ];

  const progressIndicatorsOptions = [
    'زيادة قوة العضلات', 'تحسن مدى الحركة', 'تحسن التوازن',
    'انخفاض مستوى الألم', 'زيادة مسافة المشي', 'تحسن الوظائف اليومية',
    'زيادة الثقة بالنفس', 'تحسن جودة النوم'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            تقييم العلاج الطبيعي الشامل
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* الحالة العامة والعلامات الحيوية */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">الحالة العامة والعلامات الحيوية</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحالة العامة</label>
              <select
                value={formData.generalCondition}
                onChange={(e) => setFormData(prev => ({ ...prev, generalCondition: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="مستقر">مستقر</option>
                <option value="تحسن">تحسن</option>
                <option value="تراجع">تراجع</option>
                <option value="حرج">حرج</option>
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">النبض</label>
                <input
                  type="number"
                  value={formData.vitals.hr}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    vitals: { ...prev.vitals, hr: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="70"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ضغط الدم</label>
                <input
                  type="text"
                  value={formData.vitals.bp}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    vitals: { ...prev.vitals, bp: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="120/80"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التنفس</label>
                <input
                  type="number"
                  value={formData.vitals.rr}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    vitals: { ...prev.vitals, rr: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="18"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الحرارة</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.vitals.temp}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    vitals: { ...prev.vitals, temp: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="36.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الأكسجين %</label>
                <input
                  type="number"
                  value={formData.vitals.spo2}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    vitals: { ...prev.vitals, spo2: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="98"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الألم (0-10)</label>
                <select
                  value={formData.vitals.pain}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    vitals: { ...prev.vitals, pain: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {[0,1,2,3,4,5,6,7,8,9,10].map(num => (
                    <option key={num} value={num.toString()}>{num}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* التقييم الحركي */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">التقييم الحركي المفصل</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الحركة في السرير</label>
                <select
                  value={formData.mobility.bedMobility}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    mobility: { ...prev.mobility, bedMobility: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="مستقل">مستقل</option>
                  <option value="يحتاج مساعدة قليلة">يحتاج مساعدة قليلة</option>
                  <option value="يحتاج مساعدة متوسطة">يحتاج مساعدة متوسطة</option>
                  <option value="يحتاج مساعدة كاملة">يحتاج مساعدة كاملة</option>
                  <option value="معتمد كلياً">معتمد كلياً</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الانتقالات</label>
                <select
                  value={formData.mobility.transfers}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    mobility: { ...prev.mobility, transfers: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="مستقل">مستقل</option>
                  <option value="يحتاج إشراف">يحتاج إشراف</option>
                  <option value="يحتاج مساعدة قليلة">يحتاج مساعدة قليلة</option>
                  <option value="يحتاج مساعدة متوسطة">يحتاج مساعدة متوسطة</option>
                  <option value="يحتاج مساعدة كاملة">يحتاج مساعدة كاملة</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المشي</label>
                <select
                  value={formData.mobility.ambulation}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    mobility: { ...prev.mobility, ambulation: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="مستقل">مستقل</option>
                  <option value="مع عصا">مع عصا</option>
                  <option value="مع جهاز مشي">مع جهاز مشي</option>
                  <option value="مع كرسي متحرك">مع كرسي متحرك</option>
                  <option value="غير قادر">غير قادر</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الأجهزة المساعدة</label>
                <select
                  value={formData.mobility.assistiveDevice}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    mobility: { ...prev.mobility, assistiveDevice: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="لا يوجد">لا يوجد</option>
                  <option value="عصا">عصا</option>
                  <option value="عكازات">عكازات</option>
                  <option value="جهاز مشي">جهاز مشي</option>
                  <option value="كرسي متحرك">كرسي متحرك</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مسافة المشي</label>
                <select
                  value={formData.mobility.walkingDistance}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    mobility: { ...prev.mobility, walkingDistance: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="أكثر من 100 متر">أكثر من 100 متر</option>
                  <option value="50-100 متر">50-100 متر</option>
                  <option value="20-50 متر">20-50 متر</option>
                  <option value="أقل من 20 متر">أقل من 20 متر</option>
                  <option value="غير قادر">غير قادر</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التوازن</label>
                <select
                  value={formData.mobility.balance}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    mobility: { ...prev.mobility, balance: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ممتاز">ممتاز</option>
                  <option value="جيد">جيد</option>
                  <option value="متوسط">متوسط</option>
                  <option value="ضعيف">ضعيف</option>
                  <option value="سيء جداً">سيء جداً</option>
                </select>
              </div>
            </div>
          </div>

          {/* المشاكل الأساسية */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">المشاكل الأساسية المحددة</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {primaryProblemsOptions.map((problem) => (
                <label key={problem} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.primaryProblems.includes(problem)}
                    onChange={() => handleCheckboxChange('primaryProblems', problem)}
                    className="mr-2"
                  />
                  <span className="text-sm">{problem}</span>
                </label>
              ))}
            </div>
          </div>

          {/* القيود الوظيفية */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">القيود الوظيفية</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {functionalLimitationsOptions.map((limitation) => (
                <label key={limitation} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.functionalLimitations.includes(limitation)}
                    onChange={() => handleCheckboxChange('functionalLimitations', limitation)}
                    className="mr-2"
                  />
                  <span className="text-sm">{limitation}</span>
                </label>
              ))}
            </div>
          </div>

          {/* أهداف إعادة التأهيل */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              أهداف إعادة التأهيل
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-gray-700 mb-3">أهداف قصيرة المدى (2-4 أسابيع)</h5>
                <div className="space-y-2">
                  {shortTermGoalsOptions.map((goal) => (
                    <label key={goal} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.rehabilitationGoals.shortTerm.includes(goal)}
                        onChange={() => handleNestedCheckboxChange('rehabilitationGoals', 'shortTerm', goal)}
                        className="mr-2"
                      />
                      <span className="text-sm">{goal}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-700 mb-3">أهداف طويلة المدى (1-3 أشهر)</h5>
                <div className="space-y-2">
                  {longTermGoalsOptions.map((goal) => (
                    <label key={goal} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.rehabilitationGoals.longTerm.includes(goal)}
                        onChange={() => handleNestedCheckboxChange('rehabilitationGoals', 'longTerm', goal)}
                        className="mr-2"
                      />
                      <span className="text-sm">{goal}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* التدخلات العلاجية */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">التدخلات العلاجية</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h5 className="font-medium text-gray-700 mb-3">التمارين العلاجية</h5>
                <div className="space-y-2">
                  {exercisesOptions.map((exercise) => (
                    <label key={exercise} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.interventions.exercises.includes(exercise)}
                        onChange={() => handleNestedCheckboxChange('interventions', 'exercises', exercise)}
                        className="mr-2"
                      />
                      <span className="text-sm">{exercise}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-700 mb-3">الوسائل العلاجية</h5>
                <div className="space-y-2">
                  {modalitiesOptions.map((modality) => (
                    <label key={modality} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.interventions.modalities.includes(modality)}
                        onChange={() => handleNestedCheckboxChange('interventions', 'modalities', modality)}
                        className="mr-2"
                      />
                      <span className="text-sm">{modality}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-700 mb-3">التثقيف والتوجيه</h5>
                <div className="space-y-2">
                  {educationOptions.map((education) => (
                    <label key={education} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.interventions.education.includes(education)}
                        onChange={() => handleNestedCheckboxChange('interventions', 'education', education)}
                        className="mr-2"
                      />
                      <span className="text-sm">{education}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* برنامج التمارين المنزلية */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">برنامج التمارين المنزلية</h4>
            <textarea
              value={formData.homeExerciseProgram}
              onChange={(e) => setFormData(prev => ({ ...prev, homeExerciseProgram: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="اكتب تفاصيل برنامج التمارين المنزلية المخصص للمريض..."
            />
          </div>

          {/* تثقيف العائلة */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">تثقيف وتوجيه العائلة</h4>
            <textarea
              value={formData.familyEducation}
              onChange={(e) => setFormData(prev => ({ ...prev, familyEducation: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="التوجيهات والنصائح المقدمة للعائلة..."
            />
          </div>

          {/* ملاحظات إضافية */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              ملاحظات إضافية
            </h4>
            <textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="أي ملاحظات إضافية مهمة..."
            />
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