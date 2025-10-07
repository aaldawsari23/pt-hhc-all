export type ID = string;

export type Role = "Physician" | "Nurse" | "PT" | "SW" | "Driver" | "Admin";

export interface Patient {
  id: ID;
  mrn?: string;
  name: string;
  dob?: string;
  diagnoses?: string[];
  redFlags?: string[];
  lastVisit?: string;
  phones?: string[];
  address?: string;
  tags?: string[];
}

export type NoteType = "general" | "assessment" | "contact" | "plan" | "risk" | "system";

export interface Note {
  id: ID;
  patientId: ID;
  createdAt: string; // ISO
  authorRole: Role;
  authorName: string;
  type: NoteType;
  tags?: string[];
  text: string;
  linkedAssessmentId?: ID;
  linkedTaskId?: ID;
}

export interface Assessment {
  id: ID;
  patientId: ID;
  createdAt: string;
  role: Role;
  templateId: string; // e.g. "nurse_v2"
  fields: Record<string, unknown>;
}

export interface ContactLog {
  id: ID;
  patientId: ID;
  when: string;
  via: "Phone" | "WhatsApp" | "In-Person";
  summary: string;
  outcome?: string;
  authorName?: string;
  authorRole?: Role;
}

export interface Task {
  id: ID;
  patientId: ID;
  title: string;
  assignee?: string;
  due?: string;
  status: "Open" | "Done";
  linkedNoteId?: ID;
}

export interface FileRecord {
  id: ID;
  patientId: ID;
  filename: string;
  uploadedAt: string;
  size: number;
  type: string;
  linkedNoteId?: ID;
  linkedAssessmentId?: ID;
}

export interface RoleEntry {
  name: string;
  role: Role;
}

export interface DBV3 {
  __version: 3;
  patients: Patient[];
  notes: Note[];
  assessments: Assessment[];
  contacts: ContactLog[];
  tasks: Task[];
  files: FileRecord[];
  rolesDirectory: RoleEntry[];
}