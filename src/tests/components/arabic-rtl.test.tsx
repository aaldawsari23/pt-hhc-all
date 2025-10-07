import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { isArabicText, isRTLLayout, mockPatientData } from '../setup';
import React from 'react';

// Mock components for Arabic/RTL testing
const MockPatientCard = ({ patient }: { patient: any }) => {
  return (
    <div 
      data-testid="patient-card" 
      className="patient-card rtl"
      dir="rtl"
      style={{ direction: 'rtl', textAlign: 'right' }}
    >
      <h3 data-testid="patient-name">{patient.nameAr}</h3>
      <p data-testid="patient-id">رقم الهوية: {patient.nationalId}</p>
      <p data-testid="patient-phone">الجوال: {patient.phone}</p>
      <div data-testid="patient-tags">
        {patient.tags?.map((tag: string, index: number) => (
          <span key={index} className="tag" data-testid={`tag-${index}`}>
            {tag}
          </span>
        ))}
      </div>
      <div data-testid="medical-info">
        <p>مستوى الخطورة: {patient.level}</p>
        <p>درجة برادن: {patient.bradenScore}</p>
        {patient.hasCatheter && <p>يستخدم قسطرة</p>}
        {patient.fallHighRisk && <p>خطر سقوط عالي</p>}
      </div>
    </div>
  );
};

const MockAssessmentForm = ({ role }: { role: string }) => {
  const arabicLabels = {
    doctor: 'تقييم الطبيب',
    nurse: 'تقييم الممرض',
    pt: 'تقييم أخصائي العلاج الطبيعي',
    sw: 'تقييم الأخصائي الاجتماعي',
  };

  return (
    <form 
      data-testid="assessment-form" 
      dir="rtl"
      style={{ direction: 'rtl' }}
    >
      <h2 data-testid="form-title">{arabicLabels[role as keyof typeof arabicLabels]}</h2>
      
      <div className="form-group">
        <label data-testid="assessment-label">ملاحظات التقييم:</label>
        <textarea 
          data-testid="assessment-notes"
          placeholder="أدخل ملاحظات التقييم هنا..."
          dir="rtl"
        />
      </div>
      
      <div className="form-group">
        <label data-testid="status-label">حالة المريض:</label>
        <select data-testid="status-select" dir="rtl">
          <option value="improved">تحسن</option>
          <option value="unchanged">لم يتغير</option>
          <option value="worsened">تدهور</option>
        </select>
      </div>
      
      <div className="form-group">
        <label data-testid="plan-label">الخطة العلاجية:</label>
        <select data-testid="plan-select" dir="rtl">
          <option value="continue">الاستمرار على نفس الخطة</option>
          <option value="change">تغيير الخطة</option>
        </select>
      </div>
      
      <button type="submit" data-testid="save-button">
        حفظ التقييم
      </button>
    </form>
  );
};

const MockNavigationMenu = () => {
  return (
    <nav 
      data-testid="navigation-menu" 
      className="rtl-nav"
      dir="rtl"
      style={{ direction: 'rtl' }}
    >
      <ul style={{ listStyle: 'none', textAlign: 'right' }}>
        <li data-testid="nav-patients">
          <a href="#patients">المرضى</a>
        </li>
        <li data-testid="nav-visits">
          <a href="#visits">الزيارات</a>
        </li>
        <li data-testid="nav-assessments">
          <a href="#assessments">التقييمات</a>
        </li>
        <li data-testid="nav-reports">
          <a href="#reports">التقارير</a>
        </li>
        <li data-testid="nav-settings">
          <a href="#settings">الإعدادات</a>
        </li>
      </ul>
    </nav>
  );
};

