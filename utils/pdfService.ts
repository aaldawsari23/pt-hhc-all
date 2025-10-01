import { neon } from '@netlify/neon';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_l1ihrQg7wRdv@ep-cold-feather-aecrkjj2-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require';

const sql = neon(DATABASE_URL);

export interface PdfFile {
  id?: number;
  filename: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  content: Uint8Array;
  patientId?: string;
  category: 'assessment' | 'visit' | 'document' | 'report' | 'general';
  description?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  createdAt?: string;
}

export interface PdfTemplate {
  id?: number;
  name: string;
  nameAr: string;
  templateType: string;
  htmlTemplate: string;
  cssStyles?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GenerationHistory {
  id?: number;
  templateId: number;
  patientId?: string;
  visitId?: number;
  assessmentId?: string;
  generatedFilename: string;
  generationData: any;
  generatedBy?: string;
  generatedAt?: string;
}

export class PdfService {
  // PDF File Storage Operations
  static async savePdfFile(pdfFile: PdfFile): Promise<{ success: boolean; pdfId?: number }> {
    try {
      const result = await sql`
        INSERT INTO pdf_files (
          filename, original_filename, file_type, file_size, content,
          patient_id, category, description, uploaded_by
        ) VALUES (
          ${pdfFile.filename},
          ${pdfFile.originalFilename},
          ${pdfFile.fileType},
          ${pdfFile.fileSize},
          ${pdfFile.content},
          ${pdfFile.patientId || null},
          ${pdfFile.category},
          ${pdfFile.description || null},
          ${pdfFile.uploadedBy || null}
        ) RETURNING id
      `;
      
      return { success: true, pdfId: result[0]?.id };
    } catch (error) {
      console.error('Error saving PDF file:', error);
      throw error;
    }
  }

  static async getPdfFile(pdfId: number): Promise<PdfFile | null> {
    try {
      const result = await sql`
        SELECT * FROM pdf_files WHERE id = ${pdfId}
      `;
      
      return result[0] || null;
    } catch (error) {
      console.error('Error getting PDF file:', error);
      throw error;
    }
  }

  static async getPdfsByPatient(patientId: string): Promise<PdfFile[]> {
    try {
      const result = await sql`
        SELECT id, filename, original_filename, file_type, file_size,
               category, description, uploaded_by, uploaded_at
        FROM pdf_files 
        WHERE patient_id = ${patientId}
        ORDER BY uploaded_at DESC
      `;
      
      return result;
    } catch (error) {
      console.error('Error getting PDFs by patient:', error);
      throw error;
    }
  }

  static async getAllPdfs(limit: number = 100): Promise<PdfFile[]> {
    try {
      const result = await sql`
        SELECT p.id, p.filename, p.original_filename, p.file_type, p.file_size,
               p.category, p.description, p.uploaded_by, p.uploaded_at,
               pt.name_ar as patient_name
        FROM pdf_files p
        LEFT JOIN patients pt ON p.patient_id = pt.national_id
        ORDER BY p.uploaded_at DESC
        LIMIT ${limit}
      `;
      
      return result;
    } catch (error) {
      console.error('Error getting all PDFs:', error);
      throw error;
    }
  }

  static async deletePdfFile(pdfId: number): Promise<{ success: boolean }> {
    try {
      await sql`DELETE FROM pdf_files WHERE id = ${pdfId}`;
      return { success: true };
    } catch (error) {
      console.error('Error deleting PDF file:', error);
      throw error;
    }
  }

  // PDF Template Operations
  static async getPdfTemplates(): Promise<PdfTemplate[]> {
    try {
      const result = await sql`
        SELECT * FROM pdf_templates 
        WHERE is_active = true
        ORDER BY name_ar
      `;
      
      return result;
    } catch (error) {
      console.error('Error getting PDF templates:', error);
      throw error;
    }
  }

  static async getPdfTemplate(templateId: number): Promise<PdfTemplate | null> {
    try {
      const result = await sql`
        SELECT * FROM pdf_templates WHERE id = ${templateId}
      `;
      
      return result[0] || null;
    } catch (error) {
      console.error('Error getting PDF template:', error);
      throw error;
    }
  }

  static async createPdfTemplate(template: PdfTemplate): Promise<{ success: boolean; templateId?: number }> {
    try {
      const result = await sql`
        INSERT INTO pdf_templates (
          name, name_ar, template_type, html_template, css_styles, created_by
        ) VALUES (
          ${template.name},
          ${template.nameAr},
          ${template.templateType},
          ${template.htmlTemplate},
          ${template.cssStyles || null},
          ${template.createdBy || null}
        ) RETURNING id
      `;
      
      return { success: true, templateId: result[0]?.id };
    } catch (error) {
      console.error('Error creating PDF template:', error);
      throw error;
    }
  }

