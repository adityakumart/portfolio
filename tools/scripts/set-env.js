const fs = require('fs');
const path = require('path');

// Root of the workspace
const rootDir = path.resolve(__dirname, '../..');

const targetPath = path.join(rootDir, 'apps/portfolio/src/environments/environment.ts');
const targetProdPath = path.join(rootDir, 'apps/portfolio/src/environments/environment.prod.ts');
const dotenvPath = path.join(rootDir, 'apps/portfolio/.env');
const dotenvProdPath = path.join(rootDir, 'apps/portfolio/.env.prod');

// Simple parser for .env files
const parseEnvFile = (filePath) => {
  const envConfig = {};
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    content.split('\n').forEach(line => {
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
const prodEnvConfig = fs.existsSync(dotenvProdPath) ? parseEnvFile(dotenvProdPath) : devEnvConfig;

const getSupabaseConfig = (config) => ({
  url: config.SUPABASE_URL || process.env.SUPABASE_URL || '',
  key: config.SUPABASE_KEY || process.env.SUPABASE_KEY || ''
});

const getApiUrl = (config) => config.APIURL || process.env.APIURL || 'http://localhost:3000/api';

const devSupabaseConfig = getSupabaseConfig(devEnvConfig);
const devApiUrl = getApiUrl(devEnvConfig);

const prodSupabaseConfig = getSupabaseConfig(prodEnvConfig);
const prodApiUrl = getApiUrl(prodEnvConfig);

const envFileContent = `// This file is generated dynamically at build/serve time.
export const environment = {
  production: false,
  baseHref: '/',
  APIURL: '${devApiUrl}',
  supabase: ${JSON.stringify(devSupabaseConfig, null, 2)}
};
`;

const envProdFileContent = `// This file is generated dynamically at build/serve time.
export const environment = {
  production: true,
  baseHref: '/portfolio/',
  APIURL: '${prodApiUrl}',
  supabase: ${JSON.stringify(prodSupabaseConfig, null, 2)}
};
`;

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

console.log('Environment files generated successfully:');
console.log(`- ${targetPath} (using ${fs.existsSync(dotenvPath) ? '.env' : 'system/empty env'})`);
console.log(`- ${targetProdPath} (using ${fs.existsSync(dotenvProdPath) ? '.env.prod' : 'fallback to .env/system env'})`);

