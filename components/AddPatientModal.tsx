import React, { useState } from 'react';
import { X, User, Phone, MapPin, Hash, Calendar, Shield, Plus } from 'lucide-react';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import { Patient } from '../types';

interface AddPatientModalProps {
    onClose: () => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({ onClose }) => {
    const { state, dispatch } = useHomeHealthcare();
    const [formData, setFormData] = useState({
        nationalId: '',
        nameAr: '',
        phone: '',
        areaId: '',
        sex: 'Male' as 'Male' | 'Female',
        bradenScore: '',
        level: '',
        minMonthlyRequired: '',
        admissionDate: new Date().toISOString().split('T')[0],
        hasCatheter: false,
        ngTube: false,
        gTube: false,
        fallHighRisk: false,
        ivTherapy: false,
        ventSupport: false
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.nationalId.trim()) {
            newErrors.nationalId = 'رقم الهوية مطلوب';
        } else if (!/^\d{10}$/.test(formData.nationalId)) {
            newErrors.nationalId = 'رقم الهوية يجب أن يكون 10 أرقام';
        } else if (state.patients.some(p => p.nationalId === formData.nationalId)) {
            newErrors.nationalId = 'رقم الهوية موجود بالفعل';
        }
        
        if (!formData.nameAr.trim()) {
            newErrors.nameAr = 'اسم المريض مطلوب';
        }
        
        if (formData.phone && !/^0\d{9}$/.test(formData.phone)) {
            newErrors.phone = 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 0 و10 أرقام)';
        }
        
        if (formData.bradenScore && (isNaN(Number(formData.bradenScore)) || Number(formData.bradenScore) < 6 || Number(formData.bradenScore) > 23)) {
            newErrors.bradenScore = 'نقاط برادن يجب أن تكون بين 6 و 23';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            const newPatient: Patient = {
                nationalId: formData.nationalId,
                nameAr: formData.nameAr,
                phone: formData.phone || null,
                areaId: formData.areaId || null,
                status: 'active',
                level: formData.level || null,
                bradenScore: formData.bradenScore ? Number(formData.bradenScore) : null,
                minMonthlyRequired: formData.minMonthlyRequired ? Number(formData.minMonthlyRequired) : null,
                admissionDate: formData.admissionDate,
                gmapsUrl: false,
                sex: formData.sex,
                hasCatheter: formData.hasCatheter,
                ngTube: formData.ngTube,
                gTube: formData.gTube,
                fallHighRisk: formData.fallHighRisk,
                ivTherapy: formData.ivTherapy,
                ventSupport: formData.ventSupport,
                tags: [],
                assessments: [],
                contactAttempts: []
            };

            // Add patient to the state
            const updatedPatients = [...state.patients, newPatient];
            dispatch({ 
                type: 'IMPORT_STATE', 
                payload: { 
                    ...state, 
                    patients: updatedPatients,
                    selectedPatientIds: new Set()
                } 
            });

            onClose();
        } catch (error) {
            console.error('Error adding patient:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Plus className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">إضافة مريض جديد</h2>
                                <p className="text-sm text-gray-600">أدخل بيانات المريض الأساسية</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <User size={18} className="text-blue-600" />
                            المعلومات الأساسية
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    رقم الهوية *
                                </label>
                                <div className="relative">
                                    <Hash size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.nationalId}
                                        onChange={(e) => handleInputChange('nationalId', e.target.value)}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.nationalId ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="1234567890"
                                        maxLength={10}
                                    />
                                </div>
                                {errors.nationalId && <p className="text-red-500 text-xs mt-1">{errors.nationalId}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    اسم المريض *
                                </label>
                                <input
                                    type="text"
                                    value={formData.nameAr}
                                    onChange={(e) => handleInputChange('nameAr', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.nameAr ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="أدخل اسم المريض"
                                    dir="rtl"
                                />
                                {errors.nameAr && <p className="text-red-500 text-xs mt-1">{errors.nameAr}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    رقم الهاتف
                                </label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="0501234567"
                                        maxLength={10}
                                    />
                                </div>
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    المنطقة
                                </label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <select
                                        value={formData.areaId}
                                        onChange={(e) => handleInputChange('areaId', e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">اختر المنطقة</option>
                                        {state.areas.map(area => (
                                            <option key={area} value={area}>{area}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    الجنس
                                </label>
                                <select
                                    value={formData.sex}
                                    onChange={(e) => handleInputChange('sex', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="Male">ذكر</option>
                                    <option value="Female">أنثى</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    تاريخ القبول
                                </label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="date"
                                        value={formData.admissionDate}
                                        onChange={(e) => handleInputChange('admissionDate', e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medical Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Shield size={18} className="text-green-600" />
                            المعلومات الطبية
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    نقاط برادن
                                </label>
                                <input
                                    type="number"
                                    value={formData.bradenScore}
                                    onChange={(e) => handleInputChange('bradenScore', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.bradenScore ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="6-23"
                                    min="6"
                                    max="23"
                                />
                                {errors.bradenScore && <p className="text-red-500 text-xs mt-1">{errors.bradenScore}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    المستوى
                                </label>
                                <input
                                    type="text"
                                    value={formData.level}
                                    onChange={(e) => handleInputChange('level', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="1-4"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    الزيارات الشهرية المطلوبة
                                </label>
                                <input
                                    type="number"
                                    value={formData.minMonthlyRequired}
                                    onChange={(e) => handleInputChange('minMonthlyRequired', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="1-4"
                                    min="1"
                                    max="10"
                                />
                            </div>
                        </div>

                        {/* Medical Devices and Conditions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                الأجهزة والحالات الطبية
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {[
                                    { key: 'hasCatheter', label: 'قسطرة' },
                                    { key: 'ngTube', label: 'أنبوب أنفي' },
                                    { key: 'gTube', label: 'أنبوب معدي' },
                                    { key: 'fallHighRisk', label: 'خطر السقوط' },
                                    { key: 'ivTherapy', label: 'علاج وريدي' },
                                    { key: 'ventSupport', label: 'دعم تنفسي' }
                                ].map(item => (
                                    <label key={item.key} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData[item.key as keyof typeof formData] as boolean}
                                            onChange={(e) => handleInputChange(item.key, e.target.checked)}
                                            className="text-blue-600 focus:ring-blue-500 rounded"
                                        />
                                        <span className="text-sm">{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    جاري الحفظ...
                                </>
                            ) : (
                                <>
                                    <Plus size={16} />
                                    إضافة المريض
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPatientModal;