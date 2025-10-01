# نشر تطبيق الرعاية الصحية المنزلية
# Deployment Guide for Home Healthcare Application

## المتطلبات المسبقة / Prerequisites

1. **Firebase CLI** (تم تثبيته بالفعل)
2. **Netlify CLI** (تم تثبيته بالفعل)
3. **مشروع Firebase** (studio-2008079270-29431)

## خيارات النشر / Deployment Options

### الخيار الأول: Firebase Hosting (موصى به للمشاريع الطبية)

```bash
# 1. تسجيل الدخول إلى Firebase
firebase login

# 2. ربط المشروع
firebase use studio-2008079270-29431

# 3. نشر التطبيق
firebase deploy --only hosting

# 4. نشر قواعد الأمان
firebase deploy --only firestore:rules,storage
```

### الخيار الثاني: Netlify (سريع ومجاني)

```bash
# 1. تسجيل الدخول إلى Netlify
netlify login

# 2. نشر الموقع
netlify deploy --prod --dir=dist
```

## إعداد قاعدة البيانات / Database Setup

### 1. Firestore Security Rules

يجب رفع قواعد الأمان التالية إلى مشروع Firebase:

```javascript
// في Firebase Console > Firestore Database > Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
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
    
    match /patients/{patientId} {
      allow read, write: if isAuthorizedUser();
    }
    
    match /visits/{visitId} {
      allow read, write: if isAuthorizedUser();
    }
    
    match /assessments/{assessmentId} {
      allow read, write: if isAuthorizedUser();
    }
  }
}
```

### 2. Storage Security Rules

```javascript
// في Firebase Console > Storage > Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
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
    
    match /pdfs/{allPaths=**} {
      allow read, write: if isAuthorizedUser();
    }
  }
}
```

## إعداد المصادقة / Authentication Setup

### تفعيل Email Authentication في Firebase:

1. اذهب إلى Firebase Console
2. Authentication > Sign-in method
3. فعل "Email/Password"
4. أضف المستخدمين المسموح لهم:

```
salshahrani173@moh.gov.sa (كلمة المرور: 12345)
amemahmoud@mog.gov.sa (كلمة المرور: 12345)
rowa.ali.omer@gmail.com (كلمة المرور: 12345)
aaldawsari23@moh.gov.sa (كلمة المرور: 12345)
... (باقي المستخدمين)
```

## أوامر سريعة / Quick Commands

```bash
# بناء التطبيق
npm run build

# نشر على Firebase
firebase deploy

# نشر على Netlify
netlify deploy --prod --dir=dist

# مراقبة السجلات
firebase functions:log
```

## الروابط المهمة / Important Links

- **Firebase Console**: https://console.firebase.google.com/project/studio-2008079270-29431
- **الموقع المنشور**: سيظهر بعد النشر
- **التطبيق محلياً**: http://localhost:5173

## نصائح الأمان / Security Tips

1. ✅ جميع البيانات الطبية محمية بقواعد أمان صارمة
2. ✅ الوصول مقتصر على الموظفين المعتمدين فقط
3. ✅ كلمات المرور يجب تغييرها بعد النشر
4. ✅ تفعيل المصادقة الثنائية للحسابات الإدارية

## استكشاف الأخطاء / Troubleshooting

### خطأ في المصادقة:
```bash
firebase login --reauth
```

### خطأ في النشر:
```bash
npm run build
firebase deploy --debug
```

### خطأ في قاعدة البيانات:
تأكد من أن قواعد Firestore محدثة في Firebase Console