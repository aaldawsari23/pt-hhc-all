export interface Staff {
  الاسم: string;
  المهنة: string;
  الايميل: string;
  الجوال: string;
  رقم_الهوية: string;
}

export interface Wounds {
  presentCount?: number;
  healedCount?: number;
  statusRaw?: string;
}

export interface VitalSigns {
  bp: string;
  hr: string;
  temp: string;
  rr: string;
  o2sat: string;
  pain: string;
}

// --- Structured Note Interfaces ---

export interface DoctorFollowUpData {
  status: 'Improved' | 'Unchanged' | 'Worsened';
  responseToPlan: 'good' | 'partial' | 'poor';
  adherence: 'good' | 'partial' | 'poor';
  newIssues?: ('fever' | 'pain ↑' | 'wound deterioration' | 'device issue' | 'other')[];
  plan: 'Continue' | 'Change';
  planDetails?: ('Add referral' | 'Adjust meds' | 'Start antibiotics' | 'Wound care upgrade' | 'Frequency change')[];
  nextFollowUp: '24–48h' | '3–7d' | '2–4w';
  mdNote?: string;
}

export interface NurseFollowUpData {
  // FIX: Allow partial of all vital signs instead of a subset. This resolves errors in the print view component.
  vitals?: Partial<VitalSigns>;
  woundDelta?: 'better' | 'unchanged' | 'worse';
  deviceDelta?: 'better' | 'unchanged' | 'worse';
  tasks: ('dressing change' | 'vaccine' | 'meds given' | 'education')[];
  status: 'Improved' | 'Unchanged' | 'Worsened';
  escalation?: 'Yes' | 'No';
  nurseNote?: string;
}

export interface PtFollowUpData {
    changeSinceLast: {
        pain: '↓' | '↔' | '↑';
        function: '↑' | '↔' | '↓';
    };
    tolerance: 'good' | 'fair' | 'poor';
    hep: {
        status: 'given' | 'updated';
        adherence: 'good' | 'partial' | 'poor';
    };
    plan: 'Continue' | 'Change';
    planFocus?: ('ROM' | 'Strength' | 'Balance' | 'Endurance' | 'Gait')[];
    planFrequency?: 'weekly' | 'biweekly' | 'monthly';
    ptNote?: string;
}

export interface SwFollowUpData {
    situationChange: 'تحسن' | 'لم يتغير' | 'تدهور';
    actionsTaken: ('تنسيق لوازم' | 'دعم مُعيل' | 'مساعدة مالية' | 'ترتيب نقل' | 'موارد مجتمعية')[];
    plan: 'الاستمرار' | 'تغيير';
    swNote?: string;
}


export interface BaseAssessment {
  id: string;
  date: string;
  assessorId: string;
  assessorName: string;
  role: Role;
  status: 'Improved' | 'Unchanged' | 'Worsened';
  plan: 'Continue same plan' | 'Change plan';
}

export interface DoctorAssessmentData extends BaseAssessment {
  role: Role.Doctor;
  chiefFocus: ('Wound care' | 'Infection suspicion' | 'Pain mgmt' | 'DM' | 'HTN' | 'CHF/COPD' | 'CKD' | 'Post-op' | 'Catheter' | 'Tube feeding')[];
  redFlags?: ('Fever ≥38' | 'SpO₂ <90' | 'Chest pain' | 'Active bleeding' | 'New neuro deficit' | 'Sepsis concern')[];
  redFlagAction?: 'ER referral' | 'Urgent phone follow-up' | 'None';
  worsenedCause?: ('infection' | 'fluid overload' | 'ischemic' | 'neuropathic pain' | 'MSK flare' | 'adherence issue' | 'other')[];
  assessment: {
      etiology: ('Infectious' | 'Inflammatory' | 'Ischemic' | 'Neuropathic' | 'Mechanical' | 'Post-op')[];
      severity: 'Mild' | 'Moderate' | 'Severe';
  };
  medChanges?: ('None' | 'Increase dose' | 'Decrease dose' | 'New med' | 'Stop med')[];
  highRiskMeds?: ('Anticoagulant' | 'Opioid' | 'Steroid' | 'None')[];
  orders?: {
    labs?: ('CBC' | 'CRP' | 'BMP' | 'HbA1c' | 'INR' | 'Wound swab')[];
    imaging?: ('CXR' | 'X-ray' | 'Ultrasound')[];
    antibiotic?: ('amox/clav' | 'cephalexin' | 'doxy' | 'ciprofloxacin' | 'custom')[];
    customAntibiotic?: string;
  };
  planDetails?: ('Add referral' | 'Adjust meds' | 'Start antibiotics' | 'Wound care upgrade' | 'Frequency change')[];
  followUpTiming: '24–48h' | '3–7d' | '2–4w';
  entitlement?: 'Weekly' | 'Biweekly' | 'Monthly';
  mdNote?: string;
}

