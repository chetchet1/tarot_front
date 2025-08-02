// OAuth 디버깅 유틸리티
import { Capacitor } from '@capacitor/core';
import { supabase } from '../services/supabase';

export const authDebug = {
  // 현재 인증 상태 출력
  async logAuthState() {
    console.log('=== 🔍 인증 상태 디버그 ===');
    console.log('플랫폼:', Capacitor.isNativePlatform() ? '모바일' : '웹');
    
    // Supabase 세션 확인
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Supabase 세션:', session ? {
        user: session.user?.email,
        provider: session.user?.app_metadata?.provider,
        expiresAt: new Date(session.expires_at! * 1000).toLocaleString()
      } : 'null');
    } catch (error) {
      console.error('Supabase 세션 확인 실패:', error);
    }
    
    // localStorage 확인
    const savedUser = localStorage.getItem('tarot_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('localStorage 사용자:', {
          id: userData.id,
          isAnonymous: userData.isAnonymous,
          email: userData.email || 'none',
          isPremium: userData.isPremium
        });
      } catch (e) {
        console.error('localStorage 파싱 실패:', e);
      }
    } else {
      console.log('localStorage 사용자: null');
    }
    
    console.log('=== 디버그 종료 ===');
  },
  
  // 세션 정리
  async clearSession() {
    console.log('🧹 세션 정리 시작...');
    
    // Supabase 로그아웃
    try {
      await supabase.auth.signOut();
      console.log('✅ Supabase 로그아웃 완료');
    } catch (error) {
      console.error('❌ Supabase 로그아웃 실패:', error);
    }
    
    // localStorage 정리
    localStorage.removeItem('tarot_user');
    localStorage.removeItem('supabase.auth.token');
    console.log('✅ localStorage 정리 완료');
    
    await this.logAuthState();
  }
};

// 전역에서 사용할 수 있도록 설정
if (typeof window !== 'undefined') {
  (window as any).authDebug = authDebug;
}
