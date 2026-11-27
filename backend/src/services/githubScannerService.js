const axios = require('axios');
const { getRepoArchitectureDiagram } = require('./gitDiagramService');

/**
 * Live GitHub Repository & Profile Scanner Service
 * Supports GitHub REST API v3, Live Web HTML/Atom Fallback (bypassing rate limits),
 * Monorepo Subdirectory Manifest Analysis, Live Commits/Contributors, Security Hygiene Audits,
 * and Real-Time Progress Callbacks for SSE Streaming.
 */

const GITHUB_API_BASE = 'https://api.github.com';

function buildHeaders(customToken) {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'CampusCorp-Live-Repo-Scanner/2.0',
  };
  const token = customToken || process.env.GITHUB_TOKEN;
  if (token && String(token).trim()) {
    headers.Authorization = `token ${String(token).trim()}`;
  }
  return headers;
}

const WEB_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

/**
 * Clean raw URL/string without breaking host path parsing
 */
function stripUrlNoise(rawUrl) {
  let cleaned = String(rawUrl || '').trim();
  // Strip query string and hash fragment
  cleaned = cleaned.split('?')[0].split('#')[0];
  // Handle SSH format: git@github.com:owner/repo.git
  cleaned = cleaned.replace(/^git@github\.com:/i, '');
  cleaned = cleaned.replace(/^https?:\/\//i, '');
  cleaned = cleaned.replace(/^www\./i, '');
  cleaned = cleaned.replace(/^github\.com\//i, '');
  cleaned = cleaned.replace(/^@/, '');
  cleaned = cleaned.replace(/\/+$/, '');
  cleaned = cleaned.replace(/\.git$/i, '');
  return cleaned;
}

/**
 * Parse repository owner and name from varied URL formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo?tab=readme-ov-file
 * - https://github.com/owner/repo/tree/main/client
 * - http://github.com/owner/repo/
 * - github.com/owner/repo
 * - git@github.com:owner/repo.git
 * - owner/repo
 */
function parseRepoUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('A valid GitHub repository URL or "owner/repo" path is required.');
  }

  const cleaned = stripUrlNoise(rawUrl);
  const parts = cleaned.split('/').filter(Boolean);

  if (parts.length < 2 || !parts[0] || !parts[1]) {
    throw new Error('Invalid GitHub repository format. Expected: https://github.com/owner/repo');
  }

  // Optional branch hint if user pasted /tree/branchName
  let branchHint = null;
  if (parts.length >= 4 && (parts[2] === 'tree' || parts[2] === 'blob')) {
    branchHint = parts[3];
  }

  return {
    owner: parts[0],
    repo: parts[1],
    fullName: `${parts[0]}/${parts[1]}`,
    branchHint,
  };
}

/**
 * Distinguish between a GitHub repository input vs a GitHub user/org profile input
 */
function parseGithubInput(rawInput) {
  if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
    throw new Error('Please enter a GitHub repository URL (owner/repo) or GitHub username.');
  }

  const cleaned = stripUrlNoise(rawInput);
  const parts = cleaned.split('/').filter(Boolean);

  if (parts.length === 1) {
    return {
      type: 'profile',
      username: parts[0],
    };
  }

  return {
    type: 'repo',
    ...parseRepoUrl(rawInput),
  };
}

/**
 * Language color mapping for visualization
 */
const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Go: '#00ADD8',
  Rust: '#dea584',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  Shell: '#89e051',
  Dockerfile: '#384d54',
  SQL: '#e38c00',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Dart: '#00B4AB',
  Jupyter: '#DA5B0B',
  'Jupyter Notebook': '#DA5B0B',
};

/**
 * Fetch live raw file via raw.githubusercontent.com (does not consume REST API rate limit)
 */
async function fetchRawFile(owner, repo, branch, filePath, customToken) {
  const cleanPath = String(filePath).replace(/^\/+/, '');
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${cleanPath}`;
  const headers = {};
  if (customToken) headers.Authorization = `token ${customToken}`;

  const res = await axios.get(rawUrl, {
    headers,
    timeout: 6000,
    transformResponse: [(data) => data], // Keep raw string so we can safely parse
  });
  return res.data;
}

/**
 * Decode XML entities from GitHub Atom feed
 */
function decodeXmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Parse live recent commits from GitHub's public Atom feed (NO REST API rate limit!)
 */
async function fetchCommitsAtomFallback(owner, repo, branch) {
  try {
    const res = await axios.get(`https://github.com/${owner}/${repo}/commits/${encodeURIComponent(branch)}.atom`, {
      headers: WEB_HEADERS,
      timeout: 6000,
    });
    const xml = typeof res.data === 'string' ? res.data : '';
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, 8);

    return entries.map((m) => {
      const block = m[1];
      const title = decodeXmlEntities(block.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] || '');
      const updated = block.match(/<updated>([^<]+)<\/updated>/)?.[1] || null;
      const authorName = decodeXmlEntities(block.match(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>/)?.[1] || owner);
      const href = block.match(/<link[^>]*href="([^"]+)"/)?.[1] || `https://github.com/${owner}/${repo}/commits`;
      const idText = block.match(/<id>([\s\S]*?)<\/id>/)?.[1] || '';
      const shaMatch = idText.match(/Commit\/([a-f0-9]+)/i) || href.match(/\/commit\/([a-f0-9]+)/i);
      const sha = shaMatch ? shaMatch[1] : '';
      const avatar = block.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1] || `https://github.com/${owner}.png`;

      return {
        sha: sha ? sha.slice(0, 7) : 'commit',
        fullSha: sha,
        message: title.split('\n')[0],
        author: authorName,
        authorLogin: authorName,
        authorAvatar: avatar,
        date: updated,
        url: href,
      };
    });
  } catch (e) {
    return [];
  }
}

/**
 * Fetch live repository metadata directly from GitHub Web HTML embeddedData (NO REST API rate limit!)
 */
