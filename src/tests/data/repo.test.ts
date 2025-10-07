import { describe, it, expect, vi } from 'vitest';

// Mock the storage functions completely
vi.mock('../../data/local/storage', () => ({
  readDB: vi.fn().mockResolvedValue({
    __version: 3,
    patients: [],
    notes: [],
    assessments: [],
    contacts: [],
    tasks: [],
    files: [],
    rolesDirectory: [],
  }),
  writeDB: vi.fn().mockResolvedValue(undefined),
}));

// Import after mocking
const { repo } = await import('../../data/local/repo');

describe('Repository Tests', () => {
  describe('Basic functionality', () => {
    it('should have basic repo methods', () => {
      expect(repo).toBeDefined();
      expect(repo.listPatients).toBeInstanceOf(Function);
      expect(repo.addPatient).toBeInstanceOf(Function);
      expect(repo.addNote).toBeInstanceOf(Function);
    });

    it('should handle patient operations', async () => {
      const testPatient = {
        name: 'مريض تجريبي',
        mrn: 'TEST-001',
        phones: ['0501234567'],
      };

      const result = await repo.addPatient(testPatient);
      expect(result.id).toBeDefined();
      expect(result.name).toBe(testPatient.name);
      expect(result.mrn).toBe(testPatient.mrn);
    });

    it('should list patients correctly', async () => {
      const patients = await repo.listPatients();
      expect(Array.isArray(patients)).toBe(true);
    });
  });

  describe('Role Management', () => {
    it('should handle role upsert operations', async () => {
      // This should not throw
      await repo.upsertRole('د. أحمد', 'Physician');
      expect(true).toBe(true);
    });

    it('should reject conflicting roles', async () => {
      try {
        await repo.upsertRole('د. سعد', 'Physician');
        await repo.upsertRole('د. سعد', 'Nurse'); // Should throw
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('د. سعد');
      }
    });
  });
});