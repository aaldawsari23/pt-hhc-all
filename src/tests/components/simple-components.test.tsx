import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Simple component for testing
const SimplePatientCard = ({ patient }: { patient: any }) => {
  return (
    <div data-testid="patient-card">
      <h3 data-testid="patient-name">{patient.nameAr}</h3>
      <p data-testid="patient-id">{patient.nationalId}</p>
    </div>
  );
};

describe('Simple Component Tests', () => {
  const mockPatient = {
    nameAr: 'محمد أحمد السالم',
    nationalId: '1234567890',
  };

  it('should render patient card with Arabic name', () => {
    render(<SimplePatientCard patient={mockPatient} />);
    
    expect(screen.getByTestId('patient-name')).toHaveTextContent('محمد أحمد السالم');
    expect(screen.getByTestId('patient-id')).toHaveTextContent('1234567890');
  });

  it('should validate Arabic text content', () => {
    render(<SimplePatientCard patient={mockPatient} />);
    
    const nameElement = screen.getByTestId('patient-name');
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
    
    expect(arabicRegex.test(nameElement.textContent || '')).toBe(true);
  });
});