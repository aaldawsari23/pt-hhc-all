import React, { useState } from 'react';
import { SwFollowUpData } from '../../../types';
import { Save } from 'lucide-react';
import { Fieldset, RadioGroup, CheckboxGroup } from '../FormControls';

interface Props {
    initialData?: SwFollowUpData;
    onSave: (data: SwFollowUpData) => void;
    onCancel: () => void;
}

// New types for SW follow-up form (Arabic)
type SocialStatus = 'مستقرة' | 'تحسّن' | 'تراجع';
type Update = 'تغيّر مقدّم الرعاية' | 'نزاع/توتر أسري' | 'ضائقة مالية' | 'عزلة متزايدة' | 'لا جديد';
type Intervention = 'تثقيف الأسرة' | 'ربط بخدمة مجتمعية' | 'متابعة نفسية' | 'زيارة مشتركة (تمريض/طبيب)';
type ShortTermPlan = 'الاستمرار كما هو' | 'تعديل الخطة' | 'رفع للجنة اجتماعية' | 'إحالة لجهة داعمة';
type EscalationIndicator = 'انعدام مقدّم رعاية فعّال' | 'غياب رعاية منزلية كافية' | 'خطر فقدان السكن' | 'إساءة/إهمال محتمل' | 'ضائقة مالية شديدة' | 'رفض رعاية مع مخاطر صحية' | 'تدهور نفسي حاد (خطر على النفس/الغير)' | 'عزلة اجتماعية شديدة' | 'حاجة لنقل عاجل (مرافقة اجتماعية)';
type EscalationPath = 'إبلاغ الطبيب المناوب' | 'تنسيق طوارئ 937' | 'إحالة حماية أسرية' | 'إحالة جمعية/دعم مالي' | 'جدولة زيارة مشتركة (تمريض/طبيب/اجتماعي)';

interface NewSWFollowUpData {
    socialStatus: SocialStatus;
    updates: Set<Update>;
    interventions: Set<Intervention>;
    shortTermPlan: ShortTermPlan;
    escalationIndicators: Set<EscalationIndicator>;
    escalationPaths: Set<EscalationPath>;
    note?: string;
}

