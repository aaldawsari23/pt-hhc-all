import React, { useState } from 'react';
import { X, Save, User, Phone, MapPin, FileText, ExternalLink } from 'lucide-react';
import { repo } from '../../data/local/repo';

interface SimpleAddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SimpleAddPatientModal({ isOpen, onClose, onSuccess }: SimpleAddPatientModalProps) {
  const [formData, setFormData] = useState({
    // معلومات المريض الأساسية
    name: '',
    mrn: '',
    dob: '',
    phones: [''],
    address: '',
    
    // معلومات ذوي المريض
    emergencyContact: '',
    emergencyPhone: '',
    relationship: '',
    
    // معلومات التحويل والتشخيص
    referredFrom: '',
    medicalDiagnosis: '',
    referralReason: '',
    
    // رابط قوقل ماب
    googleMapsUrl: '',
    
    // أسئلة مهمة لتسجيل الحالة
    canWalk: 'yes', // هل يستطيع المشي؟
    needsWheelchair: 'no', // يحتاج كرسي متحرك؟
    hasCaregiver: 'yes', // يوجد مُعيل/مُرافق؟
    livingArrangement: 'family', // family, alone, caregiver
    transportationAvailable: 'yes', // وسيلة نقل متوفرة؟
    homeAccessible: 'yes', // المنزل قابل للوصول؟
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...formData.phones];
    newPhones[index] = value;
    setFormData(prev => ({ ...prev, phones: newPhones }));
  };

  const addPhone = () => {
    setFormData(prev => ({ ...prev, phones: [...prev.phones, ''] }));
  };

  const removePhone = (index: number) => {
    if (formData.phones.length > 1) {
      const newPhones = formData.phones.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, phones: newPhones }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.mrn.trim()) {
      setError('الاسم ورقم الملف مطلوبان');
      return;
    }

