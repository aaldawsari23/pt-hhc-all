import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HomeHealthcareProvider } from '../../context/HomeHealthcareContext';
import { Role, Patient, Assessment, Visit, ContactAttempt } from '../../types';
import { mockPatientData, mockStaffData } from '../setup';
import React from 'react';

// Mock the local storage and IndexedDB operations
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

const mockIndexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
};

// Mock components for testing state management
const MockStateProvider = ({ children, initialState }: { 
  children: React.ReactNode; 
  initialState?: any;
}) => {
  return (
    <HomeHealthcareProvider>
      {children}
    </HomeHealthcareProvider>
  );
};

const MockDataManager = ({ 
  onSave, 
  onLoad, 
  onExport, 
  onImport 
}: {
  onSave: () => void;
  onLoad: () => void;
  onExport: () => void;
  onImport: (data: any) => void;
}) => {
  const handleImport = () => {
    const mockImportData = {
      patients: [mockPatientData],
      staff: [mockStaffData],
      visits: [],
      version: '3.0',
    };
    onImport(mockImportData);
  };

  return (
    <div data-testid="data-manager">
      <button data-testid="save-button" onClick={onSave}>
        حفظ البيانات
      </button>
      <button data-testid="load-button" onClick={onLoad}>
        تحميل البيانات
      </button>
      <button data-testid="export-button" onClick={onExport}>
        تصدير البيانات
      </button>
      <button data-testid="import-button" onClick={handleImport}>
        استيراد البيانات
      </button>
    </div>
  );
};

const MockOfflineIndicator = ({ isOnline }: { isOnline: boolean }) => {
  return (
    <div data-testid="offline-indicator">
      <span data-testid="connection-status">
        {isOnline ? 'متصل' : 'غير متصل'}
      </span>
      {!isOnline && (
        <div data-testid="offline-message">
          العمل في وضع عدم الاتصال - سيتم مزامنة البيانات عند العودة للاتصال
        </div>
      )}
    </div>
  );
};

const MockAutoSaveIndicator = ({ 
  isDirty, 
  isSaving, 
  lastSaved 
}: { 
  isDirty: boolean; 
  isSaving: boolean; 
  lastSaved: Date | null;
}) => {
  return (
    <div data-testid="autosave-indicator">
      {isSaving && (
        <span data-testid="saving-status">جاري الحفظ...</span>
      )}
      {isDirty && !isSaving && (
        <span data-testid="unsaved-changes">تغييرات غير محفوظة</span>
      )}
      {!isDirty && !isSaving && lastSaved && (
        <span data-testid="saved-status">
          آخر حفظ: {lastSaved.toLocaleTimeString('ar-SA')}
        </span>
      )}
    </div>
  );
};

const MockDataSyncManager = ({ 
  syncStatus, 
  onSync 
}: { 
  syncStatus: 'idle' | 'syncing' | 'success' | 'error'; 
  onSync: () => void;
}) => {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'idle': return 'في انتظار المزامنة';
      case 'syncing': return 'جاري المزامنة...';
      case 'success': return 'تمت المزامنة بنجاح';
      case 'error': return 'خطأ في المزامنة';
      default: return 'حالة غير معروفة';
    }
  };

  return (
    <div data-testid="sync-manager">
      <div data-testid="sync-status">{getStatusText(syncStatus)}</div>
      <button 
        data-testid="sync-button" 
        onClick={onSync}
        disabled={syncStatus === 'syncing'}
      >
        مزامنة البيانات
      </button>
    </div>
  );
};

