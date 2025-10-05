import React from 'react';
import { Patient, Staff } from '../../../types';

interface SmartSocialWorkReportData {
  patient: Patient;
  assessor: Staff;
  formData: {
    dataSource: string[];
    maritalStatus: string;
    wivesCount: number;
    educationLevel: string;
    profession: string;
    socialNotes: string;
    housingType: string;
    housingOwnership: string;
    housingCondition: number;
    incomeSources: string[];
    incomeAmount: string;
    familyMembers: Array<{
      relation: string;
      relationBeforeIllness: string;
      relationAfterIllness: string;
    }>;
    psychologicalImpact: string[];
    physicalStatus: string[];
    assessmentSpeech: string;
    assessmentSight: string;
    assessmentHearing: string;
    assessmentMovement: string;
    equipmentNeeds: string[];
    interventionSummary: string;
    educationStatus: string;
  };
}

interface SmartSocialWorkReportProps {
  data: SmartSocialWorkReportData;
  onClose: () => void;
}

const SmartSocialWorkReport: React.FC<SmartSocialWorkReportProps> = ({ data, onClose }) => {
  const { patient, assessor, formData } = data;

  // Get current date in both formats
  const currentDate = new Date();
  const englishDate = currentDate.toLocaleDateString('en-US');
  const arabicDate = currentDate.toLocaleDateString('ar-SA-u-ca-islamic');
  const hijriDate = currentDate.toLocaleDateString('ar-SA-u-ca-islamic');
  
  // Generate unique document ID
  const documentId = `SW-${patient.nationalId.slice(-4)}-${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}-${currentDate.getHours().toString().padStart(2, '0')}${currentDate.getMinutes().toString().padStart(2, '0')}`;
  
  // Patient demographics
  const patientAge = patient.dateOfBirth ? Math.floor((currentDate.getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 'غير محدد';
  const patientGender = patient.sex === 'Male' ? 'ذكر' : patient.sex === 'Female' ? 'أنثى' : 'غير محدد';

  // Smart narrative generators
  const generateMaritalStatusNarrative = () => {
    if (!formData.maritalStatus) return '';
    
    let narrative = `**الحالة الاجتماعية:** ${formData.maritalStatus}`;
    
    if (formData.maritalStatus === 'متزوج' && formData.wivesCount > 1) {
      narrative += `. تتكون أسرته من ${formData.wivesCount} زوجات`;
    }
    
    if (formData.familyMembers.length > 0) {
      narrative += `. **تكوين الأسرة:** تشمل الأسرة ${formData.familyMembers.length} أفراد من الأقارب المباشرين`;
      
      const relationshipChanges = formData.familyMembers.filter(member => 
        member.relationBeforeIllness !== member.relationAfterIllness
      );
      
      if (relationshipChanges.length > 0) {
        narrative += `. لوحظ تغيير في ديناميكية العلاقات الأسرية لدى ${relationshipChanges.length} من أفراد الأسرة منذ بداية المرض`;
      }
    }
    
    return narrative + '.';
  };

  const generateHousingNarrative = () => {
    if (!formData.housingType) return '';
    
    let narrative = `**السكن:** يقيم المريض وأسرته في ${formData.housingType}`;
    
    if (formData.housingOwnership) {
      narrative += ` ${formData.housingOwnership === 'ملك' ? 'مملوك للأسرة' : 'بنظام الإيجار'}`;
    }
    
    const conditionText = ['سيئة جداً', 'سيئة', 'متوسطة', 'جيدة', 'ممتازة'][formData.housingCondition - 1];
    narrative += `. **حالة السكن:** تم تقييم حالة السكن بأنها ${conditionText} من حيث التهوية والإضاءة والملاءمة للحالة الصحية للمريض`;
    
    return narrative + '.';
  };

  const generateIncomeNarrative = () => {
    if (formData.incomeSources.length === 0) return '';
    
    let narrative = '**الوضع المادي:** ';
    
    if (formData.incomeSources.includes('لا يوجد دخل')) {
      narrative += 'تواجه الأسرة صعوبات مالية حادة حيث لا يوجد مصدر دخل ثابت، مما يؤثر بشكل مباشر على قدرتهم على توفير المستلزمات الطبية والمعيشية الأساسية';
    } else {
      const sources = formData.incomeSources.filter(s => s !== 'لا يوجد دخل');
      narrative += `تعتمد الأسرة على مصادر دخل متمثلة في: ${sources.join('، ')}`;
      
      if (formData.incomeAmount) {
        narrative += `. يقدر الدخل الشهري بحوالي ${formData.incomeAmount} ريال سعودي`;
      }
      
      if (formData.incomeSources.includes('ضمان اجتماعي')) {
        narrative += '. **التوصية:** تم التأكد من استمرار الدعم المالي من الضمان الاجتماعي وربط الحالة بالجمعيات الخيرية الداعمة';
      }
    }
    
    return narrative + '.';
  };

  const generatePsychologicalNarrative = () => {
    if (formData.psychologicalImpact.length === 0) {
      return '**الحالة النفسية:** لم تُلاحظ أي علامات واضحة للاضطراب النفسي الحاد، ويبدو المريض متقبلاً لوضعه الصحي في الوقت الحالي.';
    }
    
    let narrative = '**الحالة النفسية:** يُظهر المريض علامات واضحة من ';
    
    const impacts = formData.psychologicalImpact.map(impact => {
      const impactMap: Record<string, string> = {
        'انخفاض الروح المعنوية': 'انخفاض في الروح المعنوية',
        'يأس': 'شعور باليأس',
        'انطوائية': 'ميول انطوائية',
        'غضب وعصبية': 'نوبات غضب وعصبية',
        'قلة النوم': 'اضطرابات في النوم',
        'رهاب أو وسواس': 'أعراض الرهاب والوسواس',
        'عنف أو عدوانية': 'سلوكيات عدوانية',
        'إنكار المرض': 'إنكار للحالة المرضية',
        'اندفاعية': 'سلوكيات اندفاعية'
      };
      return impactMap[impact] || impact;
    });
    
    narrative += impacts.slice(0, -1).join('، ');
    if (impacts.length > 1) {
      narrative += ` و${impacts[impacts.length - 1]}`;
    } else {
      narrative += impacts[0];
    }
    
    narrative += ' نتيجة لحالته الصحية. **التدخل:** يتم متابعة الحالة النفسية عن كثب من قبل الفريق المعالج وتقديم الدعم النفسي المناسب';
    
    return narrative + '.';
  };

  const generatePhysicalNarrative = () => {
    if (formData.physicalStatus.length === 0) return '';
    
    let narrative = '**الحالة البدنية:** ';
    
    const statusMap: Record<string, string> = {
      'محدود القدرات': 'المريض لديه قدرات محدودة في الحركة',
      'يمشي بمساعدة': 'يحتاج المريض إلى مساعدة في المشي والتنقل',
      'يحتاج إشراف': 'يحتاج المريض إلى إشراف مستمر في الأنشطة اليومية',
      'طريح الفراش': 'المريض طريح الفراش بشكل كامل ويعتمد على الآخرين في جميع أنشطة الحياة اليومية',
      'غسيل كلوي': 'يخضع المريض لجلسات غسيل كلوي منتظمة',
      'قسطرة': 'يستخدم المريض قسطرة بولية',
      'عدم تحكم في الإخراج': 'يعاني المريض من عدم التحكم في الإخراج'
    };
    
    const descriptions = formData.physicalStatus.map(status => statusMap[status] || status);
    narrative += descriptions.join('، ');
    
    if (formData.physicalStatus.includes('طريح الفراش')) {
      narrative += '. **توصية هامة:** تم التأكيد على الأسرة بضرورة تغيير وضعية المريض كل ساعتين للوقاية من قرح الفراش وتحريك الأطراف بانتظام';
    }
    
    return narrative + '.';
  };

  const generateFunctionalAssessmentNarrative = () => {
    const assessments = [
      { key: 'assessmentSpeech', label: 'النطق', value: formData.assessmentSpeech },
      { key: 'assessmentSight', label: 'البصر', value: formData.assessmentSight },
      { key: 'assessmentHearing', label: 'السمع', value: formData.assessmentHearing },
      { key: 'assessmentMovement', label: 'الحركة', value: formData.assessmentMovement }
    ].filter(assessment => assessment.value);

    if (assessments.length === 0) return '';

    let narrative = '**القدرات الوظيفية:** ';
    
    const normalFunctions = assessments.filter(a => a.value === 'سليم' || a.value === 'كاملة');
    const impairedFunctions = assessments.filter(a => a.value !== 'سليم' && a.value !== 'كاملة');
    
    if (normalFunctions.length > 0) {
      narrative += `يتمتع المريض بقدرات طبيعية في ${normalFunctions.map(f => f.label).join('، ')}`;
    }
    
    if (impairedFunctions.length > 0) {
      if (normalFunctions.length > 0) narrative += '، ولكن ';
      narrative += 'يعاني من ';
      
      const impairmentDescriptions = impairedFunctions.map(func => {
        const severityMap: Record<string, string> = {
          'ضعف بسيط': 'ضعف بسيط',
          'ضعف شديد': 'ضعف شديد',
          'ضعف أطراف': 'ضعف في الأطراف',
          'شلل نصفي': 'شلل نصفي',
          'شلل رباعي': 'شلل رباعي'
        };
        return `${impairmentDescriptions[func.value] || func.value} في ${func.label}`;
      });
      
      narrative += impairmentDescriptions.join('، ');
    }
    
    return narrative + '.';
  };

  const generateEquipmentNarrative = () => {
    if (formData.equipmentNeeds.length === 0) return '';
    
    let narrative = '**احتياجات الدعم:** تم تحديد حاجة المريض إلى ';
    
    const equipmentMap: Record<string, string> = {
      'سرير طبي': 'سرير طبي مجهز',
      'مرتبة هوائية': 'مرتبة هوائية للوقاية من قرح الفراش',
      'كرسي متحرك': 'كرسي متحرك للتنقل',
      'كرسي حمام': 'كرسي حمام للاستحمام الآمن',
      'رافعة مريض': 'رافعة مريض لتسهيل النقل',
      'جهاز أكسجين': 'جهاز أكسجين للدعم التنفسي'
    };
    
    const equipment = formData.equipmentNeeds.map(item => equipmentMap[item] || item);
    narrative += equipment.join('، ');
    narrative += '. **الإجراء:** تم التنسيق مع الجهات المعنية لتوفير هذه المعدات في أسرع وقت ممكن';
    
    return narrative + '.';
  };

  const generateInterventionNarrative = () => {
    if (!formData.interventionSummary.trim()) return '';
    
    return `**ملخص التدخل الاجتماعي:** ${formData.interventionSummary}`;
  };

  const generateEducationNarrative = () => {
    if (!formData.educationStatus) return '';
    
    if (formData.educationStatus === 'تم التثقيف') {
      return '**التثقيف والتوعية:** تم تقديم جلسات تثقيفية شاملة للمريض وأسرته حول طبيعة المرض وطرق العناية المنزلية المناسبة. أظهرت الأسرة فهماً جيداً للتوجيهات المقدمة والتزاماً بتطبيقها.';
    } else {
      return '**التثقيف والتوعية:** تم تحديد الحاجة لجلسات تثقيفية إضافية للمريض وأسرته في الزيارات القادمة لضمان الفهم الكامل لطرق العناية المنزلية المطلوبة.';
    }
  };

  const generateRecommendations = () => {
    const recommendations = [];
    
    if (formData.incomeSources.includes('لا يوجد دخل')) {
      recommendations.push('ربط الأسرة بمصادر الدعم المالي والجمعيات الخيرية');
    }
    
    if (formData.psychologicalImpact.length > 0) {
      recommendations.push('متابعة الحالة النفسية مع الطبيب النفسي المختص');
    }
    
    if (formData.physicalStatus.includes('طريح الفراش')) {
      recommendations.push('تدريب الأسرة على تقنيات الوقاية من قرح الفراش');
    }
    
    if (formData.equipmentNeeds.length > 0) {
      recommendations.push('متابعة توفير الأجهزة الطبية المطلوبة');
    }
    
    if (formData.educationStatus === 'يحتاج تثقيف لاحق') {
      recommendations.push('جدولة جلسات تثقيفية إضافية في الزيارات القادمة');
    }
    
    return recommendations;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-page { 
            margin: 0 !important; 
            padding: 20px !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: none !important;
            background: white !important;
          }
          .print-header {
            background: linear-gradient(135deg, #059669 0%, #0369a1 100%) !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-no-break { 
            page-break-inside: avoid !important; 
            break-inside: avoid !important;
          }
          .signature-line {
            border-bottom: 2px solid #374151 !important;
            height: 60px !important;
            margin-bottom: 8px !important;
          }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
            direction: rtl !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        
        .signature-line {
          border-bottom: 2px solid #d1d5db;
          height: 40px;
          margin-bottom: 8px;
        }
      `}</style>
      
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 no-print">
          <h2 className="text-2xl font-bold text-gray-900">تقرير التقييم الاجتماعي</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              طباعة التقرير
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="print-page max-w-none mx-auto bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
            
            {/* Report Header */}
            <div className="print-header bg-gradient-to-r from-green-700 via-green-600 to-blue-700 text-white p-8 mb-6 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-6">
                    {/* Official Logos */}
                    <div className="flex flex-col items-center gap-3">
                      {/* Saudi MOH Logo */}
                      <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center shadow-2xl border-4 border-green-200">
                        <div className="text-center">
                          <div className="text-green-600 text-3xl font-bold mb-1">🇸🇦</div>
                          <div className="text-xs text-green-700 font-bold">وزارة الصحة</div>
                          <div className="text-xs text-green-600">MOH</div>
                        </div>
                      </div>
                      {/* Hospital Logo */}
                      <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-xl border-2 border-blue-200">
                        <div className="text-center">
                          <div className="text-blue-600 font-bold text-lg">🏥</div>
                          <div className="text-xs text-blue-700 font-bold">مستشفى</div>
                          <div className="text-xs text-blue-600">KAH</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hospital Information */}
                    <div className="text-white">
                      <h1 className="text-3xl font-bold mb-2 drop-shadow-lg">مستشفى الملك عبدالله - بيشه</h1>
                      <h2 className="text-xl text-green-100 mb-3">King Abdullah Hospital - Bisha</h2>
                      <div className="space-y-1 text-sm">
                        <p className="text-green-200 font-semibold">
                          قسم الرعاية الصحية المنزلية | Home Healthcare Division
                        </p>
                        <p className="text-blue-200">
                          تجمع عسير الصحي | Aseer Health Cluster
                        </p>
                        <p className="text-green-100 text-xs">
                          المملكة العربية السعودية | Kingdom of Saudi Arabia
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Document Info Panel */}
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-xl">
                    <div className="text-center text-white">
                      <p className="text-sm text-green-100 mb-2">تاريخ التقييم | Assessment Date</p>
                      <p className="font-bold text-xl mb-1">{englishDate}</p>
                      <p className="text-sm text-blue-200">{arabicDate}</p>
                    </div>
                  </div>
                </div>
                
                {/* Report Title */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h2 className="text-2xl font-bold text-center mb-2">تقرير التقييم الاجتماعي الشامل</h2>
                  <p className="text-green-100 text-center text-lg">Comprehensive Social Work Assessment Report</p>
                  <div className="text-center mt-3">
                    <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold">
                      مُولد آلياً | AI Generated Report
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Information */}
            <div className="patient-info bg-gradient-to-br from-blue-50 via-white to-green-50 p-8 rounded-xl mb-6 border-2 border-blue-200 shadow-lg print-no-break">
              <h3 className="font-bold text-xl text-gray-800 mb-6 border-b-2 border-blue-300 pb-3 flex items-center gap-3">
                <span className="w-4 h-4 bg-gradient-to-r from-blue-600 to-green-600 rounded-full"></span>
                معلومات المريض والتقييم | Patient & Assessment Information
              </h3>
              
              {/* Patient Demographics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 text-sm">
                <div className="bg-white p-4 rounded-lg border-r-4 border-blue-500 shadow-sm">
                  <span className="font-semibold text-gray-600 block mb-2">الاسم الكامل | Full Name</span>
                  <p className="font-bold text-blue-900 text-lg">{patient.nameAr}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-r-4 border-green-500 shadow-sm">
                  <span className="font-semibold text-gray-600 block mb-2">رقم الهوية | National ID</span>
                  <p className="font-bold text-green-900 font-mono">{patient.nationalId}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-r-4 border-purple-500 shadow-sm">
                  <span className="font-semibold text-gray-600 block mb-2">العمر | Age</span>
                  <p className="font-bold text-purple-900">{patientAge} سنة</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-r-4 border-pink-500 shadow-sm">
                  <span className="font-semibold text-gray-600 block mb-2">الجنس | Gender</span>
                  <p className="font-bold text-pink-900">{patientGender}</p>
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 text-sm">
                <div className="bg-white p-4 rounded-lg border-r-4 border-orange-500 shadow-sm">
                  <span className="font-semibold text-gray-600 block mb-2">رقم الجوال | Phone Number</span>
                  <p className="font-bold text-orange-900 font-mono">{patient.phone || 'غير متوفر'}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-r-4 border-teal-500 shadow-sm">
                  <span className="font-semibold text-gray-600 block mb-2">المنطقة | Area</span>
                  <p className="font-bold text-teal-900">{patient.areaId || 'غير محدد'}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-r-4 border-cyan-500 shadow-sm">
                  <span className="font-semibold text-gray-600 block mb-2">تاريخ الادخال | Admission Date</span>
                  <p className="font-bold text-cyan-900">
                    {patient.admissionDate ? new Date(patient.admissionDate).toLocaleDateString('ar-SA') : 'غير محدد'}
                  </p>
                </div>
              </div>
              
              {/* Assessor Information */}
              <div className="bg-gradient-to-r from-indigo-100 to-blue-100 p-4 rounded-lg border border-indigo-200">
                <div className="text-center text-sm">
                  <p className="font-bold text-indigo-900 text-lg">{assessor.الاسم}</p>
                  <p className="text-indigo-700">{assessor.المهنة}</p>
                  <p className="text-indigo-600">قسم الرعاية الصحية المنزلية</p>
                  <p className="text-indigo-600">مستشفى الملك عبدالله - بيشه</p>
                </div>
              </div>
            </div>

            {/* Assessment Content */}
            <div className="space-y-6 text-gray-800 leading-relaxed">
              
              {/* Social Status Section */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 print-no-break">
                <h3 className="font-bold text-lg text-blue-800 mb-4 border-b border-blue-300 pb-2">
                  Social Assessment | التقييم الاجتماعي
                </h3>
                <div className="space-y-4 text-base">
                  {generateMaritalStatusNarrative() && (
                    <p className="leading-relaxed">{generateMaritalStatusNarrative()}</p>
                  )}
                  
                  {formData.educationLevel && (
                    <p className="leading-relaxed">
                      <strong>المستوى التعليمي:</strong> {formData.educationLevel}. 
                      <strong>المهنة:</strong> {formData.profession || 'غير محدد'}.
                    </p>
                  )}
                  
                  {formData.socialNotes && (
                    <p className="leading-relaxed bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                      <strong>ملاحظات اجتماعية إضافية:</strong> {formData.socialNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* Housing & Financial Status */}
              <div className="bg-green-50 rounded-lg p-6 border border-green-200 print-no-break">
                <h3 className="font-bold text-lg text-green-800 mb-4 border-b border-green-300 pb-2">
                  Housing & Financial Status | السكن والوضع المالي
                </h3>
                <div className="space-y-4 text-base">
                  {generateHousingNarrative() && (
                    <p className="leading-relaxed">{generateHousingNarrative()}</p>
                  )}
                  
                  {generateIncomeNarrative() && (
                    <p className="leading-relaxed">{generateIncomeNarrative()}</p>
                  )}
                </div>
              </div>

              {/* Family Composition */}
              {formData.familyMembers.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-200 print-no-break">
                  <h3 className="font-bold text-lg text-purple-800 mb-4 border-b border-purple-300 pb-2">
                    Family Composition | تكوين الأسرة
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-purple-100">
                          <th className="border border-purple-300 p-3 text-right">صلة القرابة</th>
                          <th className="border border-purple-300 p-3 text-right">العلاقة قبل المرض</th>
                          <th className="border border-purple-300 p-3 text-right">العلاقة بعد المرض</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.familyMembers.map((member, index) => (
                          <tr key={index} className="bg-white">
                            <td className="border border-purple-300 p-3">{member.relation}</td>
                            <td className="border border-purple-300 p-3">{member.relationBeforeIllness}</td>
                            <td className="border border-purple-300 p-3">{member.relationAfterIllness}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Psychological & Physical Assessment */}
              <div className="bg-red-50 rounded-lg p-6 border border-red-200 print-no-break">
                <h3 className="font-bold text-lg text-red-800 mb-4 border-b border-red-300 pb-2">
                  Psychological & Physical Status | الحالة النفسية والبدنية
                </h3>
                <div className="space-y-4 text-base">
                  {generatePsychologicalNarrative() && (
                    <p className="leading-relaxed">{generatePsychologicalNarrative()}</p>
                  )}
                  
                  {generatePhysicalNarrative() && (
                    <p className="leading-relaxed">{generatePhysicalNarrative()}</p>
                  )}
                  
                  {generateFunctionalAssessmentNarrative() && (
                    <p className="leading-relaxed">{generateFunctionalAssessmentNarrative()}</p>
                  )}
                </div>
              </div>

              {/* Equipment & Support Needs */}
              {generateEquipmentNarrative() && (
                <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200 print-no-break">
                  <h3 className="font-bold text-lg text-indigo-800 mb-4 border-b border-indigo-300 pb-2">
                    Equipment & Support Needs | احتياجات الدعم والأجهزة
                  </h3>
                  <p className="leading-relaxed text-base">{generateEquipmentNarrative()}</p>
                </div>
              )}

              {/* Intervention Summary */}
              {generateInterventionNarrative() && (
                <div className="bg-orange-50 rounded-lg p-6 border border-orange-200 print-no-break">
                  <h3 className="font-bold text-lg text-orange-800 mb-4 border-b border-orange-300 pb-2">
                    Social Work Intervention | التدخل الاجتماعي
                  </h3>
                  <p className="leading-relaxed text-base whitespace-pre-line">{generateInterventionNarrative()}</p>
                </div>
              )}

              {/* Education Status */}
              {generateEducationNarrative() && (
                <div className="bg-teal-50 rounded-lg p-6 border border-teal-200 print-no-break">
                  <h3 className="font-bold text-lg text-teal-800 mb-4 border-b border-teal-300 pb-2">
                    Patient & Family Education | تثقيف المريض والأسرة
                  </h3>
                  <p className="leading-relaxed text-base">{generateEducationNarrative()}</p>
                </div>
              )}

              {/* Recommendations */}
              {generateRecommendations().length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 print-no-break">
                  <h3 className="font-bold text-lg text-gray-800 mb-4 border-b border-gray-300 pb-2">
                    Recommendations & Follow-up | التوصيات والمتابعة
                  </h3>
                  <ul className="space-y-2 text-base">
                    {generateRecommendations().map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span className="leading-relaxed">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Signature Section */}
            <div className="signature-section mt-8 p-6 border-t border-gray-300 print-no-break">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="signature-line"></div>
                  <div className="signature-label mt-2 text-center">
                    <p className="font-bold text-lg">{assessor.الاسم}</p>
                    <p className="text-sm text-gray-600">{assessor.المهنة}</p>
                    <p className="text-sm text-gray-600">قسم الرعاية الصحية المنزلية</p>
                    <p className="text-sm text-gray-600">مستشفى الملك عبدالله - بيشه</p>
                  </div>
                </div>
                <div>
                  <div className="signature-line"></div>
                  <div className="signature-label mt-2 text-center">
                    <p className="font-semibold">التاريخ</p>
                    <p className="text-sm text-gray-600">{arabicDate}</p>
                    <p className="text-sm text-gray-600">Date</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="print-footer text-center text-sm text-gray-600 mt-8 pt-4 border-t border-gray-200">
              <p>مستشفى الملك عبدالله - بيشه | King Abdullah Hospital - Bisha</p>
              <p className="text-xs mt-2">قسم الرعاية الصحية المنزلية | Home Healthcare Division</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default SmartSocialWorkReport;