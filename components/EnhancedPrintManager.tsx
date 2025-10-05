import React, { useState, useRef } from 'react';
import { Printer, FileText, ClipboardList, Phone, X } from 'lucide-react';
import { Patient, Assessment, Visit, Staff } from '../types';

interface EnhancedPrintManagerProps {
  patient: Patient;
  onClose: () => void;
}

type PrintDocumentType = 'assessments' | 'visit-notes' | 'contact-log';

interface PrintDocument {
  type: PrintDocumentType;
  title: string;
  titleAr: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const printDocuments: PrintDocument[] = [
  {
    type: 'assessments',
    title: 'Medical Assessments',
    titleAr: 'التقييمات الطبية',
    description: 'Complete assessment history and current status',
    icon: ClipboardList,
    color: 'blue'
  },
  {
    type: 'visit-notes',
    title: 'Visit Notes History',
    titleAr: 'سجل ملاحظات الزيارات',
    description: 'All previous visit notes and observations',
    icon: FileText,
    color: 'green'
  },
  {
    type: 'contact-log',
    title: 'Contact Attempts Log',
    titleAr: 'سجل محاولات الاتصال',
    description: 'Communication history and contact attempts',
    icon: Phone,
    color: 'orange'
  }
];

// Enhanced Print Header Component
const PrintHeader: React.FC<{ title: string; titleAr: string; patient: Patient }> = ({ title, titleAr, patient }) => (
  <div className="print-header bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 md:p-6 rounded-t-lg mb-4 md:mb-6 no-print-color-adjust print:bg-blue-700"
       style={{ 
         pageBreakInside: 'avoid',
         marginTop: '10mm',
         marginLeft: '10mm',
         marginRight: '10mm'
       }}>
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-4">
        {/* الشعارات المؤسسية */}
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
            <p className="font-medium">Home Healthcare Division | قسم الرعاية الصحية المنزلية</p>
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
      <p className="text-blue-100">{titleAr}</p>
    </div>
  </div>
);

// Patient Info Component
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
    </div>
  </div>
);

