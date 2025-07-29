import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../store/user';

// Views
import Home from '../views/Home.vue';
import MainApp from '../views/MainApp.vue';
import ReadingSelect from '../views/ReadingSelect.vue';
import CardDrawing from '../views/CardDrawing.vue';
import ReadingResult from '../views/ReadingResult.vue';
import Premium from '../views/Premium.vue';
import History from '../views/History.vue';
import TarotDictionary from '../views/TarotDictionary.vue';
import AuthCallback from '../components/AuthCallback.vue';

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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 네비게이션 가드
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  
  // 인증이 필요한 페이지
  if (to.meta.requiresAuth) {
    // 로딩 중이면 대기
    if (userStore.isLoading) {
      await new Promise(resolve => {
        const unwatch = userStore.$subscribe((mutation, state) => {
          if (!state.isLoading) {
            unwatch();
            resolve(undefined);
          }
        });
      });
    }
    
    // 로그인 상태 확인
    if (!userStore.isLoggedIn) {
      // 홈으로 리다이렉트
      next({ name: 'Home' });
      return;
    }
  }
  
  next();
});

export default router;
