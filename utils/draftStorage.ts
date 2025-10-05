import { Assessment, Role } from '../types';

interface DraftAssessment {
  id: string;
  patientId: string;
  role: Role;
  formData: any;
  lastSaved: Date;
  isComplete: boolean;
  timestamp: number;
}

interface DraftVisitNote {
  id: string;
  patientId: string;
  visitDate: string;
  role: Role;
  formData: any;
  lastSaved: Date;
  isComplete: boolean;
  timestamp: number;
}

const STORAGE_KEYS = {
  DRAFT_ASSESSMENTS: 'mhhc_draft_assessments',
  DRAFT_VISIT_NOTES: 'mhhc_draft_visit_notes',
  AUTO_SAVE_ENABLED: 'mhhc_auto_save_enabled'
};

export class DraftStorageService {
  private static instance: DraftStorageService;
  private autoSaveEnabled: boolean = true;
  private autoSaveInterval: number = 30000; // 30 seconds

  private constructor() {
    this.autoSaveEnabled = this.getAutoSaveEnabled();
  }

  static getInstance(): DraftStorageService {
    if (!DraftStorageService.instance) {
      DraftStorageService.instance = new DraftStorageService();
    }
    return DraftStorageService.instance;
  }

  // Assessment Draft Methods
  saveDraftAssessment(patientId: string, role: Role, formData: any, isComplete: boolean = false): void {
    try {
      const drafts = this.getDraftAssessments();
      const draftId = `${patientId}_${role}`;
      
      const draft: DraftAssessment = {
        id: draftId,
        patientId,
        role,
        formData,
        lastSaved: new Date(),
        isComplete,
        timestamp: Date.now()
      };

      drafts[draftId] = draft;
      localStorage.setItem(STORAGE_KEYS.DRAFT_ASSESSMENTS, JSON.stringify(drafts));
      
      console.log(`💾 Saved draft assessment for ${patientId} - ${role}`, { isComplete });
    } catch (error) {
      console.error('Error saving draft assessment:', error);
    }
  }

  getDraftAssessment(patientId: string, role: Role): DraftAssessment | null {
    try {
      const drafts = this.getDraftAssessments();
      const draftId = `${patientId}_${role}`;
      return drafts[draftId] || null;
    } catch (error) {
      console.error('Error getting draft assessment:', error);
      return null;
    }
  }

  deleteDraftAssessment(patientId: string, role: Role): void {
    try {
      const drafts = this.getDraftAssessments();
      const draftId = `${patientId}_${role}`;
      delete drafts[draftId];
      localStorage.setItem(STORAGE_KEYS.DRAFT_ASSESSMENTS, JSON.stringify(drafts));
    } catch (error) {
      console.error('Error deleting draft assessment:', error);
    }
  }

