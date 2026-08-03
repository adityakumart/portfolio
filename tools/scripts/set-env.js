const fs = require('fs');
const path = require('path');

// Root of the workspace
const rootDir = path.resolve(__dirname, '../..');

const targetPath = path.join(rootDir, 'apps/portfolio/src/environments/environment.ts');
const targetProdPath = path.join(rootDir, 'apps/portfolio/src/environments/environment.prod.ts');
const dotenvPath = path.join(rootDir, 'apps/portfolio/.env');

// Simple parser for .env file
const envConfig = {};
if (fs.existsSync(dotenvPath)) {
  const content = fs.readFileSync(dotenvPath, 'utf8');
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

const supabaseConfig = {
  url: envConfig.SUPABASE_URL || '',
  key: envConfig.SUPABASE_KEY || ''
};

const apiUrl = envConfig.API_URL || 'http://localhost:3000/api';

const envFileContent = `// This file is generated dynamically at build/serve time.
export const environment = {
  production: false,
  baseHref: '/',
  apiUrl: '${apiUrl}',
  supabase: ${JSON.stringify(supabaseConfig, null, 2)}
};
`;

const envProdFileContent = `// This file is generated dynamically at build/serve time.
export const environment = {
  production: true,
  baseHref: '/portfolio/',
  apiUrl: '${apiUrl}',
  supabase: ${JSON.stringify(supabaseConfig, null, 2)}
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
console.log(`- ${targetPath}`);
console.log(`- ${targetProdPath}`);

