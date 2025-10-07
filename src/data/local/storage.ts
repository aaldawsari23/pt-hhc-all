import type { DBV3 } from "../models";

const DB_NAME = "mhhc5";
const DB_VERSION = 3;
const STORE_NAME = "main";

export async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function readDB<T = DBV3>(): Promise<T | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get("data");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  } catch (error) {
    console.warn("Error reading from IndexedDB:", error);
    return null;
  }
}

export async function writeDB(data: DBV3): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.put(data, "data");
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function exportDB(): Promise<string> {
  const data = await readDB();
  return JSON.stringify(data, null, 2);
}

export async function importDB(jsonData: string): Promise<void> {
  const data = JSON.parse(jsonData) as DBV3;
  await writeDB(data);
}