# 🔧 Environment Setup Guide
## Home Healthcare Management System - Production Configuration

### 📋 Overview

This guide provides step-by-step instructions for setting up the production environment for the King Abdullah Hospital Home Healthcare Management System.

## 🔑 Environment Variables Configuration

### Required Environment File

Create a `.env.local` file in the project root with the following configuration:

```bash
# ==============================================
# PRODUCTION ENVIRONMENT CONFIGURATION
# King Abdullah Hospital - Bisha Healthcare System
# ==============================================

# ============== AI SERVICES ==============
# Gemini AI API Key (Optional - for enhanced narrative generation)
# Obtain from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_actual_gemini_api_key_here

# ============== DATABASE CONFIGURATION ==============
# Primary Database (Netlify/Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:your_password@your-host.neon.tech/neondb?sslmode=require

# Database Selection (firebase | netlify)
DEFAULT_DATABASE=netlify

# ============== FIREBASE CONFIGURATION ==============
# Firebase Project Settings (Auto-detected from firebase.json)
FIREBASE_PROJECT_ID=studio-2008079270-29431
FIREBASE_API_KEY=auto_detected
FIREBASE_AUTH_DOMAIN=studio-2008079270-29431.firebaseapp.com
FIREBASE_DATABASE_URL=https://studio-2008079270-29431.firebaseio.com
FIREBASE_STORAGE_BUCKET=studio-2008079270-29431.appspot.com

# ============== PERFORMANCE SETTINGS ==============
# Bundle optimization settings
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=4096
GENERATE_SOURCEMAP=false

# ============== SECURITY SETTINGS ==============
# Force HTTPS in production
FORCE_HTTPS=true
SECURE_COOKIES=true
```

### Environment Template

Copy the example environment file:

```bash
# Create environment file from template
cp .env.local.example .env.local

# Edit with your specific values
nano .env.local  # or use your preferred editor
```

## 🔥 Firebase Configuration

### 1. Firebase Project Setup

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project (if not already done)
firebase init

# Select the following features:
# ✓ Firestore
# ✓ Hosting  
# ✓ Storage

# Set project ID
firebase use studio-2008079270-29431
```

### 2. Firebase Security Rules

#### Firestore Security Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Function to check authorized users
    function isAuthorizedUser() {
      return request.auth != null && 
             request.auth.token.email in [
               'salshahrani173@moh.gov.sa',     // Primary Admin
               'amemahmoud@mog.gov.sa',         // Clinical Coordinator  
               'rowa.ali.omer@gmail.com',       // Senior Nurse
               'aaldawsari23@moh.gov.sa',       // Doctor
               'atante@moh.gov.sa',             // Physical Therapist
               'yalbishe@moh.gov.sa',           // Social Worker
               'relbarahamtoshy@moh.gov.sa',    // Nurse
               'zdalamri@outlook.sa',           // Driver
               'handaa@mog.gov.sa',             // Coordinator
               'nalqahtani112@moh.gov.sa',      // Healthcare Provider
               'hamad1234nmnm@moh.gov.sa',      // Healthcare Provider
               'thamralshhrany188@gmail.com',   // Healthcare Provider
               'salsahrani@moh.gov.sa',         // Healthcare Provider
               'fahhadms10@gmail.com',          // Healthcare Provider
               'halmanfi@moh.gov.sa'            // Healthcare Provider
             ];
    }
    
    // Patient data access
    match /patients/{patientId} {
      allow read, write: if isAuthorizedUser();
    }
    
    // Visit records access
    match /visits/{visitId} {
      allow read, write: if isAuthorizedUser();
    }
    
    // Assessment data access  
    match /assessments/{assessmentId} {
      allow read, write: if isAuthorizedUser();
    }
    
    // Staff directory access
    match /staff/{staffId} {
      allow read: if isAuthorizedUser();
      allow write: if isAuthorizedUser() && 
                      request.auth.token.email == 'salshahrani173@moh.gov.sa';
    }
  }
}
```

#### Storage Security Rules (`storage.rules`)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Function to check authorized users (same as Firestore)
    function isAuthorizedUser() {
      return request.auth != null && 
             request.auth.token.email in [
               'salshahrani173@moh.gov.sa',
               'amemahmoud@mog.gov.sa', 
               'rowa.ali.omer@gmail.com',
               'aaldawsari23@moh.gov.sa',
               'atante@moh.gov.sa',
               'yalbishe@moh.gov.sa',
               'relbarahamtoshy@moh.gov.sa',
               'zdalamri@outlook.sa',
               'handaa@mog.gov.sa',
               'nalqahtani112@moh.gov.sa',
               'hamad1234nmnm@moh.gov.sa',
               'thamralshhrany188@gmail.com',
               'salsahrani@moh.gov.sa',
               'fahhadms10@gmail.com',
               'halmanfi@moh.gov.sa'
             ];
    }
    
    // PDF documents and medical files
    match /pdfs/{allPaths=**} {
      allow read, write: if isAuthorizedUser();
    }
    
    // Patient images and documents
    match /patient-files/{allPaths=**} {
      allow read, write: if isAuthorizedUser();
    }
  }
}
```

### 3. Firebase Authentication Setup

Enable Email/Password authentication in Firebase Console:

1. Go to **Firebase Console → Authentication → Sign-in method**
2. Enable **Email/Password** provider
3. Add authorized users:

```bash
# Use Firebase Console to add these users with password: "12345"
# (Change passwords after first login)

