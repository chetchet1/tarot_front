import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// ES 모듈에서 __dirname 얻기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Android 아이콘 크기 정의
const androidSizes = [
  { name: 'mipmap-mdpi', size: 48 },
  { name: 'mipmap-hdpi', size: 72 },
  { name: 'mipmap-xhdpi', size: 96 },
  { name: 'mipmap-xxhdpi', size: 144 },
  { name: 'mipmap-xxxhdpi', size: 192 }
];

// iOS 아이콘 크기 정의 (향후 iOS 지원시 사용)
const iosSizes = [
  { name: 'icon-20', size: 20 },
  { name: 'icon-20@2x', size: 40 },
  { name: 'icon-20@3x', size: 60 },
  { name: 'icon-29', size: 29 },
  { name: 'icon-29@2x', size: 58 },
  { name: 'icon-29@3x', size: 87 },
  { name: 'icon-40', size: 40 },
  { name: 'icon-40@2x', size: 80 },
  { name: 'icon-40@3x', size: 120 },
  { name: 'icon-60@2x', size: 120 },
  { name: 'icon-60@3x', size: 180 },
  { name: 'icon-76', size: 76 },
  { name: 'icon-76@2x', size: 152 },
  { name: 'icon-83.5@2x', size: 167 },
  { name: 'icon-1024', size: 1024 }
];

async function generateIcons() {
  const sourceIcon = path.join(__dirname, 'public', 'tarot-garden-icon.png');
  
  // 소스 아이콘이 없으면 안내
  if (!fs.existsSync(sourceIcon)) {
    console.error(`
❌ 소스 아이콘 파일이 없습니다!
   
📁 다음 위치에 1024x1024 PNG 파일을 추가해주세요:
   ${sourceIcon}
   
💡 타로의 정원 테마 아이디어:
   - 신비로운 보라색/남색 배경
   - 타로 카드 실루엣
   - 별, 달, 태양 등의 천체 요소
   - 정원의 꽃이나 나무 요소
   - 신비로운 문양이나 패턴
`);
    return;
  }

  console.log('🎨 타로의 정원 앱 아이콘 생성 시작...\n');

  // Android 아이콘 생성
  for (const config of androidSizes) {
    const outputDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', config.name);
    await fs.ensureDir(outputDir);

    const outputPath = path.join(outputDir, 'ic_launcher.png');
    const roundOutputPath = path.join(outputDir, 'ic_launcher_round.png');

    try {
      // 일반 아이콘
      await sharp(sourceIcon)
        .resize(config.size, config.size)
        .png()
        .toFile(outputPath);

      // 라운드 아이콘 (원형 마스크 적용)
      const roundedBuffer = await sharp(sourceIcon)
        .resize(config.size, config.size)
        .composite([{
          input: Buffer.from(
            `<svg width="${config.size}" height="${config.size}">
              <circle cx="${config.size/2}" cy="${config.size/2}" r="${config.size/2}" fill="white"/>
            </svg>`
          ),
          blend: 'dest-in'
        }])
        .png()
        .toBuffer();

      await sharp(roundedBuffer)
        .png()
        .toFile(roundOutputPath);

      console.log(`✅ ${config.name}: ${config.size}x${config.size} 생성 완료`);
    } catch (error) {
      console.error(`❌ ${config.name} 생성 실패:`, error.message);
    }
  }

  // Adaptive Icon 생성 (Android 8.0+)
  console.log('\n🎯 Adaptive Icon 생성 중...');
  
  const adaptiveSizes = [
    { name: 'mipmap-hdpi', size: 162 },
    { name: 'mipmap-mdpi', size: 108 },
    { name: 'mipmap-xhdpi', size: 216 },
    { name: 'mipmap-xxhdpi', size: 324 },
    { name: 'mipmap-xxxhdpi', size: 432 }
  ];

  for (const config of adaptiveSizes) {
    const outputDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', config.name);
    const foregroundPath = path.join(outputDir, 'ic_launcher_foreground.png');

    try {
      // Foreground 이미지 (108dp 중 72dp 영역에 콘텐츠)
      await sharp(sourceIcon)
        .resize(Math.round(config.size * 0.67), Math.round(config.size * 0.67))
        .extend({
          top: Math.round(config.size * 0.165),
          bottom: Math.round(config.size * 0.165),
          left: Math.round(config.size * 0.165),
          right: Math.round(config.size * 0.165),
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(foregroundPath);

      console.log(`✅ ${config.name} Adaptive Icon 생성 완료`);
    } catch (error) {
      console.error(`❌ ${config.name} Adaptive Icon 생성 실패:`, error.message);
    }
  }

  // Web 아이콘 생성
  console.log('\n🌐 Web 아이콘 생성 중...');
  
  const webSizes = [192, 512];
  for (const size of webSizes) {
    const outputPath = path.join(__dirname, 'public', `icon-${size}.png`);
    
    try {
      await sharp(sourceIcon)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Web icon ${size}x${size} 생성 완료`);
    } catch (error) {
      console.error(`❌ Web icon ${size}x${size} 생성 실패:`, error.message);
    }
  }

  // favicon 생성
  try {
    await sharp(sourceIcon)
      .resize(32, 32)
      .toFile(path.join(__dirname, 'public', 'favicon.ico'));
    console.log('✅ Favicon 생성 완료');
  } catch (error) {
    console.error('❌ Favicon 생성 실패:', error.message);
  }

  console.log('\n✨ 아이콘 생성 완료!');
  console.log('📱 Android Studio에서 앱을 다시 빌드해주세요.');
}

// 실행
generateIcons().catch(console.error);
