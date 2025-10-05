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

// New types for the social work initial assessment (Arabic)
type CurrentStatus = 'مستقر' | 'تحسّن' | 'تراجع';
type Priority = 'منخفض' | 'متوسط' | 'عالٍ';
type FamilyStatus = 'مع الأسرة' | 'مع الزوج/الزوجة' | 'مع أحد الأبناء' | 'بمفرده';
type PrimaryCaregiver = 'ابن' | 'ابنة' | 'زوج/زوجة' | 'عامل منزلي' | 'غير محدّد';
type HousingType = 'ملك' | 'إيجار';
type HousingSuitability = 'مهيأ' | 'غير مهيأ (ضيق/حواجز/بدون منحدرات)';
type Utilities = 'كهرباء' | 'ماء' | 'تكييف' | 'مصعد';
type IncomeLevel = 'كافٍ' | 'محدود' | 'غير كافٍ';
type IncomeSource = 'راتب تقاعدي' | 'ضمان اجتماعي' | 'دعم أسري' | 'لا يوجد';
type SupportLevel = 'قوي' | 'متوسط' | 'ضعيف';
type PsychStatus = 'مستقرة' | 'قلق' | 'اكتئاب' | 'رفض رعاية' | 'ضغوط أسرية';
type SocialChallenge = 'عزلة اجتماعية' | 'ضعف وعي بالمرض' | 'نزاع/توتر أسري' | 'عبء رعاية على الأسرة' | 'صعوبات مالية';
type ExternalResource = 'جمعيات خيرية' | 'متطوعون' | 'برامج حكومية' | 'دعم مجتمعي محلي';

interface NewSWAssessmentData {
    currentStatus: CurrentStatus;
    priority: Priority;
    
    // Family situation
    familyStatus: FamilyStatus;
    primaryCaregiver: PrimaryCaregiver;
    
    // Housing
    housingType: HousingType;
    housingSuitability: HousingSuitability;
    utilities: Set<Utilities>;
    
    // Economic situation
    incomeLevel: IncomeLevel;
    incomeSource: IncomeSource;
    
    // Support network
    supportLevel: SupportLevel;
    
    // Psychological/behavioral status
    psychStatus: Set<PsychStatus>;
    
    // Social challenges
    socialChallenges: Set<SocialChallenge>;
    
    // External resources
    externalResources: Set<ExternalResource>;
    
    // Optional note
    note?: string;
}

