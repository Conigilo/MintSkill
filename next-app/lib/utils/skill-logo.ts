/**
 * Shared utility: Skill Logo URL generator
 * ดึง logo ของแต่ละภาษา/เครื่องมือจาก Simple Icons CDN
 *
 * ย้ายมาจาก SkillsTab.tsx + OverviewTab.tsx เพื่อไม่ให้โค้ดซ้ำ
 */

const SPECIAL_CASES: Record<string, string> = {
  "node.js": "nodedotjs",
  "nodejs": "nodedotjs",
  "c++": "cplusplus",
  "c#": "csharp",
  "system design": "diagramsdotnet",
  "testing": "playwright",
  "html": "html5",
  "css": "css3",
  "c": "c",
  "typescript": "typescript",
  "reactjs": "react",
  "nextjs": "nextjs",
};

/**
 * แปลงชื่อ skill เป็น URL ของ logo จาก Simple Icons
 * @example getSkillLogoUrl("Node.js") → "https://cdn.simpleicons.org/nodedotjs"
 */
export function getSkillLogoUrl(skillName: string): string {
  const name = skillName.trim().toLowerCase();
  const slug = SPECIAL_CASES[name] || name.replace(/[^a-z0-9]/g, "");
  return `https://cdn.simpleicons.org/${slug}`;
}
