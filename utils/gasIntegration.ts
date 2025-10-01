// Google Apps Script Integration Utilities
// This file prepares the app for backend integration with Google Apps Script

export interface GASConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
}

export interface GASResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PatientUpload {
  nationalId: string;
  nameAr: string;
  phone?: string;
  areaId?: string;
  status: 'active' | 'deceased';
  level?: string;
  bradenScore?: number;
  minMonthlyRequired?: number;
  admissionDate?: string;
  sex?: 'Male' | 'Female';
  tags: string[];
  lastUpdated: string;
}

export interface VisitRecord {
  id: string;
  patientId: string;
  date: string;
  teamId: string;
  status: string;
  doctorNote?: any;
  nurseNote?: any;
  ptNote?: any;
  swNote?: any;
  doctorSign?: string;
  nurseSign?: string;
  ptSign?: string;
  swSign?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentRecord {
  id: string;
  patientId: string;
  date: string;
  assessorId: string;
  assessorName: string;
  role: string;
  status: string;
  plan: string;
  data: any;
  createdAt: string;
}

class GASIntegration {
  private config: GASConfig;
  private isOnline: boolean = true;
  private syncQueue: Array<{ type: string; data: any; timestamp: string }> = [];

  constructor(config: GASConfig) {
    this.config = config;
    this.initializeSync();
  }

