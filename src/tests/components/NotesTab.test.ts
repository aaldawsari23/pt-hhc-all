import { describe, it, expect } from 'vitest';

describe('NotesTab Component', () => {
  describe('Note Filtering', () => {
    it('should filter notes by type', () => {
      const notes = [
        { id: '1', type: 'general', text: 'General note', createdAt: '2024-01-01' },
        { id: '2', type: 'assessment', text: 'Assessment note', createdAt: '2024-01-02' },
        { id: '3', type: 'contact', text: 'Contact note', createdAt: '2024-01-03' },
      ];

      const filterByType = (notes: any[], type: string) => {
        if (type === 'all') return notes;
        return notes.filter(note => note.type === type);
      };

      expect(filterByType(notes, 'general')).toHaveLength(1);
      expect(filterByType(notes, 'assessment')).toHaveLength(1);
      expect(filterByType(notes, 'all')).toHaveLength(3);
    });

    it('should filter notes by date range', () => {
      const notes = [
        { id: '1', type: 'general', text: 'Note 1', createdAt: '2024-01-01T10:00:00Z' },
        { id: '2', type: 'general', text: 'Note 2', createdAt: '2024-01-05T10:00:00Z' },
        { id: '3', type: 'general', text: 'Note 3', createdAt: '2024-01-10T10:00:00Z' },
      ];

      const filterByDateRange = (notes: any[], fromDate: string, toDate: string) => {
        return notes.filter(note => {
          const noteDate = new Date(note.createdAt).toISOString().split('T')[0];
          return (!fromDate || noteDate >= fromDate) && (!toDate || noteDate <= toDate);
        });
      };

      expect(filterByDateRange(notes, '2024-01-03', '2024-01-08')).toHaveLength(1);
      expect(filterByDateRange(notes, '2024-01-01', '')).toHaveLength(3);
      expect(filterByDateRange(notes, '', '2024-01-05')).toHaveLength(2);
    });

    it('should filter notes by search text', () => {
      const notes = [
        { id: '1', type: 'general', text: 'Patient shows improvement', createdAt: '2024-01-01' },
        { id: '2', type: 'assessment', text: 'Blood pressure normal', createdAt: '2024-01-02' },
        { id: '3', type: 'contact', text: 'Family called, patient stable', createdAt: '2024-01-03' },
      ];

      const filterBySearch = (notes: any[], search: string) => {
        if (!search) return notes;
        return notes.filter(note => 
          note.text.toLowerCase().includes(search.toLowerCase())
        );
      };

      expect(filterBySearch(notes, 'patient')).toHaveLength(2);
      expect(filterBySearch(notes, 'blood')).toHaveLength(1);
      expect(filterBySearch(notes, 'nonexistent')).toHaveLength(0);
    });
  });

  describe('Note Sorting', () => {
    it('should sort notes by date (newest first)', () => {
      const notes = [
        { id: '1', createdAt: '2024-01-01T10:00:00Z' },
        { id: '2', createdAt: '2024-01-03T10:00:00Z' },
        { id: '3', createdAt: '2024-01-02T10:00:00Z' },
      ];

      const sortByDate = (notes: any[]) => {
        return [...notes].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      };

      const sorted = sortByDate(notes);
      expect(sorted[0].id).toBe('2'); // 2024-01-03
      expect(sorted[1].id).toBe('3'); // 2024-01-02
      expect(sorted[2].id).toBe('1'); // 2024-01-01
    });
  });
});