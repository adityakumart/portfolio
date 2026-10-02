const fs = require('fs');
const path = require('path');

// Root of the workspace
const rootDir = path.resolve(__dirname, '../..');

const targetPath = path.join(rootDir, 'apps/portfolio/src/environments/environment.ts');
const targetProdPath = path.join(rootDir, 'apps/portfolio/src/environments/environment.prod.ts');
const dotenvPath = path.join(rootDir, 'apps/portfolio/.env');
const dotenvProdPath = path.join(rootDir, 'apps/portfolio/.env.prod');
const sitemapPath = path.join(rootDir, 'apps/portfolio/src/sitemap.xml');
const robotsPath = path.join(rootDir, 'apps/portfolio/src/robots.txt');

// Simple parser for .env files
const parseEnvFile = (filePath) => {
  const envConfig = {};
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    content.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        envConfig[key] = value.trim();
      }
    });
  }
  return envConfig;
};

// Parse environment configurations
const devEnvConfig = parseEnvFile(dotenvPath);
const prodEnvConfig = fs.existsSync(dotenvProdPath)
  ? parseEnvFile(dotenvProdPath)
  : devEnvConfig;

const getSupabaseConfig = (config) => ({
  url: config.SUPABASE_URL || process.env.SUPABASE_URL || '',
  key: config.SUPABASE_KEY || process.env.SUPABASE_KEY || '',
});

const getApiUrl = (config) =>
  config.APIURL || process.env.APIURL || 'http://localhost:3000/api';

const getSiteUrl = (config, isProd) => {
  const customUrl =
    process.env.SITE_URL ||
    config.SITE_URL;
  if (customUrl) {
    return customUrl.replace(/\/+$/, '');
  }

  // Vercel auto-injected deployment variables
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`.replace(/\/+$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, '');
  }

  return isProd ? 'https://adityakumart.github.io/portfolio' : 'http://localhost:4200';
};

const getBaseHref = (siteUrl, isProd) => {
  if (process.env.BASE_HREF) return process.env.BASE_HREF;
  if (process.env.VERCEL) return '/';
  try {
    const urlObj = new URL(siteUrl);
    const pathname = urlObj.pathname.replace(/\/+$/, '');
    if (pathname && pathname.length > 0) {
      return `${pathname}/`;
    }
  } catch (e) {}
  return isProd && siteUrl.includes('github.io') ? '/portfolio/' : '/';
};

const devSupabaseConfig = getSupabaseConfig(devEnvConfig);
const devApiUrl = getApiUrl(devEnvConfig);
const devSiteUrl = getSiteUrl(devEnvConfig, false);
const devBaseHref = getBaseHref(devSiteUrl, false);

const prodSupabaseConfig = getSupabaseConfig(prodEnvConfig);
const prodApiUrl = getApiUrl(prodEnvConfig);
const prodSiteUrl = getSiteUrl(prodEnvConfig, true);
const prodBaseHref = getBaseHref(prodSiteUrl, true);

const envFileContent = `// This file is generated dynamically at build/serve time.
export const environment = {
  production: false,
  baseHref: '${devBaseHref}',
  siteUrl: '${devSiteUrl}',
  APIURL: '${devApiUrl}',
  supabase: ${JSON.stringify(devSupabaseConfig, null, 2)}
};
`;

const envProdFileContent = `// This file is generated dynamically at build/serve time.
export const environment = {
  production: true,
  baseHref: '${prodBaseHref}',
  siteUrl: '${prodSiteUrl}',
  APIURL: '${prodApiUrl}',
  supabase: ${JSON.stringify(prodSupabaseConfig, null, 2)}
};
`;

// Public routes for dynamic sitemap generation
const publicRoutes = [
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: 'user/login', priority: '0.5', changefreq: 'monthly' },
  { path: 'user/formbuilder', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/formbuilder/create', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/rr', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/rr/home', priority: '0.7', changefreq: 'monthly' },
  { path: 'user/rr/login', priority: '0.5', changefreq: 'monthly' },
  // Dev Tools: Calculator
  { path: 'user/dev-tools/calculator/percentage', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/dev-tools/calculator/experience', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/dev-tools/calculator/timezone-converter', priority: '0.8', changefreq: 'monthly' },
  // Dev Tools: Formatters
  { path: 'user/dev-tools/formatters/json', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/dev-tools/formatters/html', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/dev-tools/formatters/css', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/dev-tools/formatters/js', priority: '0.8', changefreq: 'monthly' },
  // Dev Tools: Encode/Decode
  { path: 'user/dev-tools/encode-decode/base64', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/dev-tools/encode-decode/md5', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/dev-tools/encode-decode/sha256', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/dev-tools/encode-decode/jwt', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/dev-tools/encode-decode/url', priority: '0.8', changefreq: 'monthly' },
  // Dev Tools: Converters
  { path: 'user/dev-tools/converters/json-to-csv-ts-schema', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/dev-tools/converters/json-to-typescript', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/dev-tools/converters/query-string', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/dev-tools/converters/number-base', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/dev-tools/converters/line-splitter', priority: '0.8', changefreq: 'monthly' },
  // Dev Tools: Generator
  { path: 'user/dev-tools/generator/regex', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/dev-tools/generator/qr', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/dev-tools/generator/array', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/dev-tools/generator/number', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/dev-tools/generator/objects', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/dev-tools/generator/uuid', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/dev-tools/generator/password', priority: '0.8', changefreq: 'monthly' },
  { path: 'user/dev-tools/generator/hash', priority: '0.8', changefreq: 'monthly' },
];

const generateSitemap = (siteUrl) => {
  const cleanBase = siteUrl.replace(/\/+$/, '');
  const today = new Date().toISOString().split('T')[0];
  const urlsXml = publicRoutes
    .map((r) => {
      const fullUrl = r.path ? `${cleanBase}/${r.path}` : `${cleanBase}/`;
      return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>
`;
};

const generateRobotsTxt = (siteUrl) => {
  const cleanBase = siteUrl.replace(/\/+$/, '');
  return `User-agent: *
Allow: /
Disallow: /user/planner
Disallow: /user/files
Disallow: /user/diet-hydration
Disallow: /user/chat
Disallow: /user/ai
Disallow: /user/no-modules
Disallow: /user/rr/dashboard/
Disallow: /user/rr/booking/
Disallow: /user/rr/vehicle/
Disallow: /user/rr/customer/
Disallow: /user/rr/employee/
Disallow: /user/rr/history
Disallow: /user/rr/activity-logs

Sitemap: ${cleanBase}/sitemap.xml
`;
};

// Ensure directories exist
const ensureDir = (filePath) => {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
};

ensureDir(targetPath);
ensureDir(targetProdPath);

fs.writeFileSync(targetPath, envFileContent, 'utf8');
fs.writeFileSync(targetProdPath, envProdFileContent, 'utf8');
fs.writeFileSync(sitemapPath, generateSitemap(prodSiteUrl), 'utf8');
fs.writeFileSync(robotsPath, generateRobotsTxt(prodSiteUrl), 'utf8');

console.log('Environment and SEO files generated successfully:');
console.log(`- ${targetPath} (using ${fs.existsSync(dotenvPath) ? '.env' : 'system/empty env'})`);
console.log(`- ${targetProdPath} (siteUrl: ${prodSiteUrl})`);
console.log(`- ${sitemapPath} (siteUrl: ${prodSiteUrl})`);
console.log(`- ${robotsPath} (siteUrl: ${prodSiteUrl})`);
