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

// New types for physiotherapy initial assessment
type PainLevel = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';
type MobilityLevel = 'Independent' | 'Min Assist' | 'Max Assist' | 'Dependent';
type BalanceLevel = 'Normal' | 'Fair' | 'Poor';
type ROMDegree = string; // Will be input field
type MMTScore = '0' | '1' | '2' | '3' | '4' | '5';
type ROMRegion = 'Shoulder' | 'Elbow' | 'Hip' | 'Knee' | 'Ankle';
type PTProblem = 'Weakness' | 'Spasticity' | 'Contracture' | 'Joint Stiffness' | 'Pain' | 'Balance Deficit' | 'Gait Abnormality' | 'Other…';
type ShortTermGoal = 'Improve ROM' | 'Improve Strength' | 'Improve Balance' | 'Pain Reduction';
type LongTermGoal = 'Independent Ambulation' | 'Independent Transfers' | 'Prevent Complications' | 'Improve ADLs';

interface ROMMMTEntry {
    region: ROMRegion;
    rom: string;
    mmt: MMTScore;
}

interface NewPTAssessmentData {
    // Vitals
    vitals: {
        hr: string;
        rr: string;
        spo2: string;
        bp_systolic: string;
        bp_diastolic: string;
        pain: PainLevel;
    };
    
    // Functional mobility
    bedMobility: MobilityLevel;
    transfers: MobilityLevel;
    ambulation: 'Independent' | 'Walker' | 'Cane' | 'Wheelchair' | 'Bedbound';
    balance: BalanceLevel;
    
    // ROM/MMT entries
    romMmtEntries: ROMMMTEntry[];
    
    // Common PT problems
    problems: Set<PTProblem>;
    otherProblem?: string;
    
    // Goals
    shortTermGoals: Set<ShortTermGoal>;
    longTermGoals: Set<LongTermGoal>;
    
    // Optional note
    note?: string;
}

