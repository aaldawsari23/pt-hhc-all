import { neon } from '@netlify/neon';
import { PdfService, PdfFile, PdfTemplate } from './pdfService';

// Get database connection from environment variable
const DATABASE_URL = import.meta.env.VITE_DATABASE_URL || 
  process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_l1ihrQg7wRdv@ep-cold-feather-aecrkjj2-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require';

// Check if we're in a browser environment
const isClient = typeof window !== 'undefined';

// Initialize SQL client only in server environment
let sql: any = null;
try {
  if (!isClient) {
    sql = neon(DATABASE_URL);
  }
} catch (error) {
  console.warn('Could not initialize Neon client:', error);
}

export interface Patient {
  nationalId: string;
  nameAr: string;
  nameEn?: string;
  age?: number;
  sex?: string;
  admissionDate?: string;
  areaId?: string;
  phone?: string;
  address?: string;
  medicalDiagnosis?: string;
  bradenScore?: number;
  status?: string;
  tags?: string[];
  contactAttempts?: any[];
  assessments?: any[];
}

export interface Visit {
  id?: number;
  patientId: string;
  teamId?: string;
  visitDate: string;
  status?: string;
  doctorNote?: any;
  nurseNote?: any;
  ptNote?: any;
  swNote?: any;
  doctorSign?: string;
  nurseSign?: string;
  ptSign?: string;
  swSign?: string;
}

export interface Staff {
  id?: number;
  nameAr: string;
  nameEn?: string;
  professionAr?: string;
  professionEn?: string;
  phone?: string;
  email?: string;
  areaId?: string;
}

