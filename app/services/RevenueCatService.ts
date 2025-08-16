// RevenueCat Payment Service for handling in-app purchases
import { Purchases, CustomerInfo, PurchasesOffering, PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { supabase } from './supabase';
import { useUserStore } from '../store/user';
import { Capacitor } from '@capacitor/core';

export interface Subscription {
  id: string;
  user_id: string;
  product_id: string;
  platform: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  starts_at: string;
  expires_at: string;
  price_amount: number;
  currency: string;
  auto_renew: boolean;
}

export interface PaymentProduct {
  id: string;
  identifier: string;
  priceString: string;
  priceAmount: number;
  currency: string;
  title: string;
  description: string;
  period?: string;
  introPrice?: string;
  packageType?: string;
}

class RevenueCatService {
  private initialized = false;
  private currentOffering: PurchasesOffering | null = null;
  
  // RevenueCat API Keys
  private readonly API_KEYS = {
    android: import.meta.env.VITE_REVENUECAT_ANDROID_KEY || '',
    ios: import.meta.env.VITE_REVENUECAT_IOS_KEY || ''
  };

  // 상품 ID 정의 (RevenueCat에서 설정한 ID와 일치해야 함)
  public readonly PRODUCTS = {
    MONTHLY: 'monthly_premium',
    YEARLY: 'yearly_premium'
  };

  constructor() {}

  /**
   * RevenueCat 초기화
   */
  async initialize(): Promise<void> {
    if (this.initialized || !Capacitor.isNativePlatform()) {
      return;
    }

    try {
      const platform = Capacitor.getPlatform();
      const apiKey = platform === 'ios' ? this.API_KEYS.ios : this.API_KEYS.android;

      if (!apiKey) {
        throw new Error('RevenueCat API key not configured');
      }

      // RevenueCat 초기화
      await Purchases.configure({
        apiKey,
        appUserID: null // RevenueCat이 자동으로 ID 생성
      });

      // 로그인한 사용자가 있으면 RevenueCat에 연결
      const userStore = useUserStore();
      if (userStore.currentUser?.id) {
        await this.loginUser(userStore.currentUser.id);
      }

      // 현재 상품 정보 로드
      await this.loadOfferings();

      this.initialized = true;
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      throw error;
    }
  }

  /**
   * 사용자 로그인 (RevenueCat과 연결)
   */
  async loginUser(userId: string): Promise<void> {
    try {
      await Purchases.logIn({ appUserID: userId });
      console.log('User logged in to RevenueCat:', userId);
    } catch (error) {
      console.error('Failed to login user to RevenueCat:', error);
    }
  }

  /**
   * 사용자 로그아웃
   */
  async logoutUser(): Promise<void> {
    try {
      await Purchases.logOut();
      console.log('User logged out from RevenueCat');
    } catch (error) {
      console.error('Failed to logout user from RevenueCat:', error);
    }
  }

  /**
   * 상품 정보 로드
   */
  private async loadOfferings(): Promise<void> {
    try {
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current) {
        this.currentOffering = offerings.current;
        console.log('Loaded offerings:', this.currentOffering);
      }
    } catch (error) {
      console.error('Failed to load offerings:', error);
    }
  }

  /**
   * 상품 목록 가져오기
   */
  getProducts(): PaymentProduct[] {
    if (!this.currentOffering) {
      return [];
    }

    return this.currentOffering.availablePackages.map(pkg => ({
      id: pkg.identifier,
      identifier: pkg.product.identifier,
      priceString: pkg.product.priceString,
      priceAmount: pkg.product.price,
      currency: pkg.product.currencyCode || 'KRW',
      title: pkg.product.title,
      description: pkg.product.description,
      period: this.getProductPeriod(pkg.identifier),
      packageType: pkg.packageType
    }));
  }

  /**
   * 특정 상품 가져오기
   */
  getProduct(productId: string): PaymentProduct | undefined {
    const products = this.getProducts();
    return products.find(p => p.identifier === productId || p.id === productId);
  }

  /**
   * 상품 기간 확인
   */
  private getProductPeriod(identifier: string): string {
    if (identifier.includes('monthly') || identifier.includes('MONTHLY')) {
      return 'month';
    } else if (identifier.includes('yearly') || identifier.includes('YEARLY') || identifier.includes('annual')) {
      return 'year';
    }
    return 'unknown';
  }

  /**
   * 구독 구매
   */
  async purchase(productId: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('RevenueCat not initialized');
    }

    if (!this.currentOffering) {
      await this.loadOfferings();
    }

    const pkg = this.currentOffering?.availablePackages.find(
      p => p.identifier === productId || p.product.identifier === productId
    );

    if (!pkg) {
      throw new Error('Product not found');
    }

    try {
      const purchaseResult = await Purchases.purchasePackage({ aPackage: pkg });
      
      // 구매 성공 후 DB에 저장
      await this.savePurchaseToDatabase(purchaseResult.customerInfo, pkg);
      
      console.log('Purchase successful:', purchaseResult);
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('Purchase cancelled by user');
        throw new Error('구매가 취소되었습니다.');
      }
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  /**
   * 구매 정보를 DB에 저장
   */
  private async savePurchaseToDatabase(customerInfo: CustomerInfo, pkg: PurchasesPackage): Promise<void> {
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    // 활성 구독 확인
    const activeSubscription = Object.values(customerInfo.entitlements.active)[0];
    if (!activeSubscription) {
      throw new Error('No active subscription found');
    }

    const now = new Date();
    const expiresAt = new Date(activeSubscription.expirationDate || '');

    // 구독 정보 저장
    const { error } = await supabase.from('subscriptions').upsert({
      user_id: userId,
      product_id: pkg.product.identifier,
      platform: Capacitor.getPlatform(),
      status: 'active',
      transaction_id: activeSubscription.identifier,
      purchase_token: customerInfo.originalAppUserId,
      starts_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      price_amount: pkg.product.price * 1000, // RevenueCat은 소수점으로 반환
      currency: pkg.product.currencyCode || 'KRW',
      auto_renew: !activeSubscription.willRenew ? false : true
    }, {
      onConflict: 'user_id,product_id'
    });

    if (error) {
      throw error;
    }

    // 프로필 업데이트
    if (userStore.currentUser) {
      userStore.currentUser.isPremium = true;
      // DB에 프리미엄 상태 저장
      await userStore.setTestAccountPremium(userId, true);
    }
  }

  /**
   * 구매 복원
   */
  async restorePurchases(): Promise<void> {
    if (!this.initialized) {
      throw new Error('RevenueCat not initialized');
    }

    try {
      const customerInfo = await Purchases.restorePurchases();
      
      // 활성 구독이 있는지 확인
      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
      
      if (hasActiveSubscription) {
        // DB 업데이트
        await this.syncSubscriptionStatus(customerInfo);
        console.log('Purchases restored successfully');
      } else {
        console.log('No active subscriptions to restore');
      }
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      throw error;
    }
  }

  /**
   * 구독 상태 동기화
   */
  private async syncSubscriptionStatus(customerInfo: CustomerInfo): Promise<void> {
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id;

    if (!userId) {
      return;
    }

    const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;

    // 프로필 업데이트
    if (userStore.currentUser) {
      userStore.currentUser.isPremium = hasActiveSubscription;
      // DB에 프리미엄 상태 저장  
      await userStore.setTestAccountPremium(userId, hasActiveSubscription);
    }

    if (hasActiveSubscription) {
      // 활성 구독 정보 업데이트
      const activeEntitlement = Object.values(customerInfo.entitlements.active)[0];
      
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        product_id: activeEntitlement.productIdentifier,
        platform: Capacitor.getPlatform(),
        status: 'active',
        transaction_id: activeEntitlement.identifier,
        expires_at: activeEntitlement.expirationDate,
        auto_renew: !activeEntitlement.willRenew ? false : true
      }, {
        onConflict: 'user_id,product_id'
      });
    } else {
      // 모든 구독을 만료 상태로 변경
      await supabase
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('user_id', userId)
        .eq('status', 'active');
    }
  }

  /**
   * 현재 구독 상태 확인
   */
  async checkSubscription(): Promise<Subscription | null> {
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id;

    if (!userId) {
      return null;
    }

    try {
      // RevenueCat에서 최신 정보 가져오기
      if (this.initialized) {
        const customerInfo = await Purchases.getCustomerInfo();
        await this.syncSubscriptionStatus(customerInfo);
      }

      // DB에서 구독 정보 조회
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('expires_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // 만료 확인
      if (data && new Date(data.expires_at) < new Date()) {
        // 만료된 구독 업데이트
        await supabase
          .from('subscriptions')
          .update({ status: 'expired' })
          .eq('id', data.id);
        
        if (userStore.currentUser) {
          userStore.currentUser.isPremium = false;
          // DB에 프리미엄 상태 저장
          await userStore.setTestAccountPremium(userId, false);
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to check subscription:', error);
      return null;
    }
  }

  /**
   * 구독 취소 (자동 갱신 해제)
   */
  async cancelSubscription(): Promise<void> {
    try {
      // RevenueCat은 앱 내에서 직접 구독 취소를 지원하지 않음
      // 사용자를 구독 관리 페이지로 안내해야 함
      const platform = Capacitor.getPlatform();
      
      if (platform === 'android') {
        // Google Play 구독 관리 페이지로 이동
        await Purchases.showManageSubscriptions();
      } else if (platform === 'ios') {
        // iOS 구독 관리 페이지로 이동
        await Purchases.showManageSubscriptions();
      }
      
      // DB 상태 업데이트는 웹훅을 통해 자동으로 처리됨
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  /**
   * 결제 내역 조회
   */
  async getPaymentHistory(): Promise<any[]> {
    const userStore = useUserStore();
    const userId = userStore.currentUser?.id;

    if (!userId) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get payment history:', error);
      return [];
    }
  }

  /**
   * 고객 정보 가져오기
   */
  async getCustomerInfo(): Promise<CustomerInfo | null> {
    if (!this.initialized) {
      return null;
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('Failed to get customer info:', error);
      return null;
    }
  }
}

// 싱글톤 인스턴스
export const revenueCatService = new RevenueCatService();