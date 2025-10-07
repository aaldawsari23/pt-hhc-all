import React, { useState, useEffect } from 'react';
import type { Patient, Assessment } from '../../../data/models';
import { repo } from '../../../data/local/repo';
import { PrintHeader, PrintFooter } from '../PrintHeader';

interface LatestAssessmentTemplateProps {
  patient: Patient;
  options: any;
}

export function LatestAssessmentTemplate({ patient, options }: LatestAssessmentTemplateProps) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date().toLocaleDateString('ar-SA');

  useEffect(() => {
    loadLatestAssessment();
  }, [patient.id]);

  const loadLatestAssessment = async () => {
    try {
      setLoading(true);
      // TODO: Implement assessment loading from repo
      // For now, show placeholder
      setAssessment(null);
    } catch (error) {
      console.error('Error loading assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p>جاري تحميل التقييم...</p>
      </div>
    );
  }

  return (
    <div className="print-page p-8 bg-white">
      {/* Header with Logo */}
      <PrintHeader 
        title="تقرير آخر تقييم طبي"
        subtitle={`المريض: ${patient.name}`}
        patientMRN={patient.mrn}
        showLogo={true}
      />

      {/* Patient Name */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900">{patient.name}</h2>
        <p className="text-gray-600">#{patient.mrn}</p>
      </div>

      {/* Assessment Content */}
      {!assessment ? (
        <div className="text-center py-8 text-gray-500">
          <p>لا يوجد تقييم مسجل للمريض</p>
          <p className="text-sm mt-2">سيتم تطوير عرض التقييمات قريباً...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Assessment details would go here */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">تفاصيل التقييم</h3>
            <p className="text-gray-600">سيتم عرض تفاصيل التقييم هنا...</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <PrintFooter additionalInfo="تقرير يحتوي على أحدث تقييم طبي شامل للمريض" />

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