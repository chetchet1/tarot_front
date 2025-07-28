// 테스트용 구독 모의 서비스
export const initializeRevenueCat = async () => {
  console.log('Mock RevenueCat initialized');
};

export const getOfferings = async () => {
  return [{
    identifier: 'default',
    availablePackages: [
      {
        identifier: 'monthly',
        product: {
          price: 2900,
          currencyCode: 'KRW',
          title: '월간 구독'
        }
      },
      {
        identifier: 'yearly',
        product: {
          price: 29900,
          currencyCode: 'KRW',
          title: '연간 구독'
        }
      }
    ]
  }];
};

export const purchaseSubscription = async (packageToPurchase: any) => {
  console.log('Mock purchase:', packageToPurchase);
  // 테스트를 위해 항상 성공
  return {
    success: true,
    customerInfo: {
      activeSubscriptions: ['test-subscription']
    }
  };
};

export const restoreSubscription = async () => {
  console.log('Mock restore subscription');
  return {
    success: false,
    error: 'No subscription to restore'
  };
};

export const checkSubscriptionStatus = async (): Promise<boolean> => {
  return false; // 테스트에서는 항상 무료 사용자
};

export const formatPrice = (price: number, currency: string): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency || 'KRW'
  }).format(price);
};
