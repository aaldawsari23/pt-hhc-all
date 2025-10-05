import React from 'react';
import { Visit, Patient } from '../types';

interface Props {
  visit: Visit;
  patient: Patient;
}

const PrintField: React.FC<{ label: string; value?: string | string[] | null }> = ({ label, value }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const displayValue = Array.isArray(value) ? value.join(', ') : value;
  return (
    <p><strong className="font-semibold">{label}:</strong> {displayValue}</p>
  );
};

const VisitPrintView: React.FC<Props> = ({ visit, patient }) => {
  const { doctorNote, nurseNote } = visit;

  return (
    <div className="p-8 font-sans text-sm" style={{ width: '210mm', height: '297mm' }}>
      {/* Header */}
      <header className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Aseer Health Cluster Logo" className="h-16 w-16 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Home Healthcare Visit Note</h1>
            <p className="text-lg text-gray-600">تجمع عسير الصحي – مستشفى الملك عبدالله ببيشة</p>
            <p className="text-sm text-gray-500">الرعاية الصحية المنزلية</p>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p><strong>Date:</strong> {new Date(visit.date).toLocaleDateString()}</p>
          <p><strong>Team:</strong> {visit.teamId}</p>
        </div>
      </header>

      {/* Patient Info */}
      <section className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 pb-4 border-b text-sm">
        <h2 className="col-span-2 text-base font-bold text-gray-700 mb-1">Patient Information</h2>
        <PrintField label="Name (EN)" value={patient.nameAr} />
        <PrintField label="Name (AR)" value={patient.nameAr} />
        <PrintField label="National ID" value={patient.nationalId} />
        <PrintField label="MRN" value={patient.nationalId} />
        <PrintField label="Area" value={patient.areaId} />
        <PrintField label="Phone" value={patient.phone} />
      </section>

      {/* Vitals */}
      {nurseNote?.vitals && (
        <section className="mt-4 pb-4 border-b">
          <h2 className="text-base font-bold text-gray-700 mb-2">Vital Signs</h2>
          <div className="grid grid-cols-6 gap-2 text-center">
            <div className="bg-gray-50 p-1 rounded-md">
              <div className="text-xs font-bold text-gray-500">BP</div>
              <div className="font-mono text-base">{nurseNote.vitals.bp || '-'}</div>
            </div>
            <div className="bg-gray-50 p-1 rounded-md">
              <div className="text-xs font-bold text-gray-500">HR</div>
              <div className="font-mono text-base">{nurseNote.vitals.hr || '-'}</div>
            </div>
             <div className="bg-gray-50 p-1 rounded-md">
              <div className="text-xs font-bold text-gray-500">RR</div>
              <div className="font-mono text-base">{nurseNote.vitals.rr || '-'}</div>
            </div>
            <div className="bg-gray-50 p-1 rounded-md">
              <div className="text-xs font-bold text-gray-500">Temp</div>
              <div className="font-mono text-base">{nurseNote.vitals.temp ? `${nurseNote.vitals.temp}°C` : '-'}</div>
            </div>
            <div className="bg-gray-50 p-1 rounded-md">
              <div className="text-xs font-bold text-gray-500">SpO₂</div>
              <div className="font-mono text-base">{nurseNote.vitals.o2sat ? `${nurseNote.vitals.o2sat}%` : '-'}</div>
            </div>
             <div className="bg-gray-50 p-1 rounded-md">
              <div className="text-xs font-bold text-gray-500">Pain</div>
              <div className="font-mono text-base">{nurseNote.vitals.pain ? `${nurseNote.vitals.pain}/10` : '-'}</div>
            </div>
          </div>
        </section>
      )}

      {/* Nursing & Doctor Sections */}
      <div className="grid grid-cols-2 gap-x-8 mt-4">
        {/* Nursing Section */}
        {nurseNote && (
          <section>
            <h2 className="text-base font-bold text-gray-700 mb-2">Nursing Section</h2>
            <div className="space-y-1">
              <PrintField label="Status" value={nurseNote.status} />
              <PrintField label="Wound Delta" value={nurseNote.woundDelta} />
              <PrintField label="Device Delta" value={nurseNote.deviceDelta} />
              <PrintField label="Tasks" value={nurseNote.tasks} />
              <PrintField label="Escalation" value={nurseNote.escalation} />
              <PrintField label="Note" value={nurseNote.nurseNote} />
            </div>
          </section>
        )}

        {/* Doctor Section */}
        {doctorNote && (
          <section>
            <h2 className="text-base font-bold text-gray-700 mb-2">Doctor Section</h2>
            <div className="space-y-1">
              <PrintField label="Status" value={doctorNote.status} />
              <PrintField label="Response to Plan" value={doctorNote.responseToPlan} />
              <PrintField label="Adherence" value={doctorNote.adherence} />
              <PrintField label="New Issues" value={doctorNote.newIssues} />
              <PrintField label="Plan" value={doctorNote.plan} />
              <PrintField label="Plan Details" value={doctorNote.planDetails} />
              <PrintField label="Next Follow-up" value={doctorNote.nextFollowUp} />
              <PrintField label="Note" value={doctorNote.mdNote} />
            </div>
          </section>
        )}
      </div>

       {/* Signatures */}
       <footer className="mt-16 pt-4 border-t absolute bottom-8 w-[calc(100%-4rem)]">
          <div className="grid grid-cols-2 gap-8">
             <div>
                <p className="font-semibold">{visit.nurseSign || 'Nurse Signature'}</p>
                <p className="text-xs text-gray-500 border-t mt-1 pt-1">Nurse</p>
            </div>
             <div>
                <p className="font-semibold">{visit.doctorSign || 'Doctor Signature'}</p>
                <p className="text-xs text-gray-500 border-t mt-1 pt-1">Doctor</p>
            </div>
          </div>
       </footer>

    </div>
  );
};

export default VisitPrintView;
