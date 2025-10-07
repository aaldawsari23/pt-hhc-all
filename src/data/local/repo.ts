import { readDB, writeDB } from "./storage";
import type { 
  DBV3, Patient, Note, Assessment, ContactLog, Task, FileRecord, Role, NoteType 
} from "../models";

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function loadDB(): Promise<DBV3> {
  const existing = await readDB();
  if (existing && existing.__version === 3) {
    return existing;
  }
  
  // إنشاء قاعدة بيانات فارغة
  const newDB: DBV3 = {
    __version: 3,
    patients: [],
    notes: [],
    assessments: [],
    contacts: [],
    tasks: [],
    files: [],
    rolesDirectory: [],
  };
  
  await writeDB(newDB);
  return newDB;
}

async function save(db: DBV3): Promise<void> {
  await writeDB(db);
}

export const repo = {
  // Patients
  async listPatients() {
    const db = await loadDB();
    return db.patients;
  },
  async getPatient(id: string) {
    const db = await loadDB();
    return db.patients.find(p => p.id === id) || null;
  },
  async addPatient(p: Omit<Patient, "id">) {
    const db = await loadDB();
    const rec: Patient = { ...p, id: uid("p") };
    db.patients.push(rec);
    await save(db);
    return rec;
  },

  // Notes
  async listNotes(patientId?: string) {
    const db = await loadDB();
    return patientId ? db.notes.filter(n => n.patientId === patientId) : db.notes;
  },
  async addNote(n: Omit<Note, "id" | "createdAt">) {
    const db = await loadDB();
    // تحقق: منع تكرار الاسم عبر الأدوار (لو كان authorName ضمن دليل الأدوار)
    const roleEntry = db.rolesDirectory.find(r => r.name === n.authorName);
    if (roleEntry && roleEntry.role !== n.authorRole) {
      throw new Error(`الاسم "${n.authorName}" مستخدم بدور مختلف (${roleEntry.role}).`);
    }
    const rec: Note = { ...n, id: uid("n"), createdAt: new Date().toISOString() };
    db.notes.push(rec);
    await save(db);
    return rec;
  },

  // Assessments
  async addAssessment(a: Omit<Assessment, "id" | "createdAt">) {
    const db = await loadDB();
    // توليد Note تلقائي مرتبط
    const rec: Assessment = { ...a, id: uid("a"), createdAt: new Date().toISOString() };
    db.assessments.push(rec);
    db.notes.push({
      id: uid("n"),
      patientId: a.patientId,
      createdAt: new Date().toISOString(),
      authorRole: a.role,
      authorName: "System",
      type: "assessment",
      text: `Assessment saved (template: ${a.templateId}).`,
      linkedAssessmentId: rec.id,
    });
    await save(db);
    return rec;
  },

  // Contacts
  async addContact(c: Omit<ContactLog, "id">) {
    const db = await loadDB();
    const rec: ContactLog = { ...c, id: uid("c") };
    db.contacts.push(rec);
    // يولّد Note نوع contact
    db.notes.push({
      id: uid("n"),
      patientId: c.patientId,
      createdAt: new Date().toISOString(),
      authorRole: c.authorRole ?? "Admin",
      authorName: c.authorName ?? "System",
      type: "contact",
      text: `${c.via}: ${c.summary} (${c.outcome ?? "—"})`,
    });
    await save(db);
    return rec;
  },

  // Tasks
  async addTask(t: Omit<Task, "id" | "status">) {
    const db = await loadDB();
    // تحقق: الاسم (assignee) لا يتواجد بأكثر من دور في rolesDirectory
    // (إضافة إدارة الأدوار في مكان آخر)
    const rec: Task = { ...t, id: uid("t"), status: "Open" };
    db.tasks.push(rec);
    await save(db);
    return rec;
  },

  // Roles directory (مرجع واحد للأسماء/الأدوار)
  async upsertRole(name: string, role: Role) {
    const db = await loadDB();
    const existing = db.rolesDirectory.find(r => r.name === name);
    if (existing && existing.role !== role) {
      throw new Error(`"${name}" مسجل بدور ${existing.role} — لا يمكن تعيين دور آخر.`);
    }
    if (!existing) db.rolesDirectory.push({ name, role });
    await save(db);
  },

  // Export/Import
  async exportAll() {
    const db = await loadDB();
    return JSON.stringify(db, null, 2);
  },
  async importAll(jsonData: string) {
    const data = JSON.parse(jsonData) as DBV3;
    await writeDB(data);
  },
};