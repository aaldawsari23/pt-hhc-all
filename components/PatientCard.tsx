import React, { useState } from 'react';
import { Patient, Assessment, Role, DoctorAssessmentData, NurseAssessmentData, PtAssessmentData, SwAssessmentData } from '../types';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import { getRiskLevel, riskLevelToColor, getInitials } from '../utils/helpers';
import { Phone, MapPin, Hash, QrCode, ClipboardList, Stethoscope, HandHeart, Accessibility, HeartPulse, PhoneOff, DoorClosed } from 'lucide-react';
import DoctorAssessmentForm from './forms/doctor/DoctorAssessmentForm';
import NurseAssessmentForm from './forms/nurse/NurseAssessmentForm';
import PtAssessmentForm from './forms/pt/PtAssessmentForm';
import SwAssessmentForm from './forms/sw/SwAssessmentForm';


const Tag: React.FC<{ label: string }> = ({ label }) => {
    const colorMap: { [key: string]: string } = {
        'Catheter': 'bg-blue-100 text-blue-800',
        'Pressure Ulcer': 'bg-red-100 text-red-800',
        'Tube Feeding': 'bg-yellow-100 text-yellow-800',
        'Fall Risk': 'bg-purple-100 text-purple-800',
        'IV Therapy': 'bg-indigo-100 text-indigo-800',
        'Ventilation': 'bg-pink-100 text-pink-800',
    };
    return (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorMap[label] || 'bg-gray-100 text-gray-800'}`}>
            {label}
        </span>
    );
};

const PatientCard: React.FC<{ patient: Patient }> = ({ patient }) => {
    const { state, dispatch } = useHomeHealthcare();
    const [editing, setEditing] = useState<Role | null>(null);
    const isSelected = state.selectedPatientIds.has(patient.nationalId);
    const risk = getRiskLevel(patient.admissionDate);
    const latestAssessment = patient.assessments?.[0];

    const handleSelect = () => {
        dispatch({ type: 'TOGGLE_PATIENT_SELECTION', payload: patient.nationalId });
    };

    const handleSaveAssessment = (assessment: Assessment) => {
        dispatch({ type: 'SAVE_ASSESSMENT', payload: { patientId: patient.nationalId, assessment } });
        setEditing(null);
    };

    const handleLogContact = (type: 'No Answer' | 'Door Not Opened') => {
        const currentUser = state.staff.find(s => s.الاسم.includes('')) || { الاسم: 'System' }; // Simplified user finding
        dispatch({ type: 'LOG_CONTACT_ATTEMPT', payload: { patientId: patient.nationalId, type, staffName: currentUser.الاسم } });
    }

    const isClinicalRole = [Role.Doctor, Role.Nurse, Role.PhysicalTherapist, Role.SocialWorker].includes(state.currentRole);

    const renderAssessmentForm = () => {
        switch (editing) {
            case Role.Doctor:
                return <DoctorAssessmentForm patient={patient} onSave={handleSaveAssessment} onCancel={() => setEditing(null)} />;
            case Role.Nurse:
                return <NurseAssessmentForm patient={patient} onSave={handleSaveAssessment} onCancel={() => setEditing(null)} />;
            case Role.PhysicalTherapist:
                return <PtAssessmentForm patient={patient} onSave={handleSaveAssessment} onCancel={() => setEditing(null)} />;
            case Role.SocialWorker:
                return <SwAssessmentForm patient={patient} onSave={handleSaveAssessment} onCancel={() => setEditing(null)} />;
            default:
                return null;
        }
    };

    if (editing && editing === state.currentRole) {
        return (
             <div className="bg-white rounded-xl shadow-lg border border-blue-500 ring-2 ring-blue-200 flex flex-col h-[420px]">
                {renderAssessmentForm()}
            </div>
        );
    }
    
    const RoleIcon: React.FC<{role: Role}> = ({role}) => {
        switch(role) {
            case Role.Doctor: return <Stethoscope size={12} />;
            case Role.Nurse: return <HandHeart size={12} />;
            case Role.PhysicalTherapist: return <HeartPulse size={12} />;
            case Role.SocialWorker: return <Accessibility size={12} />;
            default: return null;
        }
    }

    const renderAssessmentSummary = (assessment: Assessment) => {
        switch(assessment.role) {
            case Role.Doctor:
                 return <p className="truncate"><strong>Plan:</strong> {(assessment as DoctorAssessmentData).plan || 'N/A'}</p>
            case Role.Nurse:
                 const nurseData = assessment as NurseAssessmentData;
                 return (
                     <p>
                         {nurseData.vitals.bp && `BP ${nurseData.vitals.bp}, `}
                         {nurseData.vitals.hr && `HR ${nurseData.vitals.hr}, `}
                         {nurseData.bradenScore && `Braden ${nurseData.bradenScore}`}
                     </p>
                 );
            case Role.PhysicalTherapist:
                const ptData = assessment as PtAssessmentData;
                return <p><strong>Function:</strong> {ptData.function.gaitDistance}, {ptData.function.assistiveDevice}</p>
            case Role.SocialWorker:
                const swData = assessment as SwAssessmentData;
                return <p><strong>الحالة:</strong> {swData.residence}, {swData.economic.income}</p>
            default:
                return null;
        }
    }

    return (
        <div className={`bg-white rounded-xl shadow-sm border ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'} transition-all duration-200 flex flex-col`}>
            <div className="p-4 flex-grow">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-blue-800 ${riskLevelToColor[risk.level]}`}>
                            {getInitials(patient.nameAr)}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-base leading-tight">{patient.nameAr}</h3>
                            <p className="text-xs text-gray-500">{patient.sex}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        {patient.contactAttempts && patient.contactAttempts.length > 0 && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1" title={`${patient.contactAttempts.length} failed contact attempts`}>
                                <PhoneOff size={12} />
                                {patient.contactAttempts.length}
                            </span>
                        )}
                        <input type="checkbox" checked={isSelected} onChange={handleSelect} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    </div>
                </div>
                
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><Hash size={14} className="text-gray-400" /><span>{patient.nationalId}</span></div>
                    <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /><span>{patient.phone || 'N/A'}</span></div>
                    <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" /><span>{patient.areaId || 'N/A'}</span></div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    {patient.tags.map(tag => <Tag key={tag} label={tag} />)}
                </div>
            </div>
            
            {latestAssessment && (
                <div className="px-4 pb-3 text-xs text-gray-600 border-t border-gray-100 mt-2 pt-2">
                    <h4 className="font-bold text-gray-500 mb-1 flex items-center gap-1">
                        <RoleIcon role={latestAssessment.role} />
                        Last Assessment ({new Date(latestAssessment.date).toLocaleDateString()})
                    </h4>
                     <div className="truncate">
                        {renderAssessmentSummary(latestAssessment)}
                     </div>
                </div>
            )}
            
            <div className="border-t border-gray-200 bg-gray-50/50 px-4 py-3 flex items-center justify-between rounded-b-xl">
                 <div className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-2 ${riskLevelToColor[risk.level]}`}>
                     <div className={`w-2 h-2 rounded-full ${risk.level === 'red' ? 'bg-red-500' : risk.level === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                     {risk.label}
                 </div>
                 <div className="flex items-center gap-1">
                     <button onClick={() => handleLogContact('No Answer')} title="Log 'No Answer'" className="p-1.5 rounded-full hover:bg-yellow-100 text-gray-500 hover:text-yellow-600 transition-colors">
                        <PhoneOff size={16}/>
                    </button>
                    <button onClick={() => handleLogContact('Door Not Opened')} title="Log 'Door Not Opened'" className="p-1.5 rounded-full hover:bg-orange-100 text-gray-500 hover:text-orange-600 transition-colors">
                        <DoorClosed size={16}/>
                    </button>
                     <button onClick={() => setEditing(state.currentRole)} disabled={!isClinicalRole} title="Add Assessment" className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <ClipboardList size={16}/>
                     </button>
                     <button className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors">
                        <QrCode size={16}/>
                     </button>
                 </div>
            </div>
        </div>
    );
};

export default PatientCard;
