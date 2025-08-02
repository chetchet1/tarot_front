// Service Worker 비활성화
console.log('Service Worker가 비활성화되었습니다.');

// 설치 시 즉시 스킵
self.addEventListener('install', () => {
  self.skipWaiting();
});

// 활성화 시 모든 캐시 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(
      names.map(name => caches.delete(name))
    )).then(() => clients.claim())
  );
});

// fetch 이벤트 핸들러 제거 - no-op 경고 방지
// 기본 네트워크 동작 사용
