import React, { useState } from 'react';
import { Patient, Assessment, VitalSigns, Role, NurseAssessmentData } from '../../../types';
import { useHomeHealthcare } from '../../../context/HomeHealthcareContext';
import { Save, X } from 'lucide-react';
import { Accordion, Fieldset, RadioGroup, CheckboxGroup } from '../FormControls';
import { useToast } from '../../../context/ToastContext';


interface AssessmentFormProps {
    patient: Patient;
    onSave: (assessment: Assessment) => void;
    onCancel: () => void;
}

const NurseAssessmentForm: React.FC<AssessmentFormProps> = ({ patient, onSave, onCancel }) => {
    const { state } = useHomeHealthcare();
    const { showToast } = useToast();
    const [formData, setFormData] = useState<Partial<NurseAssessmentData>>({
        role: Role.Nurse,
        vitals: { bp: '', hr: '', temp: '', rr: '', o2sat: '', pain: '0' },
        status: 'Unchanged',
        impression: 'Stable',
        plan: 'Continue same plan',
    });

    const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, vitals: {...prev.vitals!, [name]: value}}));
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const currentUser = state.staff.find(s => s.المهنة === 'ممرض') || state.staff[0];
        const newAssessment: NurseAssessmentData = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            assessorId: currentUser.رقم_الهوية,
            assessorName: currentUser.الاسم,
            ...formData
        } as NurseAssessmentData;
        onSave(newAssessment);
        showToast("Assessment Saved!");
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
                <Accordion title="Vitals" defaultOpen={true}>
                    <div className="grid grid-cols-3 gap-2">
                        <input name="bp" value={formData.vitals?.bp} onChange={handleVitalChange} placeholder="BP" className="p-1 border rounded"/>
                        <input name="hr" value={formData.vitals?.hr} onChange={handleVitalChange} placeholder="HR" className="p-1 border rounded"/>
                        <input name="temp" value={formData.vitals?.temp} onChange={handleVitalChange} placeholder="Temp" className="p-1 border rounded"/>
                        <input name="rr" value={formData.vitals?.rr} onChange={handleVitalChange} placeholder="RR" className="p-1 border rounded"/>
                        <input name="o2sat" value={formData.vitals?.o2sat} onChange={handleVitalChange} placeholder="SpO₂" className="p-1 border rounded"/>
                        <input name="pain" value={formData.vitals?.pain} onChange={handleVitalChange} placeholder="Pain/10" className="p-1 border rounded"/>
                    </div>
                </Accordion>
                <Accordion title="Wounds / Pressure Ulcers">
                   <p className="text-xs text-gray-500">Wound care checklists here...</p>
                </Accordion>
                <Accordion title="Impression & Status">
                    <Fieldset legend="Status">
                        <RadioGroup 
                            value={formData.status!}
                            onChange={(val) => setFormData(p => ({...p, status: val}))}
                            options={['Improved', 'Unchanged', 'Worsened']}
                        />
                    </Fieldset>
                     <Fieldset legend="Impression">
                         <RadioGroup 
                            value={formData.impression!}
                            onChange={(val) => setFormData(p => ({...p, impression: val}))}
                            options={['Stable', 'Improving', 'Deteriorating', 'Needs MD call today']}
                        />
                    </Fieldset>
                </Accordion>
                <textarea value={formData.nurseNote || ''} onChange={e => setFormData(p => ({...p, nurseNote: e.target.value}))} rows={2} placeholder="Optional nurse note (max 80 chars)" maxLength={80} className="w-full p-2 text-sm border rounded-md" />
            </div>
        </form>
    );
};

export default NurseAssessmentForm;