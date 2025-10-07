import React from 'react';
import type { Patient } from '../../../data/models';
import { PrintHeader, PrintFooter } from '../PrintHeader';

interface PatientSummaryTemplateProps {
  patient: Patient;
  options: {
    includeRedFlags: boolean;
    includeTags: boolean;
  };
}

export function PatientSummaryTemplate({ patient, options }: PatientSummaryTemplateProps) {
  return (
    <div className="print-page p-8 bg-white">
      {/* Header with Logo */}
      <PrintHeader 
        title="ملخص ملف المريض"
        subtitle={`المريض: ${patient.name}`}
        patientMRN={patient.mrn}
        showLogo={true}
      />

      {/* Patient Info */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">معلومات المريض</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex">
              <span className="font-medium text-gray-700 w-24">الاسم:</span>
              <span className="text-gray-900">{patient.name}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-24">رقم الملف:</span>
              <span className="text-gray-900">{patient.mrn}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-24">تاريخ الميلاد:</span>
              <span className="text-gray-900">{patient.dob || 'غير متوفر'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-medium text-gray-700 w-24">الهاتف:</span>
              <span className="text-gray-900">{patient.phones?.join(', ') || 'غير متوفر'}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-24">آخر زيارة:</span>
              <span className="text-gray-900">{patient.lastVisit || 'لم تحدد'}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-24">العنوان:</span>
              <span className="text-gray-900">{patient.address || 'غير متوفر'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Red Flags */}
      {options.includeRedFlags && patient.redFlags && patient.redFlags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-red-700 mb-4">⚠️ تحذيرات مهمة</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <ul className="space-y-1">
              {patient.redFlags.map((flag, index) => (
                <li key={index} className="text-red-800 font-medium">
                  • {flag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Diagnoses */}
      {patient.diagnoses && patient.diagnoses.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">التشخيصات</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-2">
              {patient.diagnoses.map((diagnosis, index) => (
                <div key={index} className="text-blue-800 font-medium">
                  • {diagnosis}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      {options.includeTags && patient.tags && patient.tags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">العلامات والتصنيفات</h2>
          <div className="flex flex-wrap gap-2">
            {patient.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <PrintFooter additionalInfo="تقرير ملخص شامل للحالة الطبية والاجتماعية للمريض" />

      <style jsx>{`
        @media print {
          .print-page {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 20mm;
            font-size: 12pt;
            line-height: 1.4;
          }
          
          body {
            margin: 0;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}