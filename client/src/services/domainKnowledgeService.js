import apiClient from '../api/client';
import {
  DOMAIN_KNOWLEDGE_STORE,
  getAllKnowledgeDomains,
  getKnowledgeDomainById,
  getKnowledgeModule,
  CAREER_FAMILIES
} from '../data/domainKnowledgeData';

const PROGRESS_STORAGE_KEY = 'campuscorp_domain_progress';
const BOOKMARKS_STORAGE_KEY = 'campuscorp_domain_bookmarks';

function getLocalProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function setLocalProgress(data) {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

function getLocalBookmarks() {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function setLocalBookmarks(data) {
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

export const domainKnowledgeService = {
  /**
   * 1. Get all 38 domains with category, module count, and progress
   */
  async getDomains(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.q) params.append('q', filters.q);
      if (filters.category && filters.category !== 'All Domains' && filters.category !== 'All Families') {
        params.append('category', filters.category);
      }
      if (filters.family && filters.family !== 'All Families') {
        params.append('family', filters.family);
      }

      const res = await apiClient.get(`/career/knowledge-hub/domains?${params.toString()}`);
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('[domainKnowledgeService] Using local dataset for domains list:', err.message);
    }

    // Local fallback with local progress aggregation
    const localProg = getLocalProgress();
    let domains = getAllKnowledgeDomains();

    if (filters.q && filters.q.trim()) {
      const q = filters.q.toLowerCase().trim();
      domains = domains.filter((d) =>
        d.name.toLowerCase().includes(q) ||
        d.shortDescription.toLowerCase().includes(q) ||
        (d.technologies && d.technologies.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (filters.category && filters.category !== 'All Domains' && filters.category !== 'All Families') {
      domains = domains.filter(
        (d) => d.family.toLowerCase() === filters.category.toLowerCase() || d.name.toLowerCase() === filters.category.toLowerCase()
      );
    }

    const domainsWithProgress = domains.map((d) => {
      const completedModules = localProg[d.id] ? Object.keys(localProg[d.id]).filter((k) => localProg[d.id][k]?.isCompleted).length : 0;
      const totalModules = d.modulesCount || 12;
      return {
        ...d,
        completedModules,
        progressPercentage: Math.round((completedModules / totalModules) * 100),
        isCompleted: completedModules >= totalModules
      };
    });

    return {
      totalDomains: domains.length,
      totalModulesAcrossPlatform: domains.length * 12,
      categories: CAREER_FAMILIES,
      domains: domainsWithProgress,
      source: 'local'
    };
  },

  /**
   * 2. Get single domain details with 12-module manifest
   */
  async getDomainBySlug(slug) {
    if (!slug) return null;
    try {
      const res = await apiClient.get(`/career/knowledge-hub/domains/${slug}`);
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn(`[domainKnowledgeService] Fallback to local data for domain ${slug}:`, err.message);
    }

    const domain = getKnowledgeDomainById(slug);
    if (!domain) return null;

    const localProg = getLocalProgress();
    const domainProg = localProg[domain.id] || {};
    const completedNums = Object.keys(domainProg).filter((k) => domainProg[k]?.isCompleted).map(Number);
    const bookmarks = getLocalBookmarks().filter((b) => b.domainId === domain.id);

    const modulesSummary = domain.modules.map((m) => ({
      moduleNumber: m.moduleNumber,
      title: m.title,
      subtitle: m.subtitle,
      estimatedMinutes: m.estimatedMinutes,
      sectionsCount: (m.sections && m.sections.length) || 0,
      hasCodeLab: Boolean(m.codeSnippet),
      hasProjects: Boolean(m.projects),
      hasInterviewPrep: Boolean(m.interviews),
      hasAssessment: Boolean(m.assessments),
      isCompleted: completedNums.includes(m.moduleNumber)
    }));

    return {
      id: domain.id,
      name: domain.name,
      family: domain.family,
      icon: domain.icon,
      shortDescription: domain.shortDescription,
      overview: domain.overview,
      technologies: domain.technologies,
      careerProgression: domain.careerProgression,
      totalModules: domain.modulesCount || 12,
      estimatedLearningHours: domain.estimatedLearningHours || 32,
      modules: modulesSummary,
      introduction: domain.introduction,
      subdomains: domain.subdomains || [],
      careerRoles: domain.careerRoles || [],
      techStack: domain.techStack || {},
      skills: domain.skills || {},
      learningRoadmap: domain.learningRoadmap || [],
      projects: domain.projects || [],
      interviews: domain.interviews || [],
      industryApplications: domain.industryApplications || [],
      certifications: domain.certifications || [],
      industryTrends: domain.industryTrends || {},
      salaryIntelligence: domain.salaryIntelligence || {},
      academicNotes: domain.academicNotes || {},
      userProgress: {
        completedModules: completedNums.length,
        completedModuleNumbers: completedNums,
        percentage: Math.round((completedNums.length / (domain.modulesCount || 12)) * 100),
        bookmarkedTopics: bookmarks
      },
      source: 'local'
    };
  },

  /**
   * 3. Get specific module details with notes, code, and interactive elements
   */
  async getModuleDetails(domainSlug, moduleNumber) {
    const modNum = parseInt(moduleNumber, 10);
    try {
      const res = await apiClient.get(`/career/knowledge-hub/domains/${domainSlug}/modules/${modNum}`);
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn(`[domainKnowledgeService] Fallback to local data for module ${domainSlug}#${modNum}:`, err.message);
    }

    const domain = getKnowledgeDomainById(domainSlug);
    if (!domain) return null;
    const modData = getKnowledgeModule(domain.id, modNum);
    if (!modData) return null;

    const localProg = getLocalProgress();
    const isCompleted = Boolean(localProg[domain.id]?.[modNum]?.isCompleted);
    const quizScore = localProg[domain.id]?.[modNum]?.quizScore || 0;
    const bookmarks = getLocalBookmarks()
      .filter((b) => b.domainId === domain.id && b.moduleNumber === modNum)
      .map((b) => b.topicTitle);

    return {
      domainId: domain.id,
      domainName: domain.name,
      domainFamily: domain.family,
      moduleNumber: modData.moduleNumber,
      title: modData.title,
      subtitle: modData.subtitle,
      estimatedMinutes: modData.estimatedMinutes,
      sections: modData.sections || [],
      toolsComparison: modData.toolsComparison || [],
      codeSnippet: modData.codeSnippet || null,
      projects: modData.projects || null,
      certifications: modData.certifications || [],
      interviews: modData.interviews || [],
      assessments: modData.assessments || [],
      roadmapStages: modData.roadmapStages || [],
      curatedResources: modData.curatedResources || [],
      userState: {
        isCompleted,
        quizScore,
        bookmarks
      },
      navigation: {
        prevModule: modNum > 1 ? modNum - 1 : null,
        nextModule: modNum < domain.modulesCount ? modNum + 1 : null,
        totalModules: domain.modulesCount
      },
      source: 'local'
    };
  },

  /**
   * 4. Get complete syllabus for offline study or PDF compilation
   */
  async getFullSyllabus(domainSlug) {
    try {
      const res = await apiClient.get(`/career/knowledge-hub/domains/${domainSlug}/full-syllabus`);
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn(`[domainKnowledgeService] Fallback to local syllabus for ${domainSlug}:`, err.message);
    }

    const domain = getKnowledgeDomainById(domainSlug);
    if (!domain) return null;
    return {
      id: domain.id,
      name: domain.name,
      family: domain.family,
      icon: domain.icon,
      shortDescription: domain.shortDescription,
      overview: domain.overview,
      technologies: domain.technologies,
      careerProgression: domain.careerProgression,
      totalModules: domain.modules?.length || 12,
      modules: domain.modules || [],
      introduction: domain.introduction,
      subdomains: domain.subdomains || [],
      careerRoles: domain.careerRoles || [],
      techStack: domain.techStack || {},
      skills: domain.skills || {},
      learningRoadmap: domain.learningRoadmap || [],
      projects: domain.projects || [],
      interviews: domain.interviews || [],
      industryApplications: domain.industryApplications || [],
      certifications: domain.certifications || [],
      industryTrends: domain.industryTrends || {},
      salaryIntelligence: domain.salaryIntelligence || {},
      academicNotes: domain.academicNotes || {},
      source: 'local'
    };
  },

  /**
   * 5. Save student module progress
   */
  async saveProgress(domainId, moduleNumber, isCompleted, quizScore = 0, lastReadTopic = null) {
    const modNum = parseInt(moduleNumber, 10);

    // Save to local storage immediately
    const localProg = getLocalProgress();
    if (!localProg[domainId]) localProg[domainId] = {};
    localProg[domainId][modNum] = {
      isCompleted: Boolean(isCompleted),
      quizScore: Math.max(localProg[domainId][modNum]?.quizScore || 0, quizScore),
      lastReadTopic: lastReadTopic || localProg[domainId][modNum]?.lastReadTopic,
      updatedAt: new Date().toISOString()
    };
    setLocalProgress(localProg);

    // Sync with backend API
    try {
      const res = await apiClient.post('/career/knowledge-hub/progress', {
        domainId,
        moduleNumber: modNum,
        isCompleted,
        quizScore,
        lastReadTopic
      });
      if (res.data?.success) return res.data.data;
    } catch (err) {
      console.warn('[domainKnowledgeService] Progress synced to local state only:', err.message);
    }

    return {
      domainId,
      moduleNumber: modNum,
      isCompleted: Boolean(isCompleted),
      quizScore
    };
  },

  /**
   * 6. Toggle topic bookmark
   */
  async toggleBookmark(domainId, moduleNumber, topicTitle) {
    const modNum = parseInt(moduleNumber, 10);
    const bookmarks = getLocalBookmarks();
    const existingIndex = bookmarks.findIndex(
      (b) => b.domainId === domainId && b.moduleNumber === modNum && b.topicTitle === topicTitle
    );

    let isBookmarked = false;
    if (existingIndex > -1) {
      bookmarks.splice(existingIndex, 1);
      isBookmarked = false;
    } else {
      bookmarks.push({ domainId, moduleNumber: modNum, topicTitle, createdAt: new Date().toISOString() });
      isBookmarked = true;
    }
    setLocalBookmarks(bookmarks);

    try {
      const res = await apiClient.post('/career/knowledge-hub/bookmarks', {
        domainId,
        moduleNumber: modNum,
        topicTitle
      });
      if (res.data?.success) return res.data.data.isBookmarked;
    } catch (e) {}

    return isBookmarked;
  },

  /**
   * 7. Get student bookmarks
   */
  async getBookmarks() {
    try {
      const res = await apiClient.get('/career/knowledge-hub/bookmarks');
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
    } catch (e) {}
    return {
      totalBookmarks: getLocalBookmarks().length,
      bookmarks: getLocalBookmarks()
    };
  },

  /**
   * 8. Complete IT Domains Handbook Metadata
   */
  async getHandbook() {
    try {
      const res = await apiClient.get('/career/knowledge-hub/handbook');
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
    } catch (e) {}

    const domains = getAllKnowledgeDomains();
    return {
      title: 'CampusCorp Complete IT Career Domains Handbook 2026',
      subtitle: 'Comprehensive 38-Domain Technical Reference Manual & Academic Syllabus',
      edition: '2026 Official University & Placement Edition',
      domainsCount: domains.length,
      totalModules: domains.length * 12,
      domainsSummary: domains.map((d) => ({
        id: d.id,
        name: d.name,
        family: d.family,
        modulesCount: 12,
        technologies: d.technologies
      }))
    };
  },

  /**
   * 9. Print / Academic PDF Generation
   * Opens high-fidelity university publication view ready for browser "Save to PDF" or print
   */
  exportPrintableDocument({ domain, moduleData = null, isHandbook = false, allDomains = [] }) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate the academic study document.');
      return;
    }

    const title = isHandbook
      ? 'CampusCorp Complete IT Domains Handbook 2026'
      : moduleData
      ? `${domain.name} - Module ${moduleData.moduleNumber}: ${moduleData.title}`
      : `${domain.name} - Complete Domain Study Notes (All 12 Modules)`;

    let bodyHtml = '';

    if (isHandbook) {
      bodyHtml = `
        <div class="cover-page">
          <div class="logo">CAMPUSCORP INSTITUTIONAL KNOWLEDGE REPOSITORY</div>
          <h1 class="main-title">Complete IT Career Domains Handbook</h1>
          <p class="subtitle">Comprehensive 38-Domain Technical Syllabus & Placement Framework</p>
          <div class="meta-box">
            <p><strong>Published By:</strong> CampusCorp Academic & Placement Enablement Board</p>
            <p><strong>Academic Year:</strong> 2026 Edition (Master Framework)</p>
            <p><strong>Total Domains:</strong> 38 Specialized Tracks • 456 Learning Modules</p>
          </div>
        </div>

        <div class="page-break"></div>
        <h2 class="section-title">Directory of 38 IT Career Domains</h2>
        <div class="handbook-grid">
          ${allDomains.map((d, i) => `
            <div class="handbook-card">
              <h3>${i + 1}. ${d.name}</h3>
              <p class="family">${d.family}</p>
              <p class="desc">${d.shortDescription}</p>
              <p class="tech"><strong>Core Stack:</strong> ${d.technologies.slice(0, 5).join(', ')}</p>
              <p class="prog"><strong>Progression:</strong> ${d.careerProgression}</p>
            </div>
          `).join('')}
        </div>
      `;
    } else if (moduleData) {
      // Single module print
      bodyHtml = `
        <div class="header-bar">
          <div>
            <span class="badge">Module ${moduleData.moduleNumber} of 12</span>
            <span class="badge secondary">${domain.family}</span>
          </div>
          <span class="institution">CampusCorp Technical Education Series 2026</span>
        </div>

        <h1 class="module-title">${domain.name}</h1>
        <h2 class="module-subtitle">${moduleData.title}</h2>
        <p class="module-desc">${moduleData.subtitle || ''}</p>
        <hr class="divider"/>

        ${(moduleData.sections || []).map((sec) => `
          <div class="content-section">
            <h3>${sec.heading}</h3>
            <div class="text-content">${sec.content.replace(/\n\n/g, '<br/><br/>').replace(/\n- /g, '<br/>• ')}</div>
          </div>
        `).join('')}

        ${moduleData.codeSnippet ? `
          <div class="code-box">
            <div class="code-header">
              <span>Executable Implementation Lab (${moduleData.codeSnippet.language.toUpperCase()})</span>
            </div>
            <pre><code>${escapeHtml(moduleData.codeSnippet.code)}</code></pre>
            <p class="code-explanation"><strong>Technical Walkthrough:</strong> ${moduleData.codeSnippet.explanation}</p>
          </div>
        ` : ''}

        ${moduleData.toolsComparison && moduleData.toolsComparison.length > 0 ? `
          <h3 class="subsection-title">Comparative Technology Evaluation Matrix</h3>
          <table class="academic-table">
            <thead>
              <tr>
                <th>Evaluation Criteria</th>
                <th>Standard Framework (Tool A)</th>
                <th>Alternative Tool (Tool B)</th>
                <th>CampusCorp Placement Recommendation</th>
              </tr>
            </thead>
            <tbody>
              ${moduleData.toolsComparison.map((t) => `
                <tr>
                  <td><strong>${t.criteria}</strong></td>
                  <td>${t.toolA}</td>
                  <td>${t.toolB}</td>
                  <td>${t.recommendation}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        ${moduleData.interviews && moduleData.interviews.length > 0 ? `
          <h3 class="subsection-title">Technical Interview Questions & Verified Model Answers</h3>
          ${moduleData.interviews.map((qa, i) => `
            <div class="interview-box">
              <p class="q"><span class="q-badge">${qa.level}</span> <strong>Q${i + 1}: ${qa.question}</strong></p>
              <p class="a"><strong>Model Answer:</strong> ${qa.answer.replace(/\n/g, '<br/>')}</p>
            </div>
          `).join('')}
        ` : ''}
      `;
    } else {
      // Full 14-Section Domain Academic Compendium & Notes
      const intro = domain.introduction || {};
      const subdomains = domain.subdomains || [];
      const roles = domain.careerRoles || domain.roles || [];
      const techStack = domain.techStack || domain.techStackCategories || {};
      const skills = domain.skills || domain.skillsRequired || {};
      const roadmap = domain.learningRoadmap || [];
      const projects = domain.projects || [];
      const interviewQuestions = domain.interviews || domain.interviewQuestions || [];
      const industryApps = domain.industryApplications || [];
      const certs = domain.certifications || [];
      const trends = domain.industryTrends || {};
      const salary = domain.salaryIntelligence || domain.salaryDemand || {};

      bodyHtml = `
        <div class="cover-page">
          <div class="logo">CAMPUSCORP TECHNICAL EDUCATION BOARD • CURRICULUM PUBLICATION</div>
          <h1 class="main-title">${domain.name}</h1>
          <p class="subtitle">Complete Technical Compendium, Academic Notes & Career Blueprint</p>
          <div class="meta-box">
            <p><strong>Career Family:</strong> ${domain.family}</p>
            <p><strong>Core Stack:</strong> ${(domain.technologies || []).join(', ')}</p>
            <p><strong>Curriculum Scope:</strong> 12 Rigorous Modules • 9 Practical Projects • 90 Interview Q&As</p>
            <p><strong>Placement Progression:</strong> ${domain.careerProgression || 'Associate -> Specialist -> Lead Architect'}</p>
            <p><strong>Salary Horizon:</strong> Entry: ${salary.entryLevel || '₹4.5 - 8.5 LPA'} • Mid: ${salary.midLevel || '₹10 - 20 LPA'} • Senior: ${salary.seniorLevel || '₹22 - 45+ LPA'}</p>
          </div>
        </div>

        <div class="page-break"></div>
        <h2 class="section-title">Table of Contents</h2>
        <ol class="toc-list" style="columns: 2; column-gap: 30px;">
          <li><strong>Part 1:</strong> Executive Domain Introduction</li>
          <li><strong>Part 2:</strong> Subdomains & Specialized Tracks</li>
          <li><strong>Part 3:</strong> Professional Career Roles & Profiles</li>
          <li><strong>Part 4:</strong> Enterprise Technology Stack Architecture</li>
          <li><strong>Part 5:</strong> Core Competencies & Skills Matrix</li>
          <li><strong>Part 6:</strong> 6-Stage Mastery Learning Roadmap</li>
          <li><strong>Part 7:</strong> 12 Structured Learning Modules</li>
          <li><strong>Part 8:</strong> Practical Industry Projects (9 Projects)</li>
          <li><strong>Part 9:</strong> Technical Interview Mastery (90 Questions)</li>
          <li><strong>Part 10:</strong> Enterprise Industry Applications</li>
          <li><strong>Part 11:</strong> Professional Certifications Roadmap</li>
          <li><strong>Part 12:</strong> Future Outlook, AI Impact & 5-Year Trends</li>
          <li><strong>Part 13:</strong> Salary & Market Demand Intelligence</li>
        </ol>

        <!-- Part 1: Domain Introduction -->
        <div class="page-break"></div>
        <h2 class="section-title">Part 1: Executive Domain Introduction</h2>
        <hr class="divider"/>
        <div class="content-section">
          <h3>Domain Definition & Overview</h3>
          <p class="text-content">${intro.definition || domain.description || ''}</p>
        </div>
        <div class="content-section">
          <h3>What Professionals in this Domain Actually Do</h3>
          <p class="text-content">${intro.whatItDoes || ''}</p>
        </div>
        <div class="content-section">
          <h3>Why This Domain Exists in Enterprise IT</h3>
          <p class="text-content">${intro.whyItExists || ''}</p>
        </div>
        <div class="content-section">
          <h3>Real-World Industry Applications</h3>
          <p class="text-content">${intro.realWorldUse || ''}</p>
        </div>
        <div class="content-section">
          <h3>Importance & Future Opportunities</h3>
          <p class="text-content"><strong>Current Relevance:</strong> ${intro.currentRelevance || ''}</p>
          <p class="text-content"><strong>Strategic IT Value:</strong> ${intro.importanceInIT || ''}</p>
          <p class="text-content"><strong>Future Horizon:</strong> ${intro.futureOpportunities || ''}</p>
        </div>

        <!-- Part 2: Subdomains -->
        ${subdomains.length > 0 ? `
          <div class="page-break"></div>
          <h2 class="section-title">Part 2: Subdomains & Specialization Tracks</h2>
          <hr class="divider"/>
          ${subdomains.map((sd, i) => `
            <div class="content-section" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 14px;">
              <h3 style="margin-top: 0; color: #6d28d9;">${i + 1}. ${sd.name}</h3>
              <p class="text-content">${sd.description}</p>
              <p style="font-size: 9pt; margin: 6px 0 0 0;"><strong>Core Stack:</strong> ${(sd.tools || []).join(', ')}</p>
              <p style="font-size: 9pt; margin: 4px 0 0 0;"><strong>Primary Target Roles:</strong> ${(sd.roles || []).join(', ')}</p>
            </div>
          `).join('')}
        ` : ''}

        <!-- Part 3: Career Roles -->
        ${roles.length > 0 ? `
          <div class="page-break"></div>
          <h2 class="section-title">Part 3: Professional Career Roles</h2>
          <hr class="divider"/>
          ${roles.map((r) => `
            <div class="content-section" style="border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 16px;">
              <h3 style="color: #0f172a; margin-bottom: 4px;">${r.title || r.name}</h3>
              <p style="font-size: 8.5pt; color: #64748b; margin-top: 0;">Typical Experience: ${r.experienceLevel || 'Entry to Mid'} • Salary: ${r.salaryRange || '₹6.5 - 18 LPA'}</p>
              <p class="text-content"><strong>Role Mission:</strong> ${r.whatItDoes || r.overview || ''}</p>
              <div style="font-size: 9pt; margin-top: 8px;">
                <p style="margin: 3px 0;"><strong>Daily Responsibilities:</strong> ${(Array.isArray(r.dailyResponsibilities) ? r.dailyResponsibilities.join(' • ') : r.dailyResponsibilities || '')}</p>
                <p style="margin: 3px 0;"><strong>Required Technical Skills:</strong> ${(Array.isArray(r.requiredSkills) ? r.requiredSkills.join(', ') : r.requiredSkills || '')}</p>
                <p style="margin: 3px 0;"><strong>Career Progression:</strong> ${r.careerProgression || ''}</p>
              </div>
            </div>
          `).join('')}
        ` : ''}

        <!-- Part 4: Technology Stack -->
        ${Object.keys(techStack).length > 0 ? `
          <div class="page-break"></div>
          <h2 class="section-title">Part 4: Enterprise Technology Stack Architecture</h2>
          <hr class="divider"/>
          <table class="academic-table">
            <thead>
              <tr>
                <th style="width: 25%;">Stack Layer</th>
                <th style="width: 40%;">Standard Industry Technologies</th>
                <th style="width: 35%;">Professional Purpose & Justification</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(techStack).map(([layer, items]) => `
                <tr>
                  <td><strong style="text-transform: capitalize;">${layer.replace(/([A-Z])/g, ' $1')}</strong></td>
                  <td>${Array.isArray(items) ? items.join(', ') : items}</td>
                  <td>Core industry standard layer ensuring reliability, throughput, and scalability.</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        <!-- Part 5: Skills Matrix -->
        ${Object.keys(skills).length > 0 ? `
          <div class="page-break"></div>
          <h2 class="section-title">Part 5: Core Competencies & Skills Required</h2>
          <hr class="divider"/>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            ${Object.entries(skills).map(([category, skillList]) => `
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
                <h4 style="margin: 0 0 6px 0; color: #1e1b4b; text-transform: capitalize;">${category.replace(/([A-Z])/g, ' $1')}</h4>
                <p style="font-size: 9pt; color: #334155; margin: 0;">${Array.isArray(skillList) ? skillList.join(', ') : skillList}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Part 6: Learning Roadmap -->
        ${roadmap.length > 0 ? `
          <div class="page-break"></div>
          <h2 class="section-title">Part 6: 6-Stage Mastery Learning Roadmap</h2>
          <hr class="divider"/>
          ${roadmap.map((stage) => `
            <div class="content-section" style="border-left: 3px solid #7c3aed; padding-left: 12px; margin-bottom: 14px;">
              <h4 style="margin: 0; color: #0f172a;">${stage.stage || stage.level}: ${stage.title}</h4>
              <p style="font-size: 8.5pt; color: #6d28d9; margin: 2px 0;">Duration: ${stage.duration || '4-6 Weeks'} • Focus: ${stage.focus || ''}</p>
              <p class="text-content" style="margin: 4px 0 0 0;"><strong>Key Topics:</strong> ${(stage.topics || []).join(' • ')}</p>
              <p class="text-content" style="margin: 4px 0 0 0;"><strong>Milestone Capstone:</strong> ${stage.milestone || ''}</p>
            </div>
          `).join('')}
        ` : ''}

        <!-- Part 7: Modules 1 - 12 -->
        ${domain.modules.map((m) => `
          <div class="page-break"></div>
          <div class="module-wrapper">
            <div class="header-bar">
              <span class="badge">Module ${m.moduleNumber} of 12</span>
              <span class="institution">${domain.name}</span>
            </div>
            <h2 class="chapter-title">Module ${m.moduleNumber}: ${m.title}</h2>
            <p class="chapter-subtitle">${m.subtitle || ''}</p>
            <hr class="divider"/>

            ${(m.sections || []).map((sec) => `
              <div class="content-section">
                <h3>${sec.heading}</h3>
                <div class="text-content">${sec.content.replace(/\n\n/g, '<br/><br/>').replace(/\n- /g, '<br/>• ')}</div>
              </div>
            `).join('')}

            ${m.codeSnippet ? `
              <div class="code-box">
                <div class="code-header">
                  <span>Executable Implementation Lab (${m.codeSnippet.language.toUpperCase()})</span>
                </div>
                <pre><code>${escapeHtml(m.codeSnippet.code)}</code></pre>
                <p class="code-explanation"><strong>Analysis:</strong> ${m.codeSnippet.explanation}</p>
              </div>
            ` : ''}

            ${m.toolsComparison && m.toolsComparison.length > 0 ? `
              <h4 class="subsection-title">Comparative Analysis Matrix</h4>
              <table class="academic-table">
                <thead>
                  <tr>
                    <th>Criteria</th>
                    <th>Tool A</th>
                    <th>Tool B</th>
                    <th>Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  ${m.toolsComparison.map((t) => `
                    <tr>
                      <td><strong>${t.criteria}</strong></td>
                      <td>${t.toolA}</td>
                      <td>${t.toolB}</td>
                      <td>${t.recommendation}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}

            ${m.interviews && m.interviews.length > 0 ? `
              <h4 class="subsection-title">High-Frequency Interview Questions</h4>
              ${m.interviews.map((qa, i) => `
                <div class="interview-box">
                  <p class="q"><span class="q-badge">${qa.level}</span> <strong>Q${i + 1}: ${qa.question}</strong></p>
                  <p class="a"><strong>Answer:</strong> ${qa.answer.replace(/\n/g, '<br/>')}</p>
                </div>
              `).join('')}
            ` : ''}

            ${m.assessments && m.assessments.length > 0 ? `
              <h4 class="subsection-title">Self-Assessment Review Questions</h4>
              ${m.assessments.map((a, i) => `
                <div class="quiz-box">
                  <p class="q"><strong>${i + 1}. ${a.question}</strong></p>
                  <ul class="quiz-options">
                    ${a.options.map((opt, optIdx) => `
                      <li class="${optIdx === a.correctIndex ? 'correct' : ''}">
                        ${String.fromCharCode(65 + optIdx)}) ${opt} ${optIdx === a.correctIndex ? '✓ (Correct)' : ''}
                      </li>
                    `).join('')}
                  </ul>
                  <p class="explanation"><em>Rationale: ${a.explanation}</em></p>
                </div>
              `).join('')}
            ` : ''}
          </div>
        `).join('')}

        <!-- Part 8: Practical Projects Portfolio -->
        ${projects.length > 0 ? `
          <div class="page-break"></div>
          <h2 class="section-title">Part 8: Practical Capstone Projects Portfolio</h2>
          <hr class="divider"/>
          ${projects.map((p, i) => `
            <div class="content-section" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 16px; background: #fafafa;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <h3 style="margin: 0; color: #0f172a;">Project ${i + 1}: ${p.title}</h3>
                <span class="badge ${p.level === 'Beginner' ? '' : p.level === 'Intermediate' ? 'secondary' : ''}">${p.level}</span>
              </div>
              <p class="text-content" style="margin: 4px 0;"><strong>Problem Statement:</strong> ${p.problemStatement}</p>
              <p class="text-content" style="margin: 4px 0;"><strong>Industry Use Case:</strong> ${p.industryUseCase}</p>
              <p class="text-content" style="margin: 4px 0;"><strong>Architecture:</strong> ${p.architectureOverview}</p>
              <p style="font-size: 8.5pt; color: #475569; margin: 4px 0;"><strong>Tech Stack:</strong> ${(p.techStack || []).join(', ')}</p>
              <div style="font-size: 8.5pt; margin-top: 6px;">
                <strong>Resume Description:</strong>
                <ul style="padding-left: 18px; margin: 4px 0;">
                  ${(p.resumeDescription || []).map((bullet) => `<li>${bullet}</li>`).join('')}
                </ul>
              </div>
            </div>
          `).join('')}
        ` : ''}

        <!-- Part 9: Technical Interview Preparation (90 Curated Questions) -->
        ${interviewQuestions.length > 0 ? `
          <div class="page-break"></div>
          <h2 class="section-title">Part 9: Curated Technical Interview Preparation</h2>
          <p class="chapter-subtitle">Verified Interview Questions & Model Technical Explanations</p>
          <hr class="divider"/>
          ${interviewQuestions.map((qa, i) => `
            <div class="interview-box">
              <p class="q"><span class="q-badge">${qa.level}</span> <strong>Q${i + 1}: ${qa.question}</strong></p>
              <p class="a"><strong>Model Answer:</strong> ${qa.answer.replace(/\n/g, '<br/>')}</p>
            </div>
          `).join('')}
        ` : ''}

        <!-- Part 10: Industry Applications -->
        ${industryApps.length > 0 ? `
          <div class="page-break"></div>
          <h2 class="section-title">Part 10: Enterprise Industry Applications</h2>
          <hr class="divider"/>
          <table class="academic-table">
            <thead>
              <tr>
                <th style="width: 25%;">Enterprise Sector</th>
                <th style="width: 75%;">Real-World Use Case & Architectural Value</th>
              </tr>
            </thead>
            <tbody>
              ${industryApps.map((app) => `
                <tr>
                  <td><strong>${app.sector}</strong></td>
                  <td>${app.useCase}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        <!-- Part 11: Certifications -->
        ${certs.length > 0 ? `
          <div class="page-break"></div>
          <h2 class="section-title">Part 11: Professional Industry Certifications</h2>
          <hr class="divider"/>
          <table class="academic-table">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Certification Title</th>
                <th>Issuing Authority</th>
                <th>Recommended Prerequisite</th>
              </tr>
            </thead>
            <tbody>
              ${certs.map((c) => `
                <tr>
                  <td><span class="badge">${c.tier}</span></td>
                  <td><strong>${c.title}</strong></td>
                  <td>${c.issuer}</td>
                  <td>${c.prerequisites || 'Foundational knowledge'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        <!-- Part 12 & 13: Trends, AI Impact & Salary Demand -->
        <div class="page-break"></div>
        <h2 class="section-title">Part 12 & 13: Industry Trends, AI Impact & Salary Demand</h2>
        <hr class="divider"/>
        <div class="content-section">
          <h3>Emerging Technologies & Breakthroughs</h3>
          <p class="text-content">${Array.isArray(trends.emergingTools) ? trends.emergingTools.join(', ') : trends.emergingTools || ''}</p>
        </div>
        <div class="content-section">
          <h3>Enterprise Adoption & Market Evolution</h3>
          <p class="text-content">${trends.enterpriseAdoption || ''}</p>
        </div>
        <div class="content-section">
          <h3>AI Disruption & Autonomous Impact</h3>
          <p class="text-content">${trends.aiTransformation || trends.aiImpact || ''}</p>
        </div>
        <div class="content-section">
          <h3>5-to-10 Year Strategic Outlook</h3>
          <p class="text-content">${trends.fiveToTenYearOutlook || trends.fiveYearOutlook || ''}</p>
        </div>
        <div class="content-section" style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin-top: 20px;">
          <h3 style="margin-top: 0; color: #0f172a;">Compensation Trajectory & Hot Market Skills</h3>
          <p><strong>Entry-Level Range (0-2 Yrs):</strong> ${salary.salaryBands?.fresher?.rangeLpa || salary.entryLevel || '₹4.5 - 8.5 LPA'}</p>
          <p><strong>Mid-Level Range (3-5 Yrs):</strong> ${salary.salaryBands?.midLevel?.rangeLpa || salary.midLevel || '₹10 - 20 LPA'}</p>
          <p><strong>Senior & Lead Range (6-10+ Yrs):</strong> ${salary.salaryBands?.senior?.rangeLpa || salary.seniorLevel || '₹22 - 45+ LPA'}</p>
          <p><strong>Global Context:</strong> US: ${salary.globalSalaryContext?.usMarket || '$115k-$175k'} • Europe: ${salary.globalSalaryContext?.europeanMarket || '€75k-€110k'} • Remote: ${salary.globalSalaryContext?.remoteGlobalTier || '$90k-$160k'}</p>
          <p><strong>High-Premium In-Demand Skills:</strong> ${(salary.highDemandSkills || salary.hotSkills || []).join(', ')}</p>
        </div>
      `;
    }

    const docHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: A4;
            margin: 20mm 15mm 20mm 15mm;
            @top-right { content: "CampusCorp Knowledge Hub"; font-size: 8pt; color: #64748b; font-family: Inter, sans-serif; }
            @bottom-center { content: "Page " counter(page); font-size: 9pt; font-family: Inter, sans-serif; color: #475569; }
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            line-height: 1.6;
            font-size: 10.5pt;
            margin: 0;
            padding: 24px;
            background: #ffffff;
          }
          .cover-page {
            min-height: 80vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 40px 20px;
            border: 2px solid #7c3aed;
            border-radius: 16px;
            margin-bottom: 40px;
          }
          .cover-page .logo {
            font-size: 11pt;
            letter-spacing: 2px;
            font-weight: 800;
            color: #7c3aed;
            margin-bottom: 24px;
          }
          .cover-page .main-title {
            font-size: 26pt;
            font-weight: 900;
            color: #0f172a;
            margin: 0 0 12px 0;
            line-height: 1.2;
          }
          .cover-page .subtitle {
            font-size: 13pt;
            color: #475569;
            margin: 0 0 32px 0;
            max-width: 600px;
          }
          .meta-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px 30px;
            text-align: left;
            font-size: 10pt;
            width: 80%;
            max-width: 500px;
          }
          .meta-box p { margin: 6px 0; }
          .page-break { page-break-after: always; }
          .header-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
            margin-bottom: 16px;
            font-size: 8.5pt;
          }
          .badge {
            display: inline-block;
            background: #ede9fe;
            color: #6d28d9;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 8pt;
            text-transform: uppercase;
          }
          .badge.secondary { background: #f1f5f9; color: #475569; margin-left: 6px; }
          .institution { color: #64748b; font-weight: 600; }
          .section-title, .chapter-title {
            color: #0f172a;
            font-size: 18pt;
            font-weight: 800;
            margin-top: 10px;
            margin-bottom: 4px;
          }
          .chapter-subtitle, .module-desc {
            color: #64748b;
            font-size: 11pt;
            margin: 0 0 16px 0;
          }
          .divider { border: 0; border-top: 1px solid #cbd5e1; margin: 16px 0 24px 0; }
          .content-section { margin-bottom: 22px; }
          .content-section h3 {
            font-size: 12pt;
            font-weight: 700;
            color: #1e1b4b;
            margin-bottom: 6px;
          }
          .text-content { color: #334155; font-size: 10pt; text-align: justify; }
          .code-box {
            background: #0f172a;
            color: #f8fafc;
            border-radius: 8px;
            padding: 14px;
            margin: 18px 0;
            font-family: 'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace;
            font-size: 8.5pt;
          }
          .code-header {
            color: #a78bfa;
            font-weight: 700;
            font-size: 8pt;
            margin-bottom: 8px;
            border-bottom: 1px solid #334155;
            padding-bottom: 4px;
          }
          pre { margin: 0; overflow-x: auto; white-space: pre-wrap; word-break: break-all; }
          .code-explanation {
            margin-top: 10px;
            padding-top: 8px;
            border-top: 1px solid #334155;
            color: #cbd5e1;
            font-family: Inter, sans-serif;
            font-size: 8.5pt;
          }
          .academic-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
            margin: 16px 0 24px 0;
          }
          .academic-table th, .academic-table td {
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
            text-align: left;
          }
          .academic-table th { background: #f8fafc; font-weight: 700; color: #1e293b; }
          .interview-box, .quiz-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-left: 3px solid #7c3aed;
            padding: 12px 14px;
            border-radius: 6px;
            margin-bottom: 12px;
            font-size: 9.5pt;
          }
          .q-badge {
            background: #7c3aed;
            color: white;
            padding: 1px 6px;
            border-radius: 3px;
            font-size: 7.5pt;
            font-weight: bold;
          }
          .interview-box .q, .quiz-box .q { margin: 0 0 6px 0; color: #0f172a; }
          .interview-box .a { margin: 0; color: #334155; }
          .quiz-options { list-style: none; padding-left: 10px; margin: 6px 0; font-size: 9pt; }
          .quiz-options li.correct { font-weight: bold; color: #059669; }
          .explanation { font-size: 8.5pt; color: #64748b; margin: 4px 0 0 0; }
          .handbook-grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 20px; }
          .handbook-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px 18px;
            background: #f8fafc;
          }
          .handbook-card h3 { margin: 0 0 4px 0; font-size: 11pt; color: #0f172a; }
          .handbook-card .family { font-size: 8.5pt; color: #7c3aed; font-weight: bold; margin: 0 0 6px 0; }
          .handbook-card .desc { font-size: 9pt; color: #475569; margin: 0 0 6px 0; }
          .handbook-card .tech, .handbook-card .prog { font-size: 8.5pt; margin: 2px 0; color: #334155; }
          .toc-list { font-size: 10.5pt; line-height: 2; color: #1e293b; }
          .print-toolbar {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #0f172a;
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 9pt;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 1000;
          }
          @media print {
            .print-toolbar { display: none !important; }
            body { padding: 0 !important; }
          }
        </style>
      </head>
      <body>
        <div class="print-toolbar" onclick="window.print()">
          <span>🖨️ Save as PDF / Print Document</span>
        </div>
        ${bodyHtml}
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(docHtml);
    printWindow.document.close();
  }
};

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default domainKnowledgeService;

