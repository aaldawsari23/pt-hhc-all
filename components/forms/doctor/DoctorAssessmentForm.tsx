import React, { useState } from 'react';
import { Patient, Assessment, Role, DoctorAssessmentData } from '../../../types';
import { useHomeHealthcare } from '../../../context/HomeHealthcareContext';
import { Save, X } from 'lucide-react';
import { Accordion, Fieldset, RadioGroup, CheckboxGroup } from '../FormControls';

interface AssessmentFormProps {
    patient: Patient;
    onSave: (assessment: Assessment) => void;
    onCancel: () => void;
}

const chiefFocusOptions = ['Wound care', 'Infection suspicion', 'Pain mgmt', 'DM', 'HTN', 'CHF/COPD', 'CKD', 'Post-op', 'Catheter', 'Tube feeding'] as const;
const redFlagOptions = ['Fever ≥38', 'SpO₂ <90', 'Chest pain', 'Active bleeding', 'New neuro deficit', 'Sepsis concern'] as const;

const DoctorAssessmentForm: React.FC<AssessmentFormProps> = ({ patient, onSave, onCancel }) => {
    const { state } = useHomeHealthcare();
    const [formData, setFormData] = useState<Partial<DoctorAssessmentData>>({
        role: Role.Doctor,
        status: 'Unchanged',
        plan: 'Continue same plan',
        chiefFocus: [],
        redFlags: [],
        assessment: { etiology: [], severity: 'Mild' },
        followUpTiming: '2–4w',
    });

    const handleMultiSelect = <K extends keyof DoctorAssessmentData>(field: K, value: DoctorAssessmentData[K] extends (infer U)[] ? U : never) => {
        setFormData(prev => {
            const currentValues = (prev[field] as any[] || []) as any[];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [field]: newValues };
        });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const currentUser = state.staff.find(s => s.المهنة === 'طبيب') || state.staff[0];
        const newAssessment: DoctorAssessmentData = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            assessorId: currentUser.رقم_الهوية,
            assessorName: currentUser.الاسم,
            ...formData,
        } as DoctorAssessmentData;
        onSave(newAssessment);
    };

    return (
         <form onSubmit={handleSave} className="p-4 bg-gray-50 flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-800">Doctor Assessment</h4>
                <div className="flex gap-1">
                    <button type="button" onClick={onCancel} title="Cancel" className="p-1.5 rounded-full hover:bg-red-100 text-red-500"><X size={16} /></button>
                    <button type="submit" title="Save" className="p-1.5 rounded-full hover:bg-green-100 text-green-600"><Save size={16} /></button>
                </div>
            </div>
            <div className="space-y-2 overflow-y-auto flex-grow pr-1 text-sm">
                <Accordion title="Chief Focus & Red Flags" defaultOpen={true}>
                    <Fieldset legend="Chief Focus">
                         <CheckboxGroup 
                            value={new Set(formData.chiefFocus)}
                            onChange={(val) => handleMultiSelect('chiefFocus', val)}
                            options={chiefFocusOptions}
                         />
                    </Fieldset>
                    <Fieldset legend="Red Flags">
                         <CheckboxGroup 
                            value={new Set(formData.redFlags)}
                            onChange={(val) => handleMultiSelect('redFlags', val)}
                            options={redFlagOptions}
                         />
                    </Fieldset>
                </Accordion>
                <Accordion title="Status & Plan">
                    <Fieldset legend="Status">
                        <RadioGroup 
                            value={formData.status!}
                            onChange={(val) => setFormData(p => ({...p, status: val}))}
                            options={['Improved', 'Unchanged', 'Worsened']}
                        />
                    </Fieldset>
                    <Fieldset legend="Plan">
                         <RadioGroup 
                            value={formData.plan!}
                            onChange={(val) => setFormData(p => ({...p, plan: val}))}
                            options={['Continue same plan', 'Change plan']}
                        />
                    </Fieldset>
                </Accordion>
                <textarea value={formData.mdNote || ''} onChange={e => setFormData(p => ({...p, mdNote: e.target.value}))} rows={2} placeholder="Optional MD note (max 80 chars)" maxLength={80} className="w-full p-2 text-sm border rounded-md" />
            </div>
        </form>
    );
};

export default DoctorAssessmentForm;
