import { Purchases, PurchasesOffering, PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { useUserStore } from '../store/user';
import { subscriptionService } from './supabase';

// RevenueCat 초기화
export const initializeRevenueCat = async () => {
  const apiKey = import.meta.env.VITE_REVENUECAT_IOS_KEY || 'appl_xxxxx';
  // Android의 경우 다른 키 사용
  // const apiKey = import.meta.env.VITE_REVENUECAT_ANDROID_KEY || 'goog_xxxxx';

  await Purchases.configure(apiKey);
  
  // 사용자 ID 설정 (Supabase Auth ID 사용)
  const userStore = useUserStore();
  if (userStore.currentUser && !userStore.currentUser.isAnonymous) {
    await Purchases.logIn(userStore.currentUser.id);
  }
};

// 구독 상품 정보
export const SUBSCRIPTION_PRODUCTS = {
  monthly: {
    id: 'tarot_premium_monthly',
    price: 2900,
    currency: 'KRW',
    period: 'monthly'
  },
  yearly: {
    id: 'tarot_premium_yearly', 
    price: 29900,
    currency: 'KRW',
    period: 'yearly'
  }
};

// 구독 상품 가져오기
export const getOfferings = async (): Promise<PurchasesOffering[]> => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.all;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return [];
  }
};

// 구독 구매
export const purchaseSubscription = async (packageToPurchase: PurchasesPackage) => {
  try {
    const userStore = useUserStore();
    
    // 구매 진행
    const purchaseResult = await Purchases.purchasePackage(packageToPurchase);
    
    // 구매 성공시 백엔드 업데이트
    if (purchaseResult.customerInfo.activeSubscriptions.length > 0) {
      // Supabase에 구독 정보 저장
      await subscriptionService.createSubscription({
        user_id: userStore.currentUser?.id,
        plan: packageToPurchase.identifier.includes('yearly') ? 'yearly' : 'monthly',
        status: 'active',
        price: packageToPurchase.product.price,
        currency: packageToPurchase.product.currencyCode,
        platform_order_id: purchaseResult.transaction?.transactionIdentifier,
        start_date: new Date(),
        end_date: getSubscriptionEndDate(packageToPurchase.identifier)
      });
      
      // 로컬 상태 업데이트
      userStore.updateSubscription({
        id: purchaseResult.transaction?.transactionIdentifier || '',
        userId: userStore.currentUser?.id || '',
        plan: packageToPurchase.identifier.includes('yearly') ? 'yearly' : 'monthly',
        status: 'active',
        startDate: new Date(),
        endDate: getSubscriptionEndDate(packageToPurchase.identifier),
        price: packageToPurchase.product.price,
        currency: packageToPurchase.product.currencyCode
      });
      
      return { success: true, customerInfo: purchaseResult.customerInfo };
    }
    
    return { success: false, error: 'No active subscription found' };
  } catch (error) {
    console.error('Purchase failed:', error);
    return { success: false, error };
  }
};

// 구독 복원
export const restoreSubscription = async () => {
  try {
    const userStore = useUserStore();
    const customerInfo = await Purchases.restorePurchases();
    
    if (customerInfo.activeSubscriptions.length > 0) {
      // 활성 구독이 있으면 상태 업데이트
      const activeSubscription = customerInfo.activeSubscriptions[0];
      
      // 백엔드에서 구독 정보 가져오기
      const subscription = await subscriptionService.getCurrentSubscription(
        userStore.currentUser?.id || ''
      );
      
      if (subscription) {
        userStore.updateSubscription(subscription);
      }
      
      return { success: true, customerInfo };
    }
    
    return { success: false, error: 'No active subscription to restore' };
  } catch (error) {
    console.error('Restore failed:', error);
    return { success: false, error };
  }
};

// 구독 상태 확인
export const checkSubscriptionStatus = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.activeSubscriptions.length > 0;
  } catch (error) {
    console.error('Failed to check subscription status:', error);
    return false;
  }
};

// 구독 취소
export const cancelSubscription = async () => {
  try {
    const userStore = useUserStore();
    
    // RevenueCat은 구독 취소를 직접 지원하지 않음
    // 사용자를 앱스토어/구글플레이 구독 관리 페이지로 안내
    if (true) { // iOS 체크는 Capacitor.getPlatform()으로 할 수 있음
      // iOS 구독 관리 페이지 열기
      await Purchases.showManageSubscriptions();
    } else {
      // Android는 구글 플레이 구독 페이지로 이동
      // 실제 구현시 URL scheme 사용
    }
    
    // 백엔드 상태는 웹훅으로 업데이트됨
    return { success: true };
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    return { success: false, error };
  }
};

// 구독 종료일 계산
const getSubscriptionEndDate = (productId: string): Date => {
  const now = new Date();
  if (productId.includes('yearly')) {
    return new Date(now.setFullYear(now.getFullYear() + 1));
  } else {
    return new Date(now.setMonth(now.getMonth() + 1));
  }
};

// 구독 혜택 확인
export const getSubscriptionBenefits = () => {
  return {
    removeAds: true,
    premiumSpreads: true,
    unlimitedHistory: true,
    shareResults: true,
    exclusiveCardDesigns: true,
    prioritySupport: true
  };
};

// 가격 포맷팅
export const formatPrice = (price: number, currency: string): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency || 'KRW'
  }).format(price);
};
