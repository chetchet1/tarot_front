// 카드 뒷면 기본 이미지를 위한 임시 파일
// 실제로는 public/images/card-back.jpg 파일을 준비해야 합니다.

export const CARD_BACK_BASE64 = 'data:image/svg+xml;base64,' + btoa(`
<svg width="200" height="300" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
    <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M0 20 L20 0 L40 20 L20 40 Z" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="200" height="300" fill="url(#bg)" rx="12"/>
  <rect width="200" height="300" fill="url(#pattern)" rx="12"/>
  <text x="100" y="150" text-anchor="middle" fill="white" font-size="24" font-weight="bold" opacity="0.5">TAROT</text>
</svg>
`);
