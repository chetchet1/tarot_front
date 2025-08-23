// 웹용 구독 서비스 - Toss Payments나 Stripe 연동
import { Platform } from '../utils/platform';
import { useUserStore } from '../store/user';
import { subscriptionService } from './supabase';

// 구독 상품 정보
export const SUBSCRIPTION_PRODUCTS = {
  monthly: {
    id: 'tarot_premium_monthly',
    price: 2900,
    currency: 'KRW',
    period: 'monthly',
    displayPrice: '₩2,900/월'
  },
  yearly: {
    id: 'tarot_premium_yearly', 
    price: 29900,
    currency: 'KRW',
    period: 'yearly',
    displayPrice: '₩29,900/년',
    discountText: '12개월 기준 17% 할인'
  }
};

// 결제 방법
export const PAYMENT_METHODS = {
  card: { id: 'card', name: '신용/체크카드', icon: '💳' },
  bank: { id: 'bank', name: '무통장입금', icon: '🏦' },
  kakao: { id: 'kakaopay', name: '카카오페이', icon: '💬' },
  toss: { id: 'tosspay', name: '토스페이', icon: '💸' }
};

// 웹용 구독 서비스 클래스
class WebSubscriptionService {
  private isInitialized = false;

  // 초기화
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      console.log('🌐 [Web] 결제 서비스 초기화...');
      
      // 개발 환경에서는 SDK 로드 건너뛰기
      if (process.env.NODE_ENV !== 'development') {
        // 결제 SDK 로드 (예: Toss Payments)
        await this.loadPaymentSDK();
      } else {
        console.log('🌐 [Web] 개발 모드 - SDK 로드 건너뛰기');
      }
      