async function fetchRepoFromWebHtml(owner, repo) {
  const url = `https://github.com/${owner}/${repo}`;
  let html = '';
  try {
    const res = await axios.get(url, {
      headers: WEB_HEADERS,
      timeout: 9000,
      maxRedirects: 5,
    });
    html = typeof res.data === 'string' ? res.data : '';
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error(`Repository "${owner}/${repo}" not found on GitHub (404). Verify spelling and public visibility.`);
    }
    throw err;
  }

  const embeddedMatch = html.match(/<script type="application\/json" data-target="react-app\.embeddedData">([\s\S]*?)<\/script>/);
  let payload = null;
  if (embeddedMatch) {
    try {
      payload = JSON.parse(embeddedMatch[1])?.payload || null;
    } catch (e) {}
  }

  const layoutRepo = payload?.codeViewLayoutRoute?.repo || {};
  const sidebarAbout = payload?.sidebarAbout || {};
  const treeItems = payload?.codeViewRepoRoute?.tree?.items || [];
  const refInfo = payload?.codeViewRepoRoute?.refInfo || payload?.codeViewLayoutRoute?.refInfo || {};

  const ogDesc = html.match(/property="og:description"[^>]*content="([^"]+)"/)?.[1] || '';
  const cleanOgDesc = decodeXmlEntities(ogDesc.replace(new RegExp(` - ${owner}/${repo}$`, 'i'), ''));

  const realOwner = layoutRepo.ownerLogin || sidebarAbout.ownerLogin || owner;
  const realRepo = layoutRepo.name || sidebarAbout.repoName || repo;
  const defaultBranch = layoutRepo.defaultBranch || refInfo.name || 'main';

  const treeFiles = treeItems.map((item) => ({
    path: item.path || item.name,
    name: item.name,
    type: item.contentType === 'directory' ? 'tree' : 'blob',
  }));

  return {
    repoData: {
      name: realRepo,
      full_name: `${realOwner}/${realRepo}`,
      description: sidebarAbout.description || cleanOgDesc || 'Public GitHub repository.',
      html_url: `https://github.com/${realOwner}/${realRepo}`,
      homepage: sidebarAbout.website || null,
      owner: {
        login: realOwner,
        avatar_url: layoutRepo.ownerAvatar || sidebarAbout.repo?.ownerAvatarUrl || `https://github.com/${realOwner}.png`,
        html_url: `https://github.com/${realOwner}`,
      },
      stargazers_count: Number(sidebarAbout.stargazerCount ?? 0),
      forks_count: Number(sidebarAbout.forksCount ?? 0),
      open_issues_count: 0,
      watchers_count: Number(sidebarAbout.watcherCount ?? sidebarAbout.stargazerCount ?? 0),
      default_branch: defaultBranch,
      license: sidebarAbout.repo?.license?.name ? { name: sidebarAbout.repo.license.name } : null,
      size: 0,
      created_at: layoutRepo.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pushed_at: new Date().toISOString(),
      topics: Array.isArray(sidebarAbout.topics) ? sidebarAbout.topics.map((t) => t.name || t) : [],
      headSha: refInfo.currentOid || null,
      isArchived: Boolean(layoutRepo.isArchived),
      isFork: Boolean(layoutRepo.isFork),
    },
    treeFiles,
  };
}

/**
 * Infer language breakdown from file extensions in the repository tree when languages API is unavailable
 */
function inferLanguagesFromTree(treeFiles) {
  const extToLang = {
    js: 'JavaScript',
    jsx: 'JavaScript',
    mjs: 'JavaScript',
    cjs: 'JavaScript',
    ts: 'TypeScript',
    tsx: 'TypeScript',
    py: 'Python',
    ipynb: 'Jupyter Notebook',
    java: 'Java',
    kt: 'Kotlin',
    html: 'HTML',
    htm: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    c: 'C',
    h: 'C',
    cpp: 'C++',
    cc: 'C++',
    hpp: 'C++',
    cs: 'C#',
    go: 'Go',
    rs: 'Rust',
    php: 'PHP',
    rb: 'Ruby',
    swift: 'Swift',
    sh: 'Shell',
    sql: 'SQL',
    vue: 'Vue',
    svelte: 'Svelte',
    dart: 'Dart',
  };

  const counts = {};
  treeFiles.forEach((f) => {
    if (f.type !== 'blob') return;
    const base = (f.path || f.name || '').toLowerCase();
    if (base === 'dockerfile' || base.endsWith('/dockerfile')) {
      counts.Dockerfile = (counts.Dockerfile || 0) + 1000;
      return;
    }
    const ext = base.split('.').pop();
    const lang = extToLang[ext];
    if (lang) {
      counts[lang] = (counts[lang] || 0) + (f.size || 1500);
    }
  });
  return counts;
}

/**
 * Analyze package.json dependencies object into detected skill labels
 */