const SwFollowUpForm: React.FC<Props> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState<NewSWFollowUpData>({
        socialStatus: 'مستقرة',
        updates: new Set(),
        interventions: new Set(),
        shortTermPlan: 'الاستمرار كما هو',
        escalationIndicators: new Set(),
        escalationPaths: new Set()
    });

    const toggleUpdate = (update: Update) => {
        setFormData(prev => {
            const newUpdates = new Set(prev.updates);
            if (newUpdates.has(update)) {
                newUpdates.delete(update);
            } else {
                newUpdates.add(update);
            }
            return { ...prev, updates: newUpdates };
        });
    };
    
    const toggleIntervention = (intervention: Intervention) => {
        setFormData(prev => {
            const newInterventions = new Set(prev.interventions);
            if (newInterventions.has(intervention)) {
                newInterventions.delete(intervention);
            } else {
                newInterventions.add(intervention);
            }
            return { ...prev, interventions: newInterventions };
        });
    };
    
    const toggleEscalationIndicator = (indicator: EscalationIndicator) => {
        setFormData(prev => {
            const newIndicators = new Set(prev.escalationIndicators);
            if (newIndicators.has(indicator)) {
                newIndicators.delete(indicator);
            } else {
                newIndicators.add(indicator);
            }
            return { ...prev, escalationIndicators: newIndicators };
        });
    };
    
    const toggleEscalationPath = (path: EscalationPath) => {
        setFormData(prev => {
            const newPaths = new Set(prev.escalationPaths);
            if (newPaths.has(path)) {
                newPaths.delete(path);
            } else {
                newPaths.add(path);
            }
            return { ...prev, escalationPaths: newPaths };
        });
    };
    
    const showEscalationPaths = formData.escalationIndicators.size > 0;

    const handleSave = () => {
        // Convert new form data to legacy format for compatibility
        const legacyData: SwFollowUpData = {
            situationChange: formData.socialStatus,
            actionsTaken: Array.from(formData.interventions) as any[],
            plan: formData.shortTermPlan.includes('استمرار') ? 'الاستمرار' : 'تغيير',
            swNote: formData.note
        };
        onSave(legacyData);
    };

    return (
        <div className="bg-yellow-50/50 p-3 rounded-md border border-yellow-200 space-y-3 text-sm" dir="rtl">
            <h4 className="font-bold text-yellow-800">مذكرة متابعة اجتماعية</h4>
            <div className="space-y-3">
                {/* حالة المريض الاجتماعية الآن */}
                <Fieldset legend="حالة المريض الاجتماعية الآن">
                    <RadioGroup 
                        value={formData.socialStatus}
                        onChange={(val) => setFormData(p => ({...p, socialStatus: val}))}
                        options={['مستقرة', 'تحسّن', 'تراجع'] as const}
                    />
                </Fieldset>
                
                {/* مستجدات (متعدّد) */}
                <Fieldset legend="مستجدات (متعدّد)">
                    <CheckboxGroup 
                        value={formData.updates}
                        onChange={toggleUpdate}
                        options={['تغيّر مقدّم الرعاية', 'نزاع/توتر أسري', 'ضائقة مالية', 'عزلة متزايدة', 'لا جديد'] as const}
                    />
                </Fieldset>
                
                {/* تدخّلات تمت اليوم (متعدّد) */}
                <Fieldset legend="تدخّلات تمت اليوم (متعدّد)">
                    <CheckboxGroup 
                        value={formData.interventions}
                        onChange={toggleIntervention}
                        options={['تثقيف الأسرة', 'ربط بخدمة مجتمعية', 'متابعة نفسية', 'زيارة مشتركة (تمريض/طبيب)'] as const}
                    />
                </Fieldset>
                
                {/* خطة قصيرة المدى (اختيار واحد) */}
                <Fieldset legend="خطة قصيرة المدى (اختيار واحد)">
                    <RadioGroup 
                        value={formData.shortTermPlan}
                        onChange={(val) => setFormData(p => ({...p, shortTermPlan: val}))}
                        options={['الاستمرار كما هو', 'تعديل الخطة', 'رفع للجنة اجتماعية', 'إحالة لجهة داعمة'] as const}
                    />
                </Fieldset>
                
                {/* مؤشرات للتصعيد (متعدّد) */}
                <Fieldset legend="مؤشرات للتصعيد (متعدّد)">
                    <CheckboxGroup 
                        value={formData.escalationIndicators}
                        onChange={toggleEscalationIndicator}
                        options={[
                            'انعدام مقدّم رعاية فعّال',
                            'غياب رعاية منزلية كافية',
                            'خطر فقدان السكن',
                            'إساءة/إهمال محتمل',
                            'ضائقة مالية شديدة',
                            'رفض رعاية مع مخاطر صحية',
                            'تدهور نفسي حاد (خطر على النفس/الغير)',
                            'عزلة اجتماعية شديدة',
                            'حاجة لنقل عاجل (مرافقة اجتماعية)'
                        ] as const}
                    />
                </Fieldset>
                
                {/* مسار التصعيد (متعدّد – يُظهر عند الحاجة) */}
                {showEscalationPaths && (
                    <div className="p-3 bg-red-50 rounded border border-red-200">
                        <Fieldset legend="مسار التصعيد (متعدّد – يُظهر عند الحاجة)">
                            <CheckboxGroup 
                                value={formData.escalationPaths}
                                onChange={toggleEscalationPath}
                                options={[
                                    'إبلاغ الطبيب المناوب',
                                    'تنسيق طوارئ 937',
                                    'إحالة حماية أسرية',
                                    'إحالة جمعية/دعم مالي',
                                    'جدولة زيارة مشتركة (تمريض/طبيب/اجتماعي)'
                                ] as const}
                            />
                        </Fieldset>
                    </div>
                )}
                
                <textarea 
                    value={formData.note || ''} 
                    onChange={e => setFormData(p => ({...p, note: e.target.value}))} 
                    rows={2} 
                    placeholder="ملاحظــة (اختياري – سطر واحد)" 
                    className="w-full p-2 border rounded-md" 
                />
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="text-xs px-3 py-1 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                <button type="button" onClick={handleSave} className="text-xs px-3 py-1 rounded-md text-white bg-yellow-600 hover:bg-yellow-700 flex items-center gap-1"><Save size={14} />حفظ</button>
            </div>
        </div>
    );
};

export default SwFollowUpForm;
