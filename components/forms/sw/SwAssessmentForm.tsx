import React, { useState } from 'react';
import { Patient, Assessment, Role, SwAssessmentData } from '../../../types';
import { useHomeHealthcare } from '../../../context/HomeHealthcareContext';
import { Save, X } from 'lucide-react';
import { Accordion, Fieldset, RadioGroup, CheckboxGroup } from '../FormControls';

interface AssessmentFormProps {
    patient: Patient;
    onSave: (assessment: Assessment) => void;
    onCancel: () => void;
}

const SwAssessmentForm: React.FC<AssessmentFormProps> = ({ patient, onSave, onCancel }) => {
    const { state } = useHomeHealthcare();
    const [formData, setFormData] = useState<Partial<SwAssessmentData>>({
        role: Role.SocialWorker,
        status: 'Unchanged',
        plan: 'Continue same plan',
        residence: 'مع الأسرة',
        caregiverHours: 'أكثر من 30',
        adlAssistance: 'مساعدة جزئية',
        economic: { income: 'متوسط', coverage: 'حكومية', transport: 'متوفر' },
        homeSafety: { risks: [], aids: [] },
        needs: [],
        psychosocial: { mood: 'سلبي', memory: 'طبيعي', abuseSuspicion: 'لا' },
        actions: []
    });
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const currentUser = state.staff.find(s => s.المهنة.includes('اجتماعي')) || state.staff[0];
        const newAssessment: SwAssessmentData = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            assessorId: currentUser.رقم_الهوية,
            assessorName: currentUser.الاسم,
            ...formData
        } as SwAssessmentData;
        onSave(newAssessment);
    };

    return (
        <form onSubmit={handleSave} className="p-4 bg-gray-50 flex flex-col h-full" dir="rtl">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-800">التقييم الاجتماعي</h4>
                <div className="flex gap-1">
                    <button type="button" onClick={onCancel} title="إلغاء" className="p-1.5 rounded-full hover:bg-red-100 text-red-500"><X size={16} /></button>
                    <button type="submit" title="حفظ" className="p-1.5 rounded-full hover:bg-green-100 text-green-600"><Save size={16} /></button>
                </div>
            </div>
            <div className="space-y-2 overflow-y-auto flex-grow pr-1 text-sm">
                <Accordion title="السكن والرعاية" defaultOpen={true}>
                    <Fieldset legend="الإقامة">
                        <RadioGroup value={formData.residence!} onChange={(val) => setFormData(p => ({...p, residence: val}))} options={['يعيش بمفرده', 'مع الأسرة', 'مع مُعيل']} />
                    </Fieldset>
                </Accordion>
                 <Accordion title="الوضع الاقتصادي وخدمات النقل">
                    <Fieldset legend="الدخل التقريبي">
                        <RadioGroup value={formData.economic?.income!} onChange={(val) => setFormData(p => ({...p, economic: {...p.economic!, income: val}}))} options={['منخفض', 'متوسط', 'مرتفع']} />
                    </Fieldset>
                </Accordion>
                <textarea value={formData.swNote || ''} onChange={e => setFormData(p => ({...p, swNote: e.target.value}))} rows={2} placeholder="ملاحظات الأخصائي (اختياري)" maxLength={80} className="w-full p-2 text-sm border rounded-md" />
            </div>
        </form>
    );
};

export default SwAssessmentForm;
