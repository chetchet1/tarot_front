import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../services/supabase';
import router from '../router';

// 모바일 딥링크 처리
export const setupDeepLinks = () => {
  if (Capacitor.isNativePlatform()) {
    // 앱 URL 오픈 이벤트 리스너
    App.addListener('appUrlOpen', async (data) => {
      console.log('🔗 Deep link opened:', data.url);
      
      // URL 파싱
      const url = new URL(data.url);
      
      // Supabase OAuth 콜백 처리
      if (url.pathname.includes('auth/callback') || url.href.includes('#access_token')) {
        // URL에서 토큰 추출 (hash 또는 fragment에서)
        let access_token = null;
        let refresh_token = null;
        
        // hash에서 찾기
        if (url.hash) {
          const hashParams = new URLSearchParams(url.hash.slice(1));
          access_token = hashParams.get('access_token');
          refresh_token = hashParams.get('refresh_token');
        }
        
        // fragment에서도 찾기 (개선된 방법)
        if (!access_token && data.url.includes('#')) {
          const fragment = data.url.split('#')[1];
          const fragmentParams = new URLSearchParams(fragment);
          access_token = fragmentParams.get('access_token');
          refresh_token = fragmentParams.get('refresh_token');
        }
        
        console.log('🔑 Tokens found:', { 
          access: !!access_token, 
          refresh: !!refresh_token 
        });
        
        if (access_token && refresh_token) {
          try {
            // 세션 설정
            const { data, error } = await supabase.auth.setSession({
              access_token,
              refresh_token
            });
            
            if (!error && data.session) {
              console.log('✅ OAuth login successful');
              // 홈 화면으로 이동
              router.push('/');
            } else {
              console.error('❌ OAuth session error:', error);
              router.push('/login?error=auth_failed');
            }
          } catch (err) {
            console.error('❌ OAuth processing error:', err);
            router.push('/login?error=auth_failed');
          }
        } else {
          // 토큰이 없으면 에러
          console.error('❌ No tokens in callback URL');
          router.push('/login?error=no_tokens');
        }
      }
    });
    
    // 기존 URL 체크 (앱이 딥링크로 시작된 경우)
    App.getLaunchUrl().then((ret) => {
      if (ret?.url) {
        console.log('🚀 App launched with URL:', ret.url);
        // 위와 동일한 처리
      }
    });
  }
};

// Supabase 세션 복원 헬퍼
export const restoreSession = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('🔄 Session restored:', session.user.email);
        return session;
      }
    } catch (error) {
      console.error('❌ Session restore failed:', error);
    }
  }
  return null;
};
