//@ts-check
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const patchesPath = resolve('./patches');
const nodeModulesPath = resolve('./node_modules');

/** @param {string} path */
function readRecursively(path) {
  readdirSync(path).forEach((filePath) => {
    const fullPath = `${path}/${filePath}`;
    const relativeNodeModulesPath = `${nodeModulesPath}/${fullPath.replace(patchesPath, '')}`;

    if (statSync(fullPath).isDirectory()) {
      readRecursively(fullPath);
    } else if (!filePath.endsWith('apply-patches.js')) {
      writeFileSync(relativeNodeModulesPath, readFileSync(fullPath));
      console.log(`Patched ${relativeNodeModulesPath}`);
    }
  });
}

readRecursively(patchesPath);
