import { TEST_MODE } from '../config/env';

// 테스트 모드에 따라 적절한 서비스 import
const admobService = TEST_MODE 
  ? require('./admob.mock')
  : require('./admob.real');

export const {
  initializeAdMob,
  showAd,
  showInterstitialAd,
  createBannerAd,
  shouldShowAds
} = admobService;
