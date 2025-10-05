import React, { useState } from 'react';
import { Phone, PhoneOff, DoorClosed, Clock, MessageSquare, Calendar, X, Check, AlertCircle } from 'lucide-react';
import { ContactAttempt } from '../types';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';

interface EnhancedContactManagerProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
}

type ContactType = ContactAttempt['type'];
type ContactMethod = ContactAttempt['contactMethod'];
type ContactOutcome = ContactAttempt['outcome'];

const contactTypes: { value: ContactType; label: string; labelAr: string; icon: React.ElementType; color: string }[] = [
  { value: 'Phone Answered', label: 'Phone Answered', labelAr: 'تم الرد على الهاتف', icon: Phone, color: 'green' },
  { value: 'No Answer', label: 'No Answer', labelAr: 'لا يوجد رد', icon: PhoneOff, color: 'yellow' },
  { value: 'Door Not Opened', label: 'Door Not Opened', labelAr: 'لم يتم فتح الباب', icon: DoorClosed, color: 'orange' },
  { value: 'Family Answered', label: 'Family Answered', labelAr: 'رد أحد أفراد الأسرة', icon: Phone, color: 'blue' },
  { value: 'Busy', label: 'Line Busy', labelAr: 'الخط مشغول', icon: Phone, color: 'red' },
  { value: 'Phone Off', label: 'Phone Turned Off', labelAr: 'الهاتف مغلق', icon: PhoneOff, color: 'gray' },
  { value: 'Wrong Number', label: 'Wrong Number', labelAr: 'رقم خاطئ', icon: AlertCircle, color: 'red' },
  { value: 'Patient Not Available', label: 'Patient Not Available', labelAr: 'المريض غير متاح', icon: Clock, color: 'yellow' },
  { value: 'Rescheduled', label: 'Rescheduled', labelAr: 'تم إعادة الجدولة', icon: Calendar, color: 'blue' },
  { value: 'Refused Visit', label: 'Refused Visit', labelAr: 'رفض الزيارة', icon: X, color: 'red' }
];

const contactMethods: { value: ContactMethod; label: string; labelAr: string; icon: React.ElementType }[] = [
  { value: 'Phone Call', label: 'Phone Call', labelAr: 'مكالمة هاتفية', icon: Phone },
  { value: 'Home Visit', label: 'Home Visit', labelAr: 'زيارة منزلية', icon: DoorClosed },
  { value: 'WhatsApp', label: 'WhatsApp', labelAr: 'واتساب', icon: MessageSquare },
  { value: 'SMS', label: 'SMS', labelAr: 'رسالة نصية', icon: MessageSquare }
];

const contactOutcomes: { value: ContactOutcome; label: string; labelAr: string; color: string }[] = [
  { value: 'Successful', label: 'Successful', labelAr: 'نجح', color: 'green' },
  { value: 'Failed', label: 'Failed', labelAr: 'فشل', color: 'red' },
  { value: 'Rescheduled', label: 'Rescheduled', labelAr: 'مُجدول مجدداً', color: 'blue' },
  { value: 'Cancelled', label: 'Cancelled', labelAr: 'ملغي', color: 'gray' }
];

