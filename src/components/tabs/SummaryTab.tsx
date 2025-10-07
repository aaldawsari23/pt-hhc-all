import React from 'react';
import { Plus, AlertTriangle, Calendar, Phone } from 'lucide-react';
import type { Patient } from '../../data/models';

interface SummaryTabProps {
  tabId: string;
  patient: Patient;
  onAddNote: () => void;
  onAddAssessment: () => void;
  onAddContact: () => void;
  onAddTask: () => void;
}

export function SummaryTab({ 
  patient, 
  onAddNote, 
  onAddAssessment, 
  onAddContact, 
  onAddTask 
}: SummaryTabProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Patient Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
            <p className="text-gray-600">#{patient.mrn}</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>آخر زيارة: {patient.lastVisit || 'لم تحدد'}</p>
            <p>تاريخ الميلاد: {patient.dob || 'غير متوفر'}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex items-center gap-4 mb-4">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">
            {patient.phones?.join(', ') || 'لا يوجد رقم'}
          </span>
        </div>

        {/* Red Flags */}
        {patient.redFlags && patient.redFlags.length > 0 && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">تحذيرات مهمة</h4>
              <ul className="text-sm text-red-700 mt-1">
                {patient.redFlags.map((flag, index) => (
                  <li key={index} className="flex items-center gap-2">
                    • {flag}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Diagnoses */}
        {patient.diagnoses && patient.diagnoses.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-800 mb-2">التشخيصات</h4>
            <div className="flex flex-wrap gap-2">
              {patient.diagnoses.map((diagnosis, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {diagnosis}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {patient.tags && patient.tags.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-800 mb-2">العلامات</h4>
            <div className="flex flex-wrap gap-2">
              {patient.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={onAddNote}
          className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-5 h-5 text-blue-600" />
          <span className="text-blue-800 font-medium">إضافة نوت</span>
        </button>
        
        <button
          onClick={onAddAssessment}
          className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
        >
          <Plus className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">تقييم جديد</span>
        </button>
        
        <button
          onClick={onAddContact}
          className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
        >
          <Plus className="w-5 h-5 text-yellow-600" />
          <span className="text-yellow-800 font-medium">تسجيل اتصال</span>
        </button>
        
        <button
          onClick={onAddTask}
          className="flex items-center gap-2 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <Plus className="w-5 h-5 text-purple-600" />
          <span className="text-purple-800 font-medium">مهمة جديدة</span>
        </button>
      </div>

      {/* Recent Activity Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">النشاط الأخير</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">لم يتم تسجيل أي نشاط بعد</span>
          </div>
        </div>
      </div>
    </div>
  );
}