      this.isInitialized = true;
      console.log('🌐 [Web] 결제 서비스 초기화 완료');
    } catch (error) {
      console.error('🌐 [Web] 결제 서비스 초기화 실패:', error);
      throw error;
    }
  }

  // 결제 SDK 로드
  private async loadPaymentSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Toss Payments SDK 예시
      const script = document.createElement('script');
      script.src = 'https://js.tosspayments.com/v1/payment';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load payment SDK'));
      document.head.appendChild(script);
    });
  }

  // 구독 구매
  async purchaseSubscription(productId: string, paymentMethod: string): Promise<{
    success: boolean;
    error?: any;
    subscription?: any;
  }> {
    try {
      const userStore = useUserStore();
      const product = SUBSCRIPTION_PRODUCTS[productId as keyof typeof SUBSCRIPTION_PRODUCTS];
      
      if (!product) {
        throw new Error('Invalid product ID');
      }

      console.log(`🌐 [Web] 구독 구매 시작: ${productId}, 결제수단: ${paymentMethod}`);

      // 주문 ID 생성
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 결제 요청 데이터
      const paymentData = {
        amount: product.price,
        orderId,
        orderName: `타로카드 프리미엄 구독 (${product.period})`,
        customerName: userStore.currentUser?.name || '고객',
        customerEmail: userStore.currentUser?.email || '',
        successUrl: `${window.location.origin}/payment-success`,
        failUrl: `${window.location.origin}/payment-fail`,
        method: paymentMethod
      };

      // 실제 결제 진행 (Toss Payments 예시)
      const paymentResult = await this.processPayment(paymentData);

      if (paymentResult.success) {
        try {
          // 백엔드에 구독 정보 저장 시도
          let subscription;
          try {
            subscription = await subscriptionService.createSubscription({
              user_id: userStore.currentUser?.id,
              plan: product.period,
              status: 'active',
              price: product.price,
              currency: product.currency,
              platform_order_id: orderId,
              payment_method: paymentMethod,
              start_date: new Date(),
              end_date: this.getSubscriptionEndDate(product.period)
            });
          } catch (subError) {
            console.warn('🌐 [Web] 구독 테이블 없음, 프로필 업데이트로 대체');
            
            // subscriptions 테이블이 없으면 프로필만 업데이트
            const { profileService } = await import('./supabase');
            await profileService.updatePremiumStatus(
              userStore.currentUser?.id || '',
              true
            );
          }

          // 로컬 상태 업데이트 (프리미엄 상태로 변경)
          await userStore.refreshPremiumStatus();

          console.log('🌐 [Web] 구독 구매 성공');
          return { success: true, subscription };
        } catch (error) {
          console.error('🌐 [Web] 구독 처리 중 오류:', error);
          return { success: false, error };
        }
      }

      return { success: false, error: paymentResult.error };
    } catch (error) {
      console.error('🌐 [Web] 구독 구매 실패:', error);
      return { success: false, error };
    }
  }

  // 실제 결제 처리 (Toss Payments 예시)
  private async processPayment(paymentData: any): Promise<{ success: boolean; error?: any }> {
    try {
      // 개발 모드에서는 모킹
      if (process.env.NODE_ENV === 'development') {
        console.log('🌐 [Web] 개발 모드 - 결제 모킹');
        console.log('🌐 [Web] 결제 데이터:', paymentData);
        
        // 테스트 계정에 대해서는 항상 성공
        const userStore = useUserStore();
        const isTestAccount = userStore.currentUser?.email === 'test@example.com' || 
                              userStore.currentUser?.email === 'premium@example.com';
        
        if (isTestAccount) {
          console.log('🌐 [Web] 테스트 계정 결제 - 자동 승인');
          return new Promise(resolve => {
            setTimeout(() => {
              resolve({ success: true });
            }, 1000);
          });
        }
        
        // 일반 개발 모드 결제 모킹
        return new Promise(resolve => {
          setTimeout(() => {
            // 80% 확률로 성공
            const success = Math.random() > 0.2;
            resolve({ 
              success, 
              error: success ? undefined : '개발 모드 테스트 결제 실패' 
            });
          }, 2000);
        });
      }

      // 실제 결제 로직
      // const tossPayments = new TossPayments('YOUR_CLIENT_KEY');
      // const result = await tossPayments.requestPayment(paymentData.method, paymentData);
      
      // 임시로 성공 반환 (실제 구현시 교체)
      console.log('🌐 [Web] 프로덕션 모드 - 실제 결제 API 호출 필요');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  // 구독 복원 (웹에서는 로그인 시 자동 확인)
  async restoreSubscription(): Promise<{ success: boolean; error?: any }> {
    try {
      const userStore = useUserStore();
      
      if (!userStore.currentUser) {
        return { success: false, error: 'User not logged in' };
      }

      // 구독 정보 확인 시도
      try {
        const subscription = await subscriptionService.getCurrentSubscription(
          userStore.currentUser.id
        );

        if (subscription && subscription.status === 'active') {
          // 프리미엄 상태 업데이트
          await userStore.refreshPremiumStatus();
          console.log('🌐 [Web] 구독 복원 성공');
          return { success: true };
        }
      } catch (error) {
        console.warn('🌐 [Web] 구독 복원 실패:', error);
      }
      
      // 프리미엄 상태만 확인
      await userStore.refreshPremiumStatus();
      
      if (userStore.isPremium) {
        return { success: true };
      }

      return { success: false, error: 'No active subscription found' };
    } catch (error) {
      console.error('🌐 [Web] 구독 복원 실패:', error);
      return { success: false, error };
    }
  }

  // 구독 취소
  async cancelSubscription(): Promise<{ success: boolean; error?: any }> {
    try {
      const userStore = useUserStore();
      
      // 현재 구독 정보 가져오기 시도
      let subscription;
      try {
        subscription = await subscriptionService.getCurrentSubscription(userStore.currentUser.id);
      } catch (error) {
        console.warn('🌐 [Web] 구독 조회 실패, 프리미엄 상태만 취소');
      }
      
      if (subscription) {
        // 백엔드에서 구독 취소 처리
        try {
          await subscriptionService.cancelSubscription(subscription.id);
        } catch (error) {
          console.warn('🌐 [Web] 구독 취소 실패:', error);
        }
      }
      
      // 프리미엄 상태를 false로 업데이트
      const { profileService } = await import('./supabase');
      await profileService.updatePremiumStatus(
        userStore.currentUser?.id || '',
        false
      );

      // 로컬 상태 업데이트
      await userStore.refreshPremiumStatus();

      console.log('🌐 [Web] 구독 취소 성공');
      return { success: true };
    } catch (error) {
      console.error('🌐 [Web] 구독 취소 실패:', error);
      return { success: false, error };
    }
  }

  // 구독 종료일 계산
  private getSubscriptionEndDate(period: string): Date {
    const now = new Date();
    if (period === 'yearly') {
      return new Date(now.setFullYear(now.getFullYear() + 1));
    } else {
      return new Date(now.setMonth(now.getMonth() + 1));
    }
  }

  // 구독 상태 확인
  async checkSubscriptionStatus(): Promise<boolean> {
    try {
      const userStore = useUserStore();
      
      if (!userStore.currentUser) return false;

      const subscription = await subscriptionService.getCurrentSubscription(
        userStore.currentUser.id
      );

      return subscription && subscription.status === 'active';
    } catch (error) {
      console.error('🌐 [Web] 구독 상태 확인 실패:', error);
      return false;
    }
  }
}

// 모바일용 구독 서비스 임포트
class MobileSubscriptionService {
  async initialize(): Promise<void> {
    // 모바일 전용 RevenueCat 초기화
    const { initializeRevenueCat } = await import('./purchases');
    return initializeRevenueCat();
  }

  async purchaseSubscription(productId: string): Promise<{ success: boolean; error?: any }> {
    const { getOfferings, purchaseSubscription } = await import('./purchases');
    
    try {
      const offerings = await getOfferings();
      const targetOffering = offerings.find(o => 
        o.availablePackages.some(p => p.identifier === productId)
      );
      
      if (!targetOffering) {
        throw new Error('Product not found');
      }

      const packageToPurchase = targetOffering.availablePackages.find(
        p => p.identifier === productId
      );

      if (!packageToPurchase) {
        throw new Error('Package not found');
      }

      return await purchaseSubscription(packageToPurchase);
    } catch (error) {
      return { success: false, error };
    }
  }

  async restoreSubscription(): Promise<{ success: boolean; error?: any }> {
    const { restoreSubscription } = await import('./purchases');
    return restoreSubscription();
  }

  async cancelSubscription(): Promise<{ success: boolean; error?: any }> {
    const { cancelSubscription } = await import('./purchases');
    return cancelSubscription();
  }

  async checkSubscriptionStatus(): Promise<boolean> {
    const { checkSubscriptionStatus } = await import('./purchases');
    return checkSubscriptionStatus();
  }
}

// 플랫폼별 서비스 생성
const createSubscriptionService = () => {
  if (Platform.isWeb) {
    return new WebSubscriptionService();
  } else {
    return new MobileSubscriptionService();
  }
};

// 싱글톤 인스턴스
const subscriptionServiceInstance = createSubscriptionService();

// 외부 노출 함수들
export const initializeSubscription = () => subscriptionServiceInstance.initialize();
export const purchaseSubscription = (productId: string, paymentMethod?: string) => 
  subscriptionServiceInstance.purchaseSubscription(productId, paymentMethod);
export const restoreSubscription = () => subscriptionServiceInstance.restoreSubscription();
export const cancelSubscription = () => subscriptionServiceInstance.cancelSubscription();
export const checkSubscriptionStatus = () => subscriptionServiceInstance.checkSubscriptionStatus();

// 구독 혜택 정보
export const getSubscriptionBenefits = () => {
  return {
    removeAds: '광고 제거',
    premiumSpreads: '프리미엄 배열법 사용',
    unlimitedHistory: '무제한 히스토리 저장',
    shareResults: '결과 공유 기능',
    exclusiveCardDesigns: '독점 카드 디자인',
    prioritySupport: '우선 고객 지원'
  };
};

// 가격 포맷팅
export const formatPrice = (price: number, currency: string = 'KRW'): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency
  }).format(price);
};

// 할인율 계산
export const calculateDiscount = (): number => {
  const monthlyAnnual = SUBSCRIPTION_PRODUCTS.monthly.price * 12;
  const yearly = SUBSCRIPTION_PRODUCTS.yearly.price;
  return Math.round(((monthlyAnnual - yearly) / monthlyAnnual) * 100);
};

export default subscriptionServiceInstance;
