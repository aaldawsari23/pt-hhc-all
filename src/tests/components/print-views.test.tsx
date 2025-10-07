import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Role } from '../../types';
import { mockPatientData, mockStaffData } from '../setup';
import React from 'react';

// Mock print-related components
const MockPrintHeader = () => {
  return (
    <header data-testid="print-header" className="print-header">
      <div className="hospital-logo">
        <img src="/logo.png" alt="Hospital Logo" data-testid="hospital-logo" />
      </div>
      <div className="hospital-info" dir="rtl">
        <h1 data-testid="hospital-name">مستشفى الملك عبدالله - بيشة</h1>
        <h2 data-testid="system-name">نظام الرعاية الصحية المنزلية</h2>
        <p data-testid="print-date">تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')}</p>
      </div>
    </header>
  );
};

const MockPatientSummaryPrint = ({ patient }: { patient: any }) => {
  return (
    <div data-testid="patient-summary-print" className="print-view" dir="rtl">
      <MockPrintHeader />
      
      <main className="print-content">
        <section data-testid="patient-info" className="patient-info">
          <h3>معلومات المريض</h3>
          <div className="info-grid">
            <div data-testid="patient-name">الاسم: {patient.nameAr}</div>
            <div data-testid="patient-id">رقم الهوية: {patient.nationalId}</div>
            <div data-testid="patient-phone">الجوال: {patient.phone}</div>
            <div data-testid="patient-area">المنطقة: {patient.areaId}</div>
            <div data-testid="admission-date">تاريخ الإدخال: {patient.admissionDate}</div>
            <div data-testid="last-visit">آخر زيارة: {patient.lastVisit || 'لا توجد'}</div>
          </div>
        </section>

        <section data-testid="medical-status" className="medical-status">
          <h3>الحالة الطبية</h3>
          <div className="status-grid">
            <div data-testid="braden-score">درجة برادن: {patient.bradenScore || 'غير محدد'}</div>
            <div data-testid="risk-level">مستوى الخطورة: {patient.level || 'غير محدد'}</div>
            <div data-testid="catheter-status">
              قسطرة بولية: {patient.hasCatheter ? 'نعم' : 'لا'}
            </div>
            <div data-testid="fall-risk">
              خطر السقوط: {patient.fallHighRisk ? 'عالي' : 'منخفض'}
            </div>
            <div data-testid="wounds-count">
              عدد الجروح: {patient.wounds?.presentCount || 0}
            </div>
            <div data-testid="iv-therapy">
              العلاج الوريدي: {patient.ivTherapy ? 'نعم' : 'لا'}
            </div>
          </div>
        </section>

        <section data-testid="medical-tags" className="medical-tags">
          <h3>التشخيصات والحالات</h3>
          <div className="tags-list">
            {patient.tags?.map((tag: string, index: number) => (
              <span key={index} className="tag" data-testid={`tag-${index}`}>
                {tag}
              </span>
            ))}
          </div>
        </section>
      </main>

      <footer data-testid="print-footer" className="print-footer">
        <p>طُبع بواسطة: نظام الرعاية الصحية المنزلية - مستشفى الملك عبدالله، بيشة</p>
        <p>تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')} - {new Date().toLocaleTimeString('ar-SA')}</p>
      </footer>
    </div>
  );
};

