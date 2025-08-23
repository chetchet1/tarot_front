/**
 * 테스트 계정 관련 유틸리티
 */

import { useUserStore } from '../store/user';
import { showAlert } from './alerts';

// 테스트 계정 정보
export const TEST_ACCOUNT = {
  email: 'test@example.com',
  password: 'testpassword123',
  userId: null as string | null  // 실제 로그인 후 설정됨
};

// 프리미엄 테스트 계정 정보
export const PREMIUM_TEST_ACCOUNT = {
  email: 'premium@example.com',
  password: 'premiumtest123',
  userId: null as string | null  // 실제 로그인 후 설정됨
};

/**
 * 테스트 계정 자동 로그인 (무료 테스트 계정)
 */
export async function ensureTestAccountLoggedIn() {
  const userStore = useUserStore();
  
  // 이미 테스트 계정으로 로그인되어 있는지 확인
  if (userStore.currentUser?.email === TEST_ACCOUNT.email) {
    console.log('테스트 계정 이미 로그인됨');
    console.log('현재 user ID:', userStore.currentUser.id);
    
    // 테스트 계정 userId 업데이트
    TEST_ACCOUNT.userId = userStore.currentUser.id;
    
    // 익명 사용자로 잘못 표시된 경우 수정
    if (userStore.currentUser.isAnonymous) {
      userStore.currentUser.isAnonymous = false;
    }
    
    // 무료 사용자로 설정
    if (userStore.currentUser.isPremium !== false) {
      userStore.currentUser.isPremium = false;
    }
    
    return true;
  }
  
  console.log('테스트 계정 자동 로그인 시도');
  
  try {
    // 테스트 계정으로 로그인 시도
    const result = await userStore.login(TEST_ACCOUNT.email, TEST_ACCOUNT.password);
    console.log('테스트 계정 로그인 성공');
    
    // 로그인 성공 후 실제 user ID 저장
    if (userStore.currentUser?.id) {
      TEST_ACCOUNT.userId = userStore.currentUser.id;
      console.log('테스트 계정 user ID 설정:', TEST_ACCOUNT.userId);
    }
    
    // 무료 사용자로 강제 설정
    if (userStore.currentUser) {
      userStore.currentUser.isPremium = false;
    }
    
    return true;
  } catch (error) {
    console.error('테스트 계정 로그인 실패:', error);
    
    // 계정이 없으면 생성 시도
    try {
      console.log('테스트 계정 신규 생성 시도');
      await userStore.signUp(TEST_ACCOUNT.email, TEST_ACCOUNT.password, { name: 'Test User' });
      
      // 생성 후 로그인
      await userStore.login(TEST_ACCOUNT.email, TEST_ACCOUNT.password);
      
      // 로그인 성공 후 실제 user ID 저장
      if (userStore.currentUser?.id) {
        TEST_ACCOUNT.userId = userStore.currentUser.id;
        console.log('신규 테스트 계정 user ID:', TEST_ACCOUNT.userId);
      }
      
      // 무료 사용자로 설정
      if (userStore.currentUser) {
        userStore.currentUser.isPremium = false;
      }
      
      console.log('테스트 계정 생성 및 로그인 성공');
      return true;
    } catch (registerError) {
      console.error('테스트 계정 생성 실패:', registerError);
      
      // 모든 방법이 실패하면 로컬 모드로 폴백
      console.log('로컬 테스트 모드로 폴백');
      const localUserId = 'local-test-' + Date.now();
      
      userStore.currentUser = {
        id: localUserId,
        email: TEST_ACCOUNT.email,
        name: 'Test User (Local)',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isAnonymous: false,
        isPremium: false,
        preferences: {
          theme: 'dark',
          language: 'ko',
          notifications: {
            dailyReading: true,
            weeklyInsight: false,
            promotions: true,
            newFeatures: false,
            weeklyReport: false
          },
          soundEnabled: true,
          vibrationEnabled: true,
          autoSaveReadings: true,
          privateProfile: false
        }
      };
      
      TEST_ACCOUNT.userId = localUserId;
      
      // 로컬 스토리지에 저장
      localStorage.setItem('tarot_user', JSON.stringify(userStore.currentUser));
      console.log('로컬 테스트 계정 생성 완료');
      
      return true;
    }
  }
}

/**
 * 테스트 계정인지 확인 (무료 + 프리미엄 모두)
 */
export function isTestAccount(email?: string | null): boolean {
  return email === TEST_ACCOUNT.email || email === PREMIUM_TEST_ACCOUNT.email;
}

/**
 * 프리미엄 테스트 계정인지 확인
 */
export function isPremiumTestAccount(email?: string | null): boolean {
  return email === PREMIUM_TEST_ACCOUNT.email;
}

/**
 * 프리미엄 테스트 계정 자동 로그인
 */