salshahrani173@moh.gov.sa
amemahmoud@mog.gov.sa
rowa.ali.omer@gmail.com
aaldawsari23@moh.gov.sa
atante@moh.gov.sa
yalbishe@moh.gov.sa
relbarahamtoshy@moh.gov.sa
zdalamri@outlook.sa
handaa@mog.gov.sa
nalqahtani112@moh.gov.sa
hamad1234nmnm@moh.gov.sa
thamralshhrany188@gmail.com
salsahrani@moh.gov.sa
fahhadms10@gmail.com
halmanfi@moh.gov.sa
```

## 🗄️ Database Configuration

### Option 1: Netlify/Neon PostgreSQL (Recommended)

1. **Create Neon Database Account**: Visit [neon.tech](https://neon.tech)
2. **Create New Project**: "KAH Healthcare System"
3. **Get Connection String**: Copy the PostgreSQL connection URL
4. **Update Environment**: Add to `.env.local`

```bash
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
DEFAULT_DATABASE=netlify
```

### Option 2: Firebase Firestore

If using Firebase as primary database:

```bash
DEFAULT_DATABASE=firebase
```

No additional setup required - uses Firebase configuration from above.

## 🚀 Deployment Configuration

### Netlify Configuration (`netlify.toml`)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.processing]
  skip_processing = false

[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true

[build.processing.html]
  pretty_urls = true

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Firebase Hosting Configuration (`firebase.json`)

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/assets/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control", 
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

## 🔧 Build Configuration

### Vite Production Config (`vite.config.ts`)

The existing configuration is already optimized for production with:

- **Code Splitting**: Vendor and UI libraries separated
- **Bundle Optimization**: Tree shaking and minification
- **Asset Optimization**: CSS and image optimization
- **Performance**: Memory and chunk size optimization

### Performance Environment Variables

```bash
# Build performance optimization
NODE_OPTIONS=--max-old-space-size=4096
GENERATE_SOURCEMAP=false
BUILD_PATH=dist
```

## 🔐 Security Configuration

### SSL/HTTPS Setup

**For Custom Domains:**

1. **Obtain SSL Certificate**: Use Let's Encrypt or your certificate provider
2. **Configure Server**: Ensure HTTPS redirect
3. **Update Environment**: Set `FORCE_HTTPS=true`

**For Firebase/Netlify:**
- HTTPS is automatically configured and enforced

### Content Security Policy

Add to your hosting configuration:

```
Content-Security-Policy: default-src 'self'; 
                        script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
                        style-src 'self' 'unsafe-inline'; 
                        img-src 'self' data: blob:; 
                        connect-src 'self' https://*.googleapis.com https://*.firebaseio.com;
```

## 📊 Monitoring & Analytics

### Performance Monitoring

Add to environment:

```bash
# Enable performance monitoring
ENABLE_ANALYTICS=true
SENTRY_DSN=your_sentry_dsn_here  # Optional
```

### Health Check Endpoint

The app includes built-in health checks accessible at:
- `/health` - Basic health status
- `/api/status` - Detailed system status

## 🚦 Environment Validation

### Pre-Deployment Checklist

Run the validation script:

```bash
# Validate environment configuration
npm run validate-env

# Run production health checks  
npm run health-check

# Test build process
npm run build
npm run preview
```

### Troubleshooting Common Issues

**Database Connection Issues:**
```bash
# Test database connectivity
npm run test-db-connection
```

**Firebase Authentication Issues:**
```bash
# Verify Firebase configuration
firebase projects:list
firebase use studio-2008079270-29431
```

**Build Issues:**
```bash
# Clear caches and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

## 📞 Support & Maintenance

### Environment Monitoring

- **Database Health**: Monitor connection and performance
- **Authentication**: Track login attempts and failures  
- **Performance**: Monitor page load times and errors
- **Security**: Regular security audits and updates

### Update Procedures

1. **Environment Updates**: Test in development first
2. **Database Migrations**: Use provided migration scripts
3. **Security Updates**: Regular updates to dependencies
4. **Backup Procedures**: Regular backups of patient data

### Emergency Contacts

- **Primary Administrator**: salshahrani173@moh.gov.sa
- **Technical Support**: King Abdullah Hospital IT Department
- **Firebase Support**: Firebase Console → Support

---

**Environment Setup Complete! 🎉**

*For additional configuration or troubleshooting, refer to the main DEPLOYMENT.md guide.*