import React, { useState } from 'react';
import { Patient, Assessment, Role, DoctorAssessmentData } from '../types';
import { useHomeHealthcare } from '../../context/HomeHealthcareContext';
import { Save, X } from 'lucide-react';

interface AssessmentFormProps {
    patient: Patient;
    onSave: (assessment: Assessment) => void;
    onCancel: () => void;
}

const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border rounded-md bg-white">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full text-left p-2 font-semibold text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-md">
                {title}
            </button>
            {isOpen && <div className="p-3 border-t">{children}</div>}
        </div>
    );
};

const DoctorAssessmentForm: React.FC<AssessmentFormProps> = ({ patient, onSave, onCancel }) => {
    const { state } = useHomeHealthcare();
    const [status, setStatus] = useState<'Improved' | 'Unchanged' | 'Worsened'>('Unchanged');
    const [plan, setPlan] = useState<'Continue same plan' | 'Change plan'>('Continue same plan');
    const [mdNote, setMdNote] = useState('');
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const currentUser = state.staff.find(s => s.المهنة === 'طبيب') || state.staff[0];
        const newAssessment: DoctorAssessmentData = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            assessorId: currentUser.رقم_الهوية,
            assessorName: currentUser.الاسم,
            role: Role.Doctor,
            status,
            plan,
            mdNote,
            chiefFocus: [],
            // FIX: Added the required 'assessment' and 'followUpTiming' properties with default values.
            assessment: {
                etiology: [],
                severity: 'Mild',
            },
            followUpTiming: '2–4w', 
        };
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
            <div className="space-y-2 overflow-y-auto flex-grow pr-1">
                <Accordion title="Chief Focus & Red Flags" defaultOpen={true}>
                    <p className="text-xs text-gray-500">Checkboxes and conditional logic here...</p>
                </Accordion>
                <Accordion title="Status">
                     <div className="flex gap-2 mt-1">
                        {(['Improved', 'Unchanged', 'Worsened'] as const).map(s => <button type="button" key={s} onClick={() => setStatus(s)} className={`px-2 py-1 text-xs rounded-full border ${status === s ? 'bg-blue-500 text-white' : 'bg-white'}`}>{s}</button>)}
                    </div>
                </Accordion>
                <Accordion title="Plan">
                     <div className="flex gap-2 mt-1">
                        {(['Continue same plan', 'Change plan'] as const).map(s => <button type="button" key={s} onClick={() => setPlan(s)} className={`px-2 py-1 text-xs rounded-full border ${plan === s ? 'bg-blue-500 text-white' : 'bg-white'}`}>{s}</button>)}
                    </div>
                </Accordion>
                <textarea value={mdNote} onChange={e => setMdNote(e.target.value)} rows={2} placeholder="Optional MD note (max 80 chars)" maxLength={80} className="w-full p-2 text-sm border rounded-md" />
            </div>
        </form>
    );
};

export default DoctorAssessmentForm;