import React, { useState, memo, useCallback } from 'react';
import { Patient, Assessment, Role, DoctorAssessmentData, NurseAssessmentData, PtAssessmentData, SwAssessmentData } from '../types';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import { getRiskLevel, riskLevelToColor, getInitials } from '../utils/helpers';
import { Phone, PhoneOff, MapPin, Hash, QrCode, ClipboardList, Stethoscope, HandHeart, Accessibility, HeartPulse, FileText, Printer, History, Calendar, User, Shield, Thermometer, HeartHandshake, Activity, Plus } from 'lucide-react';
import UnifiedFormHeader from './UnifiedFormHeader';
import SmartAssessmentSelector from './SmartAssessmentSelector';
import DoctorAssessmentForm from './forms/doctor/DoctorAssessmentForm';
import NurseAssessmentForm from './forms/nurse/NurseAssessmentForm';
import PtAssessmentForm from './forms/pt/PtAssessmentForm';
import SwAssessmentForm from './forms/sw/SwAssessmentForm';
import DoctorFollowUpForm from './forms/doctor/DoctorFollowUpForm';
import NurseFollowUpForm from './forms/nurse/NurseFollowUpForm';
import PtFollowUpForm from './forms/pt/PtFollowUpForm';
import SwFollowUpForm from './forms/sw/SwFollowUpForm';
import PrintablePatientCard from './PrintablePatientCard';
import PatientHistory from './PatientHistory';
import PrintManager from './PrintManager';
import EnhancedPrintManager from './EnhancedPrintManager';
import EnhancedContactManager from './EnhancedContactManager';


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

const PatientCard: React.FC<{ patient: Patient }> = memo(({ patient }) => {
    const { state, dispatch } = useHomeHealthcare();
    // Consolidated modal state for better performance
    const [modalState, setModalState] = useState({
        showSmartAssessmentSelector: false,
        generatingPdf: false,
        showPrintCard: false,
        showHistory: false,
        showPrintManager: false,
        showEnhancedPrintManager: false,
        showEnhancedContactManager: false,
        selectedAssessmentForPrint: null as Assessment | null
    });
    const isSelected = state.selectedPatientIds.has(patient.nationalId);
    
    // Simplified for demo - no Firebase dependencies
    const useNetlifyDb = false;
    const currentUser = { name: 'System User' };
    const risk = getRiskLevel(patient.admissionDate);
    const latestAssessment = patient.assessments?.[0];

    const handleSelect = useCallback(() => {
        dispatch({ type: 'TOGGLE_PATIENT_SELECTION', payload: patient.nationalId });
    }, [dispatch, patient.nationalId]);


    const handleQuickLogContact = useCallback((type: 'Phone Answered' | 'Family Answered') => {
        const staffList = state.staff || [];
        const currentUser = staffList.find(s => s.الاسم && s.الاسم.length > 0) || { الاسم: 'System User' };
        const contactAttempt = {
            date: new Date().toISOString(),
            type,
            staffName: currentUser.الاسم,
            contactMethod: 'Phone Call' as const,
            outcome: 'Successful' as const
        };
        dispatch({ type: 'LOG_CONTACT_ATTEMPT', payload: { patientId: patient.nationalId, contactAttempt } });
    }, [state.staff, patient.nationalId, dispatch]);

    const isClinicalRole = [Role.Doctor, Role.Nurse, Role.PhysicalTherapist, Role.SocialWorker].includes(state.currentRole);


    
    const RoleIcon: React.FC<{role: Role}> = ({role}) => {
        switch(role) {
            case Role.Doctor: return <Stethoscope size={12} />;
            case Role.Nurse: return <HandHeart size={12} />;
            case Role.PhysicalTherapist: return <HeartPulse size={12} />;
            case Role.SocialWorker: return <Accessibility size={12} />;
            default: return null;
        }
    }


    const handleGeneratePatientCard = async () => {
        try {
            setModalState(prev => ({ ...prev, generatingPdf: true }));
            // Use browser print functionality instead of Netlify service
            setModalState(prev => ({ ...prev, showPrintCard: true }));
            
            // Small delay to ensure modal renders before printing
            setTimeout(() => {
                window.print();
                setModalState(prev => ({ ...prev, showPrintCard: false, generatingPdf: false }));
            }, 500);
        } catch (error) {
            console.error('Print error:', error);
            alert('خطأ في الطباعة: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'));
            setModalState(prev => ({ ...prev, generatingPdf: false }));
        }
    };

    return (
        <>
            <div className={`mobile-card ${isSelected ? 'border-blue-500 ring-4 ring-blue-200/50 shadow-blue-100 transform scale-[1.02]' : 'border-gray-100 hover:border-blue-200'} transition-all duration-300 flex flex-col hover:shadow-xl transform hover:scale-[1.01] gpu-accelerated`}>
            <div className="p-4 md:p-5 flex-grow">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                            onClick={() => {
                                if (patient.gmapsUrl) {
                                    // Generate Google Maps URL based on patient info
                                    const searchQuery = encodeURIComponent(`${patient.nameAr} ${patient.areaId || ''}`);
                                    window.open(`https://maps.google.com/?q=${searchQuery}`, '_blank');
                                } else {
                                    alert('No location data available | لا توجد بيانات موقع');
                                }
                            }}
                            className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg border-2 border-white hover:shadow-xl transition-all transform hover:scale-110 active:scale-95 ripple"
                            title="Open Google Maps Location | فتح الموقع في خرائط جوجل"
                        >
                            <QrCode size={20} className="text-white" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-base md:text-lg leading-tight truncate">{patient.nameAr}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs md:text-sm text-gray-500">{patient.sex}</p>
                                {patient.status === 'active' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                        نشط
                                    </span>
                                )}
                            </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5">
                            <Hash size={16} className="text-blue-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <span className="text-xs text-gray-500 block">رقم الهوية</span>
                                <span className="font-medium truncate">{patient.nationalId}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5">
                            <Phone size={16} className="text-green-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <span className="text-xs text-gray-500 block">الهاتف</span>
                                <span className="font-medium truncate">{patient.phone || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5">
                            <MapPin size={16} className="text-purple-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <span className="text-xs text-gray-500 block">المنطقة</span>
                                <span className="font-medium truncate">{patient.areaId || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5">
                            <Calendar size={16} className="text-amber-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <span className="text-xs text-gray-500 block">تاريخ القبول</span>
                                <span className="font-medium truncate">
                                    {patient.admissionDate ? new Date(patient.admissionDate).toLocaleDateString('ar-SA') : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* معلومات طبية إضافية محسنة */}
                    {(patient.bradenScore || patient.level || patient.minMonthlyRequired) && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                            <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                                <Activity size={14} className="text-blue-600" />
                                معلومات طبية
                                <span className="text-xs font-normal text-blue-600">Clinical Data</span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                {patient.bradenScore && (
                                    <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-blue-100">
                                        <Shield size={14} className="text-blue-500" />
                                        <span>نقاط برادن: <strong className={`${patient.bradenScore <= 12 ? 'text-red-600' : patient.bradenScore <= 14 ? 'text-yellow-600' : 'text-green-600'}`}>{patient.bradenScore}</strong></span>
                                    </div>
                                )}
                                {patient.level && (
                                    <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-green-100">
                                        <HeartHandshake size={14} className="text-green-500" />
                                        <span>المستوى: <strong>{patient.level}</strong></span>
                                    </div>
                                )}
                                {patient.minMonthlyRequired && (
                                    <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-purple-100">
                                        <Calendar size={14} className="text-purple-500" />
                                        <span>الزيارات الشهرية: <strong>{patient.minMonthlyRequired}</strong></span>
                                    </div>
                                )}
                                {patient.lastVisit && (
                                    <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-orange-100">
                                        <History size={14} className="text-orange-500" />
                                        <span>آخر زيارة: <strong>{new Date(patient.lastVisit).toLocaleDateString('ar-SA')}</strong></span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* عرض شامل للمؤشرات الطبية والأجهزة */}
                <div className="mt-4 space-y-3">
                    {/* المؤشرات الطبية المحسوبة تلقائياً */}
                    {(patient.hasCatheter || patient.wounds?.presentCount || patient.ngTube || patient.gTube || patient.fallHighRisk || patient.ivTherapy || patient.ventSupport) && (
                        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                            <h4 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                                الأجهزة والحالات الطبية
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {patient.hasCatheter && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200">
                                        🩺 قسطرة
                                    </span>
                                )}
                                {patient.wounds && patient.wounds.presentCount && patient.wounds.presentCount > 0 && (
                                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full border border-red-200">
                                        🩹 جروح ({patient.wounds.presentCount})
                                    </span>
                                )}
                                {patient.ngTube && (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200">
                                        🔗 أنبوب أنفي
                                    </span>
                                )}
                                {patient.gTube && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full border border-purple-200">
                                        🔗 أنبوب معدي
                                    </span>
                                )}
                                {patient.fallHighRisk && (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-200">
                                        ⚠️ خطر السقوط
                                    </span>
                                )}
                                {patient.ivTherapy && (
                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full border border-indigo-200">
                                        💉 علاج وريدي
                                    </span>
                                )}
                                {patient.ventSupport && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200">
                                        🫁 دعم تنفسي
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* العلامات الإضافية */}
                    {patient.tags && patient.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {patient.tags.map(tag => <Tag key={tag} label={tag} />)}
                        </div>
                    )}
                </div>
            </div>
            
            
            <div className="border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30 px-4 md:px-5 py-3 md:py-4 rounded-b-2xl">
                <div className="flex items-center justify-between">
                    <div className={`px-3 py-2 text-xs md:text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm border ${riskLevelToColor[risk.level]}`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${risk.level === 'red' ? 'bg-red-500' : risk.level === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                        {risk.label}
                    </div>
                    
                    <div className="flex items-center gap-1">
                        {/* Communication Actions */}
                        <div className="flex items-center bg-white/50 rounded-lg p-1 border border-white/50">
                            <button 
                                onClick={() => setModalState(prev => ({ ...prev, showEnhancedContactManager: true }))} 
                                title="سجل الاتصالات" 
                                className="p-1.5 rounded-md hover:bg-blue-500 text-blue-600 hover:text-white transition-all transform hover:scale-110"
                            >
                                <Phone size={14}/>
                            </button>
                        </div>

                        {/* Records Actions */}
                        <div className="flex items-center bg-white/50 rounded-lg p-1 border border-white/50">
                            <button 
                                onClick={() => setModalState(prev => ({ ...prev, showHistory: true }))}
                                title="سجل التقييمات" 
                                className="p-1.5 rounded-md hover:bg-purple-500 text-purple-600 hover:text-white transition-all transform hover:scale-110"
                            >
                                <History size={14} />
                            </button>
                            
                            <button 
                                onClick={() => setModalState(prev => ({ ...prev, showEnhancedPrintManager: true }))}
                                title="سجل الزيارات والطباعة" 
                                className="p-1.5 rounded-md hover:bg-indigo-500 text-indigo-600 hover:text-white transition-all transform hover:scale-110"
                            >
                                <Calendar size={14} />
                            </button>
                        </div>

                        {/* Assessment Actions */}
                        {isClinicalRole && (
                            <div className="flex items-center bg-white/50 rounded-lg p-1 border border-white/50">
                                <button 
                                    onClick={() => setModalState(prev => ({ ...prev, showSmartAssessmentSelector: true }))} 
                                    title="إضافة تقييم جديد" 
                                    className="p-1.5 rounded-md hover:bg-green-500 text-green-600 hover:text-white transition-all transform hover:scale-110"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        )}

                        {/* Print Actions */}
                        <div className="flex items-center bg-white/50 rounded-lg p-1 border border-white/50">
                            <button 
                                onClick={() => setModalState(prev => ({ ...prev, showEnhancedPrintManager: true }))}
                                title="طباعة التقارير" 
                                className="p-1.5 rounded-md hover:bg-orange-500 text-orange-600 hover:text-white transition-all transform hover:scale-110"
                            >
                                <Printer size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </div>
            
            {/* Print Modal */}
            {modalState.showPrintCard && (
                <PrintablePatientCard 
                    patient={patient} 
                    onClose={() => setModalState(prev => ({ ...prev, showPrintCard: false }))} 
                />
            )}
            
            {/* History Modal */}
            {modalState.showHistory && (
                <PatientHistory 
                    patient={patient} 
                    onClose={() => setModalState(prev => ({ ...prev, showHistory: false }))} 
                />
            )}
            
            {/* Enhanced Print Manager */}
            {modalState.showPrintManager && (
                <PrintManager
                    patient={patient}
                    assessment={modalState.selectedAssessmentForPrint}
                    staff={state.staff}
                    onClose={() => setModalState(prev => ({
                        ...prev,
                        showPrintManager: false,
                        selectedAssessmentForPrint: null
                    }))}
                />
            )}
            
            {/* New Enhanced Print Manager */}
            {modalState.showEnhancedPrintManager && (
                <EnhancedPrintManager
                    patient={patient}
                    onClose={() => setModalState(prev => ({ ...prev, showEnhancedPrintManager: false }))}
                />
            )}
            
            {/* Enhanced Contact Manager */}
            {modalState.showEnhancedContactManager && (
                <EnhancedContactManager
                    patientId={patient.nationalId}
                    patientName={patient.nameAr}
                    onClose={() => setModalState(prev => ({ ...prev, showEnhancedContactManager: false }))}
                />
            )}
            
            {/* Smart Assessment Selector */}
            {modalState.showSmartAssessmentSelector && (
                <SmartAssessmentSelector
                    patient={patient}
                    onClose={() => setModalState(prev => ({ ...prev, showSmartAssessmentSelector: false }))}
                />
            )}
        </>
    );
});

PatientCard.displayName = 'PatientCard';

export default PatientCard;
