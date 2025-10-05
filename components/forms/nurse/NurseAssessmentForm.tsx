import React, { useState } from 'react';
import { Patient, Assessment, VitalSigns, Role, NurseAssessmentData } from '../../../types';
import { useHomeHealthcare } from '../../../context/HomeHealthcareContext';
import { Save, X } from 'lucide-react';
import { Accordion, Fieldset, RadioGroup, CheckboxGroup } from '../FormControls';

// New types for the mobile-first form
type PainLevel = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';
type FallsRisk = 'Low (0–24)' | 'Moderate (25–45)' | 'High (≥46)';
type PressureRisk = 'Severe (≤9)' | 'High (10–12)' | 'Moderate (13–14)' | 'Mild (15–18)' | 'No risk (19–23)';
type AdlLevel = 'Independent' | 'Supervision' | 'Needs Assist' | 'Bedbound' | 'Walker/Cane' | 'Wheelchair' | 'Setup' | 'Needs Feeding' | 'Incontinent';
type SkinStatus = 'Intact' | 'At Risk' | 'Bruising' | 'Wound';
type WoundLocation = 'Heel' | 'Sacrum' | 'Hip' | 'Foot' | 'Leg' | 'Arm' | 'Back' | 'Other';
type WoundType = 'Pressure' | 'Surgical' | 'Diabetic' | 'Venous';
type PressureStage = 'I' | 'II' | 'III' | 'IV' | 'Unstageable' | 'DTI';
type Intervention = 'Wound Care' | 'Blood Draw' | 'Catheter' | 'Insulin' | 'Injection' | 'IV Line' | 'Vaccination';
type VaccineType = 'Influenza' | 'Pneumococcal' | 'COVID-19' | 'Tetanus' | 'None';
type VaccineDose = 'First' | 'Second' | 'Booster';
type VaccineSite = 'L-Arm' | 'R-Arm' | 'L-Thigh' | 'R-Thigh';
type CaregiverStatus = 'Engaged' | 'Stressed' | 'Needs Support';
type EducationTopic = 'Medications' | 'Wound Care' | 'Fall Prevention';
type Understanding = 'Understands' | 'Needs Reinforcement';

interface NewNurseAssessmentData {
  // Vitals (numeric inputs)
  vitals: {
    bp_systolic: string;
    bp_diastolic: string;
    hr: string;
    rr: string;
    temp: string;
    spo2: string;
    bgl: string;
    pain: PainLevel;
  };
  
  // Risk profile (chips)
  falls_risk: FallsRisk;
  pressure_risk: PressureRisk;
  
  // Functional status (single-select per row)
  mobility: 'Independent' | 'Walker/Cane' | 'Wheelchair' | 'Bedbound';
  transfers: 'Independent' | 'Supervision' | 'Needs Assist';
  feeding: 'Independent' | 'Setup' | 'Needs Feeding';
  toileting: 'Independent' | 'Assist' | 'Incontinent';
  
  // Skin integrity
  skin_status: SkinStatus;
  wound_details?: {
    locations: Set<WoundLocation>;
    other_location?: string;
    type: WoundType;
    pressure_stage: PressureStage;
    length: string;
    width: string;
    depth: string;
  };
  
  // Key interventions
  interventions: Set<Intervention>;
  vaccination_details?: {
    type: VaccineType;
    dose: VaccineDose;
    site: VaccineSite;
    batch: string;
  };
  
  // Caregiver & education
  caregiver_status: CaregiverStatus;
  education_topics: Set<EducationTopic>;
  understanding: Understanding;
  
  // Optional note
  note?: string;
}


interface AssessmentFormProps {
    patient: Patient;
    onSave: (assessment: Assessment) => void;
    onCancel: () => void;
}

