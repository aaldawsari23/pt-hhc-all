/**
 * Smart Narrative Generator for Social Work Assessment Reports
 * Converts simple clicks and selections into professional, detailed Arabic narratives
 */

export interface SmartFormData {
  dataSource?: string[];
  maritalStatus: string;
  wivesCount: number;
  educationLevel: string;
  profession: string;
  socialNotes: string;
  housingType: string;
  housingOwnership: string;
  housingCondition: number;
  incomeSources?: string[];
  incomeAmount: string;
  familyMembers?: Array<{
    relation: string;
    relationBeforeIllness: string;
    relationAfterIllness: string;
  }>;
  psychologicalImpact?: string[];
  physicalStatus?: string[];
  assessmentSpeech: string;
  assessmentSight: string;
  assessmentHearing: string;
  assessmentMovement: string;
  equipmentNeeds?: string[];
  interventionSummary: string;
  educationStatus: string;
}

export class SmartNarrativeGenerator {
  
  static generateMaritalStatusNarrative(formData: SmartFormData): string {
    if (!formData.maritalStatus) return '';
    
    let narrative = `**الحالة الاجتماعية:** ${formData.maritalStatus}`;
    
    if (formData.maritalStatus === 'متزوج' && formData.wivesCount > 1) {
      narrative += `. تتكون أسرته من ${formData.wivesCount} زوجات`;
    }
    
    if (formData.familyMembers?.length > 0) {
      narrative += `. **تكوين الأسرة:** تشمل الأسرة ${formData.familyMembers.length} أفراد من الأقارب المباشرين`;
      
      const relationshipChanges = formData.familyMembers.filter(member => 
        member.relationBeforeIllness !== member.relationAfterIllness
      );
      
      if (relationshipChanges.length > 0) {
        narrative += `. لوحظ تغيير في ديناميكية العلاقات الأسرية لدى ${relationshipChanges.length} من أفراد الأسرة منذ بداية المرض`;
        
        // Add specific details about relationship changes
        const worsenedRelations = relationshipChanges.filter(member => 
          (member.relationBeforeIllness === 'جيدة' && member.relationAfterIllness !== 'جيدة') ||
          (member.relationBeforeIllness === 'متوسطة' && member.relationAfterIllness === 'سيئة')
        );
        
        if (worsenedRelations.length > 0) {
          narrative += `. يُلاحظ تدهور في العلاقة مع بعض أفراد الأسرة مما يستدعي التدخل الاجتماعي المكثف`;
        }
      }
    }
    
    return narrative + '.';
  }

  static generateEducationProfessionNarrative(formData: SmartFormData): string {
    if (!formData.educationLevel && !formData.profession) return '';
    
    let narrative = '';
    
    if (formData.educationLevel) {
      const educationMap: Record<string, string> = {
        'أمي': 'لا يجيد القراءة والكتابة',
        'ابتدائي': 'حاصل على تعليم ابتدائي',
        'متوسط': 'حاصل على تعليم متوسط',
        'ثانوي': 'حاصل على تعليم ثانوي',
        'جامعي': 'حاصل على مؤهل جامعي'
      };
      
      narrative += `**المستوى التعليمي:** ${educationMap[formData.educationLevel] || formData.educationLevel}`;
    }
    
    if (formData.profession) {
      const professionMap: Record<string, string> = {
        'طالب': 'طالب في مرحلة التعليم',
        'موظف': 'يعمل كموظف',
        'عاطل': 'غير عامل حالياً',
        'متقاعد': 'متقاعد من العمل',
        'عامل': 'يعمل في الأعمال اليدوية',
        'ربة منزل': 'ربة منزل متفرغة'
      };
      
      if (narrative) narrative += '. ';
      narrative += `**المهنة:** ${professionMap[formData.profession] || formData.profession}`;
      
      // Add work-related implications
      if (formData.profession === 'عاطل') {
        narrative += '. يؤثر عدم وجود عمل على الوضع النفسي والمالي للمريض والأسرة';
      } else if (formData.profession === 'متقاعد') {
        narrative += '. يتلقى معاش تقاعد مما يوفر استقراراً مالياً نسبياً';
      }
    }
    
    return narrative ? narrative + '.' : '';
  }

