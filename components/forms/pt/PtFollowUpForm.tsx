import React, { useState } from 'react';
import { PtFollowUpData } from '../../../types';
import { Save } from 'lucide-react';
import { Fieldset, RadioGroup } from '../FormControls';

interface Props {
    initialData?: PtFollowUpData;
    onSave: (data: PtFollowUpData) => void;
    onCancel: () => void;
}

const PtFollowUpForm: React.FC<Props> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState<PtFollowUpData>(initialData || {
        changeSinceLast: { pain: '↔', function: '↔' },
        tolerance: 'good',
        hep: { status: 'given', adherence: 'good' },
        plan: 'Continue',
    });

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <div className="bg-purple-50/50 p-3 rounded-md border border-purple-200 space-y-3 text-sm">
            <h4 className="font-bold text-purple-800">PT Follow-up Note</h4>
            <div className="space-y-3">
                <Fieldset legend="Change in Pain">
                    <RadioGroup value={formData.changeSinceLast.pain} onChange={v => setFormData(p => ({...p, changeSinceLast: {...p.changeSinceLast, pain: v}}))} options={['↓', '↔', '↑']} />
                </Fieldset>
                <Fieldset legend="Change in Function">
                    <RadioGroup value={formData.changeSinceLast.function} onChange={v => setFormData(p => ({...p, changeSinceLast: {...p.changeSinceLast, function: v}}))} options={['↑', '↔', '↓']} />
                </Fieldset>
                <Fieldset legend="Plan">
                     <RadioGroup value={formData.plan} onChange={v => setFormData(p => ({...p, plan: v}))} options={['Continue', 'Change']} />
                </Fieldset>
                <textarea value={formData.ptNote || ''} onChange={e => setFormData(p => ({...p, ptNote: e.target.value}))} rows={2} placeholder="Optional note..." className="w-full p-2 border rounded-md" />
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="text-xs px-3 py-1 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button type="button" onClick={handleSave} className="text-xs px-3 py-1 rounded-md text-white bg-purple-600 hover:bg-purple-700 flex items-center gap-1"><Save size={14} />Save Note</button>
            </div>
        </div>
    );
};

export default PtFollowUpForm;
