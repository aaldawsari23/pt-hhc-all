import React from 'react';
import { Patient, Assessment, Visit, DoctorAssessmentData, NurseAssessmentData, PtAssessmentData, SwAssessmentData, Staff } from '../types';

interface EnhancedPrintTemplateProps {
  patient: Patient;
  visit?: Visit;
  assessment?: Assessment;
  staff?: Staff[];
  type: 'visit' | 'assessment' | 'patient-summary' | 'care-plan' | 'driver-route';
  additionalData?: {
    visits?: Visit[];
    assessments?: Assessment[];
    careTeam?: Staff[];
  };
}

const PrintHeader: React.FC<{ patient: Patient; title: string; subtitle?: string }> = ({ patient, title, subtitle }) => (
  <div className="print-header bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg mb-6 no-print-color-adjust">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-4">
        {/* شعار المملكة العربية السعودية ووزارة الصحة */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center shadow-lg p-2">
            <div className="text-center">
              <div className="text-green-600 font-bold text-lg">🇸🇦</div>
              <div className="text-xs text-green-600 font-bold mt-1">MOH</div>
            </div>
          </div>
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-lg">
            <div className="text-center">
              <div className="text-blue-600 font-bold text-sm">KAH</div>
              <div className="text-xs text-blue-600">Bisha</div>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div>
              <h1 className="text-2xl font-bold mb-1">King Abdullah Hospital - Bisha</h1>
              <p className="text-blue-100 text-lg">مستشفى الملك عبدالله - بيشه</p>
            </div>
          </div>
          <div className="text-blue-200 text-sm">
            <p className="font-medium">Home Healthcare Division</p>
            <p>قسم الرعاية الصحية المنزلية</p>
            <p className="mt-1">Aseer Health Cluster | تجمع عسير الصحي</p>
          </div>
        </div>
      </div>
      <div className="text-right bg-white/10 rounded-lg p-4">
        <p className="text-sm text-blue-100 mb-1">Print Date | تاريخ الطباعة</p>
        <p className="font-bold text-lg">{new Date().toLocaleDateString()}</p>
        <p className="text-xs text-blue-200">
          {new Date().toLocaleDateString('ar-SA')}
        </p>
        <div className="mt-2 text-xs text-blue-200">
          <p>Document ID: DOC-{Date.now().toString().slice(-6)}</p>
        </div>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-blue-500">
      <h2 className="text-xl font-bold">{title}</h2>
      {subtitle && <p className="text-blue-100">{subtitle}</p>}
    </div>
  </div>
);

const PatientInfoCard: React.FC<{ patient: Patient }> = ({ patient }) => (
  <div className="patient-info bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg mb-6 border border-gray-200 shadow-sm print-no-break">
    <h3 className="font-bold text-lg text-gray-800 mb-4 border-b border-gray-300 pb-2 flex items-center gap-2">
      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
      Patient Information | معلومات المريض
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div className="bg-white p-3 rounded border-l-4 border-blue-500">
        <span className="font-semibold text-gray-600 block mb-1">Name | الاسم</span>
        <p className="font-bold text-blue-900">{patient.nameAr}</p>
      </div>
      <div className="bg-white p-3 rounded border-l-4 border-green-500">
        <span className="font-semibold text-gray-600 block mb-1">National ID | رقم الهوية</span>
        <p className="font-bold text-green-900">{patient.nationalId}</p>
      </div>
      <div className="bg-white p-3 rounded border-l-4 border-purple-500">
        <span className="font-semibold text-gray-600 block mb-1">Phone | الهاتف</span>
        <p className="font-bold text-purple-900">{patient.phone || 'N/A'}</p>
      </div>
      <div className="bg-white p-3 rounded border-l-4 border-orange-500">
        <span className="font-semibold text-gray-600 block mb-1">Area | المنطقة</span>
        <p className="font-bold text-orange-900">{patient.areaId || 'N/A'}</p>
      </div>
      <div className="bg-white p-3 rounded border-l-4 border-pink-500">
        <span className="font-semibold text-gray-600 block mb-1">Sex | الجنس</span>
        <p className="font-bold text-pink-900">{patient.sex || 'N/A'}</p>
      </div>
      <div className="bg-white p-3 rounded border-l-4 border-indigo-500">
        <span className="font-semibold text-gray-600 block mb-1">Level | المستوى</span>
        <p className="font-bold text-indigo-900">{patient.level || 'N/A'}</p>
      </div>
      <div className="bg-white p-3 rounded border-l-4 border-red-500">
        <span className="font-semibold text-gray-600 block mb-1">Admission | القبول</span>
        <p className="font-bold text-red-900">
          {patient.admissionDate ? new Date(patient.admissionDate).toLocaleDateString() : 'N/A'}
        </p>
      </div>
      <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
        <span className="font-semibold text-gray-600 block mb-1">Braden Score | نقاط برادن</span>
        <p className="font-bold text-yellow-900">{patient.bradenScore || 'N/A'}</p>
      </div>
    </div>
    
    {/* Medical Indicators */}
    <div className="mt-4">
      <h4 className="font-semibold text-gray-700 mb-2">Medical Indicators | المؤشرات الطبية</h4>
      <div className="flex flex-wrap gap-2">
        {patient.hasCatheter && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200">
            🩺 Catheter | قسطرة
          </span>
        )}
        {patient.wounds && patient.wounds.presentCount && patient.wounds.presentCount > 0 && (
          <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full border border-red-200">
            🩹 Wounds ({patient.wounds.presentCount}) | جروح
          </span>
        )}
        {patient.ngTube && (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200">
            🔗 NG Tube | أنبوب أنفي
          </span>
        )}
        {patient.gTube && (
          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full border border-purple-200">
            🔗 G-Tube | أنبوب معدي
          </span>
        )}
        {patient.fallHighRisk && (
          <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-200">
            ⚠️ Fall Risk | خطر السقوط
          </span>
        )}
        {patient.ivTherapy && (
          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full border border-indigo-200">
            💉 IV Therapy | العلاج الوريدي
          </span>
        )}
        {patient.ventSupport && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200">
            🫁 Vent Support | دعم تنفسي
          </span>
        )}
      </div>
    </div>
    
    {patient.tags.length > 0 && (
      <div className="mt-4">
        <span className="font-semibold text-gray-600 block mb-2">Tags | العلامات</span>
        <div className="flex flex-wrap gap-2">
          {patient.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200">
              {tag}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

const VitalsDisplay: React.FC<{ vitals: any; title?: string }> = ({ vitals, title = "Vital Signs | العلامات الحيوية" }) => {
  if (!vitals) return null;
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border border-blue-200 mb-4">
      <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
        {title}
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {vitals.bp && (
          <div className="bg-white p-3 rounded-lg border border-red-200 text-center">
            <div className="text-xs font-bold text-red-600 mb-1">BP | ضغط الدم</div>
            <div className="font-mono text-lg font-bold text-red-800">{vitals.bp}</div>
          </div>
        )}
        {vitals.hr && (
          <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
            <div className="text-xs font-bold text-blue-600 mb-1">HR | النبض</div>
            <div className="font-mono text-lg font-bold text-blue-800">{vitals.hr}</div>
          </div>
        )}
        {vitals.rr && (
          <div className="bg-white p-3 rounded-lg border border-green-200 text-center">
            <div className="text-xs font-bold text-green-600 mb-1">RR | التنفس</div>
            <div className="font-mono text-lg font-bold text-green-800">{vitals.rr}</div>
          </div>
        )}
        {vitals.temp && (
          <div className="bg-white p-3 rounded-lg border border-orange-200 text-center">
            <div className="text-xs font-bold text-orange-600 mb-1">Temp | الحرارة</div>
            <div className="font-mono text-lg font-bold text-orange-800">{vitals.temp}°C</div>
          </div>
        )}
        {vitals.o2sat && (
          <div className="bg-white p-3 rounded-lg border border-purple-200 text-center">
            <div className="text-xs font-bold text-purple-600 mb-1">SpO₂ | الأكسجين</div>
            <div className="font-mono text-lg font-bold text-purple-800">{vitals.o2sat}%</div>
          </div>
        )}
        {vitals.pain && (
          <div className="bg-white p-3 rounded-lg border border-pink-200 text-center">
            <div className="text-xs font-bold text-pink-600 mb-1">Pain | الألم</div>
            <div className="font-mono text-lg font-bold text-pink-800">{vitals.pain}/10</div>
          </div>
        )}
      </div>
    </div>
  );
};

const AssessmentSection: React.FC<{ title: string; children: React.ReactNode; color?: string }> = ({ 
  title, 
  children, 
  color = "blue" 
}) => (
  <div className={`bg-gradient-to-br from-${color}-50 to-white p-4 rounded-lg border border-${color}-200 mb-4 print-no-break`}>
    <h4 className={`font-bold text-${color}-800 mb-3 flex items-center gap-2`}>
      <span className={`w-2 h-2 bg-${color}-600 rounded-full`}></span>
      {title}
    </h4>
    <div className="space-y-2 text-sm">
      {children}
    </div>
  </div>
);

const PrintField: React.FC<{ 
  label: string; 
  value?: string | string[] | null | number; 
  icon?: string;
  highlight?: boolean;
}> = ({ label, value, icon, highlight }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const displayValue = Array.isArray(value) ? value.join(', ') : value;
  
  return (
    <div className={`flex items-start gap-2 p-2 rounded ${highlight ? 'bg-yellow-50 border border-yellow-200' : ''}`}>
      {icon && <span className="text-sm">{icon}</span>}
      <div className="flex-1">
        <span className="font-semibold text-gray-700">{label}:</span>
        <span className={`ml-2 ${highlight ? 'font-bold text-yellow-800' : 'text-gray-900'}`}>
          {displayValue}
        </span>
      </div>
    </div>
  );
};

const DoctorAssessmentPrint: React.FC<{ assessment: DoctorAssessmentData; patient: Patient }> = ({ 
  assessment, 
  patient 
}) => (
  <div className="print-page">
    <PrintHeader 
      patient={patient} 
      title="Medical Assessment Report" 
      subtitle="تقرير التقييم الطبي"
    />
    <PatientInfoCard patient={patient} />
    
    <div className="assessment-details space-y-4">
      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div>
          <h3 className="font-bold text-lg text-blue-800">Medical Assessment Details</h3>
          <p className="text-blue-600">تفاصيل التقييم الطبي</p>
        </div>
        <div className="text-right text-sm text-blue-700">
          <p><strong>Date:</strong> {new Date(assessment.date).toLocaleDateString()}</p>
          <p><strong>Assessor:</strong> {assessment.assessorName}</p>
          <p><strong>ID:</strong> {assessment.assessorId}</p>
        </div>
      </div>

      <AssessmentSection title="Clinical Focus | التركيز السريري" color="blue">
        <PrintField label="Chief Focus" value={assessment.chiefFocus} icon="🎯" />
        {assessment.redFlags && assessment.redFlags.length > 0 && (
          <PrintField label="Red Flags" value={assessment.redFlags} icon="🚨" highlight />
        )}
        <PrintField label="Red Flag Action" value={assessment.redFlagAction} icon="⚡" />
      </AssessmentSection>

      <AssessmentSection title="Clinical Assessment | التقييم السريري" color="green">
        <PrintField label="Status" value={assessment.status} icon="📊" />
        <PrintField label="Plan" value={assessment.plan} icon="📋" />
        <PrintField label="Etiology" value={assessment.assessment.etiology} icon="🔍" />
        <PrintField label="Severity" value={assessment.assessment.severity} icon="⚖️" />
        {assessment.worsenedCause && (
          <PrintField label="Worsened Cause" value={assessment.worsenedCause} icon="⚠️" />
        )}
      </AssessmentSection>

      {assessment.orders && (
        <AssessmentSection title="Orders & Interventions | الطلبات والتدخلات" color="purple">
          {assessment.orders.labs && (
            <PrintField label="Laboratory Tests" value={assessment.orders.labs} icon="🧪" />
          )}
          {assessment.orders.imaging && (
            <PrintField label="Imaging Studies" value={assessment.orders.imaging} icon="📷" />
          )}
          {assessment.orders.antibiotic && (
            <PrintField label="Antibiotics" value={assessment.orders.antibiotic} icon="💊" />
          )}
          {assessment.orders.customAntibiotic && (
            <PrintField label="Custom Antibiotic" value={assessment.orders.customAntibiotic} icon="💊" />
          )}
        </AssessmentSection>
      )}

      <AssessmentSection title="Medications & Plan | الأدوية والخطة" color="orange">
        <PrintField label="Medication Changes" value={assessment.medChanges} icon="💊" />
        <PrintField label="High-Risk Medications" value={assessment.highRiskMeds} icon="⚠️" />
        <PrintField label="Plan Details" value={assessment.planDetails} icon="📝" />
        <PrintField label="Follow-up Timing" value={assessment.followUpTiming} icon="⏰" />
        <PrintField label="Entitlement" value={assessment.entitlement} icon="🎫" />
      </AssessmentSection>

      {assessment.mdNote && (
        <AssessmentSection title="Physician Notes | ملاحظات الطبيب" color="indigo">
          <div className="bg-white p-4 rounded border border-gray-200">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">{assessment.mdNote}</pre>
          </div>
        </AssessmentSection>
      )}
    </div>

    <div className="print-footer mt-8 pt-4 border-t-2 border-gray-300">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-gray-800">Digital Assessment Record</p>
          <p className="text-xs text-gray-600">
            Aseer Health Cluster – King Abdullah Hospital, Bishah
          </p>
          <p className="text-xs text-gray-500">
            تجمع عسير الصحي – مستشفى الملك عبدالله ببيشة
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>Generated: {new Date().toLocaleString()}</p>
          <p>Assessment ID: {assessment.id}</p>
        </div>
      </div>
    </div>
  </div>
);

const NurseAssessmentPrint: React.FC<{ assessment: NurseAssessmentData; patient: Patient }> = ({ 
  assessment, 
  patient 
}) => (
  <div className="print-page">
    <PrintHeader 
      patient={patient} 
      title="Nursing Assessment Report" 
      subtitle="تقرير التقييم التمريضي"
    />
    <PatientInfoCard patient={patient} />
    
    <VitalsDisplay vitals={assessment.vitals} />
    
    <div className="assessment-details space-y-4">
      <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
        <div>
          <h3 className="font-bold text-lg text-green-800">Nursing Assessment Details</h3>
          <p className="text-green-600">تفاصيل التقييم التمريضي</p>
        </div>
        <div className="text-right text-sm text-green-700">
          <p><strong>Date:</strong> {new Date(assessment.date).toLocaleDateString()}</p>
          <p><strong>Nurse:</strong> {assessment.assessorName}</p>
          <p><strong>ID:</strong> {assessment.assessorId}</p>
        </div>
      </div>

      <AssessmentSection title="Clinical Status | الحالة السريرية" color="green">
        <PrintField label="Overall Status" value={assessment.status} icon="📊" />
        <PrintField label="Plan" value={assessment.plan} icon="📋" />
        <PrintField label="Impression" value={assessment.impression} icon="💭" />
        <PrintField label="Braden Score" value={assessment.bradenScore} icon="📏" />
      </AssessmentSection>

      {assessment.devices && assessment.devices.length > 0 && (
        <AssessmentSection title="Medical Devices | الأجهزة الطبية" color="blue">
          <PrintField label="Devices Present" value={assessment.devices} icon="🔗" />
          {assessment.catheterDetails && (
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-2">Catheter Care | رعاية القسطرة</h5>
              <PrintField label="Care Done" value={assessment.catheterDetails.careDone} />
              <PrintField label="Issues" value={assessment.catheterDetails.issues} />
            </div>
          )}
          {assessment.pegNgDetails && (
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-2">PEG/NG Tube | الأنبوب الأنفي/المعدي</h5>
              <PrintField label="Site Condition" value={assessment.pegNgDetails.site} />
              <PrintField label="Feeding Given" value={assessment.pegNgDetails.feedingGiven} />
            </div>
          )}
          {assessment.ivPortDetails && (
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-2">IV/Port Care | رعاية الوريد</h5>
              <PrintField label="Site Condition" value={assessment.ivPortDetails.site} />
              <PrintField label="Dressing Changed" value={assessment.ivPortDetails.dressingChanged} />
              <PrintField label="Flush Done" value={assessment.ivPortDetails.flush} />
            </div>
          )}
        </AssessmentSection>
      )}

      {assessment.woundStatus && assessment.woundStatus !== 'None' && (
        <AssessmentSection title="Wound Assessment | تقييم الجروح" color="red">
          <PrintField label="Wound Status" value={assessment.woundStatus} icon="🩹" />
          {assessment.woundDetails && (
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <PrintField label="Sites" value={assessment.woundDetails.sites} />
              <PrintField label="Other Site" value={assessment.woundDetails.otherSite} />
              <PrintField label="Stage" value={assessment.woundDetails.stage} />
              <PrintField label="Exudate" value={assessment.woundDetails.exudate} />
              <PrintField label="Infection Signs" value={assessment.woundDetails.infectionSigns} />
              <PrintField label="Care Provided" value={assessment.woundDetails.careToday} />
            </div>
          )}
        </AssessmentSection>
      )}

      <AssessmentSection title="Nursing Tasks | المهام التمريضية" color="purple">
        <PrintField label="Tasks Performed" value={assessment.nursingTasks} icon="✅" />
        {assessment.vaccinationDetails && (
          <PrintField label="Vaccination Details" value={assessment.vaccinationDetails} icon="💉" />
        )}
        {assessment.glucoseValue && (
          <PrintField label="Glucose Value" value={assessment.glucoseValue} icon="🩸" />
        )}
      </AssessmentSection>

      {assessment.nurseNote && (
        <AssessmentSection title="Nursing Notes | ملاحظات التمريض" color="indigo">
          <div className="bg-white p-4 rounded border border-gray-200">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">{assessment.nurseNote}</pre>
          </div>
        </AssessmentSection>
      )}
    </div>

    <div className="print-footer mt-8 pt-4 border-t-2 border-gray-300">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-gray-800">Digital Nursing Record</p>
          <p className="text-xs text-gray-600">
            Aseer Health Cluster – King Abdullah Hospital, Bishah
          </p>
          <p className="text-xs text-gray-500">
            تجمع عسير الصحي – مستشفى الملك عبدالله ببيشة
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>Generated: {new Date().toLocaleString()}</p>
          <p>Assessment ID: {assessment.id}</p>
        </div>
      </div>
    </div>
  </div>
);

const VisitPrint: React.FC<{ visit: Visit; patient: Patient }> = ({ visit, patient }) => (
  <div className="print-page">
    <PrintHeader 
      patient={patient} 
      title="Home Healthcare Visit Report" 
      subtitle="تقرير زيارة الرعاية المنزلية"
    />
    <PatientInfoCard patient={patient} />
    
    <div className="visit-details space-y-4">
      <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg border border-purple-200">
        <div>
          <h3 className="font-bold text-lg text-purple-800">Visit Information</h3>
          <p className="text-purple-600">معلومات الزيارة</p>
        </div>
        <div className="text-right text-sm text-purple-700">
          <p><strong>Date:</strong> {new Date(visit.date).toLocaleDateString()}</p>
          <p><strong>Team:</strong> {visit.teamId}</p>
          <p><strong>Status:</strong> {visit.status}</p>
        </div>
      </div>

      {visit.nurseNote?.vitals && <VitalsDisplay vitals={visit.nurseNote.vitals} />}

      <div className="grid md:grid-cols-2 gap-4">
        {visit.nurseNote && (
          <AssessmentSection title="Nursing Assessment | التقييم التمريضي" color="green">
            <PrintField label="Status" value={visit.nurseNote.status} icon="📊" />
            <PrintField label="Wound Delta" value={visit.nurseNote.woundDelta} icon="🩹" />
            <PrintField label="Device Delta" value={visit.nurseNote.deviceDelta} icon="🔗" />
            <PrintField label="Tasks Completed" value={visit.nurseNote.tasks} icon="✅" />
            <PrintField label="Escalation" value={visit.nurseNote.escalation} icon="📞" />
            {visit.nurseNote.nurseNote && (
              <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                <strong className="text-green-700">Notes:</strong>
                <p className="text-sm mt-1">{visit.nurseNote.nurseNote}</p>
              </div>
            )}
          </AssessmentSection>
        )}

        {visit.doctorNote && (
          <AssessmentSection title="Medical Assessment | التقييم الطبي" color="blue">
            <PrintField label="Status" value={visit.doctorNote.status} icon="📊" />
            <PrintField label="Response to Plan" value={visit.doctorNote.responseToPlan} icon="📈" />
            <PrintField label="Adherence" value={visit.doctorNote.adherence} icon="💊" />
            <PrintField label="New Issues" value={visit.doctorNote.newIssues} icon="⚠️" />
            <PrintField label="Plan" value={visit.doctorNote.plan} icon="📋" />
            <PrintField label="Plan Details" value={visit.doctorNote.planDetails} icon="📝" />
            <PrintField label="Next Follow-up" value={visit.doctorNote.nextFollowUp} icon="⏰" />
            {visit.doctorNote.mdNote && (
              <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                <strong className="text-blue-700">Notes:</strong>
                <p className="text-sm mt-1">{visit.doctorNote.mdNote}</p>
              </div>
            )}
          </AssessmentSection>
        )}
      </div>

      {(visit.ptNote || visit.swNote) && (
        <div className="grid md:grid-cols-2 gap-4">
          {visit.ptNote && (
            <AssessmentSection title="Physical Therapy | العلاج الطبيعي" color="orange">
              <PrintField label="Status" value={visit.ptNote.status} icon="🏃" />
              <PrintField label="Pain Change" value={visit.ptNote.changeSinceLast?.pain} icon="💊" />
              <PrintField label="Function Change" value={visit.ptNote.changeSinceLast?.function} icon="🎯" />
              <PrintField label="Tolerance" value={visit.ptNote.tolerance} icon="💪" />
              <PrintField label="Plan" value={visit.ptNote.plan} icon="📋" />
              {visit.ptNote.ptNote && (
                <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                  <strong className="text-orange-700">Notes:</strong>
                  <p className="text-sm mt-1">{visit.ptNote.ptNote}</p>
                </div>
              )}
            </AssessmentSection>
          )}

          {visit.swNote && (
            <AssessmentSection title="Social Work | الخدمة الاجتماعية" color="teal">
              <PrintField label="Situation Change" value={visit.swNote.situationChange} icon="🏠" />
              <PrintField label="Actions Taken" value={visit.swNote.actionsTaken} icon="🛠️" />
              <PrintField label="Plan" value={visit.swNote.plan} icon="📋" />
              {visit.swNote.swNote && (
                <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                  <strong className="text-teal-700">Notes:</strong>
                  <p className="text-sm mt-1">{visit.swNote.swNote}</p>
                </div>
              )}
            </AssessmentSection>
          )}
        </div>
      )}
    </div>

    {/* Signatures */}
    <div className="mt-8 pt-6 border-t-2 border-gray-300">
      <h4 className="font-bold text-gray-800 mb-4">Team Signatures | توقيعات الفريق</h4>
      <div className="grid grid-cols-2 gap-8">
        {visit.nurseSign && (
          <div className="text-center">
            <div className="border-b border-gray-400 pb-2 mb-2">
              <p className="font-semibold text-lg">{visit.nurseSign}</p>
            </div>
            <p className="text-sm text-gray-600">Nurse | ممرض/ة</p>
          </div>
        )}
        {visit.doctorSign && (
          <div className="text-center">
            <div className="border-b border-gray-400 pb-2 mb-2">
              <p className="font-semibold text-lg">{visit.doctorSign}</p>
            </div>
            <p className="text-sm text-gray-600">Doctor | طبيب</p>
          </div>
        )}
        {visit.ptSign && (
          <div className="text-center">
            <div className="border-b border-gray-400 pb-2 mb-2">
              <p className="font-semibold text-lg">{visit.ptSign}</p>
            </div>
            <p className="text-sm text-gray-600">Physical Therapist | أخصائي علاج طبيعي</p>
          </div>
        )}
        {visit.swSign && (
          <div className="text-center">
            <div className="border-b border-gray-400 pb-2 mb-2">
              <p className="font-semibold text-lg">{visit.swSign}</p>
            </div>
            <p className="text-sm text-gray-600">Social Worker | أخصائي اجتماعي</p>
          </div>
        )}
      </div>
    </div>

    <div className="print-footer mt-8 pt-4 border-t-2 border-gray-300">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-gray-800">Digital Visit Record</p>
          <p className="text-xs text-gray-600">
            This document was generated electronically and is valid without signature.
          </p>
          <p className="text-xs text-gray-500">
            Aseer Health Cluster – King Abdullah Hospital, Bishah - Home Healthcare Department
          </p>
          <p className="text-xs text-gray-500">
            تجمع عسير الصحي – مستشفى الملك عبدالله ببيشة - الرعاية الصحية المنزلية
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>Generated: {new Date().toLocaleString()}</p>
          <p>Visit Date: {visit.date}</p>
        </div>
      </div>
    </div>
  </div>
);

const EnhancedPrintTemplate: React.FC<EnhancedPrintTemplateProps> = ({ 
  patient, 
  visit, 
  assessment, 
  type,
  additionalData 
}) => {
  switch (type) {
    case 'visit':
      return visit ? <VisitPrint patient={patient} visit={visit} /> : null;
    
    case 'assessment':
      if (!assessment) return null;
      
      switch (assessment.role) {
        case 'Doctor':
          return <DoctorAssessmentPrint assessment={assessment as DoctorAssessmentData} patient={patient} />;
        case 'Nurse':
          return <NurseAssessmentPrint assessment={assessment as NurseAssessmentData} patient={patient} />;
        default:
          return (
            <div className="print-page">
              <PrintHeader patient={patient} title={`${assessment.role} Assessment`} />
              <PatientInfoCard patient={patient} />
              <div className="text-center text-gray-600 py-8">
                <p>Assessment details for {assessment.role} are being developed.</p>
                <p>تفاصيل التقييم لـ {assessment.role} قيد التطوير.</p>
              </div>
            </div>
          );
      }
    
    default:
      return (
        <div className="print-page">
          <PrintHeader patient={patient} title="Healthcare Document" />
          <PatientInfoCard patient={patient} />
          <div className="text-center text-gray-600 py-8">
            <p>Document type "{type}" is not yet implemented.</p>
            <p>نوع المستند "{type}" غير متاح حالياً.</p>
          </div>
        </div>
      );
  }
};

export default EnhancedPrintTemplate;