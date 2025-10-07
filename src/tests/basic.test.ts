import { describe, it, expect } from 'vitest';

describe('Basic Test Setup', () => {
  it('should run basic test correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle Arabic text regex', () => {
    const arabicText = 'محمد أحمد';
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
    expect(arabicRegex.test(arabicText)).toBe(true);
  });

  it('should validate mock patient data structure', () => {
    const mockPatient = {
      nationalId: '1234567890',
      nameAr: 'محمد أحمد السالم',
      phone: '0501234567',
      status: 'active',
    };

    expect(mockPatient.nameAr).toBeTruthy();
    expect(mockPatient.nationalId).toHaveLength(10);
    expect(mockPatient.phone).toMatch(/^05\d{8}$/);
  });
});