  static generateHousingNarrative(formData: SmartFormData): string {
    if (!formData.housingType) return '';
    
    const housingTypeMap: Record<string, string> = {
      'فيلا': 'فيلا مستقلة',
      'شقة': 'شقة سكنية',
      'بيت شعبي': 'بيت شعبي تقليدي',
      'غرفة': 'غرفة واحدة',
      'سكن خيري': 'سكن خيري مدعوم',
      'بلا مسكن': 'لا يوجد مسكن ثابت'
    };
    
    let narrative = `**السكن:** يقيم المريض وأسرته في ${housingTypeMap[formData.housingType] || formData.housingType}`;
    
    if (formData.housingOwnership) {
      narrative += ` ${formData.housingOwnership === 'ملك' ? 'مملوك للأسرة' : 'بنظام الإيجار'}`;
    }
    
    // Housing condition assessment
    const conditionLabels = ['سيئة جداً', 'سيئة', 'متوسطة', 'جيدة', 'ممتازة'];
    const conditionText = conditionLabels[formData.housingCondition - 1] || 'غير محدد';
    
    narrative += `. **حالة السكن:** تم تقييم حالة السكن بأنها ${conditionText} من حيث التهوية والإضاءة والملاءمة للحالة الصحية للمريض`;
    
    // Add implications based on housing condition
    if (formData.housingCondition <= 2) {
      narrative += '. تم التأكيد على ضرورة تحسين الظروف السكنية لضمان بيئة صحية مناسبة للعلاج';
    } else if (formData.housingCondition >= 4) {
      narrative += '. البيئة السكنية مناسبة ومساعدة على عملية الشفاء والتعافي';
    }
    
    // Special cases
    if (formData.housingType === 'بلا مسكن') {
      narrative += '. **توصية عاجلة:** تم التنسيق مع الجهات المختصة لتوفير سكن مؤقت مناسب للحالة الصحية';
    }
    
    return narrative + '.';
  }

  static generateIncomeNarrative(formData: SmartFormData): string {
    if (formData.incomeSources?.length === 0) return '';
    
    let narrative = '**الوضع المادي:** ';
    
    if (formData.incomeSources.includes('لا يوجد دخل')) {
      narrative += 'تواجه الأسرة صعوبات مالية حادة حيث لا يوجد مصدر دخل ثابت، مما يؤثر بشكل مباشر على قدرتهم على توفير المستلزمات الطبية والمعيشية الأساسية';
      narrative += '. **التوصية العاجلة:** ربط الأسرة فوراً بمصادر الدعم المالي الحكومية والخيرية المتاحة';
    } else {
      const incomeSourceMap: Record<string, string> = {
        'راتب': 'راتب وظيفي',
        'تقاعد': 'معاش تقاعد',
        'ضمان اجتماعي': 'الضمان الاجتماعي',
        'أخرى': 'مصادر أخرى'
      };
      
      const sources = formData.incomeSources
        .filter(s => s !== 'لا يوجد دخل')
        .map(s => incomeSourceMap[s] || s);
      
      narrative += `تعتمد الأسرة على مصادر دخل متمثلة في: ${sources.join('، ')}`;
      
      if (formData.incomeAmount) {
        const amount = parseInt(formData.incomeAmount);
        narrative += `. يقدر الدخل الشهري بحوالي ${formData.incomeAmount} ريال سعودي`;
        
        // Financial adequacy assessment
        if (amount < 3000) {
          narrative += '. الدخل الحالي أقل من الحد الأدنى للمعيشة مما يستدعي البحث عن مصادر دعم إضافية';
        } else if (amount >= 3000 && amount < 6000) {
          narrative += '. الدخل يغطي الاحتياجات الأساسية مع ضرورة ترشيد الإنفاق والاستفادة من البرامج الداعمة';
        } else {
          narrative += '. الدخل مناسب نسبياً لتغطية احتياجات الأسرة والمتطلبات الطبية';
        }
      }
      
      // Specific recommendations based on income source
      if (formData.incomeSources.includes('ضمان اجتماعي')) {
        narrative += '. **المتابعة:** تم التأكد من استمرار الدعم المالي من الضمان الاجتماعي وربط الحالة بالجمعيات الخيرية الداعمة';
      }
      
      if (formData.incomeSources.includes('تقاعد')) {
        narrative += '. يوفر المعاش التقاعدي استقراراً مالياً نسبياً مع إمكانية الاستفادة من الخدمات المجانية للمتقاعدين';
      }
    }
    
    return narrative + '.';
  }