    try {
      setSaving(true);
      setError('');

      // تحديد العلامات بناءً على الإجابات
      const tags = [];
      if (formData.canWalk === 'no') tags.push('غير قادر على المشي');
      if (formData.needsWheelchair === 'yes') tags.push('يحتاج كرسي متحرك');
      if (formData.hasCaregiver === 'no') tags.push('بدون مرافق');
      if (formData.livingArrangement === 'alone') tags.push('يعيش بمفرده');
      if (formData.transportationAvailable === 'no') tags.push('لا يوجد نقل');
      if (formData.homeAccessible === 'no') tags.push('منزل غير مهيأ');

      // تحديد التحذيرات المهمة
      const redFlags = [];
      if (formData.canWalk === 'no' && formData.hasCaregiver === 'no') {
        redFlags.push('مريض غير قادر على المشي وبدون مرافق');
      }
      if (formData.livingArrangement === 'alone' && formData.canWalk === 'no') {
        redFlags.push('يعيش بمفرده وغير قادر على المشي');
      }
      if (formData.transportationAvailable === 'no') {
        redFlags.push('لا توجد وسيلة نقل متاحة');
      }

      const patient = {
        name: formData.name.trim(),
        mrn: formData.mrn.trim(),
        dob: formData.dob || undefined,
        phones: formData.phones.filter(p => p.trim()),
        address: formData.address.trim() || undefined,
        tags,
        redFlags: redFlags.length > 0 ? redFlags : undefined,
      };

      await repo.addPatient(patient);

      // إضافة نوت أولي يحتوي على معلومات التسجيل
      const registrationNote = `
تم تسجيل المريض في الرعاية المنزلية

المعلومات الأساسية:
• محول من: ${formData.referredFrom || 'غير محدد'}
• التشخيص الطبي: ${formData.medicalDiagnosis || 'غير محدد'}
• سبب التحويل: ${formData.referralReason || 'غير محدد'}

معلومات ذوي المريض:
• جهة الاتصال الطارئ: ${formData.emergencyContact || 'غير محدد'}
• رقم الهاتف: ${formData.emergencyPhone || 'غير محدد'}
• صلة القرابة: ${formData.relationship || 'غير محدد'}

تقييم الوضع السكني والحركي:
• يستطيع المشي: ${formData.canWalk === 'yes' ? 'نعم' : 'لا'}
• يحتاج كرسي متحرك: ${formData.needsWheelchair === 'yes' ? 'نعم' : 'لا'}
• يوجد مُرافق/مُعيل: ${formData.hasCaregiver === 'yes' ? 'نعم' : 'لا'}
• الترتيب السكني: ${formData.livingArrangement === 'family' ? 'مع الأسرة' : formData.livingArrangement === 'alone' ? 'يعيش بمفرده' : 'مع مُرافق'}
• وسيلة نقل متوفرة: ${formData.transportationAvailable === 'yes' ? 'نعم' : 'لا'}
• المنزل قابل للوصول: ${formData.homeAccessible === 'yes' ? 'نعم' : 'لا'}

${formData.googleMapsUrl ? `رابط الموقع: ${formData.googleMapsUrl}` : ''}
      `.trim();

      await repo.addNote({
        patientId: patient.id,
        type: 'system',
        authorRole: 'Admin',
        authorName: 'نظام التسجيل',
        text: registrationNote,
        tags: ['تسجيل', 'معلومات أولية'],
      });

      // إعادة تعيين النموذج
      setFormData({
        name: '', mrn: '', dob: '', phones: [''], address: '',
        emergencyContact: '', emergencyPhone: '', relationship: '',
        referredFrom: '', medicalDiagnosis: '', referralReason: '',
        googleMapsUrl: '',
        canWalk: 'yes', needsWheelchair: 'no', hasCaregiver: 'yes',
        livingArrangement: 'family', transportationAvailable: 'yes', homeAccessible: 'yes',
      });

      onSuccess();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">إضافة مريض جديد</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* معلومات المريض الأساسية */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium text-gray-900">
              <User className="w-4 h-4" />
              معلومات المريض الأساسية
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المريض *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="اسم المريض الكامل"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الملف *
                </label>
                <input
                  type="text"
                  value={formData.mrn}
                  onChange={(e) => setFormData(prev => ({ ...prev, mrn: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="مثال: KAH-2024-001"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ الميلاد
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* أرقام الهاتف */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                أرقام الهاتف
              </label>
              {formData.phones.map((phone, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="05xxxxxxxx"
                  />
                  {formData.phones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhone(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      حذف
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPhone}
                className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-sm"
              >
                + إضافة رقم آخر
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                العنوان
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="العنوان الكامل"
              />
            </div>
          </div>

          {/* معلومات ذوي المريض */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium text-gray-900">
              <Phone className="w-4 h-4" />
              معلومات ذوي المريض
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  جهة الاتصال الطارئ
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="اسم جهة الاتصال"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="05xxxxxxxx"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  صلة القرابة
                </label>
                <select
                  value={formData.relationship}
                  onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">اختر صلة القرابة</option>
                  <option value="ابن">ابن</option>
                  <option value="ابنة">ابنة</option>
                  <option value="زوج">زوج</option>
                  <option value="زوجة">زوجة</option>
                  <option value="أخ">أخ</option>
                  <option value="أخت">أخت</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
            </div>
          </div>

          {/* التحويل والتشخيص */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium text-gray-900">
              <FileText className="w-4 h-4" />
              التحويل والتشخيص الطبي
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  محول من
                </label>
                <input
                  type="text"
                  value={formData.referredFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, referredFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="مثال: مستشفى الملك عبدالله"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  سبب التحويل
                </label>
                <input
                  type="text"
                  value={formData.referralReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, referralReason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="مثال: رعاية ما بعد العملية"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                التشخيص الطبي
              </label>
              <textarea
                value={formData.medicalDiagnosis}
                onChange={(e) => setFormData(prev => ({ ...prev, medicalDiagnosis: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="التشخيص الطبي الحالي"
              />
            </div>
          </div>

          {/* رابط قوقل ماب */}
          <div>
            <h4 className="flex items-center gap-2 font-medium text-gray-900 mb-2">
              <ExternalLink className="w-4 h-4" />
              رابط الموقع
            </h4>
            <input
              type="url"
              value={formData.googleMapsUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, googleMapsUrl: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="رابط قوقل ماب للوصول المباشر"
            />
          </div>

          {/* أسئلة مهمة للتسجيل */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">أسئلة تقييم الحالة</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  هل يستطيع المريض المشي؟
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="canWalk"
                      value="yes"
                      checked={formData.canWalk === 'yes'}
                      onChange={(e) => setFormData(prev => ({ ...prev, canWalk: e.target.value }))}
                      className="mr-2"
                    />
                    نعم، يستطيع المشي
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="canWalk"
                      value="no"
                      checked={formData.canWalk === 'no'}
                      onChange={(e) => setFormData(prev => ({ ...prev, canWalk: e.target.value }))}
                      className="mr-2"
                    />
                    لا، غير قادر على المشي
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  هل يحتاج كرسي متحرك؟
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="needsWheelchair"
                      value="yes"
                      checked={formData.needsWheelchair === 'yes'}
                      onChange={(e) => setFormData(prev => ({ ...prev, needsWheelchair: e.target.value }))}
                      className="mr-2"
                    />
                    نعم، يحتاج كرسي متحرك
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="needsWheelchair"
                      value="no"
                      checked={formData.needsWheelchair === 'no'}
                      onChange={(e) => setFormData(prev => ({ ...prev, needsWheelchair: e.target.value }))}
                      className="mr-2"
                    />
                    لا، لا يحتاج
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  هل يوجد مُرافق أو مُعيل؟
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasCaregiver"
                      value="yes"
                      checked={formData.hasCaregiver === 'yes'}
                      onChange={(e) => setFormData(prev => ({ ...prev, hasCaregiver: e.target.value }))}
                      className="mr-2"
                    />
                    نعم، يوجد مُرافق
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasCaregiver"
                      value="no"
                      checked={formData.hasCaregiver === 'no'}
                      onChange={(e) => setFormData(prev => ({ ...prev, hasCaregiver: e.target.value }))}
                      className="mr-2"
                    />
                    لا، بدون مُرافق
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الترتيب السكني
                </label>
                <select
                  value={formData.livingArrangement}
                  onChange={(e) => setFormData(prev => ({ ...prev, livingArrangement: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="family">مع الأسرة</option>
                  <option value="alone">يعيش بمفرده</option>
                  <option value="caregiver">مع مُرافق</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  هل توجد وسيلة نقل متاحة؟
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="transportationAvailable"
                      value="yes"
                      checked={formData.transportationAvailable === 'yes'}
                      onChange={(e) => setFormData(prev => ({ ...prev, transportationAvailable: e.target.value }))}
                      className="mr-2"
                    />
                    نعم، متوفرة
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="transportationAvailable"
                      value="no"
                      checked={formData.transportationAvailable === 'no'}
                      onChange={(e) => setFormData(prev => ({ ...prev, transportationAvailable: e.target.value }))}
                      className="mr-2"
                    />
                    لا، غير متوفرة
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  هل المنزل قابل للوصول؟
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="homeAccessible"
                      value="yes"
                      checked={formData.homeAccessible === 'yes'}
                      onChange={(e) => setFormData(prev => ({ ...prev, homeAccessible: e.target.value }))}
                      className="mr-2"
                    />
                    نعم، قابل للوصول
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="homeAccessible"
                      value="no"
                      checked={formData.homeAccessible === 'no'}
                      onChange={(e) => setFormData(prev => ({ ...prev, homeAccessible: e.target.value }))}
                      className="mr-2"
                    />
                    لا، يوجد عوائق
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={saving}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'جاري الحفظ...' : 'حفظ المريض'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}