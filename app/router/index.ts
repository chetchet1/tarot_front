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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 네비게이션 가드
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  console.log('🚜 라우팅:', from.path, '->', to.path);
  
  // store를 동적으로 import
  const { useUserStore } = await import('../store/user');
  const userStore = useUserStore();
  
  // 초기화가 안 되었으면 초기화 실행
  if (!userStore.isInitialized) {
    console.log('🔄 userStore 초기화 필요');
    await userStore.initializeUser();
  }
  
  // 인증이 필요한 페이지
  if (to.meta.requiresAuth) {
    console.log('🔐 인증 필요 페이지:', to.path);
    
    // 로딩 중이면 대기
    if (userStore.isLoading) {
      console.log('⏳ 로딩 대기 중...');
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
    console.log('👤 사용자 상태:', userStore.currentUser ? (
      userStore.currentUser.isAnonymous ? '익명' : '로그인'
    ) : '없음');
    
    // 사용자가 없으면 홈으로
    if (!userStore.currentUser) {
      console.log('⛔ 사용자 없음 - 홈으로 리다이렉트');
      next({ name: 'Home' });
      return;
    }
  }
  
  console.log('✅ 라우팅 허용');
  next();
});

export default router;
