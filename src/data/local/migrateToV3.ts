import { readDB, writeDB } from "./storage";
import type { DBV3 } from "../models";

export async function migrateToV3() {
  const raw = await readDB<any>();
  if (!raw) return; // fresh install
  if (raw.__version === 3) return; // already v3

  console.log("Migrating database to v3...");

  // TODO: Customize this based on your previous data structure
  const v3: DBV3 = {
    __version: 3,
    patients: raw.patients ?? [],
    notes: raw.notes ?? [],
    assessments: raw.assessments ?? [],
    contacts: raw.contacts ?? [],
    tasks: raw.tasks ?? [],
    files: raw.files ?? [],
    rolesDirectory: raw.rolesDirectory ?? [],
  };

  // Convert old Patient data to new format if needed
  if (raw.patients) {
    v3.patients = raw.patients.map((p: any) => ({
      id: p.nationalId || p.id || `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      mrn: p.nationalId,
      name: p.nameAr || p.name || "Unknown",
      dob: p.dob,
      diagnoses: Array.isArray(p.diagnoses) ? p.diagnoses : [],
      redFlags: Array.isArray(p.redFlags) ? p.redFlags : [],
      lastVisit: p.lastVisit,
      phones: p.phone ? [p.phone] : [],
      address: p.address,
      tags: Array.isArray(p.tags) ? p.tags : [],
    }));
  }

  await writeDB(v3);
  console.log("Migration to v3 completed.");
}