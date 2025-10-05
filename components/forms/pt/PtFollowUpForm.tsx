import React, { useState } from 'react';
import { PtFollowUpData } from '../../../types';
import { Save } from 'lucide-react';
import { Fieldset, RadioGroup, CheckboxGroup } from '../FormControls';

interface Props {
    initialData?: PtFollowUpData;
    onSave: (data: PtFollowUpData) => void;
    onCancel: () => void;
}

// New types for PT follow-up form
type PatientStatus = 'Improved' | 'Stable' | 'Declining' | 'New Complaint' | 'Other…';
type SessionIntervention = 'ROM' | 'Strengthening' | 'Balance' | 'Gait' | 'Transfers' | 'Breathing';
type SessionModality = 'Heat' | 'Cold' | 'TENS' | 'NMES' | 'Ultrasound';
type SessionEquipment = 'Walker' | 'Cane' | 'Parallel Bars' | 'Theraband' | 'Weights';
type Tolerance = 'Well tolerated' | 'Fatigue' | 'Pain increased' | 'Limited by condition';
type Education = 'Home Exercise' | 'Safety' | 'Caregiver Education';
type Plan = 'Continue same' | 'Progress program' | 'Add modalities' | 'Refer MD';

interface NewPTFollowUpData {
    patientStatus: PatientStatus;
    otherStatus?: string;
    
    // Session content
    interventions: Set<SessionIntervention>;
    modalities: Set<SessionModality>;
    equipment: Set<SessionEquipment>;
    
    // Tolerance
    tolerance: Tolerance;
    
    // Education
    education: Set<Education>;
    
    // Plan
    plan: Plan;
    
    // Optional note
    note?: string;
}

const PtFollowUpForm: React.FC<Props> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState<NewPTFollowUpData>({
        patientStatus: 'Stable',
        interventions: new Set(),
        modalities: new Set(),
        equipment: new Set(),
        tolerance: 'Well tolerated',
        education: new Set(),
        plan: 'Continue same'
    });
    
    const toggleIntervention = (intervention: SessionIntervention) => {
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
    
    const toggleModality = (modality: SessionModality) => {
        setFormData(prev => {
            const newModalities = new Set(prev.modalities);
            if (newModalities.has(modality)) {
                newModalities.delete(modality);
            } else {
                newModalities.add(modality);
            }
            return { ...prev, modalities: newModalities };
        });
    };
    
    const toggleEquipment = (equipment: SessionEquipment) => {
        setFormData(prev => {
            const newEquipment = new Set(prev.equipment);
            if (newEquipment.has(equipment)) {
                newEquipment.delete(equipment);
            } else {
                newEquipment.add(equipment);
            }
            return { ...prev, equipment: newEquipment };
        });
    };
    
    const toggleEducation = (education: Education) => {
        setFormData(prev => {
            const newEducation = new Set(prev.education);
            if (newEducation.has(education)) {
                newEducation.delete(education);
            } else {
                newEducation.add(education);
            }
            return { ...prev, education: newEducation };
        });
    };

    const handleSave = () => {
        // Convert new form data to legacy format for compatibility
        const legacyData: PtFollowUpData = {
            changeSinceLast: {
                pain: '↔', // Default
                function: formData.patientStatus === 'Improved' ? '↑' : 
                         formData.patientStatus === 'Declining' ? '↓' : '↔'
            },
            tolerance: formData.tolerance === 'Well tolerated' ? 'good' : 
                      formData.tolerance === 'Fatigue' ? 'fair' : 'poor',
            hep: { status: 'given', adherence: 'good' },
            plan: formData.plan === 'Continue same' ? 'Continue' : 'Change',
            ptNote: formData.note
        };
        onSave(legacyData);
    };

    return (
        <div className="bg-purple-50/50 p-3 rounded-md border border-purple-200 space-y-3 text-sm">
            <h4 className="font-bold text-purple-800">PT Follow-up Note</h4>
            <div className="space-y-3">
                {/* Patient status (chips) */}
                <Fieldset legend="Patient status (chips)">
                    <RadioGroup 
                        value={formData.patientStatus}
                        onChange={(val) => setFormData(p => ({...p, patientStatus: val}))}
                        options={['Improved', 'Stable', 'Declining', 'New Complaint', 'Other…'] as const}
                    />
                    {formData.patientStatus === 'Other…' && (
                        <input 
                            value={formData.otherStatus || ''}
                            onChange={(e) => setFormData(p => ({...p, otherStatus: e.target.value}))}
                            placeholder="Specify other status"
                            className="mt-2 w-full p-2 text-xs border rounded"
                        />
                    )}
                </Fieldset>
                
                {/* Session content (multi-chips) */}
                <div className="space-y-3">
                    <h5 className="font-semibold text-purple-700">Session content (multi-chips)</h5>
                    
                    <Fieldset legend="Interventions">
                        <CheckboxGroup 
                            value={formData.interventions}
                            onChange={toggleIntervention}
                            options={['ROM', 'Strengthening', 'Balance', 'Gait', 'Transfers', 'Breathing'] as const}
                        />
                    </Fieldset>
                    
                    <Fieldset legend="Modalities">
                        <CheckboxGroup 
                            value={formData.modalities}
                            onChange={toggleModality}
                            options={['Heat', 'Cold', 'TENS', 'NMES', 'Ultrasound'] as const}
                        />
                    </Fieldset>
                    
                    <Fieldset legend="Equipment">
                        <CheckboxGroup 
                            value={formData.equipment}
                            onChange={toggleEquipment}
                            options={['Walker', 'Cane', 'Parallel Bars', 'Theraband', 'Weights'] as const}
                        />
                    </Fieldset>
                </div>
                
                {/* Tolerance (chips) */}
                <Fieldset legend="Tolerance (chips)">
                    <RadioGroup 
                        value={formData.tolerance}
                        onChange={(val) => setFormData(p => ({...p, tolerance: val}))}
                        options={['Well tolerated', 'Fatigue', 'Pain increased', 'Limited by condition'] as const}
                    />
                </Fieldset>
                
                {/* Education (chips) */}
                <Fieldset legend="Education (chips)">
                    <CheckboxGroup 
                        value={formData.education}
                        onChange={toggleEducation}
                        options={['Home Exercise', 'Safety', 'Caregiver Education'] as const}
                    />
                </Fieldset>
                
                {/* Plan (chips) */}
                <Fieldset legend="Plan (chips)">
                    <RadioGroup 
                        value={formData.plan}
                        onChange={(val) => setFormData(p => ({...p, plan: val}))}
                        options={['Continue same', 'Progress program', 'Add modalities', 'Refer MD'] as const}
                    />
                </Fieldset>
                
                <textarea 
                    value={formData.note || ''} 
                    onChange={e => setFormData(p => ({...p, note: e.target.value}))} 
                    rows={2} 
                    placeholder="Optional note" 
                    className="w-full p-2 border rounded-md" 
                />
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="text-xs px-3 py-1 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button type="button" onClick={handleSave} className="text-xs px-3 py-1 rounded-md text-white bg-purple-600 hover:bg-purple-700 flex items-center gap-1"><Save size={14} />Save Note</button>
            </div>
        </div>
    );
};

export default PtFollowUpForm;