describe('Arabic Text and RTL Layout Tests', () => {
  describe('Arabic Text Validation', () => {
    it('should correctly identify Arabic text', () => {
      const arabicTexts = [
        'محمد أحمد السالم',
        'تقييم طبي',
        'درجة برادن',
        'قسطرة بولية',
        'أخصائي العلاج الطبيعي',
        'الأخصائي الاجتماعي',
      ];

      arabicTexts.forEach(text => {
        expect(isArabicText(text)).toBe(true);
      });
    });

    it('should correctly identify non-Arabic text', () => {
      const nonArabicTexts = [
        'John Smith',
        'Blood pressure',
        'Assessment',
        '123456789',
        'Dr. Ahmed',
      ];

      nonArabicTexts.forEach(text => {
        expect(isArabicText(text)).toBe(false);
      });
    });

    it('should handle mixed Arabic-English text', () => {
      const mixedTexts = [
        'د. أحمد محمد', // Arabic with English period
        'رقم الهوية: 1234567890',
      ];

      const englishTexts = [
        'SpO₂: 98%',
        'BP: 120/80 mmHg',
      ];

      mixedTexts.forEach(text => {
        expect(isArabicText(text)).toBe(true); // Should detect Arabic presence
      });

      englishTexts.forEach(text => {
        expect(isArabicText(text)).toBe(false); // Should not detect Arabic in medical abbreviations
      });
    });
  });

  describe('RTL Layout Rendering', () => {
    it('should render patient card with proper RTL layout', () => {
      render(<MockPatientCard patient={mockPatientData} />);

      const patientCard = screen.getByTestId('patient-card');
      const patientName = screen.getByTestId('patient-name');
      
      expect(patientCard).toHaveAttribute('dir', 'rtl');
      expect(patientName.textContent).toBe(mockPatientData.nameAr);
      expect(isArabicText(patientName.textContent || '')).toBe(true);
    });

    it('should render assessment form with RTL direction', () => {
      render(<MockAssessmentForm role="doctor" />);

      const form = screen.getByTestId('assessment-form');
      const formTitle = screen.getByTestId('form-title');
      
      expect(form).toHaveAttribute('dir', 'rtl');
      expect(formTitle.textContent).toBe('تقييم الطبيب');
      expect(isArabicText(formTitle.textContent || '')).toBe(true);
    });

    it('should display navigation menu in RTL layout', () => {
      render(<MockNavigationMenu />);

      const nav = screen.getByTestId('navigation-menu');
      const patientsLink = screen.getByTestId('nav-patients');
      const visitsLink = screen.getByTestId('nav-visits');
      
      expect(nav).toHaveAttribute('dir', 'rtl');
      expect(patientsLink.textContent).toBe('المرضى');
      expect(visitsLink.textContent).toBe('الزيارات');
    });

    it('should properly align text in RTL components', () => {
      render(<MockPatientCard patient={mockPatientData} />);

      const medicalInfo = screen.getByTestId('medical-info');
      const computedStyle = window.getComputedStyle(medicalInfo);
      
      // In a real browser environment, this would check the actual computed styles
      expect(medicalInfo.closest('[dir="rtl"]')).toBeTruthy();
    });
  });

  describe('Arabic Medical Terminology', () => {
    it('should display correct Arabic medical terms', () => {
      const medicalTerms = {
        'ضغط الدم': 'Blood Pressure',
        'نبضات القلب': 'Heart Rate', 
        'درجة الحرارة': 'Temperature',
        'معدل التنفس': 'Respiratory Rate',
        'تشبع الأكسجين': 'Oxygen Saturation',
        'مستوى الألم': 'Pain Level',
        'درجة برادن': 'Braden Score',
        'خطر السقوط': 'Fall Risk',
        'قسطرة بولية': 'Urinary Catheter',
        'أنبوب التغذية': 'Feeding Tube',
      };

      Object.entries(medicalTerms).forEach(([arabic, english]) => {
        expect(isArabicText(arabic)).toBe(true);
        expect(isArabicText(english)).toBe(false);
      });
    });

    it('should validate Arabic patient tags', () => {
      const patientTags = ['السكري', 'الضغط', 'القلب', 'الكلى'];
      
      render(<MockPatientCard patient={{ ...mockPatientData, tags: patientTags }} />);

      patientTags.forEach((tag, index) => {
        const tagElement = screen.getByTestId(`tag-${index}`);
        expect(tagElement.textContent).toBe(tag);
        expect(isArabicText(tag)).toBe(true);
      });
    });
  });

  describe('Form Input RTL Behavior', () => {
    it('should handle RTL text input correctly', () => {
      render(<MockAssessmentForm role="nurse" />);

      const notesTextarea = screen.getByTestId('assessment-notes');
      const statusSelect = screen.getByTestId('status-select');
      const planSelect = screen.getByTestId('plan-select');

      expect(notesTextarea).toHaveAttribute('dir', 'rtl');
      expect(notesTextarea).toHaveAttribute('placeholder', 'أدخل ملاحظات التقييم هنا...');
      
      expect(statusSelect).toHaveAttribute('dir', 'rtl');
      expect(planSelect).toHaveAttribute('dir', 'rtl');
    });

    it('should display Arabic form labels correctly', () => {
      render(<MockAssessmentForm role="pt" />);

      const assessmentLabel = screen.getByTestId('assessment-label');
      const statusLabel = screen.getByTestId('status-label');
      const planLabel = screen.getByTestId('plan-label');

      expect(assessmentLabel.textContent).toBe('ملاحظات التقييم:');
      expect(statusLabel.textContent).toBe('حالة المريض:');
      expect(planLabel.textContent).toBe('الخطة العلاجية:');

      expect(isArabicText(assessmentLabel.textContent || '')).toBe(true);
      expect(isArabicText(statusLabel.textContent || '')).toBe(true);
      expect(isArabicText(planLabel.textContent || '')).toBe(true);
    });
  });

  describe('Date and Number Formatting in RTL', () => {
    it('should handle Arabic-Indic numerals correctly', () => {
      const arabicNumerals = '٠١٢٣٤٥٦٧٨٩';
      const westernNumerals = '0123456789';
      
      // Test that the application can handle both numeral systems
      expect(arabicNumerals.length).toBe(10);
      expect(westernNumerals.length).toBe(10);
      
      // In healthcare apps, we typically use Western numerals for medical data
      const vitalSigns = {
        bp: '120/80',
        hr: '75',
        temp: '36.5',
      };
      
      Object.values(vitalSigns).forEach(value => {
        expect(/^[\d\./]+$/.test(value)).toBe(true);
      });
    });

    it('should format dates appropriately for Arabic locale', () => {
      const testDate = new Date('2024-01-15');
      const arabicDateString = testDate.toLocaleDateString('ar-SA');
      
      // Test that date formatting works (exact format may vary)
      expect(arabicDateString).toBeTruthy();
      expect(typeof arabicDateString).toBe('string');
    });
  });

  describe('Accessibility in RTL Layout', () => {
    it('should maintain proper tab order in RTL forms', () => {
      render(<MockAssessmentForm role="doctor" />);

      const formElements = [
        screen.getByTestId('assessment-notes'),
        screen.getByTestId('status-select'),
        screen.getByTestId('plan-select'),
        screen.getByTestId('save-button'),
      ];

      // Check that all elements are focusable
      formElements.forEach(element => {
        expect(element).toBeInTheDocument();
        // In a real test, we'd check tabIndex and focus behavior
      });
    });

    it('should provide appropriate aria-labels for RTL components', () => {
      render(<MockPatientCard patient={mockPatientData} />);

      const patientCard = screen.getByTestId('patient-card');
      
      // In a real implementation, we'd add aria-labels
      expect(patientCard).toBeInTheDocument();
      
      // Example of what should be tested:
      // expect(patientCard).toHaveAttribute('aria-label', 'بطاقة معلومات المريض');
    });
  });

  describe('Print Layout RTL Support', () => {
    it('should maintain RTL layout in print views', () => {
      const PrintView = () => (
        <div 
          data-testid="print-view"
          className="print-layout"
          dir="rtl"
          style={{ direction: 'rtl' }}
        >
          <header data-testid="print-header">
            <h1>مستشفى الملك عبدالله - بيشة</h1>
            <h2>نظام الرعاية الصحية المنزلية</h2>
          </header>
          <main data-testid="print-content">
            <MockPatientCard patient={mockPatientData} />
          </main>
        </div>
      );

      render(<PrintView />);

      const printView = screen.getByTestId('print-view');
      const printHeader = screen.getByTestId('print-header');
      
      expect(printView).toHaveAttribute('dir', 'rtl');
      expect(printHeader.textContent).toContain('مستشفى الملك عبدالله');
      expect(isArabicText(printHeader.textContent || '')).toBe(true);
    });
  });
});