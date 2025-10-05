import React from 'react';
import { Visit, Patient, PtAssessmentData, Role } from '../types';

interface Props {
  visit: Visit;
  patient: Patient;
}

const PrintField: React.FC<{ label: string; value?: string | string[] | null | object }> = ({ label, value }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  
  let displayValue;
  if (typeof value === 'object' && !Array.isArray(value)) {
    displayValue = Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ');
  } else {
    displayValue = Array.isArray(value) ? value.join(', ') : value;
  }

  return (
    <p><strong className="font-semibold">{label}:</strong> {displayValue}</p>
  );
};

const PtPrintView: React.FC<Props> = ({ visit, patient }) => {
  const { ptNote } = visit;
  const ptAssessment = patient.assessments.find(a => a.role === Role.PhysicalTherapist) as PtAssessmentData | undefined;

  return (
    <div className="p-8 font-sans text-sm" style={{ width: '210mm', height: '297mm' }}>
      {/* Header */}
      <header className="flex items-center justify-between pb-4 border-b">
         <div>
            <h1 className="text-2xl font-bold text-gray-800">Physical Therapy Note</h1>
            <p className="text-lg text-gray-600">تجمع عسير الصحي – مستشفى الملك عبدالله ببيشة</p>\n            <p className="text-sm text-gray-500">الرعاية الصحية المنزلية</p>
          </div>
        <div className="text-right text-xs text-gray-500">
          <p><strong>Date:</strong> {new Date(visit.date).toLocaleDateString()}</p>
        </div>
      </header>

      {/* Patient Info */}
       <section className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 pb-4 border-b text-sm">
        <h2 className="col-span-2 text-base font-bold text-gray-700 mb-1">Patient Information</h2>
        <PrintField label="Name" value={patient.nameAr} />
        <PrintField label="National ID" value={patient.nationalId} />
        <PrintField label="Area" value={patient.areaId} />
        <PrintField label="Phone" value={patient.phone} />
      </section>

      <div className="mt-4 space-y-4">
        {ptAssessment && (
            <section>
                 <h2 className="text-base font-bold text-gray-700 mb-2 underline">Assessment Summary</h2>
                 <div className="space-y-1">
                    <PrintField label="Dx Focus" value={ptAssessment.dxFocus} />
                    <PrintField label="Phase" value={ptAssessment.phase} />
                    <PrintField label="Function" value={ptAssessment.function} />
                     <PrintField label="Interventions" value={ptAssessment.interventions} />
                 </div>
            </section>
        )}
        {ptNote && (
            <section>
                <h2 className="text-base font-bold text-gray-700 mb-2 underline">Follow-up Note</h2>
                 <div className="space-y-1">
                    <PrintField label="Changes Since Last" value={ptNote.changeSinceLast} />
                    <PrintField label="Tolerance" value={ptNote.tolerance} />
                    <PrintField label="HEP" value={ptNote.hep} />
                    <PrintField label="Plan" value={ptNote.plan} />
                    <PrintField label="Plan Focus" value={ptNote.planFocus} />
                    <PrintField label="Note" value={ptNote.ptNote} />
                 </div>
            </section>
        )}
      </div>

       <footer className="mt-16 pt-4 border-t absolute bottom-8 w-[calc(100%-4rem)]">
          <div>
            <p className="font-semibold">{visit.ptSign || 'Therapist Signature'}</p>
            <p className="text-xs text-gray-500 border-t mt-1 pt-1">Physical Therapist</p>
        </div>
       </footer>
    </div>
  );
};

export default PtPrintView;