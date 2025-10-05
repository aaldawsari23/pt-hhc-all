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

// New types for the mobile-first doctor form
type ReasonForVisit = 'Chronic Disease Mgt' | 'Post-Hospital F/U' | 'Acute Change' | 'Goals of Care';
type ActiveDiagnosis = 'CHF' | 'DM' | 'HTN' | 'CKD' | 'COPD' | 'Dementia' | 'Stroke' | 'Malignancy' | 'Chronic Pain' | 'Other Dx…';
type GeneralExam = 'Edema' | 'Dehydrated' | 'Cachexia';
type ChestExam = 'Crackles' | 'Wheeze' | '↓ Air Entry';
type CardiacExam = 'AFib' | 'New Murmur';
type NeuroExam = 'Delirium' | 'Weakness' | 'Agitation';
type DMStatus = 'Stable' | 'Hyper' | 'Hypo';
type HTNStatus = 'Controlled' | 'Uncontrolled';
type CHFStatus = 'Compensated' | 'Decompensated';
type PrimaryAssessment = 'CHF Exacerbation' | 'UTI' | 'Pneumonia' | 'Ulcer Management' | 'Delirium' | 'Fall' | 'Pain' | 'Side Effect' | 'Other…';
type Goal = 'Rehab' | 'Maintain' | 'Palliative';
type MedicationPlan = 'No Change' | 'Adjust Diuretics' | 'Adjust Pain Meds' | 'Adjust Insulin' | 'Start/Stop Antibiotic' | 'Polypharmacy Review';
type LabImaging = 'CBC' | 'Chem-7' | 'LFTs' | 'INR' | 'HbA1c' | 'Urine Cx' | 'CXR' | 'Doppler';
type Referral = 'Physiotherapy' | 'Social Worker' | 'Dietitian' | 'Palliative';
type Action = 'Continue Home Care' | 'Family Meeting' | 'Hospital Transfer';
type NextVisit = '1 wk' | '2 wks' | '1 month' | '2 months' | 'PRN' | 'Custom';

interface NewDoctorAssessmentData {
    reasonForVisit: ReasonForVisit;
    activeDiagnoses: Set<ActiveDiagnosis>;
    otherDiagnosis?: string;
    
    // Exam (abnormal only)
    generalExam: Set<GeneralExam>;
    chestExam: Set<ChestExam>;
    cardiacExam: Set<CardiacExam>;
    neuroExam: Set<NeuroExam>;
    
    // Chronic disease status
    dmStatus: DMStatus;
    htnStatus: HTNStatus;
    chfStatus: CHFStatus;
    
    // Primary assessment
    primaryAssessment: PrimaryAssessment;
    otherAssessment?: string;
    
    // Plan of care
    goal: Goal;
    medications: Set<MedicationPlan>;
    labsImaging: Set<LabImaging>;
    referrals: Set<Referral>;
    action: Action;
    nextVisit: NextVisit;
    
    // Optional note
    note?: string;
    
    // Custom next visit
    customNextVisit?: string;
}

