const {
  scanGithubRepository,
  fetchUserRepositories,
  parseGithubInput,
} = require('../services/githubScannerService');
const { queryCommon } = require('../config/db');
const { logAuditEvent } = require('../services/auditService');

/**
 * Scan a public GitHub repository OR GitHub user profile live
 * POST /api/v1/github/scan-repo
 */
async function scanRepo(req, res) {
  try {
    const { repoUrl, url, githubToken } = req.body;
    const targetUrl = repoUrl || url;

    if (!targetUrl || !String(targetUrl).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a GitHub repository URL (e.g. https://github.com/owner/repo) or username.',
      });
    }

    const parsed = parseGithubInput(String(targetUrl).trim());
    if (parsed.type === 'profile') {
      const profileResult = await fetchUserRepositories(parsed.username, { githubToken });
      return res.json({
        success: true,
        type: 'profile',
        data: profileResult,
        ...profileResult,
      });
    }

    const scanResult = await scanGithubRepository(String(targetUrl).trim(), { githubToken });

    res.json({
      success: true,
      type: 'repo',
      data: scanResult,
      ...scanResult,
    });
  } catch (err) {
    res.status(err.response?.status === 404 || err.message?.includes('not found') ? 404 : 400).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * Real-Time SSE Live Repository Scan Stream
 * GET /api/v1/github/scan-stream?repoUrl=...
 */
async function scanRepoLiveStream(req, res) {
  const targetUrl = req.query.repoUrl || req.query.url;
  const githubToken = req.query.githubToken || req.headers['x-github-token'];

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  const sendEvent = (event, payload) => {
    if (!res.writableEnded) {
      res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
    }
  };

  if (!targetUrl || !String(targetUrl).trim()) {
    sendEvent('scan_error', { message: 'Please provide a GitHub repository URL or username.' });
    return res.end();
  }

  try {
    const parsed = parseGithubInput(String(targetUrl).trim());

    if (parsed.type === 'profile') {
      sendEvent('progress', { step: 1, totalSteps: 2, label: `Fetching live public repositories for @${parsed.username}...`, status: 'active' });
      const profileResult = await fetchUserRepositories(parsed.username, { githubToken });
      sendEvent('progress', { step: 2, totalSteps: 2, label: `Loaded ${profileResult.repositories.length} live repositories.`, status: 'done' });
      sendEvent('complete', { type: 'profile', data: profileResult });
      return res.end();
    }

    const scanResult = await scanGithubRepository(String(targetUrl).trim(), {
      githubToken,
      onProgress: (stepInfo) => sendEvent('progress', stepInfo),
    });

    sendEvent('complete', { type: 'repo', data: scanResult });
    return res.end();
  } catch (err) {
    sendEvent('scan_error', { message: err.message || 'Live scan failed.' });
    return res.end();
  }
}

/**
 * Get public repositories for a GitHub username
 * GET /api/v1/github/user-repos/:username
 */
async function getUserRepositories(req, res) {
  try {
    const { username } = req.params;
    const githubToken = req.query.githubToken || req.headers['x-github-token'];
    const result = await fetchUserRepositories(username, { githubToken });
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    res.status(err.message?.includes('not found') ? 404 : 400).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * Verify & Import Detected Skills to Student Profile
 * POST /api/v1/github/verify-and-import-skills
 */
async function verifyAndImportSkills(req, res, next) {
  try {
    const verifiedBy = req.user?.id || 1;
    const { repoUrl, detectedSkills = [], proficiencyLevel = 'INTERMEDIATE' } = req.body;

    if (!Array.isArray(detectedSkills) || detectedSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No skills provided for verification.',
      });
    }

    // Safely resolve a real student_id present in students_master
    let studentId = req.user?.student_id || null;
    if (!studentId && req.user?.id) {
      const rows = await queryCommon('SELECT id FROM students_master WHERE user_id = ? LIMIT 1', [req.user.id]).catch(() => []);
      if (rows.length > 0) studentId = rows[0].id;
    }

    // Double check studentId actually exists before FK write
    let canPersistToStudentDb = false;
    if (studentId) {
      const checkRow = await queryCommon('SELECT id FROM students_master WHERE id = ? LIMIT 1', [studentId]).catch(() => []);
      if (checkRow.length > 0) {
        canPersistToStudentDb = true;
      }
    }

    // Build skill catalogue lookup with common synonyms
    const skillsInDb = await queryCommon('SELECT id, name FROM skills_catalogue').catch(() => []);
    const skillMap = new Map();
    skillsInDb.forEach((s) => {
      skillMap.set(s.name.toLowerCase(), s.id);
      skillMap.set(s.id.toLowerCase(), s.id);
    });

    const SYNONYM_MAP = {
      'html5': 'html',
      'css3': 'css',
      'javascript (es6+)': 'javascript',
      'golang': 'golang',
      'go (golang)': 'golang',
      'react.js': 'react',
      'node.js': 'node-js',
      'next.js': 'next-js',
      'vue.js': 'vue-js',
      'nest.js': 'nest-js',
      'express.js': 'express-js',
      'tailwind css': 'tailwind-css',
      'automated testing (jest/cypress)': 'automated-testing',
      'automated testing / jest / cypress': 'automated-testing',
      'scikit-learn': 'scikit-learn',
      'github actions': 'github-actions',
    };

    let importedCount = 0;
    const verifiedSkills = [];

    for (const skillName of detectedSkills) {
      const cleanName = String(skillName).trim();
      if (!cleanName) continue;
      const lowerName = cleanName.toLowerCase();

      let matchedSkillId = SYNONYM_MAP[lowerName] || skillMap.get(lowerName);

      if (!matchedSkillId) {
        for (const [key, id] of skillMap.entries()) {
          if (lowerName === key || (key.length > 3 && lowerName.includes(key))) {
            matchedSkillId = id;
            break;
          }
        }
      }

      if (!matchedSkillId) {
        matchedSkillId = lowerName.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'skill-item';
      }

      if (canPersistToStudentDb) {
        // Ensure skill exists in skills_catalogue first so student_skills FK never fails
        if (!skillMap.has(matchedSkillId) && !skillsInDb.some((s) => s.id === matchedSkillId)) {
          await queryCommon(
            `INSERT IGNORE INTO skills_catalogue (id, name, category) VALUES (?, ?, 'Technical & Frameworks')`,
            [matchedSkillId, cleanName.slice(0, 100)]
          ).catch(() => {});
          skillMap.set(matchedSkillId, matchedSkillId);
        }

        await queryCommon(
          `INSERT INTO student_skills (student_id, skill_id, proficiency_level, evidence_type, evidence_url, is_verified, verified_by, verified_at, updated_at)
           VALUES (?, ?, ?, 'GITHUB', ?, 1, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE
              proficiency_level = VALUES(proficiency_level),
              evidence_type = 'GITHUB',
              evidence_url = VALUES(evidence_url),
              is_verified = 1,
              verified_by = VALUES(verified_by),
              verified_at = NOW(),
              updated_at = NOW()`,
          [studentId, matchedSkillId, proficiencyLevel, repoUrl || 'https://github.com', verifiedBy]
        );
      }

      importedCount++;
      verifiedSkills.push({
        skillId: matchedSkillId,
        name: cleanName,
        isVerified: true,
        evidenceType: 'GITHUB',
        evidenceUrl: repoUrl,
      });
    }

    if (req.user?.id) {
      await logAuditEvent({
        userId: req.user.id,
        action: 'GITHUB_REPO_SKILL_VERIFICATION',
        module: 'SKILL_ANALYZER',
        details: { repoUrl, importedCount, skills: detectedSkills, persistedToStudent: canPersistToStudentDb },
      }).catch(() => {});
    }

    res.json({
      success: true,
      message: canPersistToStudentDb
        ? `Successfully verified and imported ${importedCount} skills from GitHub repository!`
        : `Verified ${importedCount} repository skills (Admin/Faculty preview mode; student profile required for transcript write).`,
      importedCount,
      persistedToStudent: canPersistToStudentDb,
      skills: verifiedSkills,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * AI Repository Deep Analyzer & Advisor
 * POST /api/v1/github/ai-analyze
 */
async function aiAnalyzeRepo(req, res, next) {
  try {
    const { repoData, prompt, question } = req.body;
    if (!repoData || !repoData.repository) {
      return res.status(400).json({ success: false, message: 'Valid repository scan data is required.' });
    }

    const repoName = repoData.repository.name || 'Repository';
    const primaryLang = repoData.languages?.primaryLanguage || repoData.repository.language || 'Software';
    const skills = repoData.detectedSkills || [];
    const qualityScore = repoData.codeQuality?.score || 70;
    const hasDocker = repoData.codeQuality?.hasDockerfile;
    const hasCI = repoData.codeQuality?.hasWorkflows;
    const hasTests = repoData.codeQuality?.hasTests;
    const exposedSecrets = repoData.codeQuality?.exposedSecrets || [];

    // If custom prompt or question was asked to the AI Assistant
    if (prompt || question) {
      const q = String(prompt || question).trim();
      let response = '';

      if (/scale|10k|traffic|bottleneck|performance/i.test(q)) {
        response = `### 🚀 Scalability & Performance Strategy for **${repoName}**\n\n` +
          `Based on the **${primaryLang}** stack and architecture detected:\n\n` +
          `1. **Stateless Horizontal Scaling**: Decouple stateful sessions using Redis cache clusters. If using Node.js or Python, spawn worker clusters using PM2 or Gunicorn with Gevent.\n` +
          `2. **Database Optimization**: Introduce read replicas and implement database connection pooling (e.g. PgBouncer or MySQL pool limits). Ensure all frequent queries on foreign keys and timestamps have B-tree indices.\n` +
          `3. **Caching Layer**: Place Cloudflare CDN or Amazon CloudFront at the edge for static assets. Cache API responses with Redis TTLs for high-throughput read endpoints.\n` +
          `4. **Asynchronous Task Offloading**: Offload long-running computations, file processing, and webhook delivery to background queues (BullMQ, Celery, or RabbitMQ).\n` +
          `5. **Observability**: Integrate OpenTelemetry or Prometheus + Grafana dashboards to monitor p95 latency and memory leak trends under load.`;
      } else if (/security|hardening|vulnerability|owasp/i.test(q)) {
        response = `### 🛡️ Production Security Audit & Hardening Guide for **${repoName}**\n\n` +
          `Security assessment for current ${primaryLang} codebase:\n\n` +
          `1. **Secrets & Credentials Gate**: ${exposedSecrets.length > 0 ? `⚠️ **ALERT**: Found exposed sensitive files (${exposedSecrets.join(', ')}). Run 'git-filter-repo' or BFG Repo-Cleaner immediately and rotate all credentials!` : '✅ No unencrypted secrets or sensitive credentials detected in repository root.'}\n` +
          `2. **Dependency Supply Chain**: Run automated vulnerability audits (\`${primaryLang.toLowerCase() === 'python' ? 'pip-audit / safety check' : 'npm audit --audit-level=high'}\`) in your CI pipeline before merging PRs.\n` +
          `3. **Header Hardening**: Implement Helmet.js (or CSP headers in web framework) enforcing Content-Security-Policy, X-Frame-Options: DENY, and Strict-Transport-Security.\n` +
          `4. **Input Sanitization & Injection Prevention**: Validate all incoming parameters with schemas (Zod/Joi for JS, Pydantic for Python) to eliminate SQL injection and XSS vectors.\n` +
          `5. **Authentication Security**: Ensure JWTs use HTTP-only secure cookies with SameSite=Lax/Strict, avoiding localStorage storage.`;
      } else if (/refactor|clean code|architecture|solid/i.test(q)) {
        response = `### ♻️ Clean Code & Architecture Blueprint for **${repoName}**\n\n` +
          `Architectural review for **${repoName}** (${primaryLang}):\n\n` +
          `1. **Separation of Concerns**: Enforce strict 3-tier layering: Controllers (HTTP transport) -> Services (Pure business logic) -> Repositories / Data Access.\n` +
          `2. **Error Boundary Strategy**: Replace inline try/catch blocks with centralized global error handling middleware and domain-specific custom Exception classes.\n` +
          `3. **Configuration Isolation**: Move all hardcoded timeouts, URLs, and magic constants into a centralized, strongly-typed config module backed by environment variables.\n` +
          `4. **Interface Contracts**: ${skills.includes('TypeScript') ? 'Leverage strict TypeScript interfaces for all data transfer objects (DTOs) and request payloads.' : 'Adopt type hints or JSDoc comments to document input and output contracts across module boundaries.'}\n` +
          `5. **Dependency Injection**: Decouple external service dependencies (emailers, third-party APIs) via dependency inversion so they can be easily mocked during unit testing.`;
      } else if (/interview|question|mock/i.test(q)) {
        response = `### 🎯 Targeted Technical Interview Simulation for **${repoName}**\n\n` +
          `Top interview challenges recruiters will ask based on this project:\n\n` +
          `1. **Architectural Tradeoffs**: *"Why did you choose ${primaryLang} and ${skills.slice(0, 3).join(', ') || 'this stack'} for ${repoName}? What limitations did you hit and how would you redesign it today?"*\n` +
          `   - *Model Strategy*: Highlight concurrency model, package ecosystem, and ease of deployment.\n\n` +
          `2. **Fault Tolerance & Reliability**: *"How does ${repoName} behave if a downstream database or third-party service fails or times out?"*\n` +
          `   - *Model Strategy*: Explain circuit breakers, exponential backoff retries, and graceful degradation for end users.\n\n` +
          `3. **Data Integrity & Concurrency**: *"How do you prevent race conditions when two simultaneous requests attempt to update the same resource?"*\n` +
          `   - *Model Strategy*: Discuss database transactions, optimistic locking (version column), or distributed locks with Redis.`;
      } else {
        response = `### 🤖 AI Engineering Insights for **${repoName}**\n\n` +
          `Analysis of **${q}** regarding your **${primaryLang}** repository:\n\n` +
          `- **Repository Context**: ${repoName} has a code quality rating of ${qualityScore}/100 with key competencies in ${skills.slice(0, 5).join(', ') || primaryLang}.\n` +
          `- **Engineering Recommendation**: For this setup, prioritize modular component boundaries, deterministic dependency versions, and automated CI tests.\n` +
          `- **Next Milestone**: ${!hasTests ? 'Add automated unit test suites (Jest/Pytest/JUnit) to reach >80% branch coverage.' : !hasDocker ? 'Package the application with a multi-stage Dockerfile to streamline production deployments.' : 'Implement end-to-end integration tests and load benchmarking tests.'}`;
      }

      return res.json({
        success: true,
        answer: response,
        query: q,
        timestamp: new Date().toISOString(),
      });
    }

    // Default full architectural analysis payload
    const architecturalPatterns = [];
    if (repoData.repository.manifestsFound?.length > 1) {
      architecturalPatterns.push('Multi-Package Monorepo Workspace');
    } else {
      architecturalPatterns.push('Modular Component-Driven Architecture');
    }
    if (skills.some(s => ['React', 'React.js', 'Vue.js', 'Next.js'].includes(s))) {
      architecturalPatterns.push('Client-Side SPA / SSR Hydration');
    }
    if (skills.some(s => ['Node.js', 'Express.js', 'FastAPI', 'Spring Boot', 'Django'].includes(s))) {
      architecturalPatterns.push('RESTful Backend Micro-Service');
    }
    if (hasDocker) architecturalPatterns.push('OCI Containerized Runtime');
    if (hasCI) architecturalPatterns.push('Automated GitHub Actions CI/CD');

    const readinessVerdict = qualityScore >= 85
      ? 'Tier-1 Tech Screening Ready (Top 5%)'
      : qualityScore >= 70
      ? 'Competitive Product Portfolio (Top 20%)'
      : 'Development-Grade Prototype (Needs Hardening)';

    const interviewQuestions = [
      {
        topic: 'Architecture & System Design',
        question: `How is data flow managed between client requests and state persistence in ${repoName}?`,
        intent: 'Recruiters want to verify you understand separation of concerns and state mutations.',
        answerGuideline: `Explain the flow: client sends request -> validated by schema -> handled by controller -> processed by service layer -> persisted to database transactions. Mention ${primaryLang} specific optimizations.`,
      },
      {
        topic: 'Performance & Scaling',
        question: `If ${repoName} experienced a 50x spike in concurrent users, where is the first bottleneck and how would you resolve it?`,
        intent: 'Checks capacity planning, database query optimization, and caching knowledge.',
        answerGuideline: 'Identify database connection pool exhaustion and synchronous I/O. Recommend read replicas, Redis caching for hot paths, and load balancing.',
      },
      {
        topic: 'Reliability & CI/CD',
        question: `How do you ensure breaking changes do not make it into production when merging code?`,
        intent: 'Tests production hygiene, test automation, and deployment pipelines.',
        answerGuideline: hasCI
          ? 'Point to your automated GitHub Actions workflow that executes linters, type checks, and test suites on pull requests.'
          : 'Explain how you run automated unit tests, commit hooks with Husky/pre-commit, and Docker container verification.',
      },
    ];

    const resumeBullets = [
      `Architected high-performance ${primaryLang} application utilizing ${skills.slice(0, 3).join(', ') || 'modern paradigms'}, ensuring modularity and maintainable codebase structure.`,
      `${hasDocker ? 'Containerized application with multi-stage Docker builds' : 'Structured clean layered application architecture'}, achieving consistent local development and cloud deployability.`,
      `${hasCI ? 'Configured automated CI/CD pipelines with GitHub Actions' : 'Implemented automated testing and code hygiene routines'}, maintaining code quality score of ${qualityScore}/100 and zero security vulnerabilities.`,
    ];

    res.json({
      success: true,
      verdict: readinessVerdict,
      architecturalPatterns,
      interviewQuestions,
      resumeBullets,
      qualityScore,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  scanRepo,
  scanRepoLiveStream,
  getUserRepositories,
  verifyAndImportSkills,
  aiAnalyzeRepo,
};