  private initializeSync() {
    // Check online status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Periodic sync every 5 minutes
    setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }, 5 * 60 * 1000);
  }

  private async makeRequest<T>(endpoint: string, data: any, method: 'GET' | 'POST' = 'POST'): Promise<GASResponse<T>> {
    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        ...(method === 'POST' && { body: JSON.stringify(data) })
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('GAS API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Patient Data Management
  async uploadPatients(patients: PatientUpload[]): Promise<GASResponse<{ uploaded: number; errors: any[] }>> {
    if (!this.isOnline) {
      this.queueForSync('uploadPatients', patients);
      return {
        success: true,
        data: { uploaded: 0, errors: [] },
        timestamp: new Date().toISOString()
      };
    }

    return this.makeRequest('/patients/upload', { patients });
  }

  async syncPatient(patient: PatientUpload): Promise<GASResponse<PatientUpload>> {
    if (!this.isOnline) {
      this.queueForSync('syncPatient', patient);
      return {
        success: true,
        data: patient,
        timestamp: new Date().toISOString()
      };
    }

    return this.makeRequest('/patients/sync', patient);
  }

  // Visit Management
  async saveVisit(visit: VisitRecord): Promise<GASResponse<VisitRecord>> {
    if (!this.isOnline) {
      this.queueForSync('saveVisit', visit);
      return {
        success: true,
        data: visit,
        timestamp: new Date().toISOString()
      };
    }

    return this.makeRequest('/visits/save', visit);
  }

  async getVisitsByDateRange(startDate: string, endDate: string): Promise<GASResponse<VisitRecord[]>> {
    if (!this.isOnline) {
      return {
        success: false,
        error: 'Offline - cannot fetch data',
        timestamp: new Date().toISOString()
      };
    }

    return this.makeRequest('/visits/range', { startDate, endDate });
  }

  // Assessment Management
  async saveAssessment(assessment: AssessmentRecord): Promise<GASResponse<AssessmentRecord>> {
    if (!this.isOnline) {
      this.queueForSync('saveAssessment', assessment);
      return {
        success: true,
        data: assessment,
        timestamp: new Date().toISOString()
      };
    }

    return this.makeRequest('/assessments/save', assessment);
  }

  // PDF Generation and Storage
  async generateAndStorePDF(type: 'visit' | 'assessment' | 'contact-history' | 'driver-route', data: any): Promise<GASResponse<{ fileId: string; url: string }>> {
    if (!this.isOnline) {
      this.queueForSync('generatePDF', { type, data });
      return {
        success: false,
        error: 'Offline - PDF generation queued',
        timestamp: new Date().toISOString()
      };
    }

    return this.makeRequest('/pdf/generate', { type, data });
  }

  async listPDFs(patientId?: string, startDate?: string, endDate?: string): Promise<GASResponse<Array<{ id: string; name: string; url: string; createdAt: string }>>> {
    if (!this.isOnline) {
      return {
        success: false,
        error: 'Offline - cannot fetch PDF list',
        timestamp: new Date().toISOString()
      };
    }

    return this.makeRequest('/pdf/list', { patientId, startDate, endDate });
  }

  // CSV Data Import/Export
  async importFromCSV(csvData: string, type: 'patients' | 'staff' | 'areas'): Promise<GASResponse<{ imported: number; errors: any[] }>> {
    if (!this.isOnline) {
      this.queueForSync('importCSV', { csvData, type });
      return {
        success: false,
        error: 'Offline - import queued',
        timestamp: new Date().toISOString()
      };
    }

    return this.makeRequest('/data/import', { csvData, type });
  }

  async exportToCSV(type: 'patients' | 'visits' | 'assessments', filters?: any): Promise<GASResponse<{ csvData: string; filename: string }>> {
    if (!this.isOnline) {
      return {
        success: false,
        error: 'Offline - cannot export data',
        timestamp: new Date().toISOString()
      };
    }

    return this.makeRequest('/data/export', { type, filters });
  }

  // Sync Queue Management
  private queueForSync(type: string, data: any) {
    this.syncQueue.push({
      type,
      data,
      timestamp: new Date().toISOString()
    });

    // Keep queue size manageable
    if (this.syncQueue.length > 100) {
      this.syncQueue = this.syncQueue.slice(-50);
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('gas-sync-queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.warn('Failed to persist sync queue:', error);
    }
  }

  private async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    const queueCopy = [...this.syncQueue];
    this.syncQueue = [];

    for (const item of queueCopy) {
      try {
        switch (item.type) {
          case 'uploadPatients':
            await this.uploadPatients(item.data);
            break;
          case 'syncPatient':
            await this.syncPatient(item.data);
            break;
          case 'saveVisit':
            await this.saveVisit(item.data);
            break;
          case 'saveAssessment':
            await this.saveAssessment(item.data);
            break;
          case 'generatePDF':
            await this.generateAndStorePDF(item.data.type, item.data.data);
            break;
          case 'importCSV':
            await this.importFromCSV(item.data.csvData, item.data.type);
            break;
          default:
            console.warn('Unknown sync type:', item.type);
        }
      } catch (error) {
        console.error('Sync failed for item:', item, error);
        // Re-queue failed items (with exponential backoff logic could be added)
        this.syncQueue.push(item);
      }
    }

    // Update localStorage
    try {
      localStorage.setItem('gas-sync-queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.warn('Failed to persist sync queue:', error);
    }
  }

  // Initialize from localStorage
  loadPersistedQueue() {
    try {
      const persistedQueue = localStorage.getItem('gas-sync-queue');
      if (persistedQueue) {
        this.syncQueue = JSON.parse(persistedQueue);
      }
    } catch (error) {
      console.warn('Failed to load persisted sync queue:', error);
    }
  }

  // Health Check
  async healthCheck(): Promise<GASResponse<{ status: 'ok' | 'error'; version: string; timestamp: string }>> {
    return this.makeRequest('/health', {}, 'GET');
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      lastSync: localStorage.getItem('gas-last-sync') || 'Never'
    };
  }
}

// Singleton instance
let gasInstance: GASIntegration | null = null;

export function initializeGAS(config: GASConfig): GASIntegration {
  gasInstance = new GASIntegration(config);
  gasInstance.loadPersistedQueue();
  return gasInstance;
}

export function getGAS(): GASIntegration | null {
  return gasInstance;
}

// Utility functions for easy integration
export function isGASEnabled(): boolean {
  return gasInstance !== null;
}

export async function syncToGAS(type: string, data: any): Promise<boolean> {
  if (!gasInstance) {
    console.warn('GAS not initialized');
    return false;
  }

  try {
    let result: GASResponse<any>;
    
    switch (type) {
      case 'patient':
        result = await gasInstance.syncPatient(data);
        break;
      case 'visit':
        result = await gasInstance.saveVisit(data);
        break;
      case 'assessment':
        result = await gasInstance.saveAssessment(data);
        break;
      default:
        console.warn('Unknown sync type:', type);
        return false;
    }

    return result.success;
  } catch (error) {
    console.error('Sync failed:', error);
    return false;
  }
}

// Default configuration for production
export const DEFAULT_GAS_CONFIG: GASConfig = {
  baseUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
  timeout: 30000, // 30 seconds
};