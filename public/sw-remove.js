// Service Worker 제거 전용 파일
console.log('[SW-REMOVE] Service Worker 제거 중...');

// 즉시 활성화
self.addEventListener('install', (event) => {
  console.log('[SW-REMOVE] 설치 - 즉시 활성화');
  self.skipWaiting();
});

// 모든 캐시와 자기 자신 제거
self.addEventListener('activate', (event) => {
  console.log('[SW-REMOVE] 활성화 - 모든 캐시 제거 및 자기 제거');
  
  event.waitUntil(
    Promise.all([
      // 모든 캐시 삭제
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('[SW-REMOVE] 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      // 모든 클라이언트 제어
      clients.claim()
    ]).then(() => {
      // 자기 자신 제거
      return self.registration.unregister();
    }).then(() => {
      console.log('[SW-REMOVE] Service Worker 완전 제거됨');
    })
  );
});

// 페치 이벤트 제거 - no-op 경고 방지
// fetch 이벤트 핸들러를 등록하지 않음으로써 기본 동작 사용
