# สรุปรายการแก้ไขและอัปเดตระบบ (Frame Fix) - วันนี้

เอกสารนี้สรุปรายการเปลี่ยนแปลงทั้งหมดที่ได้ดำเนินการเพื่อปรับปรุงหน้าตาเว็บ (UI) ให้เป็น **GitHub Dark Theme** และเพิ่มฟีเจอร์การใช้งานต่างๆ ในส่วนของ Frontend (Next.js)

## 1. การเปลี่ยนระบบเป็น GitHub Dark Mode สมบูรณ์แบบ
- **CSS Overrides**: ปรับแก้ไฟล์ `app/globals.css` โดยล้างสี Dark Mode แบบเดิมทิ้ง และใช้โทนสีของ GitHub แท้ 100% 
  - พื้นหลังหลัก (Background): `#0d1117`
  - การ์ดและแถบเมนู (Glass Panels): `#161b22`
  - เส้นขอบ (Borders): `#30363d`
  - ตัวอักษร (Text): `#c9d1d9` และ `#8b949e`
- **Hydration Mismatch Fix**: แก้บัคที่ปุ่มกดสลับ Dark Mode กดไม่ติด โดยเข้าไปเติมคำสั่ง `suppressHydrationWarning` ในแท็ก `<body>` ที่ไฟล์ `app/layout.tsx` ทำให้ React สามารถผูก Event Listener ให้ปุ่มได้สำเร็จ

## 2. แก้ปัญหาแสงสว่างวาบ (White Glow) ทะลุการ์ดในหน้า Jobs
- **Nuke Shadows**: พบปัญหาคลาส Tailwind ประเภท `shadow-2xl` หรือ `hover:shadow-slate-100` สว่างจ้าเกินไปใน Dark Mode 
- **การแก้ไข**: เขียนกฏ CSS ขั้นเด็ดขาดดักจับทุกคลาสที่มีคำว่า shadow (`[class*="shadow"]`) เพื่อสั่งลบเงาทิ้ง (`box-shadow: none !important`) และตั้งค่า `--tw-shadow-color: transparent` เฉพาะในโหมดมืด ทำให้การ์ดเรียบหรูดูแบนราบแบบ GitHub ไม่มีแสงรบกวน

## 3. ปรับแก้ดีเทลสี (Badges & Background Blur)
- **ปรับสีป้ายบอกจำนวน (Pill Badges)**: คลาส `bg-slate-100/50` ทำให้ป้ายมีสีเทาสว่างและอ่านตัวอักษรไม่ออกในโหมดมืด ได้ทำการใช้ CSS Attribute Selector (`[class*="bg-slate-100/50"]`) เพื่อบังคับให้พื้นหลังเป็นสีเทาเข้ม `#21262d` และตัวอักษรสีขาวสว่าง
- **ลบแสงสีฟ้าหลังโปรไฟล์**: สั่งปิด (Hide) ก้อนแสงเบลอๆ ด้านหลังโปรไฟล์ (`blur-[120px]`, `bg-blue-600/10`) ด้วย `display: none !important` ทำให้พื้นหลังกลายเป็นสีดำล้วนๆ ตามความต้องการ

## 4. เพิ่มระบบ Hamburger Menu (Collapsible Sidebar)
- **ปรับแก้ SidebarLayout.tsx**: ย้ายปุ่ม Hamburger ไปไว้ด้านซ้ายของโลโก้ MintSkill
- **การยืด/หด (Toggle)**: 
  - ตอนขยาย: กว้าง `w-64` (256px) แสดงไอคอนและข้อความครบถ้วน
  - ตอนหด: กว้าง `w-[4.5rem]` (72px) ซ่อนข้อความทั้งหมด ปรับปุ่มให้เป็นสี่เหลี่ยมจัตุรัสพอดี (`aspect-square`) ทำให้ไอคอนอยู่ตรงกลางอย่างสมมาตรเหมือนแถบเครื่องมือของ GitHub
