// 버전을 변경하여 강제 업데이트
const CACHE_NAME = 'tarot-garden-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/styles/main.css'
];

// 즉시 제어권 획득
self.addEventListener('install', event => {
  console.log('[SW] 새 버전 설치 중...');
  // 즉시 활성화
  self.skipWaiting();
});

// 모든 클라이언트 제어
self.addEventListener('activate', event => {
  console.log('[SW] 활성화됨, 모든 캐시 삭제 중...');
  event.waitUntil(
    // 모든 캐시 삭제
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('[SW] 캐시 삭제:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // 모든 클라이언트 제어
      return clients.claim();
    })
  );
});

// 페치 이벤트 - 캐시 사용하지 않음
self.addEventListener('fetch', event => {
  // 모든 요청을 네트워크로 직접 전달
  event.respondWith(fetch(event.request));
});
