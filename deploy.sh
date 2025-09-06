#!/bin/bash

echo "🚀 SmartSubs Deployment Script"
echo "==============================="

# التحقق من وجود Git
if ! command -v git &> /dev/null; then
    echo "❌ Git غير مثبت. يرجى تثبيت Git أولاً."
    exit 1
fi

# التحقق من وجود مجلد المشروع
if [ ! -d "smartsubs-addon" ]; then
    echo "❌ مجلد المشروع غير موجود. تأكد من وجود مجلد smartsubs-addon"
    exit 1
fi

cd smartsubs-addon

echo "📁 دخول مجلد المشروع..."

# إعداد Git
echo "🔧 إعداد Git..."
git init

# إضافة جميع الملفات
echo "📦 إضافة الملفات..."
git add .

# إنشاء أول commit
echo "💾 إنشاء Commit..."
git commit -m "Initial SmartSubs addon implementation with smart subtitle matching"

# إعداد الفرع الرئيسي
git branch -M main

echo ""
echo "✅ تم إعداد المشروع محلياً!"
echo ""
echo "🔗 خطوات ربط GitHub:"
echo "1. اذهب إلى github.com وأنشئ repository جديد باسم 'smartsubs-addon'"
echo "2. نفذ الأمر التالي (بدل USERNAME باسم المستخدم الخاص بك):"
echo ""
echo "   git remote add origin https://github.com/USERNAME/smartsubs-addon.git"
echo "   git push -u origin main"
echo ""
echo "🌐 خطوات النشر على Render:"
echo "1. اذهب إلى render.com وسجل دخول"
echo "2. اضغط 'New' → 'Web Service'"
echo "3. اربط مستودع GitHub: smartsubs-addon"
echo "4. استخدم الإعدادات:"
echo "   - Runtime: Node"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "5. اضغط 'Create Web Service'"
echo ""
echo "📱 لإضافة الإضافة في Stremio:"
echo "1. افتح Stremio"
echo "2. اضغط أيقونة القطعة ⚙️"
echo "3. اختر 'Community Add-ons'"
echo "4. اضغط 'Install Add-on via URL'"
echo "5. الصق: https://your-app-name.onrender.com/manifest.json"
echo ""
echo "🎉 SmartSubs جاهز للاستخدام!"
