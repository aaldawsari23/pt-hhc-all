import React, { useState } from 'react';
import { DoctorFollowUpData } from '../../../types';
import { Save } from 'lucide-react';
import { Fieldset, RadioGroup, CheckboxGroup } from '../FormControls';

interface Props {
    initialData?: DoctorFollowUpData;
    onSave: (data: DoctorFollowUpData) => void;
    onCancel: () => void;
}

const planDetailOptions = ['Add referral', 'Adjust meds', 'Start antibiotics', 'Wound care upgrade', 'Frequency change'] as const;
const newIssueOptions = ['fever', 'pain ↑', 'wound deterioration', 'device issue', 'other'] as const;


const DoctorFollowUpForm: React.FC<Props> = ({ initialData, onSave, onCancel }) => {
    const [status, setStatus] = useState(initialData?.status || 'Unchanged');
    const [responseToPlan, setResponseToPlan] = useState(initialData?.responseToPlan || 'good');
    const [adherence, setAdherence] = useState(initialData?.adherence || 'good');
    const [newIssues, setNewIssues] = useState(new Set(initialData?.newIssues || []));
    const [plan, setPlan] = useState(initialData?.plan || 'Continue');
    const [planDetails, setPlanDetails] = useState(new Set(initialData?.planDetails || []));
    const [nextFollowUp, setNextFollowUp] = useState(initialData?.nextFollowUp || '3–7d');
    const [mdNote, setMdNote] = useState(initialData?.mdNote || '');
    
    const handleToggle = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, value: string) => {
        setter(prev => {
            const newSet = new Set(prev);
            if(newSet.has(value)) newSet.delete(value);
            else newSet.add(value);
            return newSet;
        })
    }

    const handleSave = () => {
        onSave({ 
            status, 
            responseToPlan, 
            adherence, 
            newIssues: Array.from(newIssues), 
            plan, 
            planDetails: Array.from(planDetails), 
            nextFollowUp, 
            mdNote 
        });
    };

    return (
        <div className="bg-blue-50/50 p-3 rounded-md border border-blue-200 space-y-3 text-sm">
            <h4 className="font-bold text-blue-800">Doctor's Follow-up Note</h4>
            <div className="space-y-3">
                <Fieldset legend="Status">
                    <RadioGroup value={status} onChange={setStatus} options={['Improved', 'Unchanged', 'Worsened']} />
                </Fieldset>
                <Fieldset legend="Response to Last Plan">
                     <RadioGroup value={responseToPlan} onChange={setResponseToPlan} options={['good', 'partial', 'poor']} />
                </Fieldset>
                 <Fieldset legend="Any new issues?">
                    <CheckboxGroup value={newIssues as Set<any>} onChange={(val) => handleToggle(setNewIssues as any, val)} options={newIssueOptions} />
                </Fieldset>
                <Fieldset legend="Plan">
                     <RadioGroup value={plan} onChange={setPlan} options={['Continue', 'Change']} />
                </Fieldset>
                {plan === 'Change' && (
                    <Fieldset legend="Specify Change">
                        <CheckboxGroup value={planDetails as Set<any>} onChange={(val) => handleToggle(setPlanDetails as any, val)} options={planDetailOptions} />
                    </Fieldset>
                )}
                <Fieldset legend="Next Follow-up">
                     <RadioGroup value={nextFollowUp} onChange={setNextFollowUp} options={['24–48h', '3–7d', '2–4w']} />
                </Fieldset>
                <textarea value={mdNote} onChange={e => setMdNote(e.target.value)} rows={2} placeholder="Optional note..." className="w-full p-2 border rounded-md" />
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="text-xs px-3 py-1 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button type="button" onClick={handleSave} className="text-xs px-3 py-1 rounded-md text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1"><Save size={14} />Save Note</button>
            </div>
        </div>
    );
};

export default DoctorFollowUpForm;
