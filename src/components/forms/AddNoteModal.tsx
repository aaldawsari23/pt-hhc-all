import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { NoteType, Role } from '../../data/models';
import { repo } from '../../data/local/repo';
import { useAutosave } from '../../hooks/useAutosave';
import { SaveIndicator } from '../ui/SaveIndicator';

interface AddNoteModalProps {
  isOpen: boolean;
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const NOTE_TYPES: { value: NoteType; label: string }[] = [
  { value: 'general', label: 'عام' },
  { value: 'assessment', label: 'تقييم' },
  { value: 'contact', label: 'اتصال' },
  { value: 'plan', label: 'خطة' },
  { value: 'risk', label: 'خطر' },
  { value: 'system', label: 'نظام' },
];

const ROLES: { value: Role; label: string }[] = [
  { value: 'Physician', label: 'طبيب' },
  { value: 'Nurse', label: 'ممرض' },
  { value: 'PT', label: 'أخصائي علاج طبيعي' },
  { value: 'SW', label: 'أخصائي اجتماعي' },
  { value: 'Driver', label: 'سائق' },
  { value: 'Admin', label: 'إدارة' },
];

export function AddNoteModal({ isOpen, patientId, onClose, onSuccess }: AddNoteModalProps) {
  const [formData, setFormData] = useState({
    type: 'general' as NoteType,
    authorRole: 'Physician' as Role,
    authorName: '',
    text: '',
    tags: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.authorName.trim() || !formData.text.trim()) {
      setError('يرجى إدخال الاسم والنص');
      return;
    }

    try {
      setSaving(true);
      setError('');

      // Register role first to ensure name uniqueness
      await repo.upsertRole(formData.authorName.trim(), formData.authorRole);

      // Create note
      await repo.addNote({
        patientId,
        type: formData.type,
        authorRole: formData.authorRole,
        authorName: formData.authorName.trim(),
        text: formData.text.trim(),
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      });

      // Reset form and close
      setFormData({
        type: 'general',
        authorRole: 'Physician',
        authorName: '',
        text: '',
        tags: '',
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">إضافة نوت جديد</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نوع النوت
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as NoteType }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {NOTE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الدور
            </label>
            <select
              value={formData.authorRole}
              onChange={(e) => setFormData(prev => ({ ...prev, authorRole: e.target.value as Role }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ROLES.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اسم الكاتب *
            </label>
            <input
              type="text"
              value={formData.authorName}
              onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="مثال: د. أحمد محمد"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              العلامات (اختيارية)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="مثال: متابعة، جرح، ألم (مفصولة بفواصل)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              النص *
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="اكتب محتوى النوت هنا..."
              required
            />
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
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}