export class NetlifyDbService {
  // Initialize database with schema
  static async initializeDatabase() {
    try {
      // Read and execute schema
      const response = await fetch('/database/schema.sql');
      const schema = await response.text();
      
      // Execute schema commands
      const commands = schema.split(';').filter(cmd => cmd.trim());
      for (const command of commands) {
        if (command.trim()) {
          await sql`${command}`;
        }
      }
      
      console.log('Database initialized successfully');
      return { success: true };
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  // Patient operations
  static async savePatient(patient: Patient) {
    try {
      const result = await sql`
        INSERT INTO patients (
          national_id, name_ar, name_en, age, sex, admission_date,
          area_id, phone, address, medical_diagnosis, braden_score,
          status, tags, contact_attempts, assessments
        ) VALUES (
          ${patient.nationalId}, ${patient.nameAr}, ${patient.nameEn || null},
          ${patient.age || null}, ${patient.sex || null}, ${patient.admissionDate || null},
          ${patient.areaId || null}, ${patient.phone || null}, ${patient.address || null},
          ${patient.medicalDiagnosis || null}, ${patient.bradenScore || null},
          ${patient.status || 'active'}, ${JSON.stringify(patient.tags || [])},
          ${JSON.stringify(patient.contactAttempts || [])}, ${JSON.stringify(patient.assessments || [])}
        )
        ON CONFLICT (national_id) 
        DO UPDATE SET
          name_ar = EXCLUDED.name_ar,
          name_en = EXCLUDED.name_en,
          age = EXCLUDED.age,
          sex = EXCLUDED.sex,
          admission_date = EXCLUDED.admission_date,
          area_id = EXCLUDED.area_id,
          phone = EXCLUDED.phone,
          address = EXCLUDED.address,
          medical_diagnosis = EXCLUDED.medical_diagnosis,
          braden_score = EXCLUDED.braden_score,
          status = EXCLUDED.status,
          tags = EXCLUDED.tags,
          contact_attempts = EXCLUDED.contact_attempts,
          assessments = EXCLUDED.assessments,
          updated_at = CURRENT_TIMESTAMP
        RETURNING national_id
      `;
      
      return { success: true, nationalId: result[0]?.national_id };
    } catch (error) {
      console.error('Error saving patient:', error);
      throw error;
    }
  }

  static async getPatient(nationalId: string) {
    try {
      const result = await sql`
        SELECT * FROM patients WHERE national_id = ${nationalId}
      `;
      
      return result[0] || null;
    } catch (error) {
      console.error('Error getting patient:', error);
      throw error;
    }
  }

  static async getAllPatients() {
    try {
      if (!sql) {
        throw new Error('Database client not available in browser environment');
      }
      
      const result = await sql`
        SELECT * FROM patients ORDER BY created_at DESC
      `;
      
      return result;
    } catch (error) {
      console.error('Error getting all patients:', error);
      throw error;
    }
  }

  static async getPatientsByArea(areaId: string) {
    try {
      const result = await sql`
        SELECT * FROM patients WHERE area_id = ${areaId} ORDER BY name_ar
      `;
      
      return result;
    } catch (error) {
      console.error('Error getting patients by area:', error);
      throw error;
    }
  }

  // Visit operations
  static async saveVisit(visit: Visit) {
    try {
      const result = await sql`
        INSERT INTO visits (
          patient_id, team_id, visit_date, status,
          doctor_note, nurse_note, pt_note, sw_note,
          doctor_sign, nurse_sign, pt_sign, sw_sign
        ) VALUES (
          ${visit.patientId}, ${visit.teamId || null}, ${visit.visitDate},
          ${visit.status || 'Scheduled'}, ${JSON.stringify(visit.doctorNote || null)},
          ${JSON.stringify(visit.nurseNote || null)}, ${JSON.stringify(visit.ptNote || null)},
          ${JSON.stringify(visit.swNote || null)}, ${visit.doctorSign || null},
          ${visit.nurseSign || null}, ${visit.ptSign || null}, ${visit.swSign || null}
        )
        ON CONFLICT (patient_id, visit_date)
        DO UPDATE SET
          team_id = EXCLUDED.team_id,
          status = EXCLUDED.status,
          doctor_note = EXCLUDED.doctor_note,
          nurse_note = EXCLUDED.nurse_note,
          pt_note = EXCLUDED.pt_note,
          sw_note = EXCLUDED.sw_note,
          doctor_sign = EXCLUDED.doctor_sign,
          nurse_sign = EXCLUDED.nurse_sign,
          pt_sign = EXCLUDED.pt_sign,
          sw_sign = EXCLUDED.sw_sign,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `;
      
      return { success: true, visitId: result[0]?.id };
    } catch (error) {
      console.error('Error saving visit:', error);
      throw error;
    }
  }

  static async getVisitsByDateRange(startDate: string, endDate: string) {
    try {
      const result = await sql`
        SELECT v.*, p.name_ar as patient_name
        FROM visits v
        JOIN patients p ON v.patient_id = p.national_id
        WHERE v.visit_date >= ${startDate} AND v.visit_date <= ${endDate}
        ORDER BY v.visit_date DESC, p.name_ar
      `;
      
      return result;
    } catch (error) {
      console.error('Error getting visits by date range:', error);
      throw error;
    }
  }

  static async getTodayVisits() {
    const today = new Date().toISOString().split('T')[0];
    return this.getVisitsByDateRange(today, today);
  }

  // Staff operations
  static async saveStaff(staff: Staff) {
    try {
      const result = await sql`
        INSERT INTO staff (
          name_ar, name_en, profession_ar, profession_en,
          phone, email, area_id
        ) VALUES (
          ${staff.nameAr}, ${staff.nameEn || null}, ${staff.professionAr || null},
          ${staff.professionEn || null}, ${staff.phone || null}, ${staff.email || null},
          ${staff.areaId || null}
        ) RETURNING id
      `;
      
      return { success: true, staffId: result[0]?.id };
    } catch (error) {
      console.error('Error saving staff:', error);
      throw error;
    }
  }

  static async getAllStaff() {
    try {
      if (!sql) {
        throw new Error('Database client not available in browser environment');
      }
      
      const result = await sql`
        SELECT * FROM staff ORDER BY name_ar
      `;
      
      return result;
    } catch (error) {
      console.error('Error getting all staff:', error);
      throw error;
    }
  }

  // Assessment operations
  static async saveAssessment(assessment: any) {
    try {
      const result = await sql`
        INSERT INTO assessments (
          id, patient_id, role, assessment_data, created_by
        ) VALUES (
          ${assessment.id}, ${assessment.patientId}, ${assessment.role},
          ${JSON.stringify(assessment)}, ${assessment.createdBy || null}
        )
        ON CONFLICT (id)
        DO UPDATE SET
          assessment_data = EXCLUDED.assessment_data,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `;
      
      return { success: true, assessmentId: result[0]?.id };
    } catch (error) {
      console.error('Error saving assessment:', error);
      throw error;
    }
  }

  static async getAssessmentsByPatient(patientId: string) {
    try {
      const result = await sql`
        SELECT * FROM assessments 
        WHERE patient_id = ${patientId}
        ORDER BY created_at DESC
      `;
      
      return result;
    } catch (error) {
      console.error('Error getting assessments by patient:', error);
      throw error;
    }
  }

  // Activity logging
  static async logActivity(action: string, details: any, userEmail?: string, userName?: string) {
    try {
      const result = await sql`
        INSERT INTO activity_log (action, details, user_email, user_name)
        VALUES (${action}, ${JSON.stringify(details)}, ${userEmail || null}, ${userName || null})
        RETURNING id
      `;
      
      return { success: true, logId: result[0]?.id };
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  // Sync data from Firebase to Netlify DB
  static async syncFromFirebase(firebaseData: any) {
    try {
      // Sync patients
      if (firebaseData.patients) {
        for (const patient of firebaseData.patients) {
          await this.savePatient(patient);
        }
      }

      // Sync staff
      if (firebaseData.staff) {
        for (const staff of firebaseData.staff) {
          await this.saveStaff(staff);
        }
      }

      // Sync visits
      if (firebaseData.visits) {
        for (const visit of firebaseData.visits) {
          await this.saveVisit(visit);
        }
      }

      await this.logActivity('sync_from_firebase', {
        patientsCount: firebaseData.patients?.length || 0,
        staffCount: firebaseData.staff?.length || 0,
        visitsCount: firebaseData.visits?.length || 0
      });

      return { success: true };
    } catch (error) {
      console.error('Error syncing from Firebase:', error);
      throw error;
    }
  }

  // PDF Operations (delegated to PdfService)
  static async savePdf(pdfFile: PdfFile) {
    return PdfService.savePdfFile(pdfFile);
  }

  static async getPdfsByPatient(patientId: string) {
    return PdfService.getPdfsByPatient(patientId);
  }

  static async getAllPdfs(limit = 100) {
    return PdfService.getAllPdfs(limit);
  }

  static async generatePatientCard(patientId: string, generatedBy?: string) {
    // Get patient data
    const patient = await this.getPatient(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    // Generate PDF from patient card template
    return PdfService.generatePdfFromTemplate(
      1, // Patient card template ID
      {
        patient: {
          nameAr: patient.name_ar,
          nationalId: patient.national_id,
          age: patient.age,
          sex: patient.sex === 'M' ? 'ذكر' : 'أنثى',
          phone: patient.phone,
          areaId: patient.area_id,
          admissionDate: patient.admission_date,
          bradenScore: patient.braden_score,
          medicalDiagnosis: patient.medical_diagnosis
        },
        generationDate: new Date().toLocaleDateString('ar-SA'),
        generatedBy: generatedBy || 'النظام'
      },
      {
        patientId,
        generatedBy
      }
    );
  }

  static async generateVisitReport(patientId: string, visitId: number, generatedBy?: string) {
    // Get patient and visit data
    const [patient, visits] = await Promise.all([
      this.getPatient(patientId),
      sql`SELECT * FROM visits WHERE id = ${visitId}`
    ]);

    if (!patient || !visits[0]) {
      throw new Error('Patient or visit not found');
    }

    const visit = visits[0];

    // Generate PDF from visit report template
    return PdfService.generatePdfFromTemplate(
      2, // Visit report template ID
      {
        patient: {
          nameAr: patient.name_ar,
          nationalId: patient.national_id
        },
        visit: {
          visitDate: visit.visit_date,
          status: visit.status,
          doctorNote: visit.doctor_note ? JSON.stringify(visit.doctor_note) : null,
          nurseNote: visit.nurse_note ? JSON.stringify(visit.nurse_note) : null,
          doctorSign: visit.doctor_sign,
          nurseSign: visit.nurse_sign
        },
        generationDate: new Date().toLocaleDateString('ar-SA')
      },
      {
        patientId,
        visitId,
        generatedBy
      }
    );
  }

  static async getPdfStats() {
    return PdfService.getPdfStats();
  }

  static async searchPdfs(searchTerm: string, category?: string, patientId?: string) {
    return PdfService.searchPdfs(searchTerm, category, patientId);
  }
}