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

const firebaseConfig = {
  apiKey: envConfig.FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: envConfig.FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: envConfig.FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: envConfig.FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: envConfig.FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: envConfig.FIREBASE_APP_ID || 'YOUR_APP_ID',
  measurementId: envConfig.FIREBASE_MEASUREMENT_ID || 'YOUR_MEASUREMENT_ID',
};

const envFileContent = `// This file is generated dynamically at build/serve time.
export const environment = {
  production: false,
  baseHref: '/',
  firebase: ${JSON.stringify(firebaseConfig, null, 2)}
};
`;

const envProdFileContent = `// This file is generated dynamically at build/serve time.
export const environment = {
  production: true,
  baseHref: '/portfolio/',
  firebase: ${JSON.stringify(firebaseConfig, null, 2)}
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