  static generatePsychologicalNarrative(formData: SmartFormData): string {
    if (formData.psychologicalImpact?.length === 0) {
      return '**الحالة النفسية:** لم تُلاحظ أي علامات واضحة للاضطراب النفسي الحاد، ويبدو المريض متقبلاً لوضعه الصحي في الوقت الحالي. يُنصح بالمتابعة الدورية للحالة النفسية.';
    }
    
    const impactMap: Record<string, { description: string; severity: 'mild' | 'moderate' | 'severe' }> = {
      'انخفاض الروح المعنوية': { description: 'انخفاض واضح في الروح المعنوية', severity: 'moderate' },
      'يأس': { description: 'شعور عميق باليأس وفقدان الأمل', severity: 'severe' },
      'انطوائية': { description: 'ميول انطوائية وتجنب التفاعل الاجتماعي', severity: 'moderate' },
      'غضب وعصبية': { description: 'نوبات غضب وحالات عصبية متكررة', severity: 'moderate' },
      'قلة النوم': { description: 'اضطرابات في النوم وأرق مستمر', severity: 'mild' },
      'رهاب أو وسواس': { description: 'أعراض الرهاب والوسواس القهري', severity: 'severe' },
      'عنف أو عدوانية': { description: 'سلوكيات عدوانية وميول عنيفة', severity: 'severe' },
      'إنكار المرض': { description: 'إنكار كامل للحالة المرضية ورفض العلاج', severity: 'severe' },
      'اندفاعية': { description: 'سلوكيات اندفاعية غير مدروسة', severity: 'moderate' }
    };
    
    let narrative = '**الحالة النفسية:** يُظهر المريض علامات واضحة من ';
    
    const impacts = formData.psychologicalImpact.map(impact => impactMap[impact]?.description || impact);
    
    // Build narrative
    if (impacts.length === 1) {
      narrative += impacts[0];
    } else if (impacts.length === 2) {
      narrative += `${impacts[0]} و${impacts[1]}`;
    } else {
      narrative += impacts.slice(0, -1).join('، ') + ` و${impacts[impacts.length - 1]}`;
    }
    
    narrative += ' نتيجة لحالته الصحية والضغوط المرتبطة بها';
    
    // Add severity assessment
    const severeSymptoms = formData.psychologicalImpact.filter(impact => 
      impactMap[impact]?.severity === 'severe'
    );
    
    if (severeSymptoms.length > 0) {
      narrative += '. **تقييم الخطورة:** تُعتبر الحالة النفسية خطيرة وتستدعي التدخل العاجل من المختصين';
      narrative += '. **التوصية الفورية:** إحالة عاجلة للطبيب النفسي المختص ومتابعة يومية للحالة';
    } else {
      narrative += '. **التدخل:** يتم متابعة الحالة النفسية عن كثب من قبل الفريق المعالج وتقديم الدعم النفسي المناسب';
    }
    
    // Add specific interventions based on symptoms
    if (formData.psychologicalImpact.includes('قلة النوم')) {
      narrative += '. تم تقديم توجيهات حول النظافة النومية والاسترخاء';
    }
    
    if (formData.psychologicalImpact.includes('انطوائية')) {
      narrative += '. يُنصح بالتفاعل الاجتماعي التدريجي والأنشطة الجماعية البسيطة';
    }
    
    return narrative + '.';
  }

