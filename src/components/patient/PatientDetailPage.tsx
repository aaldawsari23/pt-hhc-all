import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { TabLayout, SummaryTab, NotesTab } from '../tabs';
import { AddNoteModal } from '../forms/AddNoteModal';
import { PrintManager } from '../print/PrintManager';
import type { Patient } from '../../data/models';
import { repo } from '../../data/local/repo';

interface PatientDetailPageProps {
  patientId: string;
  onBack: () => void;
}

export function PatientDetailPage({ patientId, onBack }: PatientDetailPageProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [refreshNotes, setRefreshNotes] = useState(0);

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      const patientData = await repo.getPatient(patientId);
      setPatient(patientData);
    } catch (error) {
      console.error('Error loading patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = () => {
    setShowAddNoteModal(true);
  };

  const handleNoteAdded = () => {
    setRefreshNotes(prev => prev + 1);
  };

  const handleAddAssessment = () => {
    // TODO: Implement add assessment modal
    console.log('Add assessment for patient:', patientId);
  };

  const handleAddContact = () => {
    // TODO: Implement add contact modal
    console.log('Add contact for patient:', patientId);
  };

  const handleAddTask = () => {
    // TODO: Implement add task modal
    console.log('Add task for patient:', patientId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">جاري التحميل...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-gray-500 mb-4">لم يتم العثور على المريض</div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowRight className="w-4 h-4" />
          العودة
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowRight className="w-5 h-5" />
            العودة
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">{patient.name}</h1>
            <p className="text-sm text-gray-600">#{patient.mrn}</p>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="flex-1">
        <TabLayout patientId={patientId}>
          <SummaryTab
            tabId="summary"
            patient={patient}
            onAddNote={handleAddNote}
            onAddAssessment={handleAddAssessment}
            onAddContact={handleAddContact}
            onAddTask={handleAddTask}
          />
          <NotesTab tabId="notes" patientId={patientId} key={refreshNotes} />
          
          {/* Placeholder tabs */}
          <div tabId="assessments" className="p-6">
            <h3 className="text-lg font-semibold mb-4">التقييمات</h3>
            <p className="text-gray-600">سيتم تطوير هذا القسم قريباً...</p>
          </div>
          
          <div tabId="contacts" className="p-6">
            <h3 className="text-lg font-semibold mb-4">الاتصالات والمكالمات</h3>
            <p className="text-gray-600">سيتم تطوير هذا القسم قريباً...</p>
          </div>
          
          <div tabId="tasks" className="p-6">
            <h3 className="text-lg font-semibold mb-4">المهام والمتابعة</h3>
            <p className="text-gray-600">سيتم تطوير هذا القسم قريباً...</p>
          </div>
          
          <div tabId="files" className="p-6">
            <h3 className="text-lg font-semibold mb-4">الملفات والمرفقات</h3>
            <p className="text-gray-600">سيتم تطوير هذا القسم قريباً...</p>
          </div>
          
          <div tabId="print" className="h-full overflow-y-auto">
            <PrintManager patient={patient} />
          </div>
        </TabLayout>
      </div>

      {/* Modals */}
      <AddNoteModal
        isOpen={showAddNoteModal}
        patientId={patientId}
        onClose={() => setShowAddNoteModal(false)}
        onSuccess={handleNoteAdded}
      />
    </div>
  );
}