function extractSkillsFromPackageJson(pkg, detectedSkillsSet) {
  if (!pkg || typeof pkg !== 'object') return false;
  let foundTests = false;
  const allDeps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
    ...(pkg.peerDependencies || {}),
  };
  const depKeys = Object.keys(allDeps).map((k) => k.toLowerCase());
  const scriptsStr = JSON.stringify(pkg.scripts || {}).toLowerCase();

  if (depKeys.some((d) => d === 'react' || d.startsWith('react-'))) detectedSkillsSet.add('React.js');
  if (depKeys.some((d) => d === 'next' || d.startsWith('@next/'))) detectedSkillsSet.add('Next.js');
  if (depKeys.some((d) => d === 'vue' || d.startsWith('@vue/'))) detectedSkillsSet.add('Vue.js');
  if (depKeys.some((d) => d.startsWith('@angular/'))) detectedSkillsSet.add('Angular');
  if (depKeys.some((d) => d === 'svelte' || d.startsWith('@sveltejs/'))) detectedSkillsSet.add('Svelte');
  if (depKeys.some((d) => d === 'vite' || d.startsWith('@vitejs/'))) detectedSkillsSet.add('Vite');
  if (depKeys.some((d) => d === 'express')) detectedSkillsSet.add('Express.js');
  if (depKeys.some((d) => d.startsWith('@nestjs/'))) detectedSkillsSet.add('Nest.js');
  if (depKeys.some((d) => d === 'fastify' || d === 'hono')) detectedSkillsSet.add('REST APIs');
  if (depKeys.some((d) => d === 'typescript' || d.startsWith('@types/'))) detectedSkillsSet.add('TypeScript');
  if (depKeys.some((d) => d.includes('tailwind'))) detectedSkillsSet.add('Tailwind CSS');
  if (depKeys.some((d) => d.includes('redux') || d === 'zustand' || d === 'recoil')) detectedSkillsSet.add('Redux');
  if (depKeys.some((d) => d === 'prisma' || d === '@prisma/client' || d === 'typeorm' || d === 'sequelize' || d === 'drizzle-orm')) {
    detectedSkillsSet.add('SQL');
  }
  if (depKeys.some((d) => d === 'mongoose' || d === 'mongodb')) detectedSkillsSet.add('MongoDB');
  if (depKeys.some((d) => d === 'pg' || d.includes('postgres'))) detectedSkillsSet.add('PostgreSQL');
  if (depKeys.some((d) => d === 'mysql' || d === 'mysql2')) detectedSkillsSet.add('MySQL');
  if (depKeys.some((d) => d === 'redis' || d === 'ioredis')) detectedSkillsSet.add('Redis');
  if (depKeys.some((d) => d.includes('socket.io') || d === 'ws')) detectedSkillsSet.add('WebSockets');
  if (depKeys.some((d) => d.includes('graphql') || d.includes('apollo'))) detectedSkillsSet.add('GraphQL');
  if (depKeys.some((d) => d === 'jsonwebtoken' || d === 'passport' || d === 'bcryptjs')) detectedSkillsSet.add('REST APIs');
  if (depKeys.some((d) => d === 'axios')) detectedSkillsSet.add('REST APIs');
  if (depKeys.some((d) => d === 'langchain' || d.startsWith('@langchain/') || d === 'openai' || d === '@google/generative-ai')) {
    detectedSkillsSet.add('Generative AI & LLMs');
  }

  if (
    depKeys.some((d) => d.includes('jest') || d.includes('vitest') || d.includes('cypress') || d.includes('playwright') || d.includes('mocha')) ||
    scriptsStr.includes('jest') ||
    scriptsStr.includes('vitest')
  ) {
    detectedSkillsSet.add('Automated Testing / Jest / Cypress');
    foundTests = true;
  }

  return foundTests;
}

/**
 * Analyze Python requirements.txt / pyproject.toml text
 */
function extractSkillsFromPythonManifest(content, detectedSkillsSet) {
  if (!content || typeof content !== 'string') return false;
  let foundTests = false;
  const lower = content.toLowerCase();

  if (lower.includes('django')) detectedSkillsSet.add('Django');
  if (lower.includes('flask')) detectedSkillsSet.add('Flask');
  if (lower.includes('fastapi')) detectedSkillsSet.add('FastAPI');
  if (lower.includes('uvicorn') || lower.includes('pydantic')) detectedSkillsSet.add('REST APIs');
  if (lower.includes('pandas')) detectedSkillsSet.add('Pandas');
  if (lower.includes('numpy')) detectedSkillsSet.add('NumPy');
  if (lower.includes('torch') || lower.includes('pytorch')) detectedSkillsSet.add('PyTorch');
  if (lower.includes('tensorflow') || lower.includes('keras')) detectedSkillsSet.add('TensorFlow');
  if (lower.includes('scikit-learn') || lower.includes('sklearn')) detectedSkillsSet.add('Scikit-learn');
  if (lower.includes('langchain') || lower.includes('openai') || lower.includes('anthropic') || lower.includes('transformers')) {
    detectedSkillsSet.add('Machine Learning');
  }
  if (lower.includes('sqlalchemy') || lower.includes('psycopg')) detectedSkillsSet.add('PostgreSQL');
  if (lower.includes('pymongo')) detectedSkillsSet.add('MongoDB');
  if (lower.includes('redis') || lower.includes('celery')) detectedSkillsSet.add('Redis');
  if (lower.includes('pytest')) {
    detectedSkillsSet.add('PyTest');
    foundTests = true;
  }
  return foundTests;
}

/**
 * Fetch live public repositories for a GitHub username / organization
 * Supports REST API primary + Web HTML fallback
 */
