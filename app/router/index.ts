import { createRouter, createWebHistory } from 'vue-router';
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';

// Views
import Home from '../views/Home.vue';
import MainApp from '../views/MainApp.vue';
import ReadingSelect from '../views/ReadingSelect.vue';
import CardDrawing from '../views/CardDrawing.vue';
import ReadingResult from '../views/ReadingResult.vue';
import Premium from '../views/Premium.vue';
import History from '../views/History.vue';
import TarotDictionary from '../views/TarotDictionary.vue';
import AuthCallback from '../views/AuthCallback.vue';
import SharedReading from '../views/SharedReading.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/app',
    name: 'App',
    component: MainApp,
    meta: { requiresAuth: true }
  },
  {
    path: '/reading-select',
    name: 'ReadingSelect',
    component: ReadingSelect,
    meta: { requiresAuth: true }
  },
  {
    path: '/card-drawing',
    name: 'CardDrawing',
    component: CardDrawing,
    meta: { requiresAuth: true }
  },
  {
    path: '/reading-result',
    name: 'ReadingResult',
    component: ReadingResult,
    meta: { requiresAuth: true }
  },
  {
    path: '/premium',
    name: 'Premium',
    component: Premium,
    meta: { requiresAuth: true }
  },
  {
    path: '/share/:id',
    name: 'SharedReading',
    component: SharedReading,
    meta: { 
      requiresAuth: false,  // 로그인 불필요
      isPublic: true        // 공개 페이지
    }
  },
  {
    path: '/history',
    name: 'History',
    component: History,
    meta: { requiresAuth: true }
  },
  {
    path: '/card-dictionary',
    name: 'TarotDictionary',
    component: TarotDictionary,
    meta: { requiresAuth: true }
  },
  {
    path: '/dictionary',
    name: 'Dictionary',
    component: TarotDictionary,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallback,
  },
  {
    path: '/test-premium',
    name: 'TestPremium',
    component: () => import('../views/TestPremium.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/daily-card',
    name: 'DailyCard',
    component: () => import('../views/DailyCard.vue'),
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 네비게이션 가드
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  console.log('🚜 [Router Guard] 라우팅 시작:', from.path, '->', to.path);
  console.log('🚜 [Router Guard] to 정보:', {
    name: to.name,
    path: to.path,
    params: to.params,
    meta: to.meta
  });
  
  try {
    // store를 동적으로 import
    const { useUserStore } = await import('../store/user');
    const userStore = useUserStore();
    
    // CardDrawing 페이지로 가는 경우 타로 스토어 상태 확인
    if (to.name === 'CardDrawing') {
      console.log('🎴 [Router Guard] CardDrawing 페이지로 이동');
      // 타로 스토어 상태 확인
      const { useTarotStore } = await import('../store/tarot');
      const tarotStore = useTarotStore();
      
      console.log('🎴 [Router Guard] 타로 스토어 상태:', {
        selectedTopic: tarotStore.selectedTopic,
        selectedSpread: tarotStore.selectedSpread,
        hasData: !!(tarotStore.selectedTopic && tarotStore.selectedSpread)
      });
    }
    
    // 초기화가 안 되었으면 초기화 실행
    if (!userStore.isInitialized) {
      console.log('🔄 [Router Guard] userStore 초기화 필요');
      await userStore.initializeUser();
    }
    
    // 인증이 필요한 페이지
    if (to.meta.requiresAuth) {
      console.log('🔐 [Router Guard] 인증 필요 페이지:', to.path);
      
      // 로딩 중이면 대기
      if (userStore.isLoading) {
        console.log('⏳ [Router Guard] 로딩 대기 중...');
        await new Promise(resolve => {
          const unwatch = userStore.$subscribe((mutation, state) => {
            if (!state.isLoading) {
              unwatch();
              resolve(undefined);
            }
          });
        });
      }
      
      // 로그인 상태 확인 (익명 사용자도 허용)
      console.log('👤 [Router Guard] 사용자 상태:', userStore.currentUser ? (
        userStore.currentUser.isAnonymous ? '익명' : '로그인'
      ) : '없음');
      
      // 사용자가 없으면 홈으로
      if (!userStore.currentUser) {
        console.log('⛔ [Router Guard] 사용자 없음 - 홈으로 리다이렉트');
        next({ name: 'Home' });
        return;
      }
    }
    
    console.log('✅ [Router Guard] 라우팅 허용됨');
    next();
  } catch (error) {
    console.error('❌ [Router Guard] 오류 발생:', error);
    next(false); // 네비게이션 취소
  }
});

// 네비게이션 후 로그
router.afterEach((to, from) => {
  console.log('🎯 [Router AfterEach] 라우팅 완료:', from.path, '->', to.path);
  console.log('🎯 [Router AfterEach] 현재 URL:', window.location.pathname);
});

export default router;
