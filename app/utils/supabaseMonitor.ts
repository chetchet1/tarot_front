/**
 * Supabase API 호출 모니터링
 * premium_spread_usage 테이블 관련 모든 API 호출을 추적
 */

// 원본 fetch 백업
const originalFetch = window.fetch;
let apiCallCounter = 0;

export function monitorSupabaseAPICalls() {
  console.log('🎯 Supabase API 모니터링 시작');
  
  // fetch 오버라이드
  window.fetch = async function(...args) {
    const [url, options] = args;
    const urlString = typeof url === 'string' ? url : url.toString();
    
    // Supabase API 호출인지 확인
    if (urlString.includes('supabase.co')) {
      apiCallCounter++;
      const callId = apiCallCounter;
      
      // premium_spread_usage 관련 호출인지 확인
      if (urlString.includes('premium_spread_usage') || 
          (options?.body && typeof options.body === 'string' && 
           options.body.includes('premium_spread_usage'))) {
        
        console.error(`🚨🚨🚨 [API CALL #${callId}] premium_spread_usage 테이블 접근 감지!`);
        console.error('🚨 URL:', urlString);
        console.error('🚨 Method:', options?.method || 'GET');
        console.error('🚨 Body:', options?.body);
        console.error('🚨 Headers:', options?.headers);
        console.error('🚨 호출 시간:', new Date().toISOString());
        console.error('🚨 호출 스택:', new Error().stack);
        
        // POST 요청(INSERT)인 경우 특별 경고
        if (options?.method === 'POST') {
          console.error('💥💥💥 INSERT 작업 감지! 데이터가 추가되고 있습니다!');
          
          // body 파싱
          try {
            const bodyData = JSON.parse(options.body as string);
            console.error('💥 추가되는 데이터:', bodyData);
          } catch (e) {
            console.error('💥 Body 파싱 실패:', options.body);
          }
        }
      }
      
      // 모든 Supabase API 호출 로그 (간단히)
      console.log(`[API CALL #${callId}] ${options?.method || 'GET'} ${urlString.split('?')[0]}`);
    }
    
    // 원본 fetch 호출
    const response = await originalFetch.apply(this, args);
    
    // 응답도 로깅
    if (urlString.includes('premium_spread_usage')) {
      const clonedResponse = response.clone();
      try {
        const responseData = await clonedResponse.json();
        console.log('🚨 응답 데이터:', responseData);
      } catch (e) {
        console.log('🚨 응답 파싱 실패');
      }
    }
    
    return response;
  };
}

// 모니터링 중지
export function stopMonitoring() {
  console.log('🎯 Supabase API 모니터링 중지');
  window.fetch = originalFetch;
}

// 전역 노출
(window as any).supabaseMonitor = {
  start: monitorSupabaseAPICalls,
  stop: stopMonitoring,
  getCallCount: () => apiCallCounter
};

console.log('💡 Supabase API 모니터링을 시작하려면:');
console.log('window.supabaseMonitor.start()');
