# 🔌 API Documentation
## Home Healthcare Management System - Integration Guide

### 📋 Overview

This document describes the API endpoints, integrations, and data interfaces for the King Abdullah Hospital Home Healthcare Management System.

## 🏗️ Architecture Overview

The application uses a **local-first architecture** with the following data sources:

1. **Primary**: IndexedDB (Local Browser Storage)
2. **Backup**: JSON Data Bundle
3. **Integration**: Firebase/Netlify Database
4. **AI Services**: Google Gemini API

## 📊 Data Sources & APIs

### 1. Local Storage (IndexedDB)

**Purpose**: Primary data storage for offline-first functionality

**Key Collections:**
- `patients` - Patient records and assessments
- `visits` - Visit logs and notes
- `assessments` - Clinical assessments by role
- `notes` - Healthcare provider notes

**Access Methods:**
```typescript
// Repository Pattern Implementation
import { repo } from './src/data/local/repo';

// Patient operations
await repo.listPatients();
await repo.getPatient(nationalId);
await repo.savePatient(patient);

// Assessment operations  
await repo.saveAssessment(patientId, assessment);
await repo.getAssessments(patientId);

// Notes operations
await repo.saveNote(patientId, note);
await repo.getNotes(patientId);
```

### 2. JSON Data Bundle API

**Endpoint**: `GET /homecare_db_bundle_ar.v3.json`

**Purpose**: Fallback data source and initial data seeding

**Response Structure:**
```json
{
  "المرضى": [
    {
      "nationalId": "1234567890",
      "nameAr": "أحمد محمد علي",
      "phone": "0501234567",
      "areaId": "الحي الأول",
      "status": "active",
      "level": "4",
      "bradenScore": 18,
      "admissionDate": "2024-01-15",
      "tags": ["Catheter", "Fall Risk"],
      "assessments": [],
      "contactAttempts": []
    }
  ],
  "طاقم": [
    {
      "الاسم": "د. سارة أحمد",
      "المهنة": "طبيب",
      "الايميل": "doctor@hospital.sa",
      "الجوال": "0501234567",
      "رقم_الهوية": "1234567890"
    }
  ],
  "الأحياء": ["الحي الأول", "الحي الثاني"],
  "حالات_حرجة": {
    "مرضى_القساطر": [],
    "مرضى_قرح_الفراش": [],
    "مرضى_التغذية_الأنبوبية": [],
    "مرضى_خطر_السقوط": [],
    "مرضى_العلاج_الوريدي": [],
    "مرضى_التهوية": []
  }
}
```

**Implementation:**
```typescript
// Load data from JSON bundle
const response = await fetch('/homecare_db_bundle_ar.v3.json');
const data = await response.json();
```

### 3. Firebase Integration

**Purpose**: Cloud storage, authentication, and real-time sync

#### Authentication API

**Base URL**: `https://identitytoolkit.googleapis.com/v1/accounts`

**Endpoints:**

1. **Login**
   ```
   POST /signInWithPassword
   Content-Type: application/json
   
   {
     "email": "user@hospital.sa",
     "password": "password",
     "returnSecureToken": true
   }
   ```

2. **Token Refresh**
   ```
   POST /token
   
   {
     "grant_type": "refresh_token",
     "refresh_token": "refresh_token_here"
   }
   ```

#### Firestore Database API

**Base URL**: `https://firestore.googleapis.com/v1/projects/studio-2008079270-29431/databases/(default)/documents`

**Collections:**

1. **Patients Collection**
   ```
   GET /patients
   GET /patients/{nationalId}
   POST /patients
   PATCH /patients/{nationalId}
   DELETE /patients/{nationalId}
   ```

2. **Assessments Collection**
   ```
   GET /assessments
   GET /assessments/{assessmentId}
   POST /assessments
   PATCH /assessments/{assessmentId}
   ```

3. **Visits Collection**
   ```
   GET /visits
   GET /visits/{visitId}
   POST /visits
   PATCH /visits/{visitId}
   ```

