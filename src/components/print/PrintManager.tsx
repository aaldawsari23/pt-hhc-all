import React, { useState } from 'react';
import { Printer, FileText, ClipboardList, Calendar, CheckSquare } from 'lucide-react';
import type { Patient, Note, Assessment } from '../../data/models';
import { repo } from '../../data/local/repo';
import { PatientSummaryTemplate } from './templates/PatientSummaryTemplate';
import { NotesSelectionTemplate } from './templates/NotesSelectionTemplate';
import { LatestAssessmentTemplate } from './templates/LatestAssessmentTemplate';

interface PrintManagerProps {
  patient: Patient;
}

type PrintTemplate = 'summary' | 'notes' | 'assessment' | 'plan';

interface PrintOptions {
  template: PrintTemplate;
  includeRedFlags: boolean;
  includeTags: boolean;
  notesDateRange?: {
    from: string;
    to: string;
  };
  notesTypes?: string[];
}

const PRINT_TEMPLATES = [
  { id: 'summary', label: 'ملخص المريض', icon: <FileText className="w-4 h-4" />, description: 'معلومات أساسية + تحذيرات + تشخيصات' },
  { id: 'notes', label: 'النوتات المختارة', icon: <ClipboardList className="w-4 h-4" />, description: 'نوتات محددة بتاريخ ونوع' },
  { id: 'assessment', label: 'آخر تقييم', icon: <Calendar className="w-4 h-4" />, description: 'أحدث تقييم شامل' },
  { id: 'plan', label: 'خطة العلاج', icon: <CheckSquare className="w-4 h-4" />, description: 'خطة علاجية ومتابعة' },
];

export function PrintManager({ patient }: PrintManagerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<PrintTemplate>('summary');
  const [options, setOptions] = useState<PrintOptions>({
    template: 'summary',
    includeRedFlags: true,
    includeTags: true,
    notesDateRange: {
      from: '',
      to: '',
    },
    notesTypes: [],
  });
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    setLoading(true);
    try {
      // Show preview first
      setPreview(true);
      
      // Small delay to ensure preview renders
      setTimeout(() => {
        window.print();
        setPreview(false);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Print error:', error);
      setLoading(false);
    }
  };

  const renderPreview = () => {
    switch (selectedTemplate) {
      case 'summary':
        return <PatientSummaryTemplate patient={patient} options={options} />;
      case 'notes':
        return <NotesSelectionTemplate patient={patient} options={options} />;
      case 'assessment':
        return <LatestAssessmentTemplate patient={patient} options={options} />;
      case 'plan':
        return (
          <div className="p-8 bg-white">
            <h2 className="text-xl font-bold mb-4">خطة العلاج - {patient.name}</h2>
            <p className="text-gray-600">سيتم تطوير هذا القالب قريباً...</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (preview) {
    return (
      <div className="print-container">
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-container, .print-container * {
              visibility: visible;
            }
            .print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>
        {renderPreview()}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">طباعة ملف المريض</h2>
        <p className="text-gray-600">{patient.name} - #{patient.mrn}</p>
      </div>

      {/* Template Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">اختر نوع التقرير</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRINT_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setSelectedTemplate(template.id as PrintTemplate);
                setOptions(prev => ({ ...prev, template: template.id as PrintTemplate }));
              }}
              className={`
                p-4 border-2 rounded-lg text-right transition-colors
                ${selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 text-gray-900'
                }
              `}
            >
              <div className="flex items-center gap-3 mb-2">
                {template.icon}
                <span className="font-medium">{template.label}</span>
              </div>
              <p className="text-sm opacity-75">{template.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">خيارات الطباعة</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="includeRedFlags"
              checked={options.includeRedFlags}
              onChange={(e) => setOptions(prev => ({ ...prev, includeRedFlags: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="includeRedFlags" className="text-sm font-medium text-gray-700">
              تضمين التحذيرات المهمة
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="includeTags"
              checked={options.includeTags}
              onChange={(e) => setOptions(prev => ({ ...prev, includeTags: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="includeTags" className="text-sm font-medium text-gray-700">
              تضمين العلامات والتصنيفات
            </label>
          </div>

          {selectedTemplate === 'notes' && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
                <input
                  type="date"
                  value={options.notesDateRange?.from || ''}
                  onChange={(e) => setOptions(prev => ({
                    ...prev,
                    notesDateRange: { ...prev.notesDateRange!, from: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
                <input
                  type="date"
                  value={options.notesDateRange?.to || ''}
                  onChange={(e) => setOptions(prev => ({
                    ...prev,
                    notesDateRange: { ...prev.notesDateRange!, to: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">معاينة التقرير</h3>
        <div className="border border-gray-200 rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
          {renderPreview()}
        </div>
      </div>

      {/* Print Button */}
      <div className="flex justify-center">
        <button
          onClick={handlePrint}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Printer className="w-5 h-5" />
          {loading ? 'جاري التحضير...' : 'طباعة التقرير'}
        </button>
      </div>
    </div>
  );
}