  static generatePhysicalNarrative(formData: SmartFormData): string {
    if (formData.physicalStatus?.length === 0) return '';
    
    const statusMap: Record<string, { description: string; implications: string }> = {
      'محدود القدرات': { 
        description: 'يعاني من قدرات حركية محدودة', 
        implications: 'يحتاج لمساعدة في بعض الأنشطة اليومية' 
      },
      'يمشي بمساعدة': { 
        description: 'يحتاج إلى مساعدة ودعم للمشي والتنقل', 
        implications: 'ضرورة توفير أجهزة مساعدة للحركة وتأمين البيئة المحيطة' 
      },
      'يحتاج إشراف': { 
        description: 'يحتاج إلى إشراف مستمر في الأنشطة اليومية', 
        implications: 'وجود مرافق دائم أو نظام مراقبة مناسب' 
      },
      'طريح الفراش': { 
        description: 'طريح الفراش بشكل كامل ويعتمد على الآخرين في جميع أنشطة الحياة اليومية', 
        implications: 'عناية مكثفة والوقاية من المضاعفات كقرح الفراش' 
      },
      'غسيل كلوي': { 
        description: 'يخضع لجلسات غسيل كلوي منتظمة', 
        implications: 'جدولة النشاطات حول مواعيد الغسيل ومتابعة الحالة الصحية عن كثب' 
      },
      'قسطرة': { 
        description: 'يستخدم قسطرة بولية', 
        implications: 'عناية خاصة بالنظافة والوقاية من العدوى' 
      },
      'عدم تحكم في الإخراج': { 
        description: 'يعاني من عدم التحكم في الإخراج', 
        implications: 'استخدام الحفاضات الطبية والعناية بصحة الجلد' 
      }
    };
    
    let narrative = '**الحالة البدنية:** ';
    
    const descriptions = formData.physicalStatus.map(status => statusMap[status]?.description || status);
    narrative += descriptions.join('، ');
    
    // Add specific recommendations based on physical status
    narrative += '. **التوصيات الطبية:**';
    
    const recommendations: string[] = [];
    
    formData.physicalStatus.forEach(status => {
      const statusInfo = statusMap[status];
      if (statusInfo?.implications) {
        recommendations.push(statusInfo.implications);
      }
    });
    
    if (recommendations.length > 0) {
      narrative += ' ' + recommendations.join('، ');
    }
    
    // Special emphasis for bed-bound patients
    if (formData.physicalStatus.includes('طريح الفراش')) {
      narrative += '. **تنبيه هام:** تم التأكيد بشدة على الأسرة بضرورة تغيير وضعية المريض كل ساعتين للوقاية من قرح الفراش، مع تحريك الأطراف بانتظام وفحص الجلد يومياً';
    }
    
    return narrative + '.';
  }

  static generateFunctionalAssessmentNarrative(formData: SmartFormData): string {
    const assessments = [
      { key: 'assessmentSpeech', label: 'النطق', value: formData.assessmentSpeech },
      { key: 'assessmentSight', label: 'البصر', value: formData.assessmentSight },
      { key: 'assessmentHearing', label: 'السمع', value: formData.assessmentHearing },
      { key: 'assessmentMovement', label: 'الحركة', value: formData.assessmentMovement }
    ].filter(assessment => assessment.value);

    if (assessments.length === 0) return '';

    let narrative = '**تقييم القدرات الوظيفية:** ';
    
    const normalFunctions = assessments.filter(a => a.value === 'سليم' || a.value === 'كاملة');
    const mildImpairments = assessments.filter(a => a.value === 'ضعف بسيط');
    const severeImpairments = assessments.filter(a => a.value === 'ضعف شديد' || a.value.includes('شلل'));
    
    // Build comprehensive narrative
    if (normalFunctions.length > 0) {
      narrative += `يتمتع المريض بقدرات طبيعية وسليمة في ${normalFunctions.map(f => f.label).join('، ')}`;
    }
    
    if (mildImpairments.length > 0) {
      if (normalFunctions.length > 0) narrative += '، بينما ';
      narrative += `يعاني من ضعف بسيط في ${mildImpairments.map(f => f.label).join('، ')}`;
    }
    
    if (severeImpairments.length > 0) {
      if (normalFunctions.length > 0 || mildImpairments.length > 0) narrative += '، كما ';
      narrative += 'يعاني من ';
      
      const severeDescriptions = severeImpairments.map(func => {
        const severityMap: Record<string, string> = {
          'ضعف شديد': `ضعف شديد في ${func.label}`,
          'ضعف أطراف': 'ضعف في الأطراف',
          'شلل نصفي': 'شلل نصفي يؤثر على جانب واحد من الجسم',
          'شلل رباعي': 'شلل رباعي يؤثر على الأطراف الأربعة'
        };
        return severityMap[func.value] || `${func.value} في ${func.label}`;
      });
      
      narrative += severeDescriptions.join('، ');
    }
    
    // Add functional implications and recommendations
    if (severeImpairments.length > 0) {
      narrative += '. **الآثار الوظيفية:** هذه الإعاقات تؤثر بشكل كبير على الاستقلالية وتتطلب مساعدة مستمرة في الأنشطة اليومية';
      
      // Specific recommendations based on impairments
      if (formData.assessmentMovement.includes('شلل')) {
        narrative += '. **توصية إعادة التأهيل:** ضرورة إحالة المريض لبرنامج إعادة تأهيل شامل مع اختصاصي العلاج الطبيعي';
      }
      
      if (formData.assessmentSight === 'ضعف شديد') {
        narrative += '. **توصية البصر:** تقييم طبيب العيون وتوفير وسائل مساعدة بصرية مناسبة';
      }
      
      if (formData.assessmentHearing === 'ضعف شديد') {
        narrative += '. **توصية السمع:** تقييم اختصاصي السمع ودراسة إمكانية توفير سماعة طبية';
      }
    }
    
    return narrative + '.';
  }

