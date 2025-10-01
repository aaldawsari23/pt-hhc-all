#!/bin/bash

# Healthcare App Deployment Script
# نشر تطبيق الرعاية الصحية المنزلية

echo "🏥 بدء نشر تطبيق الرعاية الصحية المنزلية..."
echo "🏥 Starting Healthcare App Deployment..."

# Check if Firebase CLI is logged in
echo "⚡ فحص تسجيل الدخول إلى Firebase..."
if ! firebase projects:list &> /dev/null; then
    echo "❌ يجب تسجيل الدخول إلى Firebase أولاً"
    echo "❌ Please login to Firebase first:"
    echo "   firebase login"
    exit 1
fi

# Build the application
echo "🔨 بناء التطبيق..."
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ فشل في بناء التطبيق"
    echo "❌ Build failed"
    exit 1
fi

# Deploy to Firebase
echo "🚀 نشر على Firebase..."
echo "🚀 Deploying to Firebase..."
firebase use studio-2008079270-29431
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo "✅ تم نشر التطبيق بنجاح!"
    echo "✅ Application deployed successfully!"
    echo ""
    echo "🌐 رابط التطبيق / App URL:"
    echo "   https://studio-2008079270-29431.web.app"
    echo ""
    echo "⚙️ لنشر قواعد الأمان أيضاً:"
    echo "⚙️ To deploy security rules too:"
    echo "   firebase deploy --only firestore:rules,storage"
else
    echo "❌ فشل في النشر"
    echo "❌ Deployment failed"
    exit 1
fi

# Alternative: Deploy to Netlify
echo ""
echo "🔄 للنشر على Netlify بدلاً من ذلك:"
echo "🔄 To deploy to Netlify instead:"
echo "   netlify login"
echo "   netlify deploy --prod --dir=dist"

echo ""
echo "📋 المرحلة التالية: إعداد قاعدة البيانات"
echo "📋 Next step: Database setup"
echo "   راجع ملف DEPLOYMENT.md للتفاصيل"
echo "   Check DEPLOYMENT.md for details"