export interface NurseAssessmentData extends BaseAssessment {
  role: Role.Nurse;
  vitals: VitalSigns;
  bradenScore?: number | string;
  devices?: ('Urinary catheter' | 'PEG/NG tube' | 'IV/Port')[];
  catheterDetails?: { careDone: 'Yes' | 'No', issues: ('blockage' | 'leak' | 'odor' | 'UTI signs')[] };
  pegNgDetails?: { site: 'okay' | 'redness' | 'leak', feedingGiven: 'Yes' | 'No' };
  ivPortDetails?: { site: 'clean' | 'redness' | 'infiltration', dressingChanged: 'Yes' | 'No', flush: 'Yes' | 'No' };
  woundStatus?: 'None' | 'Wound' | 'Pressure ulcer';
  woundDetails?: {
    sites: ('sacrum' | 'heel' | 'trochanter' | 'foot' | 'other')[];
    otherSite?: string;
    stage?: '1' | '2' | '3' | '4' | 'Unstageable';
    exudate?: 'none' | 'mild' | 'moderate' | 'heavy';
    infectionSigns?: ('erythema' | 'warmth' | 'odor' | 'pus')[];
    careToday: ('cleanse' | 'debridement (basic)' | 'dressing (foam/hydrocolloid/alginate)' | 'off-loading' | 'patient education')[];
  };
  nursingTasks: ('Meds administered' | 'Injection' | 'Vaccination' | 'Glucose check' | 'Education')[];
  vaccinationDetails?: ('influenza' | 'pneumococcal' | 'COVID' | 'other')[];
  glucoseValue?: string;
  impression: 'Stable' | 'Improving' | 'Deteriorating' | 'Needs MD call today';
  nurseNote?: string;
}

export interface PtAssessmentData extends BaseAssessment {
    role: Role.PhysicalTherapist;
    dxFocus: ('TKA/THA/ACL/RCR/Stroke/LBP/Neck')[];
    phase: 'acute' | 'subacute' | 'late';
    pain: string; // 0-10
    function: {
        bedMobility: 'independent' | 'supervision' | 'minA' | 'modA' | 'maxA';
        transfers: 'independent' | 'supervision' | 'minA' | 'modA' | 'maxA';
        gaitDistance: '0–5m' | '5–20m' | '20–100m' | '>100m';
        assistiveDevice: 'none' | 'cane' | 'walker' | 'crutches' | 'wheelchair';
        stairs: 'none' | 'with rails' | 'assist' | 'independent';
        balance: { static: 'good' | 'fair' | 'poor', dynamic: 'good' | 'fair' | 'poor' };
    };
    romMmt: {
        region: ('shoulder' | 'hip' | 'knee' | 'ankle' | 'spine')[];
        rom: 'WNL' | '↓mild' | '↓moderate' | '↓severe';
        mmt: '0' | '1' | '2' | '3' | '4' | '5';
    };
    redFlags?: ('Post-op concern' | 'severe swelling' | 'new neuro deficit' | 'dyspnea' | 'uncontrolled pain')[];
    interventions: ('ROM' | 'Stretch' | 'Strength' | 'Balance' | 'Gait' | 'TENS' | 'NMES' | 'US' | 'Ice' | 'Heat' | 'soft tissue' | 'joint mobs')[];
    planDetails?: {
        focus?: ('ROM' | 'Strength' | 'Balance' | 'Endurance' | 'Gait')[];
        frequency?: 'weekly' | 'biweekly' | 'monthly';
    };
    ptNote?: string;
}
export interface SwAssessmentData extends BaseAssessment {
    role: Role.SocialWorker;
    residence: 'يعيش بمفرده' | 'مع الأسرة' | 'مع مُعيل';
    caregiverHours: '0' | 'أقل من 10' | '10–30' | 'أكثر من 30';
    adlAssistance: 'لا يحتاج' | 'مساعدة جزئية' | 'مساعدة كاملة';
    economic: {
        income: 'منخفض' | 'متوسط' | 'مرتفع';
        coverage: 'حكومية' | 'خاصة' | 'لا يوجد';
        transport: 'متوفر' | 'صعوبة' | 'غير متوفر';
    };
    homeSafety: {
        risks: ('سلالم' | 'سجاد غير ثابت' | 'إضاءة ضعيفة' | 'مخاطر الحمّام')[];
        aids: ('قضبان تثبيت' | 'كرسي استحمام' | 'كرسي حمّام' | 'كرسي متحرك')[];
    };
    needs: ('حفاضات' | 'مستلزمات جروح' | 'مستلزمات قسطرة' | 'تغذية أنبوبية' | 'أدوية مزمنة')[];
    psychosocial: {
        mood: 'سلبي' | 'إيجابي';
        memory: 'طبيعي' | 'نسيان' | 'غير آمن بمفرده';
        abuseSuspicion: 'لا' | 'مشتبه';
    };
    actions: ('تنسيق لوازم' | 'دعم مُعيل' | 'مساعدة مالية' | 'ترتيب نقل' | 'مساعدة قانونية' | 'موارد مجتمعية')[];
    swNote?: string;
}

