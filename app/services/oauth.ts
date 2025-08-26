import { supabase } from './supabase';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App as CapacitorApp } from '@capacitor/app';

export const oauthService = {
  // OAuth 진행 중 플래그
  isOAuthInProgress: false,
  
  // OAuth URL 리스너 설정
  async setupDeepLinkListener() {
    console.log('🎯 [OAuth] setupDeepLinkListener 호출됨');
    
    // Supabase auth state change 리스너 추가 (모든 플랫폼에서)
    console.log('🔄 [OAuth] Auth state change 리스너 등록');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
    // 이미 OAuth가 진행 중이면 무시
    if (this.isOAuthInProgress) {
      console.log('⚠️ [OAuth] 이미 OAuth 진행 중 - 중복 실행 방지');
      return { success: false, message: '로그인이 이미 진행 중입니다.' };
    }
    
    try {
      this.isOAuthInProgress = true;
      
      if (Capacitor.isNativePlatform()) {
        // 모바일 환경 - 다시 기본 URL로
        // Supabase의 공식 리다이렉트 URL을 사용해야 세션이 생성됨
        const redirectUrl = 'https://yxywzsmggvxxujuplyly.supabase.co/auth/v1/callback';
        
        console.log('📱 [OAuth] 모바일 Google OAuth 시작');
        console.log('📱 [OAuth] Redirect URL:', redirectUrl);
        console.log('📱 [OAuth] 현재 시간:', new Date().toISOString());
        
        // 세션을 먼저 완전히 정리
        try {
          await supabase.auth.signOut();
          console.log('🧹 [OAuth] 기존 세션 정리 완료');
        } catch (e) {
          console.log('⚠️ [OAuth] 세션 정리 스킵:', e);
        }
        
        // 폴링 중인지 여부 플래그
        let pollingActive = false;
        let pollingSuccess = false;
        
        // 이벤트 리스너 먼저 등록 (OAuth 전에)
        console.log('👂 [OAuth] Auth state change 리스너 등록');
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('🔔 [OAuth] Auth state 변경 감지:', event, session?.user?.email);
          
          if (event === 'SIGNED_IN' && session) {
            console.log('🎉 [OAuth] SIGNED_IN 이벤트 발생!');
            console.log('🎉 [OAuth] 세션 사용자:', session.user?.email);
            
            // 폴링 중단
            pollingSuccess = true;
            
            // 브라우저 닫기
            try {
              await Browser.close();
              console.log('✅ [OAuth] Browser 닫기 성공');
            } catch (e) {
              console.log('⚠️ [OAuth] Browser 이미 닫혀있음');
            }
            
            // OAuth 성공 이벤트 발생
            const event = new CustomEvent('oauth-success');
            window.dispatchEvent(event);
            console.log('✅ [OAuth] oauth-success 이벤트 발생');
            
            // 성공 콜백 실행
            if (this.authSuccessCallback) {
              this.authSuccessCallback();
            }
            
            // 리스너 정리
            subscription.unsubscribe();
          }
        });
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account' // 매번 계정 선택 화면 표시
            },
            skipBrowserRedirect: true, // 모바일에서는 자동 리다이렉트 방지
            flowType: 'pkce' // PKCE flow 사용
          }
        });
        
        if (error) throw error;
        
        console.log('🌐 [OAuth] OAuth URL 생성:', data.url);
        
        // 브라우저가 닫힐 때를 감지하기 위한 리스너 추가
        Browser.addListener('browserFinished', async () => {
          console.log('🔚 [OAuth] Browser 닫힘 감지!');
          
          // OAuth 완료 플래그 설정
          this.isOAuthInProgress = false;
          
          // 리스너 제거
          await Browser.removeAllListeners();
        });
        
        // Chrome Custom Tabs로 열기
        await Browser.open({
          url: data.url,
          presentationStyle: 'popover',
          toolbarColor: '#1E1B4B'
        });
        
        // 즉시 적극적인 폴링 시작
        pollingActive = true;
        const startPolling = async () => {
          // 브라우저 열린 직후 충분한 지연
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          let retryCount = 0;
          const maxRetries = 120; // 최대 120초 (1초 x 120회)
          const retryDelay = 1000; // 1초 간격
          
          while (pollingActive && !pollingSuccess && retryCount < maxRetries) {
            console.log(`🔍 [OAuth] 세션 폴링 ${retryCount + 1}/${maxRetries}`);
            
            // 먼저 getSession으로 직접 확인
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (currentSession) {
              console.log('🎉 [OAuth] 폴링으로 세션 확인 성공!');
              pollingSuccess = true;
              pollingActive = false;
              
              // 브라우저 닫기
              try {
                await Browser.close();
              } catch (e) {
                console.log('⚠️ [OAuth] Browser 이미 닫혀있음');
              }
              
              const event = new CustomEvent('oauth-success');
              window.dispatchEvent(event);
              
              if (this.authSuccessCallback) {
                this.authSuccessCallback();
              }
              
              // OAuth 완료 플래그 설정
              this.isOAuthInProgress = false;
              
              // auth state 리스너 정리
              subscription.unsubscribe();
              break;
            }
            
            // 기존 세션 복원 시도
            const session = await this.restoreSession();
            
            if (session) {
              console.log('🎉 [OAuth] 폴링으로 세션 확인 성공!');
              pollingSuccess = true;
              pollingActive = false;
              
              // 브라우저 닫기
              try {
                await Browser.close();
              } catch (e) {
                console.log('⚠️ [OAuth] Browser 이미 닫혀있음');
              }
              
              const event = new CustomEvent('oauth-success');
              window.dispatchEvent(event);
              
              if (this.authSuccessCallback) {
                this.authSuccessCallback();
              }
              
              // OAuth 완료 플래그 설정
              this.isOAuthInProgress = false;
              
              // auth state 리스너 정리
              subscription.unsubscribe();
              break;
            }
            
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            retryCount++;
          }
          
          if (!pollingSuccess && pollingActive) {
            console.error('❌ [OAuth] 세션 확인 타임아웃');
            // OAuth 완료 플래그 설정
            this.isOAuthInProgress = false;
            
            // 타임아웃 에러 이벤트
            const errorEvent = new CustomEvent('oauth-error', {
              detail: { message: '로그인 시간이 초과되었습니다. 다시 시도해주세요.' }
            });
            window.dispatchEvent(errorEvent);
          }
        };
        
        // 폴링 시작 (비동기로)
        startPolling();
        
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
      this.isOAuthInProgress = false;
      throw error;
    } finally {
      // 에러가 발생하면 플래그 리셋
      setTimeout(() => {
        this.isOAuthInProgress = false;
      }, 5000);
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

  // 세션 복원 (더 적극적인 버전)
  async restoreSession() {
    try {
      console.log('🔄 세션 복원 시도...');
      
      // 먼저 refreshSession 시도 (가장 효과적)
      try {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshData?.session) {
          console.log('✅ 세션 refresh 성공:', refreshData.session.user?.email);
          return refreshData.session;
        }
        
        if (refreshError) {
          console.log('⚠️ refresh 실패:', refreshError.message);
        }
      } catch (e) {
        console.log('⚠️ refresh 예외:', e);
      }
      
      // 현재 세션 확인
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ getSession 에러:', error);
      }
      
      if (session) {
        console.log('✅ 세션 확인 성공:', session.user?.email);
        return session;
      }
      
      // 사용자 정보 확인
      console.log('🔄 사용자 정보 확인');
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (user) {
          console.log('✅ 사용자 정보 확인됨:', user.email);
          
          // 다시 세션 확인 (getUser 호출 후 세션이 복원될 수 있음)
          const { data: { session: newSession } } = await supabase.auth.getSession();
          if (newSession) {
            console.log('✅ getUser 후 세션 확인 성공:', newSession.user?.email);
            return newSession;
          }
        }
      } catch (e) {
        console.log('⚠️ getUser 예외:', e);
      }
      
      // 쿠키나 로컬 스토리지에서 토큰 직접 확인
      console.log('🔄 저장된 토큰 확인');
      try {
        // Supabase는 기본적으로 localStorage를 사용
        const storageKey = `sb-${supabase.supabaseUrl.split('//')[1].split('.')[0]}-auth-token`;
        const storedData = localStorage.getItem(storageKey);
        
        if (storedData) {
          const parsed = JSON.parse(storedData);
          console.log('💾 저장된 토큰 발견, 유효성 확인 중...');
          
          // 저장된 토큰으로 세션 설정 시도
          if (parsed?.currentSession) {
            const { access_token, refresh_token } = parsed.currentSession;
            if (access_token && refresh_token) {
              try {
                const { data: sessionData, error: setError } = await supabase.auth.setSession({
                  access_token,
                  refresh_token
                });
                
                if (sessionData?.session) {
                  console.log('✅ 저장된 토큰으로 세션 복원 성공!');
                  return sessionData.session;
                }
              } catch (e) {
                console.log('⚠️ 저장된 토큰으로 세션 설정 실패:', e);
              }
            }
          }
        }
      } catch (e) {
        console.log('⚠️ 토큰 확인 예외:', e);
      }
      
      // 마지막으로 한 번 더 세션 확인
      await new Promise(resolve => setTimeout(resolve, 500));
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
  }
};
