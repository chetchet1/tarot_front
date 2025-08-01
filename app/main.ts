import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './styles/main.scss';
import { NativeUtils } from './utils/capacitor';
import { initializeAdMob } from './services/admob';
import { initializeSubscription } from './services/purchasesWeb';
import { Platform } from './utils/platform';

// Capacitor 초기화
NativeUtils.initializeApp();

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);

app.mount('#app');

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
    
    // 3. 광고 서비스 초기화 (비동기로 실행)
    setTimeout(async () => {
      try {
        if (!userStore.isPremium) {
          console.log('📺 광고 서비스 초기화...');
          await initializeAdMob();
        }
      } catch (error) {
        console.error('광고 서비스 초기화 실패:', error);
      }
    }, 1000);
    
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
    
    // 5. 개발 모드에서 Supabase 설정 확인
    if (import.meta.env.DEV) {
      setTimeout(async () => {
        try {
          const { checkSupabaseSetup } = await import('./utils/checkSupabaseSetup');
          await checkSupabaseSetup();
          
          // Edge Function 테스트 함수도 로드
          const { testEdgeFunction } = await import('./utils/testEdgeFunction');
          (window as any).testEdgeFunction = testEdgeFunction;
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
