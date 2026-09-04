const fs = require('fs');
const path = require('path');
const { createStyleMap } = require('@spartan-ng/cli/src/generators/base/lib/styles/create-style-map.js');
const { transformStyle } = require('@spartan-ng/cli/src/generators/base/lib/styles/transform.js');

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const css = fs.readFileSync('node_modules/@spartan-ng/cli/src/generators/ui/style-lyra.css', 'utf8');
  const styleMap = createStyleMap(css);

  const libs = [
    'badge',
    'button',
    'card',
    'checkbox',
    'dialog',
    'dropdown-menu',
    'field',
    'input',
    'label',
    'progress',
    'radio-group',
    'select',
    'separator',
    'sonner',
    'spinner',
    'table',
    'tabs',
    'tooltip',
  ];

  console.log(`Starting transformation to Lyra style... (dryRun: ${isDryRun})`);

  let modifiedCount = 0;

  for (const lib of libs) {
    const cliLibDir = path.join('node_modules/@spartan-ng/cli/src/generators/ui/libs', lib, 'files', 'lib');
    const targetLibDir = path.join('libs/styles', lib, 'src', 'lib');

    if (!fs.existsSync(cliLibDir)) {
      console.warn(`No CLI files found for lib: ${lib}`);
      continue;
    }

    const templateFiles = fs.readdirSync(cliLibDir).filter(f => f.endsWith('.template'));

    for (const templateFile of templateFiles) {
      const targetFileName = templateFile.replace(/\.template$/, '');
      const targetFilePath = path.join(targetLibDir, targetFileName);

      // Special handling for dialog
      if (lib === 'dialog') {
        if (targetFileName === 'hlm-dialog.service.ts') {
          console.log(`[PRESERVE] ${lib}/${targetFileName} (Custom workspace service with closeAll / _openDialogs)`);
          continue;
        }
        if (targetFileName === 'hlm-dialog-content.ts') {
          console.log(`[CUSTOM-UPDATE] ${lib}/${targetFileName} (Applying Lyra styles to custom component)`);
          if (!isDryRun) {
            let content = fs.readFileSync(targetFilePath, 'utf8');
            // Replace Nova classes with Lyra classes in HlmDialogContent
            // Nova: 'bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 ring-foreground/10 grid max-w-[calc(100%-2rem)] gap-4 rounded-xl p-4 text-sm ring-1 duration-100 relative mx-auto w-full outline-none sm:mx-0'
            // Lyra: 'bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 ring-foreground/10 grid max-w-[calc(100%-2rem)] gap-4 rounded-none p-4 text-xs/relaxed ring-1 duration-100 relative mx-auto w-full outline-none sm:mx-0'
            const updated = content.replace(
              /rounded-xl p-4 text-sm ring-1 duration-100/,
              'rounded-none p-4 text-xs/relaxed ring-1 duration-100'
            );
            if (updated !== content) {
              fs.writeFileSync(targetFilePath, updated, 'utf8');
              console.log(`  -> Successfully updated ${targetFilePath} with Lyra classes.`);
              modifiedCount++;
            } else {
              console.log(`  -> Warning: Pattern not found in ${targetFilePath}`);
            }
          }
          continue;
        }
      }

      const templateContent = fs.readFileSync(path.join(cliLibDir, templateFile), 'utf8');
      const substituted = templateContent.replace(/<%-\s*importAlias\s*%>/g, '@spartan-ng/hel');
      const transformed = await transformStyle(substituted, { styleMap });

      // Check if file exists and whether content changed
      const existingContent = fs.existsSync(targetFilePath) ? fs.readFileSync(targetFilePath, 'utf8') : null;

      // Normalize line endings for comparison
      const normExisting = existingContent ? existingContent.replace(/\r\n/g, '\n') : null;
      const normTransformed = transformed.replace(/\r\n/g, '\n');

      if (normExisting === normTransformed) {
        console.log(`[UNCHANGED] ${lib}/${targetFileName}`);
      } else {
        console.log(`[UPDATE] ${lib}/${targetFileName}`);
        if (!isDryRun) {
          // Write with CRLF or LF consistent with existing if exists, else LF
          const finalContent = existingContent && existingContent.includes('\r\n')
            ? normTransformed.replace(/\n/g, '\r\n')
            : normTransformed;
          fs.writeFileSync(targetFilePath, finalContent, 'utf8');
        }
        modifiedCount++;
      }
    }
  }

  console.log(`\nDone! Total modified files: ${modifiedCount}`);
}

main().catch(err => {
  console.error('Error during transformation:', err);
  process.exit(1);
});