  static generateEquipmentNarrative(formData: SmartFormData): string {
    if (formData.equipmentNeeds?.length === 0) return '';
    
    const equipmentMap: Record<string, { description: string; priority: 'high' | 'medium' | 'low'; rationale: string }> = {
      'سرير طبي': { 
        description: 'سرير طبي قابل للتعديل', 
        priority: 'high', 
        rationale: 'لتحسين راحة المريض وتسهيل الرعاية' 
      },
      'مرتبة هوائية': { 
        description: 'مرتبة هوائية طبية متخصصة', 
        priority: 'high', 
        rationale: 'للوقاية الفعالة من قرح الفراش' 
      },
      'كرسي متحرك': { 
        description: 'كرسي متحرك مناسب للحالة', 
        priority: 'medium', 
        rationale: 'لتحسين الحركة والاستقلالية النسبية' 
      },
      'كرسي حمام': { 
        description: 'كرسي حمام آمن ومقاوم للماء', 
        priority: 'medium', 
        rationale: 'لضمان السلامة أثناء الاستحمام' 
      },
      'رافعة مريض': { 
        description: 'رافعة مريض ميكانيكية أو كهربائية', 
        priority: 'high', 
        rationale: 'لحماية المريض والمرافقين من الإصابات أثناء النقل' 
      },
      'جهاز أكسجين': { 
        description: 'جهاز أكسجين منزلي مع لوازمه', 
        priority: 'high', 
        rationale: 'للدعم التنفسي المستمر حسب الحاجة الطبية' 
      }
    };
    
    let narrative = '**تقييم احتياجات الدعم:** بناءً على التقييم الشامل للحالة، تم تحديد حاجة المريض الماسة إلى ';
    
    // Categorize by priority
    const highPriority = formData.equipmentNeeds.filter(item => equipmentMap[item]?.priority === 'high');
    const mediumPriority = formData.equipmentNeeds.filter(item => equipmentMap[item]?.priority === 'medium');
    const lowPriority = formData.equipmentNeeds.filter(item => equipmentMap[item]?.priority === 'low');
    
    const equipment = formData.equipmentNeeds.map(item => equipmentMap[item]?.description || item);
    narrative += equipment.join('، ');
    
    // Add priority-based narrative
    if (highPriority.length > 0) {
      narrative += '. **الأولوية العاجلة:** ';
      const highPriorityItems = highPriority.map(item => equipmentMap[item]?.description || item);
      narrative += highPriorityItems.join('، ');
      narrative += ' تُعتبر ضرورية وعاجلة لسلامة المريض وجودة الرعاية';
    }
    
    // Add rationale for each equipment
    narrative += '. **التبرير الطبي:**';
    const rationales: string[] = [];
    
    formData.equipmentNeeds.forEach(item => {
      const equipment = equipmentMap[item];
      if (equipment?.rationale) {
        rationales.push(`${equipment.description} ${equipment.rationale}`);
      }
    });
    
    if (rationales.length > 0) {
      narrative += ' ' + rationales.join('، ');
    }
    
    narrative += '. **الإجراءات المتخذة:** تم التنسيق الفوري مع إدارة الأجهزة الطبية والجهات المختصة لتوفير هذه المعدات في أسرع وقت ممكن مع متابعة التسليم والتدريب على الاستخدام';
    
    return narrative + '.';
  }

