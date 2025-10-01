import React, { useState } from 'react';
import { Patient, Assessment, Role, PtAssessmentData } from '../../../types';
import { useHomeHealthcare } from '../../../context/HomeHealthcareContext';
import { Save, X } from 'lucide-react';
import { Accordion, Fieldset, RadioGroup, CheckboxGroup } from '../FormControls';

interface AssessmentFormProps {
    patient: Patient;
    onSave: (assessment: Assessment) => void;
    onCancel: () => void;
}

const dxFocusOptions = ['TKA/THA/ACL/RCR/Stroke/LBP/Neck'] as const;
const interventionsOptions = ['ROM', 'Stretch', 'Strength', 'Balance', 'Gait', 'TENS', 'NMES', 'US', 'Ice', 'Heat', 'soft tissue', 'joint mobs'] as const;

const PtAssessmentForm: React.FC<AssessmentFormProps> = ({ patient, onSave, onCancel }) => {
    const { state } = useHomeHealthcare();
    const [formData, setFormData] = useState<Partial<PtAssessmentData>>({
        role: Role.PhysicalTherapist,
        status: 'Unchanged',
        plan: 'Continue same plan',
        dxFocus: [],
        phase: 'subacute',
        pain: '0',
        function: {
            bedMobility: 'supervision',
            transfers: 'supervision',
            gaitDistance: '5–20m',
            assistiveDevice: 'walker',
            stairs: 'none',
            balance: { static: 'fair', dynamic: 'fair' }
        },
        romMmt: { region: [], rom: '↓mild', mmt: '3' },
        interventions: []
    });

    const handleMultiSelect = <K extends keyof PtAssessmentData>(field: K, value: PtAssessmentData[K] extends (infer U)[] ? U : never) => {
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
        const currentUser = state.staff.find(s => s.المهنة.includes('علاج طبيعي')) || state.staff[0];
        const newAssessment: PtAssessmentData = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            assessorId: currentUser.رقم_الهوية,
            assessorName: currentUser.الاسم,
            ...formData,
        } as PtAssessmentData;
        onSave(newAssessment);
    };

    return (
        <form onSubmit={handleSave} className="p-4 bg-gray-50 flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-800">Physical Therapy Assessment</h4>
                <div className="flex gap-1">
                    <button type="button" onClick={onCancel} title="Cancel" className="p-1.5 rounded-full hover:bg-red-100 text-red-500"><X size={16} /></button>
                    <button type="submit" title="Save" className="p-1.5 rounded-full hover:bg-green-100 text-green-600"><Save size={16} /></button>
                </div>
            </div>
            <div className="space-y-2 overflow-y-auto flex-grow pr-1 text-sm">
                <Accordion title="Focus & Function" defaultOpen={true}>
                    <Fieldset legend="Dx Focus">
                        <CheckboxGroup value={new Set(formData.dxFocus)} onChange={(val) => handleMultiSelect('dxFocus', val)} options={dxFocusOptions} />
                    </Fieldset>
                    <Fieldset legend="Gait Distance">
                         <RadioGroup value={formData.function?.gaitDistance!} onChange={(val) => setFormData(p => ({...p, function: {...p.function!, gaitDistance: val}}))} options={['0–5m', '5–20m', '20–100m', '>100m']} />
                    </Fieldset>
                </Accordion>
                <Accordion title="Interventions">
                    <Fieldset legend="Interventions Today">
                        <CheckboxGroup value={new Set(formData.interventions)} onChange={(val) => handleMultiSelect('interventions', val)} options={interventionsOptions} />
                    </Fieldset>
                </Accordion>
                 <Accordion title="Status & Plan">
                    <Fieldset legend="Status">
                        <RadioGroup value={formData.status!} onChange={(val) => setFormData(p => ({...p, status: val}))} options={['Improved', 'Unchanged', 'Worsened']} />
                    </Fieldset>
                    <Fieldset legend="Plan">
                         <RadioGroup value={formData.plan!} onChange={(val) => setFormData(p => ({...p, plan: val}))} options={['Continue same plan', 'Change plan']} />
                    </Fieldset>
                </Accordion>
                <textarea value={formData.ptNote || ''} onChange={e => setFormData(p => ({...p, ptNote: e.target.value}))} rows={2} placeholder="Optional PT note..." maxLength={80} className="w-full p-2 text-sm border rounded-md" />
            </div>
        </form>
    );
};

export default PtAssessmentForm;
