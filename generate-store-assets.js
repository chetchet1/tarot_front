const fs = require('fs');
const path = require('path');

// 앱 아이콘 생성 (512x512)
function generateIcon() {
    const iconPath = path.join(__dirname, 'public', 'icon-512x512.png');
    
    // 이미 있으면 스킵
    if (fs.existsSync(iconPath)) {
        console.log('✅ icon-512x512.png already exists');
        return;
    }
    
    // Android 리소스에서 가장 큰 아이콘 찾기
    const androidIconPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', 'mipmap-xxxhdpi', 'ic_launcher.webp');
    
    if (fs.existsSync(androidIconPath)) {
        // WebP를 PNG로 변환해야 하는데, 일단 대체 아이콘 생성
        console.log('⚠️ Android icon found but is WebP format. Creating placeholder.');
    }
    
    // 기존 아이콘이 있는지 확인
    const existingIcon = path.join(__dirname, 'public', 'tarot-garden-icon.png');
    if (fs.existsSync(existingIcon)) {
        fs.copyFileSync(existingIcon, iconPath);
        console.log('✅ Copied tarot-garden-icon.png to icon-512x512.png');
    } else {
        console.log('⚠️ No suitable icon found. Please add icon-512x512.png manually.');
    }
}

// Google Play 배지 SVG 생성
function generatePlayBadge() {
    const badgePath = path.join(__dirname, 'public', 'assets', 'google-play-badge.svg');
    
    // assets 폴더 생성
    const assetsDir = path.join(__dirname, 'public', 'assets');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    // 이미 있으면 스킵
    if (fs.existsSync(badgePath)) {
        console.log('✅ google-play-badge.svg already exists');
        return;
    }
    
    const svgContent = `<svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="60" rx="8" fill="#000000"/>
    <g transform="translate(20, 15)">
        <!-- Play Store Icon Simplified -->
        <path d="M0 5L15 15L0 25V5Z" fill="#48ff48" opacity="0.9"/>
        <path d="M15 15L20 12L25 15L20 18L15 15Z" fill="#ffD400" opacity="0.9"/>
        <path d="M0 25L15 15L20 18L0 30V25Z" fill="#00d4ff" opacity="0.9"/>
        <path d="M0 5L15 15L20 12L0 0V5Z" fill="#ff4848" opacity="0.9"/>
    </g>
    <text x="55" y="25" fill="white" font-family="Arial, sans-serif" font-size="11">다음에서 다운로드</text>
    <text x="55" y="42" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Google Play</text>
</svg>`;
    
    fs.writeFileSync(badgePath, svgContent);
    console.log('✅ Created google-play-badge.svg');
}

// 실행
generateIcon();
generatePlayBadge();

console.log('\n📱 App store assets generated successfully!');
