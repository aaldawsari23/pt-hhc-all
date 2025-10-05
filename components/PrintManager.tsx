import React, { useState, useRef } from 'react';
import { Printer, Download, FileText, Stethoscope, Activity, Users, Route, ClipboardList } from 'lucide-react';
import { Patient, Assessment, Visit, Staff } from '../types';
import EnhancedPrintTemplate from './EnhancedPrintTemplates';

interface PrintManagerProps {
  patient?: Patient;
  patients?: Patient[];
  visit?: Visit;
  assessment?: Assessment;
  staff?: Staff[];
  onClose: () => void;
}

type PrintType = 'visit' | 'assessment' | 'patient-summary' | 'care-plan' | 'driver-route' | 'visit-history' | 'assessment-history';

interface PrintOption {
  type: PrintType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  available: boolean;
  requiresData?: string[];
}

const PrintManager: React.FC<PrintManagerProps> = ({ 
  patient, 
  patients, 
  visit, 
  assessment, 
  staff, 
  onClose 
}) => {
  const [selectedType, setSelectedType] = useState<PrintType>('visit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const printOptions: PrintOption[] = [
    {
      type: 'visit',
      label: 'Visit Report',
      description: 'Complete visit documentation with all team assessments',
      icon: FileText,
      color: 'blue',
      available: !!visit && !!patient,
      requiresData: ['visit', 'patient']
    },
    {
      type: 'assessment',
      label: 'Assessment Report',
      description: 'Detailed clinical assessment by specific role',
      icon: Stethoscope,
      color: 'green',
      available: !!assessment && !!patient,
      requiresData: ['assessment', 'patient']
    },
    {
      type: 'visit-history',
      label: 'سجل الزيارات | Visit History',
      description: 'Complete history of all patient visits',
      icon: FileText,
      color: 'teal',
      available: !!patient,
      requiresData: ['patient']
    },
    {
      type: 'assessment-history',
      label: 'سجل التقييم | Assessment History',
      description: 'Complete history of all assessments',
      icon: ClipboardList,
      color: 'cyan',
      available: !!patient,
      requiresData: ['patient']
    },
    {
      type: 'patient-summary',
      label: 'Patient Summary',
      description: 'Comprehensive patient overview with history',
      icon: Activity,
      color: 'purple',
      available: !!patient,
      requiresData: ['patient']
    },
    {
      type: 'care-plan',
      label: 'Care Plan',
      description: 'Individualized care plan and goals',
      icon: Users,
      color: 'orange',
      available: !!patient,
      requiresData: ['patient']
    },
    {
      type: 'driver-route',
      label: 'Driver Route',
      description: 'Optimized route for patient visits',
      icon: Route,
      color: 'indigo',
      available: !!patients && patients.length > 0,
      requiresData: ['patients']
    }
  ];

  const generatePrint = async () => {
    if (!selectedType) return;
    
    setIsGenerating(true);
    
    // Simulate generation time for user feedback
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
      <html dir="rtl">
        <head>
          <title>Healthcare Report - King Abdullah Hospital</title>
          <meta charset="utf-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
            }
            
            .print-page {
              max-width: none;
              margin: 0;
              padding: 20px;
              font-size: 14px;
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
            
            .print-footer {
              page-break-inside: avoid;
              margin-top: 2rem;
            }
            
            /* Color preservation for print */
            .bg-blue-50, .bg-blue-100 { background-color: #eff6ff !important; }
            .bg-green-50, .bg-green-100 { background-color: #f0fdf4 !important; }
            .bg-red-50, .bg-red-100 { background-color: #fef2f2 !important; }
            .bg-purple-50, .bg-purple-100 { background-color: #faf5ff !important; }
            .bg-orange-50, .bg-orange-100 { background-color: #fff7ed !important; }
            .bg-indigo-50, .bg-indigo-100 { background-color: #eef2ff !important; }
            .bg-yellow-50, .bg-yellow-100 { background-color: #fefce8 !important; }
            .bg-pink-50, .bg-pink-100 { background-color: #fdf2f8 !important; }
            .bg-teal-50, .bg-teal-100 { background-color: #f0fdfa !important; }
            
            .text-blue-600 { color: #2563eb !important; }
            .text-blue-700 { color: #1d4ed8 !important; }
            .text-blue-800 { color: #1e40af !important; }
            .text-green-600 { color: #16a34a !important; }
            .text-green-700 { color: #15803d !important; }
            .text-green-800 { color: #166534 !important; }
            .text-red-600 { color: #dc2626 !important; }
            .text-red-700 { color: #b91c1c !important; }
            .text-red-800 { color: #991b1b !important; }
            
            .border-blue-200 { border-color: #bfdbfe !important; }
            .border-green-200 { border-color: #bbf7d0 !important; }
            .border-red-200 { border-color: #fecaca !important; }
            .border-purple-200 { border-color: #e9d5ff !important; }
            .border-orange-200 { border-color: #fed7aa !important; }
            .border-indigo-200 { border-color: #c7d2fe !important; }
            .border-yellow-200 { border-color: #fef08a !important; }
            .border-pink-200 { border-color: #fbcfe8 !important; }
            .border-teal-200 { border-color: #99f6e4 !important; }
            
            .border-l-4 { border-left-width: 4px !important; }
            .border-blue-500 { border-color: #3b82f6 !important; }
            .border-green-500 { border-color: #22c55e !important; }
            .border-red-500 { border-color: #ef4444 !important; }
            .border-purple-500 { border-color: #a855f7 !important; }
            .border-orange-500 { border-color: #f97316 !important; }
            .border-pink-500 { border-color: #ec4899 !important; }
            .border-indigo-500 { border-color: #6366f1 !important; }
            .border-yellow-500 { border-color: #eab308 !important; }
            
            .rounded, .rounded-lg, .rounded-xl { border-radius: 8px; }
            .rounded-full { border-radius: 50%; }
            
            .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
            .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
            
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
            .grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
            .gap-2 { gap: 0.5rem; }
            .gap-3 { gap: 0.75rem; }
            .gap-4 { gap: 1rem; }
            .gap-8 { gap: 2rem; }
            
            .flex { display: flex; }
            .items-center { align-items: center; }
            .items-start { align-items: flex-start; }
            .justify-between { justify-content: space-between; }
            .flex-1 { flex: 1 1 0%; }
            
            .p-2 { padding: 0.5rem; }
            .p-3 { padding: 0.75rem; }
            .p-4 { padding: 1rem; }
            .p-6 { padding: 1.5rem; }
            .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
            .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
            .pt-4 { padding-top: 1rem; }
            .pb-2 { padding-bottom: 0.5rem; }
            .ml-2 { margin-left: 0.5rem; }
            .mb-1 { margin-bottom: 0.25rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-4 { margin-top: 1rem; }
            .mt-8 { margin-top: 2rem; }
            
            .text-xs { font-size: 0.75rem; }
            .text-sm { font-size: 0.875rem; }
            .text-base { font-size: 1rem; }
            .text-lg { font-size: 1.125rem; }
            .text-xl { font-size: 1.25rem; }
            .text-2xl { font-size: 1.5rem; }
            
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .font-mono { font-family: monospace; }
            
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            
            .border { border-width: 1px; }
            .border-t { border-top-width: 1px; }
            .border-t-2 { border-top-width: 2px; }
            .border-b { border-bottom-width: 1px; }
            
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .space-y-4 > * + * { margin-top: 1rem; }
            .gap-2 { gap: 0.5rem; }
            
            .w-2 { width: 0.5rem; }
            .h-2 { height: 0.5rem; }
            .w-16 { width: 4rem; }
            .h-16 { height: 4rem; }
            
            .whitespace-pre-wrap { white-space: pre-wrap; }
            .leading-relaxed { line-height: 1.625; }
            
            @page {
              margin: 0.75in;
              size: A4;
            }
            
            @media print {
              .print-page {
                margin: 0;
                padding: 0;
              }
              
              .print-no-break {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              
              .print-header {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
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
    
    // Wait a bit for content to load, then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const selectedOption = printOptions.find(opt => opt.type === selectedType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Printer className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Print Manager</h2>
              <p className="text-sm text-gray-600">Generate professional healthcare reports</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Options */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Select Report Type</h3>
            <div className="space-y-3">
              {printOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.type}
                    onClick={() => setSelectedType(option.type)}
                    disabled={!option.available}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedType === option.type
                        ? `border-${option.color}-500 bg-${option.color}-50`
                        : option.available
                        ? 'border-gray-200 hover:border-gray-300 bg-white'
                        : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedType === option.type 
                          ? `bg-${option.color}-500 text-white` 
                          : `bg-${option.color}-100 text-${option.color}-600`
                      }`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{option.label}</h4>
                        <p className="text-sm text-gray-600">{option.description}</p>
                        {!option.available && (
                          <p className="text-xs text-red-500 mt-1">
                            Missing required data: {option.requiresData?.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={generatePrint}
                disabled={!selectedOption?.available || isGenerating}
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
                    Generate Preview
                  </>
                )}
              </button>

              {showPreview && (
                <button
                  onClick={handlePrint}
                  className="w-full mt-3 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2 transition-all"
                >
                  <Printer size={16} />
                  Print Document
                </button>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {showPreview && selectedOption?.available ? (
              <div ref={printRef} className="h-full">
                <EnhancedPrintTemplate
                  patient={patient!}
                  patients={patients}
                  visit={visit}
                  assessment={assessment}
                  staff={staff}
                  type={selectedType}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-gray-400" size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Area</h3>
                  <p className="text-gray-600 max-w-sm">
                    {selectedOption?.available 
                      ? 'Click "Generate Preview" to see your document'
                      : 'Select an available report type to continue'
                    }
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

export default PrintManager;