import React, { useState } from 'react';
// FIX: Use createRoot from react-dom/client for React 18+ compatibility.
import { createRoot } from 'react-dom/client';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import { Patient, Role, Visit, DoctorFollowUpData, NurseFollowUpData, PtFollowUpData, SwFollowUpData } from '../types';
import { getInitials } from '../utils/helpers';
import { CheckCircle, Clock, Edit3, Save, Stethoscope, HandHeart, Printer, HeartPulse, Accessibility } from 'lucide-react';
import DoctorFollowUpForm from './forms/doctor/DoctorFollowUpForm';
import NurseFollowUpForm from './forms/nurse/NurseFollowUpForm';
import PtFollowUpForm from './forms/pt/PtFollowUpForm';
import SwFollowUpForm from './forms/sw/SwFollowUpForm';
import VisitPrintView from './VisitPrintView';

const StructuredNoteDisplay: React.FC<{ visit: Visit }> = ({ visit }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Doctor Note */}
            <div className="space-y-2">
                <h4 className="font-bold text-gray-600 flex items-center gap-1"><Stethoscope size={14}/> Doctor's Note</h4>
                {visit.doctorNote ? (
                    <div className="pl-2 border-l-2 border-blue-200 space-y-1 text-gray-700">
                        <p><strong>Status:</strong> {visit.doctorNote.status}</p>
                        <p><strong>Response:</strong> {visit.doctorNote.responseToPlan}</p>
                        <p><strong>Plan:</strong> {visit.doctorNote.plan} {visit.doctorNote.planDetails ? `(${visit.doctorNote.planDetails.join(', ')})`: ''}</p>
                        {visit.doctorNote.mdNote && <p className="italic">"{visit.doctorNote.mdNote}"</p>}
                    </div>
                ) : <p className="italic text-gray-400">Pending</p>}
                 {visit.doctorSign && <p className="text-gray-400 text-[10px] pt-1">Signed by: {visit.doctorSign}</p>}
            </div>

            {/* Nurse Note */}
            <div className="space-y-2">
                <h4 className="font-bold text-gray-600 flex items-center gap-1"><HandHeart size={14}/> Nurse's Note</h4>
                {visit.nurseNote ? (
                     <div className="pl-2 border-l-2 border-green-200 space-y-1 text-gray-700">
                        <p><strong>Status:</strong> {visit.nurseNote.status}</p>
                        {visit.nurseNote.vitals && <p><strong>Vitals:</strong> T: {visit.nurseNote.vitals.temp}, SpO2: {visit.nurseNote.vitals.o2sat}</p>}
                        <p><strong>Tasks:</strong> {visit.nurseNote.tasks.join(', ')}</p>
                        {visit.nurseNote.nurseNote && <p className="italic">"{visit.nurseNote.nurseNote}"</p>}
                    </div>
                ) : <p className="italic text-gray-400">Pending</p>}
                 {visit.nurseSign && <p className="text-gray-400 text-[10px] pt-1">Signed by: {visit.nurseSign}</p>}
            </div>
            
            {/* PT Note */}
            {visit.ptNote && (
                 <div className="space-y-2">
                    <h4 className="font-bold text-gray-600 flex items-center gap-1"><HeartPulse size={14}/> PT Note</h4>
                     <div className="pl-2 border-l-2 border-purple-200 space-y-1 text-gray-700">
                        <p><strong>Tolerance:</strong> {visit.ptNote.tolerance}</p>
                        <p><strong>Plan:</strong> {visit.ptNote.plan}</p>
                        {visit.ptNote.ptNote && <p className="italic">"{visit.ptNote.ptNote}"</p>}
                    </div>
                     {visit.ptSign && <p className="text-gray-400 text-[10px] pt-1">Signed by: {visit.ptSign}</p>}
                </div>
            )}

            {/* SW Note */}
            {visit.swNote && (
                 <div className="space-y-2" dir="rtl">
                    <h4 className="font-bold text-gray-600 flex items-center gap-1"><Accessibility size={14}/> مذكرة الأخصائي الاجتماعي</h4>
                     <div className="pr-2 border-r-2 border-yellow-200 space-y-1 text-gray-700">
                        <p><strong>الحالة:</strong> {visit.swNote.situationChange}</p>
                        {/* FIX: The property is named actionsTaken, not actions. */}
                        <p><strong>الإجراء:</strong> {visit.swNote.actionsTaken.join(', ')}</p>
                        {visit.swNote.swNote && <p className="italic">"{visit.swNote.swNote}"</p>}
                    </div>
                     {visit.swSign && <p className="text-gray-400 text-[10px] pt-1">تم التوقيع بواسطة: {visit.swSign}</p>}
                </div>
            )}

        </div>
    );
};


