import React, { useState } from 'react';
import { NurseFollowUpData, VitalSigns } from '../../../types';
import { Save } from 'lucide-react';
import { Fieldset, RadioGroup, CheckboxGroup } from '../FormControls';

interface Props {
    initialData?: NurseFollowUpData;
    onSave: (data: NurseFollowUpData) => void;
    onCancel: () => void;
}

const taskOptions = ['dressing change', 'vaccine', 'meds given', 'education'] as const;
type Task = typeof taskOptions[number];

const NurseFollowUpForm: React.FC<Props> = ({ initialData, onSave, onCancel }) => {
    const [status, setStatus] = useState(initialData?.status || 'Unchanged');
    const [vitals, setVitals] = useState<Partial<VitalSigns>>({ temp: initialData?.vitals?.temp || '', o2sat: initialData?.vitals?.o2sat || '', pain: initialData?.vitals?.pain || '' });
    const [tasks, setTasks] = useState<Set<Task>>(new Set(initialData?.tasks || []));
    const [nurseNote, setNurseNote] = useState(initialData?.nurseNote || '');
    
    const handleTaskToggle = (task: Task) => {
        const newTasks = new Set(tasks);
        if (newTasks.has(task)) newTasks.delete(task);
        else newTasks.add(task);
        setTasks(newTasks);
    }

    const handleSave = () => {
        onSave({ status, vitals, tasks: Array.from(tasks), nurseNote });
    };

    return (
        <div className="bg-green-50/50 p-3 rounded-md border border-green-200 space-y-3 text-sm">
            <h4 className="font-bold text-green-800">Nurse's Follow-up Note</h4>
            <div className="space-y-3">
                <Fieldset legend="Quick Vitals">
                   <div className="flex gap-2">
                     <input value={vitals.temp} onChange={e => setVitals({...vitals, temp: e.target.value})} placeholder="Temp" className="p-1 w-20 border rounded"/>
                     <input value={vitals.o2sat} onChange={e => setVitals({...vitals, o2sat: e.target.value})} placeholder="SpO₂ %" className="p-1 w-20 border rounded"/>
                     <input value={vitals.pain} onChange={e => setVitals({...vitals, pain: e.target.value})} placeholder="Pain /10" className="p-1 w-20 border rounded"/>
                   </div>
                </Fieldset>
                <Fieldset legend="Tasks Today">
                    <CheckboxGroup value={tasks} onChange={handleTaskToggle} options={taskOptions} />
                </Fieldset>
                 <Fieldset legend="Status">
                    {/* FIX: Add 'as const' to ensure correct type inference for the generic RadioGroup component. */}
                    <RadioGroup value={status} onChange={setStatus} options={['Improved', 'Unchanged', 'Worsened'] as const} />
                </Fieldset>
                <textarea value={nurseNote} onChange={e => setNurseNote(e.target.value)} rows={2} placeholder="Optional note..." className="w-full p-2 border rounded-md" />
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="text-xs px-3 py-1 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button type="button" onClick={handleSave} className="text-xs px-3 py-1 rounded-md text-white bg-green-600 hover:bg-green-700 flex items-center gap-1"><Save size={14} />Save Note</button>
            </div>
        </div>
    );
};

export default NurseFollowUpForm;