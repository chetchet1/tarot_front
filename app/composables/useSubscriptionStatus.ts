import { computed } from 'vue';
import { useUserStore } from '../store/user';

/**
 * 구독 상태와 관련된 로직을 관리하는 컴포저블
 */
export const useSubscriptionStatus = () => {
  const userStore = useUserStore();
  
  const isSubscribed = computed(() => userStore.isPremium);
  const showAds = computed(() => !userStore.isPremium);
  const canAccessPremiumFeatures = computed(() => userStore.isPremium);
  
  return {
    isSubscribed,
    showAds,
    canAccessPremiumFeatures
  };
};
