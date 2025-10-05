import React, { useState } from 'react';
import { DoctorFollowUpData } from '../../../types';
import { Save, Stethoscope, ClipboardList, AlertTriangle, Calendar, FileText, Pill } from 'lucide-react';
import { Fieldset, RadioGroup, CheckboxGroup } from '../FormControls';

interface Props {
    initialData?: DoctorFollowUpData;
    onSave: (data: DoctorFollowUpData) => void;
    onCancel: () => void;
}

const planDetailOptions = ['Add referral', 'Adjust meds', 'Start antibiotics', 'Wound care upgrade', 'Frequency change'] as const;
type PlanDetail = typeof planDetailOptions[number];

const newIssueOptions = ['fever', 'pain ↑', 'wound deterioration', 'device issue', 'other'] as const;
type NewIssue = typeof newIssueOptions[number];

interface EnhancedDoctorFollowUpData {
    // Core assessment
    status: 'Improved' | 'Unchanged' | 'Worsened';
    responseToPlan: 'good' | 'partial' | 'poor';
    adherence: 'good' | 'partial' | 'poor';
    
    // New issues and complications
    newIssues: NewIssue[];
    otherIssueDescription?: string;
    
    // Clinical evaluation
    painAssessment: {
        level: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';
        character?: 'sharp' | 'dull' | 'burning' | 'cramping' | 'aching';
        location?: string;
        relievingFactors?: string;
        aggravatingFactors?: string;
    };
    
    // System review
    systemsReview: {
        cardiovascular: 'stable' | 'concerning' | 'deteriorating';
        respiratory: 'stable' | 'concerning' | 'deteriorating';
        gastrointestinal: 'stable' | 'concerning' | 'deteriorating';
        genitourinary: 'stable' | 'concerning' | 'deteriorating';
        neurological: 'stable' | 'concerning' | 'deteriorating';
        skin: 'stable' | 'concerning' | 'deteriorating';
    };
    
    // Medication review
    medicationChanges: 'none' | 'dose-adjustment' | 'new-medication' | 'discontinuation' | 'switch';
    medicationDetails?: string;
    
    // Plan and follow-up
    plan: 'Continue' | 'Change';
    planDetails: PlanDetail[];
    nextFollowUp: '24–48h' | '3–7d' | '2–4w';
    
    // Enhanced documentation
    mdNote?: string;
    clinicalImpression?: string;
    differentialDiagnosis?: string;
    treatmentRationale?: string;
    patientEducation?: string;
    familyEducation?: string;
    
    // Risk stratification
    riskLevel: 'low' | 'moderate' | 'high';
    riskFactors?: string[];
    
    // Quality indicators
    goalsMet: 'all' | 'partial' | 'none';
    qualityMeasures?: string[];
}

