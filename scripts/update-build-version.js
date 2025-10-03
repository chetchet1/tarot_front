#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// version.properties 파일 읽기
const versionPropsPath = path.join(__dirname, '../android/version.properties');
const mainAppPath = path.join(__dirname, '../app/views/MainApp.vue');

// dev 빌드 버전 표기 시작점 (VERSION_CODE 기준)
const DEV_VERSION_BASE = 125;

try {
  // version.properties에서 VERSION_CODE 추출
  const versionProps = fs.readFileSync(versionPropsPath, 'utf8');
  const versionMatch = versionProps.match(/VERSION_CODE=(\d+)/);
  
  if (versionMatch) {
    const versionCode = parseInt(versionMatch[1], 10);
    const devBuildNumber = Math.max(1, versionCode - DEV_VERSION_BASE);
    const displayVersion = `dev-${devBuildNumber}`;
    console.log(`빌드 버전: ${versionCode} (표시용: ${displayVersion})`);
    
    // MainApp.vue 파일 읽기
    let mainAppContent = fs.readFileSync(mainAppPath, 'utf8');
    
    // buildVersion 업데이트 (dev-x 형태)
    const regex = /const buildVersion = ref\(['\"][^'\"]+['\"]\)/;
    mainAppContent = mainAppContent.replace(regex, `const buildVersion = ref('${displayVersion}')`);
    
    // 파일 쓰기
    fs.writeFileSync(mainAppPath, mainAppContent, 'utf8');
    console.log(`MainApp.vue의 buildVersion을 ${displayVersion}(으)로 업데이트했습니다.`);
  } else {
    console.error('VERSION_CODE를 찾을 수 없습니다.');
  }
} catch (error) {
  console.error('버전 업데이트 실패:', error);
  process.exit(1);
}
