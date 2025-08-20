/**
 * 프리미엄 테스트 계정 헬퍼
 * 프리미엄 테스트 계정 로그인 및 상태 관리
 */

import { useUserStore } from '../store/user';
import { ensurePremiumTestAccountLoggedIn } from './test-account';

/**
 * 프리미엄 테스트 계정으로 로그인하고 프리미엄 상태 확인
 */
export async function loginAsPremiumTest(): Promise<boolean> {
  const userStore = useUserStore();
  
  try {
    console.log('🎯 프리미엄 테스트 계정 로그인 시작');
    
    // 프리미엄 테스트 계정으로 로그인
    await ensurePremiumTestAccountLoggedIn();
    
    // 로그인 성공 후 프리미엄 상태 재확인 및 강제 설정
    if (userStore.currentUser?.email === 'premium@example.com') {
      console.log('✅ 프리미엄 테스트 계정 로그인 성공');
      
      // 프리미엄 상태 강제 설정 (computed property 우회)
      if (userStore.currentUser) {
        userStore.currentUser.isPremium = true;
      }
      
      // userStore에 직접 프리미엄 상태 반영 (computed property 업데이트)
      (userStore as any)._isPremium = true;
      
      console.log('🎯 프리미엄 상태 확인:', {
        email: userStore.currentUser?.email,
        isPremium: userStore.currentUser?.isPremium,
        computedPremium: userStore.isPremium
      });
      
      return true;
    }
    
    console.error('❌ 프리미엄 테스트 계정 로그인 실패');
    return false;
  } catch (error) {
    console.error('프리미엄 테스트 계정 로그인 오류:', error);
    return false;
  }
}

/**
 * 현재 사용자가 프리미엄 테스트 계정인지 확인
 */
export function isCurrentUserPremiumTest(): boolean {
  const userStore = useUserStore();
  return userStore.currentUser?.email === 'premium@example.com';
}

/**
 * 프리미엄 상태를 강제로 설정 (테스트용)
 */
export function forcePremiumStatus(isPremium: boolean): void {
  const userStore = useUserStore();
  
  if (userStore.currentUser) {
    userStore.currentUser.isPremium = isPremium;
    console.log(`🔧 프리미엄 상태 강제 설정: ${isPremium}`);
  }
}
