/**
 * Gap Analysis static data — ข้อมูลสายอาชีพ, resources, รายละเอียดทักษะ
 * ย้ายมาจาก GapAnalysisTab.tsx เพื่อแยก data ออกจาก UI logic
 */

import type { GapAnalysisRole } from '@/lib/types'

export const rolesData: Record<string, GapAnalysisRole> = {
  "Full-Stack Engineer": {
    desc: "พัฒนาเว็บแอปพลิเคชันแบบครบวงจร ทั้งระบบหลังบ้านและหน้าบ้านสำหรับงานสเกลใหญ่",
    requirements: [
      { name: "JavaScript", req: 90 },
      { name: "React", req: 85 },
      { name: "Node.js", req: 80 },
      { name: "System Design", req: 70 },
      { name: "SQL", req: 65 },
    ],
  },
  "Data Scientist / AI": {
    desc: "วิเคราะห์ข้อมูลขนาดใหญ่ พัฒนาโมเดล Machine Learning และสถิติสำหรับธุรกิจเชิงลึก",
    requirements: [
      { name: "Python", req: 90 },
      { name: "SQL", req: 85 },
      { name: "Finance/Math", req: 80 },
      { name: "React", req: 40 },
    ],
  },
  "QA Automation": {
    desc: "เขียนโปรแกรมทดสอบระบบอัตโนมัติ ทดสอบประสิทธิภาพ และวิเคราะห์หาจุดบกพร่องของระบบ",
    requirements: [
      { name: "Testing", req: 90 },
      { name: "Python", req: 75 },
      { name: "JavaScript", req: 70 },
      { name: "Node.js", req: 50 },
    ],
  },
  "Quant Developer": {
    desc: "พัฒนาอัลกอริทึมเทรดความเร็วสูง แบบจำลองความเสี่ยงทางการเงิน และระบบคำนวณเชิงคณิตศาสตร์",
    requirements: [
      { name: "C++", req: 90 },
      { name: "Python", req: 85 },
      { name: "Finance/Math", req: 85 },
      { name: "System Design", req: 60 },
    ],
  },
}

export const skillResources: Record<string, string> = {
  "JavaScript": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  "React": "https://react.dev",
  "Node.js": "https://nodejs.org/en/learn",
  "System Design": "https://github.com/donnemartin/system-design-primer",
  "SQL": "https://sqlzoo.net/",
  "Python": "https://roadmap.sh/python",
  "Testing": "https://testing-library.com/docs/guiding-principles",
  "Finance/Math": "https://www.khanacademy.org/math",
  "C++": "https://learncpp.com",
}

