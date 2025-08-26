import { supabase } from './supabase';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

/**
 * 모바일 전용 OAuth 서비스
 * Magic Link 방식으로 구현
 */
export const oauthMobileService = {
  isProcessing: false,
  
  /**
   * Google OAuth - Magic Link 방식
   */
  async signInWithGoogleMagicLink(email?: string) {
    // 이미 처리 중이면 무시
    if (this.isProcessing) {
      console.log('⚠️ 이미 로그인 처리 중');
      return { success: false };
    }
    
    try {
      this.isProcessing = true;
      
      if (!email) {
        // 이메일 입력 필요
        return { 
          success: false, 
          needsEmail: true,
          message: 'Google 계정 이메일을 입력해주세요'
        };
      }
      
      console.log('📧 Magic Link 전송 시작:', email);
      
      // Magic Link 전송
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
        }
      });
      
      if (error) {
        console.error('❌ Magic Link 전송 실패:', error);
        throw error;
      }
      
      console.log('✅ Magic Link 전송 성공');
      
      return { 
        success: true,
        message: '이메일로 로그인 링크를 전송했습니다. 이메일을 확인해주세요.'
      };
      
    } catch (error) {
      console.error('❌ Magic Link 로그인 실패:', error);
      return { success: false, error };
    } finally {
      this.isProcessing = false;
    }
  },
  
  /**
   * 기존 OAuth 방식 (테스트용 유지)
   */
  async signInWithGoogleOAuth() {
    if (this.isProcessing) {
      console.log('⚠️ 이미 OAuth 처리 중');
      return { success: false };
    }
    
    try {
      this.isProcessing = true;
      
      // 기존 세션 정리
      await supabase.auth.signOut();
      
      // OAuth URL 생성 (웹 리다이렉트)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://tarot-garden.vercel.app/oauth-bridge',
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });
      
      if (error) throw error;
      
      console.log('🌐 OAuth URL:', data.url);
      
      // 브라우저 열기
      await Browser.open({
        url: data.url,
        presentationStyle: 'popover'
      });
      
      // 세션 폴링 시작
      this.startSessionPolling();
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ OAuth 실패:', error);
      return { success: false, error };
    } finally {
      // 10초 후 플래그 리셋
      setTimeout(() => {
        this.isProcessing = false;
      }, 10000);
    }
  },
  
  /**
   * 세션 폴링
   */
  async startSessionPolling() {
    let attempts = 0;
    const maxAttempts = 30; // 30초
    
    const checkSession = async () => {
      if (attempts >= maxAttempts) {
        console.log('⏱️ 세션 확인 타임아웃');
        this.isProcessing = false;
        return;
      }
      
      attempts++;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('✅ 세션 확인 성공!');
        
        // 브라우저 닫기
        try {
          await Browser.close();
        } catch (e) {
          // 무시
        }
        
        // 성공 이벤트
        const event = new CustomEvent('oauth-success');
        window.dispatchEvent(event);
        
        this.isProcessing = false;
        return;
      }
      
      // 1초 후 재시도
      setTimeout(checkSession, 1000);
    };
    
    // 3초 후 시작
    setTimeout(checkSession, 3000);
  }
};