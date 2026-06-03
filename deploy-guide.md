# คู่มือการตั้งค่าการ Deploy ระบบจริง: Vercel & Render (Cloud Deployment Guide)

คู่มือนี้จะอธิบายขั้นตอนการนำระบบ **Skill Wallet (Mint Skill)** ขึ้นระบบคลาวด์จริง 100% โดยจะไม่มีการใช้เครื่อง Local หรือ ngrok อีกต่อไป:
* **Frontend:** Deploy บน **Vercel** (Next.js)
* **Backendหลัก (Elysia):** Deploy บน **Render** (Docker)
* **AI Microservice (Gemini):** Deploy บน **Render** (Docker)

---

## 🛠️ โครงสร้างการเชื่อมต่อบน Cloud (Architecture)

```text
[ Vercel Frontend ] 
        │ (คุยผ่านอินเทอร์เน็ตด้วย HTTPS)
        ▼
[ Render Elysia Backend ] (Port 8000)
        │ (คุยภายในระบบ Render หรือผ่าน HTTPS)
        ▼
[ Render AI Microservice ] (Port 3002)
```

---

## 📦 ขั้นตอนที่ 1: Deploy AI Microservice ไปยัง Render

เนื่องจาก AI Service เขียนด้วย Elysia + Bun เราจึงใช้ **Dockerfile** ที่สร้างไว้ใน `backend/ai-service/Dockerfile` เพื่อสั่งให้ Render รันตัวโปรแกรมผ่าน Docker Container อย่างแม่นยำ

