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
      
      // IMPORTANT:
      // `auth/confirm` deep-links also include `type=recovery` in the query string.
      // Do not treat that as a reset-password link, otherwise we skip OTP verification and the reset page becomes invalid.
      const hasResetPassword = url.pathname.includes('auth/reset-password');
      const hasAuthCallback = url.pathname.includes('auth/callback') || url.href.includes('#access_token');
      const hasAuthConfirm = url.pathname.includes('auth/confirm') || url.href.includes('auth/confirm');
      
      // URL에서 토큰 추출 (hash 또는 fragment에서)
      let access_token = null;
      let refresh_token = null;
      let type = null;
      let fragment = '';
      
      if (data.url.includes('#')) {
        fragment = data.url.split('#')[1];
        const fragmentParams = new URLSearchParams(fragment);
        access_token = fragmentParams.get('access_token');
        refresh_token = fragmentParams.get('refresh_token');
        type = fragmentParams.get('type');
      }
      
      if (!access_token && url.hash) {
        const hashParams = new URLSearchParams(url.hash.slice(1));
        access_token = hashParams.get('access_token');
        refresh_token = hashParams.get('refresh_token');
        type = hashParams.get('type');
      }
      
      console.log('🔑 Tokens found:', { 
        access: !!access_token, 
        refresh: !!refresh_token,
        type
      });
      
      if (hasResetPassword) {
        try {
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token
            });
            
            if (error) {
              console.error('❌ Password reset session error:', error);
            }
          }
          
          const hash = fragment ? `#${fragment}` : (url.hash || '');
          router.replace({ path: '/auth/reset-password', hash });
          return;
        } catch (err) {
          console.error('❌ Password reset deep link error:', err);
          router.replace('/auth/reset-password');
          return;
        }
      }

      if (hasAuthConfirm) {
        try {
          const token_hash = url.searchParams.get('token_hash') || url.searchParams.get('tokenHash');
          const confirmType = String(url.searchParams.get('type') || '').toLowerCase();

          if (token_hash && confirmType) {
            const { error } = await supabase.auth.verifyOtp({
              token_hash,
              type: confirmType as any
            });
            if (error) {
              console.error('❌ Auth confirm verifyOtp error:', error);
            }

            if (confirmType === 'recovery') {
              router.replace({ path: '/auth/reset-password', query: { type: 'recovery' } });
              return;
            }
            if (confirmType === 'email' || confirmType === 'signup') {
              router.replace({ path: '/auth/email-verified', query: { type: 'signup' } });
              return;
            }
          } else {
            console.error('❌ Auth confirm missing token_hash/type');
          }

          router.replace('/');
          return;
        } catch (err) {
          console.error('❌ Auth confirm deep link error:', err);
          router.replace('/');
          return;
        }
      }
      
      // Supabase OAuth 콜백 처리
      if (hasAuthCallback) {
        if (access_token && refresh_token) {
          try {
            // 세션 설정
            const { data: sessionData, error } = await supabase.auth.setSession({
              access_token,
              refresh_token
            });
            
            if (!error && sessionData.session) {
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
