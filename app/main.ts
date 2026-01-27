import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './styles/main.scss';
import { NativeUtils } from './utils/capacitor';
import { initializeAdMob } from './services/admob';
import { initializeSubscription } from './services/purchasesWeb';
import { Platform } from './utils/platform';
import { setupDeepLinks } from './utils/deepLinks';
import { adService } from './services/AdService';
import { checkPlatform, getPlatformInfo } from './utils/platformCheck';

// In-app error overlay for internal testing (enable via VITE_DEBUG_OVERLAY=true)
const DEBUG_OVERLAY_ENABLED = import.meta.env.VITE_DEBUG_OVERLAY === 'true';
let overlayEl: HTMLDivElement | null = null;
const ensureOverlay = () => {
  if (!DEBUG_OVERLAY_ENABLED) return null;
  if (overlayEl) return overlayEl;
  const el = document.createElement('div');
  el.id = 'debug-error-overlay';
  el.style.position = 'fixed';
  el.style.left = '0';
  el.style.right = '0';
  el.style.bottom = '0';
  el.style.maxHeight = '45%';
  el.style.overflow = 'auto';
  el.style.zIndex = '999999';
  el.style.background = 'rgba(0,0,0,0.85)';
  el.style.color = '#ffefef';
  el.style.fontSize = '12px';
  el.style.fontFamily = 'monospace';
  el.style.padding = '8px 10px';
  el.style.borderTop = '2px solid #ff6b6b';
  el.style.whiteSpace = 'pre-wrap';
  el.style.pointerEvents = 'auto';
  el.innerText = 'Debug overlay enabled\n';
  document.body.appendChild(el);
  overlayEl = el;
  return el;
};
const appendOverlay = (label: string, value: unknown) => {
  const el = ensureOverlay();
  if (!el) return;
  const msg = value instanceof Error ? `${value.message}\n${value.stack || ''}` : String(value);
  el.innerText += `\n[${new Date().toISOString()}] ${label}\n${msg}\n`;
  el.scrollTop = el.scrollHeight;
};

// 플랫폼 체크 (웹 접속 차단)
const isBlocked = checkPlatform();
if (isBlocked) {
  // 웹에서 접속이 차단된 경우 더 이상 진행하지 않음
  console.log('🚫 앱 초기화 중단 - 웹 접속 차단됨');
  
  // 디버그 모드에서 플랫폼 정보 출력
  if (import.meta.env.VITE_DEBUG_MODE === 'true') {
    console.log('플랫폼 정보:', getPlatformInfo());
  }
  
  // 앱 초기화를 중단하고 종료
  const err = new Error('Web access blocked - Mobile only app');
  appendOverlay('Blocked platform', err);
  throw err;
}

// Capacitor 초기화
NativeUtils.initializeApp();

// 딥링크 설정 (모바일에서 OAuth 콜백 처리)
setupDeepLinks();

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);

// 전역 오류 핸들러 추가
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Error Handler]', err);
  console.error('[Vue Error Info]', info);
  console.error('[Vue Error Stack]', err.stack);
  appendOverlay(`Vue error: ${info}`, err);
};

// 경고 핸들러 추가
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('[Vue Warning]', msg);
  console.warn('[Vue Warning Trace]', trace);
  appendOverlay('Vue warning', `${msg}\n${trace || ''}`);
};

app.mount('#app');

// Global JS errors (internal testing)
if (DEBUG_OVERLAY_ENABLED) {
  window.addEventListener('error', (event) => {
    appendOverlay('Window error', event.error || event.message);
  });
  window.addEventListener('unhandledrejection', (event) => {
    appendOverlay('Unhandled rejection', event.reason || event);
  });
}

// Store 초기화는 마운트 후에 실행
import { useUserStore } from './store/user';
import { useTarotStore } from './store/tarot';
import { initializeAdManager } from './services/adManagerSingleton';

const userStore = useUserStore();
const tarotStore = useTarotStore();

// AdManager에 userStore 주입
initializeAdManager(() => userStore);

