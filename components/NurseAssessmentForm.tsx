import React, { useState } from 'react';
import { Patient, Assessment, VitalSigns, Role, NurseAssessmentData } from '../types';
import { useHomeHealthcare } from '../../context/HomeHealthcareContext';
import { Save, X } from 'lucide-react';

interface AssessmentFormProps {
    patient: Patient;
    onSave: (assessment: Assessment) => void;
    onCancel: () => void;
}

// Simple Accordion Component
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

const NurseAssessmentForm: React.FC<AssessmentFormProps> = ({ patient, onSave, onCancel }) => {
    const { state } = useHomeHealthcare();
    const [vitals, setVitals] = useState<VitalSigns>({ bp: '', hr: '', temp: '', rr: '', o2sat: '', pain: '0' });
    const [status, setStatus] = useState<'Improved' | 'Unchanged' | 'Worsened'>('Unchanged');
    // FIX: Corrected 'Needs MD call' to 'Needs MD call today' to match the type definition.
    const [impression, setImpression] = useState<'Stable' | 'Improving' | 'Deteriorating' | 'Needs MD call today'>('Stable');
    const [nurseNote, setNurseNote] = useState('');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const currentUser = state.staff.find(s => s.المهنة === 'ممرض') || state.staff[0];
        const newAssessment: NurseAssessmentData = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            assessorId: currentUser.رقم_الهوية,
            assessorName: currentUser.الاسم,
            role: Role.Nurse,
            vitals,
            status,
            impression,
            nurseNote,
            plan: 'Continue same plan', // Simplified for now
            nursingTasks: [], // Simplified
        };
        onSave(newAssessment);
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
            <div className="space-y-2 overflow-y-auto flex-grow pr-1">
                <Accordion title="Vitals" defaultOpen={true}>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <input value={vitals.bp} onChange={e => setVitals({...vitals, bp: e.target.value})} placeholder="BP" className="p-1 border rounded"/>
                        <input value={vitals.hr} onChange={e => setVitals({...vitals, hr: e.target.value})} placeholder="HR" className="p-1 border rounded"/>
                        <input value={vitals.temp} onChange={e => setVitals({...vitals, temp: e.target.value})} placeholder="Temp" className="p-1 border rounded"/>
                        <input value={vitals.rr} onChange={e => setVitals({...vitals, rr: e.target.value})} placeholder="RR" className="p-1 border rounded"/>
                        <input value={vitals.o2sat} onChange={e => setVitals({...vitals, o2sat: e.target.value})} placeholder="SpO₂" className="p-1 border rounded"/>
                        <input value={vitals.pain} onChange={e => setVitals({...vitals, pain: e.target.value})} placeholder="Pain/10" className="p-1 border rounded"/>
                    </div>
                </Accordion>
                <Accordion title="Devices / Lines">
                   <p className="text-xs text-gray-500">Device-specific checklists here...</p>
                </Accordion>
                 <Accordion title="Wounds / Pressure Ulcers">
                   <p className="text-xs text-gray-500">Wound care checklists here...</p>
                </Accordion>
                <Accordion title="Impression & Status">
                    <div className="text-sm space-y-2">
                         <div>
                            <label className="font-semibold text-xs">Status</label>
                            <div className="flex gap-2 mt-1">
                                {(['Improved', 'Unchanged', 'Worsened'] as const).map(s => <button type="button" key={s} onClick={() => setStatus(s)} className={`px-2 py-1 text-xs rounded-full border ${status === s ? 'bg-blue-500 text-white' : 'bg-white'}`}>{s}</button>)}
                            </div>
                        </div>
                         <div>
                            <label className="font-semibold text-xs">Impression</label>
                             <div className="flex gap-2 mt-1 flex-wrap">
                                {/* FIX: Corrected 'Needs MD call' to 'Needs MD call today' to match the type definition. */}
                                {(['Stable', 'Improving', 'Deteriorating', 'Needs MD call today'] as const).map(s => <button type="button" key={s} onClick={() => setImpression(s)} className={`px-2 py-1 text-xs rounded-full border ${impression === s ? 'bg-blue-500 text-white' : 'bg-white'}`}>{s}</button>)}
                            </div>
                        </div>
                    </div>
                </Accordion>
                <textarea value={nurseNote} onChange={e => setNurseNote(e.target.value)} rows={2} placeholder="Optional nurse note (max 80 chars)" maxLength={80} className="w-full p-2 text-sm border rounded-md" />
            </div>
        </form>
    );
};

export default NurseAssessmentForm;