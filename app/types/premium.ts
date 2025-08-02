// Premium 기능 관련 타입 정의

export interface SubscriptionProduct {
  price: number;
  productId: string;
  type: 'monthly' | 'yearly';
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

export interface SubscriptionBenefit {
  icon: string;
  title: string;
  description: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export interface PurchaseResult {
  success: boolean;
  error?: string;
  subscription?: {
    id: string;
    type: 'monthly' | 'yearly';
    startDate: Date;
    endDate: Date;
  };
}