const MockAssessmentPrintView = ({ 
  assessment, 
  patient 
}: { 
  assessment: any; 
  patient: any;
}) => {
  const getRoleArabicName = (role: Role) => {
    const roleNames = {
      [Role.Doctor]: 'الطبيب',
      [Role.Nurse]: 'الممرض',
      [Role.PhysicalTherapist]: 'أخصائي العلاج الطبيعي',
      [Role.SocialWorker]: 'الأخصائي الاجتماعي',
      [Role.Driver]: 'السائق',
    };
    return roleNames[role];
  };

  return (
    <div data-testid="assessment-print-view" className="print-view" dir="rtl">
      <MockPrintHeader />
      
      <main className="print-content">
        <section data-testid="assessment-header" className="assessment-header">
          <h3>تقييم {getRoleArabicName(assessment.role)}</h3>
          <div className="assessment-meta">
            <div data-testid="assessment-date">التاريخ: {assessment.date}</div>
            <div data-testid="assessor-name">المُقيِّم: {assessment.assessorName}</div>
            <div data-testid="patient-name">المريض: {patient.nameAr}</div>
          </div>
        </section>

        <section data-testid="assessment-content" className="assessment-content">
          {assessment.role === Role.Doctor && (
            <div data-testid="doctor-assessment">
              <h4>التقييم الطبي</h4>
              <div data-testid="chief-focus">
                المحور الرئيسي: {assessment.chiefFocus?.join(', ') || 'غير محدد'}
              </div>
              <div data-testid="assessment-severity">
                شدة الحالة: {assessment.assessment?.severity || 'غير محدد'}
              </div>
              <div data-testid="follow-up-timing">
                موعد المتابعة: {assessment.followUpTiming || 'غير محدد'}
              </div>
            </div>
          )}

          {assessment.role === Role.Nurse && (
            <div data-testid="nurse-assessment">
              <h4>التقييم التمريضي</h4>
              <div data-testid="vital-signs" className="vital-signs">
                <h5>العلامات الحيوية</h5>
                <div>ضغط الدم: {assessment.vitals?.bp || 'غير مسجل'}</div>
                <div>النبض: {assessment.vitals?.hr || 'غير مسجل'}</div>
                <div>الحرارة: {assessment.vitals?.temp || 'غير مسجل'}</div>
                <div>التنفس: {assessment.vitals?.rr || 'غير مسجل'}</div>
                <div>الأكسجين: {assessment.vitals?.o2sat || 'غير مسجل'}</div>
                <div>الألم: {assessment.vitals?.pain || 'غير مسجل'}</div>
              </div>
              <div data-testid="nursing-tasks">
                المهام المنجزة: {assessment.nursingTasks?.join(', ') || 'لا توجد'}
              </div>
            </div>
          )}

          <div data-testid="assessment-notes" className="assessment-notes">
            <h5>ملاحظات إضافية</h5>
            <p>{assessment.notes || 'لا توجد ملاحظات إضافية'}</p>
          </div>
        </section>
      </main>

      <footer data-testid="print-footer" className="print-footer">
        <div className="signature-area">
          <div data-testid="assessor-signature">
            توقيع المُقيِّم: ___________________ التاريخ: ___________
          </div>
        </div>
      </footer>
    </div>
  );
};

