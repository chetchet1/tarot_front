import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Storage } from '@capacitor/storage';
import { supabase } from './supabase';
import router from '../router';
import { showToast } from '../utils/toast';

// OAuth 상태 관리
interface OAuthState {
  isInProgress: boolean;
  startTime: number;
  provider: string;
}

let oauthState: OAuthState | null = null;

// 모바일 OAuth 헬퍼
export const mobileOAuth = {
  // OAuth 상태 확인
  isOAuthInProgress(): boolean {
    if (!oauthState) return false;
    
    // 5분 이상 경과하면 만료로 처리
    const elapsed = Date.now() - oauthState.startTime;
    if (elapsed > 5 * 60 * 1000) {
      oauthState = null;
      return false;
    }
    
    return oauthState.isInProgress;
  },
  
  // Google 로그인
  async signInWithGoogle() {
    // 이미 OAuth 진행 중이면 중복 실행 방지
    if (this.isOAuthInProgress()) {
      showToast('로그인이 이미 진행 중입니다', 'warning');
      return;
    }
    
    if (Capacitor.isNativePlatform()) {
      try {
        console.log('🚀 Starting mobile Google OAuth...');
        
        // OAuth 상태 시작
        oauthState = {
          isInProgress: true,
          startTime: Date.now(),
          provider: 'google'
        };
        
        // 네트워크 연결 확인
        const networkStatus = await this.checkNetworkConnection();
        if (!networkStatus) {
          throw new Error('네트워크 연결을 확인해주세요');
        }
        
        // OAuth URL 생성
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: 'com.tarotgarden.app://auth/callback',
            skipBrowserRedirect: true,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent'
            }
          }
        });

        if (error) throw error;
        
        console.log('🌐 OAuth URL generated:', data?.url?.substring(0, 50) + '...');
        
        // 브라우저 열기 전에 리스너 설정
        const cleanup = await this.setupBrowserListener();
        
        // OAuth 상태 저장 (앱이 백그라운드로 갔다가 돌아올 때를 대비)
        await Storage.set({
          key: 'oauth_pending',
          value: JSON.stringify({
            provider: 'google',
            timestamp: Date.now()
          })
        });
        
        // 브라우저에서 OAuth URL 열기
        if (data?.url) {
          console.log('🌍 Opening browser for OAuth...');
          await Browser.open({ 
            url: data.url,
            presentationStyle: 'popover',
            windowName: '_blank',
            toolbarColor: '#1a1a1a' // 다크 테마
          });
        }
        
        // 타임아웃 처리 (3분)
        const timeoutId = setTimeout(() => {
          cleanup();
          oauthState = null;
          showToast('로그인 시간이 초과되었습니다', 'error');
          
          // OAuth 에러 이벤트 발생
          window.dispatchEvent(new CustomEvent('oauth-error', {
            detail: { message: '로그인 시간이 초과되었습니다' }
          }));
        }, 180000);
        
        // cleanup 함수에 타임아웃 클리어 추가
        return () => {
          clearTimeout(timeoutId);
          cleanup();
        };
      } catch (error: any) {
        oauthState = null;
        console.error('🔴 Mobile OAuth error:', error);
        
        // 사용자 친화적 에러 메시지
        const message = this.getErrorMessage(error);
        showToast(message, 'error');
        throw error;
      }
    } else {
      // 웹에서는 기존 방식 사용
      return supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
    }
  },
  
  // 브라우저 이벤트 리스너 설정
  async setupBrowserListener() {
    let checkSessionAttempts = 0;
    const maxAttempts = 10;
    
    // 세션 체크 함수
    const checkSession = async () => {
    checkSessionAttempts++;
    console.log(`🔍 Session check attempt ${checkSessionAttempts}/${maxAttempts}`);
    
    try {
    // OAuth 후에만 세션 확인 (자동 복원 방지)
    let { data: { session }, error } = await supabase.auth.getSession();
    
    // 세션이 없을 때는 refresh 시도하지 않음
    if (!session) {
    console.log('📄 No session found after OAuth');
    }
        
        if (session) {
          console.log('✅ Login successful!', session.user?.email);
          oauthState = null;
          
          // 펜딩 OAuth 상태 제거
          await Storage.remove({ key: 'oauth_pending' });
          
          // 성공 메시지
          showToast('로그인되었습니다', 'success');
          
          // OAuth 성공 이벤트 발생 (LoginModal이 대기중)
          window.dispatchEvent(new CustomEvent('oauth-success'));
          
          // 라우터 업데이트 전 약간의 딜레이
          setTimeout(() => {
            // 현재 경로 확인
            const currentPath = router.currentRoute.value.path;
            console.log('📍 Current path:', currentPath);
            
            // 로그인 페이지에서만 홈으로 이동
            if (currentPath === '/login' || currentPath === '/') {
              router.push('/home');
            }
          }, 100);
          
          return true;
        }
        
        // 최대 시도 횟수 도달
        if (checkSessionAttempts >= maxAttempts) {
          console.log('❌ Max session check attempts reached');
          oauthState = null;
          showToast('로그인 처리 중 문제가 발생했습니다', 'error');
          
          // OAuth 에러 이벤트 발생
          window.dispatchEvent(new CustomEvent('oauth-error', {
            detail: { message: '로그인 처리 중 문제가 발생했습니다' }
          }));
          
          return false;
        }
        
        // 재시도 (점진적으로 간격 늘리기)
        const delay = Math.min(checkSessionAttempts * 500, 2000);
        console.log(`⏰ Retrying in ${delay}ms...`);
        setTimeout(() => checkSession(), delay);
      } catch (error) {
        console.error('Session check error:', error);
        
        // 에러 발생해도 재시도
        if (checkSessionAttempts < maxAttempts) {
          setTimeout(() => checkSession(), 1500);
        } else {
          oauthState = null;
          showToast('로그인 중 오류가 발생했습니다', 'error');
          
          // OAuth 에러 이벤트 발생
          window.dispatchEvent(new CustomEvent('oauth-error', {
            detail: { message: '로그인 중 오류가 발생했습니다' }
          }));
        }
      }
    };
    
    // 브라우저가 닫혔을 때 처리
    const browserFinishedListener = await Browser.addListener('browserFinished', () => {
      console.log('🔍 Browser closed, starting session check...');
      console.log('🕒 Current time:', new Date().toISOString());
      
      // 딜레이 후 세션 체크 시작
      setTimeout(() => {
        console.log('🔄 Starting checkSession after delay...');
        checkSession();
      }, 500);
    });
    
    // 페이지 로드 완료 리스너
    const pageLoadedListener = await Browser.addListener('browserPageLoaded', () => {
      console.log('📄 OAuth page loaded');
    });
    
    // cleanup 함수 반환
    return () => {
      browserFinishedListener.remove();
      pageLoadedListener.remove();
      oauthState = null;
    };
  },
  
  // 네트워크 연결 확인
  async checkNetworkConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://www.google.com/favicon.ico', {
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch (error) {
      return false;
    }
  },
  
  // 에러 메시지 변환
  getErrorMessage(error: any): string {
    const message = error.message || error.toString();
    
    if (message.includes('network') || message.includes('fetch')) {
      return '네트워크 연결을 확인해주세요';
    }
    if (message.includes('cancelled') || message.includes('closed')) {
      return '로그인이 취소되었습니다';
    }
    if (message.includes('redirect_uri')) {
      return '로그인 설정에 문제가 있습니다. 잠시 후 다시 시도해주세요';
    }
    if (message.includes('timeout')) {
      return '로그인 시간이 초과되었습니다';
    }
    
    return '로그인 중 문제가 발생했습니다. 다시 시도해주세요';
  },
  
  // 앱 재시작 시 펜딩 OAuth 체크
  async checkPendingOAuth() {
    try {
      const { value } = await Storage.get({ key: 'oauth_pending' });
      if (!value) return;
      
      const pending = JSON.parse(value);
      
      // 10분 이내의 펜딩 OAuth만 처리
      if (Date.now() - pending.timestamp < 10 * 60 * 1000) {
        console.log('🔄 Checking pending OAuth...');
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await Storage.remove({ key: 'oauth_pending' });
          showToast('로그인되었습니다', 'success');
          router.push('/');
        }
      } else {
        // 오래된 펜딩 제거
        await Storage.remove({ key: 'oauth_pending' });
      }
    } catch (error) {
      console.error('Check pending OAuth error:', error);
    }
  }
};

// 앱 시작 시 펜딩 OAuth 체크
if (Capacitor.isNativePlatform()) {
  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      mobileOAuth.checkPendingOAuth();
    }
  });
}
