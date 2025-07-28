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

const userStore = useUserStore();
const tarotStore = useTarotStore();

// 앱 초기화 함수
const initializeApp = async () => {
  try {
    console.log('🚀 앱 초기화 시작...');
    
    // 1. 사용자 데이터 초기화
    await userStore.initializeUser();
    
    // 2. 타로 데이터 초기화
    await tarotStore.initialize();
    
    // 3. 광고 서비스 초기화 (무료 사용자용)
    if (!userStore.isPremium) {
      console.log('📺 광고 서비스 초기화...');
      await initializeAdMob();
    }
    
    // 4. 구독 서비스 초기화
    console.log('💳 구독 서비스 초기화...');
    await initializeSubscription();
    
    console.log('✅ 앱 초기화 완료');
  } catch (error) {
    console.error('❌ 앱 초기화 실패:', error);
    // 초기화 실패해도 앱은 계속 동작하도록
  }
};

// 앱 초기화 실행
initializeApp();