export type Assessment = DoctorAssessmentData | NurseAssessmentData | PtAssessmentData | SwAssessmentData;


export interface Patient {
  nationalId: string;
  nameAr: string;
  phone: string | null;
  areaId: string | null;
  status: 'active' | 'deceased';
  level: string | null;
  bradenScore: number | null;
  minMonthlyRequired: number | null;
  admissionDate: string | null;
  gmapsUrl: boolean;
  hasCatheter?: boolean;
  wounds?: Wounds;
  ngTube?: boolean;
  gTube?: boolean;
  fallHighRisk?: boolean;
  ivTherapy?: boolean;
  ventSupport?: boolean;
  lastVisit?: string;
  sex?: 'Male' | 'Female';
  tags: string[];
  assessments: Assessment[];
}

export interface Team {
    id: string;
    name: string;
    members: Staff[];
}

export enum Role {
    Doctor = 'Doctor',
    Nurse = 'Nurse',
    PhysicalTherapist = 'Physical Therapist',
    SocialWorker = 'Social Worker',
    Driver = 'Driver',
    Coordinator = 'Coordinator'
}

export interface Visit {
    patientId: string;
    date: string; // YYYY-MM-DD
    teamId: string;
    doctorNote?: DoctorFollowUpData;
    nurseNote?: NurseFollowUpData;
    ptNote?: PtFollowUpData;
    swNote?: SwFollowUpData;
    doctorSign?: string;
    nurseSign?: string;
    ptSign?: string;
    swSign?: string;
    status: 'Scheduled' | 'DoctorCompleted' | 'NurseCompleted' | 'Completed';
}

export interface AppState {
    patients: Patient[];
    staff: Staff[];
    areas: string[];
    criticalCases: {
        catheter: Partial<Patient>[];
        pressureSore: Partial<Patient>[];
        tubeFeeding: Partial<Patient>[];
        fallRisk: Partial<Patient>[];
        ivTherapy: Partial<Patient>[];
        ventilation: Partial<Patient>[];
    };
    filters: {
        search: string;
        areas: string[];
        tags: string[];
        sex: string[];
        risk: string[];
    };
    selectedPatientIds: Set<string>;
    currentRole: Role;
    visits: Visit[];
    teams: Team[];
}

export type Action =
    | { type: 'SET_SEARCH'; payload: string }
    | { type: 'TOGGLE_AREA_FILTER'; payload: string }
    | { type: 'TOGGLE_TAG_FILTER'; payload: string }
    | { type: 'TOGGLE_SEX_FILTER'; payload: string }
    | { type: 'TOGGLE_RISK_FILTER'; payload: string }
    | { type: 'CLEAR_FILTERS' }
    | { type: 'TOGGLE_PATIENT_SELECTION'; payload: string }
    | { type: 'CLEAR_SELECTIONS' }
    | { type: 'SELECT_ALL_FILTERED'; payload: string[] }
    | { type: 'SET_ROLE'; payload: Role }
    | { type: 'ASSIGN_TO_VISITS'; payload: { patientIds: string[], date: string, teamId: string } }
    | { type: 'SAVE_VISIT_NOTE'; payload: { visitId: string, role: Role, note: DoctorFollowUpData | NurseFollowUpData | PtFollowUpData | SwFollowUpData, user: string } }
    | { type: 'SAVE_ASSESSMENT'; payload: { patientId: string; assessment: Assessment } };