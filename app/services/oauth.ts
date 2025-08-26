import { supabase } from './supabase';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App as CapacitorApp } from '@capacitor/app';

export const oauthService = {
  // OAuth URL 리스너 설정
  async setupDeepLinkListener() {
    if (Capacitor.isNativePlatform()) {
      // 앱 URL 리스너 등록
      CapacitorApp.addListener('appUrlOpen', async (event: any) => {
        console.log('🔗 Deep link received:', event.url);
        
        // OAuth 콜백 URL인지 확인
        if (event.url.includes('auth/callback') || event.url.includes('login-callback')) {
          console.log('🔎 Processing OAuth callback...');
          
          try {
            // URL 파싱 시도
            let access_token: string | null = null;
            let refresh_token: string | null = null;
            
            // Fragment (#) 방식 처리
            if (event.url.includes('#')) {
              const fragment = event.url.split('#')[1];
              const params = new URLSearchParams(fragment);
              access_token = params.get('access_token');
              refresh_token = params.get('refresh_token');
            }
            
            // Query (?) 방식 처리
            if (!access_token && event.url.includes('?')) {
              const queryString = event.url.split('?')[1];
              const params = new URLSearchParams(queryString);
              access_token = params.get('access_token');
              refresh_token = params.get('refresh_token');
            }
            
            console.log('🔑 Tokens found:', { 
              access_token: access_token ? 'Yes' : 'No', 
              refresh_token: refresh_token ? 'Yes' : 'No' 
            });
            
            if (access_token && refresh_token) {
              // 브라우저 먼저 닫기
              try {
                await Browser.close();
              } catch (e) {
                console.log('🚨 Browser already closed');
              }
              
              // 세션 설정
              await this.setSession(access_token, refresh_token);
              
              // OAuth 성공 이벤트 발생
              console.log('🎉 Dispatching oauth-success event');
              window.dispatchEvent(new CustomEvent('oauth-success'));
              
              // 성공 콜백 실행
              if (this.authSuccessCallback) {
                this.authSuccessCallback();
              }
            } else {
              // 토큰이 없으면 항상 세션 체크 (OAuth 리다이렉트 후일 가능성)
              console.log('🔄 No tokens in URL, checking session...');
              
              // 브라우저 닫기 시도
              try {
                await Browser.close();
              } catch (e) {
                console.log('🚨 Browser already closed');
              }
              
              // 세션 확인을 여러 번 재시도 (최대 5초)
              let session = null;
              let retryCount = 0;
              const maxRetries = 5;
              const retryDelay = 1000; // 1초
              
              while (!session && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                console.log(`🔄 세션 확인 시도 ${retryCount + 1}/${maxRetries}`);
                session = await this.restoreSession();
                retryCount++;
              }
              
              if (session) {
                console.log('🎉 Session restored after', retryCount, 'attempts');
                window.dispatchEvent(new CustomEvent('oauth-success'));
                
                if (this.authSuccessCallback) {
                  this.authSuccessCallback();
                }
              } else {
                console.log('❌ No session found after', retryCount, 'attempts');
                // 세션이 없으면 에러 이벤트 발생
                window.dispatchEvent(new CustomEvent('oauth-error', { 
                  detail: { message: '로그인 세션을 생성할 수 없습니다. 다시 시도해주세요.' }
                }));
              }
            }
          } catch (error) {
            console.error('❌ OAuth callback processing error:', error);
          }
        }
      });
    }
  },

  // 세션 설정
  async setSession(access_token: string, refresh_token: string) {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token
      });
      
      if (error) throw error;
      
      console.log('✅ 세션 설정 성공:', data.user?.email);
      
      // localStorage 정리 코드 제거 - 세션 관리에 문제를 일으킴
      // 모바일과 웹 세션은 Supabase가 자체적으로 관리함
      
      return data;
    } catch (error) {
      console.error('❌ 세션 설정 실패:', error);
      throw error;
    }
  },

  // Google OAuth 개선된 버전
  async signInWithGoogle() {
    try {
      if (Capacitor.isNativePlatform()) {
        // 모바일 환경
        const redirectUrl = 'com.tarotgarden.app://auth/callback';
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent'
            }
          }
        });
        
        if (error) throw error;
        
        // Chrome Custom Tabs로 열기
        await Browser.open({
          url: data.url,
          presentationStyle: 'popover',
          toolbarColor: '#1E1B4B'
        });
        
        return { success: true, url: data.url };
      } else {
        // 웹 환경
        const redirectUrl = `${window.location.origin}/auth/callback`;
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl
          }
        });
        
        if (error) throw error;
        
        // 웹에서는 자동으로 리다이렉트됨
        return { success: true, url: data.url };
      }
    } catch (error) {
      console.error('❌ Google OAuth 실패:', error);
      throw error;
    }
  },

  // 성공 콜백 설정
  authSuccessCallback: null as (() => void) | null,
  
  setAuthSuccessCallback(callback: () => void) {
    this.authSuccessCallback = callback;
  },

  // 세션 복원
  async restoreSession() {
    try {
      console.log('🔄 세션 복원 시도...');
      
      // 먼저 현재 세션 확인
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ getSession 에러:', error);
        throw error;
      }
      
      if (session) {
        console.log('✅ 세션 확인 성공:', session.user?.email);
        return session;
      }
      
      // 세션이 없으면 refresh 시도 (모바일에서도)
      console.log('🔄 세션이 없음 - refresh 시도');
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.log('⚠️ 세션 refresh 실패:', refreshError.message);
        return null;
      }
      
      if (data.session) {
        console.log('✅ 세션 refresh 성공:', data.session.user?.email);
        return data.session;
      }
      
      console.log('❌ 세션을 복원할 수 없음');
      return null;
    } catch (error) {
      console.error('❌ 세션 복원 실패:', error);
      return null;
    }
  },

  // 현재 인증 상태 확인
  async checkAuthStatus() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.log('❌ 인증되지 않은 상태');
        return { isAuthenticated: false, user: null };
      }
      
      console.log('✅ 인증된 상태:', user.email);
      return { isAuthenticated: true, user };
    } catch (error) {
      console.error('❌ 인증 상태 확인 실패:', error);
      return { isAuthenticated: false, user: null };
    }
  }
};
