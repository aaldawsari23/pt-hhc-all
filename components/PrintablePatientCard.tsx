import React from 'react';
import { Patient } from '../types';
import { QrCode } from 'lucide-react';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';

interface PrintablePatientCardProps {
  patient: Patient;
  onClose: () => void;
}

const PrintablePatientCard: React.FC<PrintablePatientCardProps> = ({ patient, onClose }) => {
  const { state } = useHomeHealthcare();
  const handlePrint = () => {
    window.print();
  };

  // Get current user based on role
  const getCurrentUser = () => {
    const roleMap = {
      'Doctor': 'طبيب',
      'Nurse': 'ممرض',
      'Physical Therapist': 'أخصائي علاج طبيعي',
      'Social Worker': 'أخصائي اجتماعي'
    };
    return state.staff.find(s => s.المهنة === roleMap[state.currentRole]) || state.staff[0];
  };

  const currentUser = getCurrentUser();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Print Controls - Hidden in print */}
        <div className="no-print p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">طباعة بطاقة المريض</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              طباعة
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="print-page p-8">
          {/* Header */}
          <div className="text-center mb-8 print-header">
            <img 
              src="/logo.png" 
              alt="Aseer Health Cluster Logo" 
              className="h-16 mx-auto mb-4"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <h1 className="text-2xl font-bold text-blue-800 mb-2">
              تجمع عسير الصحي – مستشفى الملك عبدالله ببيشة
            </h1>
            <h2 className="text-lg text-gray-600 mb-1">
              Aseer Health Cluster – King Abdullah Hospital, Bishah
            </h2>
            <h3 className="text-base text-blue-600 font-semibold">
              الرعاية الصحية المنزلية - Home Healthcare Department
            </h3>
          </div>

          {/* Patient Information Card */}
          <div className="border-2 border-blue-600 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">بيانات المريض</h2>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-bold text-blue-800">الاسم:</span>
                    <span className="mr-2 text-lg font-semibold">{patient.nameAr}</span>
                  </div>
                  
                  <div>
                    <span className="font-bold text-blue-800">رقم الهوية:</span>
                    <span className="mr-2 font-mono">{patient.nationalId}</span>
                  </div>
                  
                  <div>
                    <span className="font-bold text-blue-800">الجنس:</span>
                    <span className="mr-2">{patient.sex === 'Male' ? 'ذكر' : 'أنثى'}</span>
                  </div>
                  
                  <div>
                    <span className="font-bold text-blue-800">العمر:</span>
                    <span className="mr-2">{patient.age || 'غير محدد'}</span>
                  </div>
                  
                  <div>
                    <span className="font-bold text-blue-800">رقم الجوال:</span>
                    <span className="mr-2 font-mono" dir="ltr">{patient.phone || 'غير محدد'}</span>
                  </div>
                  
                  <div>
                    <span className="font-bold text-blue-800">المنطقة:</span>
                    <span className="mr-2">{patient.areaId || 'غير محدد'}</span>
                  </div>
                  
                  <div className="col-span-2">
                    <span className="font-bold text-blue-800">العنوان:</span>
                    <span className="mr-2">{patient.address || 'غير محدد'}</span>
                  </div>
                  
                  <div className="col-span-2">
                    <span className="font-bold text-blue-800">التشخيص الطبي:</span>
                    <span className="mr-2">{patient.medicalDiagnosis || 'غير محدد'}</span>
                  </div>
                  
                  <div>
                    <span className="font-bold text-blue-800">تاريخ القبول:</span>
                    <span className="mr-2">{patient.admissionDate || 'غير محدد'}</span>
                  </div>
                  
                  <div>
                    <span className="font-bold text-blue-800">نقاط برادن:</span>
                    <span className="mr-2 font-bold text-lg">{patient.bradenScore || 'غير محدد'}</span>
                  </div>
                </div>
              </div>

              {/* QR Code for Patient Location */}
              <div className="flex flex-col items-center ml-6">
                <div className="w-32 h-32 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <QrCode size={80} className="text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">باركود موقع المريض</p>
              </div>
            </div>

            {/* Medical Tags */}
            {patient.tags && patient.tags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="font-bold text-blue-800 block mb-2">الحالات الطبية:</span>
                <div className="flex flex-wrap gap-2">
                  {patient.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="print-footer text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-200">
            <p>تم إنشاء هذه البطاقة بواسطة: {currentUser.الاسم} - {currentUser.المهنة}</p>
            <p>تاريخ الإنشاء: {new Date().toLocaleDateString('ar-SA')}</p>
            <p>نظام إدارة الرعاية الصحية المنزلية - الإصدار 1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintablePatientCard;