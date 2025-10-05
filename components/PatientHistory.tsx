import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { FileText, Download, Eye, Calendar, User, Clock } from 'lucide-react';

interface SavedAssessment {
  id: string;
  patientId: string;
  date: string;
  role: string;
  type: 'Assessment' | 'Card' | 'Report';
  data: any;
  createdBy: string;
}

interface PatientHistoryProps {
  patient: Patient;
  onClose: () => void;
}

const PatientHistory: React.FC<PatientHistoryProps> = ({ patient, onClose }) => {
  const [savedAssessments, setSavedAssessments] = useState<SavedAssessment[]>([]);
  const [selectedType, setSelectedType] = useState<'all' | 'Assessment' | 'Card' | 'Report'>('all');

  useEffect(() => {
    // Load saved assessments from localStorage for demo
    const loadSavedAssessments = () => {
      const saved = localStorage.getItem(`patient_history_${patient.nationalId}`);
      if (saved) {
        setSavedAssessments(JSON.parse(saved));
      } else {
        // Demo data
        const demoData: SavedAssessment[] = [
          {
            id: '1',
            patientId: patient.nationalId,
            date: '2024-01-15',
            role: 'Nurse',
            type: 'Assessment',
            data: { vitals: { bp: '120/80', hr: '72' }, notes: 'تقييم ممرض - حالة مستقرة' },
            createdBy: 'ممرض أحمد محمد'
          },
          {
            id: '2',
            patientId: patient.nationalId,
            date: '2024-01-10',
            role: 'Doctor',
            type: 'Assessment',
            data: { diagnosis: 'متابعة روتينية', plan: 'استمرار العلاج' },
            createdBy: 'د. فاطمة السعد'
          },
          {
            id: '3',
            patientId: patient.nationalId,
            date: '2024-01-08',
            role: 'System',
            type: 'Card',
            data: { printed: true },
            createdBy: 'النظام'
          }
        ];
        setSavedAssessments(demoData);
        localStorage.setItem(`patient_history_${patient.nationalId}`, JSON.stringify(demoData));
      }
    };

    loadSavedAssessments();
  }, [patient.nationalId]);

  const filteredAssessments = selectedType === 'all' 
    ? savedAssessments 
    : savedAssessments.filter(assessment => assessment.type === selectedType);

  const saveNewAssessment = (type: 'Assessment' | 'Card' | 'Report', data: any, role: string) => {
    const newAssessment: SavedAssessment = {
      id: Date.now().toString(),
      patientId: patient.nationalId,
      date: new Date().toISOString().split('T')[0],
      role,
      type,
      data,
      createdBy: `${role} - المستخدم الحالي`
    };

    const updated = [newAssessment, ...savedAssessments];
    setSavedAssessments(updated);
    localStorage.setItem(`patient_history_${patient.nationalId}`, JSON.stringify(updated));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Assessment': return <FileText size={16} className="text-blue-600" />;
      case 'Card': return <User size={16} className="text-green-600" />;
      case 'Report': return <Download size={16} className="text-purple-600" />;
      default: return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Assessment': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'Card': return 'bg-green-50 border-green-200 text-green-800';
      case 'Report': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-800">سجل المريض</h2>
              <p className="text-sm text-gray-600">{patient.nameAr} - {patient.nationalId}</p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'Assessment', 'Card', 'Report'] as const).map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'الكل' : 
                 type === 'Assessment' ? 'التقييمات' :
                 type === 'Card' ? 'البطاقات' : 'التقارير'}
                <span className="mr-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                  {type === 'all' ? savedAssessments.length : savedAssessments.filter(a => a.type === type).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p>لا توجد سجلات متاحة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAssessments.map(assessment => (
                <div key={assessment.id} className={`border rounded-lg p-4 ${getTypeColor(assessment.type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getTypeIcon(assessment.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-sm">
                            {assessment.type === 'Assessment' ? 'تقييم طبي' :
                             assessment.type === 'Card' ? 'بطاقة مريض' : 'تقرير'}
                          </h3>
                          <span className="text-xs px-2 py-0.5 bg-white bg-opacity-50 rounded-full">
                            {assessment.role}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(assessment.date).toLocaleDateString('ar-SA')}
                          </div>
                          <div className="flex items-center gap-1">
                            <User size={12} />
                            {assessment.createdBy}
                          </div>
                        </div>

                        {/* Preview of data */}
                        <div className="text-xs bg-white bg-opacity-30 rounded p-2">
                          {assessment.type === 'Assessment' && assessment.data.notes && (
                            <p className="truncate">{assessment.data.notes}</p>
                          )}
                          {assessment.type === 'Assessment' && assessment.data.vitals && (
                            <p>العلامات الحيوية: {Object.entries(assessment.data.vitals).map(([key, value]) => `${key}: ${value}`).join(', ')}</p>
                          )}
                          {assessment.type === 'Card' && (
                            <p>تم إنشاء وطباعة بطاقة المريض</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <button
                        title="عرض التفاصيل"
                        className="p-2 rounded hover:bg-white hover:bg-opacity-30 transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        title="تحميل"
                        className="p-2 rounded hover:bg-white hover:bg-opacity-30 transition-colors"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-xs text-gray-500">
          <p>جميع السجلات محفوظة ومشفرة وفقاً لمعايير الأمان الطبي</p>
        </div>
      </div>
    </div>
  );
};

export default PatientHistory;