const DoctorAssessmentForm: React.FC<AssessmentFormProps> = ({ patient, onSave, onCancel }) => {
    const { state } = useHomeHealthcare();
    const [formData, setFormData] = useState<NewDoctorAssessmentData>({
        reasonForVisit: 'Chronic Disease Mgt',
        activeDiagnoses: new Set(),
        generalExam: new Set(),
        chestExam: new Set(),
        cardiacExam: new Set(),
        neuroExam: new Set(),
        dmStatus: 'Stable',
        htnStatus: 'Controlled',
        chfStatus: 'Compensated',
        primaryAssessment: 'CHF Exacerbation',
        goal: 'Maintain',
        medications: new Set(),
        labsImaging: new Set(),
        referrals: new Set(),
        action: 'Continue Home Care',
        nextVisit: '2 wks',
        customNextVisit: ''
    });

    const toggleSetValue = <T,>(set: Set<T>, value: T): Set<T> => {
        const newSet = new Set(set);
        if (newSet.has(value)) {
            newSet.delete(value);
        } else {
            newSet.add(value);
        }
        return newSet;
    };
    
    const toggleDiagnosis = (diagnosis: ActiveDiagnosis) => {
        setFormData(prev => ({
            ...prev,
            activeDiagnoses: toggleSetValue(prev.activeDiagnoses, diagnosis)
        }));
    };
    
    const toggleGeneralExam = (finding: GeneralExam) => {
        setFormData(prev => ({
            ...prev,
            generalExam: toggleSetValue(prev.generalExam, finding)
        }));
    };
    
    const toggleChestExam = (finding: ChestExam) => {
        setFormData(prev => ({
            ...prev,
            chestExam: toggleSetValue(prev.chestExam, finding)
        }));
    };
    
    const toggleCardiacExam = (finding: CardiacExam) => {
        setFormData(prev => ({
            ...prev,
            cardiacExam: toggleSetValue(prev.cardiacExam, finding)
        }));
    };
    
    const toggleNeuroExam = (finding: NeuroExam) => {
        setFormData(prev => ({
            ...prev,
            neuroExam: toggleSetValue(prev.neuroExam, finding)
        }));
    };
    
    const toggleMedication = (med: MedicationPlan) => {
        setFormData(prev => ({
            ...prev,
            medications: toggleSetValue(prev.medications, med)
        }));
    };
    
    const toggleLabImaging = (item: LabImaging) => {
        setFormData(prev => ({
            ...prev,
            labsImaging: toggleSetValue(prev.labsImaging, item)
        }));
    };
    
    const toggleReferral = (referral: Referral) => {
        setFormData(prev => ({
            ...prev,
            referrals: toggleSetValue(prev.referrals, referral)
        }));
    };

    // الردود التفاعلية المطلوبة
    const getConditionalOptions = () => {
        const planType = formData.action;
        const hasChangePlanning = formData.medications.size > 0 || formData.labsImaging.size > 0 || formData.referrals.size > 0;
        
        return {
            showMedicationOptions: planType === 'Continue Home Care' || hasChangePlanning,
            showReferralOptions: planType === 'Continue Home Care' || formData.referrals.size > 0,
            showLabOptions: planType === 'Continue Home Care' || formData.labsImaging.size > 0,
            showTransferOptions: planType === 'Hospital Transfer'
        };
    };

    // خيارات الأدوية التفاعلية
    const getMedicationOptions = (): MedicationPlan[] => {
        const options: MedicationPlan[] = ['No Change'];
        
        if (formData.activeDiagnoses.has('CHF')) {
            options.push('Adjust Diuretics');
        }
        if (formData.activeDiagnoses.has('DM')) {
            options.push('Adjust Insulin');
        }
        if (formData.primaryAssessment === 'UTI' || formData.primaryAssessment === 'Pneumonia') {
            options.push('Start/Stop Antibiotic');
        }
        if (formData.primaryAssessment === 'Pain') {
            options.push('Adjust Pain Meds');
        }
        
        options.push('Polypharmacy Review');
        return options;
    };

    // خيارات التحويل التفاعلية
    const getReferralOptions = (): Referral[] => {
        const options: Referral[] = [];
        
        if (formData.goal === 'Rehab') {
            options.push('Physiotherapy');
        }
        if (formData.goal === 'Palliative') {
            options.push('Palliative');
        }
        if (formData.activeDiagnoses.has('DM')) {
            options.push('Dietitian');
        }
        
        options.push('Social Worker');
        return options;
    };

    // خيارات التحاليل التفاعلية
    const getLabOptions = (): LabImaging[] => {
        const options: LabImaging[] = [];
        
        if (formData.primaryAssessment === 'UTI') {
            options.push('Urine Cx');
        }
        if (formData.primaryAssessment === 'Pneumonia' || formData.chestExam.has('Crackles')) {
            options.push('CXR');
        }
        if (formData.activeDiagnoses.has('DM')) {
            options.push('HbA1c');
        }
        if (formData.activeDiagnoses.has('CHF')) {
            options.push('CBC', 'Chem-7');
        }
        
        options.push('CBC', 'Chem-7', 'LFTs', 'INR');
        return [...new Set(options)]; // إزالة التكرار
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const currentUser = state.staff.find(s => s.المهنة === 'طبيب') || state.staff[0];
        
        // Convert new form data to legacy format for compatibility
        const legacyAssessment: DoctorAssessmentData = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            assessorId: currentUser.رقم_الهوية,
            assessorName: currentUser.الاسم,
            role: Role.Doctor,
            status: 'Unchanged', // Default for now
            plan: 'Continue same plan', // Default for now
            chiefFocus: Array.from(formData.activeDiagnoses) as any[],
            assessment: {
                etiology: [],
                severity: 'Mild'
            },
            followUpTiming: formData.nextVisit,
            mdNote: formData.note
        };
        
        onSave(legacyAssessment);
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
                {/* Reason for visit */}
                <Accordion title="Reason for visit (single-select chips)" defaultOpen={true}>
                    <RadioGroup 
                        value={formData.reasonForVisit}
                        onChange={(val) => setFormData(p => ({...p, reasonForVisit: val}))}
                        options={['Chronic Disease Mgt', 'Post-Hospital F/U', 'Acute Change', 'Goals of Care'] as const}
                    />
                </Accordion>
                
                {/* Active diagnoses */}
                <Accordion title="Active diagnoses (multi-select chips)">
                    <CheckboxGroup 
                        value={formData.activeDiagnoses}
                        onChange={toggleDiagnosis}
                        options={['CHF', 'DM', 'HTN', 'CKD', 'COPD', 'Dementia', 'Stroke', 'Malignancy', 'Chronic Pain', 'Other Dx…'] as const}
                    />
                    {formData.activeDiagnoses.has('Other Dx…') && (
                        <input 
                            value={formData.otherDiagnosis || ''}
                            onChange={(e) => setFormData(p => ({...p, otherDiagnosis: e.target.value}))}
                            placeholder="Specify other diagnosis"
                            className="mt-2 w-full p-2 text-xs border rounded"
                        />
                    )}
                </Accordion>
                
                {/* Exam (abnormal only) */}
                <Accordion title="Exam (abnormal only; system chips)">
                    <div className="space-y-3">
                        <Fieldset legend="General">
                            <CheckboxGroup 
                                value={formData.generalExam}
                                onChange={toggleGeneralExam}
                                options={['Edema', 'Dehydrated', 'Cachexia'] as const}
                            />
                        </Fieldset>
                        
                        <Fieldset legend="Chest">
                            <CheckboxGroup 
                                value={formData.chestExam}
                                onChange={toggleChestExam}
                                options={['Crackles', 'Wheeze', '↓ Air Entry'] as const}
                            />
                        </Fieldset>
                        
                        <Fieldset legend="Cardiac">
                            <CheckboxGroup 
                                value={formData.cardiacExam}
                                onChange={toggleCardiacExam}
                                options={['AFib', 'New Murmur'] as const}
                            />
                        </Fieldset>
                        
                        <Fieldset legend="Neuro">
                            <CheckboxGroup 
                                value={formData.neuroExam}
                                onChange={toggleNeuroExam}
                                options={['Delirium', 'Weakness', 'Agitation'] as const}
                            />
                        </Fieldset>
                    </div>
                </Accordion>
                
                {/* Chronic disease quick status */}
                <Accordion title="Chronic disease quick status (single-select per row)">
                    <div className="space-y-3">
                        <Fieldset legend="DM">
                            <RadioGroup 
                                value={formData.dmStatus}
                                onChange={(val) => setFormData(p => ({...p, dmStatus: val}))}
                                options={['Stable', 'Hyper', 'Hypo'] as const}
                            />
                        </Fieldset>
                        
                        <Fieldset legend="HTN">
                            <RadioGroup 
                                value={formData.htnStatus}
                                onChange={(val) => setFormData(p => ({...p, htnStatus: val}))}
                                options={['Controlled', 'Uncontrolled'] as const}
                            />
                        </Fieldset>
                        
                        <Fieldset legend="CHF">
                            <RadioGroup 
                                value={formData.chfStatus}
                                onChange={(val) => setFormData(p => ({...p, chfStatus: val}))}
                                options={['Compensated', 'Decompensated'] as const}
                            />
                        </Fieldset>
                    </div>
                </Accordion>
                
                {/* Primary assessment */}
                <Accordion title="Primary assessment (chips)">
                    <RadioGroup 
                        value={formData.primaryAssessment}
                        onChange={(val) => setFormData(p => ({...p, primaryAssessment: val}))}
                        options={['CHF Exacerbation', 'UTI', 'Pneumonia', 'Ulcer Management', 'Delirium', 'Fall', 'Pain', 'Side Effect', 'Other…'] as const}
                    />
                    {formData.primaryAssessment === 'Other…' && (
                        <input 
                            value={formData.otherAssessment || ''}
                            onChange={(e) => setFormData(p => ({...p, otherAssessment: e.target.value}))}
                            placeholder="Specify other assessment"
                            className="mt-2 w-full p-2 text-xs border rounded"
                        />
                    )}
                </Accordion>
                
                {/* Plan of care */}
                <Accordion title="Plan of care (chips)">
                    <div className="space-y-3">
                        <Fieldset legend="Goal">
                            <RadioGroup 
                                value={formData.goal}
                                onChange={(val) => setFormData(p => ({...p, goal: val}))}
                                options={['Rehab', 'Maintain', 'Palliative'] as const}
                            />
                        </Fieldset>
                        
                        {/* الردود التفاعلية للأدوية */}
                        <Fieldset legend="Medications (التفاعلية)">
                            <CheckboxGroup 
                                value={formData.medications}
                                onChange={toggleMedication}
                                options={getMedicationOptions()}
                            />
                            {formData.medications.size > 0 && (
                                <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                                    <p className="text-xs text-blue-600">✓ خيارات الأدوية المتاحة بناءً على التشخيص والخطة</p>
                                </div>
                            )}
                        </Fieldset>
                        
                        {/* الردود التفاعلية للتحاليل */}
                        <Fieldset legend="Labs/Imaging (التفاعلية)">
                            <CheckboxGroup 
                                value={formData.labsImaging}
                                onChange={toggleLabImaging}
                                options={getLabOptions()}
                            />
                            {formData.labsImaging.size > 0 && (
                                <div className="mt-2 p-2 bg-green-50 rounded-lg">
                                    <p className="text-xs text-green-600">✓ تحاليل موصى بها بناءً على التقييم الأولي</p>
                                </div>
                            )}
                        </Fieldset>
                        
                        {/* الردود التفاعلية للتحويلات */}
                        <Fieldset legend="Referrals (التفاعلية)">
                            <CheckboxGroup 
                                value={formData.referrals}
                                onChange={toggleReferral}
                                options={getReferralOptions()}
                            />
                            {formData.referrals.size > 0 && (
                                <div className="mt-2 p-2 bg-purple-50 rounded-lg">
                                    <p className="text-xs text-purple-600">✓ تحويلات موصى بها بناءً على الهدف العلاجي</p>
                                </div>
                            )}
                        </Fieldset>
                        
                        <Fieldset legend="Action">
                            <RadioGroup 
                                value={formData.action}
                                onChange={(val) => setFormData(p => ({...p, action: val}))}
                                options={['Continue Home Care', 'Family Meeting', 'Hospital Transfer'] as const}
                            />
                        </Fieldset>
                        
                        <Fieldset legend="Next visit (محسن)">
                            <RadioGroup 
                                value={formData.nextVisit}
                                onChange={(val) => setFormData(p => ({...p, nextVisit: val}))}
                                options={['1 wk', '2 wks', '1 month', '2 months', 'PRN', 'Custom'] as const}
                            />
                            {formData.nextVisit === 'Custom' && (
                                <div className="mt-3">
                                    <input 
                                        type="text"
                                        value={formData.customNextVisit || ''}
                                        onChange={(e) => setFormData(p => ({...p, customNextVisit: e.target.value}))}
                                        placeholder="أدخل توقيت الزيارة القادمة (مثال: 3 weeks, 6 months)"
                                        className="w-full p-3 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">يمكنك إدخال أي توقيت مخصص للزيارة القادمة</p>
                                </div>
                            )}
                            {formData.nextVisit !== 'PRN' && formData.nextVisit !== 'Custom' && (
                                <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                                    <p className="text-xs text-blue-600">
                                        ✓ الزيارة القادمة مجدولة خلال: {formData.nextVisit}
                                    </p>
                                </div>
                            )}
                        </Fieldset>
                    </div>
                </Accordion>
                
                {/* Optional note */}
                <div className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-sm">
                    <label className="font-bold text-sm md:text-base text-blue-800 mb-2 block flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Optional note
                    </label>
                    <textarea 
                        value={formData.note || ''} 
                        onChange={e => setFormData(p => ({...p, note: e.target.value}))} 
                        rows={3} 
                        placeholder="Optional note (single free text)" 
                        className="w-full p-3 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-200 resize-none"
                    />
                </div>
            </div>
        </form>
    );
};

export default DoctorAssessmentForm;
