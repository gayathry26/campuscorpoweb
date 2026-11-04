import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  routesSEO, 
  BASE_URL, 
  organizationSchema, 
  websiteSchema, 
  softwareApplicationSchema 
} from '../src/data/seoData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error('dist/index.html does not exist. Run vite build first.');
  process.exit(1);
}

const rawTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

console.log('Generating pre-rendered static HTML routes for Vercel & search engine crawlers...');

Object.entries(routesSEO).forEach(([key, seo]) => {
  const canonicalUrl = `${BASE_URL}${seo.path === '/' ? '' : seo.path}`;

  // Build Breadcrumb Schema
  const breadcrumbSchema = seo.breadcrumbs && seo.breadcrumbs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: seo.breadcrumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: crumb.item
    }))
  } : null;

  // Build WebPage Schema
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: seo.title,
    description: seo.description,
    isPartOf: {
      '@id': `${BASE_URL}/#website`
    }
  };

  // Build FAQ Schema
  const faqSchema = seo.faqs && seo.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: seo.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  } : null;

  // Semantic fallback HTML for search crawlers (inside #root before hydration)
  const faqHtml = seo.faqs && seo.faqs.length > 0 ? `
    <section>
      <h2>Frequently Asked Questions</h2>
      <dl>
        ${seo.faqs.map(f => `<dt><strong>${f.question}</strong></dt><dd>${f.answer}</dd>`).join('')}
      </dl>
    </section>
  ` : '';

  const initialContent = `
    <header>
      <h1>${seo.title}</h1>
      <p>${seo.description}</p>
    </header>
    ${faqHtml}
  `;

  // Clean tags from template
  let html = rawTemplate
    .replace(/<title>.*?<\/title>/i, '')
    .replace(/<meta name="description" content=".*?" \/>/i, '')
    .replace(/<meta name="keywords" content=".*?" \/>/i, '')
    .replace(/<link rel="canonical" href=".*?" \/>/i, '');

  const metaInject = `
    <title>${seo.title}</title>
    <meta name="description" content="${seo.description}" />
    <meta name="keywords" content="${seo.keywords || ''}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:title" content="${seo.title}" />
    <meta property="og:description" content="${seo.description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="${BASE_URL}/campuscorpo-full.png" />
    <meta property="og:site_name" content="CampusCorpo" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${seo.title}" />
    <meta name="twitter:description" content="${seo.description}" />
    <meta name="twitter:image" content="${BASE_URL}/campuscorpo-full.png" />

    <script type="application/ld+json">${JSON.stringify(organizationSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(websiteSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(softwareApplicationSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(webPageSchema)}</script>
    ${breadcrumbSchema ? `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>` : ''}
    ${faqSchema ? `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>` : ''}
  `;

  if (html.includes('<!-- SEO_HEAD_INJECTION -->')) {
    html = html.replace('<!-- SEO_HEAD_INJECTION -->', metaInject.trim());
  } else {
    html = html.replace('</head>', `${metaInject.trim()}\n</head>`);
  }

  // Inject initial semantic HTML inside #root
  html = html.replace('<div id="root"></div>', `<div id="root"><noscript>${initialContent}</noscript></div>`);

  // Target output path
  let targetFile;
  if (seo.path === '/') {
    targetFile = path.join(DIST_DIR, 'index.html');
  } else if (seo.path === '/404') {
    targetFile = path.join(DIST_DIR, '404.html');
  } else {
    const cleanPath = seo.path.startsWith('/') ? seo.path.slice(1) : seo.path;
    const targetDir = path.join(DIST_DIR, cleanPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    targetFile = path.join(targetDir, 'index.html');
  }

  fs.writeFileSync(targetFile, html, 'utf-8');
  console.log(`✓ Pre-rendered: ${seo.path} -> ${targetFile.replace(DIST_DIR, '')}`);
});

// Generate static HTML redirects for consolidated legacy routes
const moduleRedirects = [
  { from: 'solutions/placement-management', to: '/platform#placement' },
  { from: 'solutions/student-management', to: '/platform#student-management' },
  { from: 'solutions/faculty-management', to: '/platform#faculty-management' },
  { from: 'solutions/administration', to: '/platform#administration' },
  { from: 'solutions/lms', to: '/platform#lms' },
  { from: 'features/programming-assessment', to: '/platform#coding-assessment' },
  { from: 'features/mock-interviews', to: '/platform#mock-interviews' },
];

console.log('\nGenerating static HTML redirect fallbacks for consolidated platform routes...');
moduleRedirects.forEach(({ from, to }) => {
  const targetDir = path.join(DIST_DIR, from);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const targetFile = path.join(targetDir, 'index.html');
  const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=${to}">
  <link rel="canonical" href="${BASE_URL}${to}">
  <title>Redirecting to CampusCorpo Platform...</title>
  <script>window.location.replace('${to}');</script>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; padding: 40px; text-align: center; color: #111;">
  <p>Redirecting to <a href="${to}" style="color: #000; font-weight: 600;">CampusCorpo Platform</a>...</p>
</body>
</html>`;
  fs.writeFileSync(targetFile, redirectHtml, 'utf-8');
  console.log(`✓ Static redirect: /${from} -> ${to}`);
});

console.log('✓ All routes pre-rendered successfully without duplicate tags for Vercel production hosting!');
