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

// PWA Service Worker 등록
if ('serviceWorker' in navigator && !window.matchMedia('(display-mode: standalone)').matches) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker 등록 성공:', registration.scope);
      })
      .catch(error => {
        console.error('❌ Service Worker 등록 실패:', error);
      });
  });
}
