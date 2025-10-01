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
         <form onSubmit={handleSave} className="p-4 md:p-6 bg-gradient-to-br from-blue-50 to-white flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 md:mb-6 pb-3 border-b-2 border-blue-200">
                <div>
                    <h4 className="font-bold text-lg md:text-xl text-blue-900">Doctor Assessment</h4>
                    <p className="text-sm text-gray-600 mt-1">{patient.nameAr}</p>
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={onCancel} title="Cancel" className="p-2.5 md:p-3 rounded-xl hover:bg-red-500 bg-red-100 text-red-600 hover:text-white transition-all duration-200 shadow-md touch-target-44">
                        <X size={18} />
                    </button>
                    <button type="submit" title="Save Assessment" className="p-2.5 md:p-3 rounded-xl hover:bg-green-600 bg-green-500 text-white hover:shadow-lg transition-all duration-200 shadow-md touch-target-44">
                        <Save size={18} />
                    </button>
                </div>
            </div>
            <div className="space-y-4 md:space-y-5 overflow-y-auto flex-grow pr-1 text-sm md:text-base">
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
                <div className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-sm">
                    <label className="font-bold text-sm md:text-base text-blue-800 mb-2 block flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        MD Note (Optional)
                    </label>
                    <textarea 
                        value={formData.mdNote || ''} 
                        onChange={e => setFormData(p => ({...p, mdNote: e.target.value}))} 
                        rows={3} 
                        placeholder="Brief clinical note (max 80 characters)" 
                        maxLength={80} 
                        className="w-full p-3 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-200 resize-none"
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">
                        {(formData.mdNote || '').length}/80 characters
                    </div>
                </div>
            </div>
        </form>
    );
};

export default DoctorAssessmentForm;
