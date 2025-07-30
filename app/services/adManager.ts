// 개선된 광고 매니저
import { ref, computed } from 'vue';
import { showInterstitialAd, showRewardedAd } from './admob';
import type { Store } from 'pinia';

export interface AdConfig {
  freeReadingLimit: number; // 무료 사용자 일일 점괘 제한
  adFrequency: number; // 몇 번째 점괘마다 광고 표시
  rewardedAdBonus: number; // 리워드 광고 시청 시 추가 점괘 횟수
  temporaryPremiumHours: number; // 리워드 광고 시청 시 프리미엄 시간
}

export class AdManager {
  private static instance: AdManager | null = null;
  private userStore: any = null; // lazy initialization을 위해 any 타입 사용
  private userStoreGetter: (() => any) | null = null; // userStore를 가져오는 함수
  
  // 광고 설정
  private config: AdConfig = {
    freeReadingLimit: 3, // 무료 사용자는 하루 3회
    adFrequency: 2, // 2번째 점괘마다 광고
    rewardedAdBonus: 2, // 리워드 광고 시청 시 2회 추가
    temporaryPremiumHours: 24 // 리워드 광고 시청 시 24시간 프리미엄
  };

  // 상태 관리
  private dailyReadingCount = ref(0);
  private lastReadingDate = ref<string>('');
  private bonusReadings = ref(0);
  private temporaryPremiumExpiry = ref<Date | null>(null);
  private lastAdShownAt = ref(0);

  private constructor() {
    // userStore는 나중에 초기화
    this.loadState();
    this.checkDailyReset();
  }

  // userStore getter - lazy initialization
  private getUserStore() {
    if (!this.userStore && this.userStoreGetter) {
      try {
        this.userStore = this.userStoreGetter();
      } catch (error) {
        console.warn('userStore 초기화 실패:', error);
      }
    }
    
    // userStore가 없으면 기본값 반환
    if (!this.userStore) {
      return { 
        isPremium: false,
        canUseFreeReading: true,
        incrementFreeReading: () => {}
      };
    }
    
    return this.userStore;
  }

  static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  // userStore getter 함수 설정
  setUserStoreGetter(getter: () => any) {
    this.userStoreGetter = getter;
    this.userStore = null; // 재설정 시 초기화
  }

  // 상태 저장/로드
  private saveState() {
    try {
      const state = {
        dailyReadingCount: this.dailyReadingCount.value,
        lastReadingDate: this.lastReadingDate.value,
        bonusReadings: this.bonusReadings.value,
        temporaryPremiumExpiry: this.temporaryPremiumExpiry.value?.toISOString(),
        lastAdShownAt: this.lastAdShownAt.value
      };
      localStorage.setItem('adManagerState', JSON.stringify(state));
    } catch (error) {
      console.error('광고 매니저 상태 저장 실패:', error);
    }
  }

  private loadState() {
    try {
      const saved = localStorage.getItem('adManagerState');
      if (saved) {
        const state = JSON.parse(saved);
        this.dailyReadingCount.value = state.dailyReadingCount || 0;
        this.lastReadingDate.value = state.lastReadingDate || '';
        this.bonusReadings.value = state.bonusReadings || 0;
        this.temporaryPremiumExpiry.value = state.temporaryPremiumExpiry 
          ? new Date(state.temporaryPremiumExpiry) 
          : null;
        this.lastAdShownAt.value = state.lastAdShownAt || 0;
      }
    } catch (error) {
      console.error('광고 매니저 상태 로드 실패:', error);
    }
  }

  // 일일 리셋 체크
  private checkDailyReset() {
    const today = new Date().toDateString();
    if (this.lastReadingDate.value !== today) {
      this.dailyReadingCount.value = 0;
      this.bonusReadings.value = 0;
      this.lastReadingDate.value = today;
      this.saveState();
    }
  }