const NurseAssessmentForm: React.FC<AssessmentFormProps> = ({ patient, onSave, onCancel }) => {
    const { state } = useHomeHealthcare();
    const [formData, setFormData] = useState<NewNurseAssessmentData>({
        vitals: {
            bp_systolic: '',
            bp_diastolic: '',
            hr: '',
            rr: '',
            temp: '',
            spo2: '',
            bgl: '',
            pain: '0'
        },
        falls_risk: 'Low (0–24)',
        pressure_risk: 'No risk (19–23)',
        mobility: 'Independent',
        transfers: 'Independent',
        feeding: 'Independent',
        toileting: 'Independent',
        skin_status: 'Intact',
        interventions: new Set(),
        caregiver_status: 'Engaged',
        education_topics: new Set(),
        understanding: 'Understands'
    });

    const handleVitalChange = (field: keyof NewNurseAssessmentData['vitals'], value: string) => {
        setFormData(prev => ({
            ...prev,
            vitals: { ...prev.vitals, [field]: value }
        }));
    };
    
    const toggleIntervention = (intervention: Intervention) => {
        setFormData(prev => {
            const newInterventions = new Set(prev.interventions);
            if (newInterventions.has(intervention)) {
                newInterventions.delete(intervention);
            } else {
                newInterventions.add(intervention);
            }
            return { ...prev, interventions: newInterventions };
        });
    };
    
    const toggleEducation = (topic: EducationTopic) => {
        setFormData(prev => {
            const newTopics = new Set(prev.education_topics);
            if (newTopics.has(topic)) {
                newTopics.delete(topic);
            } else {
                newTopics.add(topic);
            }
            return { ...prev, education_topics: newTopics };
        });
    };
    
    const toggleWoundLocation = (location: WoundLocation) => {
        setFormData(prev => {
            if (!prev.wound_details) return prev;
            const newLocations = new Set(prev.wound_details.locations);
            if (newLocations.has(location)) {
                newLocations.delete(location);
            } else {
                newLocations.add(location);
            }
            return {
                ...prev,
                wound_details: {
                    ...prev.wound_details,
                    locations: newLocations
                }
            };
        });
    };
    
    const showWoundDetails = formData.skin_status === 'Wound';

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const currentUser = state.staff.find(s => s.المهنة === 'ممرض') || state.staff[0];
        
        // Convert new form data to legacy format for compatibility
        const legacyAssessment: NurseAssessmentData = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            assessorId: currentUser.رقم_الهوية,
            assessorName: currentUser.الاسم,
            role: Role.Nurse,
            vitals: {
                bp: `${formData.vitals.bp_systolic}/${formData.vitals.bp_diastolic}`,
                hr: formData.vitals.hr,
                temp: formData.vitals.temp,
                rr: formData.vitals.rr,
                o2sat: formData.vitals.spo2,
                pain: formData.vitals.pain
            },
            status: 'Unchanged', // Default for now
            plan: 'Continue same plan', // Default for now
            impression: 'Stable', // Default for now
            nursingTasks: Array.from(formData.interventions) as any[],
            nurseNote: formData.note
        };
        
        onSave(legacyAssessment);
    };

    return (
        <form onSubmit={handleSave} className="p-4 bg-gray-50 flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-800">Nurse Assessment</h4>
                <div className="flex gap-1">
                    <button type="button" onClick={onCancel} title="Cancel" className="p-1.5 rounded-full hover:bg-red-100 text-red-500"><X size={16} /></button>
                    <button type="submit" title="Save" className="p-1.5 rounded-full hover:bg-green-100 text-green-600"><Save size={16} /></button>
                </div>
            </div>
            <div className="space-y-2 overflow-y-auto flex-grow pr-1 text-sm">
                {/* Vitals Section */}
                <Accordion title="Vitals (row inputs; compact for mobile)" defaultOpen={true}>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex gap-1">
                                <input 
                                    value={formData.vitals.bp_systolic} 
                                    onChange={(e) => handleVitalChange('bp_systolic', e.target.value)} 
                                    placeholder="___" 
                                    className="w-12 p-1 text-center border rounded text-xs"
                                />
                                <span className="self-center text-xs">/</span>
                                <input 
                                    value={formData.vitals.bp_diastolic} 
                                    onChange={(e) => handleVitalChange('bp_diastolic', e.target.value)} 
                                    placeholder="___" 
                                    className="w-12 p-1 text-center border rounded text-xs"
                                />
                                <span className="self-center text-xs text-gray-600 ml-1">mmHg</span>
                            </div>
                            <div className="flex gap-1">
                                <input 
                                    value={formData.vitals.hr} 
                                    onChange={(e) => handleVitalChange('hr', e.target.value)} 
                                    placeholder="___" 
                                    className="w-16 p-1 text-center border rounded text-xs"
                                />
                                <span className="self-center text-xs text-gray-600">bpm</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex gap-1">
                                <input 
                                    value={formData.vitals.rr} 
                                    onChange={(e) => handleVitalChange('rr', e.target.value)} 
                                    placeholder="___" 
                                    className="w-16 p-1 text-center border rounded text-xs"
                                />
                                <span className="self-center text-xs text-gray-600">/min</span>
                            </div>
                            <div className="flex gap-1">
                                <input 
                                    value={formData.vitals.temp} 
                                    onChange={(e) => handleVitalChange('temp', e.target.value)} 
                                    placeholder="___" 
                                    className="w-16 p-1 text-center border rounded text-xs"
                                />
                                <span className="self-center text-xs text-gray-600">°C</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex gap-1">
                                <input 
                                    value={formData.vitals.spo2} 
                                    onChange={(e) => handleVitalChange('spo2', e.target.value)} 
                                    placeholder="___" 
                                    className="w-16 p-1 text-center border rounded text-xs"
                                />
                                <span className="self-center text-xs text-gray-600">%</span>
                            </div>
                            <div className="flex gap-1">
                                <input 
                                    value={formData.vitals.bgl} 
                                    onChange={(e) => handleVitalChange('bgl', e.target.value)} 
                                    placeholder="___" 
                                    className="w-16 p-1 text-center border rounded text-xs"
                                />
                                <span className="self-center text-xs text-gray-600">mg/dL</span>
                            </div>
                        </div>
                        <Fieldset legend="Pain (0–10)">
                            <RadioGroup 
                                value={formData.vitals.pain}
                                onChange={(val) => handleVitalChange('pain', val)}
                                options={['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const}
                            />
                            <p className="text-xs text-gray-500 mt-1">0 = no pain, 10 = worst imaginable</p>
                        </Fieldset>
                    </div>
                </Accordion>

                {/* Risk Profile Section */}
                <Accordion title="Risk profile (chips only)">
                    <div className="space-y-3">
                        <Fieldset legend="Falls (Morse category)">
                            <RadioGroup 
                                value={formData.falls_risk}
                                onChange={(val) => setFormData(p => ({...p, falls_risk: val}))}
                                options={['Low (0–24)', 'Moderate (25–45)', 'High (≥46)'] as const}
                            />
                        </Fieldset>
                        <Fieldset legend="Pressure injury (Braden category)">
                            <RadioGroup 
                                value={formData.pressure_risk}
                                onChange={(val) => setFormData(p => ({...p, pressure_risk: val}))}
                                options={['Severe (≤9)', 'High (10–12)', 'Moderate (13–14)', 'Mild (15–18)', 'No risk (19–23)'] as const}
                            />
                        </Fieldset>
                    </div>
                </Accordion>

                {/* Functional Status Section */}
                <Accordion title="Functional status (ADLs; single-select per row)">
                    <div className="space-y-3">
                        <Fieldset legend="Mobility">
                            <RadioGroup 
                                value={formData.mobility}
                                onChange={(val) => setFormData(p => ({...p, mobility: val}))}
                                options={['Independent', 'Walker/Cane', 'Wheelchair', 'Bedbound'] as const}
                            />
                        </Fieldset>
                        <Fieldset legend="Transfers">
                            <RadioGroup 
                                value={formData.transfers}
                                onChange={(val) => setFormData(p => ({...p, transfers: val}))}
                                options={['Independent', 'Supervision', 'Needs Assist'] as const}
                            />
                        </Fieldset>
                        <Fieldset legend="Feeding">
                            <RadioGroup 
                                value={formData.feeding}
                                onChange={(val) => setFormData(p => ({...p, feeding: val}))}
                                options={['Independent', 'Setup', 'Needs Feeding'] as const}
                            />
                        </Fieldset>
                        <Fieldset legend="Toileting">
                            <RadioGroup 
                                value={formData.toileting}
                                onChange={(val) => setFormData(p => ({...p, toileting: val}))}
                                options={['Independent', 'Assist', 'Incontinent'] as const}
                            />
                        </Fieldset>
                    </div>
                </Accordion>

                {/* Skin Integrity Section */}
                <Accordion title="Skin integrity (progressive reveal)">
                    <div className="space-y-3">
                        <Fieldset legend="Skin Status">
                            <RadioGroup 
                                value={formData.skin_status}
                                onChange={(val) => {
                                    setFormData(p => ({
                                        ...p, 
                                        skin_status: val,
                                        wound_details: val === 'Wound' ? {
                                            locations: new Set(),
                                            type: 'Pressure',
                                            pressure_stage: 'I',
                                            length: '',
                                            width: '',
                                            depth: ''
                                        } : undefined
                                    }));
                                }}
                                options={['Intact', 'At Risk', 'Bruising', 'Wound'] as const}
                            />
                        </Fieldset>
                        
                        {showWoundDetails && (
                            <div className="space-y-3 p-3 bg-red-50 rounded border border-red-200">
                                <Fieldset legend="Location">
                                    <CheckboxGroup 
                                        value={formData.wound_details?.locations || new Set()}
                                        onChange={toggleWoundLocation}
                                        options={['Heel', 'Sacrum', 'Hip', 'Foot', 'Leg', 'Arm', 'Back', 'Other'] as const}
                                    />
                                    {formData.wound_details?.locations.has('Other') && (
                                        <input 
                                            value={formData.wound_details?.other_location || ''}
                                            onChange={(e) => setFormData(p => ({
                                                ...p,
                                                wound_details: {
                                                    ...p.wound_details!,
                                                    other_location: e.target.value
                                                }
                                            }))}
                                            placeholder="Specify other location"
                                            className="mt-2 w-full p-2 text-xs border rounded"
                                        />
                                    )}
                                </Fieldset>
                                
                                <Fieldset legend="Type">
                                    <RadioGroup 
                                        value={formData.wound_details?.type || 'Pressure'}
                                        onChange={(val) => setFormData(p => ({
                                            ...p,
                                            wound_details: {
                                                ...p.wound_details!,
                                                type: val
                                            }
                                        }))}
                                        options={['Pressure', 'Surgical', 'Diabetic', 'Venous'] as const}
                                    />
                                </Fieldset>
                                
                                <Fieldset legend="Pressure Stage">
                                    <RadioGroup 
                                        value={formData.wound_details?.pressure_stage || 'I'}
                                        onChange={(val) => setFormData(p => ({
                                            ...p,
                                            wound_details: {
                                                ...p.wound_details!,
                                                pressure_stage: val
                                            }
                                        }))}
                                        options={['I', 'II', 'III', 'IV', 'Unstageable', 'DTI'] as const}
                                    />
                                </Fieldset>
                                
                                <Fieldset legend="Size">
                                    <div className="flex gap-2 text-xs">
                                        <div className="flex items-center gap-1">
                                            <span>L</span>
                                            <input 
                                                value={formData.wound_details?.length || ''}
                                                onChange={(e) => setFormData(p => ({
                                                    ...p,
                                                    wound_details: {
                                                        ...p.wound_details!,
                                                        length: e.target.value
                                                    }
                                                }))}
                                                placeholder="__"
                                                className="w-12 p-1 text-center border rounded"
                                            />
                                            <span>cm</span>
                                        </div>
                                        <span>×</span>
                                        <div className="flex items-center gap-1">
                                            <span>W</span>
                                            <input 
                                                value={formData.wound_details?.width || ''}
                                                onChange={(e) => setFormData(p => ({
                                                    ...p,
                                                    wound_details: {
                                                        ...p.wound_details!,
                                                        width: e.target.value
                                                    }
                                                }))}
                                                placeholder="__"
                                                className="w-12 p-1 text-center border rounded"
                                            />
                                            <span>cm</span>
                                        </div>
                                        <span>×</span>
                                        <div className="flex items-center gap-1">
                                            <span>D</span>
                                            <input 
                                                value={formData.wound_details?.depth || ''}
                                                onChange={(e) => setFormData(p => ({
                                                    ...p,
                                                    wound_details: {
                                                        ...p.wound_details!,
                                                        depth: e.target.value
                                                    }
                                                }))}
                                                placeholder="__"
                                                className="w-12 p-1 text-center border rounded"
                                            />
                                            <span>cm</span>
                                        </div>
                                    </div>
                                </Fieldset>
                            </div>
                        )}
                    </div>
                </Accordion>

                {/* Key Interventions Section */}
                <Accordion title="Key interventions (multi-select chips)">
                    <div className="space-y-3">
                        <CheckboxGroup 
                            value={formData.interventions}
                            onChange={toggleIntervention}
                            options={['Wound Care', 'Blood Draw', 'Catheter', 'Insulin', 'Injection', 'IV Line', 'Vaccination'] as const}
                        />
                        
                        {formData.interventions.has('Vaccination') && (
                            <div className="space-y-3 p-3 bg-blue-50 rounded border border-blue-200">
                                <Fieldset legend="Type">
                                    <RadioGroup 
                                        value={formData.vaccination_details?.type || 'None'}
                                        onChange={(val) => setFormData(p => ({
                                            ...p,
                                            vaccination_details: {
                                                ...p.vaccination_details!,
                                                type: val,
                                                dose: p.vaccination_details?.dose || 'First',
                                                site: p.vaccination_details?.site || 'L-Arm',
                                                batch: p.vaccination_details?.batch || 'Not available'
                                            }
                                        }))}
                                        options={['Influenza', 'Pneumococcal', 'COVID-19', 'Tetanus', 'None'] as const}
                                    />
                                </Fieldset>
                                
                                {formData.vaccination_details?.type !== 'None' && (
                                    <>
                                        <Fieldset legend="Dose">
                                            <RadioGroup 
                                                value={formData.vaccination_details?.dose || 'First'}
                                                onChange={(val) => setFormData(p => ({
                                                    ...p,
                                                    vaccination_details: {
                                                        ...p.vaccination_details!,
                                                        dose: val
                                                    }
                                                }))}
                                                options={['First', 'Second', 'Booster'] as const}
                                            />
                                        </Fieldset>
                                        
                                        <Fieldset legend="Site">
                                            <RadioGroup 
                                                value={formData.vaccination_details?.site || 'L-Arm'}
                                                onChange={(val) => setFormData(p => ({
                                                    ...p,
                                                    vaccination_details: {
                                                        ...p.vaccination_details!,
                                                        site: val
                                                    }
                                                }))}
                                                options={['L-Arm', 'R-Arm', 'L-Thigh', 'R-Thigh'] as const}
                                            />
                                        </Fieldset>
                                        
                                        <Fieldset legend="Batch">
                                            <input 
                                                value={formData.vaccination_details?.batch || 'Not available'}
                                                onChange={(e) => setFormData(p => ({
                                                    ...p,
                                                    vaccination_details: {
                                                        ...p.vaccination_details!,
                                                        batch: e.target.value
                                                    }
                                                }))}
                                                placeholder="Batch number"
                                                className="w-full p-2 text-xs border rounded"
                                            />
                                        </Fieldset>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </Accordion>

                {/* Caregiver & Education Section */}
                <Accordion title="Caregiver & education (chips)">
                    <div className="space-y-3">
                        <Fieldset legend="Caregiver status">
                            <RadioGroup 
                                value={formData.caregiver_status}
                                onChange={(val) => setFormData(p => ({...p, caregiver_status: val}))}
                                options={['Engaged', 'Stressed', 'Needs Support'] as const}
                            />
                        </Fieldset>
                        
                        <Fieldset legend="Education topics">
                            <CheckboxGroup 
                                value={formData.education_topics}
                                onChange={toggleEducation}
                                options={['Medications', 'Wound Care', 'Fall Prevention'] as const}
                            />
                        </Fieldset>
                        
                        <Fieldset legend="Understanding">
                            <RadioGroup 
                                value={formData.understanding}
                                onChange={(val) => setFormData(p => ({...p, understanding: val}))}
                                options={['Understands', 'Needs Reinforcement'] as const}
                            />
                        </Fieldset>
                    </div>
                </Accordion>

                {/* Optional Note */}
                <textarea 
                    value={formData.note || ''} 
                    onChange={e => setFormData(p => ({...p, note: e.target.value}))} 
                    rows={2} 
                    placeholder="Optional note (single free text)" 
                    className="w-full p-2 text-sm border rounded-md" 
                />
            </div>
        </form>
    );
};

export default NurseAssessmentForm;