#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionPropsPath = path.join(__dirname, '../android/version.properties');
const mainAppPath = path.join(__dirname, '../app/views/MainApp.vue');
const EPOCH = new Date('2024-01-01');

/**
 * Calculates the number of days since the epoch (2024-01-01).
 * @returns {number} The number of full days that have passed.
 */
function getDaysSinceEpoch() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to the start of the day
  EPOCH.setHours(0, 0, 0, 0); // Ensure epoch is also at start of day
  const diffTime = today.getTime() - EPOCH.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function upsertProperty(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  }

  const needsNewline = content.length > 0 && !content.endsWith('\n');
  return `${content}${needsNewline ? '\n' : ''}${key}=${value}\n`;
}

try {
  let versionPropsContent = '';
  try {
    versionPropsContent = fs.readFileSync(versionPropsPath, 'utf8');
  } catch (readError) {
    if (readError.code !== 'ENOENT') {
      throw readError;
    }
    // File might not exist, that's okay, we'll create it.
  }

  const versionMatch = versionPropsContent.match(/VERSION_CODE=(\d+)/);
  const currentVersionCode = versionMatch ? versionMatch[1] : '0';

  // New versioning scheme: DDDDNNNN (Days since epoch, 4-digit counter)
  const todaysBase = getDaysSinceEpoch().toString().padStart(4, '0');
  const currentBase = currentVersionCode.length === 8 ? currentVersionCode.substring(0, 4) : '';

  let newVersionCodeStr;

  if (todaysBase === currentBase) {
    // Same day, increment the counter
    const currentCounter = parseInt(currentVersionCode.substring(4), 10);
    const newCounter = currentCounter + 1;
    newVersionCodeStr = todaysBase + newCounter.toString().padStart(4, '0');
  } else {
    // New day or old format, reset counter
    // Temporary fix for 2025-11-23 to avoid version collision
    const today = new Date();
    if (today.getFullYear() === 2025 && today.getMonth() === 10 && today.getDate() === 23) {
      newVersionCodeStr = todaysBase + '0100'; // Start from 100 for today
    } else {
      newVersionCodeStr = todaysBase + '0000'; // Reset to 0 for any other new day
    }
  }

  const newVersionPropsContent = upsertProperty(
    versionPropsContent,
    'VERSION_CODE',
    newVersionCodeStr,
  );
  fs.writeFileSync(versionPropsPath, newVersionPropsContent, 'utf8');

  let mainAppContent = fs.readFileSync(mainAppPath, 'utf8');
  const regex = /const buildVersion = ref\(['"]([^'"]+)['"]\)/;
  mainAppContent = mainAppContent.replace(regex, `const buildVersion = ref('${newVersionCodeStr}')`);
  fs.writeFileSync(mainAppPath, mainAppContent, 'utf8');

  console.log(`빌드 버전 ${newVersionCodeStr}으로 업데이트 완료.`);
} catch (error) {
  console.error('버전 업데이트 실패:', error);
  process.exit(1);
}