- **การจดจำสถานะ (State Persistence)**: 
  - เขียนโค้ดให้แถบเมนู **หดเก็บโดยอัตโนมัติ (Collapsed by default)** เมื่อเปิดหน้าเว็บครั้งแรก
  - ใช้ `localStorage` เข้ามาช่วยจำสถานะ ทำให้เวลาผู้ใช้กดเปลี่ยนหน้าต่าง (Navigate) ไปมาระหว่าง Profile, Explore, Jobs แถบเมนูจะไม่เด้งขยายกลับมาเองให้กวนใจ
## 5. ย้ายตำแหน่งปุ่ม Dark Mode ให้แนบเนียนไปกับระบบ
- **ถอดปุ่มออกจาก Global Layout**: นำปุ่ม `DarkModeToggle` ออกจาก `app/layout.tsx` เพื่อไม่ให้ปุ่มลอยเกะกะอยู่ที่มุมขวาบนของทุกหน้า
- **รวมเข้ากับ Sidebar**: ย้ายปุ่มไปฝังไว้ในแถบ Sidebar ด้านซ้าย (เหนือปุ่ม Sign Out) โดยจัดรูปแบบให้ยืด/หดตาม Sidebar ได้อย่างสมบูรณ์แบบ
  - ตอนขยาย: แสดงไอคอนพร้อมข้อความ "Dark Mode" / "Light Mode"
  - ตอนหด: แสดงเพียงไอคอน จัดกึ่งกลางพอดี

## 6. ปรับโทนสีขั้นสุดยอด (Monochrome / High Contrast) และแก้สีปุ่ม Endorse
- **เปลี่ยนสีฟ้าน้ำเงินเป็นขาว-ดำ**: แก้ไข `app/globals.css` โดยไล่เขียนทับคลาสสีฟ้า (เช่น `text-blue-400`, `bg-blue-500/10`) ให้กลายเป็นโทนสีขาว (`#ffffff`) และเทาเข้ม (`#21262d`, `#30363d`) ทั้งหมด เพื่อให้เป็นสไตล์ GitHub Dimmed (ขาวดำล้วน) ที่ดูมินิมอลและดุดันยิ่งขึ้น
- **ปิดการไล่สี (Gradient)**: เขียนคำสั่งปิดการเรนเดอร์สีแบบ Gradient ทั้งหมดใน Dark Mode
- **แก้ปุ่ม Endorse (หน้า Explore)**: ดักจับและเขียนทับคลาส `border-blue-500/30` และ `hover:bg-blue-500/20` ที่ทำให้ปุ่ม Endorse มีเส้นขอบสีฟ้าและเปลี่ยนเป็นสีฟ้าตอนนำเมาส์ไปชี้ โดยเปลี่ยนให้เป็นสีเทาเพื่อให้คุมโทนภาพรวมของเว็บได้ 100%

---
*ดำเนินการแก้ไขทั้งหมดสำเร็จและตรงตามดีไซน์ Reference เรียบร้อยแล้ว*

# Frame Fix - Portfolio Export System Automation

## Description of Changes

We modified the **Portfolio Export / Resume Builder** system to be 100% automated based on database profile details, verified skills, and synchronized GitHub repositories. In doing so, we completely bypassed the AI/LLM API description generation features (Gemini API), since the user's token is exhausted.

### Modified Files:

