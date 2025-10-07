// Test setup file
import React from 'react';
import { vi, beforeAll, afterAll } from 'vitest';
import '@testing-library/jest-dom';

// Mock global fetch for API calls
global.fetch = vi.fn();

// Mock IndexedDB for local data storage tests
const mockIDB = {
  open: vi.fn(() => Promise.resolve({
    transaction: vi.fn(() => ({
      objectStore: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve(null)),
        put: vi.fn(() => Promise.resolve()),
        add: vi.fn(() => Promise.resolve()),
        delete: vi.fn(() => Promise.resolve()),
        getAllKeys: vi.fn(() => Promise.resolve([])),
        getAll: vi.fn(() => Promise.resolve([])),
      })),
    })),
    close: vi.fn(),
  })),
  deleteDatabase: vi.fn(() => Promise.resolve()),
};
global.indexedDB = mockIDB as any;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock window.print for print functionality tests
Object.defineProperty(window, 'print', {
  value: vi.fn(),
  writable: true,
});

// Mock ResizeObserver for mobile layout tests
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver for scroll-based features
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock navigator for mobile detection
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Mobile)',
  writable: true,
});

// Mock CSS.supports for RTL detection
global.CSS = {
  supports: vi.fn(() => true),
} as any;

// Mock qrcode library
vi.mock('qrcode', () => ({
  toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,mock-qr-code')),
}));

// Mock react-window components for virtualized lists
vi.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount, itemSize }: any) => {
    const items = Array.from({ length: Math.min(itemCount, 10) }, (_, index) => 
      children({ index, style: { height: itemSize } })
    );
    return React.createElement('div', { 'data-testid': 'virtualized-list' }, items);
  },
}));

// Test utilities for Arabic text validation
export const isArabicText = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
  return arabicRegex.test(text);
};

export const isRTLLayout = (element: HTMLElement): boolean => {
  const computedStyle = window.getComputedStyle(element);
  return computedStyle.direction === 'rtl';
};

// Mock patient data for tests
export const mockPatientData = {
  nationalId: '1234567890',
  nameAr: 'محمد أحمد السالم',
  phone: '0501234567',
  areaId: 'الحي الأول',
  status: 'active' as const,
  level: 'متوسط',
  bradenScore: 15,
  minMonthlyRequired: 4,
  admissionDate: '2024-01-01',
  gmapsUrl: true,
  hasCatheter: false,
  wounds: { presentCount: 0, healedCount: 2 },
  ngTube: false,
  gTube: false,
  fallHighRisk: false,
  ivTherapy: false,
  ventSupport: false,
  lastVisit: '2024-01-15',
  sex: 'Male' as const,
  tags: ['السكري', 'الضغط'],
  assessments: [],
  contactAttempts: [],
};

export const mockStaffData = {
  الاسم: 'د. سعد المحمد',
  المهنة: 'طبيب',
  الايميل: 'dr.saad@hospital.sa',
  الجوال: '0501234567',
  رقم_الهوية: '1234567890',
};

// Console error suppression for expected test warnings
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
       args[0].includes('Warning: Each child in a list should have a unique "key" prop'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});