const SwAssessmentForm: React.FC<AssessmentFormProps> = ({ patient, onSave, onCancel }) => {
    const { state } = useHomeHealthcare();
    const [formData, setFormData] = useState<NewSWAssessmentData>({
        currentStatus: 'مستقر',
        priority: 'متوسط',
        familyStatus: 'مع الأسرة',
        primaryCaregiver: 'ابن',
        housingType: 'ملك',
        housingSuitability: 'مهيأ',
        utilities: new Set(),
        incomeLevel: 'كافٍ',
        incomeSource: 'راتب تقاعدي',
        supportLevel: 'قوي',
        psychStatus: new Set(),
        socialChallenges: new Set(),
        externalResources: new Set()
    });
    
    const toggleUtility = (utility: Utilities) => {
        setFormData(prev => {
            const newUtilities = new Set(prev.utilities);
            if (newUtilities.has(utility)) {
                newUtilities.delete(utility);
            } else {
                newUtilities.add(utility);
            }
            return { ...prev, utilities: newUtilities };
        });
    };
    
    const togglePsychStatus = (status: PsychStatus) => {
        setFormData(prev => {
            const newStatus = new Set(prev.psychStatus);
            if (newStatus.has(status)) {
                newStatus.delete(status);
            } else {
                newStatus.add(status);
            }
            return { ...prev, psychStatus: newStatus };
        });
    };
    
    const toggleSocialChallenge = (challenge: SocialChallenge) => {
        setFormData(prev => {
            const newChallenges = new Set(prev.socialChallenges);
            if (newChallenges.has(challenge)) {
                newChallenges.delete(challenge);
            } else {
                newChallenges.add(challenge);
            }
            return { ...prev, socialChallenges: newChallenges };
        });
    };
    
    const toggleExternalResource = (resource: ExternalResource) => {
        setFormData(prev => {
            const newResources = new Set(prev.externalResources);
            if (newResources.has(resource)) {
                newResources.delete(resource);
            } else {
                newResources.add(resource);
            }
            return { ...prev, externalResources: newResources };
        });
    };
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const currentUser = state.staff.find(s => s.المهنة.includes('اجتماعي')) || state.staff[0];
        
        // Convert new form data to legacy format for compatibility
        const legacyAssessment: SwAssessmentData = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            assessorId: currentUser.رقم_الهوية,
            assessorName: currentUser.الاسم,
            role: Role.SocialWorker,
            status: formData.currentStatus === 'تحسّن' ? 'Improved' : 
                   formData.currentStatus === 'تراجع' ? 'Worsened' : 'Unchanged',
            plan: 'Continue same plan', // Default for now
            residence: formData.familyStatus,
            caregiverHours: 'أكثر من 30', // Default
            adlAssistance: 'مساعدة جزئية', // Default
            economic: {
                income: formData.incomeLevel,
                coverage: 'حكومية', // Default
                transport: 'متوفر' // Default
            },
            homeSafety: { risks: [], aids: [] },
            needs: [],
            psychosocial: { 
                mood: formData.psychStatus.has('اكتئاب') ? 'سلبي' : 'إيجابي',
                memory: 'طبيعي', // Default
                abuseSuspicion: 'لا' // Default
            },
            actions: Array.from(formData.externalResources) as any[],
            swNote: formData.note
        };
        
        onSave(legacyAssessment);
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
                {/* الحالة الحالية */}
                <Accordion title="الحالة الحالية" defaultOpen={true}>
                    <div className="space-y-3">
                        <Fieldset legend="الحالة الحالية">
                            <RadioGroup 
                                value={formData.currentStatus}
                                onChange={(val) => setFormData(p => ({...p, currentStatus: val}))}
                                options={['مستقر', 'تحسّن', 'تراجع'] as const}
                            />
                        </Fieldset>
                        
                        <Fieldset legend="درجة الأولوية">
                            <RadioGroup 
                                value={formData.priority}
                                onChange={(val) => setFormData(p => ({...p, priority: val}))}
                                options={['منخفض', 'متوسط', 'عالٍ'] as const}
                            />
                        </Fieldset>
                    </div>
                </Accordion>
                
                {/* الوضع الأسري */}
                <Accordion title="الوضع الأسري">
                    <div className="space-y-3">
                        <Fieldset legend="الوضع الأسري (اختيار واحد)">
                            <RadioGroup 
                                value={formData.familyStatus}
                                onChange={(val) => setFormData(p => ({...p, familyStatus: val}))}
                                options={['مع الأسرة', 'مع الزوج/الزوجة', 'مع أحد الأبناء', 'بمفرده'] as const}
                            />
                        </Fieldset>
                        
                        <Fieldset legend="مقدّم الرعاية الأساسي (اختيار واحد)">
                            <RadioGroup 
                                value={formData.primaryCaregiver}
                                onChange={(val) => setFormData(p => ({...p, primaryCaregiver: val}))}
                                options={['ابن', 'ابنة', 'زوج/زوجة', 'عامل منزلي', 'غير محدّد'] as const}
                            />
                        </Fieldset>
                    </div>
                </Accordion>
                
                {/* الوضع السكني */}
                <Accordion title="الوضع السكني">
                    <div className="space-y-3">
                        <Fieldset legend="نوع السكن">
                            <RadioGroup 
                                value={formData.housingType}
                                onChange={(val) => setFormData(p => ({...p, housingType: val}))}
                                options={['ملك', 'إيجار'] as const}
                            />
                        </Fieldset>
                        
                        <Fieldset legend="ملاءمة السكن">
                            <RadioGroup 
                                value={formData.housingSuitability}
                                onChange={(val) => setFormData(p => ({...p, housingSuitability: val}))}
                                options={['مهيأ', 'غير مهيأ (ضيق/حواجز/بدون منحدرات)'] as const}
                            />
                        </Fieldset>
                        
                        <Fieldset legend="المرافق المتاحة">
                            <CheckboxGroup 
                                value={formData.utilities}
                                onChange={toggleUtility}
                                options={['كهرباء', 'ماء', 'تكييف', 'مصعد'] as const}
                            />
                        </Fieldset>
                    </div>
                </Accordion>
                
                {/* الوضع الاقتصادي */}
                <Accordion title="الوضع الاقتصادي">
                    <div className="space-y-3">
                        <Fieldset legend="الدخل">
                            <RadioGroup 
                                value={formData.incomeLevel}
                                onChange={(val) => setFormData(p => ({...p, incomeLevel: val}))}
                                options={['كافٍ', 'محدود', 'غير كافٍ'] as const}
                            />
                        </Fieldset>
                        
                        <Fieldset legend="المصدر">
                            <RadioGroup 
                                value={formData.incomeSource}
                                onChange={(val) => setFormData(p => ({...p, incomeSource: val}))}
                                options={['راتب تقاعدي', 'ضمان اجتماعي', 'دعم أسري', 'لا يوجد'] as const}
                            />
                        </Fieldset>
                    </div>
                </Accordion>
                
                {/* شبكة الدعم */}
                <Accordion title="شبكة الدعم">
                    <RadioGroup 
                        value={formData.supportLevel}
                        onChange={(val) => setFormData(p => ({...p, supportLevel: val}))}
                        options={['قوي', 'متوسط', 'ضعيف'] as const}
                    />
                </Accordion>
                
                {/* الحالة النفسية/السلوكية */}
                <Accordion title="الحالة النفسية/السلوكية (متعدّد)">
                    <CheckboxGroup 
                        value={formData.psychStatus}
                        onChange={togglePsychStatus}
                        options={['مستقرة', 'قلق', 'اكتئاب', 'رفض رعاية', 'ضغوط أسرية'] as const}
                    />
                </Accordion>
                
                {/* تحديات اجتماعية شائعة */}
                <Accordion title="تحديات اجتماعية شائعة (متعدّد)">
                    <CheckboxGroup 
                        value={formData.socialChallenges}
                        onChange={toggleSocialChallenge}
                        options={['عزلة اجتماعية', 'ضعف وعي بالمرض', 'نزاع/توتر أسري', 'عبء رعاية على الأسرة', 'صعوبات مالية'] as const}
                    />
                </Accordion>
                
                {/* موارد خارجية محتملة */}
                <Accordion title="موارد خارجية محتملة (متعدّد)">
                    <CheckboxGroup 
                        value={formData.externalResources}
                        onChange={toggleExternalResource}
                        options={['جمعيات خيرية', 'متطوعون', 'برامج حكومية', 'دعم مجتمعي محلي'] as const}
                    />
                </Accordion>
                
                {/* ملاحظة اختيارية */}
                <textarea 
                    value={formData.note || ''} 
                    onChange={e => setFormData(p => ({...p, note: e.target.value}))} 
                    rows={2} 
                    placeholder="ملاحظــة (اختياري – سطر واحد)" 
                    className="w-full p-2 text-sm border rounded-md" 
                />
            </div>
        </form>
    );
};

export default SwAssessmentForm;