// 앱 초기화 함수
const initializeApp = async () => {
  try {
    console.log('🚀 앱 초기화 시작...');
    
    // 1. 사용자 데이터 초기화 (비동기로 실행 - UI 블록킹 방지)
    userStore.initializeUser().catch(error => {
      console.error('사용자 초기화 실패:', error);
    });
    
    // 2. 타로 데이터 초기화 (비동기로 실행)
    tarotStore.initialize().catch(error => {
      console.error('타로 데이터 초기화 실패:', error);
    });
    
    // 3. 광고 서비스 초기화 (즉시 실행 - 모바일에서 빠른 초기화를 위해)
    // 무료 사용자만 광고 초기화
    if (!userStore.isPremium) {
      console.log('📺 광고 서비스 초기화 시작...');
      initializeAdMob().then(async () => {
        console.log('📺 광고 서비스 초기화 완료');
        
        // 광고 프리로드 시작 (백그라운드에서 진행)
        console.log('🚀 광고 프리로드 시작...');
        await adService.preloadAd();
        console.log('✅ 광고 프리로드 요청 완료');
      }).catch(error => {
        console.error('광고 서비스 초기화 실패:', error);
        // 초기화 실패 시 재시도
        setTimeout(async () => {
          try {
            console.log('📺 광고 서비스 재초기화 시도...');
            await initializeAdMob();
            console.log('📺 광고 서비스 재초기화 성공');
            
            // 재초기화 성공 시에도 프리로드 시도
            console.log('🚀 광고 프리로드 시작 (재시도)...');
            await adService.preloadAd();
            console.log('✅ 광고 프리로드 요청 완료 (재시도)');
          } catch (retryError) {
            console.error('광고 서비스 재초기화 실패:', retryError);
          }
        }, 3000);
      });
    }
    
    // 4. 구독 서비스 초기화 (비동기로 실행)
    setTimeout(async () => {
      try {
        console.log('💳 구독 서비스 초기화...');
        await initializeSubscription();
      } catch (error) {
        console.error('구독 서비스 초기화 실패:', error);
      }
    }, 2000);
    
    console.log('✅ 앱 초기화 시작 완료 (백그라운드 작업 계속)');
    
    // 5. 개발 모드에서 Supabase 설정 확인 및 수동 테스트 함수 노출
    if (import.meta.env.DEV) {
      setTimeout(async () => {
        try {
          const { checkSupabaseSetup } = await import('./utils/checkSupabaseSetup');
          await checkSupabaseSetup();
          
          // Edge Function 테스트 함수를 수동 테스트용으로 노출
          const { testEdgeFunction } = await import('./utils/testEdgeFunction');
          (window as any).testEdgeFunction = testEdgeFunction;
          console.log('🔧 수동 Edge Function 테스트: window.testEdgeFunction()');
        } catch (error) {
          console.error('Supabase 설정 확인 실패:', error);
        }
      }, 3000);
    }
  } catch (error) {
    console.error('❌ 앱 초기화 실패:', error);
    // 초기화 실패해도 앱은 계속 동작하도록
  }
};

// 앱 초기화 실행 (비동기 - UI 블록킹 방지)
initializeApp();

// Service Worker 완전 제거 (모든 환경)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // 1. 기존 Service Worker 모두 제거
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`🔍 발견된 Service Worker: ${registrations.length}개`);
      
      for (const registration of registrations) {
        const success = await registration.unregister();
        console.log(`🗑️ Service Worker 제거 ${success ? '성공' : '실패'}: ${registration.scope}`);
      }
      
      // 2. 모든 캐시 삭제
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log(`🔍 발견된 캐시: ${cacheNames.length}개`);
        
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
          console.log(`🗑️ 캐시 삭제됨: ${cacheName}`);
        }
      }
      
      // 3. 제거용 Service Worker 등록 (한 번만)
      if (registrations.length > 0) {
        console.log('🧹 제거용 Service Worker 등록 중...');
        const reg = await navigator.serviceWorker.register('/sw-remove.js', {
          scope: '/',
          updateViaCache: 'none'
        });
        
        // 잠시 후 자동 제거됨
        setTimeout(() => {
          console.log('✅ Service Worker 정리 완료');
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Service Worker 제거 중 오류:', error);
    }
  });
}

// 프로덕션 환경에서만 PWA Service Worker 등록 (나중에 활성화)
// if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then(registration => {
//         console.log('✅ Service Worker 등록 성공:', registration.scope);
//       })
//       .catch(error => {
//         console.error('❌ Service Worker 등록 실패:', error);
//       });
//   });
// }