  // PDF Generation Operations
  static async generatePdfFromTemplate(
    templateId: number,
    data: any,
    options: {
      patientId?: string;
      visitId?: number;
      assessmentId?: string;
      generatedBy?: string;
    } = {}
  ): Promise<{ success: boolean; pdfContent?: Uint8Array; filename?: string }> {
    try {
      // Get template
      const template = await this.getPdfTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Process template with data
      const processedHtml = this.processTemplate(template.htmlTemplate, data);
      const processedCss = template.cssStyles || '';

      // Generate PDF using browser API or external service
      const pdfContent = await this.htmlToPdf(processedHtml, processedCss);
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${template.templateType}_${options.patientId || 'general'}_${timestamp}.pdf`;

      // Save generation history
      await sql`
        INSERT INTO pdf_generation_history (
          template_id, patient_id, visit_id, assessment_id,
          generated_filename, generation_data, generated_by
        ) VALUES (
          ${templateId},
          ${options.patientId || null},
          ${options.visitId || null},
          ${options.assessmentId || null},
          ${filename},
          ${JSON.stringify(data)},
          ${options.generatedBy || null}
        )
      `;

      // Save PDF file
      const pdfFile: PdfFile = {
        filename,
        originalFilename: filename,
        fileType: 'application/pdf',
        fileSize: pdfContent.length,
        content: pdfContent,
        patientId: options.patientId,
        category: 'report',
        description: `Generated from template: ${template.nameAr}`,
        uploadedBy: options.generatedBy
      };

      await this.savePdfFile(pdfFile);

      return { success: true, pdfContent, filename };
    } catch (error) {
      console.error('Error generating PDF from template:', error);
      throw error;
    }
  }

  // Template Processing
  private static processTemplate(template: string, data: any): string {
    let processed = template;
    
    // Simple template replacement (you can enhance this with a proper template engine)
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, data[key] || '');
    });

    // Handle nested objects (e.g., {{patient.nameAr}})
    const nestedRegex = /{{(\w+)\.(\w+)}}/g;
    processed = processed.replace(nestedRegex, (match, obj, prop) => {
      return data[obj] && data[obj][prop] ? data[obj][prop] : '';
    });

    // Add generation date and user
    processed = processed.replace(/{{generationDate}}/g, new Date().toLocaleDateString('ar-SA'));
    
    return processed;
  }

  // HTML to PDF conversion (placeholder - you'd integrate with a real PDF library)
  private static async htmlToPdf(html: string, css: string): Promise<Uint8Array> {
    // This is a placeholder implementation
    // In a real app, you'd use libraries like:
    // - Puppeteer
    // - html-pdf
    // - jsPDF
    // - A cloud service like PDFShift or HTMLCSSPDF
    
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>${css}</style>
        </head>
        <body>${html}</body>
      </html>
    `;
    
    // For now, return the HTML as bytes (you'll replace this with actual PDF generation)
    const encoder = new TextEncoder();
    return encoder.encode(fullHtml);
  }

  // Utility methods
  static async getPdfStats(): Promise<{
    totalPdfs: number;
    totalSize: number;
    pdfsByCategory: any[];
    recentPdfs: PdfFile[];
  }> {
    try {
      const [totalResult, sizeResult, categoryResult, recentResult] = await Promise.all([
        sql`SELECT COUNT(*) as count FROM pdf_files`,
        sql`SELECT SUM(file_size) as total_size FROM pdf_files`,
        sql`
          SELECT category, COUNT(*) as count, SUM(file_size) as size
          FROM pdf_files 
          GROUP BY category 
          ORDER BY count DESC
        `,
        sql`
          SELECT id, filename, original_filename, category, uploaded_at, uploaded_by
          FROM pdf_files 
          ORDER BY uploaded_at DESC 
          LIMIT 10
        `
      ]);

      return {
        totalPdfs: totalResult[0]?.count || 0,
        totalSize: sizeResult[0]?.total_size || 0,
        pdfsByCategory: categoryResult,
        recentPdfs: recentResult
      };
    } catch (error) {
      console.error('Error getting PDF stats:', error);
      throw error;
    }
  }

  // Search PDFs
  static async searchPdfs(
    searchTerm: string,
    category?: string,
    patientId?: string
  ): Promise<PdfFile[]> {
    try {
      let query = `
        SELECT p.*, pt.name_ar as patient_name
        FROM pdf_files p
        LEFT JOIN patients pt ON p.patient_id = pt.national_id
        WHERE (
          p.filename ILIKE ${'%' + searchTerm + '%'} OR
          p.original_filename ILIKE ${'%' + searchTerm + '%'} OR
          p.description ILIKE ${'%' + searchTerm + '%'} OR
          pt.name_ar ILIKE ${'%' + searchTerm + '%'}
        )
      `;
      
      const params = [searchTerm];
      
      if (category) {
        query += ` AND p.category = $${params.length + 1}`;
        params.push(category);
      }
      
      if (patientId) {
        query += ` AND p.patient_id = $${params.length + 1}`;
        params.push(patientId);
      }
      
      query += ` ORDER BY p.uploaded_at DESC LIMIT 50`;
      
      const result = await sql.unsafe(query, params);
      return result;
    } catch (error) {
      console.error('Error searching PDFs:', error);
      throw error;
    }
  }
}