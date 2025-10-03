#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionPropsPath = path.join(__dirname, '../android/version.properties');
const mainAppPath = path.join(__dirname, '../app/views/MainApp.vue');

const MIN_BUILD_NUMBER = 1;
const DEV_MARKER_KEY = 'DEV_BUILD_TRACK';
const DEV_MARKER_VALUE = 'dev';

function ensureVersionFile(targetPath) {
  if (!fs.existsSync(targetPath)) {
    fs.writeFileSync(
      targetPath,
      `${DEV_MARKER_KEY}=${DEV_MARKER_VALUE}\nVERSION_CODE=${MIN_BUILD_NUMBER - 1}\n`,
      'utf8'
    );
  }
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
  ensureVersionFile(versionPropsPath);
  let versionProps = fs.readFileSync(versionPropsPath, 'utf8');

  const hasDevMarker = new RegExp(`^${DEV_MARKER_KEY}=${DEV_MARKER_VALUE}$`, 'm').test(versionProps);
  const versionMatch = versionProps.match(/VERSION_CODE=(\d+)/);
  let previousVersion = versionMatch ? parseInt(versionMatch[1], 10) : MIN_BUILD_NUMBER - 1;

  if (!hasDevMarker) {
    console.log('Switching version.properties to dev build sequence.');
    previousVersion = MIN_BUILD_NUMBER - 1;
    versionProps = upsertProperty(versionProps, DEV_MARKER_KEY, DEV_MARKER_VALUE);
  }

  const nextVersion = Math.max(MIN_BUILD_NUMBER, previousVersion + 1);
  const displayVersion = `dev-${nextVersion}`;

  versionProps = upsertProperty(versionProps, 'VERSION_CODE', nextVersion);
  fs.writeFileSync(versionPropsPath, versionProps, 'utf8');

  let mainAppContent = fs.readFileSync(mainAppPath, 'utf8');
  const buildVersionRegex = /const buildVersion = ref\(['"][^'"]+['"]\)/;

  if (!buildVersionRegex.test(mainAppContent)) {
    throw new Error('buildVersion declaration not found in MainApp.vue');
  }

  mainAppContent = mainAppContent.replace(
    buildVersionRegex,
    `const buildVersion = ref('${displayVersion}')`
  );
  fs.writeFileSync(mainAppPath, mainAppContent, 'utf8');

  console.log(`빌드 버전: ${nextVersion} (표시용: ${displayVersion})`);
  console.log(`MainApp.vue의 buildVersion을 ${displayVersion}(으)로 업데이트했습니다.`);
} catch (error) {
  console.error('버전 업데이트 실패:', error);
  process.exit(1);
}
