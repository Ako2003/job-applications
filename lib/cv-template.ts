import type {
  ExperienceItem,
  EducationItem,
  CertificationItem,
  AchievementItem,
  LanguageSkillItem,
  SkillGroup,
  ProjectItem,
  ReferenceItem,
} from "./validation/cv-builder";

// CV data structure for PDF generation
export type CVData = {
  language: string;
  fullName: string;
  tagline: string;
  email: string;
  phone: string;
  location: string;
  photoUrl: string;
  summary: string;
  highlights: string[];
  technicalSkills: SkillGroup[];
  experience: ExperienceItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  languageSkills: LanguageSkillItem[];
  featuredProjects: ProjectItem[];
  references: ReferenceItem[];
};

// Generate the HTML for the CV
export function generateCVHtml(data: CVData): string {
  return `
<!DOCTYPE html>
<html lang="${data.language.toLowerCase()}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.fullName} - CV</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&family=Open+Sans:wght@400;600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      font-family: 'Open Sans', sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #333;
      background: white;
    }

    .cv-container {
      width: 210mm;
      min-height: 297mm;
      display: flex;
      background: white;
    }

    /* Left Sidebar */
    .sidebar {
      width: 35%;
      background-color: #D4C4A8;
      padding: 0;
      display: flex;
      flex-direction: column;
    }

    .photo-container {
      width: 100%;
      padding: 20px 20px 0 20px;
    }

    .photo {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 8px 8px 50% 50%;
      display: block;
    }

    .photo-placeholder {
      width: 100%;
      aspect-ratio: 1;
      background: #b8a888;
      border-radius: 8px 8px 50% 50%;
    }

    .sidebar-content {
      padding: 15px 20px 20px 20px;
    }

    .name-section {
      text-align: left;
      margin-bottom: 5px;
      border-bottom: 2px solid #333;
      padding-bottom: 8px;
    }

    .name {
      font-family: 'Merriweather', serif;
      font-size: 18pt;
      font-weight: 700;
      color: #333;
      margin-bottom: 5px;
    }

    .tagline {
      font-size: 9pt;
      color: #555;
      line-height: 1.3;
    }

    .sidebar-section {
      margin-top: 15px;
    }

    .sidebar-section-title {
      font-family: 'Merriweather', serif;
      font-size: 12pt;
      font-weight: 700;
      color: #333;
      margin-bottom: 5px;
      border-bottom: 1.5px solid #333;
      padding-bottom: 3px;
    }

    .sidebar-list {
      list-style: disc;
      padding-left: 18px;
      margin-top: 8px;
    }

    .sidebar-list li {
      margin-bottom: 4px;
      font-size: 9pt;
      line-height: 1.3;
    }

    .education-item {
      margin-bottom: 10px;
    }

    .education-degree {
      font-size: 9pt;
      text-decoration: underline;
    }

    .education-institution {
      font-size: 9pt;
      margin-top: 2px;
    }

    .education-dates {
      font-size: 9pt;
      color: #555;
    }

    .cert-item {
      margin-bottom: 8px;
    }

    .cert-name {
      font-size: 9pt;
      text-decoration: underline;
    }

    .cert-topics {
      font-size: 9pt;
      margin-top: 2px;
    }

    /* Main Content */
    .main-content {
      width: 65%;
      padding: 20px 25px;
      background: white;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 15px;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 9pt;
    }

    .contact-icon {
      width: 14px;
      height: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .main-section {
      margin-bottom: 18px;
    }

    .main-section-title {
      font-family: 'Merriweather', serif;
      font-size: 14pt;
      font-weight: 700;
      font-style: italic;
      color: #333;
      margin-bottom: 5px;
      border-bottom: 1.5px solid #333;
      padding-bottom: 3px;
    }

    .summary-text {
      font-size: 9.5pt;
      line-height: 1.5;
      text-align: justify;
      margin-top: 8px;
    }

    /* Experience Section */
    .experience-item {
      margin-bottom: 15px;
    }

    .experience-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 3px;
    }

    .experience-title {
      font-size: 10pt;
      font-weight: 700;
    }

    .experience-dates {
      font-size: 9pt;
      color: #555;
      letter-spacing: 1px;
    }

    .experience-company {
      font-size: 9.5pt;
      font-style: italic;
      text-decoration: underline;
      margin-bottom: 5px;
    }

    .experience-bullets {
      list-style: disc;
      padding-left: 18px;
    }

    .experience-bullets li {
      font-size: 9pt;
      margin-bottom: 3px;
      line-height: 1.4;
      text-align: justify;
    }

    /* Projects Section */
    .project-item {
      margin-bottom: 12px;
    }

    .project-title {
      font-size: 10pt;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .project-bullets {
      list-style: disc;
      padding-left: 18px;
    }

    .project-bullets li {
      font-size: 9pt;
      margin-bottom: 3px;
      line-height: 1.4;
    }

    .project-links {
      font-size: 9pt;
      margin-top: 3px;
    }

    .project-links a {
      color: #333;
      text-decoration: underline;
    }

    /* References Section */
    .reference-item {
      margin-bottom: 10px;
    }

    .reference-name {
      font-size: 10pt;
      font-weight: 700;
    }

    .reference-title {
      font-size: 9pt;
    }

    .reference-contact {
      font-size: 9pt;
      margin-top: 3px;
    }

    .reference-contact-label {
      font-weight: 600;
    }

    /* Page break handling */
    .page-break {
      page-break-before: always;
    }

    @media print {
      .cv-container {
        width: 100%;
        min-height: auto;
      }
    }
  </style>
</head>
<body>
  <div class="cv-container">
    <!-- Left Sidebar -->
    <div class="sidebar">
      <div class="photo-container">
        ${data.photoUrl
          ? `<img src="${data.photoUrl}" alt="${data.fullName}" class="photo" />`
          : '<div class="photo-placeholder"></div>'
        }
      </div>

      <div class="sidebar-content">
        <div class="name-section">
          <div class="name">${data.fullName.toUpperCase()}</div>
          ${data.tagline ? `<div class="tagline">${data.tagline}</div>` : ''}
        </div>

        ${renderHighlights(data.highlights)}
        ${renderTechnicalSkills(data.technicalSkills)}
        ${renderEducation(data.education)}
        ${renderCertifications(data.certifications)}
        ${renderAchievements(data.achievements)}
        ${renderLanguageSkills(data.languageSkills)}
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      ${renderContactInfo(data)}
      ${renderSummary(data.summary)}
      ${renderExperience(data.experience)}
      ${renderProjects(data.featuredProjects)}
      ${renderReferences(data.references)}
    </div>
  </div>
</body>
</html>
  `.trim();
}