  private getDraftAssessments(): Record<string, DraftAssessment> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DRAFT_ASSESSMENTS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error parsing draft assessments:', error);
      return {};
    }
  }

  // Visit Note Draft Methods
  saveDraftVisitNote(patientId: string, visitDate: string, role: Role, formData: any, isComplete: boolean = false): void {
    try {
      const drafts = this.getDraftVisitNotes();
      const draftId = `${patientId}_${visitDate}_${role}`;
      
      const draft: DraftVisitNote = {
        id: draftId,
        patientId,
        visitDate,
        role,
        formData,
        lastSaved: new Date(),
        isComplete,
        timestamp: Date.now()
      };

      drafts[draftId] = draft;
      localStorage.setItem(STORAGE_KEYS.DRAFT_VISIT_NOTES, JSON.stringify(drafts));
      
      console.log(`💾 Saved draft visit note for ${patientId} - ${role}`, { isComplete });
    } catch (error) {
      console.error('Error saving draft visit note:', error);
    }
  }

  getDraftVisitNote(patientId: string, visitDate: string, role: Role): DraftVisitNote | null {
    try {
      const drafts = this.getDraftVisitNotes();
      const draftId = `${patientId}_${visitDate}_${role}`;
      return drafts[draftId] || null;
    } catch (error) {
      console.error('Error getting draft visit note:', error);
      return null;
    }
  }

  deleteDraftVisitNote(patientId: string, visitDate: string, role: Role): void {
    try {
      const drafts = this.getDraftVisitNotes();
      const draftId = `${patientId}_${visitDate}_${role}`;
      delete drafts[draftId];
      localStorage.setItem(STORAGE_KEYS.DRAFT_VISIT_NOTES, JSON.stringify(drafts));
    } catch (error) {
      console.error('Error deleting draft visit note:', error);
    }
  }

  private getDraftVisitNotes(): Record<string, DraftVisitNote> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DRAFT_VISIT_NOTES);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error parsing draft visit notes:', error);
      return {};
    }
  }

  // Utility Methods
  getAllDraftsForPatient(patientId: string): { assessments: DraftAssessment[], visitNotes: DraftVisitNote[] } {
    const assessments = Object.values(this.getDraftAssessments())
      .filter(draft => draft.patientId === patientId);
    
    const visitNotes = Object.values(this.getDraftVisitNotes())
      .filter(draft => draft.patientId === patientId);

    return { assessments, visitNotes };
  }

  getDraftCount(): { assessments: number, visitNotes: number } {
    return {
      assessments: Object.keys(this.getDraftAssessments()).length,
      visitNotes: Object.keys(this.getDraftVisitNotes()).length
    };
  }

  cleanupOldDrafts(maxAge: number = 7 * 24 * 60 * 60 * 1000): void { // 7 days default
    try {
      const cutoff = Date.now() - maxAge;
      
      // Clean assessments
      const assessments = this.getDraftAssessments();
      Object.keys(assessments).forEach(key => {
        if (assessments[key].timestamp < cutoff) {
          delete assessments[key];
        }
      });
      localStorage.setItem(STORAGE_KEYS.DRAFT_ASSESSMENTS, JSON.stringify(assessments));

      // Clean visit notes
      const visitNotes = this.getDraftVisitNotes();
      Object.keys(visitNotes).forEach(key => {
        if (visitNotes[key].timestamp < cutoff) {
          delete visitNotes[key];
        }
      });
      localStorage.setItem(STORAGE_KEYS.DRAFT_VISIT_NOTES, JSON.stringify(visitNotes));
      
      console.log('🧹 Cleaned up old drafts');
    } catch (error) {
      console.error('Error cleaning up old drafts:', error);
    }
  }

  // Auto-save settings
  getAutoSaveEnabled(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTO_SAVE_ENABLED);
      return stored ? JSON.parse(stored) : true;
    } catch (error) {
      return true;
    }
  }

  setAutoSaveEnabled(enabled: boolean): void {
    this.autoSaveEnabled = enabled;
    localStorage.setItem(STORAGE_KEYS.AUTO_SAVE_ENABLED, JSON.stringify(enabled));
  }

  // Export/Import for backup
  exportDrafts(): string {
    return JSON.stringify({
      assessments: this.getDraftAssessments(),
      visitNotes: this.getDraftVisitNotes(),
      timestamp: Date.now()
    });
  }

  importDrafts(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.assessments) {
        localStorage.setItem(STORAGE_KEYS.DRAFT_ASSESSMENTS, JSON.stringify(parsed.assessments));
      }
      if (parsed.visitNotes) {
        localStorage.setItem(STORAGE_KEYS.DRAFT_VISIT_NOTES, JSON.stringify(parsed.visitNotes));
      }
      return true;
    } catch (error) {
      console.error('Error importing drafts:', error);
      return false;
    }
  }

  clearAllDrafts(): void {
    localStorage.removeItem(STORAGE_KEYS.DRAFT_ASSESSMENTS);
    localStorage.removeItem(STORAGE_KEYS.DRAFT_VISIT_NOTES);
    console.log('🗑️ Cleared all drafts');
  }
}

// React Hook for draft management
export const useDraftStorage = () => {
  const storage = DraftStorageService.getInstance();
  
  return {
    // Assessment methods
    saveDraftAssessment: storage.saveDraftAssessment.bind(storage),
    getDraftAssessment: storage.getDraftAssessment.bind(storage),
    deleteDraftAssessment: storage.deleteDraftAssessment.bind(storage),
    
    // Visit note methods
    saveDraftVisitNote: storage.saveDraftVisitNote.bind(storage),
    getDraftVisitNote: storage.getDraftVisitNote.bind(storage),
    deleteDraftVisitNote: storage.deleteDraftVisitNote.bind(storage),
    
    // Utility methods
    getAllDraftsForPatient: storage.getAllDraftsForPatient.bind(storage),
    getDraftCount: storage.getDraftCount.bind(storage),
    cleanupOldDrafts: storage.cleanupOldDrafts.bind(storage),
    
    // Settings
    getAutoSaveEnabled: storage.getAutoSaveEnabled.bind(storage),
    setAutoSaveEnabled: storage.setAutoSaveEnabled.bind(storage),
    
    // Export/Import
    exportDrafts: storage.exportDrafts.bind(storage),
    importDrafts: storage.importDrafts.bind(storage),
    clearAllDrafts: storage.clearAllDrafts.bind(storage)
  };
};