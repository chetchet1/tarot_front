#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// version.properties 파일 읽기
const versionPropsPath = path.join(__dirname, '../android/version.properties');
const mainAppPath = path.join(__dirname, '../app/views/MainApp.vue');

try {
  // version.properties에서 VERSION_CODE 추출
  const versionProps = fs.readFileSync(versionPropsPath, 'utf8');
  const versionMatch = versionProps.match(/VERSION_CODE=(\d+)/);
  
  if (versionMatch) {
    const versionCode = versionMatch[1];
    console.log(`빌드 버전: ${versionCode}`);
    
    // MainApp.vue 파일 읽기
    let mainAppContent = fs.readFileSync(mainAppPath, 'utf8');
    
    // buildVersion 업데이트
    const regex = /const buildVersion = ref\(['"](\d+)['"]\)/;
    mainAppContent = mainAppContent.replace(regex, `const buildVersion = ref('${versionCode}')`);
    
    // 파일 저장
    fs.writeFileSync(mainAppPath, mainAppContent, 'utf8');
    console.log(`MainApp.vue의 buildVersion을 ${versionCode}로 업데이트했습니다.`);
  } else {
    console.error('VERSION_CODE를 찾을 수 없습니다.');
  }
} catch (error) {
  console.error('버전 업데이트 실패:', error);
  process.exit(1);
}