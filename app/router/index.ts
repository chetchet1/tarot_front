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
import OAuthBridge from '../views/OAuthBridge.vue';
// Shared page components
import SharedReading from '../views/SharedReading.vue';
import AppDownload from '../views/AppDownload.vue';
import EmailVerified from '../views/EmailVerified.vue';

// Board-related components (lazy loading)
// import BoardMain from '../views/BoardMain.vue';
// import BoardPostDetail from '../views/BoardPostDetail.vue';
// import BoardPostEditor from '../views/BoardPostEditor.vue';

// Platform detection
import { detectPlatform, shouldRedirectToAppStore } from '../utils/platformDetector';

const routes = [
  {
    path: '/download',
    name: 'AppDownload',
    component: AppDownload,
    meta: { 
      requiresAuth: false,
      isPublic: true
    }
  },
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
    path: '/s/:id',
    name: 'SharedReading',
    component: SharedReading,
    meta: { 
      requiresAuth: false,
      isPublic: true // public page
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
    path: '/auth/email-verified',
    name: 'EmailVerified',
    component: EmailVerified,
    meta: { requiresAuth: false, isPublic: true }
  },
  {
    path: '/auth/reset-password',
    name: 'PasswordReset',
    component: () => import('../views/PasswordReset.vue'),
    meta: { requiresAuth: false, isPublic: true }
  },
  {
    path: '/oauth-bridge',
    name: 'OAuthBridge',
    component: OAuthBridge,
    meta: { requiresAuth: false, isPublic: true }
  },
  {
    path: '/auth/mobile-callback',
    name: 'MobileCallback',
    component: () => import('../views/mobile-callback.vue'),
    meta: { requiresAuth: false, isPublic: true }
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
  // Board routes (lazy loading)
  {
    path: '/board',
    name: 'Board',
    component: () => import('../views/BoardMain.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/board/post/:id',
    name: 'BoardPostDetail',
    component: () => import('../views/BoardPostDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/board/write',
    name: 'BoardPostWrite',
    component: () => import('../views/BoardPostEditor.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/board/edit/:id',
    name: 'BoardPostEdit',
    component: () => import('../views/BoardPostEditor.vue'),
    meta: { requiresAuth: true }
  },
  // 이벤트 라우트
  {
    path: '/events',
    name: 'EventList',
    component: () => import('../views/EventList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/events/:id',
    name: 'EventDetail',
    component: () => import('../views/EventDetail.vue'),
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  console.log('[Router Guard] Route start:', from.path, '->', to.path);
  console.log('[Router Guard] To info:', {
    name: to.name,
    path: to.path,
    params: to.params,
    meta: to.meta
  });
  
  // Block web access in production (except allowlisted pages).
  const platform = detectPlatform();
  // Detect production hosting (Vercel).
  const isVercelProduction = window.location.hostname.includes('vercel.app');
  const isProduction = import.meta.env.MODE === 'production' || isVercelProduction;
  const isWeb = !platform.isCapacitor && !platform.isInApp;
  const allowedPaths = ['/s/', '/download', '/auth/callback', '/auth/email-verified', '/auth/reset-password', '/oauth-bridge']; // allowlisted paths
  const allowedNames = ['SharedReading', 'AppDownload', 'AuthCallback', 'EmailVerified', 'PasswordReset', 'OAuthBridge']; // allowlisted route names
  
  // Allowlist checks
  const isAllowedPath = allowedPaths.some(path => to.path.startsWith(path));
  const isAllowedName = allowedNames.includes(to.name as string);
  const isEmailVerifyQuery = Boolean(
    (to.query?.type && String(to.query.type).toLowerCase() === 'signup') ||
    to.query?.token ||
    to.query?.token_hash ||
    to.query?.access_token ||
    to.query?.refresh_token ||
    to.query?.code
  );  
  // Block web access in production (except localhost).
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!isLocalhost && isProduction && isWeb && !isAllowedPath && !isAllowedName) {
    if (to.path === '/' && isEmailVerifyQuery) {
      console.log('🔐 [Router Guard] 이메일 인증 쿼리 감지 - 인증 완료 페이지로 이동');
      next({
        name: 'EmailVerified',
        query: to.query
      });
      return;
    }
    console.log('[Router Guard] Production web - redirect to AppDownload');
    console.log('[Router Guard] Blocked page:', to.name || to.path);
    next({
      name: 'AppDownload', 
      query: {
        from: to.name as string || 'unknown',
        path: to.path,
        ...to.query
      }
    });
    return;
  }  
  // Shared page deep-link check (currently disabled).
  // TODO: review store gating for shared pages.
  /*
  if (to.name === 'SharedReading') {
    const platform = detectPlatform();
    
    // If opening from web (not in app), redirect to download page.
    if (!platform.isCapacitor && !platform.isInApp && shouldRedirectToAppStore()) {
      console.log('[Router Guard] Web access - redirect to download page');
      // pass share ID as query
      next({
        name: 'AppDownload',
        query: {
          from: 'share',
          shareId: to.params.id as string
        }
      });
      return;
    }
  }
  */
  
  // Public pages: skip auth checks.
  if (to.meta.isPublic || to.meta.requiresAuth === false) {
    console.log('[Router Guard] Public page - skip auth');
    next();
    return;
  }
  
  try {
    // Import store lazily
    const { useUserStore } = await import('../store/user');
    const userStore = useUserStore();
    
    // For CardDrawing, ensure tarot state exists
    if (to.name === 'CardDrawing') {
      console.log('[Router Guard] Navigating to CardDrawing');
      // check tarot store state
      const { useTarotStore } = await import('../store/tarot');
      const tarotStore = useTarotStore();
      
      console.log('[Router Guard] Tarot store state:', {
        selectedTopic: tarotStore.selectedTopic,
        selectedSpread: tarotStore.selectedSpread,
        hasData: !!(tarotStore.selectedTopic && tarotStore.selectedSpread)
      });
    }
    
    // Initialize user store if needed
    if (!userStore.isInitialized) {
      console.log('[Router Guard] userStore initialization required');
      await userStore.initializeUser();
    }
    
    // Auth-required pages
    if (to.meta.requiresAuth) {
      console.log('[Router Guard] Auth-required page:', to.path);
      
      // Wait while user state is loading.
      if (userStore.isLoading) {
        console.log('[Router Guard] Waiting for user state...');
        await new Promise(resolve => {
          const unwatch = userStore.$subscribe((mutation, state) => {
            if (!state.isLoading) {
              unwatch();
              resolve(undefined);
            }
          });
        });
      }

      // Check user status (block anonymous users).
      console.log(
        '[Router Guard] User status:',
        userStore.currentUser
          ? (userStore.currentUser.isAnonymous ? 'anonymous' : 'logged-in')
          : 'none'
      );

      // If no user or anonymous user, redirect to Home.
      if (!userStore.currentUser || userStore.currentUser.isAnonymous) {
        console.log('[Router Guard] Not logged in - redirecting to Home');
        next({ name: 'Home' });
        return;
      }
    }
    
    console.log('[Router Guard] Route allowed');
    next();
  } catch (error) {
    console.error('[Router Guard] Error:', error);
    next(false); // cancel navigation
  }
});

// Navigation log
router.afterEach((to, from) => {
  console.log('[Router AfterEach] Route changed:', from.path, '->', to.path);
  console.log('[Router AfterEach] Current URL:', window.location.pathname);
});

export default router;


