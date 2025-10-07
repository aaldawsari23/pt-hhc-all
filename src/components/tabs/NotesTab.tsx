import React, { useState, useEffect, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Search, Filter, Plus, MessageSquare, Calendar, User, Tag } from 'lucide-react';
import type { Note, NoteType, Role } from '../../data/models';
import { repo } from '../../data/local/repo';

interface NotesTabProps {
  tabId: string;
  patientId: string;
}

interface NoteFilters {
  type: NoteType | 'all';
  author: string;
  dateFrom: string;
  dateTo: string;
  tags: string[];
  search: string;
}

const NOTE_TYPES: { value: NoteType | 'all'; label: string }[] = [
  { value: 'all', label: 'جميع الأنواع' },
  { value: 'general', label: 'عام' },
  { value: 'assessment', label: 'تقييم' },
  { value: 'contact', label: 'اتصال' },
  { value: 'plan', label: 'خطة' },
  { value: 'risk', label: 'خطر' },
  { value: 'system', label: 'نظام' },
];

export function NotesTab({ patientId }: NotesTabProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState<NoteFilters>({
    type: 'all',
    author: '',
    dateFrom: '',
    dateTo: '',
    tags: [],
    search: ''
  });

  // Load notes
  useEffect(() => {
    loadNotes();
  }, [patientId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const allNotes = await repo.listNotes(patientId);
      setNotes(allNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      if (filters.type !== 'all' && note.type !== filters.type) return false;
      if (filters.author && !note.authorName.includes(filters.author)) return false;
      if (filters.search && !note.text.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.dateFrom) {
        const noteDate = new Date(note.createdAt).toISOString().split('T')[0];
        if (noteDate < filters.dateFrom) return false;
      }
      if (filters.dateTo) {
        const noteDate = new Date(note.createdAt).toISOString().split('T')[0];
        if (noteDate > filters.dateTo) return false;
      }
      return true;
    });
  }, [notes, filters]);

  const getTypeColor = (type: NoteType) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      assessment: 'bg-blue-100 text-blue-800',
      contact: 'bg-yellow-100 text-yellow-800',
      plan: 'bg-green-100 text-green-800',
      risk: 'bg-red-100 text-red-800',
      system: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || colors.general;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA') + ' ' + date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Note item component for virtualization
  const NoteItem = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const note = filteredNotes[index];
    return (
      <div style={style} className="px-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(note.type)}`}>
                {NOTE_TYPES.find(t => t.value === note.type)?.label || note.type}
              </span>
              {note.tags && note.tags.length > 0 && (
                <div className="flex gap-1">
                  {note.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(note.createdAt)}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{note.authorName} ({note.authorRole})</span>
          </div>

          <div className="text-gray-900 whitespace-pre-wrap">
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
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="البحث في النوتات..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as NoteType | 'all' }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {NOTE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="من تاريخ"
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="إلى تاريخ"
            />
          </div>

          {/* Add Note Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة نوت
          </button>
        </div>
      </div>

      {/* Notes List with Virtualization */}
      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">جاري التحميل...</div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <MessageSquare className="w-8 h-8 mb-2" />
            <p>لا توجد نوتات</p>
          </div>
        ) : (
          <List
            height={window.innerHeight - 200} // Adjust based on header/toolbar height
            itemCount={filteredNotes.length}
            itemSize={200} // Approximate height per note
            className="notes-list"
          >
            {NoteItem}
          </List>
        )}
      </div>

      {/* Add Note Modal - TODO: Implement */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">إضافة نوت جديد</h3>
            <p className="text-gray-600 mb-4">سيتم تطوير هذه الميزة قريباً...</p>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}