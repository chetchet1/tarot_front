/**
 * 플랫폼 감지 유틸리티
 */

export interface PlatformInfo {
  isAndroid: boolean;
  isIOS: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  isInApp: boolean; // 앱 내부 WebView인지
  isCapacitor: boolean; // Capacitor 환경인지
}

export function detectPlatform(): PlatformInfo {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Capacitor 환경 체크 - 더 엄격하게 체크
  const capacitorWindow = window as any;
  const isCapacitor = !!(
    capacitorWindow.Capacitor && 
    capacitorWindow.Capacitor.isNativePlatform && 
    capacitorWindow.Capacitor.isNativePlatform()
  );
  
  // Android 체크
  const isAndroid = /android/i.test(userAgent);
  
  // iOS 체크
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  
  // 모바일 체크
  const isMobile = isAndroid || isIOS || /webOS|BlackBerry|Windows Phone/i.test(userAgent);
  
  // 데스크톱 체크
  const isDesktop = !isMobile;
  
  // 앱 내부 WebView 체크 (Capacitor 환경이면 앱 내부)
  const isInApp = isCapacitor;
  
  console.log('🔍 Platform detection:', {
    isCapacitor,
    isInApp,
    userAgent: userAgent.substring(0, 50) + '...',
    hasCapacitorObj: !!(capacitorWindow.Capacitor),
    isNativePlatform: capacitorWindow.Capacitor?.isNativePlatform?.()
  });
  
  return {
    isAndroid,
    isIOS,
    isMobile,
    isDesktop,
    isInApp,
    isCapacitor
  };
}

/**
 * 앱 스토어 URL 생성
 * TODO: 앱 스토어 등록 후 실제 URL로 교체 필요
 */
export function getAppStoreUrl(): string {
  const platform = detectPlatform();
  
  // 개발 중 - 더미 URL 반환
  if (platform.isIOS) {
    // App Store URL 형식: https://apps.apple.com/app/id{APP_ID}
    return '#'; // iOS 출시 후 교체
  } else if (platform.isAndroid) {
    // Google Play Store URL 형식: https://play.google.com/store/apps/details?id={PACKAGE_NAME}
    return '#'; // Google Play 등록 후 교체
  } else {
    // 데스크톱에서는 Google Play Store로 기본 리다이렉트
    return '#';
  }
}

/**
 * 앱 설치 유도 페이지로 리다이렉트 필요 여부 체크
 */
export function shouldRedirectToAppStore(): boolean {
  const platform = detectPlatform();
  
  // 이미 앱 내부에 있으면 리다이렉트 불필요
  if (platform.isInApp || platform.isCapacitor) {
    return false;
  }
  
  // 웹브라우저에서 접속한 경우
  return true;
}

/**
 * 딥링크 URL 생성 (앱이 설치되어 있을 때 앱으로 이동)
 */
export function getDeepLinkUrl(path: string): string {
  // TODO: 실제 딥링크 스킴으로 교체 필요
  // 예: tarotgarden://share/{id}
  return `tarotgarden://${path}`;
}
