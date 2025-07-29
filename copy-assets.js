import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  const assetsDir = path.join(__dirname, 'assets');
  const publicAssetsDir = path.join(__dirname, 'public', 'assets');
  
  console.log('Copying assets from', assetsDir, 'to', publicAssetsDir);
  
  if (fs.existsSync(assetsDir)) {
    copyDir(assetsDir, publicAssetsDir);
    console.log('✅ Assets copied successfully!');
  } else {
    console.log('❌ Assets directory not found:', assetsDir);
  }
} catch (error) {
  console.error('❌ Error copying assets:', error.message);
  process.exit(1);
}