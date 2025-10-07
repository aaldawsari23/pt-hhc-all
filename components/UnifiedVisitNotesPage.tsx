import React, { useState, useEffect } from 'react';
import { Stethoscope, HandHeart, Save, Edit3, Clock, CheckCircle2, AlertTriangle, Eye, Printer, Users, Calendar, MapPin, User } from 'lucide-react';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import { Patient, Visit, Role, DoctorFollowUpData, NurseFollowUpData } from '../types';
import { useDraftStorage } from '../utils/draftStorage';
import UnifiedFormHeader from './UnifiedFormHeader';
import DoctorFollowUpForm from './forms/doctor/DoctorFollowUpForm';
import NurseFollowUpForm from './forms/nurse/NurseFollowUpForm';
import ComprehensivePrintManager from './ComprehensivePrintManager';

interface UnifiedVisitNotesPageProps {
  visit: Visit;
  patient: Patient;
  onClose: () => void;
}

const UnifiedVisitNotesPage: React.FC<UnifiedVisitNotesPageProps> = ({
  visit,
  patient,
  onClose
}) => {
  const { state, dispatch } = useHomeHealthcare();
  const draftStorage = useDraftStorage();
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [showPrintManager, setShowPrintManager] = useState(false);
  const [lastSavedTimes, setLastSavedTimes] = useState<Record<Role, Date | null>>({
    [Role.Doctor]: null,
    [Role.Nurse]: null,
    [Role.PhysicalTherapist]: null,
    [Role.SocialWorker]: null,
    [Role.Driver]: null,
    [Role.Coordinator]: null
  });

  const currentUserRole = state.currentRole;
  const team = state.teams.find(t => t.id === visit.teamId);
  
  // Check for drafts on mount
  useEffect(() => {
    const checkDrafts = () => {
      const doctorDraft = draftStorage.getDraftVisitNote(patient.nationalId, visit.date, Role.Doctor);
      const nurseDraft = draftStorage.getDraftVisitNote(patient.nationalId, visit.date, Role.Nurse);
      
      if (doctorDraft) {
        setLastSavedTimes(prev => ({ ...prev, [Role.Doctor]: new Date(doctorDraft.lastSaved) }));
      }
      if (nurseDraft) {
        setLastSavedTimes(prev => ({ ...prev, [Role.Nurse]: new Date(nurseDraft.lastSaved) }));
      }
    };
    
    checkDrafts();
  }, [patient.nationalId, visit.date, draftStorage]);

  const handleSaveNote = (role: Role, noteData: DoctorFollowUpData | NurseFollowUpData) => {
    const currentUser = state.staff.find(s => s.الاسم.includes('')) || { الاسم: role };
    
    dispatch({
      type: 'SAVE_VISIT_NOTE',
      payload: {
        visitId: `${visit.patientId}_${visit.date}`,
        role,
        note: noteData,
        user: currentUser.الاسم,
      }
    });
    
    // Clear draft after successful save
    draftStorage.deleteDraftVisitNote(patient.nationalId, visit.date, role);
    setActiveRole(null);
    setLastSavedTimes(prev => ({ ...prev, [role]: new Date() }));
  };

  const getVisitStatus = () => {
    const doctorCompleted = !!visit.doctorNote;
    const nurseCompleted = !!visit.nurseNote;
    
    if (doctorCompleted && nurseCompleted) {
      return { status: 'completed', label: 'Visit Completed', color: 'green', icon: CheckCircle2 };
    } else if (doctorCompleted || nurseCompleted) {
      return { status: 'partial', label: 'Partially Completed', color: 'yellow', icon: Clock };
    } else {
      return { status: 'pending', label: 'Pending Assessment', color: 'red', icon: AlertTriangle };
    }
  };

  const visitStatus = getVisitStatus();

  const renderRoleCard = (role: Role, title: string, titleAr: string, icon: React.ElementType, color: string) => {
    const hasNote = role === Role.Doctor ? !!visit.doctorNote : !!visit.nurseNote;
    const noteData = role === Role.Doctor ? visit.doctorNote : visit.nurseNote;
    const signature = role === Role.Doctor ? visit.doctorSign : visit.nurseSign;
    const canEdit = currentUserRole === role;
    const hasDraft = draftStorage.getDraftVisitNote(patient.nationalId, visit.date, role);
    const lastSaved = lastSavedTimes[role];
    
    const Icon = icon;
    
    return (
      <div className={`bg-white rounded-lg border-2 transition-all ${
        hasNote ? `border-${color}-500 bg-${color}-50` : 'border-gray-200 hover:border-gray-300'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b border-${color}-200 bg-gradient-to-r from-${color}-50 to-${color}-100`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-${color}-500 rounded-lg flex items-center justify-center text-white`}>
                <Icon size={20} />
              </div>
              <div>
                <h3 className={`font-bold text-${color}-800`}>{title}</h3>
                <p className={`text-sm text-${color}-600`}>{titleAr}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {hasDraft && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                  Draft Saved
                </span>
              )}
              
              {hasNote ? (
                <span className={`px-2 py-1 bg-${color}-100 text-${color}-700 text-xs rounded-full flex items-center gap-1`}>
                  <CheckCircle2 size={12} />
                  Completed
                </span>
              ) : (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1">
                  <Clock size={12} />
                  Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeRole === role ? (
            // Editing mode
            <div className="space-y-4">
              {role === Role.Doctor ? (
                <DoctorFollowUpForm
                  initialData={noteData}
                  onSave={(data) => handleSaveNote(role, data)}
                  onCancel={() => setActiveRole(null)}
                />
              ) : (
                <NurseFollowUpForm
                  initialData={noteData}
                  onSave={(data) => handleSaveNote(role, data)}
                  onCancel={() => setActiveRole(null)}
                />
              )}
            </div>
          ) : (
            // Display mode
            <div className="space-y-3">
              {hasNote && noteData ? (
                <div className="space-y-3">
                  {role === Role.Doctor && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Status:</span>
                          <span className="ml-2">{(noteData as DoctorFollowUpData).status}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Response to Plan:</span>
                          <span className="ml-2">{(noteData as DoctorFollowUpData).responseToPlan}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Adherence:</span>
                          <span className="ml-2">{(noteData as DoctorFollowUpData).adherence}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Plan:</span>
                          <span className="ml-2">{(noteData as DoctorFollowUpData).plan}</span>
                        </div>
                      </div>
                      
                      {(noteData as DoctorFollowUpData).newIssues && (noteData as DoctorFollowUpData).newIssues?.length > 0 && (
                        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                          <span className="font-medium text-red-800 block mb-1">New Issues:</span>
                          <p className="text-red-700 text-sm">{(noteData as DoctorFollowUpData).newIssues.join(', ')}</p>
                        </div>
                      )}
                      
                      {(noteData as DoctorFollowUpData).planDetails && (noteData as DoctorFollowUpData).planDetails?.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <span className="font-medium text-blue-800 block mb-1">Plan Details:</span>
                          <p className="text-blue-700 text-sm">{(noteData as DoctorFollowUpData).planDetails.join(', ')}</p>
                        </div>
                      )}
                      
                      <div>
                        <span className="font-medium text-gray-700">Next Follow-up:</span>
                        <span className="ml-2 font-semibold text-blue-600">{(noteData as DoctorFollowUpData).nextFollowUp}</span>
                      </div>
                      
                      {(noteData as DoctorFollowUpData).mdNote && (
                        <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
                          <span className="font-medium text-gray-700 block mb-1">Clinical Notes:</span>
                          <p className="text-gray-600 leading-relaxed">{(noteData as DoctorFollowUpData).mdNote}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {role === Role.Nurse && (
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className="ml-2">{(noteData as NurseFollowUpData).status}</span>
                      </div>
                      
                      {(noteData as NurseFollowUpData).vitals && (
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <span className="font-medium text-green-800 block mb-2">Vital Signs:</span>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            {(noteData as NurseFollowUpData).vitals!.temp && (
                              <span>Temp: {(noteData as NurseFollowUpData).vitals!.temp}°C</span>
                            )}
                            {(noteData as NurseFollowUpData).vitals!.bp && (
                              <span>BP: {(noteData as NurseFollowUpData).vitals!.bp}</span>
                            )}
                            {(noteData as NurseFollowUpData).vitals!.hr && (
                              <span>HR: {(noteData as NurseFollowUpData).vitals!.hr}</span>
                            )}
                            {(noteData as NurseFollowUpData).vitals!.rr && (
                              <span>RR: {(noteData as NurseFollowUpData).vitals!.rr}</span>
                            )}
                            {(noteData as NurseFollowUpData).vitals!.o2sat && (
                              <span>SpO₂: {(noteData as NurseFollowUpData).vitals!.o2sat}%</span>
                            )}
                            {(noteData as NurseFollowUpData).vitals!.pain && (
                              <span>Pain: {(noteData as NurseFollowUpData).vitals!.pain}/10</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {(noteData as NurseFollowUpData).tasks && (noteData as NurseFollowUpData).tasks?.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700 block mb-1">Tasks Completed:</span>
                          <p className="text-gray-600">{(noteData as NurseFollowUpData).tasks.join(', ')}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3">
                        {(noteData as NurseFollowUpData).woundDelta && (
                          <div>
                            <span className="font-medium text-gray-700">Wound Status:</span>
                            <span className="ml-2">{(noteData as NurseFollowUpData).woundDelta}</span>
                          </div>
                        )}
                        {(noteData as NurseFollowUpData).deviceDelta && (
                          <div>
                            <span className="font-medium text-gray-700">Device Status:</span>
                            <span className="ml-2">{(noteData as NurseFollowUpData).deviceDelta}</span>
                          </div>
                        )}
                      </div>
                      
                      {(noteData as NurseFollowUpData).escalation && (
                        <div>
                          <span className="font-medium text-gray-700">Escalation Required:</span>
                          <span className={`ml-2 font-semibold ${
                            (noteData as NurseFollowUpData).escalation === 'Yes' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {(noteData as NurseFollowUpData).escalation}
                          </span>
                        </div>
                      )}
                      
                      {(noteData as NurseFollowUpData).nurseNote && (
                        <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-green-500">
                          <span className="font-medium text-gray-700 block mb-1">Nursing Notes:</span>
                          <p className="text-gray-600 leading-relaxed">{(noteData as NurseFollowUpData).nurseNote}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Signature */}
                  {signature && (
                    <div className={`mt-4 pt-3 border-t border-${color}-200 bg-${color}-25`}>
                      <p className={`text-${color}-700 font-medium text-sm flex items-center gap-2`}>
                        <CheckCircle2 size={14} />
                        Digitally Signed by: {signature}
                      </p>
                      <p className={`text-${color}-600 text-xs`}>
                        Date: {new Date().toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // No note yet
                <div className="text-center py-8 text-gray-500">
                  <Clock size={32} className="mx-auto mb-3 text-gray-400" />
                  <p className="font-medium">No assessment completed</p>
                  <p className="text-sm">لم يتم إجراء التقييم بعد</p>
                  {lastSaved && (
                    <p className="text-xs mt-2 text-orange-600">
                      Draft saved: {lastSaved.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  {lastSaved && `Last saved: ${lastSaved.toLocaleTimeString()}`}
                </div>
                
                <div className="flex items-center gap-2">
                  {canEdit && (
                    <button
                      onClick={() => setActiveRole(role)}
                      className={`px-3 py-1 text-sm bg-${color}-600 text-white rounded-lg hover:bg-${color}-700 transition-all flex items-center gap-1`}
                    >
                      <Edit3 size={14} />
                      {hasNote ? 'Edit Note' : 'Add Note'}
                    </button>
                  )}
                  
                  {hasNote && (
                    <button
                      onClick={() => setShowPrintManager(true)}
                      className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 md:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <UnifiedFormHeader 
          title="Unified Visit Documentation"
          titleAr="توثيق الزيارة الموحد"
          patient={patient}
          subtitle={`Team Visit - ${new Date(visit.date).toLocaleDateString('ar-SA')}`}
        />

        {/* Visit Info Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                <span className="font-medium">Visit Date:</span>
                <span>{new Date(visit.date).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users size={16} className="text-purple-500" />
                <span className="font-medium">Team:</span>
                <span>{team?.name || 'Unknown Team'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-green-500" />
                <span className="font-medium">Area:</span>
                <span>{patient.areaId || 'N/A'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 md:ml-auto">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-${visitStatus.color}-100 text-${visitStatus.color}-700`}>
                <visitStatus.icon size={14} />
                {visitStatus.label}
              </div>
              
              <button
                onClick={() => setShowPrintManager(true)}
                disabled={!visit.doctorNote && !visit.nurseNote}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
              >
                <Printer size={16} />
                Print Visit
              </button>
              
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Doctor Section */}
            {renderRoleCard(Role.Doctor, 'Doctor Assessment', 'تقييم الطبيب', Stethoscope, 'blue')}
            
            {/* Nurse Section */}
            {renderRoleCard(Role.Nurse, 'Nursing Care', 'الرعاية التمريضية', HandHeart, 'green')}
          </div>
          
          {/* Summary Section */}
          {(visit.doctorNote || visit.nurseNote) && (
            <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
              <h3 className="font-bold text-indigo-800 mb-4 flex items-center gap-2">
                <Users size={18} />
                Visit Summary | ملخص الزيارة
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3 border border-indigo-100">
                  <span className="font-medium text-gray-700 block mb-1">Overall Status:</span>
                  <span className="font-bold text-indigo-700">{visit.status}</span>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-indigo-100">
                  <span className="font-medium text-gray-700 block mb-1">Completion Rate:</span>
                  <span className="font-bold text-indigo-700">
                    {visit.status === 'Completed' ? '100%' : 
                     visit.status === 'DoctorCompleted' || visit.status === 'NurseCompleted' ? '50%' : '0%'}
                  </span>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-indigo-100">
                  <span className="font-medium text-gray-700 block mb-1">Team Members:</span>
                  <span className="font-bold text-indigo-700">
                    {visit.doctorSign && visit.nurseSign ? 'Doctor + Nurse' : 
                     visit.doctorSign ? 'Doctor Only' : 
                     visit.nurseSign ? 'Nurse Only' : 'Pending'}
                  </span>
                </div>
              </div>
              
              {/* Next Steps */}
              {visit.status !== 'Completed' && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="font-medium text-yellow-800 block mb-1">Next Steps:</span>
                  <p className="text-yellow-700 text-sm">
                    {!visit.doctorNote && !visit.nurseNote ? 'Both doctor and nurse assessments needed' :
                     !visit.doctorNote ? 'Doctor assessment pending' :
                     !visit.nurseNote ? 'Nurse assessment pending' : ''}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Print Manager Modal */}
        {showPrintManager && (
          <ComprehensivePrintManager
            patient={patient}
            visit={visit}
            onClose={() => setShowPrintManager(false)}
          />
        )}
      </div>
    </div>
  );
};

export default UnifiedVisitNotesPage;