const EnhancedContactManager: React.FC<EnhancedContactManagerProps> = ({ 
  patientId, 
  patientName, 
  onClose 
}) => {
  const { state, dispatch } = useHomeHealthcare();
  const [selectedType, setSelectedType] = useState<ContactType>('Phone Answered');
  const [selectedMethod, setSelectedMethod] = useState<ContactMethod>('Phone Call');
  const [selectedOutcome, setSelectedOutcome] = useState<ContactOutcome>('Successful');
  const [notes, setNotes] = useState('');
  const [callDuration, setCallDuration] = useState<number | ''>('');
  const [nextAttemptDate, setNextAttemptDate] = useState('');
  const [nextAttemptTime, setNextAttemptTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const currentUser = state.staff.find(s => s.الاسم.includes('')) || { الاسم: 'System User' };

  const handleSubmit = async () => {
    setIsSaving(true);
    
    const contactAttempt: ContactAttempt = {
      date: new Date().toISOString(),
      type: selectedType,
      staffName: currentUser.الاسم,
      notes: notes.trim() || undefined,
      callDuration: typeof callDuration === 'number' ? callDuration : undefined,
      nextAttemptScheduled: nextAttemptDate && nextAttemptTime 
        ? new Date(`${nextAttemptDate}T${nextAttemptTime}`).toISOString()
        : undefined,
      outcome: selectedOutcome,
      contactMethod: selectedMethod
    };

    dispatch({
      type: 'LOG_CONTACT_ATTEMPT',
      payload: { patientId, contactAttempt }
    });

    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsSaving(false);
    onClose();
  };

  const selectedTypeInfo = contactTypes.find(ct => ct.value === selectedType);
  const selectedMethodInfo = contactMethods.find(cm => cm.value === selectedMethod);
  const selectedOutcomeInfo = contactOutcomes.find(co => co.value === selectedOutcome);

  const shouldShowDuration = selectedMethod === 'Phone Call' && selectedType === 'Phone Answered';
  const shouldShowNextAttempt = selectedOutcome === 'Rescheduled' || selectedType === 'No Answer' || selectedType === 'Busy';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Phone className="text-orange-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Contact Attempt</h2>
              <p className="text-sm text-gray-600">محاولة التواصل - {patientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Method */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Contact Method | طريقة التواصل
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {contactMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.value}
                    onClick={() => setSelectedMethod(method.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedMethod === method.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedMethod === method.value 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900">{method.label}</h4>
                        <p className="text-sm text-gray-600">{method.labelAr}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Type */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Contact Result | نتيجة التواصل
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contactTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedType === type.value
                        ? `border-${type.color}-500 bg-${type.color}-50`
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${
                        selectedType === type.value 
                          ? `bg-${type.color}-500 text-white` 
                          : `bg-${type.color}-100 text-${type.color}-600`
                      }`}>
                        <Icon size={14} />
                      </div>
                      <div className="text-left flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{type.label}</h4>
                        <p className="text-xs text-gray-600">{type.labelAr}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Outcome */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Overall Outcome | النتيجة العامة
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {contactOutcomes.map((outcome) => (
                <button
                  key={outcome.value}
                  onClick={() => setSelectedOutcome(outcome.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedOutcome === outcome.value
                      ? `border-${outcome.color}-500 bg-${outcome.color}-50`
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                      selectedOutcome === outcome.value 
                        ? `bg-${outcome.color}-500` 
                        : `bg-${outcome.color}-300`
                    }`}></div>
                    <h4 className="font-medium text-gray-900 text-sm">{outcome.label}</h4>
                    <p className="text-xs text-gray-600">{outcome.labelAr}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Call Duration */}
          {shouldShowDuration && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Call Duration (minutes) | مدة المكالمة (دقائق)
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={callDuration}
                onChange={(e) => setCallDuration(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="5"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          )}

          {/* Next Attempt Scheduling */}
          {shouldShowNextAttempt && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Schedule Next Attempt | جدولة المحاولة التالية
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date | التاريخ
                  </label>
                  <input
                    type="date"
                    value={nextAttemptDate}
                    onChange={(e) => setNextAttemptDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time | الوقت
                  </label>
                  <input
                    type="time"
                    value={nextAttemptTime}
                    onChange={(e) => setNextAttemptTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes | ملاحظات إضافية
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add any additional details about the contact attempt..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Summary | الملخص</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="font-medium">{selectedMethodInfo?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Result:</span>
                <span className="font-medium">{selectedTypeInfo?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Outcome:</span>
                <span className={`font-medium text-${selectedOutcomeInfo?.color}-600`}>
                  {selectedOutcomeInfo?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Staff:</span>
                <span className="font-medium">{currentUser.الاسم}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 transition-all"
          >
            Cancel | إلغاء
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Check size={16} />
                Save Contact Attempt | حفظ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedContactManager;