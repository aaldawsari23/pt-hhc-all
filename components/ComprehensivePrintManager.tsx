import React, { useState, useRef } from 'react';
import { Printer, FileText, Save, Eye, Download, X, Users, Calendar, ClipboardList, Phone, History, Activity, Shield, HeartHandshake } from 'lucide-react';
import { Patient, Assessment, Visit, Staff, Role } from '../types';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import UnifiedFormHeader from './UnifiedFormHeader';

interface ComprehensivePrintManagerProps {
  patient?: Patient;
  patients?: Patient[];
  visit?: Visit;
  assessment?: Assessment;
  onClose: () => void;
}

type DocumentType = 
  | 'patient-summary' 
  | 'medical-assessments' 
  | 'visit-notes' 
  | 'contact-log' 
  | 'team-assignments' 
  | 'monthly-report'
  | 'unified-notes'
  | 'care-plan';

interface DocumentTemplate {
  type: DocumentType;
  title: string;
  titleAr: string;
  description: string;
  icon: React.ElementType;
  color: string;
  available: boolean;
  requiresData?: string[];
  category: 'patient' | 'visit' | 'administrative' | 'reports';
}

const ComprehensivePrintManager: React.FC<ComprehensivePrintManagerProps> = ({
  patient,
  patients,
  visit,
  assessment,
  onClose
}) => {
  const { state } = useHomeHealthcare();
  const [selectedDocument, setSelectedDocument] = useState<DocumentType>('patient-summary');
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const documentTemplates: DocumentTemplate[] = [
    // Patient Documents
    {
      type: 'patient-summary',
      title: 'Patient Summary Report',
      titleAr: 'تقرير ملخص المريض',
      description: 'Complete patient overview with medical history',
      icon: Users,
      color: 'blue',
      available: !!patient,
      category: 'patient'
    },
    {
      type: 'medical-assessments',
      title: 'Medical Assessments History',
      titleAr: 'تاريخ التقييمات الطبية',
      description: 'All assessments by healthcare team',
      icon: ClipboardList,
      color: 'green',
      available: !!patient && !!patient.assessments?.length,
      category: 'patient'
    },
    {
      type: 'contact-log',
      title: 'Communication Log',
      titleAr: 'سجل التواصل',
      description: 'Contact attempts and communication history',
      icon: Phone,
      color: 'orange',
      available: !!patient,
      category: 'patient'
    },
    
    // Visit Documents
    {
      type: 'visit-notes',
      title: 'Visit Documentation',
      titleAr: 'توثيق الزيارة',
      description: 'Complete visit notes from all team members',
      icon: FileText,
      color: 'purple',
      available: !!visit && !!patient,
      category: 'visit'
    },
    {
      type: 'unified-notes',
      title: 'Unified Team Notes',
      titleAr: 'ملاحظات الفريق الموحدة',
      description: 'Doctor and nurse notes on single page',
      icon: HeartHandshake,
      color: 'indigo',
      available: !!visit && !!patient && (!!visit.doctorNote || !!visit.nurseNote),
      category: 'visit'
    },
    
    // Administrative Documents
    {
      type: 'team-assignments',
      title: 'Team Assignment Report',
      titleAr: 'تقرير تكليفات الفريق',
      description: 'Current team assignments and schedules',
      icon: Users,
      color: 'teal',
      available: !!patients && patients.length > 0,
      category: 'administrative'
    },
    {
      type: 'care-plan',
      title: 'Individual Care Plan',
      titleAr: 'خطة الرعاية الفردية',
      description: 'Personalized care plan and goals',
      icon: Shield,
      color: 'pink',
      available: !!patient,
      category: 'administrative'
    },
    
    // Reports
    {
      type: 'monthly-report',
      title: 'Monthly Activity Report',
      titleAr: 'التقرير الشهري للأنشطة',
      description: 'Summary of monthly activities and statistics',
      icon: Activity,
      color: 'emerald',
      available: true,
      category: 'reports'
    }
  ];

  const categorizedTemplates = documentTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, DocumentTemplate[]>);

  const generatePreview = async () => {
    if (!selectedDocument) return;
    
    setIsGenerating(true);
    
    // Simulate data preparation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Prepare data based on document type
    const data = prepareDocumentData(selectedDocument);
    setPreviewData(data);
    setShowPreview(true);
    setIsGenerating(false);
  };

  const prepareDocumentData = (docType: DocumentType) => {
    switch (docType) {
      case 'patient-summary':
        return {
          patient,
          assessments: patient?.assessments || [],
          contactAttempts: patient?.contactAttempts || [],
          visits: state.visits.filter(v => v.patientId === patient?.nationalId) || []
        };
      
      case 'medical-assessments':
        return {
          patient,
          assessments: patient?.assessments || [],
          groupedByRole: patient?.assessments?.reduce((acc, assessment) => {
            if (!acc[assessment.role]) acc[assessment.role] = [];
            acc[assessment.role].push(assessment);
            return acc;
          }, {} as Record<Role, Assessment[]>) || {}
        };
      
      case 'visit-notes':
        return {
          patient,
          visit,
          team: state.teams.find(t => t.id === visit?.teamId),
          staff: state.staff
        };
      
      case 'unified-notes':
        return {
          patient,
          visit,
          doctorNote: visit?.doctorNote,
          nurseNote: visit?.nurseNote,
          doctorSign: visit?.doctorSign,
          nurseSign: visit?.nurseSign
        };
      
      case 'contact-log':
        return {
          patient,
          contactAttempts: patient?.contactAttempts || [],
          totalAttempts: patient?.contactAttempts?.length || 0,
          successfulContacts: patient?.contactAttempts?.filter(c => 
            c.type !== 'No Answer' && c.type !== 'Door Not Opened'
          ).length || 0
        };
      
      case 'team-assignments':
        return {
          teams: state.teams,
          patients: patients || state.patients,
          visits: state.visits,
          staff: state.staff
        };
      
      case 'care-plan':
        return {
          patient,
          latestAssessments: patient?.assessments?.reduce((acc, assessment) => {
            if (!acc[assessment.role] || new Date(assessment.date) > new Date(acc[assessment.role].date)) {
              acc[assessment.role] = assessment;
            }
            return acc;
          }, {} as Record<Role, Assessment>) || {}
        };
      
      case 'monthly-report':
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          month: today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          monthAr: today.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' }),
          totalPatients: state.patients.length,
          activePatients: state.patients.filter(p => p.status === 'active').length,
          totalVisits: state.visits.length,
          completedVisits: state.visits.filter(v => v.status === 'Completed').length,
          totalAssessments: state.patients.reduce((sum, p) => sum + (p.assessments?.length || 0), 0),
          teams: state.teams
        };
      
      default:
        return {};
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !printRef.current) return;

    const printContent = printRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${getSelectedTemplate()?.title} - King Abdullah Hospital</title>
          <meta charset="utf-8">
          <style>
            ${getPrintStyles()}
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const getPrintStyles = () => `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      background: white; 
      font-size: 14px;
    }
    .print-page { 
      max-width: none; 
      margin: 0; 
      padding: 20px; 
      background: white; 
    }
    .print-header { 
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important; 
      -webkit-print-color-adjust: exact !important; 
      color-adjust: exact !important; 
      color: white !important; 
    }
    .print-no-break { 
      page-break-inside: avoid; 
      break-inside: avoid; 
    }
    
    /* Color preservation */
    .bg-blue-50 { background-color: #eff6ff !important; }
    .bg-green-50 { background-color: #f0fdf4 !important; }
    .bg-orange-50 { background-color: #fff7ed !important; }
    .bg-purple-50 { background-color: #faf5ff !important; }
    .bg-indigo-50 { background-color: #eef2ff !important; }
    .bg-gray-50 { background-color: #f9fafb !important; }
    
    .text-blue-600 { color: #2563eb !important; }
    .text-green-600 { color: #16a34a !important; }
    .text-orange-600 { color: #ea580c !important; }
    .text-purple-600 { color: #9333ea !important; }
    .text-indigo-600 { color: #4f46e5 !important; }
    
    .border-blue-200 { border-color: #bfdbfe !important; }
    .border-green-200 { border-color: #bbf7d0 !important; }
    .border-orange-200 { border-color: #fed7aa !important; }
    .border-purple-200 { border-color: #e9d5ff !important; }
    .border-indigo-200 { border-color: #c7d2fe !important; }
    
    .border-l-4 { border-left-width: 4px !important; }
    .border-blue-500 { border-color: #3b82f6 !important; }
    .border-green-500 { border-color: #22c55e !important; }
    .border-orange-500 { border-color: #f97316 !important; }
    .border-purple-500 { border-color: #a855f7 !important; }
    .border-indigo-500 { border-color: #6366f1 !important; }
    
    .rounded, .rounded-lg { border-radius: 8px; }
    .grid { display: grid; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .p-3 { padding: 0.75rem; }
    .p-4 { padding: 1rem; }
    .p-6 { padding: 1.5rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-6 { margin-top: 1.5rem; }
    .text-xs { font-size: 0.75rem; }
    .text-sm { font-size: 0.875rem; }
    .text-lg { font-size: 1.125rem; }
    .text-xl { font-size: 1.25rem; }
    .text-2xl { font-size: 1.5rem; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .border-t { border-top-width: 1px; }
    .border-t-2 { border-top-width: 2px; }
    .border-b { border-bottom-width: 1px; }
    .pt-4 { padding-top: 1rem; }
    .pb-2 { padding-bottom: 0.5rem; }
    .space-y-3 > * + * { margin-top: 0.75rem; }
    .space-y-4 > * + * { margin-top: 1rem; }
    .space-y-6 > * + * { margin-top: 1.5rem; }
    
    @page { margin: 0.75in; size: A4; }
    @media print {
      .print-page { margin: 0; padding: 0; }
      .print-no-break { page-break-inside: avoid !important; }
      .print-header { -webkit-print-color-adjust: exact !important; }
    }
  `;

  const getSelectedTemplate = () => documentTemplates.find(t => t.type === selectedDocument);

  const renderDocumentPreview = () => {
    if (!previewData || !selectedDocument) return null;

    return (
      <div className="print-page">
        <UnifiedFormHeader 
          title={getSelectedTemplate()?.title || ''}
          titleAr={getSelectedTemplate()?.titleAr || ''}
          patient={patient}
          subtitle={getSelectedTemplate()?.description}
          showIcons={true}
        />
        
        {/* Document content will be rendered here based on type */}
        <div className="mt-6 space-y-6">
          {renderDocumentContent()}
        </div>
        
        {/* Footer */}
        <div className="mt-8 pt-4 border-t-2 border-gray-300 text-xs text-gray-600">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Digital Healthcare Record</p>
              <p>Aseer Health Cluster – King Abdullah Hospital, Bishah</p>
              <p>تجمع عسير الصحي – مستشفى الملك عبدالله ببيشة</p>
            </div>
            <div className="text-right">
              <p>Generated: {new Date().toLocaleString()}</p>
              <p>Document ID: DOC-{Date.now().toString().slice(-6)}</p>
              {patient && <p>Patient ID: {patient.nationalId}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDocumentContent = () => {
    switch (selectedDocument) {
      case 'unified-notes':
        return renderUnifiedNotesContent();
      case 'patient-summary':
        return renderPatientSummaryContent();
      case 'medical-assessments':
        return renderMedicalAssessmentsContent();
      case 'contact-log':
        return renderContactLogContent();
      default:
        return <div className="text-center py-8 text-gray-500">Content for {selectedDocument} will be implemented</div>;
    }
  };

  const renderUnifiedNotesContent = () => {
    const { doctorNote, nurseNote, doctorSign, nurseSign } = previewData;
    
    return (
      <div className="space-y-6">
        {/* Patient Info Summary */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-3">Patient Information | معلومات المريض</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Name:</span>
              <p className="font-bold">{patient?.nameAr}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">ID:</span>
              <p className="font-bold">{patient?.nationalId}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Visit Date:</span>
              <p className="font-bold">{visit?.date}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Status:</span>
              <p className="font-bold">{visit?.status}</p>
            </div>
          </div>
        </div>

        {/* Doctor and Nurse Notes Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Doctor Note */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 print-no-break">
            <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">Dr</span>
              </div>
              Doctor's Assessment | تقييم الطبيب
            </h4>
            {doctorNote ? (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="ml-2">{doctorNote.status}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Response to Plan:</span>
                    <span className="ml-2">{doctorNote.responseToPlan}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Adherence:</span>
                    <span className="ml-2">{doctorNote.adherence}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Plan:</span>
                    <span className="ml-2">{doctorNote.plan}</span>
                  </div>
                </div>
                
                {doctorNote.newIssues && doctorNote.newIssues.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700 block mb-1">New Issues:</span>
                    <p className="text-gray-600">{doctorNote.newIssues.join(', ')}</p>
                  </div>
                )}
                
                {doctorNote.planDetails && doctorNote.planDetails.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700 block mb-1">Plan Details:</span>
                    <p className="text-gray-600">{doctorNote.planDetails.join(', ')}</p>
                  </div>
                )}
                
                <div>
                  <span className="font-medium text-gray-700">Next Follow-up:</span>
                  <span className="ml-2">{doctorNote.nextFollowUp}</span>
                </div>
                
                {doctorNote.mdNote && (
                  <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
                    <span className="font-medium text-gray-700 block mb-1">Clinical Notes:</span>
                    <p className="text-gray-600 leading-relaxed">{doctorNote.mdNote}</p>
                  </div>
                )}
                
                {doctorSign && (
                  <div className="mt-4 pt-3 border-t border-blue-200">
                    <p className="text-blue-700 font-medium text-sm">✓ Digitally Signed by: {doctorSign}</p>
                    <p className="text-blue-600 text-xs">Date: {new Date().toLocaleString()}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">No doctor assessment available</p>
            )}
          </div>

          {/* Nurse Note */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200 print-no-break">
            <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">RN</span>
              </div>
              Nursing Assessment | تقييم التمريض
            </h4>
            {nurseNote ? (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="ml-2">{nurseNote.status}</span>
                </div>
                
                {nurseNote.vitals && (
                  <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
                    <span className="font-medium text-gray-700 block mb-2">Vital Signs:</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {nurseNote.vitals.temp && <span>Temp: {nurseNote.vitals.temp}°C</span>}
                      {nurseNote.vitals.bp && <span>BP: {nurseNote.vitals.bp}</span>}
                      {nurseNote.vitals.hr && <span>HR: {nurseNote.vitals.hr}</span>}
                      {nurseNote.vitals.rr && <span>RR: {nurseNote.vitals.rr}</span>}
                      {nurseNote.vitals.o2sat && <span>SpO₂: {nurseNote.vitals.o2sat}%</span>}
                      {nurseNote.vitals.pain && <span>Pain: {nurseNote.vitals.pain}/10</span>}
                    </div>
                  </div>
                )}
                
                {nurseNote.tasks && nurseNote.tasks.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700 block mb-1">Tasks Completed:</span>
                    <p className="text-gray-600">{nurseNote.tasks.join(', ')}</p>
                  </div>
                )}
                
                {(nurseNote.woundDelta || nurseNote.deviceDelta) && (
                  <div className="grid grid-cols-2 gap-3">
                    {nurseNote.woundDelta && (
                      <div>
                        <span className="font-medium text-gray-700">Wound Status:</span>
                        <span className="ml-2">{nurseNote.woundDelta}</span>
                      </div>
                    )}
                    {nurseNote.deviceDelta && (
                      <div>
                        <span className="font-medium text-gray-700">Device Status:</span>
                        <span className="ml-2">{nurseNote.deviceDelta}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {nurseNote.escalation && (
                  <div>
                    <span className="font-medium text-gray-700">Escalation Required:</span>
                    <span className={`ml-2 ${nurseNote.escalation === 'Yes' ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                      {nurseNote.escalation}
                    </span>
                  </div>
                )}
                
                {nurseNote.nurseNote && (
                  <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
                    <span className="font-medium text-gray-700 block mb-1">Nursing Notes:</span>
                    <p className="text-gray-600 leading-relaxed">{nurseNote.nurseNote}</p>
                  </div>
                )}
                
                {nurseSign && (
                  <div className="mt-4 pt-3 border-t border-green-200">
                    <p className="text-green-700 font-medium text-sm">✓ Digitally Signed by: {nurseSign}</p>
                    <p className="text-green-600 text-xs">Date: {new Date().toLocaleString()}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">No nursing assessment available</p>
            )}
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <h4 className="font-bold text-indigo-800 mb-3">Visit Summary | ملخص الزيارة</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Overall Status:</span>
              <p className="font-bold text-indigo-700">{visit?.status}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Team Members:</span>
              <p>{doctorSign && nurseSign ? 'Doctor + Nurse' : doctorSign ? 'Doctor Only' : nurseSign ? 'Nurse Only' : 'Pending'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Completion:</span>
              <p className="font-bold text-indigo-700">
                {visit?.status === 'Completed' ? '100%' : visit?.status === 'DoctorCompleted' ? '50%' : visit?.status === 'NurseCompleted' ? '50%' : '0%'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPatientSummaryContent = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="font-bold text-blue-800 mb-3">Patient Overview</h3>
        <p>Patient summary content will be displayed here...</p>
      </div>
    </div>
  );

  const renderMedicalAssessmentsContent = () => (
    <div className="space-y-4">
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <h3 className="font-bold text-green-800 mb-3">Medical Assessments</h3>
        <p>Medical assessments content will be displayed here...</p>
      </div>
    </div>
  );

  const renderContactLogContent = () => (
    <div className="space-y-4">
      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
        <h3 className="font-bold text-orange-800 mb-3">Contact Log</h3>
        <p>Contact log content will be displayed here...</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 md:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Printer className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Comprehensive Print Manager</h2>
              <p className="text-sm text-gray-600">مدير الطباعة الشامل - Professional Healthcare Documents</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Document Selection */}
          <div className="w-1/3 border-r border-gray-200 p-4 md:p-6 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Select Document Template</h3>
            
            {Object.entries(categorizedTemplates).map(([category, templates]) => (
              <div key={category} className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
                  {category.replace('-', ' ')}
                </h4>
                <div className="space-y-2">
                  {templates.map((template) => {
                    const Icon = template.icon;
                    return (
                      <button
                        key={template.type}
                        onClick={() => setSelectedDocument(template.type)}
                        disabled={!template.available}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${
                          selectedDocument === template.type
                            ? `border-${template.color}-500 bg-${template.color}-50`
                            : template.available
                            ? 'border-gray-200 hover:border-gray-300 bg-white'
                            : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                            selectedDocument === template.type 
                              ? `bg-${template.color}-500 text-white` 
                              : `bg-${template.color}-100 text-${template.color}-600`
                          }`}>
                            <Icon size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 truncate">{template.title}</h5>
                            <p className="text-xs text-gray-600 mb-1 truncate">{template.titleAr}</p>
                            <p className="text-xs text-gray-500">{template.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              <button
                onClick={generatePreview}
                disabled={!getSelectedTemplate()?.available || isGenerating}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Eye size={16} />
                    Generate Preview
                  </>
                )}
              </button>

              {showPreview && (
                <div className="space-y-2">
                  <button
                    onClick={handlePrint}
                    className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2 transition-all"
                  >
                    <Printer size={16} />
                    Print Document
                  </button>
                  
                  <button
                    onClick={() => {
                      // TODO: Implement save functionality
                      console.log('Save document');
                    }}
                    className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 flex items-center justify-center gap-2 transition-all"
                  >
                    <Save size={16} />
                    Save to Records
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {showPreview ? (
              <div ref={printRef} className="h-full">
                {renderDocumentPreview()}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-gray-400" size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Document Preview</h3>
                  <p className="text-gray-600 max-w-sm mb-2">
                    Select a document template and click "Generate Preview" to see your document
                  </p>
                  <p className="text-gray-500 text-sm">
                    اختر نموذج مستند واضغط "معاينة" لعرض المستند
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensivePrintManager;