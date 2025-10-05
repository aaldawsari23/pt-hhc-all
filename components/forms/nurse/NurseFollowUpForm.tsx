import React, { useState, useEffect } from 'react';
import { NurseFollowUpData, VitalSigns } from '../../../types';
import { Save, Calendar, Stethoscope, Activity, Heart, Thermometer } from 'lucide-react';
import { Fieldset, RadioGroup, CheckboxGroup } from '../FormControls';

interface Props {
    initialData?: NurseFollowUpData;
    onSave: (data: NurseFollowUpData) => void;
    onCancel: () => void;
}

type TaskType = 'dressing change' | 'vaccine' | 'meds given' | 'education' | 'wound care' | 'blood draw' | 'catheter care' | 'IV therapy';

interface EnhancedNurseFollowUpData {
    // Complete vital signs
    vitals: {
        bp: string;
        hr: string;
        temp: string;
        rr: string;
        o2sat: string;
        pain: string;
        bgl?: string;
    };
    
    // Assessment status
    status: 'Improved' | 'Unchanged' | 'Worsened';
    woundDelta?: 'better' | 'unchanged' | 'worse';
    deviceDelta?: 'better' | 'unchanged' | 'worse';
    
    // Tasks completed
    tasks: TaskType[];
    
    // Clinical assessment
    skinAssessment: 'intact' | 'at-risk' | 'breakdown' | 'wound-present';
    mobilityLevel: 'independent' | 'assistance' | 'bedbound';
    mentalStatus: 'alert' | 'confused' | 'lethargic';
    respiratoryStatus: 'clear' | 'congested' | 'sob';
    
    // Risk assessments
    fallRisk: 'low' | 'moderate' | 'high';
    pressureRisk: 'low' | 'moderate' | 'high';
    
    // Follow-up plan
    escalation: 'Yes' | 'No';
    escalationReason?: string;
    
    // Enhanced note with structured sections
    nurseNote?: string;
    clinicalFindings?: string;
    interventionsProvided?: string;
    patientEducation?: string;
    recommendationsForNextVisit?: string;
}

