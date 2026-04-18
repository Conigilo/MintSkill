export interface ResumeData {
  fullName: string
  username: string
  phone: string
  email: string
  title: string
  education: { school: string; degree: string; gpax: string; year: string }[]
  activities: { title: string; date: string; details: string[] }[]
  projects: { name: string; date: string; details: string[] }[]
  strengths: string[]
}

export const DEFAULT_RESUME: ResumeData = {
  fullName: '',
  username: '',
  phone: '',
  email: '',
  title: 'Software Developer',
  education: [{ school: '', degree: '', gpax: '', year: '' }],
  activities: [{ title: '', date: '', details: [''] }],
  projects: [{ name: '', date: '', details: [''] }],
  strengths: [''],
}

export function generateResumeHtml(
  templateId: string, r: ResumeData, allSkills: string[], verifiedSkills: string[]
): string {
  const now = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
  const contactLine = [r.phone && `Tel : ${r.phone}`, r.email && `Email : ${r.email}`].filter(Boolean).join(' ')

  const eduHtml = r.education.filter(e => e.school).map(e => `
    <div style="display:flex;justify-content:space-between;margin-bottom:2px;"><strong>${e.school}</strong><span>${e.year}</span></div>
    ${e.degree ? `<ul style="margin:2px 0 8px 20px;"><li>${e.degree}</li>${e.gpax ? `<li>GPAX: ${e.gpax}</li>` : ''}</ul>` : ''}
  `).join('')

  const actHtml = r.activities.filter(a => a.title).map(a => `
    <div style="display:flex;justify-content:space-between;margin-bottom:2px;"><strong>${a.title}</strong><span>${a.date}</span></div>
    <ul style="margin:2px 0 10px 20px;">${a.details.filter(d => d).map(d => `<li>${d}</li>`).join('')}</ul>
  `).join('')

  const projHtml = r.projects.filter(p => p.name).map(p => `
    <div style="display:flex;justify-content:space-between;margin-bottom:2px;"><strong>"${p.name}"</strong><span>${p.date}</span></div>
    <ul style="margin:2px 0 10px 20px;">${p.details.filter(d => d).map(d => `<li>${d}</li>`).join('')}</ul>
  `).join('')

  const skillsHtml = allSkills.length > 0
    ? allSkills.map(s => `<span style="display:inline-block;margin:0 6px 4px 0;">${verifiedSkills.includes(s) ? '✓' : '•'} ${s}</span>`).join('')
    : '<em>No skills added</em>'

  const strengthsHtml = r.strengths.filter(s => s).map(s => `<li>${s}</li>`).join('')

  const head = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${r.fullName || 'Resume'}</title>
<style>
  @page { margin: 15mm; size: A4; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #1a1a1a; line-height: 1.5; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  h1 { font-size: 28px; }
  h2 { font-size: 15px; margin-top: 18px; margin-bottom: 8px; }
  ul { padding-left: 18px; }
  li { margin-bottom: 2px; }
</style></head><body>`

  const end = `</body></html>`

  // ── Classic template (similar to the user's reference image) ──
  if (templateId === 'classic' || templateId === 'minimal') {
    const accent = templateId === 'classic' ? '#000' : '#10b981'
    const headingStyle = `font-weight:700;border-bottom:2px solid ${accent};padding-bottom:4px;`
    return `${head}
<div style="max-width:21cm;margin:0 auto;padding:20px 0;">
  <div style="text-align:center;margin-bottom:16px;">
    <h1 style="font-weight:900;margin-bottom:4px;">${r.fullName || r.username}</h1>
    ${contactLine ? `<p style="font-size:11px;color:#555;">${contactLine}</p>` : ''}
  </div>
  ${eduHtml ? `<h2 style="${headingStyle}">Education</h2>${eduHtml}` : ''}
  ${actHtml ? `<h2 style="${headingStyle}">Activity & Achievement</h2>${actHtml}` : ''}
  ${projHtml ? `<h2 style="${headingStyle}">Project</h2>${projHtml}` : ''}
  <h2 style="${headingStyle}">Technical Skills</h2>
  <div style="margin-bottom:12px;">${skillsHtml}</div>
  ${strengthsHtml ? `<h2 style="${headingStyle}">Additional Strengths</h2><ul>${strengthsHtml}</ul>` : ''}
  <p style="font-size:9px;color:#aaa;margin-top:40px;text-align:center;">Generated from Skill Wallet · ${now}</p>
</div>${end}`
  }

  if (templateId === 'modern') {
    return `${head}
<div style="display:flex;min-height:29.7cm;max-width:21cm;margin:0 auto;">
  <div style="width:35%;background:#8b5cf6;color:white;padding:32px 20px;">
    <div style="width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;margin-bottom:16px;">${((r.fullName || r.username || 'U')[0]).toUpperCase()}</div>
    <h1 style="font-size:18px;color:white;margin-bottom:2px;">${r.fullName || r.username}</h1>
    <p style="font-size:11px;opacity:0.8;margin-bottom:4px;">${r.title}</p>
    ${r.phone ? `<p style="font-size:10px;opacity:0.7;">📞 ${r.phone}</p>` : ''}
    ${r.email ? `<p style="font-size:10px;opacity:0.7;">✉️ ${r.email}</p>` : ''}
    <h3 style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid rgba(255,255,255,0.3);padding-bottom:4px;margin:20px 0 8px;">Skills</h3>
    ${allSkills.map(s => `<p style="font-size:11px;margin-bottom:3px;">${verifiedSkills.includes(s) ? '✓' : '○'} ${s}</p>`).join('')}
    ${strengthsHtml ? `<h3 style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid rgba(255,255,255,0.3);padding-bottom:4px;margin:20px 0 8px;">Strengths</h3><ul style="padding-left:14px;font-size:11px;opacity:0.9;">${strengthsHtml}</ul>` : ''}
  </div>
  <div style="flex:1;padding:32px 28px;">
    ${eduHtml ? `<h2 style="color:#8b5cf6;border-bottom:2px solid #8b5cf6;padding-bottom:4px;">Education</h2>${eduHtml}` : ''}
    ${actHtml ? `<h2 style="color:#8b5cf6;border-bottom:2px solid #8b5cf6;padding-bottom:4px;">Activity & Achievement</h2>${actHtml}` : ''}
    ${projHtml ? `<h2 style="color:#8b5cf6;border-bottom:2px solid #8b5cf6;padding-bottom:4px;">Project</h2>${projHtml}` : ''}
    <p style="font-size:9px;color:#aaa;margin-top:40px;">Skill Wallet · ${now}</p>
  </div>
</div>${end}`
  }

  // Bold
  return `${head}
<div style="max-width:21cm;margin:0 auto;">
  <div style="background:#f59e0b;padding:32px 40px;color:#1c1917;">
    <h1 style="font-size:36px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin-bottom:2px;">${r.fullName || r.username}</h1>
    <p style="font-size:14px;font-weight:600;">${r.title} ${contactLine ? `· ${contactLine}` : ''}</p>
  </div>
  <div style="padding:28px 40px;">
    ${eduHtml ? `<h2 style="color:#f59e0b;font-weight:800;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f59e0b;padding-bottom:4px;">Education</h2>${eduHtml}` : ''}
    ${actHtml ? `<h2 style="color:#f59e0b;font-weight:800;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f59e0b;padding-bottom:4px;">Activity & Achievement</h2>${actHtml}` : ''}
    ${projHtml ? `<h2 style="color:#f59e0b;font-weight:800;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f59e0b;padding-bottom:4px;">Project</h2>${projHtml}` : ''}
    <h2 style="color:#f59e0b;font-weight:800;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f59e0b;padding-bottom:4px;">Technical Skills</h2>
    <div style="margin-bottom:12px;">${skillsHtml}</div>
    ${strengthsHtml ? `<h2 style="color:#f59e0b;font-weight:800;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f59e0b;padding-bottom:4px;">Additional Strengths</h2><ul>${strengthsHtml}</ul>` : ''}
    <p style="font-size:9px;color:#aaa;margin-top:40px;text-align:center;">Skill Wallet · ${now}</p>
  </div>
</div>${end}`
}
