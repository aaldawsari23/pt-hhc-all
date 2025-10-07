import React, { useState, useEffect } from 'react';
import type { Patient, Note } from '../../../data/models';
import { repo } from '../../../data/local/repo';
import { PrintHeader, PrintFooter } from '../PrintHeader';

interface NotesSelectionTemplateProps {
  patient: Patient;
  options: {
    notesDateRange?: {
      from: string;
      to: string;
    };
    notesTypes?: string[];
  };
}

export function NotesSelectionTemplate({ patient, options }: NotesSelectionTemplateProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date().toLocaleDateString('ar-SA');

  useEffect(() => {
    loadNotes();
  }, [patient.id, options]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const allNotes = await repo.listNotes(patient.id);
      
      // Filter by date range if specified
      let filteredNotes = allNotes;
      if (options.notesDateRange?.from) {
        filteredNotes = filteredNotes.filter(note => {
          const noteDate = new Date(note.createdAt).toISOString().split('T')[0];
          return noteDate >= options.notesDateRange!.from;
        });
      }
      if (options.notesDateRange?.to) {
        filteredNotes = filteredNotes.filter(note => {
          const noteDate = new Date(note.createdAt).toISOString().split('T')[0];
          return noteDate <= options.notesDateRange!.to;
        });
      }

      // Filter by types if specified
      if (options.notesTypes && options.notesTypes.length > 0) {
        filteredNotes = filteredNotes.filter(note => 
          options.notesTypes!.includes(note.type)
        );
      }

      // Sort by date (newest first)
      filteredNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setNotes(filteredNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA') + ' ' + date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      general: 'عام',
      assessment: 'تقييم',
      contact: 'اتصال',
      plan: 'خطة',
      risk: 'خطر',
      system: 'نظام',
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p>جاري تحميل النوتات...</p>
      </div>
    );
  }

  return (
    <div className="print-page p-8 bg-white">
      {/* Header with Logo */}
      <PrintHeader 
        title="تقرير النوتات المختارة"
        subtitle={`المريض: ${patient.name} | عدد النوتات: ${notes.length}`}
        patientMRN={patient.mrn}
        showLogo={true}
      />

      {/* Patient Name */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900">{patient.name}</h2>
        <p className="text-gray-600">#{patient.mrn}</p>
      </div>

      {/* Filter Info */}
      {(options.notesDateRange?.from || options.notesDateRange?.to) && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-1">فترة التقرير:</h3>
          <p className="text-blue-800 text-sm">
            من {options.notesDateRange?.from || 'البداية'} إلى {options.notesDateRange?.to || 'النهاية'}
          </p>
        </div>
      )}

      {/* Notes */}
      {notes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>لا توجد نوتات في الفترة المحددة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note, index) => (
            <div key={note.id} className="border border-gray-200 rounded-lg p-4 break-inside-avoid">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {getTypeLabel(note.type)}
                  </span>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex gap-1">
                      {note.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>{formatDateTime(note.createdAt)}</p>
                  <p>{note.authorName} ({note.authorRole})</p>
                </div>
              </div>
              
              <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                {note.text}
              </div>

              {(note.linkedAssessmentId || note.linkedTaskId) && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex gap-2 text-xs text-blue-600">
                    {note.linkedAssessmentId && (
                      <span>مرتبط بتقييم #{note.linkedAssessmentId.split('_')[1]}</span>
                    )}
                    {note.linkedTaskId && (
                      <span>مرتبط بمهمة #{note.linkedTaskId.split('_')[1]}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <PrintFooter additionalInfo={`تقرير يحتوي على ${notes.length} نوتة للمريض خلال الفترة المحددة`} />

      <style jsx>{`
        @media print {
          .print-page {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 20mm;
            font-size: 11pt;
            line-height: 1.3;
          }
          
          body {
            margin: 0;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}