const VisitCard: React.FC<{ visit: Visit, patient: Patient | undefined }> = ({ visit, patient }) => {
    const { state, dispatch } = useHomeHealthcare();
    const [isEditing, setIsEditing] = useState(false);
    
    if (!patient) return null;

    const myRole = state.currentRole;
    
    let Editor, myNote, noteSaved = false;

    switch(myRole) {
        case Role.Doctor:
            Editor = DoctorFollowUpForm;
            myNote = visit.doctorNote;
            noteSaved = !!visit.doctorNote;
            break;
        case Role.Nurse:
            Editor = NurseFollowUpForm;
            myNote = visit.nurseNote;
            noteSaved = !!visit.nurseNote;
            break;
        case Role.PhysicalTherapist:
            Editor = PtFollowUpForm;
            myNote = visit.ptNote;
            noteSaved = !!visit.ptNote;
            break;
        case Role.SocialWorker:
            Editor = SwFollowUpForm;
            myNote = visit.swNote;
            noteSaved = !!visit.swNote;
            break;
    }

    const handleSaveNote = (note: DoctorFollowUpData | NurseFollowUpData | PtFollowUpData | SwFollowUpData) => {
        const currentUser = state.staff.find(s => s.الاسم.includes('')); // Simplified user finding
        dispatch({
            type: 'SAVE_VISIT_NOTE',
            payload: {
                visitId: `${visit.patientId}_${visit.date}`,
                role: myRole,
                note: note,
                user: currentUser?.الاسم || myRole,
            }
        });
        setIsEditing(false);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Visit Note</title><script src="https://cdn.tailwindcss.com"></script></head><body><div id="print-root"></div></body></html>');
            printWindow.document.close();
            const printRoot = printWindow.document.getElementById('print-root');
            if (printRoot) {
                // FIX: Use createRoot().render() instead of the deprecated ReactDOM.render().
                const root = createRoot(printRoot);
                root.render(<VisitPrintView visit={visit} patient={patient} />);
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500);
            }
        }
    };

    const visitStatusIndicator = () => {
        switch (visit.status) {
            case 'Completed': return <CheckCircle size={18} className="text-green-500" />;
            case 'DoctorCompleted': return <div className="flex items-center gap-1" title="Doctor completed"><Stethoscope size={16} className="text-green-500" /><Clock size={16} className="text-yellow-500"/></div>;
            case 'NurseCompleted': return <div className="flex items-center gap-1" title="Nurse completed"><Clock size={16} className="text-yellow-500"/><HandHeart size={16} className="text-green-500"/></div>;
            default: return <Clock size={18} className="text-yellow-500" />;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-blue-800 bg-blue-100">{getInitials(patient.nameAr)}</div>
                     <div>
                        <h3 className="font-bold text-gray-800">{patient.nameAr}</h3>
                        <p className="text-xs text-gray-500">{patient.nationalId} | {patient.areaId}</p>
                     </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                    {visitStatusIndicator()}<span>{visit.status}</span>
                </div>
            </div>

            {isEditing && Editor ? (
                 <Editor initialData={myNote as any} onSave={handleSaveNote} onCancel={() => setIsEditing(false)} />
            ) : (
                <StructuredNoteDisplay visit={visit} />
            )}
            
            <div className="border-t pt-3 flex justify-end items-center gap-2">
                {visit.status === 'Completed' && <button onClick={handlePrint} className="text-xs px-3 py-1 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 flex items-center gap-1"><Printer size={14} /> Print</button>}
                {Editor && !isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-xs px-3 py-1 rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 flex items-center gap-1 flex-shrink-0">
                        <Edit3 size={14} /> {noteSaved ? 'Edit Note' : 'Add Note'}
                    </button>
                )}
            </div>
        </div>
    )
}

const TodayVisits: React.FC = () => {
    const { state } = useHomeHealthcare();
    const today = new Date().toISOString().split('T')[0];

    const todayVisits = state.visits.filter(v => v.date === today);

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Visits for {today}</h1>
            
            {state.teams.map(team => {
                const teamVisits = todayVisits.filter(v => v.teamId === team.id);
                if(teamVisits.length === 0) return null;
                
                return (
                    <div key={team.id} className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">{team.name}</h2>
                        <div className="space-y-4">
                            {teamVisits.map(visit => (
                                <VisitCard key={visit.patientId} visit={visit} patient={state.patients.find(p => p.nationalId === visit.patientId)}/>
                            ))}
                        </div>
                    </div>
                );
            })}
             {todayVisits.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    <p>No visits scheduled for today.</p>
                </div>
             )}
        </div>
    );
};

export default TodayVisits;