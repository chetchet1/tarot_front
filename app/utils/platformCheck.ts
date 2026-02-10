/**
 * 플랫폼 체크 유틸리티
 * 프로덕션 환경에서 웹 접속을 차단하고 모바일만 허용
 */

import { Capacitor } from '@capacitor/core';

/**
 * 플랫폼 체크 설정
 */
interface PlatformCheckConfig {
  enabled: boolean;
  message: string;
  allowedPaths?: string[]; // 허용된 경로 (공유 페이지 등)
}

/**
 * 환경 변수에서 플랫폼 체크 설정 가져오기
 */
function getPlatformCheckConfig(): PlatformCheckConfig {
  return {
    enabled: import.meta.env.VITE_PLATFORM_CHECK_ENABLED === 'true',
    message: import.meta.env.VITE_PLATFORM_CHECK_MESSAGE || '이 앱은 모바일 기기에서만 이용 가능합니다.',
    allowedPaths: ['/s/', '/download', '/auth/callback'] // 공유 페이지, 다운로드, 인증 콜백은 웹에서도 접속 가능
  };
}

/**
 * 현재 경로가 허용된 경로인지 확인
 */
function isAllowedPath(allowedPaths: string[] = []): boolean {
  const currentPath = window.location.pathname;
  const alwaysAllowedPaths = ['/auth/email-verified', '/auth/reset-password', '/oauth-bridge'];

  // Supabase Auth can redirect to the Site URL root (`/`) and put tokens in query/hash.
  // If we block at this stage, the router can't redirect to the proper page.
  if (currentPath === '/') {
    const hay = `${window.location.search || ''}${window.location.hash || ''}`;
    const hasAuthTokens =
      /(^|[?#&])type=recovery(&|$)/i.test(hay) ||
      /(^|[?#&])type=signup(&|$)/i.test(hay) ||
      /(^|[#&])access_token=/.test(hay) ||
      /(^|[#&])refresh_token=/.test(hay) ||
      /(^|[?#&])token_hash=/.test(hay) ||
      /(^|[?#&])code=/.test(hay);
    if (hasAuthTokens) return true;
  }

  return [...allowedPaths, ...alwaysAllowedPaths].some(path => currentPath.startsWith(path));
}

/**
 * 웹 접속 차단 화면 표시
 */
function showBlockedScreen(message: string): void {
  const style = document.createElement('style');
  style.textContent = `
    .platform-blocked {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    
    .platform-blocked-content {
      text-align: center;
      padding: 2rem;
      max-width: 500px;
    }
    
    .platform-blocked-icon {
      font-size: 72px;
      margin-bottom: 1rem;
    }
    
    .platform-blocked-title {
      color: white;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    
    .platform-blocked-message {
      color: rgba(255, 255, 255, 0.8);
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    
    .platform-blocked-info {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      margin-top: 2rem;
    }
    
    .platform-blocked-info h3 {
      color: white;
      font-size: 18px;
      margin-bottom: 1rem;
    }
    
    .platform-blocked-stores {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 1rem;
    }
    
    .store-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      color: white;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .store-button:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }
    
    .debug-info {
      position: absolute;
      bottom: 20px;
      right: 20px;
      color: rgba(255, 255, 255, 0.4);
      font-size: 12px;
      font-family: monospace;
    }
  `;
  document.head.appendChild(style);

  const blockedHtml = `
    <div class="platform-blocked">
      <div class="platform-blocked-content">
        <div class="platform-blocked-icon">📱</div>
        <h1 class="platform-blocked-title">모바일 전용 앱</h1>
        <p class="platform-blocked-message">${message}</p>
        
        <div class="platform-blocked-info">
          <h3>앱 다운로드</h3>
          <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin-bottom: 1rem;">
            모바일 기기에서 아래 스토어를 통해 앱을 다운로드하세요.
          </p>
          <div class="platform-blocked-stores">
            <a href="#" class="store-button">
              🍎 App Store
            </a>
            <a href="#" class="store-button">
              🤖 Google Play
            </a>
          </div>
        </div>
      </div>
      ${import.meta.env.VITE_DEBUG_MODE === 'true' ? `
        <div class="debug-info">
          Platform: ${Capacitor.getPlatform()}<br>
          Native: ${Capacitor.isNativePlatform()}<br>
          Path: ${window.location.pathname}
        </div>
      ` : ''}
    </div>
  `;

  document.body.innerHTML = blockedHtml;
}

/**
 * 플랫폼 체크 실행
 * @returns true면 접속 차단, false면 접속 허용
 */
export function checkPlatform(): boolean {
  const config = getPlatformCheckConfig();
  
  // 플랫폼 체크가 비활성화된 경우 (개발 환경)
  if (!config.enabled) {
    console.log('🔓 플랫폼 체크 비활성화 (개발 환경)');
    return false;
  }
  
  // 허용된 경로인 경우 (공유 페이지 등)
  if (isAllowedPath(config.allowedPaths)) {
    console.log(`🔓 허용된 경로: ${window.location.pathname}`);
    return false;
  }
  
  // 네이티브 플랫폼인 경우 (모바일 앱)
  if (Capacitor.isNativePlatform()) {
    console.log('✅ 네이티브 플랫폼 접속 허용');
    return false;
  }
  
  // 웹 브라우저인 경우
  console.log('🚫 웹 브라우저 접속 차단');
  showBlockedScreen(config.message);
  return true;
}

/**
 * 플랫폼 정보 가져오기 (디버깅용)
 */
export function getPlatformInfo() {
  return {
    platform: Capacitor.getPlatform(),
    isNative: Capacitor.isNativePlatform(),
    isWeb: !Capacitor.isNativePlatform(),
    userAgent: navigator.userAgent,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  };
}