function renderContactInfo(data: CVData): string {
  const items: string[] = [];

  if (data.phone) {
    items.push(`
      <div class="contact-item">
        <span class="contact-icon">📞</span>
        <span>${data.phone}</span>
      </div>
    `);
  }

  if (data.email) {
    items.push(`
      <div class="contact-item">
        <span class="contact-icon">📧</span>
        <span>${data.email}</span>
      </div>
    `);
  }

  if (data.location) {
    items.push(`
      <div class="contact-item">
        <span class="contact-icon">📍</span>
        <span>${data.location}</span>
      </div>
    `);
  }

  if (items.length === 0) return '';

  return `
    <div class="contact-info">
      ${items.join('')}
    </div>
  `;
}

function renderSummary(summary?: string): string {
  if (!summary) return '';

  return `
    <div class="main-section">
      <div class="main-section-title">Professional Summary</div>
      <p class="summary-text">${summary}</p>
    </div>
  `;
}

function renderHighlights(highlights?: string[]): string {
  if (!highlights || highlights.length === 0) return '';

  return `
    <div class="sidebar-section">
      <div class="sidebar-section-title">Highlights</div>
      <ul class="sidebar-list">
        ${highlights.map(h => `<li>${h}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderTechnicalSkills(skills?: SkillGroup[]): string {
  if (!skills || skills.length === 0) return '';

  return `
    <div class="sidebar-section">
      <div class="sidebar-section-title">Technical Skills</div>
      <ul class="sidebar-list">
        ${skills.map(group => `<li>${group.skills}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderEducation(education?: EducationItem[]): string {
  if (!education || education.length === 0) return '';

  return `
    <div class="sidebar-section">
      <div class="sidebar-section-title">Education</div>
      ${education.map(edu => `
        <div class="education-item">
          <div class="education-degree">${edu.degree}:</div>
          <div class="education-institution">${edu.institution}${edu.location ? `, ${edu.location}` : ''} (${edu.startYear} – ${edu.endYear || 'Present'})</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderCertifications(certs?: CertificationItem[]): string {
  if (!certs || certs.length === 0) return '';

  return `
    <div class="sidebar-section">
      <div class="sidebar-section-title">Certifications</div>
      ${certs.map(cert => `
        <div class="cert-item">
          <div class="cert-name">${cert.name}${cert.year ? ` (${cert.year})` : ''}</div>
          ${cert.topics && cert.topics.length > 0 ? `
            <div class="cert-topics">${cert.topics.join('<br>')}</div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function renderAchievements(achievements?: AchievementItem[]): string {
  if (!achievements || achievements.length === 0) return '';

  return `
    <div class="sidebar-section">
      <div class="sidebar-section-title">Achievements</div>
      <ul class="sidebar-list">
        ${achievements.map(a => `<li>${a.title}${a.date ? ` (${a.date})` : ''}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderLanguageSkills(languages?: LanguageSkillItem[]): string {
  if (!languages || languages.length === 0) return '';

  return `
    <div class="sidebar-section">
      <div class="sidebar-section-title">Language Skills</div>
      <ul class="sidebar-list">
        ${languages.map(l => `<li>${l.language} - ${l.level}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderExperience(experience?: ExperienceItem[]): string {
  if (!experience || experience.length === 0) return '';

  return `
    <div class="main-section">
      <div class="main-section-title">Experience</div>
      ${experience.map(exp => `
        <div class="experience-item">
          <div class="experience-header">
            <span class="experience-title">${exp.title}</span>
            <span class="experience-dates">${formatDate(exp.startDate)} – ${exp.current ? 'Present' : formatDate(exp.endDate)}</span>
          </div>
          <div class="experience-company">${exp.company}</div>
          ${exp.bullets && exp.bullets.length > 0 ? `
            <ul class="experience-bullets">
              ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function renderProjects(projects?: ProjectItem[]): string {
  if (!projects || projects.length === 0) return '';

  return `
    <div class="main-section">
      <div class="main-section-title">Featured Projects</div>
      ${projects.map(proj => `
        <div class="project-item">
          <div class="project-title">${proj.name}${proj.techStack ? ` (${proj.techStack}):` : ':'}</div>
          ${proj.bullets && proj.bullets.length > 0 ? `
            <ul class="project-bullets">
              ${proj.bullets.map(b => `<li>${b}</li>`).join('')}
            </ul>
          ` : ''}
          ${(proj.liveUrl || proj.githubUrl) ? `
            <div class="project-links">
              ${proj.liveUrl ? `Live demo: <a href="${proj.liveUrl}">${proj.liveUrl}</a>` : ''}
              ${proj.liveUrl && proj.githubUrl ? '<br>' : ''}
              ${proj.githubUrl ? `Github: <a href="${proj.githubUrl}">${proj.githubUrl}</a>` : ''}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function renderReferences(references?: ReferenceItem[]): string {
  if (!references || references.length === 0) return '';

  return `
    <div class="main-section">
      <div class="main-section-title">References</div>
      ${references.map(ref => `
        <div class="reference-item">
          <div class="reference-name">${ref.name}</div>
          ${ref.title || ref.company ? `
            <div class="reference-title">${[ref.title, ref.company].filter(Boolean).join(' / ')}</div>
          ` : ''}
          ${ref.phone || ref.email ? `
            <div class="reference-contact">
              <span class="reference-contact-label">Contact:</span>
              ${[ref.phone, ref.email].filter(Boolean).join('<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  // Expect "MM/YYYY" format, convert to "MM/YYYY" display
  return dateStr;
}
