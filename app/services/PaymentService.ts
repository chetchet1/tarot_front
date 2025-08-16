// Payment Service for handling in-app purchases
import { InAppPurchase2, IAPProduct } from '@awesome-cordova-plugins/in-app-purchase-2';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/store/auth';
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
  alias: string;
  type: string;
  price: string;
  priceRaw: number;
  currency: string;
  title: string;
  description: string;
  period?: string;
  introPrice?: string;
}

class PaymentService {
  private store: typeof InAppPurchase2 | null = null;
  private initialized = false;
  private products: Map<string, PaymentProduct> = new Map();
  
  // 상품 ID 정의
  public readonly PRODUCTS = {
    MONTHLY: 'monthly_premium',
    YEARLY: 'yearly_premium'
  };

  // 가격 정보 (폴백용)
  private readonly PRICES = {
    monthly_premium: 4900,
    yearly_premium: 49000
  };

  constructor() {
    // 플랫폼 체크
    if (Capacitor.isNativePlatform()) {
      this.store = InAppPurchase2;
    }
  }

  /**
   * 결제 시스템 초기화
   */
  async initialize(): Promise<void> {
    if (this.initialized || !this.store) {
      return;
    }

    try {
      // 상품 등록
      this.registerProducts();
      
      // 이벤트 리스너 설정
      this.setupEventHandlers();
      
      // 스토어 초기화
      await this.store.ready(() => {
        console.log('Payment store is ready');
        this.initialized = true;
      });

      // 상품 정보 새로고침
      await this.store.refresh();
    } catch (error) {
      console.error('Failed to initialize payment service:', error);
      throw error;
    }
  }

  /**
   * 상품 등록
   */
  private registerProducts(): void {
    if (!this.store) return;

    // 월간 구독
    this.store.register({
      id: this.PRODUCTS.MONTHLY,
      type: this.store.PAID_SUBSCRIPTION,
      alias: '월간 프리미엄'
    });

    // 연간 구독
    this.store.register({
      id: this.PRODUCTS.YEARLY,
      type: this.store.PAID_SUBSCRIPTION,
      alias: '연간 프리미엄'
    });
  }

  /**
   * 이벤트 핸들러 설정
   */
  private setupEventHandlers(): void {
    if (!this.store) return;

    // 상품 업데이트 시
    this.store.when('product').updated((product: IAPProduct) => {
      this.handleProductUpdate(product);
    });

    // 구매 승인 시
    this.store.when('product').approved((product: IAPProduct) => {
      this.handlePurchaseApproved(product);
    });

    // 구매 검증 시
    this.store.when('product').verified((product: IAPProduct) => {
      product.finish();
    });

    // 구매 취소 시
    this.store.when('product').cancelled((product: IAPProduct) => {
      console.log('Purchase cancelled:', product.id);
    });

    // 오류 발생 시
    this.store.when('product').error((error: any) => {
      console.error('Purchase error:', error);
    });
  }

  /**
   * 상품 정보 업데이트 처리
   */
  private handleProductUpdate(product: IAPProduct): void {
    const productInfo: PaymentProduct = {
      id: product.id,
      alias: product.alias,
      type: product.type,
      price: product.price,
      priceRaw: product.priceMicros ? product.priceMicros / 1000 : this.PRICES[product.id as keyof typeof this.PRICES],
      currency: product.currency || 'KRW',
      title: product.title,
      description: product.description,
      period: product.id === this.PRODUCTS.MONTHLY ? 'month' : 'year'
    };

    this.products.set(product.id, productInfo);
  }

  /**
   * 구매 승인 처리
   */
  private async handlePurchaseApproved(product: IAPProduct): Promise<void> {
    try {
      // 영수증 검증
      const verified = await this.verifyPurchase(product);
      
      if (verified) {
        // 구독 활성화
        await this.activateSubscription(product);
        
        // 구매 완료
        product.verify();
      } else {
        // 검증 실패
        throw new Error('Purchase verification failed');
      }
    } catch (error) {
      console.error('Failed to handle purchase:', error);
      // 구매 취소
      product.finish();
      throw error;
    }
  }

  /**
   * 구매 검증
   */
  private async verifyPurchase(product: IAPProduct): Promise<boolean> {
    const authStore = useAuthStore();
    const userId = authStore.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const platform = Capacitor.getPlatform();
      
      // Edge Function 호출하여 영수증 검증
      const { data, error } = await supabase.functions.invoke('verify-purchase', {
        body: {
          userId,
          productId: product.id,
          platform,
          receipt: product.transaction?.receipt,
          transactionId: product.transaction?.id,
          purchaseToken: product.transaction?.purchaseToken
        }
      });

      if (error) {
        throw error;
      }

      return data?.valid === true;
    } catch (error) {
      console.error('Purchase verification failed:', error);
      return false;
    }
  }

  /**
   * 구독 활성화
   */
  private async activateSubscription(product: IAPProduct): Promise<void> {
    const authStore = useAuthStore();
    const userId = authStore.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const now = new Date();
    const expiresAt = new Date();
    
    // 구독 기간 설정
    if (product.id === this.PRODUCTS.MONTHLY) {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (product.id === this.PRODUCTS.YEARLY) {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // 구독 정보 저장
    const { error } = await supabase.from('subscriptions').insert({
      user_id: userId,
      product_id: product.id,
      platform: Capacitor.getPlatform(),
      status: 'active',
      transaction_id: product.transaction?.id,
      purchase_token: product.transaction?.purchaseToken,
      starts_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      price_amount: this.PRICES[product.id as keyof typeof this.PRICES],
      currency: 'KRW',
      auto_renew: true
    });

    if (error) {
      throw error;
    }

    // 프로필 업데이트
    await authStore.updateProfile({ is_premium: true });
  }

  /**
   * 상품 목록 가져오기
   */
  getProducts(): PaymentProduct[] {
    return Array.from(this.products.values());
  }

  /**
   * 특정 상품 가져오기
   */
  getProduct(productId: string): PaymentProduct | undefined {
    return this.products.get(productId);
  }

  /**
   * 구독 구매
   */
  async purchase(productId: string): Promise<void> {
    if (!this.store || !this.initialized) {
      throw new Error('Payment service not initialized');
    }

    const product = this.store.get(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // 구매 시작
    await this.store.order(product);
  }

  /**
   * 구매 복원
   */
  async restorePurchases(): Promise<void> {
    if (!this.store || !this.initialized) {
      throw new Error('Payment service not initialized');
    }

    await this.store.refresh();
  }

  /**
   * 현재 구독 상태 확인
   */
  async checkSubscription(): Promise<Subscription | null> {
    const authStore = useAuthStore();
    const userId = authStore.user?.id;

    if (!userId) {
      return null;
    }

    try {
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
        
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to check subscription:', error);
      return null;
    }
  }

  /**
   * 구독 취소
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          auto_renew: false
        })
        .eq('id', subscriptionId);

      if (error) {
        throw error;
      }

      // 프로필 업데이트
      const authStore = useAuthStore();
      await authStore.updateProfile({ is_premium: false });
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  /**
   * 결제 내역 조회
   */
  async getPaymentHistory(): Promise<any[]> {
    const authStore = useAuthStore();
    const userId = authStore.user?.id;

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
}

// 싱글톤 인스턴스
export const paymentService = new PaymentService();