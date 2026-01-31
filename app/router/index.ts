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
// 怨듭쑀 ?섏씠吏 而댄룷?뚰듃 import
import SharedReading from '../views/SharedReading.vue';
import AppDownload from '../views/AppDownload.vue';
import EmailVerified from '../views/EmailVerified.vue';

// 寃뚯떆??愿??而댄룷?뚰듃??lazy loading?쇰줈 泥섎━
// import BoardMain from '../views/BoardMain.vue';
// import BoardPostDetail from '../views/BoardPostDetail.vue';
// import BoardPostEditor from '../views/BoardPostEditor.vue';

// ?뚮옯??媛먯?
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
      requiresAuth: false,  // 濡쒓렇??遺덊븘??      isPublic: true        // 怨듦컻 ?섏씠吏
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
  // 寃뚯떆???쇱슦??(lazy loading)
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
  // ?대깽???쇱슦??  {
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

// ?ㅻ퉬寃뚯씠??媛??router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  console.log('?슌 [Router Guard] ?쇱슦???쒖옉:', from.path, '->', to.path);
  console.log('?슌 [Router Guard] to ?뺣낫:', {
    name: to.name,
    path: to.path,
    params: to.params,
    meta: to.meta
  });
  
  // ???섍꼍?먯꽌 ???ъ슜 李⑤떒 (怨듭쑀 ?섏씠吏? ?ㅼ슫濡쒕뱶 ?섏씠吏 ?쒖쇅)
  const platform = detectPlatform();
  // Vercel 諛고룷 ?섍꼍??媛먯? (?꾨찓??泥댄겕)
  const isVercelProduction = window.location.hostname.includes('vercel.app');
  const isProduction = import.meta.env.MODE === 'production' || isVercelProduction;
  const isWeb = !platform.isCapacitor && !platform.isInApp;
  const allowedPaths = ['/s/', '/download', '/auth/callback', '/auth/email-verified', '/auth/reset-password', '/oauth-bridge']; // ?덉슜??寃쎈줈 ?⑦꽩
  const allowedNames = ['SharedReading', 'AppDownload', 'AuthCallback', 'EmailVerified', 'PasswordReset', 'OAuthBridge']; // ?덉슜???쇱슦???대쫫
  
  // 寃쎈줈 泥댄겕 (怨듭쑀 ?섏씠吏 ??
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
  // ???꾨줈?뺤뀡 ?섍꼍?먯꽌 ?덉슜?섏? ?딆? ?섏씠吏 李⑤떒 (localhost ?쒖쇅)
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
    console.log('?슟 [Router Guard] ???꾨줈?뺤뀡 ?섍꼍 - ???ㅼ슫濡쒕뱶 ?섏씠吏濡?由щ떎?대젆??);
    console.log('?슟 [Router Guard] 李⑤떒???섏씠吏:', to.name || to.path);
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
  // 怨듭쑀 ?섏씠吏 ?묒냽 ?????ㅼ튂 ?좊룄 泥댄겕
  // TODO: ???ㅽ넗???깅줉 ??二쇱꽍 ?댁젣
  /*
  if (to.name === 'SharedReading') {
    const platform = detectPlatform();
    
    // ?밸툕?쇱슦??먯꽌 ?묒냽??寃쎌슦 (?깆씠 ?꾨땶 寃쎌슦)
    if (!platform.isCapacitor && !platform.isInApp && shouldRedirectToAppStore()) {
      console.log('?벑 [Router Guard] ??釉뚮씪?곗? ?묒냽 - ???ㅼ슫濡쒕뱶 ?섏씠吏濡?由щ떎?대젆??);
      // 怨듭쑀 ID瑜?荑쇰━ ?뚮씪誘명꽣濡??꾨떖
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
  
  // 怨듦컻 ?섏씠吏???몄쬆 泥섎━ 嫄대꼫?곌린
  if (to.meta.isPublic || to.meta.requiresAuth === false) {
    console.log('?넃 [Router Guard] 怨듦컻 ?섏씠吏 - ?몄쬆 嫄대꼫?곌린');
    next();
    return;
  }
  
  try {
    // store瑜??숈쟻?쇰줈 import
    const { useUserStore } = await import('../store/user');
    const userStore = useUserStore();
    
    // CardDrawing ?섏씠吏濡?媛??寃쎌슦 ?濡??ㅽ넗???곹깭 ?뺤씤
    if (to.name === 'CardDrawing') {
      console.log('?렣 [Router Guard] CardDrawing ?섏씠吏濡??대룞');
      // ?濡??ㅽ넗???곹깭 ?뺤씤
      const { useTarotStore } = await import('../store/tarot');
      const tarotStore = useTarotStore();
      
      console.log('?렣 [Router Guard] ?濡??ㅽ넗???곹깭:', {
        selectedTopic: tarotStore.selectedTopic,
        selectedSpread: tarotStore.selectedSpread,
        hasData: !!(tarotStore.selectedTopic && tarotStore.selectedSpread)
      });
    }
    
    // 珥덇린?붽? ???섏뿀?쇰㈃ 珥덇린???ㅽ뻾
    if (!userStore.isInitialized) {
      console.log('?봽 [Router Guard] userStore 珥덇린???꾩슂');
      await userStore.initializeUser();
    }
    
    // ?몄쬆???꾩슂???섏씠吏
    if (to.meta.requiresAuth) {
      console.log('?뵍 [Router Guard] ?몄쬆 ?꾩슂 ?섏씠吏:', to.path);
      
      // 濡쒕뵫 以묒씠硫??湲?      if (userStore.isLoading) {
        console.log('??[Router Guard] 濡쒕뵫 ?湲?以?..');
        await new Promise(resolve => {
          const unwatch = userStore.$subscribe((mutation, state) => {
            if (!state.isLoading) {
              unwatch();
              resolve(undefined);
            }
          });
        });
      }
      
      // 濡쒓렇???곹깭 ?뺤씤 (?듬챸 ?ъ슜??李⑤떒)
      console.log('?뫀 [Router Guard] ?ъ슜???곹깭:', userStore.currentUser ? (
        userStore.currentUser.isAnonymous ? '?듬챸' : '濡쒓렇??
      ) : '?놁쓬');
      
      // ?ъ슜?먭? ?녾굅???듬챸 ?ъ슜?먮㈃ ?덉쑝濡?      if (!userStore.currentUser || userStore.currentUser.isAnonymous) {
        console.log('??[Router Guard] 鍮꾨줈洹몄씤 ?곹깭 - ?덉쑝濡?由щ떎?대젆??);
        next({ name: 'Home' });
        return;
      }
    }
    
    console.log('??[Router Guard] ?쇱슦???덉슜??);
    next();
  } catch (error) {
    console.error('??[Router Guard] ?ㅻ쪟 諛쒖깮:', error);
    next(false); // ?ㅻ퉬寃뚯씠??痍⑥냼
  }
});

// ?ㅻ퉬寃뚯씠????濡쒓렇
router.afterEach((to, from) => {
  console.log('?렞 [Router AfterEach] ?쇱슦???꾨즺:', from.path, '->', to.path);
  console.log('?렞 [Router AfterEach] ?꾩옱 URL:', window.location.pathname);
});

export default router;