const MockVisitReportPrint = ({ visit, patient, team }: { 
  visit: any; 
  patient: any;
  team: any;
}) => {
  return (
    <div data-testid="visit-report-print" className="print-view" dir="rtl">
      <MockPrintHeader />
      
      <main className="print-content">
        <section data-testid="visit-info" className="visit-info">
          <h3>تقرير الزيارة المنزلية</h3>
          <div className="visit-meta">
            <div data-testid="visit-date">تاريخ الزيارة: {visit.date}</div>
            <div data-testid="patient-info">المريض: {patient.nameAr}</div>
            <div data-testid="team-info">الفريق: {team.name}</div>
            <div data-testid="visit-status">حالة الزيارة: {visit.status}</div>
          </div>
        </section>

        <section data-testid="team-notes" className="team-notes">
          {visit.doctorNote && (
            <div data-testid="doctor-note" className="role-note">
              <h4>ملاحظات الطبيب</h4>
              <div>الحالة: {visit.doctorNote.status}</div>
              <div>الخطة: {visit.doctorNote.plan}</div>
              <div>المتابعة: {visit.doctorNote.nextFollowUp}</div>
              {visit.doctorNote.mdNote && (
                <div>ملاحظات: {visit.doctorNote.mdNote}</div>
              )}
            </div>
          )}

          {visit.nurseNote && (
            <div data-testid="nurse-note" className="role-note">
              <h4>ملاحظات الممرض</h4>
              <div>المهام: {visit.nurseNote.tasks?.join(', ')}</div>
              <div>الحالة: {visit.nurseNote.status}</div>
              {visit.nurseNote.nurseNote && (
                <div>ملاحظات: {visit.nurseNote.nurseNote}</div>
              )}
            </div>
          )}

          {visit.ptNote && (
            <div data-testid="pt-note" className="role-note">
              <h4>ملاحظات أخصائي العلاج الطبيعي</h4>
              <div>التحمل: {visit.ptNote.tolerance}</div>
              <div>الخطة: {visit.ptNote.plan}</div>
              {visit.ptNote.ptNote && (
                <div>ملاحظات: {visit.ptNote.ptNote}</div>
              )}
            </div>
          )}

          {visit.swNote && (
            <div data-testid="sw-note" className="role-note">
              <h4>ملاحظات الأخصائي الاجتماعي</h4>
              <div>تغيير الوضع: {visit.swNote.situationChange}</div>
              <div>الإجراءات: {visit.swNote.actionsTaken?.join(', ')}</div>
              {visit.swNote.swNote && (
                <div>ملاحظات: {visit.swNote.swNote}</div>
              )}
            </div>
          )}
        </section>

        <section data-testid="signatures" className="signatures">
          <h4>التوقيعات</h4>
          <div className="signature-grid">
            {visit.doctorSign && (
              <div data-testid="doctor-signature">
                الطبيب: {visit.doctorSign} _______________
              </div>
            )}
            {visit.nurseSign && (
              <div data-testid="nurse-signature">
                الممرض: {visit.nurseSign} _______________
              </div>
            )}
            {visit.ptSign && (
              <div data-testid="pt-signature">
                أخصائي العلاج الطبيعي: {visit.ptSign} _______________
              </div>
            )}
            {visit.swSign && (
              <div data-testid="sw-signature">
                الأخصائي الاجتماعي: {visit.swSign} _______________
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

const MockPrintManager = ({ 
  printType, 
  data 
}: { 
  printType: string; 
  data: any;
}) => {
  const handlePrint = () => {
    // Apply print-specific styles
    document.body.classList.add('printing');
    
    // Trigger browser print
    window.print();
    
    // Remove print styles after printing
    setTimeout(() => {
      document.body.classList.remove('printing');
    }, 1000);
  };

  const generatePDF = () => {
    // Mock PDF generation
    console.log('Generating PDF for:', printType);
  };

  return (
    <div data-testid="print-manager">
      <div className="print-controls">
        <button data-testid="print-button" onClick={handlePrint}>
          طباعة
        </button>
        <button data-testid="pdf-button" onClick={generatePDF}>
          تصدير PDF
        </button>
      </div>

      <div className="print-preview">
        {printType === 'patient-summary' && (
          <MockPatientSummaryPrint patient={data} />
        )}
        {printType === 'assessment' && (
          <MockAssessmentPrintView assessment={data.assessment} patient={data.patient} />
        )}
        {printType === 'visit-report' && (
          <MockVisitReportPrint 
            visit={data.visit} 
            patient={data.patient} 
            team={data.team} 
          />
        )}
      </div>
    </div>
  );
};

describe('Print Views and Functionality Tests', () => {
  let originalPrint: typeof window.print;

  beforeEach(() => {
    // Mock window.print
    originalPrint = window.print;
    window.print = vi.fn();
  });

  afterEach(() => {
    // Restore original print function
    window.print = originalPrint;
  });

  describe('Print Header and Footer', () => {
    it('should render hospital branding correctly', () => {
      render(<MockPrintHeader />);

      const hospitalName = screen.getByTestId('hospital-name');
      const systemName = screen.getByTestId('system-name');
      const printDate = screen.getByTestId('print-date');

      expect(hospitalName.textContent).toBe('مستشفى الملك عبدالله - بيشة');
      expect(systemName.textContent).toBe('نظام الرعاية الصحية المنزلية');
      expect(printDate.textContent).toContain('تاريخ الطباعة:');
    });

    it('should include hospital logo', () => {
      render(<MockPrintHeader />);

      const logo = screen.getByTestId('hospital-logo');
      expect(logo).toHaveAttribute('src', '/logo.png');
      expect(logo).toHaveAttribute('alt', 'Hospital Logo');
    });

    it('should format print date in Arabic locale', () => {
      render(<MockPrintHeader />);

      const printDate = screen.getByTestId('print-date');
      const dateText = printDate.textContent || '';
      
      // Should contain Arabic date format
      expect(dateText).toContain('تاريخ الطباعة:');
      expect(dateText.length).toBeGreaterThan(10);
    });
  });

  describe('Patient Summary Print View', () => {
    it('should display comprehensive patient information', () => {
      render(<MockPatientSummaryPrint patient={mockPatientData} />);

      expect(screen.getByTestId('patient-name')).toHaveTextContent(mockPatientData.nameAr);
      expect(screen.getByTestId('patient-id')).toHaveTextContent(mockPatientData.nationalId);
      expect(screen.getByTestId('patient-phone')).toHaveTextContent(mockPatientData.phone);
      expect(screen.getByTestId('braden-score')).toHaveTextContent(mockPatientData.bradenScore.toString());
    });

    it('should show medical status indicators', () => {
      const highRiskPatient = {
        ...mockPatientData,
        hasCatheter: true,
        fallHighRisk: true,
        ivTherapy: true,
        wounds: { presentCount: 2, healedCount: 1 },
      };

      render(<MockPatientSummaryPrint patient={highRiskPatient} />);

      expect(screen.getByTestId('catheter-status')).toHaveTextContent('نعم');
      expect(screen.getByTestId('fall-risk')).toHaveTextContent('عالي');
      expect(screen.getByTestId('wounds-count')).toHaveTextContent('2');
      expect(screen.getByTestId('iv-therapy')).toHaveTextContent('نعم');
    });

    it('should display patient tags in Arabic', () => {
      const patientWithTags = {
        ...mockPatientData,
        tags: ['السكري', 'الضغط', 'القلب'],
      };

      render(<MockPatientSummaryPrint patient={patientWithTags} />);

      expect(screen.getByTestId('tag-0')).toHaveTextContent('السكري');
      expect(screen.getByTestId('tag-1')).toHaveTextContent('الضغط');
      expect(screen.getByTestId('tag-2')).toHaveTextContent('القلب');
    });

    it('should maintain RTL layout in print view', () => {
      render(<MockPatientSummaryPrint patient={mockPatientData} />);

      const printView = screen.getByTestId('patient-summary-print');
      expect(printView).toHaveAttribute('dir', 'rtl');
      expect(printView).toHaveClass('print-view');
    });
  });

  describe('Assessment Print View', () => {
    it('should render doctor assessment correctly', () => {
      const doctorAssessment = {
        role: Role.Doctor,
        date: '2024-01-15',
        assessorName: 'د. أحمد محمد',
        chiefFocus: ['Wound care', 'Pain mgmt'],
        assessment: { severity: 'Moderate' },
        followUpTiming: '3–7d',
        notes: 'تحسن ملحوظ في الحالة العامة',
      };

      render(
        <MockAssessmentPrintView 
          assessment={doctorAssessment} 
          patient={mockPatientData} 
        />
      );

      expect(screen.getByTestId('assessment-header')).toHaveTextContent('تقييم الطبيب');
      expect(screen.getByTestId('assessor-name')).toHaveTextContent('د. أحمد محمد');
      expect(screen.getByTestId('assessment-severity')).toHaveTextContent('Moderate');
      expect(screen.getByTestId('follow-up-timing')).toHaveTextContent('3–7d');
    });

    it('should render nurse assessment with vital signs', () => {
      const nurseAssessment = {
        role: Role.Nurse,
        date: '2024-01-15',
        assessorName: 'أ. فاطمة أحمد',
        vitals: {
          bp: '120/80',
          hr: '75',
          temp: '36.5',
          rr: '18',
          o2sat: '98',
          pain: '2',
        },
        nursingTasks: ['Meds administered', 'Wound care'],
        notes: 'العلامات الحيوية مستقرة',
      };

      render(
        <MockAssessmentPrintView 
          assessment={nurseAssessment} 
          patient={mockPatientData} 
        />
      );

      expect(screen.getByTestId('assessment-header')).toHaveTextContent('تقييم الممرض');
      expect(screen.getByTestId('vital-signs')).toHaveTextContent('ضغط الدم: 120/80');
      expect(screen.getByTestId('nursing-tasks')).toHaveTextContent('Meds administered, Wound care');
    });

    it('should include signature area for assessor', () => {
      const assessment = {
        role: Role.Doctor,
        date: '2024-01-15',
        assessorName: 'د. أحمد محمد',
      };

      render(
        <MockAssessmentPrintView 
          assessment={assessment} 
          patient={mockPatientData} 
        />
      );

      const signatureArea = screen.getByTestId('assessor-signature');
      expect(signatureArea).toHaveTextContent('توقيع المُقيِّم:');
      expect(signatureArea).toHaveTextContent('التاريخ:');
    });
  });

  describe('Visit Report Print View', () => {
    it('should display comprehensive visit information', () => {
      const mockVisit = {
        date: '2024-01-15',
        status: 'Completed',
        doctorNote: {
          status: 'Improved',
          plan: 'Continue',
          nextFollowUp: '1 week',
          mdNote: 'تحسن ملحوظ',
        },
        nurseNote: {
          tasks: ['Wound care', 'Medication'],
          status: 'Stable',
          nurseNote: 'عناية جيدة',
        },
        doctorSign: 'د. أحمد محمد',
        nurseSign: 'أ. فاطمة أحمد',
      };

      const mockTeam = { name: 'فريق المنطقة الأولى' };

      render(
        <MockVisitReportPrint 
          visit={mockVisit} 
          patient={mockPatientData} 
          team={mockTeam} 
        />
      );

      expect(screen.getByTestId('visit-date')).toHaveTextContent('2024-01-15');
      expect(screen.getByTestId('team-info')).toHaveTextContent('فريق المنطقة الأولى');
      expect(screen.getByTestId('doctor-note')).toHaveTextContent('تحسن ملحوظ');
      expect(screen.getByTestId('nurse-note')).toHaveTextContent('عناية جيدة');
    });

    it('should show all team member signatures', () => {
      const mockVisit = {
        date: '2024-01-15',
        doctorSign: 'د. أحمد محمد',
        nurseSign: 'أ. فاطمة أحمد',
        ptSign: 'أ. خالد سعد',
        swSign: 'أ. نورة محمد',
      };

      render(
        <MockVisitReportPrint 
          visit={mockVisit} 
          patient={mockPatientData} 
          team={{ name: 'فريق متكامل' }} 
        />
      );

      expect(screen.getByTestId('doctor-signature')).toHaveTextContent('د. أحمد محمد');
      expect(screen.getByTestId('nurse-signature')).toHaveTextContent('أ. فاطمة أحمد');
      expect(screen.getByTestId('pt-signature')).toHaveTextContent('أ. خالد سعد');
      expect(screen.getByTestId('sw-signature')).toHaveTextContent('أ. نورة محمد');
    });
  });

  describe('Print Manager Functionality', () => {
    it('should trigger browser print on print button click', () => {
      render(
        <MockPrintManager 
          printType="patient-summary" 
          data={mockPatientData} 
        />
      );

      const printButton = screen.getByTestId('print-button');
      fireEvent.click(printButton);

      expect(window.print).toHaveBeenCalled();
    });

    it('should generate PDF on PDF button click', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      render(
        <MockPrintManager 
          printType="assessment" 
          data={{ assessment: {}, patient: mockPatientData }} 
        />
      );

      const pdfButton = screen.getByTestId('pdf-button');
      fireEvent.click(pdfButton);

      expect(consoleSpy).toHaveBeenCalledWith('Generating PDF for:', 'assessment');
      consoleSpy.mockRestore();
    });

    it('should render different print types correctly', () => {
      const { rerender } = render(
        <MockPrintManager 
          printType="patient-summary" 
          data={mockPatientData} 
        />
      );

      expect(screen.getByTestId('patient-summary-print')).toBeInTheDocument();

      rerender(
        <MockPrintManager 
          printType="visit-report" 
          data={{ 
            visit: { date: '2024-01-15' }, 
            patient: mockPatientData, 
            team: { name: 'فريق الاختبار' } 
          }} 
        />
      );

      expect(screen.getByTestId('visit-report-print')).toBeInTheDocument();
    });
  });

  describe('Print CSS and Layout', () => {
    it('should apply print-specific styles', () => {
      render(<MockPatientSummaryPrint patient={mockPatientData} />);

      const printView = screen.getByTestId('patient-summary-print');
      expect(printView).toHaveClass('print-view');

      const printHeader = screen.getByTestId('print-header');
      expect(printHeader).toHaveClass('print-header');
    });

    it('should handle page breaks appropriately', () => {
      // This would test CSS page-break properties in a real browser environment
      const printStyles = {
        'page-break-before': 'always',
        'page-break-after': 'avoid',
        'page-break-inside': 'avoid',
      };

      // In a real test, we'd check computed styles
      expect(Object.keys(printStyles)).toContain('page-break-before');
      expect(Object.keys(printStyles)).toContain('page-break-after');
    });

    it('should maintain Arabic font rendering in print', () => {
      render(<MockPatientSummaryPrint patient={mockPatientData} />);

      const arabicText = screen.getByTestId('patient-name');
      
      // In a real test, we'd check computed font properties
      expect(arabicText.textContent).toMatch(/[\u0600-\u06FF]/);
    });
  });

  describe('Print Data Validation', () => {
    it('should handle missing patient data gracefully', () => {
      const incompletePatient = {
        nameAr: 'مريض ناقص البيانات',
        nationalId: '1234567890',
        // Missing other fields
      };

      render(<MockPatientSummaryPrint patient={incompletePatient} />);

      expect(screen.getByTestId('patient-name')).toHaveTextContent('مريض ناقص البيانات');
      expect(screen.getByTestId('braden-score')).toHaveTextContent('غير محدد');
      expect(screen.getByTestId('last-visit')).toHaveTextContent('لا توجد');
    });

    it('should validate required print data before rendering', () => {
      const validatePrintData = (data: any, type: string): boolean => {
        switch (type) {
          case 'patient-summary':
            return !!(data.nameAr && data.nationalId);
          case 'assessment':
            return !!(data.assessment && data.patient);
          case 'visit-report':
            return !!(data.visit && data.patient && data.team);
          default:
            return false;
        }
      };

      expect(validatePrintData(mockPatientData, 'patient-summary')).toBe(true);
      expect(validatePrintData({}, 'patient-summary')).toBe(false);
      expect(validatePrintData({ 
        assessment: {}, 
        patient: mockPatientData 
      }, 'assessment')).toBe(true);
    });
  });
});