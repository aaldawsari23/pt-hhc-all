// Firebase Configuration and Services
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

// Firebase configuration - Connected to your project
const firebaseConfig = {
  apiKey: "AIzaSyCFQSuzdalFAKgCeNOh44T6zLpGm8PD0e0",
  authDomain: "studio-2008079270-29431.firebaseapp.com",
  projectId: "studio-2008079270-29431",
  storageBucket: "studio-2008079270-29431.firebasestorage.app",
  messagingSenderId: "376682035127",
  appId: "1:376682035127:web:3e377f2c48371e4ab81a32"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Staff roles mapping
export const ROLE_MAPPING = {
  'مدير': 'Coordinator',
  'طبيب': 'Doctor', 
  'ممرض': 'Nurse',
  'اخصائي علاج طبيعي': 'PhysicalTherapist',
  'فني علاج طبيعي': 'PhysicalTherapist',
  'أخصائي اجتماعي': 'SocialWorker',
  'سائق': 'Driver'
};

// User accounts from data (email -> password is always 12345)
export const AUTHORIZED_USERS = [
  { email: "salshahrani173@moh.gov.sa", name: "سعد عبدالله سعد الحويزي", role: "مدير" },
  { email: "amemahmoud@mog.gov.sa", name: "اماني السيد محمود", role: "طبيب" },
  { email: "rowa.ali.omer@gmail.com", name: "رؤى علي عمر علي", role: "طبيب" },
  { email: "aaldawsari23@moh.gov.sa", name: "عبدالكريم محمد مرضي الدوسري", role: "اخصائي علاج طبيعي" },
  { email: "atante@moh.gov.sa", name: "ايلين تانتي", role: "فني علاج طبيعي" },
  { email: "yalbishe@moh.gov.sa", name: "يوسف محمد ظافر البيشي", role: "أخصائي اجتماعي" },
  { email: "relbarahamtoshy@moh.gov.sa", name: "راجيا ايمن محمود محمد", role: "ممرض" },
  { email: "zdalamri@outlook.sa", name: "زهور ظافر العمري", role: "ممرض" },
  { email: "handaa@mog.gov.sa", name: "هندا محمد حماد", role: "ممرض" },
  { email: "nalqahtani112@moh.gov.sa", name: "ناصر محمد احمد القحطاني", role: "ممرض" },
  { email: "hamad1234nmnm@moh.gov.sa", name: "حمد نجر مطيع القحطاني", role: "ممرض" },
  { email: "thamralshhrany188@gmail.com", name: "ثامر ظافر ناصر الشهراني", role: "سائق" },
  { email: "salsahrani@moh.gov.sa", name: "سعود داهم ماجد الشهراني", role: "سائق" },
  { email: "fahhadms10@gmail.com", name: "فهاد مسفر مطيحن الحارثي", role: "سائق" },
  { email: "halmanfi@moh.gov.sa", name: "حسن عبدالرحمن محمد", role: "سائق" }
];

// Auth Service
export class AuthService {
  static async signIn(email: string, password: string) {
    try {
      // تحقق من أن المستخدم مخول بالدخول
      const authorizedUser = AUTHORIZED_USERS.find(user => 
        user.email.toLowerCase() === email.toLowerCase()
      );
      
      if (!authorizedUser) {
        throw new Error('غير مخول بالدخول إلى النظام');
      }

      if (password !== '12345') {
        throw new Error('كلمة المرور غير صحيحة');
      }

      // إنشاء جلسة محلية (بدلاً من Firebase Auth للتبسيط)
      const userData = {
        email: authorizedUser.email,
        name: authorizedUser.name,
        role: authorizedUser.role,
        mappedRole: ROLE_MAPPING[authorizedUser.role] || 'Coordinator',
        uid: btoa(authorizedUser.email), // إنشاء UID بسيط
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      return { user: userData, success: true };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async signOut() {
    localStorage.removeItem('currentUser');
    return { success: true };
  }

  static getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  }

  static isAuthenticated() {
    return this.getCurrentUser() !== null;
  }
}

// Firestore Service
export class FirestoreService {
  // Patients
  static async savePatient(patient: any) {
    try {
      const docRef = doc(db, 'patients', patient.nationalId);
      await setDoc(docRef, {
        ...patient,
        updatedAt: Timestamp.now(),
        updatedBy: AuthService.getCurrentUser()?.email || 'system'
      });
      return { success: true };
    } catch (error) {
      console.error('Error saving patient:', error);
      throw error;
    }
  }

  static async getPatient(nationalId: string) {
    try {
      const docRef = doc(db, 'patients', nationalId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      console.error('Error getting patient:', error);
      throw error;
    }
  }

  static async getAllPatients() {
    try {
      const querySnapshot = await getDocs(collection(db, 'patients'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting patients:', error);
      throw error;
    }
  }

  // Visits
  static async saveVisit(visit: any) {
    try {
      const visitId = `${visit.patientId}_${visit.date}`;
      const docRef = doc(db, 'visits', visitId);
      await setDoc(docRef, {
        ...visit,
        updatedAt: Timestamp.now(),
        updatedBy: AuthService.getCurrentUser()?.email || 'system'
      });
      return { success: true };
    } catch (error) {
      console.error('Error saving visit:', error);
      throw error;
    }
  }

  static async getVisitsByDateRange(startDate: string, endDate: string) {
    try {
      const q = query(
        collection(db, 'visits'),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting visits:', error);
      throw error;
    }
  }

  // Assessments
  static async saveAssessment(assessment: any) {
    try {
      const docRef = doc(db, 'assessments', assessment.id);
      await setDoc(docRef, {
        ...assessment,
        updatedAt: Timestamp.now(),
        updatedBy: AuthService.getCurrentUser()?.email || 'system'
      });
      return { success: true };
    } catch (error) {
      console.error('Error saving assessment:', error);
      throw error;
    }
  }

  static async getAssessmentsByPatient(patientId: string) {
    try {
      const q = query(
        collection(db, 'assessments'),
        where('patientId', '==', patientId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting assessments:', error);
      throw error;
    }
  }

  // Activity Log
  static async logActivity(action: string, details: any) {
    try {
      const currentUser = AuthService.getCurrentUser();
      const logEntry = {
        action,
        details,
        user: currentUser?.email || 'system',
        userName: currentUser?.name || 'System',
        timestamp: Timestamp.now(),
        date: new Date().toISOString().split('T')[0]
      };
      
      const docRef = doc(collection(db, 'activityLog'));
      await setDoc(docRef, logEntry);
      return { success: true };
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }
}

// Storage Service for PDFs
export class StorageService {
  static async uploadPDF(pdfBlob: Blob, filename: string, patientId?: string) {
    try {
      const currentUser = AuthService.getCurrentUser();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const path = patientId 
        ? `pdfs/patients/${patientId}/${timestamp}_${filename}`
        : `pdfs/general/${timestamp}_${filename}`;
      
      const storageRef = ref(storage, path);
      const uploadResult = await uploadBytes(storageRef, pdfBlob);
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      // Save PDF metadata to Firestore
      const pdfMetadata = {
        filename,
        path,
        downloadURL,
        patientId: patientId || null,
        uploadedBy: currentUser?.email || 'system',
        uploadedByName: currentUser?.name || 'System',
        uploadedAt: Timestamp.now(),
        size: pdfBlob.size,
        type: 'application/pdf'
      };
      
      const docRef = doc(collection(db, 'pdfs'));
      await setDoc(docRef, pdfMetadata);
      
      return { success: true, downloadURL, metadata: pdfMetadata };
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  }

  static async getPDFsByPatient(patientId: string) {
    try {
      const q = query(
        collection(db, 'pdfs'),
        where('patientId', '==', patientId),
        orderBy('uploadedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting PDFs:', error);
      throw error;
    }
  }

  static async getAllPDFs() {
    try {
      const q = query(
        collection(db, 'pdfs'),
        orderBy('uploadedAt', 'desc'),
        limit(100)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all PDFs:', error);
      throw error;
    }
  }
}

// Sync Service for offline support
export class SyncService {
  private static syncQueue: any[] = [];
  private static isOnline = navigator.onLine;
  private static syncInProgress = false;

  static init() {
    // Load offline queue
    const savedQueue = localStorage.getItem('firebase-sync-queue');
    if (savedQueue) {
      try {
        this.syncQueue = JSON.parse(savedQueue);
      } catch (error) {
        console.error('Error loading sync queue:', error);
      }
    }

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Process queue on init if online
    if (this.isOnline) {
      setTimeout(() => this.processSyncQueue(), 1000);
    }
  }

  static queueForSync(operation: string, data: any) {
    const queueItem = {
      id: Date.now().toString(),
      operation,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    this.syncQueue.push(queueItem);
    this.persistQueue();

    if (this.isOnline && !this.syncInProgress) {
      this.processSyncQueue();
    }
  }

  static async processSyncQueue() {
    if (!this.isOnline || this.syncInProgress || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    const processedItems: string[] = [];

    for (const item of this.syncQueue) {
      try {
        switch (item.operation) {
          case 'savePatient':
            await FirestoreService.savePatient(item.data);
            break;
          case 'saveVisit':
            await FirestoreService.saveVisit(item.data);
            break;
          case 'saveAssessment':
            await FirestoreService.saveAssessment(item.data);
            break;
          case 'logActivity':
            await FirestoreService.logActivity(item.data.action, item.data.details);
            break;
          default:
            console.warn('Unknown sync operation:', item.operation);
        }
        
        processedItems.push(item.id);
      } catch (error) {
        console.error('Sync failed for item:', item, error);
        item.retryCount = (item.retryCount || 0) + 1;
        
        // Remove items that have failed too many times
        if (item.retryCount >= 3) {
          processedItems.push(item.id);
        }
      }
    }

    // Remove processed items
    this.syncQueue = this.syncQueue.filter(item => !processedItems.includes(item.id));
    this.persistQueue();
    this.syncInProgress = false;
  }

  private static persistQueue() {
    try {
      localStorage.setItem('firebase-sync-queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error persisting sync queue:', error);
    }
  }

  static getSyncStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      syncInProgress: this.syncInProgress
    };
  }
}

// Initialize sync service
SyncService.init();