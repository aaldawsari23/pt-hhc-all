// Firebase Setup Script
// نسخ هذا إلى Firebase Console للإعداد السريع

console.log(`
🔥 إعداد Firebase للرعاية الصحية المنزلية
🔥 Firebase Setup for Home Healthcare

📋 خطوات الإعداد / Setup Steps:

1️⃣ اذهب إلى Firebase Console:
   https://console.firebase.google.com/project/studio-2008079270-29431

2️⃣ فعل Authentication:
   Authentication > Sign-in method > Email/Password ✅

3️⃣ إضافة المستخدمين / Add Users:
   Authentication > Users > Add user
`);

// قائمة المستخدمين المصرح لهم
const authorizedUsers = [
  { email: "salshahrani173@moh.gov.sa", name: "سعد عبدالله سعد الحويزي", role: "مدير" },
  { email: "amemahmoud@mog.gov.sa", name: "اماني السيد محمود", role: "طبيب" },
  { email: "rowa.ali.omer@gmail.com", name: "رواء علي عمر", role: "ممرض" },
  { email: "aaldawsari23@moh.gov.sa", name: "عبدالعزيز الدوسري", role: "اخصائي علاج طبيعي" },
  { email: "atante@moh.gov.sa", name: "عبدالله طانطي", role: "فني علاج طبيعي" },
  { email: "yalbishe@moh.gov.sa", name: "يوسف البشه", role: "أخصائي اجتماعي" },
  { email: "relbarahamtoshy@moh.gov.sa", name: "ريم البراهم طوشي", role: "ممرض" },
  { email: "zdalamri@outlook.sa", name: "زياد العمري", role: "سائق" },
  { email: "handaa@mog.gov.sa", name: "هند عبدالله", role: "ممرض" },
  { email: "nalqahtani112@moh.gov.sa", name: "نورا القحطاني", role: "ممرض" },
  { email: "hamad1234nmnm@moh.gov.sa", name: "حمد العتيبي", role: "سائق" },
  { email: "thamralshhrany188@gmail.com", name: "ثامر الشهراني", role: "سائق" },
  { email: "salsahrani@moh.gov.sa", name: "سعد الشهراني", role: "سائق" },
  { email: "fahhadms10@gmail.com", name: "فهد المطيري", role: "سائق" },
  { email: "halmanfi@moh.gov.sa", name: "حسام المنفي", role: "سائق" }
];

console.log("👥 قائمة المستخدمين للإضافة:");
console.log("👥 Users to add:");
authorizedUsers.forEach((user, index) => {
  console.log(`${index + 1}. ${user.email} - ${user.name} (${user.role})`);
});

console.log(`

4️⃣ إعداد Firestore Database:
   Firestore Database > Rules

نسخ والصق القواعد التالية:
Copy and paste these rules:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthorizedUser() {
      return request.auth != null && 
             request.auth.token.email in [
${authorizedUsers.map(user => `               '${user.email}'`).join(',\n')}
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
    
    match /pdfs/{pdfId} {
      allow read, write: if isAuthorizedUser();
    }
  }
}

5️⃣ إعداد Storage:
   Storage > Rules

نسخ والصق القواعد التالية:
Copy and paste these rules:

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAuthorizedUser() {
      return request.auth != null && 
             request.auth.token.email in [
${authorizedUsers.map(user => `               '${user.email}'`).join(',\n')}
             ];
    }
    
    match /pdfs/{allPaths=**} {
      allow read, write: if isAuthorizedUser();
    }
    
    match /images/{allPaths=**} {
      allow read, write: if isAuthorizedUser();
    }
  }
}

✅ بعد الانتهاء من الإعداد، شغل:
✅ After setup, run:
   ./deploy.sh

🌐 سيكون التطبيق متاحاً على:
🌐 App will be available at:
   https://studio-2008079270-29431.web.app
`);

// كلمة المرور الافتراضية
console.log(`
🔑 كلمة المرور للجميع: 12345
🔑 Default password for all: 12345

⚠️  يُنصح بتغيير كلمات المرور بعد النشر
⚠️  Recommended to change passwords after deployment
`);