async function fetchUserRepositories(username, options = {}) {
  const cleanUser = String(username || '').trim().replace(/^@/, '');
  if (!cleanUser) {
    throw new Error('GitHub username is required.');
  }

  const headers = buildHeaders(options.githubToken);
  let profile = null;
  let repos = [];
  let source = 'GitHub REST API Live';

  try {
    const [userRes, reposRes] = await Promise.all([
      axios.get(`${GITHUB_API_BASE}/users/${encodeURIComponent(cleanUser)}`, { headers, timeout: 7000 }),
      axios.get(`${GITHUB_API_BASE}/users/${encodeURIComponent(cleanUser)}/repos?sort=pushed&per_page=15`, { headers, timeout: 8000 }),
    ]);

    const u = userRes.data;
    profile = {
      login: u.login,
      name: u.name || u.login,
      avatarUrl: u.avatar_url,
      htmlUrl: u.html_url,
      bio: u.bio || '',
      publicRepos: u.public_repos,
      followers: u.followers,
      following: u.following,
      company: u.company,
      location: u.location,
    };

    repos = (Array.isArray(reposRes.data) ? reposRes.data : []).map((r) => ({
      name: r.name,
      fullName: r.full_name,
      description: r.description || '',
      htmlUrl: r.html_url,
      language: r.language || 'Unknown',
      stars: r.stargazers_count || 0,
      forks: r.forks_count || 0,
      updatedAt: r.pushed_at || r.updated_at,
      isFork: Boolean(r.fork),
    }));
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error(`GitHub user or organization "${cleanUser}" not found.`);
    }

    // Live Web Fallback when API rate limited (works on BOTH personal profiles & org pages)
    source = 'GitHub Web Live Extractor (Rate-Limit Bypass)';
    const webRes = await axios.get(`https://github.com/${encodeURIComponent(cleanUser)}?tab=repositories`, {
      headers: WEB_HEADERS,
      timeout: 8000,
    }).catch((webErr) => {
      if (webErr.response?.status === 404) {
        throw new Error(`GitHub user "${cleanUser}" not found.`);
      }
      throw webErr;
    });

    const html = typeof webRes.data === 'string' ? webRes.data : '';
    const anchors = [...html.matchAll(/<a\b([^>]*itemprop="name codeRepository"[^>]*)>/gi)];
    const seen = new Set();

    anchors.forEach((m) => {
      const attrs = m[1];
      const hrefMatch = attrs.match(/href="\/([^"\/]+\/[^"\/?]+)"/i);
      if (!hrefMatch) return;
      const fullName = hrefMatch[1];
      if (!seen.has(fullName)) {
        seen.add(fullName);
        const [, name] = fullName.split('/');

        // Look ahead ~1600 chars in HTML to pull language & description if visible
        const snippet = html.slice(m.index, m.index + 1600);
        const langMatch = snippet.match(/itemprop="programmingLanguage"[^>]*>([^<]+)<\/span>/i);
        const descMatch = snippet.match(/itemprop="description"[^>]*>([\s\S]*?)<\/p>/i);

        repos.push({
          name,
          fullName,
          description: descMatch ? decodeXmlEntities(descMatch[1].replace(/<[^>]+>/g, '')) : 'Public GitHub repository ready for live analysis.',
          htmlUrl: `https://github.com/${fullName}`,
          language: langMatch ? decodeXmlEntities(langMatch[1]) : 'Code',
          stars: 0,
          forks: 0,
          updatedAt: new Date().toISOString(),
          isFork: false,
        });
      }
    });

    const ogImg = decodeXmlEntities(html.match(/property="og:image"[^>]*content="([^"]+)"/i)?.[1] || '');
    const ogTitle = decodeXmlEntities(html.match(/property="og:title"[^>]*content="([^"]+)"/i)?.[1] || '');
    const ogDesc = decodeXmlEntities(html.match(/property="og:description"[^>]*content="([^"]+)"/i)?.[1] || '');

    profile = {
      login: cleanUser,
      name: ogTitle ? ogTitle.split('·')[0].replace(new RegExp(`\\s*-\\s*Repositories.*`, 'i'), '').trim() : cleanUser,
      avatarUrl: ogImg || `https://github.com/${cleanUser}.png`,
      htmlUrl: `https://github.com/${cleanUser}`,
      bio: ogDesc || 'Live GitHub Developer Portfolio',
      publicRepos: repos.length,
    };
  }

  return {
    success: true,
    type: 'profile',
    profile,
    repositories: repos,
    source,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Scan GitHub Repository Live
 * @param {string} rawUrl - GitHub repo URL or owner/repo
 * @param {object} options - { onProgress, githubToken }
 */
async function scanGithubRepository(rawUrl, options = {}) {
  const startTime = Date.now();
  const emitProgress = typeof options.onProgress === 'function' ? options.onProgress : () => {};

  emitProgress({ step: 1, totalSteps: 6, label: 'Resolving GitHub repository & validating URL...', status: 'active' });
  const { owner, repo, fullName, branchHint } = parseRepoUrl(rawUrl);
  const headers = buildHeaders(options.githubToken);

  let repoData = null;
  let languagesData = {};
  let treeFiles = [];
  let recentCommits = [];
  let contributors = [];
  let branchesCount = 1;
  let sourceMode = 'GitHub REST API Live';
  let rateLimitInfo = null;
  let usedWebFallback = false;

  // ── PHASE 1: Live Metadata Resolution ──
  try {
    const repoRes = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers,
      timeout: 8000,
    });
    repoData = repoRes.data;
    if (repoRes.headers) {
      rateLimitInfo = {
        remaining: Number(repoRes.headers['x-ratelimit-remaining']),
        limit: Number(repoRes.headers['x-ratelimit-limit']),
      };
    }
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error(`Repository "${fullName}" not found. Please ensure the repository is public and spelled correctly.`);
    }
    if (err.response?.status === 401) {
      throw new Error('Provided GitHub access token is invalid or expired.');
    }
    // If rate limited (403/429) or transient REST failure, immediately use GitHub Live Web Extractor!
    if (err.response?.status === 403 || err.response?.status === 429 || err.code === 'ECONNABORTED') {
      usedWebFallback = true;
      sourceMode = 'GitHub Web Live Extractor (API Rate-Limit Bypass)';
    } else {
      throw new Error(`GitHub connection failed: ${err.response?.data?.message || err.message}`);
    }
  }

  // Canonical owner/repo in case GitHub redirected (e.g. facebook/react -> react/react or vice versa)
  const resolvedOwner = repoData?.owner?.login || owner;
  const resolvedRepo = repoData?.name || repo;
  let defaultBranch = branchHint || repoData?.default_branch || 'main';

  emitProgress({ step: 2, totalSteps: 6, label: `Fetching live telemetry & tree for ${resolvedOwner}/${resolvedRepo}...`, status: 'active' });

  // ── PHASE 2: Fetch Languages, Recursive Tree, Live Commits & Contributors ──
  if (usedWebFallback || !repoData) {
    const webData = await fetchRepoFromWebHtml(owner, repo);
    repoData = webData.repoData;
    treeFiles = webData.treeFiles;
    defaultBranch = branchHint || repoData.default_branch || 'main';

    // Also pull live commits via Atom XML feed
    recentCommits = await fetchCommitsAtomFallback(repoData.owner.login, repoData.name, defaultBranch);
    if (recentCommits[0]?.date) {
      repoData.pushed_at = recentCommits[0].date;
    }

    // Try languages API just in case, or infer from subdirectories + tree extensions
    try {
      const langRes = await axios.get(`${GITHUB_API_BASE}/repos/${repoData.owner.login}/${repoData.name}/languages`, { headers, timeout: 4000 });
      languagesData = langRes.data || {};
    } catch (e) {
      // Inspect up to 2 source directories on GitHub web HTML to get real file extensions without API limits
      const rootDirs = treeFiles.filter((f) => f.type === 'tree').map((f) => f.name || f.path);
      const targetSubdirs = rootDirs.filter((d) => ['src', 'app', 'client', 'server', 'frontend', 'backend', repoData.name.toLowerCase(), 'packages', 'tests'].includes(d.toLowerCase())).slice(0, 2);
      if (targetSubdirs.length > 0) {
        const subResults = await Promise.allSettled(
          targetSubdirs.map(async (dir) => {
            const subRes = await axios.get(`https://github.com/${repoData.owner.login}/${repoData.name}/tree/${encodeURIComponent(defaultBranch)}/${encodeURIComponent(dir)}`, {
              headers: WEB_HEADERS,
              timeout: 5000,
            });
            const m = String(subRes.data || '').match(/<script type="application\/json" data-target="react-app\.embeddedData">([\s\S]*?)<\/script>/);
            if (!m) return [];
            const subItems = JSON.parse(m[1])?.payload?.codeViewRepoRoute?.tree?.items || [];
            return subItems.map((it) => ({ path: `${dir}/${it.name}`, name: it.name, type: it.contentType === 'directory' ? 'tree' : 'blob' }));
          })
        );
        subResults.forEach((sr) => {
          if (sr.status === 'fulfilled' && Array.isArray(sr.value)) {
            treeFiles = treeFiles.concat(sr.value);
          }
        });
      }
      languagesData = inferLanguagesFromTree(treeFiles);
    }
  } else {
    // Run parallel live REST API calls cleanly
    const [langRes, treeRes, commitsRes, contribRes, branchRes] = await Promise.allSettled([
      axios.get(`${GITHUB_API_BASE}/repos/${resolvedOwner}/${resolvedRepo}/languages`, { headers, timeout: 6000 }),
      axios.get(`${GITHUB_API_BASE}/repos/${resolvedOwner}/${resolvedRepo}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`, { headers, timeout: 8000 }),
      axios.get(`${GITHUB_API_BASE}/repos/${resolvedOwner}/${resolvedRepo}/commits?sha=${encodeURIComponent(defaultBranch)}&per_page=8`, { headers, timeout: 6000 }),
      axios.get(`${GITHUB_API_BASE}/repos/${resolvedOwner}/${resolvedRepo}/contributors?per_page=6`, { headers, timeout: 6000 }),
      axios.get(`${GITHUB_API_BASE}/repos/${resolvedOwner}/${resolvedRepo}/branches?per_page=10`, { headers, timeout: 5000 }),
    ]);

    if (langRes.status === 'fulfilled') {
      languagesData = langRes.value.data || {};
    }

    if (treeRes.status === 'fulfilled' && Array.isArray(treeRes.value.data?.tree)) {
      treeFiles = treeRes.value.data.tree;
    } else {
      // Fallback to root contents API or Web HTML tree
      try {
        const contentsRes = await axios.get(`${GITHUB_API_BASE}/repos/${resolvedOwner}/${resolvedRepo}/contents?ref=${encodeURIComponent(defaultBranch)}`, { headers, timeout: 5000 });
        if (Array.isArray(contentsRes.data)) {
          treeFiles = contentsRes.data.map((f) => ({ path: f.path || f.name, name: f.name, type: f.type === 'dir' ? 'tree' : 'blob', size: f.size }));
        }
      } catch (e) {
        const webTree = await fetchRepoFromWebHtml(resolvedOwner, resolvedRepo).catch(() => null);
        if (webTree?.treeFiles) treeFiles = webTree.treeFiles;
      }
    }

    if (commitsRes.status === 'fulfilled' && Array.isArray(commitsRes.value.data)) {
      recentCommits = commitsRes.value.data.map((c) => ({
        sha: (c.sha || '').slice(0, 7),
        fullSha: c.sha,
        message: (c.commit?.message || '').split('\n')[0],
        author: c.commit?.author?.name || c.author?.login || resolvedOwner,
        authorLogin: c.author?.login || c.commit?.author?.name || resolvedOwner,
        authorAvatar: c.author?.avatar_url || `https://github.com/${resolvedOwner}.png`,
        date: c.commit?.author?.date || null,
        url: c.html_url,
      }));
    } else {
      recentCommits = await fetchCommitsAtomFallback(resolvedOwner, resolvedRepo, defaultBranch);
    }

    if (contribRes.status === 'fulfilled' && Array.isArray(contribRes.value.data)) {
      contributors = contribRes.value.data.map((ct) => ({
        login: ct.login,
        avatarUrl: ct.avatar_url,
        htmlUrl: ct.html_url,
        contributions: ct.contributions,
      }));
    }

    if (branchRes.status === 'fulfilled' && Array.isArray(branchRes.value.data)) {
      branchesCount = branchRes.value.data.length;
    }

    if (Object.keys(languagesData).length === 0 && treeFiles.length > 0) {
      languagesData = inferLanguagesFromTree(treeFiles);
    }
  }

  emitProgress({ step: 3, totalSteps: 6, label: 'Inspecting dependencies across root & monorepo folders...', status: 'active' });

  // ── PHASE 3: Inspect Tree, Monorepo Manifests, Security & Hygiene ──
  const normalizedPaths = treeFiles.map((f) => String(f.path || f.name || ''));
  const lowerPaths = normalizedPaths.map((p) => p.toLowerCase());

  // Identify manifests either from tree OR probe common monorepo locations cleanly via raw.githubusercontent.com
  const candidatePackageJsons = new Set();
  const candidatePyManifests = new Set();
  const candidateJavaManifests = new Set();
  const candidateOtherManifests = new Set();

  if (normalizedPaths.length > 0) {
    normalizedPaths.forEach((p) => {
      const lp = p.toLowerCase();
      const depth = lp.split('/').length;
      if (lp.includes('node_modules/') || lp.includes('vendor/') || lp.includes('dist/') || lp.includes('build/')) return;
      if (depth > 3) return;

      if (lp === 'package.json' || lp.endsWith('/package.json')) candidatePackageJsons.add(p);
      if (lp === 'requirements.txt' || lp.endsWith('/requirements.txt') || lp === 'pyproject.toml' || lp.endsWith('/pyproject.toml')) {
        candidatePyManifests.add(p);
      }
      if (lp === 'pom.xml' || lp.endsWith('/pom.xml') || lp === 'build.gradle' || lp.endsWith('/build.gradle') || lp === 'build.gradle.kts') {
        candidateJavaManifests.add(p);
      }
      if (lp === 'cargo.toml' || lp === 'go.mod' || lp === 'composer.json' || lp === 'pubspec.yaml' || lp === 'gemfile' || lp.endsWith('/go.mod') || lp.endsWith('/cargo.toml')) {
        candidateOtherManifests.add(p);
      }
    });
  }

  // Also ensure common student monorepo locations are checked if tree was shallow (root-only)
  const isShallowTree = !normalizedPaths.some((p) => p.includes('/'));
  if (isShallowTree) {
    const commonDirs = ['client', 'frontend', 'server', 'backend', 'web', 'api', 'app'];
    if (lowerPaths.some((p) => p === 'package.json')) candidatePackageJsons.add('package.json');
    if (lowerPaths.some((p) => p === 'requirements.txt')) candidatePyManifests.add('requirements.txt');
    if (lowerPaths.some((p) => p === 'pyproject.toml')) candidatePyManifests.add('pyproject.toml');
    if (lowerPaths.some((p) => p === 'pom.xml')) candidateJavaManifests.add('pom.xml');

    commonDirs.forEach((dir) => {
      if (lowerPaths.includes(dir)) {
        candidatePackageJsons.add(`${dir}/package.json`);
        candidatePyManifests.add(`${dir}/requirements.txt`);
        candidateJavaManifests.add(`${dir}/pom.xml`);
      }
    });
  }

  const readmeTarget = normalizedPaths.find((p) => /^readme(\.md|\.txt|\.rst)?$/i.test(p)) || 'README.md';

  // Fetch discovered manifest files + README live via raw.githubusercontent.com (no REST API quota spent!)
  const pkgPaths = Array.from(candidatePackageJsons).slice(0, 4);
  const pyPaths = Array.from(candidatePyManifests).slice(0, 3);
  const javaPaths = Array.from(candidateJavaManifests).slice(0, 2);
  const otherPaths = Array.from(candidateOtherManifests).slice(0, 3);

  const [pkgResults, pyResults, javaResults, otherResults, readmeRaw] = await Promise.all([
    Promise.all(pkgPaths.map((p) => fetchRawFile(repoData.owner.login, repoData.name, defaultBranch, p, options.githubToken).then((d) => ({ path: p, data: d })).catch(() => null))),
    Promise.all(pyPaths.map((p) => fetchRawFile(repoData.owner.login, repoData.name, defaultBranch, p, options.githubToken).then((d) => ({ path: p, data: d })).catch(() => null))),
    Promise.all(javaPaths.map((p) => fetchRawFile(repoData.owner.login, repoData.name, defaultBranch, p, options.githubToken).then((d) => ({ path: p, data: d })).catch(() => null))),
    Promise.all(otherPaths.map((p) => fetchRawFile(repoData.owner.login, repoData.name, defaultBranch, p, options.githubToken).then((d) => ({ path: p, data: d })).catch(() => null))),
    fetchRawFile(repoData.owner.login, repoData.name, defaultBranch, readmeTarget, options.githubToken).catch(() => ''),
  ]);

  const manifestsFound = [];
  const detectedSkillsSet = new Set();

  let hasTests = lowerPaths.some((p) =>
    p.includes('test') ||
    p.includes('spec') ||
    p.includes('__tests__') ||
    p.endsWith('.test.js') ||
    p.endsWith('.test.ts') ||
    p.endsWith('.spec.js')
  );
  const hasDockerfile = lowerPaths.some((p) => p.endsWith('dockerfile') || p.includes('docker-compose'));
  const hasWorkflows = lowerPaths.some((p) => p.startsWith('.github/workflows') || p === '.github');
  const hasGitignore = lowerPaths.some((p) => p === '.gitignore' || p.endsWith('/.gitignore'));
  const hasEnvExample = lowerPaths.some((p) => p.includes('.env.example') || p.includes('.env.sample') || p.includes('.env.template'));
  const hasLinter = lowerPaths.some((p) =>
    p.includes('eslint') ||
    p.includes('prettier') ||
    p.includes('tsconfig.json') ||
    p.includes('.flake8') ||
    p.includes('.pre-commit-config')
  );

  // Check for committed secrets (.env or private keys)
  const exposedSecrets = normalizedPaths.filter((p) => {
    const base = p.split('/').pop().toLowerCase();
    const isRealEnv = base === '.env' || base === '.env.local' || base === '.env.production';
    const isPrivateKey = /\.(pem|key|p12)$/i.test(base) || base === 'id_rsa' || base === 'serviceaccountkey.json';
    return isRealEnv || isPrivateKey;
  });

  // Process package.json files
  pkgResults.filter(Boolean).forEach((entry) => {
    try {
      const parsed = typeof entry.data === 'object' ? entry.data : JSON.parse(entry.data);
      manifestsFound.push(entry.path);
      detectedSkillsSet.add('Node.js');
      if (extractSkillsFromPackageJson(parsed, detectedSkillsSet)) {
        hasTests = true;
      }
    } catch (e) {}
  });

  // Process Python manifests
  pyResults.filter(Boolean).forEach((entry) => {
    manifestsFound.push(entry.path);
    detectedSkillsSet.add('Python');
    if (extractSkillsFromPythonManifest(entry.data, detectedSkillsSet)) {
      hasTests = true;
    }
  });

  // Process Java manifests
  javaResults.filter(Boolean).forEach((entry) => {
    manifestsFound.push(entry.path);
    detectedSkillsSet.add('Java');
    const txt = String(entry.data || '').toLowerCase();
    if (txt.includes('spring-boot')) detectedSkillsSet.add('Spring Boot');
    if (txt.includes('hibernate')) detectedSkillsSet.add('Hibernate');
    if (txt.includes('junit')) {
      detectedSkillsSet.add('JUnit');
      hasTests = true;
    }
  });

  // Process Go, Rust, PHP, Dart manifests
  otherResults.filter(Boolean).forEach((entry) => {
    manifestsFound.push(entry.path);
    const lp = entry.path.toLowerCase();
    const txt = String(entry.data || '').toLowerCase();
    if (lp.endsWith('cargo.toml')) {
      detectedSkillsSet.add('Rust');
      if (txt.includes('tokio') || txt.includes('actix') || txt.includes('axum')) detectedSkillsSet.add('REST APIs');
    } else if (lp.endsWith('go.mod')) {
      detectedSkillsSet.add('Go (Golang)');
      if (txt.includes('gin-gonic') || txt.includes('fiber') || txt.includes('echo')) detectedSkillsSet.add('REST APIs');
    } else if (lp.endsWith('composer.json')) {
      detectedSkillsSet.add('PHP');
      if (txt.includes('laravel')) detectedSkillsSet.add('Laravel');
    } else if (lp.endsWith('pubspec.yaml')) {
      detectedSkillsSet.add('Flutter / Dart');
    }
  });

  const readmeSnippet = typeof readmeRaw === 'string' ? readmeRaw.slice(0, 3500) : '';

  // Ensure languagesData isn't empty when manifests were verified under strict API rate limits
  if (Object.keys(languagesData).length === 0) {
    if (pkgResults.some(Boolean)) {
      if (detectedSkillsSet.has('TypeScript')) languagesData.TypeScript = 45000;
      languagesData.JavaScript = 35000;
    }
    if (pyResults.some(Boolean)) languagesData.Python = 50000;
    if (javaResults.some(Boolean)) languagesData.Java = 50000;
    if (detectedSkillsSet.has('Rust')) languagesData.Rust = 45000;
    if (detectedSkillsSet.has('Go (Golang)')) languagesData.Go = 45000;
  }

  emitProgress({ step: 4, totalSteps: 6, label: 'Analyzing languages, engineering score & security posture...', status: 'active' });

  // ── PHASE 4: Calculate Languages & Skills ──
  const totalBytes = Object.values(languagesData).reduce((a, b) => a + b, 0);
  const languagesList = Object.entries(languagesData)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: totalBytes > 0 ? parseFloat(((bytes / totalBytes) * 100).toFixed(1)) : 0,
      color: LANGUAGE_COLORS[name] || '#6e7681',
    }))
    .sort((a, b) => b.bytes - a.bytes);

  languagesList.forEach((l) => {
    if (l.percentage >= 5) {
      if (l.name === 'JavaScript') detectedSkillsSet.add('JavaScript');
      else if (l.name === 'TypeScript') detectedSkillsSet.add('TypeScript');
      else if (l.name === 'Python') detectedSkillsSet.add('Python');
      else if (l.name === 'Java') detectedSkillsSet.add('Java');
      else if (l.name === 'C++') detectedSkillsSet.add('C++');
      else if (l.name === 'C') detectedSkillsSet.add('C');
      else if (l.name === 'Go') detectedSkillsSet.add('Go (Golang)');
      else if (l.name === 'Rust') detectedSkillsSet.add('Rust');
      else if (l.name === 'HTML') detectedSkillsSet.add('HTML');
      else if (l.name === 'CSS' || l.name === 'SCSS') detectedSkillsSet.add('CSS');
      else if (l.name === 'Dart') detectedSkillsSet.add('Dart');
    }
  });

  if (hasDockerfile) detectedSkillsSet.add('Docker');
  if (hasWorkflows && lowerPaths.some((p) => p.includes('.github/workflows/'))) detectedSkillsSet.add('GitHub Actions');
  if (hasGitignore || treeFiles.length > 0) detectedSkillsSet.add('Git');

  if (Array.isArray(repoData.topics)) {
    repoData.topics.forEach((t) => {
      const top = String(t).toLowerCase();
      if (top.includes('machine-learning') || top === 'ml') detectedSkillsSet.add('Machine Learning');
      if (top.includes('deep-learning')) detectedSkillsSet.add('Deep Learning');
      if (top.includes('aws')) detectedSkillsSet.add('AWS');
      if (top.includes('kubernetes') || top === 'k8s') detectedSkillsSet.add('Kubernetes');
      if (top.includes('docker')) detectedSkillsSet.add('Docker');
      if (top.includes('fastapi')) detectedSkillsSet.add('FastAPI');
      if (top.includes('react')) detectedSkillsSet.add('React.js');
      if (top.includes('nextjs') || top.includes('next-js')) detectedSkillsSet.add('Next.js');
    });
  }

  const detectedSkills = Array.from(detectedSkillsSet);

  // ── PHASE 5: Code Quality Score & Role Matching ──
  emitProgress({ step: 5, totalSteps: 6, label: 'Computing placement role fit & recruiter readiness report...', status: 'active' });

  const scoreBreakdown = {
    documentation: 0,
    codebaseStructure: 0,
    devOpsAndTesting: 0,
    maintenanceAndActivity: 0,
  };

  if (repoData.description && repoData.description.length > 10) scoreBreakdown.documentation += 7;
  if (readmeSnippet.length > 100) scoreBreakdown.documentation += 10;
  if (readmeSnippet.length > 500) scoreBreakdown.documentation += 5;
  if (repoData.license?.name) scoreBreakdown.documentation += 3;

  if (languagesList.length > 0) scoreBreakdown.codebaseStructure += 10;
  if (languagesList.some((l) => ['TypeScript', 'Python', 'Java', 'Go', 'Rust'].includes(l.name))) scoreBreakdown.codebaseStructure += 7;
  if (manifestsFound.length > 0) scoreBreakdown.codebaseStructure += 5;
  if (hasLinter || hasGitignore) scoreBreakdown.codebaseStructure += 3;

  if (hasWorkflows) scoreBreakdown.devOpsAndTesting += 9;
  if (hasDockerfile) scoreBreakdown.devOpsAndTesting += 8;
  if (hasTests) scoreBreakdown.devOpsAndTesting += 8;

  const lastPushDays = repoData.pushed_at
    ? (Date.now() - new Date(repoData.pushed_at).getTime()) / (1000 * 60 * 60 * 24)
    : 100;
  if (lastPushDays < 30) scoreBreakdown.maintenanceAndActivity += 12;
  else if (lastPushDays < 180) scoreBreakdown.maintenanceAndActivity += 8;
  else scoreBreakdown.maintenanceAndActivity += 4;

  if (repoData.stargazers_count > 0) scoreBreakdown.maintenanceAndActivity += Math.min(8, repoData.stargazers_count * 2);
  if (repoData.forks_count > 0) scoreBreakdown.maintenanceAndActivity += Math.min(5, repoData.forks_count * 2);

  // Security deduction if real secrets/env committed
  let securityPenalty = exposedSecrets.length > 0 ? 10 : 0;

  const qualityScore = Math.max(
    10,
    Math.min(
      100,
      scoreBreakdown.documentation +
        scoreBreakdown.codebaseStructure +
        scoreBreakdown.devOpsAndTesting +
        scoreBreakdown.maintenanceAndActivity -
        securityPenalty
    )
  );

  // Match Placement Career Roles
  const matchedRoles = [];
  const skillStr = detectedSkills.join(' ').toLowerCase();
  const roleDefinitions = [
    { role: 'Full Stack Developer', category: 'Software Development', required: ['javascript', 'react', 'node', 'express', 'sql', 'typescript'], minMatches: 2 },
    { role: 'Frontend Developer', category: 'Software Development', required: ['javascript', 'react', 'html', 'css', 'tailwind', 'next.js', 'typescript'], minMatches: 2 },
    { role: 'Backend / API Engineer', category: 'Software Development', required: ['node', 'express', 'python', 'fastapi', 'django', 'postgresql', 'mysql', 'rest apis'], minMatches: 2 },
    { role: 'Python AI / ML Engineer', category: 'Artificial Intelligence & Machine Learning', required: ['python', 'pytorch', 'tensorflow', 'pandas', 'scikit-learn', 'machine learning'], minMatches: 2 },
    { role: 'DevOps & Cloud Engineer', category: 'Cloud Computing & DevOps', required: ['docker', 'github actions', 'kubernetes', 'aws'], minMatches: 1 },
    { role: 'Java Enterprise Developer', category: 'Software Development', required: ['java', 'spring boot', 'hibernate', 'junit'], minMatches: 1 },
  ];

  roleDefinitions.forEach((def) => {
    let matchCount = 0;
    def.required.forEach((r) => {
      if (skillStr.includes(r)) matchCount++;
    });
    if (matchCount >= def.minMatches) {
      const matchPct = Math.min(96, Math.max(60, Math.round((matchCount / def.required.length) * 100) + 15));
      matchedRoles.push({
        roleName: def.role,
        category: def.category,
        fitScore: matchPct,
        matchedSkillsCount: matchCount,
      });
    }
  });
  matchedRoles.sort((a, b) => b.fitScore - a.fitScore);

  // Recruiter Highlights & Recommendations
  const highlights = [];
  const recommendations = [];

  if (manifestsFound.length > 0) {
    highlights.push(`Verified Tech Stack Manifests: Inspected ${manifestsFound.join(', ')}.`);
  }
  if (hasWorkflows) {
    highlights.push('Continuous Integration (CI/CD): GitHub Actions workflows configured.');
  } else {
    recommendations.push('Add automated testing workflow in .github/workflows for continuous integration proof.');
  }
  if (hasDockerfile) {
    highlights.push('Containerization: Production Dockerfile/Compose setup verified.');
  }
  if (hasTests) {
    highlights.push('Quality Assurance: Dedicated test suite present in codebase.');
  } else {
    recommendations.push('Add unit & integration tests to substantiate production reliability during interviews.');
  }
  if (readmeSnippet.length > 400) {
    highlights.push('Documentation: Comprehensive README describing setup and architecture.');
  } else {
    recommendations.push('Expand README.md with architecture overview, screenshots, and API setup steps.');
  }
  if (exposedSecrets.length > 0) {
    recommendations.push(`CRITICAL SECURITY RISK: Committed sensitive file(s) found (${exposedSecrets.join(', ')}). Remove them immediately from git history and rotate secrets!`);
  }
  if (!hasGitignore) {
    recommendations.push('Add a .gitignore file to keep build artifacts and secrets out of git history.');
  }

  // Build concise live structure summary & top-level explorer items
  const topTree = treeFiles
    .filter((f) => !String(f.path).includes('/'))
    .sort((a, b) => (a.type === b.type ? a.path.localeCompare(b.path) : a.type === 'tree' ? -1 : 1))
    .slice(0, 30)
    .map((f) => ({
      name: f.path,
      type: f.type === 'tree' ? 'dir' : 'file',
      size: f.size || 0,
    }));

  // ── PHASE 6: Architecture Diagram & Component Flow ──
  emitProgress({ step: 6, totalSteps: 6, label: 'Generating architecture diagram & component flow analysis...', status: 'active' });
  let architectureDiagram = null;
  try {
    architectureDiagram = await getRepoArchitectureDiagram(resolvedOwner, resolvedRepo, {
      fileTree: topTree,
      languages: { primaryLanguage: languagesList[0]?.name || 'Unknown', breakdown: languagesList },
      detectedSkills,
      readmePreview: readmeSnippet,
      repoData,
    });
  } catch (archErr) {
    console.warn('[Architecture Diagram] Failed to generate:', archErr.message);
    architectureDiagram = null;
  }

  const latencyMs = Date.now() - startTime;

  return {
    success: true,
    repository: {
      owner: repoData.owner.login,
      ownerAvatar: repoData.owner.avatar_url,
      ownerProfile: repoData.owner.html_url,
      name: repoData.name,
      fullName: repoData.full_name,
      htmlUrl: repoData.html_url,
      homepage: repoData.homepage || null,
      description: repoData.description || 'No description provided.',
      defaultBranch,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      watchers: repoData.watchers_count,
      openIssues: repoData.open_issues_count,
      license: repoData.license?.name || 'Unlicensed',
      sizeKb: repoData.size,
      lastPushedAt: repoData.pushed_at,
      createdAt: repoData.created_at,
      updatedAt: repoData.updated_at,
      topics: repoData.topics || [],
      branchesCount,
      totalFilesScanned: treeFiles.length,
      manifestsFound,
      isFallback: false,
      sourceMode,
    },
    languages: {
      totalBytes,
      primaryLanguage: languagesList[0]?.name || 'Unknown',
      breakdown: languagesList,
    },
    codeQuality: {
      score: qualityScore,
      rating: qualityScore >= 80 ? 'EXEMPLARY' : qualityScore >= 60 ? 'PRODUCTION_READY' : 'DEVELOPMENT_GRADE',
      scoreBreakdown,
      hasDockerfile,
      hasWorkflows,
      hasTests,
      hasGitignore,
      hasEnvExample,
      hasLinter,
      hasReadme: readmeSnippet.length > 0,
      exposedSecrets,
    },
    detectedSkills,
    matchedRoles,
    highlights,
    recommendations,
    commits: recentCommits,
    contributors,
    fileTree: topTree,
    readmePreview: readmeSnippet,
    architectureDiagram,
    telemetry: {
      live: true,
      source: sourceMode,
      latencyMs,
      rateLimitRemaining: rateLimitInfo?.remaining ?? null,
      rateLimitTotal: rateLimitInfo?.limit ?? null,
    },
    scannedAt: new Date().toISOString(),
  };
}

module.exports = {
  scanGithubRepository,
  fetchUserRepositories,
  parseRepoUrl,
  parseGithubInput,
};
