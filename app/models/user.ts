// 사용자 관련 타입 정의

export type SubscriptionStatus = 'active' | 'expired' | 'canceled' | 'none';
export type SubscriptionPlan = 'monthly' | 'yearly' | 'lifetime';
export type SignupMethod = 'email' | 'google' | 'github' | 'discord' | 'apple' | 'kakao';
export type Gender = 'male' | 'female' | 'other';

export interface User {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  phone?: string;
  birthdate?: string;
  gender?: Gender;
  signupMethod?: SignupMethod;
  createdAt: Date;
  lastLoginAt: Date;
  isAnonymous: boolean;
  isPremium: boolean;
  isAdmin?: boolean;
  preferences: UserPreferences;
  subscription?: Subscription;
  stats?: UserStats;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  language: 'ko' | 'en';
  notifications: {
    dailyReading: boolean;
    weeklyInsight: boolean;
    promotions: boolean;
    newFeatures: boolean;
    weeklyReport: boolean;
  };
  favoriteSpread?: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoSaveReadings: boolean;
  privateProfile: boolean;
}

export interface UserStats {
  totalReadings: number;
  readingsByTopic: {
    general: number;
    love: number;
    career: number;
    money: number;
    health: number;
  };
  favoriteCards: number[];
  monthlyActivity: Array<{
    month: string;
    count: number;
  }>;
  averageCardsPerReading: number;
  lastReadingDate?: Date;
  streakDays: number;
  longestStreak: number;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date;
  nextBillingDate?: Date;
  price: number;
  currency: string;
  platformOrderId?: string;  // App Store나 Google Play 주문 ID
  features: string[];
}

export interface Session {
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  provider?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends AuthCredentials {
  name?: string;
  phone?: string;
  birthdate?: string;
  gender?: Gender;
  acceptTerms: boolean;
  acceptMarketing: boolean;
}

export interface SocialLoginData {
  provider: 'google' | 'github' | 'discord' | 'apple';
  accessToken?: string;
  idToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    emailVerified: boolean;
  };
}

export interface ProfileUpdateData {
  name?: string;
  phone?: string;
  birthdate?: string;
  gender?: Gender;
  avatarUrl?: string;
  preferences?: Partial<UserPreferences>;
}

export interface PasswordResetData {
  email: string;
  newPassword: string;
  confirmPassword: string;
  resetToken: string;
}

export interface EmailChangeData {
  newEmail: string;
  password: string;
}

export interface AccountSettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  dataSharing: boolean;
  analyticsOptOut: boolean;
}

// API 응답 타입들
export interface AuthResponse {
  user: User;
  session: Session;
  message?: string;
}

export interface UserResponse {
  user: User;
  stats?: UserStats;
  subscription?: Subscription;
}

export interface LoginAttempt {
  email: string;
  timestamp: Date;
  success: boolean;
  ip?: string;
  userAgent?: string;
}

// 에러 타입들
export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// 폼 검증용 타입들
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  birthdate?: string;
  gender?: Gender;
  agreeTerms: boolean;
  agreeMarketing: boolean;
}

export interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  gender: Gender;
  bio?: string;
}

// 유틸리티 타입들
export type UserPublicInfo = Pick<User, 'id' | 'name' | 'avatarUrl' | 'createdAt'>;
export type UserPrivateInfo = Omit<User, 'id' | 'createdAt' | 'lastLoginAt'>;
export type UserDisplayInfo = Pick<User, 'name' | 'avatarUrl' | 'isPremium'>;