const PtAssessmentForm: React.FC<AssessmentFormProps> = ({ patient, onSave, onCancel }) => {
    const { state } = useHomeHealthcare();
    const [formData, setFormData] = useState<NewPTAssessmentData>({
        vitals: {
            hr: '',
            rr: '',
            spo2: '',
            bp_systolic: '',
            bp_diastolic: '',
            pain: '0'
        },
        bedMobility: 'Independent',
        transfers: 'Independent',
        ambulation: 'Independent',
        balance: 'Normal',
        romMmtEntries: [
            { region: 'Shoulder', rom: '', mmt: '5' },
            { region: 'Elbow', rom: '', mmt: '5' },
            { region: 'Hip', rom: '', mmt: '5' },
            { region: 'Knee', rom: '', mmt: '5' },
            { region: 'Ankle', rom: '', mmt: '5' }
        ],
        problems: new Set(),
        shortTermGoals: new Set(),
        longTermGoals: new Set()
    });

    const handleVitalChange = (field: keyof NewPTAssessmentData['vitals'], value: string) => {
        setFormData(prev => ({
            ...prev,
            vitals: { ...prev.vitals, [field]: value }
        }));
    };
    
    const toggleProblem = (problem: PTProblem) => {
        setFormData(prev => {
            const newProblems = new Set(prev.problems);
            if (newProblems.has(problem)) {
                newProblems.delete(problem);
            } else {
                newProblems.add(problem);
            }
            return { ...prev, problems: newProblems };
        });
    };
    
    const toggleShortTermGoal = (goal: ShortTermGoal) => {
        setFormData(prev => {
            const newGoals = new Set(prev.shortTermGoals);
            if (newGoals.has(goal)) {
                newGoals.delete(goal);
            } else {
                newGoals.add(goal);
            }
            return { ...prev, shortTermGoals: newGoals };
        });
    };
    
    const toggleLongTermGoal = (goal: LongTermGoal) => {
        setFormData(prev => {
            const newGoals = new Set(prev.longTermGoals);
            if (newGoals.has(goal)) {
                newGoals.delete(goal);
            } else {
                newGoals.add(goal);
            }
            return { ...prev, longTermGoals: newGoals };
        });
    };
    
    const updateROMMMT = (index: number, field: 'rom' | 'mmt', value: string) => {
        setFormData(prev => {
            const newEntries = [...prev.romMmtEntries];
            newEntries[index] = { ...newEntries[index], [field]: value };
            return { ...prev, romMmtEntries: newEntries };
        });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const currentUser = state.staff.find(s => s.المهنة.includes('علاج طبيعي')) || state.staff[0];
        
        // Convert new form data to legacy format for compatibility
        const legacyAssessment: PtAssessmentData = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            assessorId: currentUser.رقم_الهوية,
            assessorName: currentUser.الاسم,
            role: Role.PhysicalTherapist,
            status: 'Unchanged', // Default for now
            plan: 'Continue same plan', // Default for now
            dxFocus: [],
            phase: 'subacute',
            pain: formData.vitals.pain,
            function: {
                bedMobility: formData.bedMobility,
                transfers: formData.transfers,
                gaitDistance: '5–20m', // Default
                assistiveDevice: formData.ambulation === 'Walker' ? 'walker' : 
                               formData.ambulation === 'Cane' ? 'cane' : 'none',
                stairs: 'none',
                balance: { static: formData.balance.toLowerCase() as any, dynamic: formData.balance.toLowerCase() as any }
            },
            romMmt: { region: [], rom: 'WNL', mmt: '5' },
            interventions: [],
            ptNote: formData.note
        };
        
        onSave(legacyAssessment);
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
                {/* Vitals Section */}
                <Accordion title="Vitals (row inputs)" defaultOpen={true}>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex gap-1">
                                <input 
                                    value={formData.vitals.hr} 
                                    onChange={(e) => handleVitalChange('hr', e.target.value)} 
                                    placeholder="__" 
                                    className="w-16 p-1 text-center border rounded text-xs"
                                />
                                <span className="self-center text-xs text-gray-600">HR</span>
                            </div>
                            <div className="flex gap-1">
                                <input 
                                    value={formData.vitals.rr} 
                                    onChange={(e) => handleVitalChange('rr', e.target.value)} 
                                    placeholder="__" 
                                    className="w-16 p-1 text-center border rounded text-xs"
                                />
                                <span className="self-center text-xs text-gray-600">RR</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex gap-1">
                                <input 
                                    value={formData.vitals.spo2} 
                                    onChange={(e) => handleVitalChange('spo2', e.target.value)} 
                                    placeholder="__" 
                                    className="w-16 p-1 text-center border rounded text-xs"
                                />
                                <span className="self-center text-xs text-gray-600">SpO₂%</span>
                            </div>
                            <div className="flex gap-1">
                                <input 
                                    value={formData.vitals.bp_systolic} 
                                    onChange={(e) => handleVitalChange('bp_systolic', e.target.value)} 
                                    placeholder="__" 
                                    className="w-12 p-1 text-center border rounded text-xs"
                                />
                                <span className="self-center text-xs">/</span>
                                <input 
                                    value={formData.vitals.bp_diastolic} 
                                    onChange={(e) => handleVitalChange('bp_diastolic', e.target.value)} 
                                    placeholder="__" 
                                    className="w-12 p-1 text-center border rounded text-xs"
                                />
                                <span className="self-center text-xs text-gray-600">BP</span>
                            </div>
                        </div>
                        <Fieldset legend="Pain (0–10)">
                            <RadioGroup 
                                value={formData.vitals.pain}
                                onChange={(val) => handleVitalChange('pain', val)}
                                options={['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const}
                            />
                        </Fieldset>
                    </div>
                </Accordion>
                
                {/* Functional Mobility Section */}
                <Accordion title="Functional mobility (single-select per row)">
                    <div className="space-y-3">
                        <Fieldset legend="Bed mobility">
                            <RadioGroup 
                                value={formData.bedMobility}
                                onChange={(val) => setFormData(p => ({...p, bedMobility: val}))}
                                options={['Independent', 'Min Assist', 'Max Assist', 'Dependent'] as const}
                            />
                        </Fieldset>
                        
                        <Fieldset legend="Transfers">
                            <RadioGroup 
                                value={formData.transfers}
                                onChange={(val) => setFormData(p => ({...p, transfers: val}))}
                                options={['Independent', 'Min Assist', 'Max Assist', 'Dependent'] as const}
                            />
                        </Fieldset>
                        
                        <Fieldset legend="Ambulation">
                            <RadioGroup 
                                value={formData.ambulation}
                                onChange={(val) => setFormData(p => ({...p, ambulation: val}))}
                                options={['Independent', 'Walker', 'Cane', 'Wheelchair', 'Bedbound'] as const}
                            />
                        </Fieldset>
                        
                        <Fieldset legend="Balance">
                            <RadioGroup 
                                value={formData.balance}
                                onChange={(val) => setFormData(p => ({...p, balance: val}))}
                                options={['Normal', 'Fair', 'Poor'] as const}
                            />
                        </Fieldset>
                    </div>
                </Accordion>
                
                {/* ROM/MMT Section */}
                <Accordion title="ROM / MMT (inputs table with 5 rows)">
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-gray-600">
                            <span>Region</span>
                            <span>ROM (°)</span>
                            <span>MMT (0–5)</span>
                        </div>
                        {formData.romMmtEntries.map((entry, index) => (
                            <div key={entry.region} className="grid grid-cols-3 gap-2 items-center">
                                <span className="text-xs font-medium">{entry.region}</span>
                                <input 
                                    value={entry.rom}
                                    onChange={(e) => updateROMMMT(index, 'rom', e.target.value)}
                                    placeholder="__"
                                    className="w-16 p-1 text-center border rounded text-xs"
                                />
                                <RadioGroup 
                                    value={entry.mmt}
                                    onChange={(val) => updateROMMMT(index, 'mmt', val)}
                                    options={['0', '1', '2', '3', '4', '5'] as const}
                                />
                            </div>
                        ))}
                    </div>
                </Accordion>
                
                {/* Common PT Problems Section */}
                <Accordion title="Common PT problems (chips)">
                    <CheckboxGroup 
                        value={formData.problems}
                        onChange={toggleProblem}
                        options={['Weakness', 'Spasticity', 'Contracture', 'Joint Stiffness', 'Pain', 'Balance Deficit', 'Gait Abnormality', 'Other…'] as const}
                    />
                    {formData.problems.has('Other…') && (
                        <input 
                            value={formData.otherProblem || ''}
                            onChange={(e) => setFormData(p => ({...p, otherProblem: e.target.value}))}
                            placeholder="Specify other problem"
                            className="mt-2 w-full p-2 text-xs border rounded"
                        />
                    )}
                </Accordion>
                
                {/* Goals Section */}
                <Accordion title="Goals (chips; separate Short vs Long)">
                    <div className="space-y-3">
                        <Fieldset legend="Short-term">
                            <CheckboxGroup 
                                value={formData.shortTermGoals}
                                onChange={toggleShortTermGoal}
                                options={['Improve ROM', 'Improve Strength', 'Improve Balance', 'Pain Reduction'] as const}
                            />
                        </Fieldset>
                        
                        <Fieldset legend="Long-term">
                            <CheckboxGroup 
                                value={formData.longTermGoals}
                                onChange={toggleLongTermGoal}
                                options={['Independent Ambulation', 'Independent Transfers', 'Prevent Complications', 'Improve ADLs'] as const}
                            />
                        </Fieldset>
                    </div>
                </Accordion>
                
                {/* Optional Note */}
                <textarea 
                    value={formData.note || ''} 
                    onChange={e => setFormData(p => ({...p, note: e.target.value}))} 
                    rows={2} 
                    placeholder="Optional note" 
                    className="w-full p-2 text-sm border rounded-md" 
                />
            </div>
        </form>
    );
};

export default PtAssessmentForm;