export const skillDetails: Record<string, {
  topics: string[];
  project: string;
  difficulty: "ระดับเริ่มต้น" | "ระดับกลาง" | "ระดับสูง";
  diffColor: string;
}> = {
  "JavaScript": {
    topics: ["Asynchronous JS (Promises, async/await)", "Closures & Scope Chain", "ES6+ Modern Syntax & Array methods", "Event Loop & Engine Architecture"],
    project: "สร้างแอปพลิเคชันพยากรณ์อากาศแบบ Real-time ดึงข้อมูลผ่าน Fetch API และอัปเดต DOM แบบไม่มีสะดุด",
    difficulty: "ระดับกลาง",
    diffColor: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-500/20",
  },
  "React": {
    topics: ["Custom Hooks & Optimization (useMemo, useCallback)", "State Management (Context API, Redux Toolkit)", "Component Lifecycles & Virtual DOM", "Performance Audit & Rendering profiling"],
    project: "พัฒนาโปรแกรมบริหารจัดการบอร์ดงาน (Kanban Board) ที่รองรับการลากวาง (Drag-and-Drop) และบันทึกข้อมูลแบบ LocalStorage",
    difficulty: "ระดับกลาง",
    diffColor: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-500/20",
  },
  "Node.js": {
    topics: ["Building RESTful APIs with Express/Fastify", "Event-driven architecture & Streams", "Authentication systems (JWT, OAuth)", "Middleware implementation & Global error handler"],
    project: "สร้าง backend เซิร์ฟเวอร์สำหรับแพลตฟอร์มบทเรียนออนไลน์พร้อมระบบล็อกอิน ถอดรหัสโทเคน และอัปโหลดไฟล์ขนาดใหญ่ด้วย Stream",
    difficulty: "ระดับสูง",
    diffColor: "text-red-600 bg-rose-50 dark:text-red-400 dark:bg-red-500/10 border-red-200/50 dark:border-red-500/20",
  },
  "System Design": {
    topics: ["Caching strategies (Redis, CDN)", "Database Sharding & Replication", "Load Balancing & Horizontal Scaling", "Microservices vs Monolith patterns", "Message Queues (RabbitMQ, Kafka)"],
    project: "ออกแบบพิมพ์เขียวระบบสตรีมมิ่งวิดีโอที่สามารถขยายขนาดเพื่อรองรับผู้ชมพร้อมกัน 5 ล้านราย โดยไม่มีความหน่วงสะสม",
    difficulty: "ระดับสูง",
    diffColor: "text-red-600 bg-rose-50 dark:text-red-400 dark:bg-red-500/10 border-red-200/50 dark:border-red-500/20",
  },
  "SQL": {
    topics: ["Window Functions (Row_Number, Partition)", "Query Optimization & Indexing principles", "Complex Joins, Subqueries & CTEs", "ACID Transactions & Lock systems"],
    project: "วิเคราะห์ข้อมูลประวัติการขายสินค้าแยกตามสาขาและรายเดือนด้วยคำสั่ง SQL Window Functions เพื่อหาพนักงานท็อปเปอร์ฟอร์มเมอร์",
    difficulty: "ระดับกลาง",
    diffColor: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-500/20",
  },
  "Python": {
    topics: ["Advanced Data Structures (Lists, Dicts, Tuples)", "OOP & Design Patterns in Python", "Generators & Decorators usage", "Pipenv / Poetry Package management"],
    project: "พัฒนาบอทคอยแจ้งเตือนราคาสินค้าอัจฉริยะ (Web Scraper) ส่งสถิติเข้ากล่องจดหมายอีเมลแบบกำหนดเวลาล่วงหน้า",
    difficulty: "ระดับเริ่มต้น",
    diffColor: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10 border-green-200/50 dark:border-green-500/20",
  },
  "Testing": {
    topics: ["Unit testing frameworks (Jest, PyTest)", "Integration & API Endpoint testing", "End-to-End testing (Cypress, Playwright)", "Mocking dependencies & Test coverage reporting"],
    project: "เขียนชุดโปรแกรมทดสอบออโตเมชันครอบคลุมหน้าจอเข้าสู่ระบบและระบบชำระเงินของแอปพลิเคชัน E-commerce ค้นพบและป้องกัน Bug",
    difficulty: "ระดับกลาง",
    diffColor: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-500/20",
  },
  "Finance/Math": {
    topics: ["Linear Algebra & Matrix Operations", "Probability distributions & Statistical tests", "Time-series forecasting models", "Financial engineering mathematical functions"],
    project: "สร้างโปรแกรมคำนวณมูลค่าความเสี่ยงของพอร์ตฟอลิโอสินทรัพย์ด้วยโมเดลวิเคราะห์ความถี่ประวัติราคาแบบจำลองมอนเตการ์โล",
    difficulty: "ระดับสูง",
    diffColor: "text-red-600 bg-rose-50 dark:text-red-400 dark:bg-red-500/10 border-red-200/50 dark:border-red-500/20",
  },
  "C++": {
    topics: ["Pointer allocation & Smart pointers", "Object-Oriented C++ & Template structures", "Standard Template Library (STL) algorithms", "Thread pooling & Low-latency operations"],
    project: "พัฒนาเซิร์ฟเวอร์ย่อยสำหรับการส่งข้อมูลคำสั่งเทรดหุ้นแบบ Real-time ที่ตอบรับคำสั่งซื้อขายได้เร็วระดับไมโครวินาที",
    difficulty: "ระดับสูง",
    diffColor: "text-red-600 bg-rose-50 dark:text-red-400 dark:bg-red-500/10 border-red-200/50 dark:border-red-500/20",
  },
}
