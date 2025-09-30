import React, { useState } from 'react';
import { SwFollowUpData } from '../../../types';
import { Save } from 'lucide-react';
import { Fieldset, RadioGroup, CheckboxGroup } from '../FormControls';

interface Props {
    initialData?: SwFollowUpData;
    onSave: (data: SwFollowUpData) => void;
    onCancel: () => void;
}

const actionsOptions = ['تنسيق لوازم', 'دعم مُعيل', 'مساعدة مالية', 'ترتيب نقل', 'موارد مجتمعية'] as const;

const SwFollowUpForm: React.FC<Props> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState<SwFollowUpData>(initialData || {
        situationChange: 'لم يتغير',
        actionsTaken: [],
        plan: 'الاستمرار',
    });

    const handleActionToggle = (action: typeof actionsOptions[number]) => {
        setFormData(prev => {
            const newActions = new Set(prev.actionsTaken);
            if (newActions.has(action)) {
                newActions.delete(action);
            } else {
                newActions.add(action);
            }
            return { ...prev, actionsTaken: Array.from(newActions) };
        });
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <div className="bg-yellow-50/50 p-3 rounded-md border border-yellow-200 space-y-3 text-sm" dir="rtl">
            <h4 className="font-bold text-yellow-800">مذكرة متابعة اجتماعية</h4>
            <div className="space-y-3">
                <Fieldset legend="تغير الوضع الاجتماعي">
                    <RadioGroup 
                        value={formData.situationChange} 
                        onChange={v => setFormData(p => ({...p, situationChange: v}))} 
                        options={['تحسن', 'لم يتغير', 'تدهور']} 
                    />
                </Fieldset>
                <Fieldset legend="الإجراءات المتخذة">
                    <CheckboxGroup 
                        value={new Set(formData.actionsTaken)} 
                        onChange={handleActionToggle} 
                        options={actionsOptions} 
                    />
                </Fieldset>
                <Fieldset legend="الخطة">
                     <RadioGroup 
                        value={formData.plan} 
                        onChange={v => setFormData(p => ({...p, plan: v}))} 
                        options={['الاستمرار', 'تغيير']} 
                    />
                </Fieldset>
                <textarea 
                    value={formData.swNote || ''} 
                    onChange={e => setFormData(p => ({...p, swNote: e.target.value}))} 
                    rows={2} 
                    placeholder="ملاحظات (اختياري)..." 
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
