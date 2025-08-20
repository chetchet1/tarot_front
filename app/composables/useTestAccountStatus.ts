import { computed, ComputedRef, unref } from 'vue';
import { isTestAccount, isPremiumTestAccount } from '../utils/test-account';

/**
 * 테스트 계정 상태를 통합 관리하는 컴포저블
 * DailyCard.vue의 중복된 테스트 계정 체크 로직을 통합
 */
export function useTestAccountStatus(email?: string | null | ComputedRef<string | null | undefined>) {
  // 한 번만 계산하여 재사용
  const isTest = computed(() => {
    const emailValue = unref(email);
    return isTestAccount(emailValue);
  });
  
  const isPremiumTest = computed(() => {
    const emailValue = unref(email);
    return isPremiumTestAccount(emailValue);
  });
  
  // 일반 테스트 계정 (무료)
  const isRegularTest = computed(() => isTest.value && !isPremiumTest.value);
  
  return {
    isTest,
    isPremiumTest,
    isRegularTest
  };
}
