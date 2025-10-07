import { repo } from '../../data/local/repo';
import type { Patient, Note } from '../../data/models';

export async function seedTestData() {
  console.log('🌱 Seeding test data...');

  // Add test patients
  const patients: Omit<Patient, 'id'>[] = [
    {
      name: 'أحمد محمد السعد',
      mrn: 'KAH-2024-001',
      dob: '1960-05-15',
      phones: ['0501234567', '0112345678'],
      address: 'حي النسيم، الرياض',
      diagnoses: ['Diabetes Mellitus Type 2', 'Hypertension', 'Chronic Kidney Disease'],
      redFlags: ['High fall risk', 'Multiple medications'],
      tags: ['VIP', 'Chronic', 'Monitoring'],
    },
    {
      name: 'فاطمة علي الزهراني',
      mrn: 'KAH-2024-002',
      dob: '1975-03-22',
      phones: ['0507654321'],
      address: 'حي الملك فهد، جدة',
      diagnoses: ['Post-surgical wound care', 'Hypertension'],
      redFlags: ['Wound infection risk'],
      tags: ['Post-op', 'Wound care'],
    },
    {
      name: 'محمد عبدالله القحطاني',
      mrn: 'KAH-2024-003',
      dob: '1955-12-10',
      phones: ['0555555555'],
      address: 'حي الصفا، الدمام',
      diagnoses: ['COPD', 'Heart Failure'],
      redFlags: ['Oxygen dependent', 'Frequent hospitalizations'],
      tags: ['Critical', 'Respiratory'],
    },
    {
      name: 'سارة أحمد المطيري',
      mrn: 'KAH-2024-004',
      dob: '1980-08-30',
      phones: ['0509876543'],
      address: 'حي العليا، الرياض',
      diagnoses: ['Pregnancy complications', 'Gestational diabetes'],
      redFlags: ['High-risk pregnancy'],
      tags: ['Pregnancy', 'Monitoring'],
    },
    {
      name: 'عبدالرحمن سعد النعيمي',
      mrn: 'KAH-2024-005',
      dob: '1945-01-18',
      phones: ['0503332222'],
      address: 'حي الربوة، الرياض',
      diagnoses: ['Stroke rehabilitation', 'Diabetes', 'Atrial fibrillation'],
      redFlags: ['Anticoagulation monitoring', 'Fall risk'],
      tags: ['Neuro', 'Rehab', 'Anticoag'],
    },
  ];

  // Register staff roles first
  const staffRoles = [
    { name: 'د. أحمد محمد', role: 'Physician' as const },
    { name: 'أ. فاطمة علي', role: 'Nurse' as const },
    { name: 'أ. سارة أحمد', role: 'SW' as const },
    { name: 'أ. محمد عبدالله', role: 'PT' as const },
    { name: 'أبو سعد', role: 'Driver' as const },
  ];

  for (const staff of staffRoles) {
    await repo.upsertRole(staff.name, staff.role);
  }

  // Add patients and collect their IDs
  const patientIds: string[] = [];
  for (const patient of patients) {
    const created = await repo.addPatient(patient);
    patientIds.push(created.id);
  }

  // Generate sample notes for each patient
  const noteTemplates = [
    { type: 'assessment', authorRole: 'Physician', authorName: 'د. أحمد محمد', text: 'Initial assessment completed. Patient is stable with controlled vital signs. Continue current medication regimen.' },
    { type: 'general', authorRole: 'Nurse', authorName: 'أ. فاطمة علي', text: 'Wound dressing changed. Site appears clean with no signs of infection. Patient education provided regarding wound care.' },
    { type: 'contact', authorRole: 'SW', authorName: 'أ. سارة أحمد', text: 'Spoke with family regarding social support needs. Arranged for home care assistance 3x weekly.' },
    { type: 'plan', authorRole: 'PT', authorName: 'أ. محمد عبدالله', text: 'Physical therapy session completed. Patient showing improvement in mobility. Continue exercises as prescribed.' },
    { type: 'risk', authorRole: 'Nurse', authorName: 'أ. فاطمة علي', text: 'Fall risk assessment updated. Recommended bathroom safety equipment installation.' },
    { type: 'general', authorRole: 'Physician', authorName: 'د. أحمد محمد', text: 'Lab results reviewed. HbA1c shows improvement. Adjust insulin dosage accordingly.' },
    { type: 'contact', authorRole: 'Driver', authorName: 'أبو سعد', text: 'Transportation arranged for next appointment. Family confirmed pickup time.' },
    { type: 'assessment', authorRole: 'SW', authorName: 'أ. سارة أحمد', text: 'Psychosocial assessment indicates good family support. No immediate concerns noted.' },
  ];

  // Add notes for each patient
  for (let i = 0; i < patientIds.length; i++) {
    const patientId = patientIds[i];
    
    // Add 8-12 notes per patient with varying dates
    const noteCount = 8 + Math.floor(Math.random() * 5);
    
    for (let j = 0; j < noteCount; j++) {
      const template = noteTemplates[j % noteTemplates.length];
      const daysAgo = Math.floor(Math.random() * 30); // Random day in last 30 days
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() - daysAgo);
      
      await repo.addNote({
        patientId,
        type: template.type as any,
        authorRole: template.authorRole as any,
        authorName: template.authorName,
        text: `${template.text} (Visit #${j + 1})`,
        tags: j % 3 === 0 ? ['follow-up', 'routine'] : j % 4 === 0 ? ['urgent'] : undefined,
      });
    }
  }

  console.log(`✅ Seeded ${patients.length} patients with ~${patients.length * 10} notes`);
  return { patientCount: patients.length, noteCount: patients.length * 10 };
}