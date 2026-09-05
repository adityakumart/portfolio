const fs = require('fs');
const path = require('path');
const { createStyleMap } = require('@spartan-ng/cli/src/generators/base/lib/styles/create-style-map.js');
const { transformStyle } = require('@spartan-ng/cli/src/generators/base/lib/styles/transform.js');

async function main() {
  const css = fs.readFileSync('node_modules/@spartan-ng/cli/src/generators/ui/style-luma.css', 'utf8');
  const styleMap = createStyleMap(css);

  const libs = [
    'utils',
    'badge',
    'button',
    'card',
    'dialog',
    'input',
    'label',
    'separator',
    'spinner',
    'tabs',
    'tooltip',
  ];

  console.log('Generating Luma libraries under libs/styles-luma...');

  for (const lib of libs) {
    const srcLibDir = path.join('libs/styles', lib);
    const destLibDir = path.join('libs/styles-luma', lib);

    // Create directories
    fs.mkdirSync(path.join(destLibDir, 'src', 'lib'), { recursive: true });

    // Copy config files and adjust paths/names
    const configFiles = [
      'project.json',
      'ng-package.json',
      'package.json',
      'tsconfig.json',
      'tsconfig.lib.json',
      'tsconfig.lib.prod.json',
      'eslint.config.mjs',
      'README.md',
    ];

    for (const cf of configFiles) {
      const srcFile = path.join(srcLibDir, cf);
      const destFile = path.join(destLibDir, cf);
      if (fs.existsSync(srcFile)) {
        let content = fs.readFileSync(srcFile, 'utf8');
        // Update paths in configs
        content = content.replace(/libs\/styles\//g, 'libs/styles-luma/');
        if (cf === 'project.json') {
          // Rename project to avoid nx project name collision
          content = content.replace(new RegExp(`"name": "${lib}"`), `"name": "${lib}-luma"`);
        }
        if (cf === 'package.json') {
          content = content.replace(new RegExp(`"@spartan-ng/hel/${lib}"`), `"@spartan-ng/hel-luma/${lib}"`);
        }
        fs.writeFileSync(destFile, content, 'utf8');
      }
    }

    // Generate src/index.ts
    const srcIndex = path.join(srcLibDir, 'src', 'index.ts');
    const destIndex = path.join(destLibDir, 'src', 'index.ts');
    if (fs.existsSync(srcIndex)) {
      let content = fs.readFileSync(srcIndex, 'utf8');
      content = content.replace(/@spartan-ng\/hel\//g, '@spartan-ng/hel-luma/');
      fs.writeFileSync(destIndex, content, 'utf8');
    }

    if (lib === 'utils') {
      // Copy utils files
      const utilsFiles = fs.readdirSync(path.join(srcLibDir, 'src', 'lib'));
      for (const uf of utilsFiles) {
        let content = fs.readFileSync(path.join(srcLibDir, 'src', 'lib', uf), 'utf8');
        content = content.replace(/@spartan-ng\/hel\//g, '@spartan-ng/hel-luma/');
        fs.writeFileSync(path.join(destLibDir, 'src', 'lib', uf), content, 'utf8');
      }
      continue;
    }

    // Process component files from CLI templates
    const cliLibDir = path.join('node_modules/@spartan-ng/cli/src/generators/ui/libs', lib, 'files', 'lib');
    if (!fs.existsSync(cliLibDir)) {
      console.warn(`CLI lib dir not found for ${lib}`);
      continue;
    }

    const templateFiles = fs.readdirSync(cliLibDir).filter(f => f.endsWith('.template'));

    for (const templateFile of templateFiles) {
      const targetFileName = templateFile.replace(/\.template$/, '');
      const targetFilePath = path.join(destLibDir, 'src', 'lib', targetFileName);

      // Special handling for dialog
      if (lib === 'dialog') {
        if (targetFileName === 'hlm-dialog.service.ts') {
          // Copy existing custom dialog service and point imports to @spartan-ng/hel-luma
          let content = fs.readFileSync(path.join(srcLibDir, 'src', 'lib', targetFileName), 'utf8');
          content = content.replace(/@spartan-ng\/hel\//g, '@spartan-ng/hel-luma/');
          fs.writeFileSync(targetFilePath, content, 'utf8');
          console.log(`[DIALOG-SERVICE] Copied custom dialog service for Luma`);
          continue;
        }
        if (targetFileName === 'hlm-dialog-content.ts') {
          let content = fs.readFileSync(path.join(srcLibDir, 'src', 'lib', targetFileName), 'utf8');
          content = content.replace(/@spartan-ng\/hel\//g, '@spartan-ng/hel-luma/');
          // Apply Luma classes for dialog content
          const lumaDialogClasses = 'bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 ring-foreground/5 dark:ring-foreground/10 max-w-[calc(100%-2rem)] gap-6 rounded-4xl p-6 text-sm shadow-xl ring-1 duration-100 relative mx-auto w-full outline-none sm:mx-0';
          content = content.replace(
            /'bg-popover text-popover-foreground data-open:animate-in[^']*relative mx-auto w-full outline-none sm:mx-0'/,
            `'${lumaDialogClasses}'`
          );
          fs.writeFileSync(targetFilePath, content, 'utf8');
          console.log(`[DIALOG-CONTENT] Applied Luma classes to dialog-content`);
          continue;
        }
      }

      const templateContent = fs.readFileSync(path.join(cliLibDir, templateFile), 'utf8');
      const substituted = templateContent.replace(/<%-\s*importAlias\s*%>/g, '@spartan-ng/hel-luma');
      let transformed = await transformStyle(substituted, { styleMap });
      transformed = transformed.replace(/@spartan-ng\/hel\//g, '@spartan-ng/hel-luma/');

      fs.writeFileSync(targetFilePath, transformed, 'utf8');
      console.log(`[LUMA-GENERATED] ${lib}/${targetFileName}`);
    }
  }

  console.log('All Luma components generated successfully!');
}

main().catch(err => {
  console.error('Error generating Luma libs:', err);
  process.exit(1);
});