1. **[exportPortfolioTab.tsx](file:///c:/CODING/university/year2term2/web/FINALBOSSPROJECT/next-app/components/dashboard/tabs/exportPortfolioTab.tsx)**
   - **Removed manual entry wizard steps**: Completely eliminated the 3-step wizard and manual forms (stepper progress bar, input fields for name, phone, email, education, experience).
   - **Redesigned UI**: Changed layout to a single-screen dashboard.
     - **Left Column**: Selected template picker, a list of synced GitHub projects (showing name, language, date, and description), and a list of verified skills.
     - **Right Column**: Live A4 resume preview mockup.
     - **Header/Footer**: Download PDF / Print button.
   - **Integrated Automatic Mounting Sync**: Added an automatic fetch on component mount calling `githubService.getDashboard()` (under a visual `isSyncing` loading indicator) to pull the user's latest Firestore profile and repository data.
   - **Bypassed AI Endpoint**: Completely removed the "✨ AI Generate Description" buttons and related API post requests (`/ai/repo-bullets`). Built the project descriptions list directly using the original repository description from GitHub (with a fallback to `"Developed and maintained the [name] repository on GitHub."` if empty).
   - **Integrated Dynamic Profile Information**: Map personal fields automatically from Firestore data (`displayName`, `title`, `bio`, `location`, `linkedinUrl`, and `githubUsername`). The profile bio is rendered under a new "About Me" section on all printable HTML layouts and previews.

2. **[CVTemplate.tsx](file:///c:/CODING/university/year2term2/web/FINALBOSSPROJECT/next-app/components/dashboard/CVTemplate.tsx)**
   - Updated the print layout for CV Template to render the automated, non-AI fields:
     - Header prints dynamic name, job title, email, GitHub profile path, LinkedIn profile path, and location.
     - Replaced manual education/experience sections with the dynamic "About Me" (`resumeData?.bio`) section.
     - Renders "Featured Projects" list from GitHub synced repositories using their original description details.
     - Displays "Technical Skills" badges derived directly from verified skills.

# Frame Fix - AI CV Arranger & Deployment Preparation (Vercel & ngrok)

## Description of Changes

We implemented an AI-powered CV Arranger and Enhancer that lets users prompt Gemini to polish and tailor their CV, added a collapsible Manual Resume Editor, resolved microservice port mismatches, and created deployment guides and helper scripts.

### Modified Files:

1. **[exportPortfolioTab.tsx](file:///c:/CODING/university/year2term2/web/FINALBOSSPROJECT/next-app/components/dashboard/tabs/exportPortfolioTab.tsx)**
   - **AI CV Assistant Panel**: Added a text area for prompt inputs, suggestion chips (e.g. "Tailor for Frontend", "Translate to English"), a visual loading spinner while AI works, and an AI Refinements summary box.
   - **Manual Resume Editor**: Created a collapsible editor that lets users review and manually adjust all fields (Full Name, Title, Bio, Email, Phone, Location, GitHub, LinkedIn) and add/edit/remove project names, dates, and bullet details.
   - **Mockup & Print Enhancements**: Rendered all project bullet points (instead of just the first one) in the preview, and supported phone/LinkedIn info in both preview and print layouts for all templates.

2. **[index.ts](file:///c:/CODING/university/year2term2/web/FINALBOSSPROJECT/backend/ai-service/src/index.ts)**
   - Added a `POST /arrange-cv` endpoint that delegates requests to Gemini (`gemini-flash-lite-latest`) with a robust system prompt, returning formatted JSON and a list of refinements.

3. **[ai.service.ts](file:///c:/CODING/university/year2term2/web/FINALBOSSPROJECT/backend/src/services/ai.service.ts)**
   - Made the microservice URL dynamic (`process.env.AI_SERVICE_URL || "http://localhost:3002"`) to fix port mismatches.
   - Added proxy method `arrangeCV` to fetch from the AI microservice.

4. **[ai.controller.ts](file:///c:/CODING/university/year2term2/web/FINALBOSSPROJECT/backend/src/controllers/ai.controller.ts) & [ai.route.ts](file:///c:/CODING/university/year2term2/web/FINALBOSSPROJECT/backend/src/routes/ai.route.ts)**
   - Added and exposed `POST /ai/arrange-cv` route with validation.

5. **[firebase.service.ts](file:///c:/CODING/university/year2term2/web/FINALBOSSPROJECT/backend/src/services/firebase.service.ts)**
   - Upgraded initialization to support stringified service account credentials via `FIREBASE_SERVICE_ACCOUNT_JSON` for cloud serverless deployments (like Vercel).

### New Files:
- **[deploy-guide.md](file:///c:/CODING/university/year2term2/web/FINALBOSSPROJECT/deploy-guide.md)**: Full guide to configure Vercel, CORS, ngrok tunnels, and GitHub OAuth callback links.
- **[start-ngrok.ps1](file:///c:/CODING/university/year2term2/web/FINALBOSSPROJECT/start-ngrok.ps1)**: Automation script to start ngrok on port 8000.