**Example Request:**
```typescript
// Firebase SDK usage
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc 
} from 'firebase/firestore';

// Get patient
const patientRef = doc(db, 'patients', nationalId);
const patientSnap = await getDoc(patientRef);

// Save assessment
const assessmentRef = doc(collection(db, 'assessments'));
await setDoc(assessmentRef, assessmentData);
```

#### Firebase Storage API

**Base URL**: `https://firebasestorage.googleapis.com/v0/b/studio-2008079270-29431.appspot.com/o`

**File Operations:**
```
GET /pdfs%2F{fileName}  // Download PDF
POST /                  // Upload file
DELETE /pdfs%2F{fileName}  // Delete file
```

### 4. Netlify/Neon PostgreSQL Integration

**Purpose**: Production database with PostgreSQL

**Connection String:**
```
postgresql://username:password@host:5432/database?sslmode=require
```

**Database Schema:**
```sql
-- Patients table
CREATE TABLE patients (
  national_id VARCHAR(10) PRIMARY KEY,
  name_ar TEXT NOT NULL,
  phone VARCHAR(15),
  area_id TEXT,
  status VARCHAR(10) DEFAULT 'active',
  level VARCHAR(5),
  braden_score INTEGER,
  admission_date DATE,
  tags JSONB DEFAULT '[]',
  assessments JSONB DEFAULT '[]',
  contact_attempts JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Staff table  
CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  name_ar TEXT NOT NULL,
  profession_ar TEXT NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(15),
  national_id VARCHAR(10) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assessments table
CREATE TABLE assessments (
  id SERIAL PRIMARY KEY,
  patient_id VARCHAR(10) REFERENCES patients(national_id),
  assessment_type VARCHAR(50),
  assessment_data JSONB,
  assessed_by TEXT,
  assessed_at TIMESTAMP DEFAULT NOW()
);
```

**API Operations:**
```typescript
// Using native fetch with database
const response = await fetch('/api/patients', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(patientData)
});
```

## 🤖 AI Integration - Google Gemini API

**Purpose**: Enhanced narrative generation for social work assessments

**Base URL**: `https://generativelanguage.googleapis.com/v1beta`

### Gemini API Endpoints

1. **Text Generation**
   ```
   POST /models/gemini-pro:generateContent
   Authorization: Bearer {API_KEY}
   Content-Type: application/json
   
   {
     "contents": [
       {
         "parts": [
           {
             "text": "Generate professional Arabic medical narrative..."
           }
         ]
       }
     ]
   }
   ```

### Smart Narrative Generator

**Implementation:**
```typescript
// Smart narrative generation
import { SmartNarrativeGenerator } from './utils/smartNarrativeGenerator';

const formData = {
  maritalStatus: 'متزوج',
  educationLevel: 'جامعي',
  profession: 'موظف',
  // ... other form data
};

const narratives = SmartNarrativeGenerator.generateComprehensiveReport(formData);
```

**Generated Sections:**
- Marital Status Analysis
- Education & Profession Assessment
- Housing Conditions Evaluation
- Financial Status Review
- Psychological Impact Assessment
- Physical Condition Documentation
- Equipment Needs Analysis
- Intervention Summary
- Education & Training Status

## 🔌 External Integrations

### 1. Google Maps Integration (Future)

**Purpose**: Patient location and route optimization

**Potential API:**
```
GET https://maps.googleapis.com/maps/api/geocode/json
GET https://maps.googleapis.com/maps/api/directions/json
```

### 2. Ministry of Health Integration (Future)

**Purpose**: Patient verification and medical records sync

**Potential Endpoints:**
```
GET /api/moh/patient-verification/{nationalId}
GET /api/moh/medical-history/{nationalId}
```

### 3. Hospital Information System Integration

**Purpose**: Lab results, medications, and appointment sync

**Current Status**: Not implemented - local data only

## 📱 Mobile API Considerations

### PWA Service Worker

**Cache Strategy:**
```typescript
// Network-first with fallback to cache
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
  }
});
```

### Offline Sync

**Data Synchronization:**
```typescript
// Sync when online
window.addEventListener('online', async () => {
  await syncLocalDataToServer();
});

// Queue operations when offline
window.addEventListener('offline', () => {
  enableOfflineMode();
});
```

