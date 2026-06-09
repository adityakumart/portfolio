const fs = require('fs');
const path = require('path');

// Root of the workspace
const rootDir = path.resolve(__dirname, '../..');

const targetPath = path.join(rootDir, 'apps/portfolio/src/environments/environment.ts');
const targetProdPath = path.join(rootDir, 'apps/portfolio/src/environments/environment.prod.ts');

const envFileContent = `// This file is generated dynamically at build/serve time.
export const environment = {
  production: false,
  baseHref: '/',
};
`;

const envProdFileContent = `// This file is generated dynamically at build/serve time.
export const environment = {
  production: true,
  baseHref: '/portfolio/',
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