  // 임시 프리미엄 상태 확인
  private isTemporaryPremium(): boolean {
    if (!this.temporaryPremiumExpiry.value) return false;
    
    const now = new Date();
    if (now < this.temporaryPremiumExpiry.value) {
      return true;
    } else {
      this.temporaryPremiumExpiry.value = null;
      this.saveState();
      return false;
    }
  }

  // 점괘를 볼 수 있는지 확인
  canDoReading(): boolean {
    // 프리미엄 사용자는 무제한
    if (this.getUserStore().isPremium || this.isTemporaryPremium()) {
      return true;
    }

    // 무료 사용자 체크
    this.checkDailyReset();
    const totalAllowed = this.config.freeReadingLimit + this.bonusReadings.value;
    return this.dailyReadingCount.value < totalAllowed;
  }

  // 남은 점괘 횟수
  getRemainingReadings(): number {
    if (this.getUserStore().isPremium || this.isTemporaryPremium()) {
      return -1; // 무제한
    }

    this.checkDailyReset();
    const totalAllowed = this.config.freeReadingLimit + this.bonusReadings.value;
    return Math.max(0, totalAllowed - this.dailyReadingCount.value);
  }

  // 광고를 표시해야 하는지 확인
  private shouldShowAd(): boolean {
    // 프리미엄 사용자는 광고 없음
    if (this.getUserStore().isPremium || this.isTemporaryPremium()) {
      return false;
    }

    // 광고 빈도 체크
    const readingsSinceLastAd = this.dailyReadingCount.value - this.lastAdShownAt.value;
    return readingsSinceLastAd >= this.config.adFrequency;
  }

  // 점괘 시작 시 호출
  async startReading(): Promise<boolean> {
    // 점괘 가능 여부 체크
    if (!this.canDoReading()) {
      return false;
    }

    // 광고 표시 여부 체크
    if (this.shouldShowAd()) {
      const adShown = await this.showAd();
      if (!adShown) {
        // 광고 시청을 거부한 경우
        return false;
      }
    }

    // 점괘 카운트 증가
    this.dailyReadingCount.value++;
    this.saveState();
    return true;
  }

  // 일반 광고 표시
  private async showAd(): Promise<boolean> {
    try {
      console.log('📢 광고 표시 중...');
      const result = await showInterstitialAd();
      
      if (result) {
        this.lastAdShownAt.value = this.dailyReadingCount.value;
        this.saveState();
      }
      
      return result;
    } catch (error) {
      console.error('광고 표시 실패:', error);
      return true; // 광고 실패 시에도 점괘는 허용
    }
  }

  // 리워드 광고 표시
  async showRewardedAdForBonus(): Promise<boolean> {
    try {
      console.log('🎁 리워드 광고 표시 중...');
      const result = await showRewardedAd();
      
      if (result) {
        // 보너스 점괘 추가
        this.bonusReadings.value += this.config.rewardedAdBonus;
        this.saveState();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('리워드 광고 표시 실패:', error);
      return false;
    }
  }

  // 리워드 광고로 임시 프리미엄 획득
  async showRewardedAdForPremium(): Promise<boolean> {
    try {
      console.log('👑 프리미엄 리워드 광고 표시 중...');
      const result = await showRewardedAd();
      
      if (result) {
        // 임시 프리미엄 활성화
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + this.config.temporaryPremiumHours);
        this.temporaryPremiumExpiry.value = expiry;
        this.saveState();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('프리미엄 리워드 광고 표시 실패:', error);
      return false;
    }
  }

  // 상태 정보 가져오기
  getStatus() {
    return {
      isPremium: this.getUserStore().isPremium,
      isTemporaryPremium: this.isTemporaryPremium(),
      temporaryPremiumExpiry: this.temporaryPremiumExpiry.value,
      dailyReadingCount: this.dailyReadingCount.value,
      remainingReadings: this.getRemainingReadings(),
      bonusReadings: this.bonusReadings.value,
      canDoReading: this.canDoReading()
    };
  }

  // 설정 업데이트
  updateConfig(newConfig: Partial<AdConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// AdManager는 adManagerSingleton.ts에서 관리됨
// 직접 export하지 않음
