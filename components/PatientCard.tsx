import React, { useState } from 'react';
import { Patient, Assessment, Role, DoctorAssessmentData, NurseAssessmentData, PtAssessmentData, SwAssessmentData } from '../types';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import { useFirebase } from '../context/FirebaseContext';
import { getRiskLevel, riskLevelToColor, getInitials } from '../utils/helpers';
import { Phone, MapPin, Hash, QrCode, ClipboardList, Stethoscope, HandHeart, Accessibility, HeartPulse, PhoneOff, DoorClosed, FileText, Printer } from 'lucide-react';
import { NetlifyDbService } from '../utils/netlifyDb';
import DoctorAssessmentForm from './forms/doctor/DoctorAssessmentForm';
import NurseAssessmentForm from './forms/nurse/NurseAssessmentForm';
import PtAssessmentForm from './forms/pt/PtAssessmentForm';
import SwAssessmentForm from './forms/sw/SwAssessmentForm';


const Tag: React.FC<{ label: string }> = ({ label }) => {
    const colorMap: { [key: string]: string } = {
        'Catheter': 'bg-blue-500 text-white shadow-sm',
        'Pressure Ulcer': 'bg-red-500 text-white shadow-sm',
        'Tube Feeding': 'bg-amber-500 text-white shadow-sm',
        'Fall Risk': 'bg-purple-500 text-white shadow-sm',
        'IV Therapy': 'bg-indigo-500 text-white shadow-sm',
        'Ventilation': 'bg-pink-500 text-white shadow-sm',
    };
    return (
        <span className={`px-2.5 py-1 text-xs font-bold rounded-full border-2 border-white/50 ${colorMap[label] || 'bg-gray-500 text-white shadow-sm'}`}>
            {label}
        </span>
    );
};

const PatientCard: React.FC<{ patient: Patient }> = ({ patient }) => {
    const { state, dispatch } = useHomeHealthcare();
    const { useNetlifyDb, currentUser } = useFirebase();
    const [editing, setEditing] = useState<Role | null>(null);
    const [generatingPdf, setGeneratingPdf] = useState(false);
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
             <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-500 ring-4 ring-blue-200/50 flex flex-col min-h-[450px] md:min-h-[500px]">
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

    const handleGeneratePatientCard = async () => {
        if (!useNetlifyDb) {
            alert('PDF generation is only available with Netlify DB. Please switch to Netlify DB in Settings.');
            return;
        }

        try {
            setGeneratingPdf(true);
            const result = await NetlifyDbService.generatePatientCard(
                patient.nationalId, 
                currentUser?.name || 'النظام'
            );
            
            if (result.success && result.pdfContent) {
                // Download the generated PDF
                const blob = new Blob([result.pdfContent], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = result.filename || `patient_card_${patient.nationalId}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                alert('تم إنشاء بطاقة المريض بنجاح');
            }
        } catch (error) {
            console.error('Error generating patient card:', error);
            alert('فشل في إنشاء بطاقة المريض');
        } finally {
            setGeneratingPdf(false);
        }
    };

    return (
        <div className={`bg-white rounded-2xl shadow-lg border-2 ${isSelected ? 'border-blue-500 ring-4 ring-blue-200/50 shadow-blue-100' : 'border-gray-100 hover:border-blue-200'} transition-all duration-300 flex flex-col hover:shadow-xl`}>
            <div className="p-4 md:p-5 flex-grow">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-sm md:text-base shadow-md ${riskLevelToColor[risk.level]}`}>
                            {getInitials(patient.nameAr)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-base md:text-lg leading-tight truncate">{patient.nameAr}</h3>
                            <p className="text-xs md:text-sm text-gray-500 mt-0.5">{patient.sex}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {patient.contactAttempts && patient.contactAttempts.length > 0 && (
                            <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm" title={`${patient.contactAttempts.length} failed contact attempts`}>
                                <PhoneOff size={12} />
                                {patient.contactAttempts.length}
                            </span>
                        )}
                        <input type="checkbox" checked={isSelected} onChange={handleSelect} className="h-5 w-5 md:h-6 md:w-6 rounded-md border-2 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer touch-target-44" />
                    </div>
                </div>
                
                <div className="space-y-2.5 text-sm md:text-base text-gray-700">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5">
                        <Hash size={16} className="text-blue-500 flex-shrink-0" />
                        <span className="font-medium">{patient.nationalId}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5">
                        <Phone size={16} className="text-green-500 flex-shrink-0" />
                        <span className="font-medium">{patient.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5">
                        <MapPin size={16} className="text-purple-500 flex-shrink-0" />
                        <span className="font-medium">{patient.areaId || 'N/A'}</span>
                    </div>
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
            
            <div className="border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30 px-4 md:px-5 py-3 md:py-4 flex items-center justify-between rounded-b-2xl">
                 <div className={`px-3 py-2 text-xs md:text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm border ${riskLevelToColor[risk.level]}`}>
                     <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${risk.level === 'red' ? 'bg-red-500' : risk.level === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                     {risk.label}
                 </div>
                 <div className="flex items-center gap-1.5">
                     <button onClick={() => handleLogContact('No Answer')} title="Log 'No Answer'" className="p-2 md:p-2.5 rounded-xl hover:bg-yellow-500 text-gray-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md touch-target-44">
                        <PhoneOff size={16}/>
                    </button>
                    <button onClick={() => handleLogContact('Door Not Opened')} title="Log 'Door Not Opened'" className="p-2 md:p-2.5 rounded-xl hover:bg-orange-500 text-gray-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md touch-target-44">
                        <DoorClosed size={16}/>
                    </button>
                     <button onClick={() => setEditing(state.currentRole)} disabled={!isClinicalRole} title="Add Assessment" className="p-2 md:p-2.5 rounded-xl hover:bg-blue-500 text-gray-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed touch-target-44">
                        <ClipboardList size={16}/>
                     </button>
                     <button className="p-2 md:p-2.5 rounded-xl hover:bg-purple-500 text-gray-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md touch-target-44">
                        <QrCode size={16}/>
                     </button>
                     {useNetlifyDb && (
                         <button 
                             onClick={handleGeneratePatientCard}
                             disabled={generatingPdf}
                             title="إنشاء بطاقة المريض PDF" 
                             className="p-2 md:p-2.5 rounded-xl hover:bg-green-500 text-gray-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 touch-target-44"
                         >
                             {generatingPdf ? (
                                 <div className="animate-spin">
                                     <FileText size={16} />
                                 </div>
                             ) : (
                                 <Printer size={16} />
                             )}
                         </button>
                     )}
                 </div>
            </div>
        </div>
    );
};

export default PatientCard;
