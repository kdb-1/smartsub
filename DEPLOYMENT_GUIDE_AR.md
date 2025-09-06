# دليل النشر الشامل لـ SmartSubs

## 📋 المتطلبات
- حساب GitHub
- حساب Render.com
- Git مثبت على الجهاز
- Node.js مثبت (للاختبار المحلي)

## 🔧 خطوات النشر

### 1. رفع المشروع على GitHub

```bash
# الانتقال لمجلد المشروع
cd smartsubs-addon

# إعداد Git
git init
git add .
git commit -m "Initial SmartSubs addon"
git branch -M main

# ربط GitHub (بدل yourusername باسم المستخدم)
git remote add origin https://github.com/yourusername/smartsubs-addon.git
git push -u origin main
```

### 2. النشر على Render

1. **إنشاء الخدمة**:
   - اذهب إلى [render.com](https://render.com)
   - اضغط **New** → **Web Service**
   - اختر **Build and deploy from Git repository**

2. **ربط GitHub**:
   - اضغط **Connect GitHub**
   - ابحث عن `smartsubs-addon`
   - اضغط **Connect**

3. **إعداد الخدمة**:
   ```
   Name: smartsubs-addon
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

4. **النشر**:
   - اضغط **Create Web Service**
   - انتظر 3-5 دقائق للبناء والتشغيل

### 3. إضافة الإضافة في Stremio

1. افتح تطبيق Stremio
2. اضغط على **أيقونة القطعة** (⚙️)
3. اختر **Community Add-ons**
4. اضغط **Install Add-on via URL**
5. الصق الرابط:
   ```
   https://your-app-name.onrender.com/manifest.json
   ```
6. اضغط **Install**

## ✅ التحقق من التشغيل

### اختبار محلي:
```bash
cd smartsubs-addon
npm install
npm start
```
زيارة: http://localhost:7000/manifest.json

### اختبار الإنتاج:
زيارة: https://your-app-name.onrender.com/manifest.json

## 🔄 التحديث

لتحديث الإضافة:
```bash
git add .
git commit -m "Update: وصف التحديث"
git push
```

Render سيقوم بإعادة النشر تلقائياً!

## 🎯 ميزات SmartSubs

- **تحليل ذكي**: يحلل اسم ملف الفيديو ويستخرج:
  - الدقة (1080p, 720p, 4K)
  - المصدر (BluRay, WEB-DL, HDTV)
  - الكودك (x264, x265, HEVC)
  - مجموعة الإصدار (Release Group)

- **مطابقة دقيقة**: يختار الترجمة الأنسب بناءً على:
  - تطابق المواصفات التقنية
  - حساب التأخير المطلوب
  - ترتيب حسب الجودة

- **تعديل تلقائي**: يعرض تعليمات واضحة للتعديل:
  - ✅ مطابقة ممتازة (لا حاجة للتعديل)
  - ⚡ مطابقة جيدة (تأخير ضئيل)
  - ⚙️ تعديل مطلوب (مع قيمة التأخير)

## 🛠️ استكشاف الأخطاء

### مشكلة: "الإضافة لا تعمل"
- تأكد من أن الرابط صحيح وينتهي بـ `/manifest.json`
- تحقق من حالة الخدمة على Render
- راجع logs الخدمة للأخطاء

### مشكلة: "لا يظهر ترجمات"
- تأكد من وجود إضافات ترجمة أخرى في Stremio
- SmartSubs يحسن الترجمات الموجودة، لا يجلب ترجمات جديدة

### مشكلة: "التأخير غير دقيق"
- قد تحتاج لتعديل يدوي باستخدام G/H في Stremio
- التأخيرات المحسوبة تقديرية وقد تحتاج تعديل

## 📞 الدعم

للمساعدة والاستفسارات:
- راجع الكود في GitHub
- اقرأ documentation الخاص بـ Stremio SDK
- تحقق من community forums لـ Stremio

---
تم تطوير SmartSubs لحل مشكلة عدم تطابق الترجمات في Stremio 🎬