## 🔐 API Security

### Authentication Requirements

All API endpoints require:
1. **Valid Firebase Auth Token** or **API Key**
2. **HTTPS Connection** (enforced in production)
3. **Authorized Email** verification
4. **Rate Limiting** (handled by Firebase/Netlify)

### Request Headers

```javascript
// Required headers for authenticated requests
const headers = {
  'Authorization': `Bearer ${idToken}`,
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest'
};
```

### CORS Configuration

```javascript
// Allowed origins
const allowedOrigins = [
  'https://studio-2008079270-29431.web.app',
  'https://kah-healthcare.netlify.app',
  'http://localhost:3000' // Development only
];
```

## 📊 Data Schemas

### Patient Data Schema

```typescript
interface Patient {
  nationalId: string;          // Primary key
  nameAr: string;             // Arabic name
  phone: string;              // Contact number
  areaId: string;             // Geographic area
  status: 'active' | 'deceased';
  level: string;              // Care level (1-4)
  bradenScore: number;        // Pressure sore risk (6-23)
  minMonthlyRequired: number; // Minimum visits per month
  admissionDate: string;      // ISO date string
  gmapsUrl: boolean;          // Has GPS coordinates
  tags: string[];             // Medical conditions
  sex: 'Male' | 'Female';
  assessments: Assessment[];   // Medical assessments
  contactAttempts: ContactAttempt[]; // Failed visit attempts
}
```

### Assessment Data Schema

```typescript
interface Assessment {
  id: string;
  patientId: string;
  type: 'doctor' | 'nurse' | 'pt' | 'sw';
  assessorName: string;
  assessorRole: string;
  timestamp: string;
  data: DoctorAssessment | NurseAssessment | PtAssessment | SwAssessment;
  notes: string;
  followUpRequired: boolean;
  nextVisitDate?: string;
}
```

### Note Data Schema

```typescript
interface Note {
  id: string;
  patientId: string;
  authorName: string;
  authorRole: string;
  timestamp: string;
  content: string;
  type: 'general' | 'medical' | 'social' | 'administrative';
  isPrivate: boolean;
  tags: string[];
}
```

## 📈 Performance & Monitoring

### API Response Times

**Target Performance:**
- Patient List: < 500ms
- Patient Details: < 200ms
- Save Assessment: < 1s
- Print Generation: < 2s

### Error Handling

**Standard Error Response:**
```json
{
  "error": {
    "code": "PATIENT_NOT_FOUND",
    "message": "Patient with ID 1234567890 not found",
    "details": {
      "timestamp": "2024-01-15T10:30:00Z",
      "requestId": "req_abc123"
    }
  }
}
```

### Health Check Endpoints

```
GET /health          // Basic health status
GET /api/status      // Detailed system status
GET /api/db-status   // Database connectivity
```

## 🧪 Testing & Development

### API Testing

**Local Development:**
```bash
# Start development server
npm run dev

# API endpoints available at:
http://localhost:3000/api/*
```

**Mock Data:**
```typescript
// Use development data source
export const DEVELOPMENT_MODE = process.env.NODE_ENV === 'development';
```

### Integration Testing

```bash
# Run API integration tests
npm run test:integration

# Test specific endpoints
npm run test:api:patients
npm run test:api:assessments
```

## 📞 Support & Troubleshooting

### Common API Issues

1. **Authentication Failures**
   - Check Firebase token expiration
   - Verify authorized email list
   - Ensure HTTPS in production

2. **Database Connection Issues**
   - Verify connection string
   - Check network connectivity
   - Review Firestore rules

3. **Performance Issues**
   - Monitor bundle size
   - Check API response times
   - Review caching strategy

### Debug Tools

```typescript
// Enable API debugging
localStorage.setItem('debug', 'api:*');

// Monitor network requests
console.log('API Requests:', window.performance.getEntriesByType('navigation'));
```

---

**API Documentation Complete! 🎉**

*For integration support, contact the development team or refer to the main documentation.*