1. เข้าสู่ระบบ [render.com](https://render.com)
2. คลิก **New +** -> เลือก **Web Service**
3. เชื่อมต่อ GitHub Repository ของคุณ
4. ตั้งค่าหน้าแรกของ Service ดังนี้:
   * **Name:** `skill-wallet-ai` (หรือชื่ออื่นๆ ตามต้องการ)
   * **Root Directory:** `backend/ai-service` *(สำคัญมาก)*
   * **Runtime:** **Docker** *(Render จะดึง Dockerfile ในโฟลเดอร์นี้มาใช้สร้างระบบโดยอัตโนมัติ)*
   * **Instance Type:** เลือก **Free**
5. คลิกที่ **Advanced** เพื่อตั้งค่า **Environment Variables**:
   * `PORT` = `3002`
   * `GEMINI_API_KEY` = `AIzaSyAoGwniCrSNqzu94n58PgMDOQW_9ChS584` (ใส่คีย์ Gemini API ของคุณ)
6. กด **Create Web Service** และรอให้ระบบ Build เสร็จสิ้น
7. เมื่อเสร็จแล้ว คุณจะได้ URL ปลายทางมา (เช่น `https://skill-wallet-ai.onrender.com`)
   * *เราจะเรียกสิ่งนี้ว่า **`RENDER_AI_SERVICE_URL`***

---

## ⚙️ ขั้นตอนที่ 2: Deploy Elysia Backend ไปยัง Render

ตัว Backend หลักจะรันโดยใช้ **Dockerfile** ที่อยู่ใน `backend/Dockerfile`

1. ในหน้า Dashboard ของ Render คลิก **New +** -> เลือก **Web Service**
2. เชื่อมต่อ GitHub Repository เดิมของคุณ
3. ตั้งค่าหน้าแรกของ Service ดังนี้:
   * **Name:** `skill-wallet-backend`
   * **Root Directory:** `backend` *(สำคัญมาก)*
   * **Runtime:** **Docker** *(Render จะดึง Dockerfile ในโฟลเดอร์นี้มาใช้โดยอัตโนมัติ)*
   * **Instance Type:** เลือก **Free**
4. คลิกที่ **Advanced** เพื่อตั้งค่า **Environment Variables**:

| Key (ชื่อตัวแปร) | Value (ค่าที่ต้องใส่) | คำอธิบาย |
| --- | --- | --- |
| `PORT` | `8000` | พอร์ตหลักของ Backend |
| `NODE_ENV` | `production` | ระบุโหมดการรันระบบจริง |
| `FRONTEND_URL` | `https://xxxx.vercel.app` | **`VERCEL_FRONTEND_URL`** (เอามาจาก URL ของ Vercel ในขั้นตอนถัดไป) |
| `AI_SERVICE_URL` | `https://skill-wallet-ai.onrender.com` | **`RENDER_AI_SERVICE_URL`** (จากขั้นตอนที่ 1) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | `{"type": "service_account", ...}` | **สำคัญ ⚠️:** เปิดไฟล์ `web-pro-*.json` บนเครื่องของคุณ แล้วก๊อปปี้เนื้อหาทั้งหมดมาวางเป็น String บรรทัดเดียวในช่องนี้ (ไม่ต้องอัปโหลดไฟล์จริงขึ้น GitHub) |
| `FIREBASE_WEB_API_KEY` | `AIzaSyBMwMXF1jfjo7C9pTWEUZKmbcr_C88lyCw` | คีย์ Firebase Web API |
| `GITHUB_CLIENT_ID` | `Ov23liFjyWlxLxzb8bQM` | GitHub OAuth Client ID |
| `GITHUB_CLIENT_SECRET` | `8c520a27530f842091076bd88fcb1bf4097fda61` | GitHub OAuth Client Secret |
| `GEMINI_API_KEY` | `AIzaSyAoGwniCrSNqzu94n58PgMDOQW_9ChS584` | คีย์ Gemini API สำหรับ Backend |

5. กด **Create Web Service** และรอให้ระบบทำงานจนเสร็จสิ้น
6. เมื่อระบบขึ้นสถานะ Live คุณจะได้ URL ปลายทาง (เช่น `https://skill-wallet-backend.onrender.com`)
   * *เราจะเรียกสิ่งนี้ว่า **`RENDER_BACKEND_URL`***

---

## 🚀 ขั้นตอนที่ 3: Deploy Frontend ไปยัง Vercel

1. เข้าสู่ระบบ [vercel.com](https://vercel.com)
2. นำเข้า (Import) Repository ของคุณ
3. ตั้งค่าดังนี้:
   * **Root Directory:** `next-app` *(สำคัญมาก)*
   * **Framework Preset:** **Next.js**
4. ตั้งค่า **Environment Variables** โดยกดเปิดแท็บสัญลักษณ์ฟันเฟือง/ตั้งค่า แล้วป้อนค่าดังนี้:

| Key (ชื่อตัวแปร) | Value (ค่าที่ต้องใส่) |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://skill-wallet-backend.onrender.com` (ใส่ **`RENDER_BACKEND_URL`** จากขั้นตอนที่ 2) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyBMwMXF1jfjo7C9pTWEUZKmbcr_C88lyCw` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `web-pro-261e6.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `web-pro-261e6` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `web-pro-261e6.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `869632344083` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:869632344083:web:96ef8b40f6cee806713fe6` |

5. คลิก **Deploy** 
6. เมื่อเสร็จสิ้น คุณจะได้ URL เว็บของคุณมา (เช่น `https://skill-wallet.vercel.app`)
   * นำ URL นี้ย้อนกลับไปกรอกในตัวแปร `FRONTEND_URL` ของ **Render Backend** (ขั้นตอนที่ 2) เพื่อป้องกันปัญหา CORS บล็อกการเข้าถึง

---

## 🔑 ขั้นตอนที่ 4: ตั้งค่า GitHub OAuth App บนระบบจริง

คุณต้องเปลี่ยนค่า Redirect Callback ในระบบ GitHub App เพื่อให้ลิงก์ล็อกอินส่งข้อมูลผู้ใช้กลับมาถูกที่:

### 🔹 วิธีที่ 1: การใช้ Firebase Authentication (วิธีหลักที่ปุ่มล็อกอินปกติใช้งาน)
1. ไปที่ **Firebase Console** -> **Authentication** -> **Sign-in method** -> เปิดใช้งาน **GitHub**
2. คัดลอก **Authorization callback URL** (ตัวอย่าง: `https://web-pro-261e6.firebaseapp.com/__/auth/handler`)
3. ไปที่ [GitHub Developer Settings](https://github.com/settings/developers) -> **OAuth Apps** -> เลือก App ของคุณ
4. แก้ไขข้อมูลดังนี้:
   * **Homepage URL:** URL ที่ได้จาก Vercel (เช่น `https://skill-wallet.vercel.app`)
   * **Authorization callback URL:** วาง URL ที่ก๊อปปี้มาจาก Firebase Console ในข้อ 2
5. บันทึกการเปลี่ยนแปลง (Save Changes)

### 🔹 วิธีที่ 2: การใช้ระบบ Custom Callback Page (สำหรับหน้า `/auth/callback` ของ Next.js)
หากโปรเจกต์ของคุณใช้งาน Flow การ Callback ตรงสู่หน้า Next.js:
1. ไปที่ [GitHub Developer Settings](https://github.com/settings/developers) -> **OAuth Apps** -> เลือก App ของคุณ
2. แก้ไขข้อมูลดังนี้:
   * **Homepage URL:** URL ที่ได้จาก Vercel (เช่น `https://skill-wallet.vercel.app`)
   * **Authorization callback URL:** `https://skill-wallet.vercel.app/auth/callback` (URL ของ Vercel ต่อท้ายด้วย `/auth/callback`)
3. บันทึกการเปลี่ยนแปลง

---

## 🎉 สรุปผลลัพธ์หลังการ Deploy
* ทุกสิ่งทำงานบน Cloud 100% โดยผู้ใช้อื่นสามารถเปิดใช้งานเว็บผ่าน URL ของ Vercel ได้ทันที
* หน้าเว็บจะติดต่อกับ **Render Elysia Backend** ผ่านทางอินเทอร์เน็ต
* ตัว **Render Elysia Backend** จะยิงต่อหา **Render AI Microservice** เพื่อทำ Quiz และคุยกับ **Firestore Database** ในคลาวด์ เพื่อดึงและเซฟข้อมูล
* ไม่ต้องเปิดคอมพิวเตอร์ทิ้งไว้ หรือรัน ngrok อีกต่อไป!