  static generateInterventionNarrative(formData: SmartFormData): string {
    if (!formData.interventionSummary.trim()) {
      return '**ملخص التدخل الاجتماعي:** تم إجراء تقييم اجتماعي شامل للحالة مع تقديم الدعم والتوجيه المناسب للمريض وأسرته وفقاً للاحتياجات المحددة.';
    }
    
    // Clean and format the intervention text
    let narrative = formData.interventionSummary.trim();
    
    // Add professional header if not already present
    if (!narrative.includes('ملخص التدخل') && !narrative.includes('التدخل الاجتماعي')) {
      narrative = `**ملخص التدخل الاجتماعي:** ${narrative}`;
    }
    
    // Add follow-up statement
    if (!narrative.includes('متابعة') && !narrative.includes('المراجعة')) {
      narrative += '. سيتم متابعة الحالة في الزيارات القادمة لتقييم مدى التحسن والاستجابة للتدخلات المقدمة.';
    }
    
    return narrative;
  }

  static generateEducationNarrative(formData: SmartFormData): string {
    if (!formData.educationStatus) return '';
    
    if (formData.educationStatus === 'تم التثقيف') {
      let narrative = '**التثقيف والتوعية:** تم تقديم جلسات تثقيفية شاملة ومفصلة للمريض وأسرته حول طبيعة المرض، مراحل تطوره، وطرق العناية المنزلية المناسبة';
      
      // Add specific education topics based on conditions
      const educationTopics: string[] = [];
      
      if (formData.physicalStatus.includes('طريح الفراش')) {
        educationTopics.push('الوقاية من قرح الفراش وتقنيات تغيير الوضعية');
      }
      
      if (formData.physicalStatus.includes('قسطرة')) {
        educationTopics.push('العناية بالقسطرة البولية والوقاية من العدوى');
      }
      
      if (formData.equipmentNeeds?.length > 0) {
        educationTopics.push('الاستخدام الآمن والصحيح للأجهزة الطبية المنزلية');
      }
      
      if (formData.psychologicalImpact?.length > 0) {
        educationTopics.push('التعامل مع الضغوط النفسية وطرق الدعم العاطفي');
      }
      
      if (educationTopics.length > 0) {
        narrative += `. **المواضيع المغطاة:** شملت الجلسات التثقيفية مواضيع محورية مثل ${educationTopics.join('، ')}`;
      }
      
      narrative += '. **تقييم الاستيعاب:** أظهرت الأسرة فهماً جيداً وعمقاً في استيعاب التوجيهات المقدمة مع التزام واضح بتطبيقها في الممارسة اليومية';
      
      return narrative + '.';
    } else {
      let narrative = '**التثقيف والتوعية:** تم تحديد الحاجة الواضحة لجلسات تثقيفية إضافية ومكثفة للمريض وأسرته في الزيارات القادمة';
      
      // Add specific reasons for additional education
      const reasons: string[] = [];
      
      if (formData.educationLevel === 'أمي') {
        reasons.push('صعوبة في القراءة تتطلب أساليب تثقيف بصرية وشفهية');
      }
      
      if (formData.familyMembers.some(m => m.relationAfterIllness === 'سيئة')) {
        reasons.push('توتر في العلاقات الأسرية يحتاج لجلسات توجيه إضافية');
      }
      
      if (formData.psychologicalImpact.includes('إنكار المرض')) {
        reasons.push('حالة إنكار المرض تستدعي تدرج في التثقيف والتوعية');
      }
      
      if (reasons.length > 0) {
        narrative += ` نظراً لعوامل مثل ${reasons.join('، ')}`;
      }
      
      narrative += '. **الخطة المقترحة:** سيتم تصميم برنامج تثقيفي مرحلي ومناسب لظروف الأسرة لضمان الفهم الكامل والتطبيق الصحيح لطرق العناية المنزلية المطلوبة';
      
      return narrative + '.';
    }
  }

