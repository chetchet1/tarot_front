import { supabase } from './supabase';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App as CapacitorApp } from '@capacitor/app';

// OAuth 리스너 상태 관리
let authStateSubscription: any = null;
let appUrlListener: any = null;
let browserFinishedListener: any = null;
let isListenerSetup = false;

export const oauthService = {
  // OAuth URL 리스너 설정
  async setupDeepLinkListener() {
    console.log('🎯 [OAuth] setupDeepLinkListener 호출됨');
    
    // 이미 리스너가 설정되어 있으면 다시 등록하지 않음
    if (isListenerSetup) {
      console.log('⚠️ [OAuth] 리스너가 이미 설정되어 있음');
      return;
    }
    
    // 기존 리스너 정리
    await this.cleanupListeners();
    
    // Supabase auth state change 리스너 추가 (모든 플랫폼에서)
    console.log('🔄 [OAuth] Auth state change 리스너 등록');
    authStateSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 [OAuth] Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('🎉 [OAuth] 로그인 감지! 사용자:', session.user?.email);
        
        // 브라우저 닫기 (모바일에서만)
        if (Capacitor.isNativePlatform()) {
          try {
            await Browser.close();
          } catch (e) {
            console.log('🚨 Browser already closed');
          }
        }
        
        // OAuth 성공 이벤트 발생
        const event = new CustomEvent('oauth-success');
        window.dispatchEvent(event);
        console.log('✅ [OAuth] oauth-success 이벤트 발생 완료');
        
        // 성공 콜백 실행
        if (this.authSuccessCallback) {
          this.authSuccessCallback();
        }
      }
    });
    
    // 리스너 등록 완료 표시
    isListenerSetup = true;
    
    if (Capacitor.isNativePlatform()) {
      console.log('📱 [OAuth] Native platform 감지 - Deep link 리스너 등록');
      // 앱 URL 리스너 등록 (기존 코드 유지)
      CapacitorApp.addListener('appUrlOpen', async (event: any) => {
        console.log('🔗 [OAuth] Deep link received:', event.url);
        console.log('🔗 [OAuth] Deep link event 전체:', JSON.stringify(event));
        
        // OAuth 콜백 URL인지 확인
        if (event.url.includes('auth/callback') || event.url.includes('login-callback')) {
          console.log('🔎 [OAuth] OAuth callback URL 감지!');
          console.log('🔎 [OAuth] URL 내용:', event.url);
          
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
            
            console.log('🔑 [OAuth] Tokens found:', { 
              access_token: access_token ? 'Yes' : 'No', 
              refresh_token: refresh_token ? 'Yes' : 'No',
              fragment: event.url.includes('#') ? event.url.split('#')[1] : 'none',
              query: event.url.includes('?') ? event.url.split('?')[1] : 'none'
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
              console.log('🎉 [OAuth] 토큰으로 세션 설정 성공, oauth-success 이벤트 발생');
              const event = new CustomEvent('oauth-success');
              window.dispatchEvent(event);
              console.log('✅ [OAuth] oauth-success 이벤트 발생 완료');
              
              // 성공 콜백 실행
              if (this.authSuccessCallback) {
                this.authSuccessCallback();
              }
            } else {
              // 토큰이 없으면 항상 세션 체크 (OAuth 리다이렉트 후일 가능성)
              console.log('🔄 [OAuth] URL에 토큰 없음, 세션 확인 시작');
              console.log('🔄 [OAuth] 이는 OAuth 프로바이더가 세션 쿠키로 인증한 경우일 수 있음');
              
              // 브라우저 닫기 시도
              try {
                await Browser.close();
              } catch (e) {
                console.log('🚨 Browser already closed');
              }
              
              // 세션 확인을 여러 번 재시도 (최대 30초)
              let session = null;
              let retryCount = 0;
              const maxRetries = 10;
              const retryDelay = 3000; // 3초
              
              while (!session && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                console.log(`🔄 [OAuth] 세션 확인 시도 ${retryCount + 1}/${maxRetries}`);
                session = await this.restoreSession();
                console.log(`🔄 [OAuth] 세션 확인 결과:`, session ? '세션 있음' : '세션 없음');
                retryCount++;
              }
              
              if (session) {
                console.log('🎉 [OAuth] 세션 복원 성공! 시도 횟수:', retryCount);
                console.log('🎉 [OAuth] 복원된 세션 사용자:', session.user?.email);
                const event = new CustomEvent('oauth-success');
                window.dispatchEvent(event);
                console.log('✅ [OAuth] oauth-success 이벤트 발생 완료');
                
                if (this.authSuccessCallback) {
                  this.authSuccessCallback();
                }
              } else {
                console.log('❌ [OAuth] 세션 복원 실패! 시도 횟수:', retryCount);
                console.log('❌ [OAuth] oauth-error 이벤트 발생');
                // 세션이 없으면 에러 이벤트 발생
                const errorEvent = new CustomEvent('oauth-error', { 
                  detail: { message: '로그인 세션을 생성할 수 없습니다. 다시 시도해주세요.' }
                });
                window.dispatchEvent(errorEvent);
                console.log('✅ [OAuth] oauth-error 이벤트 발생 완료');
              }
            }
          } catch (error) {
            console.error('❌ [OAuth] 콜백 처리 중 에러 발생:', error);
            console.error('❌ [OAuth] 에러 상세:', error.stack);
          }
        } else {
          console.log('⚠️ [OAuth] OAuth 콜백 URL이 아님:', event.url);
        }
      });
      console.log('✅ [OAuth] Deep link 리스너 등록 완료');
    } else {
      console.log('🌐 [OAuth] Web platform - Deep link 리스너 필요 없음');
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
      console.log('🔵 [OAuth] signInWithGoogle 시작');
      
      // OAuth 시작 전 리스너 확인 및 재등록
      console.log('🔎 [OAuth] 리스너 확인 및 재등록 시작...');
      await this.ensureListenersSetup();
      console.log('✅ [OAuth] 리스너 확인 및 재등록 완료');
      
      if (Capacitor.isNativePlatform()) {
        // 모바일 환경 - 실제 Supabase에 등록된 URL 사용 (Vercel)
        const redirectUrl = 'https://tarot-app-psi-eight.vercel.app/auth/callback';
        
        console.log('📱 [OAuth] 모바일 Google OAuth 시작, redirectUrl:', redirectUrl);
        
        // 세션을 먼저 완전히 정리
        try {
          await supabase.auth.signOut();
          console.log('🧹 [OAuth] 기존 세션 정리 완료');
        } catch (e) {
          console.log('⚠️ [OAuth] 세션 정리 스킵:', e);
        }
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account' // 매번 계정 선택 화면 표시
            }
          }
        });
        
        if (error) throw error;
        
        console.log('🌐 [OAuth] OAuth URL 생성:', data.url);
        
        // 브라우저가 닫힐 때를 감지하기 위한 리스너 추가
        Browser.addListener('browserFinished', async () => {
          console.log('🔚 [OAuth] Browser 닫힘 감지!');
          
          // 브라우저가 닫히면 바로 세션 확인
          const session = await this.restoreSession();
          if (session) {
            console.log('✅ [OAuth] Browser 닫힌 후 세션 확인 성공!');
            const event = new CustomEvent('oauth-success');
            window.dispatchEvent(event);
            
            if (this.authSuccessCallback) {
              this.authSuccessCallback();
            }
          } else {
            console.log('⚠️ [OAuth] Browser 닫힌 후 세션 없음, 계속 체크...');
            // 세션 체크 계속
            this.checkSessionAfterOAuth();
          }
          
          // 리스너 제거
          await Browser.removeAllListeners();
        });
        
        // Chrome Custom Tabs로 열기
        await Browser.open({
          url: data.url,
          presentationStyle: 'popover',
          toolbarColor: '#1E1B4B'
        });
        
        // 백업: 3초 후에도 세션 체크 시작
        setTimeout(() => {
          this.checkSessionAfterOAuth();
        }, 3000);
        
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

  // OAuth 후 세션 체크
  async checkSessionAfterOAuth() {
    console.log('🔍 [OAuth] OAuth 후 세션 체크 시작');
    
    // 세션 확인을 여러 번 재시도
    let session = null;
    let retryCount = 0;
    const maxRetries = 10;
    const retryDelay = 3000;
    
    while (!session && retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      console.log(`🔄 [OAuth] 세션 체크 시도 ${retryCount + 1}/${maxRetries}`);
      
      session = await this.restoreSession();
      
      if (session) {
        console.log('🎉 [OAuth] 세션 확인 성공!');
        const event = new CustomEvent('oauth-success');
        window.dispatchEvent(event);
        
        if (this.authSuccessCallback) {
          this.authSuccessCallback();
        }
        break;
      }
      
      retryCount++;
    }
    
    if (!session) {
      console.error('❌ [OAuth] 세션 확인 실패');
      const errorEvent = new CustomEvent('oauth-error', {
        detail: { message: '로그인 세션을 생성할 수 없습니다.' }
      });
      window.dispatchEvent(errorEvent);
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
        // 에러가 있어도 계속 시도
      }
      
      if (session) {
        console.log('✅ 세션 확인 성공:', session.user?.email);
        return session;
      }
      
      // 세션이 없으면 사용자 정보 확인
      console.log('🔄 세션이 없음 - 사용자 정보 확인');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (user) {
        console.log('✅ 사용자 정보 확인됨:', user.email);
        // 사용자가 있으면 세션 refresh 시도
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        
        if (data?.session) {
          console.log('✅ 세션 refresh 성공:', data.session.user?.email);
          return data.session;
        }
      }
      
      // 마지막으로 한 번 더 세션 확인 (OAuth 후 약간의 지연이 있을 수 있음)
      await new Promise(resolve => setTimeout(resolve, 1000));
      const { data: { session: finalSession } } = await supabase.auth.getSession();
      
      if (finalSession) {
        console.log('✅ 최종 세션 확인 성공:', finalSession.user?.email);
        return finalSession;
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
  },
  
  // 리스너 정리
  async cleanupListeners() {
    console.log('🧹 [OAuth] 리스너 정리 시작');
    
    // Auth state 리스너 제거
    if (authStateSubscription) {
      authStateSubscription.data?.subscription?.unsubscribe();
      authStateSubscription = null;
      console.log('✅ Auth state 리스너 제거');
    }
    
    // App URL 리스너 제거 (네이티브)
    if (Capacitor.isNativePlatform()) {
      try {
        await CapacitorApp.removeAllListeners();
        console.log('✅ App URL 리스너 제거');
      } catch (e) {
        console.log('⚠️ App 리스너 제거 실패:', e);
      }
      
      try {
        await Browser.removeAllListeners();
        console.log('✅ Browser 리스너 제거');
      } catch (e) {
        console.log('⚠️ Browser 리스너 제거 실패:', e);
      }
    }
    
    // 리스너 설정 상태 초기화
    isListenerSetup = false;
    console.log('✅ [OAuth] 리스너 정리 완료');
  },
  
  // OAuth 시작 시 리스너 재등록
  async ensureListenersSetup() {
    console.log('🔍 [OAuth] 리스너 상태 확인:', isListenerSetup ? '등록됨' : '미등록');
    if (!isListenerSetup) {
      console.log('🔄 [OAuth] 리스너 재등록 필요 - setupDeepLinkListener 호출');
      await this.setupDeepLinkListener();
      console.log('✅ [OAuth] 리스너 재등록 완료');
    } else {
      console.log('ℹ️ [OAuth] 리스너가 이미 등록되어 있음');
    }
  }
};