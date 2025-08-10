/**
 * 유료 배열 사용 카운팅 디버그 유틸리티
 * 문제: 카드 뽑기 전에 카운팅되는 문제 해결을 위한 디버그 도구
 */

// 전역 디버그 플래그
(window as any).__DEBUG_PREMIUM_SPREAD__ = true;

// 원본 함수들을 백업
let originalRecordUsage: any = null;
let originalHasUsedToday: any = null;
let callCounter = 0;

/**
 * recordPremiumSpreadUsage 함수를 가로채서 호출 추적
 */
export function interceptPremiumSpreadCalls() {
  console.log('🔴 [DEBUG] Premium Spread 디버그 모드 활성화');
  
  // 콘솔 메서드를 가로채서 추적
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  
  // 특정 패턴을 감지하여 로깅
  console.log = function(...args: any[]) {
    // recordPremiumSpreadUsage 관련 로그 감지
    const message = args.join(' ');
    if (message.includes('recordPremiumSpreadUsage') || 
        message.includes('유료 배열') ||
        message.includes('premium spread')) {
      callCounter++;
      originalConsoleError.call(console, `🔴🔴🔴 [DEBUG DETECT #${callCounter}] 유료 배열 관련 활동 감지!`);
      originalConsoleError.call(console, '🔴 메시지:', message);
      originalConsoleError.call(console, '🔴 호출 시간:', new Date().toISOString());
      originalConsoleError.call(console, '🔴 호출 스택:', new Error().stack);
      
      // 호출 위치 분석
      const stack = new Error().stack || '';
      if (stack.includes('goToResult')) {
        originalConsoleLog.call(console, '✅ 정상: goToResult에서 호출됨');
      } else if (stack.includes('startDrawing')) {
        originalConsoleError.call(console, '❌ 문제: startDrawing에서 호출됨!');
      } else if (stack.includes('confirmManualSelection')) {
        originalConsoleError.call(console, '❌ 문제: confirmManualSelection에서 호출됨!');
      } else if (stack.includes('startReading')) {
        originalConsoleError.call(console, '❌ 문제: startReading에서 호출됨!');
      }
    }
    
    // 원본 console.log 호출
    originalConsoleLog.apply(console, args);
  };
  
  // premiumSpreadService의 함수들을 모니터링
  import('../services/premium/premiumSpreadService').then(module => {
    console.log('🔴 [DEBUG] premiumSpreadService 모듈 로드됨');
    
    // 원본 함수 백업 (참조만 유지)
    originalRecordUsage = module.recordPremiumSpreadUsage;
    originalHasUsedToday = module.hasUsedPremiumSpreadToday;
    
    console.log('🔴 [DEBUG] 원본 함수 참조 저장 완료');
    console.log('🔴 [DEBUG] 주의: ES6 모듈은 직접 수정할 수 없으므로 콘솔 로그를 통해 추적합니다');
  }).catch(error => {
    console.error('🔴 [DEBUG] premiumSpreadService 로드 실패:', error);
  });
}

/**
 * AdManager의 메서드들도 가로채기
 */
export function interceptAdManager() {
  console.log('🟡 [DEBUG] AdManager 디버그 모드 활성해 실패');
  console.log('🟡 [DEBUG] AdManager 인터셉트는 ES6 모듈 문제로 비활성화됨');
  // AdManager 인터셉트는 제거 - ES6 모듈 오류 방지
  return;
}

/**
 * 디버그 모드 비활성화
 */
export function disableDebugMode() {
  console.log('🔴 [DEBUG] Premium Spread 디버그 모드 비활성화');
  (window as any).__DEBUG_PREMIUM_SPREAD__ = false;
  
  // 콘솔 복원
  if ((console as any).__originalLog) {
    console.log = (console as any).__originalLog;
  }
  if ((console as any).__originalError) {
    console.error = (console as any).__originalError;
  }
}

// 전역 객체에 디버그 함수 노출
(window as any).debugPremiumSpread = {
  start: () => {
    interceptPremiumSpreadCalls();
    interceptAdManager();
  },
  stop: disableDebugMode,
  getCallCount: () => callCounter,
  resetCallCount: () => { callCounter = 0; }
};

console.log('💡 디버그 모드를 시작하려면 콘솔에서 다음을 실행하세요:');
console.log('window.debugPremiumSpread.start()');