const NurseFollowUpForm: React.FC<Props> = ({ initialData, onSave, onCancel }) => {
    // إعداد البيانات الأولية الذكية مع prefill
    const getSmartPrefill = () => {
        const now = new Date();
        const timeOfDay = now.getHours();
        
        // تحديد القيم الافتراضية بناءً على الوقت والبيانات السابقة
        const smartDefaults = {
            vitals: {
                bp: initialData?.vitals?.bp || '120/80', // قيمة افتراضية طبيعية
                hr: initialData?.vitals?.hr || '72',
                temp: initialData?.vitals?.temp || '36.5',
                rr: initialData?.vitals?.rr || '16',
                o2sat: initialData?.vitals?.o2sat || '98',
                pain: initialData?.vitals?.pain || '0',
                bgl: timeOfDay < 12 ? '90' : timeOfDay < 18 ? '120' : '110' // قيم مختلفة حسب الوقت
            },
            status: initialData?.status || 'Unchanged',
            woundDelta: initialData?.woundDelta || 'unchanged',
            deviceDelta: initialData?.deviceDelta || 'unchanged',
            tasks: (initialData?.tasks as TaskType[]) || ['education'], // دائماً تعليم المريض
            skinAssessment: 'intact',
            mobilityLevel: 'independent',
            mentalStatus: 'alert',
            respiratoryStatus: 'clear',
            fallRisk: 'low',
            pressureRisk: 'low',
            escalation: initialData?.escalation || 'No',
            nurseNote: initialData?.nurseNote || '',
            clinicalFindings: '',
            interventionsProvided: 'Routine nursing care provided',
            patientEducation: 'Medication compliance and safety measures discussed',
            recommendationsForNextVisit: 'Continue current care plan'
        };
        
        return smartDefaults;
    };

    const [formData, setFormData] = useState<EnhancedNurseFollowUpData>(getSmartPrefill());
    
    const [activeSection, setActiveSection] = useState<'vitals' | 'assessment' | 'tasks' | 'notes'>('vitals');
    
    const toggleTask = (task: TaskType) => {
        setFormData(prev => ({
            ...prev,
            tasks: prev.tasks.includes(task)
                ? prev.tasks.filter(t => t !== task)
                : [...prev.tasks, task]
        }));
    };

    const updateVitals = (field: keyof typeof formData.vitals, value: string) => {
        setFormData(prev => {
            const newVitals = { ...prev.vitals, [field]: value };
            
            // منطق ذكي للتحديث التلقائي بناءً على العلامات الحيوية
            let autoUpdates: Partial<EnhancedNurseFollowUpData> = {};
            
            // تحديث حالة المريض بناءً على العلامات الحيوية
            if (field === 'temp' && value) {
                const temp = parseFloat(value);
                if (temp >= 38) {
                    autoUpdates.escalation = 'Yes';
                    autoUpdates.escalationReason = 'Fever detected - temperature ≥38°C';
                    autoUpdates.clinicalFindings = 'Patient presents with elevated temperature';
                }
            }
            
            if (field === 'o2sat' && value) {
                const o2 = parseInt(value);
                if (o2 < 95) {
                    autoUpdates.escalation = 'Yes';
                    autoUpdates.escalationReason = 'Low oxygen saturation - SpO2 <95%';
                    autoUpdates.respiratoryStatus = 'sob';
                }
            }
            
            if (field === 'bp' && value) {
                const bpParts = value.split('/');
                if (bpParts.length === 2) {
                    const systolic = parseInt(bpParts[0]);
                    const diastolic = parseInt(bpParts[1]);
                    if (systolic >= 140 || diastolic >= 90) {
                        autoUpdates.clinicalFindings = prev.clinicalFindings + 
                            (prev.clinicalFindings ? '\n' : '') + 'Elevated blood pressure noted';
                    }
                }
            }
            
            if (field === 'pain' && value) {
                const pain = parseInt(value);
                if (pain >= 7) {
                    autoUpdates.escalation = 'Yes';
                    autoUpdates.escalationReason = 'Severe pain reported - Pain score ≥7/10';
                    autoUpdates.interventionsProvided = 'Pain assessment completed, comfort measures provided';
                }
            }
            
            return {
                ...prev,
                vitals: newVitals,
                ...autoUpdates
            };
        });
    };

    const isVitalsComplete = () => {
        const { bp, hr, temp, rr, o2sat } = formData.vitals;
        return bp && hr && temp && rr && o2sat;
    };

    const handleSave = () => {
        const nurseNoteText = [
            formData.nurseNote,
            formData.clinicalFindings && `Clinical Findings: ${formData.clinicalFindings}`,
            formData.interventionsProvided && `Interventions: ${formData.interventionsProvided}`,
            formData.patientEducation && `Education Provided: ${formData.patientEducation}`,
            formData.recommendationsForNextVisit && `Next Visit Recommendations: ${formData.recommendationsForNextVisit}`
        ].filter(Boolean).join('\n\n');

        const saveData: NurseFollowUpData = {
            vitals: formData.vitals,
            status: formData.status,
            woundDelta: formData.woundDelta,
            deviceDelta: formData.deviceDelta,
            tasks: formData.tasks,
            escalation: formData.escalation,
            nurseNote: nurseNoteText || undefined
        };
        
        onSave(saveData);
    };

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="text-emerald-600" size={20} />
                <h4 className="font-bold text-emerald-800 text-lg">Nursing Assessment & Follow-Up</h4>
            </div>
            
            {/* Section Navigation */}
            <div className="flex flex-wrap gap-2 mb-4 p-1 bg-white rounded-lg">
                {[
                    { key: 'vitals', label: 'Vital Signs', icon: Activity },
                    { key: 'assessment', label: 'Assessment', icon: Stethoscope },
                    { key: 'tasks', label: 'Tasks', icon: Heart },
                    { key: 'notes', label: 'Notes', icon: Calendar }
                ].map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveSection(key as any)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                            activeSection === key
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-emerald-700 hover:bg-emerald-100'
                        }`}
                    >
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>
            
            <div className="space-y-4">
                {/* Date Header */}
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-emerald-100">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-800">
                            Visit Date: {new Date().toLocaleDateString()}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500">
                        تاريخ الزيارة: {new Date().toLocaleDateString('ar-SA')}
                    </div>
                </div>
                
                {/* Vital Signs Section */}
                {activeSection === 'vitals' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Heart size={14} className="text-red-500" />
                                    Blood Pressure
                                </label>
                                <input
                                    type="text"
                                    value={formData.vitals.bp}
                                    onChange={(e) => updateVitals('bp', e.target.value)}
                                    placeholder="120/80"
                                    className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Activity size={14} className="text-blue-500" />
                                    Heart Rate
                                </label>
                                <input
                                    type="number"
                                    value={formData.vitals.hr}
                                    onChange={(e) => updateVitals('hr', e.target.value)}
                                    placeholder="72"
                                    className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Thermometer size={14} className="text-orange-500" />
                                    Temperature (°C)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.vitals.temp}
                                    onChange={(e) => updateVitals('temp', e.target.value)}
                                    placeholder="36.5"
                                    className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Respiratory Rate
                                </label>
                                <input
                                    type="number"
                                    value={formData.vitals.rr}
                                    onChange={(e) => updateVitals('rr', e.target.value)}
                                    placeholder="16"
                                    className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    SpO₂ (%)
                                </label>
                                <input
                                    type="number"
                                    value={formData.vitals.o2sat}
                                    onChange={(e) => updateVitals('o2sat', e.target.value)}
                                    placeholder="98"
                                    className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Blood Glucose
                                </label>
                                <input
                                    type="number"
                                    value={formData.vitals.bgl}
                                    onChange={(e) => updateVitals('bgl', e.target.value)}
                                    placeholder="120 (optional)"
                                    className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                        
                        <Fieldset legend="Pain Level (0-10)">
                            <RadioGroup
                                value={formData.vitals.pain}
                                onChange={(val) => updateVitals('pain', val)}
                                options={['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const}
                            />
                        </Fieldset>
                    </div>
                )}
                
                {/* Clinical Assessment Section */}
                {activeSection === 'assessment' && (
                    <div className="space-y-4">
                        <Fieldset legend="Overall Patient Status">
                            <RadioGroup
                                value={formData.status}
                                onChange={(val) => setFormData(p => ({ ...p, status: val }))}
                                options={['Improved', 'Unchanged', 'Worsened'] as const}
                            />
                        </Fieldset>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            <Fieldset legend="Skin Assessment">
                                <RadioGroup
                                    value={formData.skinAssessment}
                                    onChange={(val) => setFormData(p => ({ ...p, skinAssessment: val }))}
                                    options={['intact', 'at-risk', 'breakdown', 'wound-present'] as const}
                                />
                            </Fieldset>
                            
                            <Fieldset legend="Mobility Level">
                                <RadioGroup
                                    value={formData.mobilityLevel}
                                    onChange={(val) => setFormData(p => ({ ...p, mobilityLevel: val }))}
                                    options={['independent', 'assistance', 'bedbound'] as const}
                                />
                            </Fieldset>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            <Fieldset legend="Mental Status">
                                <RadioGroup
                                    value={formData.mentalStatus}
                                    onChange={(val) => setFormData(p => ({ ...p, mentalStatus: val }))}
                                    options={['alert', 'confused', 'lethargic'] as const}
                                />
                            </Fieldset>
                            
                            <Fieldset legend="Respiratory Status">
                                <RadioGroup
                                    value={formData.respiratoryStatus}
                                    onChange={(val) => setFormData(p => ({ ...p, respiratoryStatus: val }))}
                                    options={['clear', 'congested', 'sob'] as const}
                                />
                            </Fieldset>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4">
                            <Fieldset legend="Fall Risk">
                                <RadioGroup
                                    value={formData.fallRisk}
                                    onChange={(val) => setFormData(p => ({ ...p, fallRisk: val }))}
                                    options={['low', 'moderate', 'high'] as const}
                                />
                            </Fieldset>
                            
                            <Fieldset legend="Pressure Risk">
                                <RadioGroup
                                    value={formData.pressureRisk}
                                    onChange={(val) => setFormData(p => ({ ...p, pressureRisk: val }))}
                                    options={['low', 'moderate', 'high'] as const}
                                />
                            </Fieldset>
                            
                            <Fieldset legend="Escalation Needed">
                                <RadioGroup
                                    value={formData.escalation}
                                    onChange={(val) => setFormData(p => ({ ...p, escalation: val }))}
                                    options={['No', 'Yes'] as const}
                                />
                            </Fieldset>
                        </div>
                        
                        {formData.woundDelta !== undefined && (
                            <Fieldset legend="Wound Status Change">
                                <RadioGroup
                                    value={formData.woundDelta}
                                    onChange={(val) => setFormData(p => ({ ...p, woundDelta: val }))}
                                    options={['better', 'unchanged', 'worse'] as const}
                                />
                            </Fieldset>
                        )}
                        
                        {formData.deviceDelta !== undefined && (
                            <Fieldset legend="Device Status Change">
                                <RadioGroup
                                    value={formData.deviceDelta}
                                    onChange={(val) => setFormData(p => ({ ...p, deviceDelta: val }))}
                                    options={['better', 'unchanged', 'worse'] as const}
                                />
                            </Fieldset>
                        )}
                    </div>
                )}
                
                {/* Tasks & Interventions Section */}
                {activeSection === 'tasks' && (
                    <div className="space-y-4">
                        <Fieldset legend="Tasks Completed During Visit">
                            <CheckboxGroup
                                value={new Set(formData.tasks)}
                                onChange={toggleTask}
                                options={[
                                    'dressing change',
                                    'vaccine',
                                    'meds given',
                                    'education',
                                    'wound care',
                                    'blood draw',
                                    'catheter care',
                                    'IV therapy'
                                ] as const}
                            />
                        </Fieldset>
                        
                        {formData.escalation === 'Yes' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <label className="block text-sm font-medium text-yellow-800 mb-2">
                                    Reason for Escalation
                                </label>
                                <textarea
                                    value={formData.escalationReason || ''}
                                    onChange={(e) => setFormData(p => ({ ...p, escalationReason: e.target.value }))}
                                    rows={3}
                                    placeholder="Describe the reason for escalating to physician..."
                                    className="w-full p-3 border border-yellow-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>
                        )}
                    </div>
                )}
                
                {/* Notes Section */}
                {activeSection === 'notes' && (
                    <div className="space-y-4">
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    General Nursing Note
                                </label>
                                <textarea
                                    value={formData.nurseNote || ''}
                                    onChange={(e) => setFormData(p => ({ ...p, nurseNote: e.target.value }))}
                                    rows={3}
                                    placeholder="General observations and notes..."
                                    className="w-full p-3 border rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Clinical Findings
                                </label>
                                <textarea
                                    value={formData.clinicalFindings || ''}
                                    onChange={(e) => setFormData(p => ({ ...p, clinicalFindings: e.target.value }))}
                                    rows={2}
                                    placeholder="Specific clinical findings and observations..."
                                    className="w-full p-3 border rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Interventions Provided
                                </label>
                                <textarea
                                    value={formData.interventionsProvided || ''}
                                    onChange={(e) => setFormData(p => ({ ...p, interventionsProvided: e.target.value }))}
                                    rows={2}
                                    placeholder="Detail interventions performed during visit..."
                                    className="w-full p-3 border rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Patient Education Provided
                                </label>
                                <textarea
                                    value={formData.patientEducation || ''}
                                    onChange={(e) => setFormData(p => ({ ...p, patientEducation: e.target.value }))}
                                    rows={2}
                                    placeholder="Education topics covered with patient/family..."
                                    className="w-full p-3 border rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Recommendations for Next Visit
                                </label>
                                <textarea
                                    value={formData.recommendationsForNextVisit || ''}
                                    onChange={(e) => setFormData(p => ({ ...p, recommendationsForNextVisit: e.target.value }))}
                                    rows={2}
                                    placeholder="Recommendations and focus areas for next visit..."
                                    className="w-full p-3 border rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-emerald-200">
                <div className="text-sm text-gray-600">
                    {!isVitalsComplete() && activeSection === 'vitals' && (
                        <span className="text-amber-600">⚠️ Complete all vital signs</span>
                    )}
                    {formData.escalation === 'Yes' && !formData.escalationReason && (
                        <span className="text-red-600">⚠️ Escalation reason required</span>
                    )}
                </div>
                
                <div className="flex gap-3">
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-emerald-500 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSave}
                        disabled={!isVitalsComplete() || (formData.escalation === 'Yes' && !formData.escalationReason)}
                        className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                    >
                        <Save size={16} />
                        Save Assessment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NurseFollowUpForm;