import fs from 'fs';
import path from 'path';

const newSdkVersion = process.argv[2];
if (!newSdkVersion) {
  console.error('Error: Please provide the new SDK version as an argument.');
  console.log('Usage: node scripts/update-sdk-version.js <version>');
  process.exit(1);
}

const variablesGradlePath = path.resolve(process.cwd(), 'android/variables.gradle');

try {
  let content = fs.readFileSync(variablesGradlePath, 'utf-8');
  
  // Update targetSdkVersion
  const targetSdkRegex = /(targetSdkVersion\s*=\s*)(\d+)/;
  if (!targetSdkRegex.test(content)) {
    throw new Error(`'targetSdkVersion' not found in ${variablesGradlePath}`);
  }
  content = content.replace(targetSdkRegex, `$1${newSdkVersion}`);
  console.log(`Updated targetSdkVersion to ${newSdkVersion}.`);

  // Also update compileSdkVersion to match, which is best practice
  const compileSdkRegex = /(compileSdkVersion\s*=\s*)(\d+)/;
   if (compileSdkRegex.test(content)) {
    content = content.replace(compileSdkRegex, `$1${newSdkVersion}`);
    console.log(`Updated compileSdkVersion to ${newSdkVersion}.`);
  } else {
    console.warn(`'compileSdkVersion' not found. It's recommended to keep it in sync with targetSdkVersion.`);
  }

  fs.writeFileSync(variablesGradlePath, content, 'utf-8');
  console.log(`✅ Successfully updated SDK versions in ${variablesGradlePath}`);

} catch (error) {
  console.error(`Failed to update SDK version: ${error.message}`);
  process.exit(1);
}