// Assessments Document
const AssessmentsDocument: React.FC<{ patient: Patient }> = ({ patient }) => (
  <div className="print-page">
    <PrintHeader title="Medical Assessments Report" titleAr="تقرير التقييمات الطبية" patient={patient} />
    <PatientInfoCard patient={patient} />
    
    <div className="assessment-details space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="font-bold text-lg text-blue-800 mb-4">Assessment Summary | ملخص التقييمات</h3>
        
        {patient.assessments && patient.assessments.length > 0 ? (
          <div className="space-y-4">
            {patient.assessments.map((assessment, index) => (
              <div key={assessment.id} className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-blue-800">{assessment.role} Assessment</h4>
                    <p className="text-sm text-blue-600">تقييم {assessment.role}</p>
                  </div>
                  <div className="text-right text-sm text-blue-700">
                    <p><strong>Date:</strong> {new Date(assessment.date).toLocaleDateString()}</p>
                    <p><strong>Assessor:</strong> {assessment.assessorName}</p>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  {assessment.role === 'Doctor' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className="ml-2">{(assessment as any).status || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Plan:</span>
                        <span className="ml-2">{(assessment as any).plan || 'N/A'}</span>
                      </div>
                    </div>
                  )}
                  
                  {assessment.role === 'Nurse' && (
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className="ml-2">{(assessment as any).status || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Braden Score:</span>
                        <span className="ml-2">{(assessment as any).bradenScore || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Wound Status:</span>
                        <span className="ml-2">{(assessment as any).woundStatus || 'N/A'}</span>
                      </div>
                    </div>
                  )}
                  
                  {(assessment as any).nurseNote && (
                    <div className="bg-gray-50 p-3 rounded border-l-4 border-green-500">
                      <span className="font-medium text-gray-700 block mb-1">Notes:</span>
                      <p className="text-gray-600 text-sm leading-relaxed">{(assessment as any).nurseNote}</p>
                    </div>
                  )}
                  
                  {(assessment as any).mdNote && (
                    <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                      <span className="font-medium text-gray-700 block mb-1">Medical Notes:</span>
                      <p className="text-gray-600 text-sm leading-relaxed">{(assessment as any).mdNote}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No assessments recorded | لا توجد تقييمات مسجلة</p>
          </div>
        )}
      </div>
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
          <p>Patient ID: {patient.nationalId}</p>
        </div>
      </div>
    </div>
  </div>
);

// Visit Notes Document
const VisitNotesDocument: React.FC<{ patient: Patient }> = ({ patient }) => (
  <div className="print-page">
    <PrintHeader title="Visit Notes History" titleAr="سجل ملاحظات الزيارات" patient={patient} />
    <PatientInfoCard patient={patient} />
    
    <div className="visit-notes-details space-y-6">
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <h3 className="font-bold text-lg text-green-800 mb-4">All Visit Notes | جميع ملاحظات الزيارات</h3>
        
        <div className="space-y-4">
          {/* Mock visit notes - في التطبيق الحقيقي ستأتي من البيانات */}
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-green-800">Doctor Follow-up Visit</h4>
                <p className="text-sm text-green-600">زيارة متابعة طبية</p>
              </div>
              <div className="text-right text-sm text-green-700">
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                <p><strong>Status:</strong> Improved</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                <span className="font-medium text-gray-700 block mb-1">Clinical Impression:</span>
                <p className="text-gray-600">Patient stable with current management plan. Response to treatment is good.</p>
              </div>
              <div className="bg-gray-50 p-3 rounded border-l-4 border-green-500">
                <span className="font-medium text-gray-700 block mb-1">Treatment Rationale:</span>
                <p className="text-gray-600">Continue current treatment approach based on patient response.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-green-800">Nursing Care Visit</h4>
                <p className="text-sm text-green-600">زيارة رعاية تمريضية</p>
              </div>
              <div className="text-right text-sm text-green-700">
                <p><strong>Date:</strong> {new Date(Date.now() - 24*60*60*1000).toLocaleDateString()}</p>
                <p><strong>Status:</strong> Unchanged</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 p-3 rounded border-l-4 border-emerald-500">
                <span className="font-medium text-gray-700 block mb-1">Clinical Findings:</span>
                <p className="text-gray-600">Patient presents with stable vital signs. No acute distress noted.</p>
              </div>
              <div className="bg-gray-50 p-3 rounded border-l-4 border-teal-500">
                <span className="font-medium text-gray-700 block mb-1">Interventions Provided:</span>
                <p className="text-gray-600">Routine nursing care provided. Medication compliance discussed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="print-footer mt-8 pt-4 border-t-2 border-gray-300">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-gray-800">Digital Visit Record</p>
          <p className="text-xs text-gray-600">
            Aseer Health Cluster – King Abdullah Hospital, Bishah
          </p>
          <p className="text-xs text-gray-500">
            تجمع عسير الصحي – مستشفى الملك عبدالله ببيشة
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>Generated: {new Date().toLocaleString()}</p>
          <p>Patient ID: {patient.nationalId}</p>
        </div>
      </div>
    </div>
  </div>
);

// Contact Log Document
const ContactLogDocument: React.FC<{ patient: Patient }> = ({ patient }) => (
  <div className="print-page">
    <PrintHeader title="Contact Attempts Log" titleAr="سجل محاولات الاتصال" patient={patient} />
    <PatientInfoCard patient={patient} />
    
    <div className="contact-log-details space-y-6">
      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
        <h3 className="font-bold text-lg text-orange-800 mb-4">Communication History | تاريخ التواصل</h3>
        
        <div className="space-y-4">
          {patient.contactAttempts && patient.contactAttempts.length > 0 ? (
            patient.contactAttempts.map((attempt, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-orange-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-orange-800">Contact Attempt #{index + 1}</h4>
                    <p className="text-sm text-orange-600">محاولة اتصال رقم {index + 1}</p>
                  </div>
                  <div className="text-right text-sm text-orange-700">
                    <p><strong>Date:</strong> {new Date(attempt.date).toLocaleDateString()}</p>
                    <p><strong>Staff:</strong> {attempt.staffName}</p>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Attempt Type:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        attempt.outcome === 'Successful' 
                          ? 'bg-green-100 text-green-800'
                          : attempt.outcome === 'Rescheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : attempt.type === 'No Answer' || attempt.type === 'Busy'
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {attempt.type}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Time:</span>
                      <span className="ml-2">{new Date(attempt.date).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  
                  {attempt.notes && (
                    <div className="bg-gray-50 p-3 rounded border-l-4 border-orange-500">
                      <span className="font-medium text-gray-700 block mb-1">Notes:</span>
                      <p className="text-gray-600">{attempt.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No contact attempts recorded | لا توجد محاولات اتصال مسجلة</p>
            </div>
          )}
          
          {/* Contact Recommendations */}
          <div className="bg-white rounded-lg p-4 border-2 border-orange-300 mt-6">
            <h4 className="font-semibold text-orange-800 mb-3">Contact Recommendations | توصيات التواصل</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Best Contact Time:</span>
                <span className="ml-2">Morning (8 AM - 12 PM)</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Preferred Method:</span>
                <span className="ml-2">Phone Call</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Attempts:</span>
                <span className="ml-2">{patient.contactAttempts?.length || 0}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Success Rate:</span>
                <span className="ml-2">
                  {patient.contactAttempts?.length > 0 
                    ? `${Math.round((patient.contactAttempts.filter(a => a.type !== 'No Answer' && a.type !== 'Door Not Opened').length / patient.contactAttempts.length) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="print-footer mt-8 pt-4 border-t-2 border-gray-300">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-gray-800">Digital Communication Record</p>
          <p className="text-xs text-gray-600">
            Aseer Health Cluster – King Abdullah Hospital, Bishah
          </p>
          <p className="text-xs text-gray-500">
            تجمع عسير الصحي – مستشفى الملك عبدالله ببيشة
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>Generated: {new Date().toLocaleString()}</p>
          <p>Patient ID: {patient.nationalId}</p>
        </div>
      </div>
    </div>
  </div>
);

const EnhancedPrintManager: React.FC<EnhancedPrintManagerProps> = ({ patient, onClose }) => {
  const [selectedDocument, setSelectedDocument] = useState<PrintDocumentType>('assessments');
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const generatePreview = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setShowPreview(true);
    setIsGenerating(false);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = printRef.current?.innerHTML || '';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Healthcare Report - King Abdullah Hospital</title>
          <meta charset="utf-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: white; }
            .print-page { max-width: none; margin: 0; padding: 20px; font-size: 14px; background: white; }
            .print-header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important; -webkit-print-color-adjust: exact !important; color-adjust: exact !important; color: white !important; }
            .print-no-break { page-break-inside: avoid; break-inside: avoid; }
            .print-footer { page-break-inside: avoid; margin-top: 2rem; }
            
            /* Color preservation */
            .bg-blue-50, .bg-blue-100 { background-color: #eff6ff !important; }
            .bg-green-50, .bg-green-100 { background-color: #f0fdf4 !important; }
            .bg-orange-50, .bg-orange-100 { background-color: #fff7ed !important; }
            .bg-gray-50 { background-color: #f9fafb !important; }
            
            .text-blue-600 { color: #2563eb !important; }
            .text-blue-700 { color: #1d4ed8 !important; }
            .text-blue-800 { color: #1e40af !important; }
            .text-green-600 { color: #16a34a !important; }
            .text-green-700 { color: #15803d !important; }
            .text-green-800 { color: #166534 !important; }
            .text-orange-600 { color: #ea580c !important; }
            .text-orange-700 { color: #c2410c !important; }
            .text-orange-800 { color: #9a3412 !important; }
            
            .border-blue-200 { border-color: #bfdbfe !important; }
            .border-green-200 { border-color: #bbf7d0 !important; }
            .border-orange-200 { border-color: #fed7aa !important; }
            .border-gray-300 { border-color: #d1d5db !important; }
            
            .border-l-4 { border-left-width: 4px !important; }
            .border-blue-500 { border-color: #3b82f6 !important; }
            .border-green-500 { border-color: #22c55e !important; }
            .border-orange-500 { border-color: #f97316 !important; }
            
            .rounded, .rounded-lg { border-radius: 8px; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
            .gap-4 { gap: 1rem; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .items-start { align-items: flex-start; }
            .justify-between { justify-content: space-between; }
            .p-3 { padding: 0.75rem; }
            .p-4 { padding: 1rem; }
            .p-6 { padding: 1.5rem; }
            .mb-1 { margin-bottom: 0.25rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mt-6 { margin-top: 1.5rem; }
            .mt-8 { margin-top: 2rem; }
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
            .border-t-2 { border-top-width: 2px; }
            .border-b { border-bottom-width: 1px; }
            .pt-4 { padding-top: 1rem; }
            .pb-2 { padding-bottom: 0.5rem; }
            .space-y-3 > * + * { margin-top: 0.75rem; }
            .space-y-4 > * + * { margin-top: 1rem; }
            .space-y-6 > * + * { margin-top: 1.5rem; }
            .w-2 { width: 0.5rem; }
            .h-2 { height: 0.5rem; }
            .w-16 { width: 4rem; }
            .h-16 { height: 4rem; }
            .w-20 { width: 5rem; }
            .h-20 { height: 5rem; }
            .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
            
            @page { margin: 0.75in; size: A4; }
            @media print {
              .print-page { margin: 0; padding: 0; }
              .print-no-break { page-break-inside: avoid !important; break-inside: avoid !important; }
              .print-header { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
            }
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

  const renderDocument = () => {
    switch (selectedDocument) {
      case 'assessments':
        return <AssessmentsDocument patient={patient} />;
      case 'visit-notes':
        return <VisitNotesDocument patient={patient} />;
      case 'contact-log':
        return <ContactLogDocument patient={patient} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Printer className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Enhanced Print Manager</h2>
              <p className="text-sm text-gray-600">مدير الطباعة المحسن - {patient.nameAr}</p>
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
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">
              Select Document | اختر المستند
            </h3>
            
            <div className="space-y-3">
              {printDocuments.map((doc) => {
                const Icon = doc.icon;
                return (
                  <button
                    key={doc.type}
                    onClick={() => setSelectedDocument(doc.type)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedDocument === doc.type
                        ? `border-${doc.color}-500 bg-${doc.color}-50`
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedDocument === doc.type 
                          ? `bg-${doc.color}-500 text-white` 
                          : `bg-${doc.color}-100 text-${doc.color}-600`
                      }`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{doc.title}</h4>
                        <p className="text-sm text-gray-600 mb-1">{doc.titleAr}</p>
                        <p className="text-xs text-gray-500">{doc.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              <button
                onClick={generatePreview}
                disabled={isGenerating}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    Generate Preview | معاينة
                  </>
                )}
              </button>

              {showPreview && (
                <button
                  onClick={handlePrint}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2 transition-all"
                >
                  <Printer size={16} />
                  Print Document | طباعة
                </button>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {showPreview ? (
              <div ref={printRef} className="h-full">
                {renderDocument()}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-gray-400" size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Document Preview</h3>
                  <p className="text-gray-600 max-w-sm">
                    Click "Generate Preview" to see your document
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    اضغط "معاينة" لعرض المستند
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

export default EnhancedPrintManager;