import React from 'react';
import { Patient, Assessment, Visit, DoctorAssessmentData, NurseAssessmentData, PtAssessmentData, SwAssessmentData } from '../types';

interface PrintTemplateProps {
  patient: Patient;
  visit?: Visit;
  assessment?: Assessment;
  type: 'visit' | 'assessment' | 'contact-history' | 'driver-route';
}

const PrintHeader: React.FC<{ patient: Patient }> = ({ patient }) => (
  <div className="print-header bg-blue-600 text-white p-4 rounded-t-lg mb-4 no-print-color-adjust">
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-lg">KA</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">King Abdullah Hospital - Bisha</h1>
            <p className="text-blue-100">مستشفى الملك عبدالله - بيشه</p>
            <p className="text-blue-200 text-sm">Home Healthcare Division</p>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-blue-100">Print Date</p>
        <p className="font-bold">{new Date().toLocaleDateString()}</p>
      </div>
    </div>
  </div>
);

const PatientInfo: React.FC<{ patient: Patient }> = ({ patient }) => (
  <div className="patient-info bg-gray-50 p-4 rounded-lg mb-4 print-no-break">
    <h2 className="font-bold text-lg text-gray-800 mb-3 border-b border-gray-300 pb-2">Patient Information</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <span className="font-semibold text-gray-600">Name:</span>
        <p className="font-bold">{patient.nameAr}</p>
      </div>
      <div>
        <span className="font-semibold text-gray-600">National ID:</span>
        <p className="font-bold">{patient.nationalId}</p>
      </div>
      <div>
        <span className="font-semibold text-gray-600">Phone:</span>
        <p className="font-bold">{patient.phone || 'N/A'}</p>
      </div>
      <div>
        <span className="font-semibold text-gray-600">Area:</span>
        <p className="font-bold">{patient.areaId || 'N/A'}</p>
      </div>
      <div>
        <span className="font-semibold text-gray-600">Sex:</span>
        <p className="font-bold">{patient.sex || 'N/A'}</p>
      </div>
      <div>
        <span className="font-semibold text-gray-600">Level:</span>
        <p className="font-bold">{patient.level || 'N/A'}</p>
      </div>
      <div>
        <span className="font-semibold text-gray-600">Admission:</span>
        <p className="font-bold">{patient.admissionDate ? new Date(patient.admissionDate).toLocaleDateString() : 'N/A'}</p>
      </div>
      <div>
        <span className="font-semibold text-gray-600">Braden Score:</span>
        <p className="font-bold">{patient.bradenScore || 'N/A'}</p>
      </div>
    </div>
    {patient.tags?.length > 0 && (
      <div className="mt-3">
        <span className="font-semibold text-gray-600">Tags:</span>
        <div className="flex flex-wrap gap-2 mt-1">
          {patient.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

const VisitNotePrint: React.FC<{ patient: Patient; visit: Visit }> = ({ patient, visit }) => (
  <div className="print-page">
    <PrintHeader patient={patient} />
    <PatientInfo patient={patient} />
    
    <div className="visit-content space-y-4">
      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 print-no-break">
        <h3 className="font-bold text-lg text-gray-800 mb-3 border-b border-gray-300 pb-2">Visit Information</h3>
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <span className="font-semibold text-gray-600">Date:</span>
            <p className="font-bold">{new Date(visit.date).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Team:</span>
            <p className="font-bold">{visit.teamId}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Status:</span>
            <p className="font-bold">{visit.status}</p>
          </div>
        </div>

        {/* Vitals Section */}
        {visit.nurseNote?.vitals && (
          <div className="mb-4">
            <h4 className="font-bold text-gray-800 mb-2">Vital Signs</h4>
            <div className="flex flex-wrap gap-4 text-sm">
              {visit.nurseNote.vitals.bp && <span><strong>BP:</strong> {visit.nurseNote.vitals.bp}</span>}
              {visit.nurseNote.vitals.hr && <span><strong>HR:</strong> {visit.nurseNote.vitals.hr}</span>}
              {visit.nurseNote.vitals.temp && <span><strong>Temp:</strong> {visit.nurseNote.vitals.temp}°C</span>}
              {visit.nurseNote.vitals.rr && <span><strong>RR:</strong> {visit.nurseNote.vitals.rr}</span>}
              {visit.nurseNote.vitals.o2sat && <span><strong>SpO₂:</strong> {visit.nurseNote.vitals.o2sat}%</span>}
              {visit.nurseNote.vitals.pain && <span><strong>Pain:</strong> {visit.nurseNote.vitals.pain}/10</span>}
            </div>
          </div>
        )}

        {/* Nursing Section */}
        {visit.nurseNote && (
          <div className="mb-4">
            <h4 className="font-bold text-gray-800 mb-2">Nursing Assessment</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Status:</strong> {visit.nurseNote.status}</p>
              {visit.nurseNote.woundDelta && <p><strong>Wound Status:</strong> {visit.nurseNote.woundDelta}</p>}
              {visit.nurseNote.deviceDelta && <p><strong>Device Status:</strong> {visit.nurseNote.deviceDelta}</p>}
              {visit.nurseNote.tasks?.length > 0 && (
                <p><strong>Tasks Completed:</strong> {visit.nurseNote.tasks.join(', ')}</p>
              )}
              {visit.nurseNote.escalation && <p><strong>Escalation:</strong> {visit.nurseNote.escalation}</p>}
              {visit.nurseNote.nurseNote && <p><strong>Note:</strong> {visit.nurseNote.nurseNote}</p>}
            </div>
            {visit.nurseSign && (
              <div className="mt-2 text-xs text-gray-600">
                <p><strong>Nurse:</strong> {visit.nurseSign}</p>
              </div>
            )}
          </div>
        )}

        {/* Doctor Section */}
        {visit.doctorNote && (
          <div className="mb-4">
            <h4 className="font-bold text-gray-800 mb-2">Medical Assessment</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Status:</strong> {visit.doctorNote.status}</p>
              <p><strong>Response to Plan:</strong> {visit.doctorNote.responseToPlan}</p>
              <p><strong>Adherence:</strong> {visit.doctorNote.adherence}</p>
              {visit.doctorNote.newIssues && visit.doctorNote.newIssues?.length > 0 && (
                <p><strong>New Issues:</strong> {visit.doctorNote.newIssues.join(', ')}</p>
              )}
              <p><strong>Plan:</strong> {visit.doctorNote.plan}</p>
              {visit.doctorNote.planDetails && visit.doctorNote.planDetails?.length > 0 && (
                <p><strong>Plan Details:</strong> {visit.doctorNote.planDetails.join(', ')}</p>
              )}
              <p><strong>Next Follow-up:</strong> {visit.doctorNote.nextFollowUp}</p>
              {visit.doctorNote.mdNote && <p><strong>MD Note:</strong> {visit.doctorNote.mdNote}</p>}
            </div>
            {visit.doctorSign && (
              <div className="mt-2 text-xs text-gray-600">
                <p><strong>Doctor:</strong> {visit.doctorSign}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Footer */}
    <div className="print-footer mt-6 pt-4 border-t-2 border-gray-300 text-center text-xs text-gray-600">
      <p>This document was generated electronically and is valid without signature.</p>
      <p>Aseer Health Cluster – King Abdullah Hospital, Bishah - Home Healthcare Department | Generated: {new Date().toLocaleString()}</p>
      <p>تجمع عسير الصحي – مستشفى الملك عبدالله ببيشة - الرعاية الصحية المنزلية</p>
    </div>
  </div>
);

const AssessmentPrint: React.FC<{ patient: Patient; assessment: Assessment }> = ({ patient, assessment }) => {
  const renderAssessmentContent = () => {
    switch (assessment.role) {
      case 'Doctor':
        const doctorData = assessment as DoctorAssessmentData;
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-gray-800 mb-2">Chief Focus</h4>
              <p className="text-sm">{doctorData.chiefFocus.join(', ') || 'None specified'}</p>
            </div>
            {doctorData.redFlags && doctorData.redFlags?.length > 0 && (
              <div>
                <h4 className="font-bold text-red-600 mb-2">Red Flags</h4>
                <p className="text-sm text-red-700">{doctorData.redFlags.join(', ')}</p>
              </div>
            )}
            <div>
              <h4 className="font-bold text-gray-800 mb-2">Assessment</h4>
              <p className="text-sm"><strong>Etiology:</strong> {doctorData.assessment.etiology.join(', ')}</p>
              <p className="text-sm"><strong>Severity:</strong> {doctorData.assessment.severity}</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">Plan</h4>
              <p className="text-sm"><strong>Status:</strong> {doctorData.status}</p>
              <p className="text-sm"><strong>Plan:</strong> {doctorData.plan}</p>
              <p className="text-sm"><strong>Follow-up:</strong> {doctorData.followUpTiming}</p>
            </div>
            {doctorData.mdNote && (
              <div>
                <h4 className="font-bold text-gray-800 mb-2">MD Note</h4>
                <p className="text-sm">{doctorData.mdNote}</p>
              </div>
            )}
          </div>
        );
      // Add other assessment types as needed
      default:
        return <p>Assessment details for {assessment.role}</p>;
    }
  };

  return (
    <div className="print-page">
      <PrintHeader patient={patient} />
      <PatientInfo patient={patient} />
      
      <div className="assessment-content bg-white border-2 border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
          <h3 className="font-bold text-lg text-gray-800">{assessment.role} Assessment</h3>
          <div className="text-sm text-gray-600">
            <p><strong>Date:</strong> {new Date(assessment.date).toLocaleDateString()}</p>
            <p><strong>Assessor:</strong> {assessment.assessorName}</p>
          </div>
        </div>
        
        {renderAssessmentContent()}
      </div>

      <div className="print-footer mt-6 pt-4 border-t-2 border-gray-300 text-center text-xs text-gray-600">
        <p>This assessment was completed electronically.</p>
        <p>Aseer Health Cluster – King Abdullah Hospital, Bishah - Home Healthcare Department | Generated: {new Date().toLocaleString()}</p>
      <p>تجمع عسير الصحي – مستشفى الملك عبدالله ببيشة - الرعاية الصحية المنزلية</p>
      </div>
    </div>
  );
};

const ContactHistoryPrint: React.FC<{ patient: Patient }> = ({ patient }) => (
  <div className="print-page">
    <PrintHeader patient={patient} />
    <PatientInfo patient={patient} />
    
    <div className="contact-history bg-white border-2 border-gray-200 rounded-lg p-4">
      <h3 className="font-bold text-lg text-gray-800 mb-4 border-b border-gray-300 pb-2">Contact Attempts & Visit History</h3>
      
      {patient.contactAttempts && patient.contactAttempts.length > 0 ? (
        <div className="mb-6">
          <h4 className="font-bold text-gray-800 mb-3">Contact Attempts</h4>
          <div className="space-y-2">
            {patient.contactAttempts.map((attempt, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <span className="font-medium">{attempt.type}</span>
                  <span className="text-gray-600 ml-2">by {attempt.staffName}</span>
                </div>
                <span className="text-sm text-gray-500">{new Date(attempt.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-600 mb-6">No contact attempts recorded.</p>
      )}

      {patient.assessments && patient.assessments.length > 0 ? (
        <div>
          <h4 className="font-bold text-gray-800 mb-3">Previous Assessments</h4>
          <div className="space-y-3">
            {patient.assessments.slice(0, 5).map((assessment, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{assessment.role} Assessment</span>
                  <span className="text-sm text-gray-500">{new Date(assessment.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Status:</strong> {assessment.status} | <strong>Plan:</strong> {assessment.plan}
                </p>
                <p className="text-xs text-gray-600 mt-1">By: {assessment.assessorName}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-600">No previous assessments recorded.</p>
      )}
    </div>

    <div className="print-footer mt-6 pt-4 border-t-2 border-gray-300 text-center text-xs text-gray-600">
      <p>Contact and visit history report</p>
      <p>Aseer Health Cluster – King Abdullah Hospital, Bishah - Home Healthcare Department | Generated: {new Date().toLocaleString()}</p>
      <p>تجمع عسير الصحي – مستشفى الملك عبدالله ببيشة - الرعاية الصحية المنزلية</p>
    </div>
  </div>
);

const DriverRoutePrint: React.FC<{ patients: Patient[]; date: string }> = ({ patients, date }) => (
  <div className="print-page">
    <div className="print-header bg-blue-600 text-white p-4 rounded-t-lg mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Driver Route Sheet</h1>
          <p className="text-blue-100">Aseer Health Cluster \u2013 King Abdullah Hospital, Bishah</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-blue-100">Route Date</p>
          <p className="font-bold">{new Date(date).toLocaleDateString()}</p>
        </div>
      </div>
    </div>

    <div className="route-list space-y-4">
      {patients.map((patient, index) => (
        <div key={patient.nationalId} className="bg-white border-2 border-gray-200 rounded-lg p-4 print-no-break">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-lg">#{index + 1} - {patient.nameAr}</h3>
              <p className="text-gray-600">{patient.areaId}</p>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs">QR Code</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-600">Phone:</span>
              <p className="font-bold">{patient.phone || 'N/A'}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-600">National ID:</span>
              <p className="font-bold">{patient.nationalId}</p>
            </div>
          </div>

          <div className="mt-3 text-sm">
            <span className="font-semibold text-gray-600">Maps Link:</span>
            <p className="text-blue-600 break-all">https://maps.google.com/?q={patient.areaId}</p>
          </div>

          <div className="mt-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
            <span className="font-semibold text-yellow-800">Notes:</span>
            <p className="text-sm text-yellow-700">Add any special instructions here</p>
          </div>
        </div>
      ))}
    </div>

    <div className="print-footer mt-6 pt-4 border-t-2 border-gray-300 text-center text-xs text-gray-600">
      <p>Driver route optimized by proximity and area</p>
      <p>Aseer Health Cluster – King Abdullah Hospital, Bishah - Home Healthcare Department | Generated: {new Date().toLocaleString()}</p>
      <p>تجمع عسير الصحي – مستشفى الملك عبدالله ببيشة - الرعاية الصحية المنزلية</p>
    </div>
  </div>
);

const PrintTemplate: React.FC<PrintTemplateProps> = ({ patient, visit, assessment, type }) => {
  switch (type) {
    case 'visit':
      return visit ? <VisitNotePrint patient={patient} visit={visit} /> : null;
    case 'assessment':
      return assessment ? <AssessmentPrint patient={patient} assessment={assessment} /> : null;
    case 'contact-history':
      return <ContactHistoryPrint patient={patient} />;
    case 'driver-route':
      // This would need to be called with multiple patients
      return <DriverRoutePrint patients={[patient]} date={new Date().toISOString().split('T')[0]} />;
    default:
      return null;
  }
};

export default PrintTemplate;