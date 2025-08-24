// 환경 설정
export const TEST_MODE = import.meta.env.MODE !== 'production'; // 프로덕션에서는 테스트 모드 비활성화
export const __DEV__ = import.meta.env.MODE !== 'production'; // 개발 모드

// 플랫폼 확인
export const global = {
  isIOS: false, // iOS 테스트시 true로 변경
  isAndroid: true
};

// Supabase 환경 변수
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://yxywzsmggvxxujuplyly.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4eXd6c21nZ3Z4eHVqdXBseWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTk2ODUsImV4cCI6MjA2OTEzNTY4NX0.8w3JYOmbmJKdzz9H0_GfgspIfb0SfjjOvkyxPNvFVSM'
};

// AdMob 환경 변수
export const ADMOB_CONFIG = {
  androidAppId: import.meta.env.VITE_ADMOB_ANDROID_APP_ID || 'ca-app-pub-3940256099942544~3347511713',
  iosAppId: import.meta.env.VITE_ADMOB_IOS_APP_ID || 'ca-app-pub-3940256099942544~1458002511',
  androidBannerId: import.meta.env.VITE_ADMOB_ANDROID_BANNER_ID || 'ca-app-pub-3940256099942544/6300978111',
  iosBannerId: import.meta.env.VITE_ADMOB_IOS_BANNER_ID || 'ca-app-pub-3940256099942544/2934735716',
  androidInterstitialId: import.meta.env.VITE_ADMOB_ANDROID_INTERSTITIAL_ID || 'ca-app-pub-3940256099942544/1033173712',
  iosInterstitialId: import.meta.env.VITE_ADMOB_IOS_INTERSTITIAL_ID || 'ca-app-pub-3940256099942544/4411468910'
};

// RevenueCat 환경 변수
export const REVENUECAT_CONFIG = {
  androidKey: import.meta.env.VITE_REVENUECAT_ANDROID_KEY || 'your_revenuecat_android_key',
  iosKey: import.meta.env.VITE_REVENUECAT_IOS_KEY || 'your_revenuecat_ios_key'
};
