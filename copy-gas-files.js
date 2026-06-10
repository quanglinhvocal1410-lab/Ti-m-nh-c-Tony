import fs from 'fs';
import path from 'path';

const filesToCopy = ['Code.gs', 'appsscript.json'];
const destDir = 'dist';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir);
}

filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(destDir, file));
    console.log(`Copied ${file} to ${destDir}/`);
  } else {
    console.warn(`Warning: ${file} not found.`);
  }
});