  static generateRecommendations(formData: SmartFormData): string[] {
    const recommendations: string[] = [];
    
    // Financial recommendations
    if (formData.incomeSources.includes('لا يوجد دخل')) {
      recommendations.push('ربط الأسرة عاجلاً بمصادر الدعم المالي الحكومية والجمعيات الخيرية المتخصصة');
    } else if (formData.incomeAmount && parseInt(formData.incomeAmount) < 3000) {
      recommendations.push('استكشاف مصادر دعم مالي إضافية لتحسين الوضع المعيشي للأسرة');
    }
    
    // Psychological recommendations
    const severeSymptoms = ['يأس', 'عنف أو عدوانية', 'إنكار المرض', 'رهاب أو وسواس'];
    if (formData.psychologicalImpact.some(symptom => severeSymptoms.includes(symptom))) {
      recommendations.push('إحالة فورية وعاجلة للطبيب النفسي المختص مع متابعة مكثفة للحالة النفسية');
    } else if (formData.psychologicalImpact?.length > 0) {
      recommendations.push('متابعة دورية للحالة النفسية مع تقديم الدعم النفسي والاجتماعي المستمر');
    }
    
    // Physical care recommendations
    if (formData.physicalStatus.includes('طريح الفراش')) {
      recommendations.push('تدريب مكثف للأسرة على تقنيات الوقاية من قرح الفراش وطرق العناية اليومية المتخصصة');
    }
    
    if (formData.physicalStatus.includes('قسطرة')) {
      recommendations.push('تثقيف الأسرة حول العناية الصحيحة بالقسطرة البولية والعلامات التحذيرية للعدوى');
    }
    
    // Equipment recommendations
    if (formData.equipmentNeeds?.length > 0) {
      recommendations.push('متابعة حثيثة لتوفير جميع الأجهزة الطبية المطلوبة مع التدريب على الاستخدام الآمن');
    }
    
    // Housing recommendations
    if (formData.housingCondition <= 2) {
      recommendations.push('العمل على تحسين الظروف السكنية لضمان بيئة صحية مناسبة للعلاج والتعافي');
    }
    
    if (formData.housingType === 'بلا مسكن') {
      recommendations.push('التنسيق العاجل مع الجهات المختصة لتوفير سكن مؤقت مناسب للحالة الصحية');
    }
    
    // Family relationship recommendations
    const deterioratedRelations = formData.familyMembers.filter(member => 
      member.relationAfterIllness === 'سيئة' || 
      (member.relationBeforeIllness === 'جيدة' && member.relationAfterIllness !== 'جيدة')
    );
    
    if (deterioratedRelations.length > 0) {
      recommendations.push('جلسات إرشاد أسري لتحسين ديناميكية العلاقات الأسرية والتعامل مع ضغوط المرض');
    }
    
    // Education recommendations
    if (formData.educationStatus === 'يحتاج تثقيف لاحق') {
      recommendations.push('جدولة جلسات تثقيفية إضافية ومكيفة حسب احتياجات الأسرة في الزيارات القادمة');
    }
    
    // Functional assessment recommendations
    if (formData.assessmentMovement.includes('شلل')) {
      recommendations.push('إحالة لبرنامج إعادة تأهيل شامل مع فريق متعدد التخصصات');
    }
    
    // Follow-up recommendations
    recommendations.push('متابعة دورية شاملة لتقييم مدى التحسن والاستجابة للتدخلات المقدمة');
    
    return recommendations;
  }

  static generateComprehensiveReport(formData: SmartFormData): {
    maritalStatus: string;
    educationProfession: string;
    housing: string;
    income: string;
    psychological: string;
    physical: string;
    functionalAssessment: string;
    equipment: string;
    intervention: string;
    education: string;
    recommendations: string[];
  } {
    return {
      maritalStatus: this.generateMaritalStatusNarrative(formData),
      educationProfession: this.generateEducationProfessionNarrative(formData),
      housing: this.generateHousingNarrative(formData),
      income: this.generateIncomeNarrative(formData),
      psychological: this.generatePsychologicalNarrative(formData),
      physical: this.generatePhysicalNarrative(formData),
      functionalAssessment: this.generateFunctionalAssessmentNarrative(formData),
      equipment: this.generateEquipmentNarrative(formData),
      intervention: this.generateInterventionNarrative(formData),
      education: this.generateEducationNarrative(formData),
      recommendations: this.generateRecommendations(formData)
    };
  }
}