const DoctorFollowUpForm: React.FC<Props> = ({ initialData, onSave, onCancel }) => {
    // إعداد البيانات الأولية الذكية للطبيب
    const getSmartMedicalPrefill = () => {
        const smartDefaults: EnhancedDoctorFollowUpData = {
            status: initialData?.status || 'Unchanged',
            responseToPlan: initialData?.responseToPlan || 'good',
            adherence: initialData?.adherence || 'good',
            newIssues: (initialData?.newIssues as NewIssue[]) || [],
            painAssessment: {
                level: '0'
            },
            systemsReview: {
                cardiovascular: 'stable',
                respiratory: 'stable',
                gastrointestinal: 'stable',
                genitourinary: 'stable',
                neurological: 'stable',
                skin: 'stable'
            },
            medicationChanges: 'none',
            plan: initialData?.plan || 'Continue',
            planDetails: (initialData?.planDetails as PlanDetail[]) || [],
            nextFollowUp: initialData?.nextFollowUp || '3–7d',
            mdNote: initialData?.mdNote || '',
            clinicalImpression: 'Patient stable with current management plan',
            treatmentRationale: 'Continue current treatment approach based on patient response',
            patientEducation: 'Disease management and medication compliance discussed',
            familyEducation: 'Care instructions provided to family members',
            riskLevel: 'low',
            goalsMet: 'all'
        };
        
        return smartDefaults;
    };

    const [formData, setFormData] = useState<EnhancedDoctorFollowUpData>(getSmartMedicalPrefill());
    
    const [activeSection, setActiveSection] = useState<'assessment' | 'systems' | 'plan' | 'notes'>('assessment');
    
    const handleNewIssuesToggle = (issue: NewIssue) => {
        setFormData(prev => ({
            ...prev,
            newIssues: prev.newIssues.includes(issue)
                ? prev.newIssues.filter(i => i !== issue)
                : [...prev.newIssues, issue]
        }));
    };
    
    const handlePlanDetailsToggle = (detail: PlanDetail) => {
        setFormData(prev => ({
            ...prev,
            planDetails: prev.planDetails.includes(detail)
                ? prev.planDetails.filter(d => d !== detail)
                : [...prev.planDetails, detail]
        }));
    };
    
    const updateSystemReview = (system: keyof typeof formData.systemsReview, status: 'stable' | 'concerning' | 'deteriorating') => {
        setFormData(prev => {
            let autoUpdates: Partial<EnhancedDoctorFollowUpData> = {};
            
            // منطق ذكي بناءً على مراجعة الأنظمة
            if (status === 'concerning' || status === 'deteriorating') {
                autoUpdates.riskLevel = status === 'deteriorating' ? 'high' : 'moderate';
                autoUpdates.nextFollowUp = status === 'deteriorating' ? '24–48h' : '3–7d';
                
                // تحديث الانطباع السريري
                const systemNames = {
                    cardiovascular: 'Cardiovascular system',
                    respiratory: 'Respiratory system', 
                    gastrointestinal: 'Gastrointestinal system',
                    genitourinary: 'Genitourinary system',
                    neurological: 'Neurological system',
                    skin: 'Skin and integumentary system'
                };
                
                autoUpdates.clinicalImpression = `${systemNames[system]} showing ${status} status - requires monitoring`;
                
                if (status === 'deteriorating') {
                    autoUpdates.treatmentRationale = `Plan modification needed due to ${system} deterioration`;
                    autoUpdates.plan = 'Change';
                }
            }
            
            return {
                ...prev,
                systemsReview: { ...prev.systemsReview, [system]: status },
                ...autoUpdates
            };
        });
    };

    const isAssessmentComplete = () => {
        return formData.status && formData.responseToPlan && formData.adherence;
    };

    const handleSave = () => {
        const notesText = [
            formData.mdNote,
            formData.clinicalImpression && `Clinical Impression: ${formData.clinicalImpression}`,
            formData.differentialDiagnosis && `Differential Diagnosis: ${formData.differentialDiagnosis}`,
            formData.treatmentRationale && `Treatment Rationale: ${formData.treatmentRationale}`,
            formData.patientEducation && `Patient Education: ${formData.patientEducation}`,
            formData.familyEducation && `Family Education: ${formData.familyEducation}`
        ].filter(Boolean).join('\n\n');
        
        const saveData: DoctorFollowUpData = {
            status: formData.status,
            responseToPlan: formData.responseToPlan,
            adherence: formData.adherence,
            newIssues: formData.newIssues,
            plan: formData.plan,
            planDetails: formData.planDetails,
            nextFollowUp: formData.nextFollowUp,
            mdNote: notesText || undefined
        };
        
        onSave(saveData);
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="text-blue-600" size={20} />
                <h4 className="font-bold text-blue-800 text-lg">Physician Assessment & Follow-Up</h4>
            </div>
            
            {/* Section Navigation */}
            <div className="flex flex-wrap gap-2 mb-4 p-1 bg-white rounded-lg">
                {[
                    { key: 'assessment', label: 'Clinical Assessment', icon: ClipboardList },
                    { key: 'systems', label: 'Systems Review', icon: Stethoscope },
                    { key: 'plan', label: 'Plan & Orders', icon: Pill },
                    { key: 'notes', label: 'Documentation', icon: FileText }
                ].map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveSection(key as any)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                            activeSection === key
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-blue-700 hover:bg-blue-100'
                        }`}
                    >
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>
            
            <div className="space-y-4">
                {/* Date Header */}
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                            Assessment Date: {new Date().toLocaleDateString()}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500">
                        تاريخ التقييم: {new Date().toLocaleDateString('ar-SA')}
                    </div>
                </div>
                
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
                            <Fieldset legend="Response to Treatment Plan">
                                <RadioGroup 
                                    value={formData.responseToPlan} 
                                    onChange={(val) => setFormData(p => ({ ...p, responseToPlan: val }))} 
                                    options={['good', 'partial', 'poor'] as const} 
                                />
                            </Fieldset>
                            
                            <Fieldset legend="Medication Adherence">
                                <RadioGroup 
                                    value={formData.adherence} 
                                    onChange={(val) => setFormData(p => ({ ...p, adherence: val }))} 
                                    options={['good', 'partial', 'poor'] as const} 
                                />
                            </Fieldset>
                        </div>
                        
                        <Fieldset legend="Pain Assessment (0-10)">
                            <RadioGroup
                                value={formData.painAssessment.level}
                                onChange={(val) => setFormData(p => ({ 
                                    ...p, 
                                    painAssessment: { ...p.painAssessment, level: val }
                                }))}
                                options={['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const}
                            />
                            {parseInt(formData.painAssessment.level) > 3 && (
                                <div className="mt-3 grid md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Pain Character
                                        </label>
                                        <select
                                            value={formData.painAssessment.character || ''}
                                            onChange={(e) => setFormData(p => ({ 
                                                ...p, 
                                                painAssessment: { ...p.painAssessment, character: e.target.value as any }
                                            }))}
                                            className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select...</option>
                                            <option value="sharp">Sharp</option>
                                            <option value="dull">Dull</option>
                                            <option value="burning">Burning</option>
                                            <option value="cramping">Cramping</option>
                                            <option value="aching">Aching</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.painAssessment.location || ''}
                                            onChange={(e) => setFormData(p => ({ 
                                                ...p, 
                                                painAssessment: { ...p.painAssessment, location: e.target.value }
                                            }))}
                                            placeholder="Pain location"
                                            className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </Fieldset>
                        
                        <Fieldset legend="New Issues or Complications">
                            <CheckboxGroup 
                                value={new Set(formData.newIssues)} 
                                onChange={handleNewIssuesToggle} 
                                options={newIssueOptions} 
                            />
                            {formData.newIssues.includes('other') && (
                                <textarea
                                    value={formData.otherIssueDescription || ''}
                                    onChange={(e) => setFormData(p => ({ ...p, otherIssueDescription: e.target.value }))}
                                    rows={2}
                                    placeholder="Describe other issues..."
                                    className="mt-2 w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            )}
                        </Fieldset>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            <Fieldset legend="Risk Level">
                                <RadioGroup
                                    value={formData.riskLevel}
                                    onChange={(val) => setFormData(p => ({ ...p, riskLevel: val }))}
                                    options={['low', 'moderate', 'high'] as const}
                                />
                            </Fieldset>
                            
                            <Fieldset legend="Treatment Goals Met">
                                <RadioGroup
                                    value={formData.goalsMet}
                                    onChange={(val) => setFormData(p => ({ ...p, goalsMet: val }))}
                                    options={['all', 'partial', 'none'] as const}
                                />
                            </Fieldset>
                        </div>
                    </div>
                )}
                
                {/* Systems Review Section */}
                {activeSection === 'systems' && (
                    <div className="space-y-4">
                        <div className="grid gap-4">
                            {Object.entries(formData.systemsReview).map(([system, status]) => (
                                <div key={system} className="bg-white p-3 rounded-lg border border-gray-200">
                                    <Fieldset legend={system.charAt(0).toUpperCase() + system.slice(1)}>
                                        <RadioGroup
                                            value={status}
                                            onChange={(val) => updateSystemReview(system as any, val)}
                                            options={['stable', 'concerning', 'deteriorating'] as const}
                                        />
                                    </Fieldset>
                                </div>
                            ))}
                        </div>
                        
                        <Fieldset legend="Medication Changes">
                            <RadioGroup
                                value={formData.medicationChanges}
                                onChange={(val) => setFormData(p => ({ ...p, medicationChanges: val }))}
                                options={['none', 'dose-adjustment', 'new-medication', 'discontinuation', 'switch'] as const}
                            />
                            {formData.medicationChanges !== 'none' && (
                                <textarea
                                    value={formData.medicationDetails || ''}
                                    onChange={(e) => setFormData(p => ({ ...p, medicationDetails: e.target.value }))}
                                    rows={3}
                                    placeholder="Detail medication changes..."
                                    className="mt-2 w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            )}
                        </Fieldset>
                    </div>
                )}
                
                {/* Plan & Orders Section */}
                {activeSection === 'plan' && (
                    <div className="space-y-4">
                        <Fieldset legend="Treatment Plan">
                            <RadioGroup 
                                value={formData.plan} 
                                onChange={(val) => setFormData(p => ({ ...p, plan: val }))} 
                                options={['Continue', 'Change'] as const} 
                            />
                        </Fieldset>
                        
                        {formData.plan === 'Change' && (
                            <Fieldset legend="Specify Changes">
                                <CheckboxGroup 
                                    value={new Set(formData.planDetails)} 
                                    onChange={handlePlanDetailsToggle} 
                                    options={planDetailOptions} 
                                />
                            </Fieldset>
                        )}
                        
                        <Fieldset legend="Next Follow-up">
                            <RadioGroup 
                                value={formData.nextFollowUp} 
                                onChange={(val) => setFormData(p => ({ ...p, nextFollowUp: val }))} 
                                options={['24–48h', '3–7d', '2–4w'] as const} 
                            />
                        </Fieldset>
                        
                        {(formData.riskLevel === 'high' || formData.nextFollowUp === '24–48h') && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="text-red-600" size={16} />
                                    <span className="font-medium text-red-800">High Priority Follow-up</span>
                                </div>
                                <p className="text-sm text-red-700">
                                    This patient requires close monitoring. Ensure proper communication with nursing staff.
                                </p>
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
                                    General Medical Note
                                </label>
                                <textarea
                                    value={formData.mdNote || ''}
                                    onChange={(e) => setFormData(p => ({ ...p, mdNote: e.target.value }))}
                                    rows={3}
                                    placeholder="General clinical observations and notes..."
                                    className="w-full p-3 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Clinical Impression
                                </label>
                                <textarea
                                    value={formData.clinicalImpression || ''}
                                    onChange={(e) => setFormData(p => ({ ...p, clinicalImpression: e.target.value }))}
                                    rows={2}
                                    placeholder="Primary clinical impression and assessment..."
                                    className="w-full p-3 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Treatment Rationale
                                </label>
                                <textarea
                                    value={formData.treatmentRationale || ''}
                                    onChange={(e) => setFormData(p => ({ ...p, treatmentRationale: e.target.value }))}
                                    rows={2}
                                    placeholder="Rationale for current treatment approach..."
                                    className="w-full p-3 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Patient Education
                                    </label>
                                    <textarea
                                        value={formData.patientEducation || ''}
                                        onChange={(e) => setFormData(p => ({ ...p, patientEducation: e.target.value }))}
                                        rows={2}
                                        placeholder="Education provided to patient..."
                                        className="w-full p-3 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Family Education
                                    </label>
                                    <textarea
                                        value={formData.familyEducation || ''}
                                        onChange={(e) => setFormData(p => ({ ...p, familyEducation: e.target.value }))}
                                        rows={2}
                                        placeholder="Education provided to family/caregivers..."
                                        className="w-full p-3 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-blue-200">
                <div className="text-sm text-gray-600">
                    {!isAssessmentComplete() && (
                        <span className="text-amber-600">⚠️ Complete required assessments</span>
                    )}
                </div>
                
                <div className="flex gap-3">
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSave}
                        disabled={!isAssessmentComplete()}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                    >
                        <Save size={16} />
                        Save Assessment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorFollowUpForm;