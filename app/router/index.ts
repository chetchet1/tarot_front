import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { Platform } from '@/utils/platform';

// 정적 import로 변경 (동적 import 문제 해결)
import Home from '@/views/Home.vue';
import MainApp from '@/views/MainApp.vue';
import ReadingSelect from '@/views/ReadingSelectWeb.vue';
import CardDrawing from '@/views/CardDrawingWeb.vue';
import ReadingResult from '@/views/ReadingResultWeb.vue';
import Premium from '@/views/PremiumWeb.vue';
import TarotDictionary from '@/views/TarotDictionaryWeb.vue';
import History from '@/views/HistoryWeb.vue';
import AuthCallback from '@/components/AuthCallback.vue';
import HomeWebTest from '@/views/HomeWebTest.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/app',
    name: 'MainApp',
    component: MainApp,
  },
  {
    path: '/reading-select',
    name: 'ReadingSelect',
    component: ReadingSelect,
  },
  {
    path: '/card-drawing',
    name: 'CardDrawing',
    component: CardDrawing,
  },
  {
    path: '/reading-result/:readingId?',
    name: 'ReadingResult',
    component: ReadingResult,
  },
  {
    path: '/premium',
    name: 'Premium',
    component: Premium,
  },
  {
    path: '/dictionary',
    name: 'TarotDictionary',
    component: TarotDictionary,
  },
  {
    path: '/history',
    name: 'History',
    component: History,
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallback,
  },
  {
    path: '/test',
    name: 'HomeWebTest', 
    component: HomeWebTest,
  },
];

// 웹에서만 라우터 생성
export const createAppRouter = () => {
  return createRouter({
    history: createWebHistory(),
    routes,
  });
};

// 기본 export 를 라우터 인스턴스로 설정
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