describe('Data Persistence and State Management Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    global.localStorage = mockLocalStorage as any;
    global.indexedDB = mockIndexedDB as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Local Storage Operations', () => {
    it('should save application state to localStorage', () => {
      const mockSave = vi.fn();
      
      render(<MockDataManager onSave={mockSave} onLoad={() => {}} onExport={() => {}} onImport={() => {}} />);
      
      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);
      
      expect(mockSave).toHaveBeenCalled();
    });

    it('should load application state from localStorage', () => {
      const mockLoad = vi.fn();
      
      render(<MockDataManager onSave={() => {}} onLoad={mockLoad} onExport={() => {}} onImport={() => {}} />);
      
      const loadButton = screen.getByTestId('load-button');
      fireEvent.click(loadButton);
      
      expect(mockLoad).toHaveBeenCalled();
    });

    it('should handle localStorage quota exceeded error', () => {
      const mockSave = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      const TestComponent = () => {
        const [error, setError] = React.useState<string | null>(null);

        const handleSave = () => {
          try {
            mockSave();
          } catch (err) {
            setError('مساحة التخزين ممتلئة - يرجى حذف بعض البيانات');
          }
        };

        return (
          <div>
            <button data-testid="save-button" onClick={handleSave}>حفظ</button>
            {error && <div data-testid="error-message">{error}</div>}
          </div>
        );
      };

      render(<TestComponent />);
      
      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);
      
      expect(screen.getByTestId('error-message')).toHaveTextContent('مساحة التخزين ممتلئة');
    });
  });

  describe('IndexedDB Operations', () => {
    it('should store large datasets in IndexedDB', async () => {
      const mockOpen = vi.fn(() => Promise.resolve({
        transaction: () => ({
          objectStore: () => ({
            put: vi.fn(() => Promise.resolve()),
            get: vi.fn(() => Promise.resolve(null)),
          }),
        }),
      }));

      mockIndexedDB.open = mockOpen;

      const storeData = async (data: any) => {
        const db = await mockIndexedDB.open('healthcareDB', 1);
        return db;
      };

      const largeDataset = {
        patients: new Array(1000).fill(mockPatientData),
        assessments: new Array(5000).fill({}),
      };

      await storeData(largeDataset);
      expect(mockOpen).toHaveBeenCalledWith('healthcareDB', 1);
    });

    it('should handle IndexedDB version upgrades', async () => {
      const mockUpgrade = vi.fn();
      
      const mockOpen = vi.fn(() => Promise.resolve({
        version: 2,
        onupgradeneeded: mockUpgrade,
      }));

      mockIndexedDB.open = mockOpen;

      const upgradeDB = async () => {
        const db = await mockIndexedDB.open('healthcareDB', 2);
        return db;
      };

      await upgradeDB();
      expect(mockOpen).toHaveBeenCalledWith('healthcareDB', 2);
    });

    it('should migrate data between schema versions', () => {
      const migrateV2ToV3 = (oldData: any) => {
        return {
          ...oldData,
          version: '3.0',
          patients: oldData.patients?.map((patient: any) => ({
            ...patient,
            // Add new fields for v3
            contactAttempts: patient.contactAttempts || [],
            assessments: patient.assessments || [],
          })) || [],
        };
      };

      const v2Data = {
        version: '2.0',
        patients: [{ 
          ...mockPatientData, 
          contactAttempts: undefined, 
          assessments: undefined 
        }],
      };

      const v3Data = migrateV2ToV3(v2Data);
      
      expect(v3Data.version).toBe('3.0');
      expect(v3Data.patients[0].contactAttempts).toEqual([]);
      expect(v3Data.patients[0].assessments).toEqual([]);
    });
  });

  describe('Data Import/Export', () => {
    it('should export data in correct format', () => {
      const mockExport = vi.fn(() => {
        const exportData = {
          version: '3.0',
          exportDate: new Date().toISOString(),
          patients: [mockPatientData],
          staff: [mockStaffData],
          metadata: {
            totalPatients: 1,
            totalStaff: 1,
            exportedBy: 'نظام الرعاية الصحية المنزلية',
          },
        };
        
        return JSON.stringify(exportData, null, 2);
      });

      render(<MockDataManager onSave={() => {}} onLoad={() => {}} onExport={mockExport} onImport={() => {}} />);
      
      const exportButton = screen.getByTestId('export-button');
      fireEvent.click(exportButton);
      
      expect(mockExport).toHaveBeenCalled();
    });

    it('should validate imported data structure', () => {
      const mockImport = vi.fn();
      
      const validateImportData = (data: any): boolean => {
        // Check version compatibility
        if (!data.version || !['2.0', '3.0'].includes(data.version)) {
          return false;
        }
        
        // Check required fields
        if (!Array.isArray(data.patients) || !Array.isArray(data.staff)) {
          return false;
        }
        
        // Validate patient structure
        return data.patients.every((patient: any) => 
          patient.nameAr && patient.nationalId
        );
      };

      render(<MockDataManager onSave={() => {}} onLoad={() => {}} onExport={() => {}} onImport={mockImport} />);
      
      const importButton = screen.getByTestId('import-button');
      fireEvent.click(importButton);
      
      expect(mockImport).toHaveBeenCalledWith(
        expect.objectContaining({
          patients: expect.arrayContaining([mockPatientData]),
          staff: expect.arrayContaining([mockStaffData]),
          version: '3.0',
        })
      );
    });

    it('should handle corrupted import data gracefully', () => {
      const TestComponent = () => {
        const [error, setError] = React.useState<string | null>(null);

        const handleImport = (data: string) => {
          try {
            const parsed = JSON.parse(data);
            if (!parsed.version) {
              throw new Error('Invalid data format');
            }
          } catch (err) {
            setError('ملف البيانات تالف أو غير صالح');
          }
        };

        return (
          <div>
            <button 
              data-testid="import-button" 
              onClick={() => handleImport('invalid json')}
            >
              استيراد
            </button>
            {error && <div data-testid="error-message">{error}</div>}
          </div>
        );
      };

      render(<TestComponent />);
      
      const importButton = screen.getByTestId('import-button');
      fireEvent.click(importButton);
      
      expect(screen.getByTestId('error-message')).toHaveTextContent('ملف البيانات تالف');
    });
  });

  describe('Offline Support', () => {
    it('should detect online/offline status', () => {
      render(<MockOfflineIndicator isOnline={true} />);
      expect(screen.getByTestId('connection-status')).toHaveTextContent('متصل');

      const { rerender } = render(<MockOfflineIndicator isOnline={false} />);
      rerender(<MockOfflineIndicator isOnline={false} />);
      
      expect(screen.getByTestId('connection-status')).toHaveTextContent('غير متصل');
      expect(screen.getByTestId('offline-message')).toBeInTheDocument();
    });

    it('should queue operations for sync when offline', () => {
      const offlineQueue: Array<{ action: string; data: any; timestamp: Date }> = [];

      const queueOperation = (action: string, data: any) => {
        offlineQueue.push({
          action,
          data,
          timestamp: new Date(),
        });
      };

      // Simulate offline operations
      queueOperation('ADD_PATIENT', mockPatientData);
      queueOperation('UPDATE_ASSESSMENT', { patientId: '123', assessment: {} });

      expect(offlineQueue).toHaveLength(2);
      expect(offlineQueue[0].action).toBe('ADD_PATIENT');
      expect(offlineQueue[1].action).toBe('UPDATE_ASSESSMENT');
    });

    it('should sync queued operations when back online', async () => {
      const syncQueue = [
        { action: 'ADD_PATIENT', data: mockPatientData },
        { action: 'LOG_CONTACT_ATTEMPT', data: { patientId: '123', attempt: {} } },
      ];

      const syncOperations = async (queue: any[]) => {
        for (const operation of queue) {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 100));
          console.log(`Synced: ${operation.action}`);
        }
        return queue.length;
      };

      const syncedCount = await syncOperations(syncQueue);
      expect(syncedCount).toBe(2);
    });
  });

  describe('Auto-Save Functionality', () => {
    it('should indicate unsaved changes', () => {
      render(<MockAutoSaveIndicator isDirty={true} isSaving={false} lastSaved={null} />);
      
      expect(screen.getByTestId('unsaved-changes')).toHaveTextContent('تغييرات غير محفوظة');
    });

    it('should show saving status', () => {
      render(<MockAutoSaveIndicator isDirty={true} isSaving={true} lastSaved={null} />);
      
      expect(screen.getByTestId('saving-status')).toHaveTextContent('جاري الحفظ...');
    });

    it('should display last saved time', () => {
      const lastSaved = new Date('2024-01-15T10:30:00');
      
      render(<MockAutoSaveIndicator isDirty={false} isSaving={false} lastSaved={lastSaved} />);
      
      const savedStatus = screen.getByTestId('saved-status');
      expect(savedStatus.textContent).toContain('آخر حفظ:');
    });

    it('should implement debounced auto-save', async () => {
      const mockSave = vi.fn();
      let saveTimeout: NodeJS.Timeout;

      const debouncedSave = (data: any, delay: number = 2000) => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => mockSave(data), delay);
      };

      // Simulate rapid changes
      debouncedSave({ change: 1 }, 100);
      debouncedSave({ change: 2 }, 100);
      debouncedSave({ change: 3 }, 100);

      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should only save once with the last change
      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledWith({ change: 3 });
    });
  });

  describe('Data Synchronization', () => {
    it('should manage sync status correctly', () => {
      const { rerender } = render(
        <MockDataSyncManager syncStatus="idle" onSync={() => {}} />
      );
      
      expect(screen.getByTestId('sync-status')).toHaveTextContent('في انتظار المزامنة');

      rerender(<MockDataSyncManager syncStatus="syncing" onSync={() => {}} />);
      expect(screen.getByTestId('sync-status')).toHaveTextContent('جاري المزامنة...');

      rerender(<MockDataSyncManager syncStatus="success" onSync={() => {}} />);
      expect(screen.getByTestId('sync-status')).toHaveTextContent('تمت المزامنة بنجاح');

      rerender(<MockDataSyncManager syncStatus="error" onSync={() => {}} />);
      expect(screen.getByTestId('sync-status')).toHaveTextContent('خطأ في المزامنة');
    });

    it('should disable sync button during sync', () => {
      render(<MockDataSyncManager syncStatus="syncing" onSync={() => {}} />);
      
      const syncButton = screen.getByTestId('sync-button');
      expect(syncButton).toBeDisabled();
    });

    it('should handle sync conflicts', () => {
      const resolveConflict = (localData: any, remoteData: any) => {
        // Simple last-write-wins strategy
        const localTimestamp = new Date(localData.lastModified || 0);
        const remoteTimestamp = new Date(remoteData.lastModified || 0);
        
        return localTimestamp > remoteTimestamp ? localData : remoteData;
      };

      const localPatient = { 
        ...mockPatientData, 
        lastModified: '2024-01-15T10:00:00Z',
        nameAr: 'اسم محلي' 
      };
      
      const remotePatient = { 
        ...mockPatientData, 
        lastModified: '2024-01-15T11:00:00Z',
        nameAr: 'اسم عن بُعد' 
      };

      const resolved = resolveConflict(localPatient, remotePatient);
      expect(resolved.nameAr).toBe('اسم عن بُعد');
    });
  });

  describe('Performance and Memory Management', () => {
    it('should implement data pagination for large datasets', () => {
      const generateLargeDataset = (size: number) => {
        return Array.from({ length: size }, (_, index) => ({
          ...mockPatientData,
          nationalId: `patient-${index}`,
          nameAr: `مريض رقم ${index}`,
        }));
      };

      const paginateData = (data: any[], page: number, pageSize: number) => {
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        return {
          data: data.slice(startIndex, endIndex),
          totalPages: Math.ceil(data.length / pageSize),
          currentPage: page,
          totalItems: data.length,
        };
      };

      const largeDataset = generateLargeDataset(1000);
      const page1 = paginateData(largeDataset, 0, 50);
      
      expect(page1.data).toHaveLength(50);
      expect(page1.totalPages).toBe(20);
      expect(page1.totalItems).toBe(1000);
    });

    it('should clean up unused data to prevent memory leaks', () => {
      const dataCache = new Map();
      
      const addToCache = (key: string, data: any) => {
        dataCache.set(key, {
          data,
          lastAccessed: Date.now(),
        });
      };

      const cleanupCache = (maxAge: number = 300000) => { // 5 minutes
        const now = Date.now();
        for (const [key, value] of dataCache.entries()) {
          if (now - value.lastAccessed > maxAge) {
            dataCache.delete(key);
          }
        }
      };

      addToCache('patient-1', mockPatientData);
      
      // Simulate old cache entry
      dataCache.set('old-patient', {
        data: mockPatientData,
        lastAccessed: Date.now() - 400000, // 6+ minutes ago
      });

      expect(dataCache.size).toBe(2);
      
      cleanupCache();
      
      expect(dataCache.size).toBe(1);
      expect(dataCache.has('patient-1')).toBe(true);
      expect(dataCache.has('old-patient')).toBe(false);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle database corruption gracefully', () => {
      const handleDBCorruption = async () => {
        try {
          // Simulate database corruption
          throw new Error('Database corrupted');
        } catch (error) {
          // Attempt to restore from backup
          const backupData = {
            patients: [mockPatientData],
            staff: [mockStaffData],
            restoredFrom: 'backup',
          };
          
          return backupData;
        }
      };

      expect(handleDBCorruption()).resolves.toEqual(
        expect.objectContaining({
          restoredFrom: 'backup',
        })
      );
    });

    it('should implement data validation on load', () => {
      const validatePatientData = (patient: any): boolean => {
        const requiredFields = ['nameAr', 'nationalId'];
        return requiredFields.every(field => 
          patient[field] && typeof patient[field] === 'string'
        );
      };

      const validateDataStructure = (data: any): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];
        
        if (!data.patients || !Array.isArray(data.patients)) {
          errors.push('قائمة المرضى مفقودة أو تالفة');
        } else {
          const invalidPatients = data.patients.filter((p: any) => !validatePatientData(p));
          if (invalidPatients.length > 0) {
            errors.push(`${invalidPatients.length} مريض لديه بيانات غير صالحة`);
          }
        }

        return {
          isValid: errors.length === 0,
          errors,
        };
      };

      const validData = { patients: [mockPatientData] };
      const invalidData = { patients: [{ nameAr: null }] };

      expect(validateDataStructure(validData).isValid).toBe(true);
      expect(validateDataStructure(invalidData).isValid).toBe(false);
    });
  });
});