export async function ensurePremiumTestAccountLoggedIn() {
  const userStore = useUserStore();
  
  // 이미 프리미엄 테스트 계정으로 로그인되어 있는지 확인
  if (userStore.currentUser?.email === PREMIUM_TEST_ACCOUNT.email) {
    console.log('프리미엄 테스트 계정 이미 로그인됨');
    console.log('현재 user ID:', userStore.currentUser.id);
    
    // 프리미엄 테스트 계정 userId 업데이트
    PREMIUM_TEST_ACCOUNT.userId = userStore.currentUser.id;
    
    // 익명 사용자로 잘못 표시된 경우 수정
    if (userStore.currentUser.isAnonymous) {
      userStore.currentUser.isAnonymous = false;
    }
    
    // 프리미엄 사용자로 설정
    if (!userStore.currentUser.isPremium) {
      userStore.currentUser.isPremium = true;
    }
    
    // userStore의 프리미엄 상태도 업데이트
    // 프리미엄 상태는 computed이므로 currentUser.isPremium으로 설정됨
    
    return true;
  }
  
  console.log('프리미엄 테스트 계정 자동 로그인 시도');
  
  try {
    // 프리미엄 테스트 계정으로 로그인 시도
    const result = await userStore.login(PREMIUM_TEST_ACCOUNT.email, PREMIUM_TEST_ACCOUNT.password);
    console.log('프리미엄 테스트 계정 로그인 성공');
    
    // 로그인 성공 후 실제 user ID 저장
    if (userStore.currentUser?.id) {
      PREMIUM_TEST_ACCOUNT.userId = userStore.currentUser.id;
      console.log('프리미엄 테스트 계정 user ID 설정:', PREMIUM_TEST_ACCOUNT.userId);
    }
    
    // 프리미엄 사용자로 강제 설정
    if (userStore.currentUser) {
      userStore.currentUser.isPremium = true;
    }
    // 프리미엄 상태는 computed이므로 currentUser.isPremium으로 설정됨
    
    return true;
  } catch (error) {
    console.error('프리미엄 테스트 계정 로그인 실패:', error);
    
    // 계정이 없으면 생성 시도
    try {
      console.log('프리미엄 테스트 계정 신규 생성 시도');
      await userStore.signUp(PREMIUM_TEST_ACCOUNT.email, PREMIUM_TEST_ACCOUNT.password, { name: 'Premium Test User' });
      
      // 생성 후 로그인
      await userStore.login(PREMIUM_TEST_ACCOUNT.email, PREMIUM_TEST_ACCOUNT.password);
      
      // 로그인 성공 후 실제 user ID 저장
      if (userStore.currentUser?.id) {
        PREMIUM_TEST_ACCOUNT.userId = userStore.currentUser.id;
        console.log('신규 프리미엄 테스트 계정 user ID:', PREMIUM_TEST_ACCOUNT.userId);
      }
      
      // 프리미엄 사용자로 설정
      if (userStore.currentUser) {
        userStore.currentUser.isPremium = true;
      }
      // 프리미엄 상태는 computed이므로 currentUser.isPremium으로 설정됨
      
      console.log('프리미엄 테스트 계정 생성 및 로그인 성공');
      return true;
    } catch (registerError) {
      console.error('프리미엄 테스트 계정 생성 실패:', registerError);
      
      // 모든 방법이 실패하면 로컬 모드로 폴백
      console.log('로컬 프리미엄 테스트 모드로 폴백');
      const localUserId = 'local-premium-test-' + Date.now();
      
      userStore.currentUser = {
        id: localUserId,
        email: PREMIUM_TEST_ACCOUNT.email,
        name: 'Premium Test User (Local)',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isAnonymous: false,
        isPremium: true,  // 프리미엄으로 설정
        preferences: {
          theme: 'dark',
          language: 'ko',
          notifications: {
            dailyReading: true,
            weeklyInsight: false,
            promotions: false,  // 프리미엄은 광고 없음
            newFeatures: true,
            weeklyReport: true
          },
          soundEnabled: true,
          vibrationEnabled: true,
          autoSaveReadings: true,
          privateProfile: false
        }
      };
      
      // 프리미엄 상태는 computed이므로 currentUser.isPremium으로 설정됨
      PREMIUM_TEST_ACCOUNT.userId = localUserId;
      
      // 로컬 스토리지에 저장
      localStorage.setItem('tarot_user', JSON.stringify(userStore.currentUser));
      console.log('로컬 프리미엄 테스트 계정 생성 완료');
      
      return true;
    }
  }
}

/**
 * 테스트 계정 사용자 ID 가져오기
 */
export function getTestUserId(): string | null {
  // 실제 로그인된 user ID를 반환
  const userStore = useUserStore();
  if (userStore.currentUser?.email === TEST_ACCOUNT.email) {
    return userStore.currentUser.id;
  }
  return TEST_ACCOUNT.userId;
}
