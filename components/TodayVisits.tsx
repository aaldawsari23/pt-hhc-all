import React, { useState } from 'react';
// FIX: Use createRoot from react-dom/client for React 18+ compatibility.
import { createRoot } from 'react-dom/client';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import { Patient, Role, Visit, DoctorFollowUpData, NurseFollowUpData, PtFollowUpData, SwFollowUpData } from '../types';
import { getInitials } from '../utils/helpers';
import { CheckCircle, Clock, Edit3, Save, Stethoscope, HandHeart, Printer, HeartPulse, Accessibility, QrCode } from 'lucide-react';
import DoctorFollowUpForm from './forms/doctor/DoctorFollowUpForm';
import NurseFollowUpForm from './forms/nurse/NurseFollowUpForm';
import PtFollowUpForm from './forms/pt/PtFollowUpForm';
import SwFollowUpForm from './forms/sw/SwFollowUpForm';
import VisitPrintView from './VisitPrintView';
import PtPrintView from './PtPrintView';
import SwPrintView from './SwPrintView';

const StructuredNoteDisplay: React.FC<{ visit: Visit }> = ({ visit }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm md:text-base">
            {/* Doctor Note */}
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-3">
                    <Stethoscope size={16}/> Doctor's Assessment
                </h4>
                {visit.doctorNote ? (
                    <div className="space-y-2 text-gray-700">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span><strong>Status:</strong> {visit.doctorNote.status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span><strong>Response:</strong> {visit.doctorNote.responseToPlan}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span><strong>Plan:</strong> {visit.doctorNote.plan} {visit.doctorNote.planDetails ? `(${visit.doctorNote.planDetails.join(', ')})`: ''}</span>
                        </div>
                        {visit.doctorNote.mdNote && (
                            <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
                                <p className="italic text-blue-700">"{visit.doctorNote.mdNote}"</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <Clock size={24} className="text-gray-400 mx-auto mb-2" />
                        <p className="italic text-gray-500">Pending Assessment</p>
                    </div>
                )}
                 {visit.doctorSign && (
                    <div className="mt-3 pt-2 border-t border-blue-200">
                        <p className="text-blue-600 text-sm font-medium">✓ Signed by: {visit.doctorSign}</p>
                    </div>
                )}
            </div>

            {/* Nurse Note */}
            <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                <h4 className="font-bold text-green-800 flex items-center gap-2 mb-3">
                    <HandHeart size={16}/> Nursing Care
                </h4>
                {visit.nurseNote ? (
                    <div className="space-y-2 text-gray-700">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span><strong>Status:</strong> {visit.nurseNote.status}</span>
                        </div>
                        {visit.nurseNote.vitals && (
                            <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
                                <p><strong>Vitals:</strong></p>
                                <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                                    {visit.nurseNote.vitals.temp && <span>T: {visit.nurseNote.vitals.temp}°C</span>}
                                    {visit.nurseNote.vitals.o2sat && <span>SpO₂: {visit.nurseNote.vitals.o2sat}%</span>}
                                    {visit.nurseNote.vitals.bp && <span>BP: {visit.nurseNote.vitals.bp}</span>}
                                    {visit.nurseNote.vitals.hr && <span>HR: {visit.nurseNote.vitals.hr}</span>}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span><strong>Tasks:</strong> {visit.nurseNote.tasks.join(', ')}</span>
                        </div>
                        {visit.nurseNote.nurseNote && (
                            <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
                                <p className="italic text-green-700">"{visit.nurseNote.nurseNote}"</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <Clock size={24} className="text-gray-400 mx-auto mb-2" />
                        <p className="italic text-gray-500">Pending Assessment</p>
                    </div>
                )}
                 {visit.nurseSign && (
                    <div className="mt-3 pt-2 border-t border-green-200">
                        <p className="text-green-600 text-sm font-medium">✓ Signed by: {visit.nurseSign}</p>
                    </div>
                )}
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
        const currentUser = state.staff.find(s => s.الاسم.includes('')) || { الاسم: myRole }; // Simplified user finding
        dispatch({
            type: 'SAVE_VISIT_NOTE',
            payload: {
                visitId: `${visit.patientId}_${visit.date}`,
                role: myRole,
                note: note,
                user: currentUser.الاسم,
            }
        });
        setIsEditing(false);
    };

    const handlePrint = (printView: React.ReactElement) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Visit Note</title><script src="https://cdn.tailwindcss.com"></script></head><body><div id="print-root"></div></body></html>');
            printWindow.document.close();
            const printRoot = printWindow.document.getElementById('print-root');
            if (printRoot) {
                const root = createRoot(printRoot);
                root.render(printView);
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500); // Allow time for render
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
                     <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-black bg-gray-100 border-2 border-gray-300">
                        <QrCode size={20} />
                     </div>
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
                {visit.status === 'Completed' && <button onClick={() => handlePrint(<VisitPrintView visit={visit} patient={patient} />)} className="text-xs px-3 py-1 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 flex items-center gap-1"><Printer size={14} /> Print DN/RN</button>}
                 {visit.ptNote && <button onClick={() => handlePrint(<PtPrintView visit={visit} patient={patient} />)} className="text-xs px-3 py-1 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 flex items-center gap-1"><Printer size={14} /> Print PT</button>}
                 {visit.swNote && <button onClick={() => handlePrint(<SwPrintView visit={visit} patient={patient} />)} className="text-xs px-3 py-1 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 flex items-center gap-1"><Printer size={14} /> Print SW</button>}
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
