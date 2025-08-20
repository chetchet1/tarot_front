import { ref, nextTick } from 'vue';
import { showAlert, showConfirm } from '../utils/alerts';
import type { TarotCard, DailyInterpretation } from '../types/tarot';

/**
 * 광고 표시 관련 로직을 관리하는 컴포저블
 */
export function useAdvertisement() {
  // 광고 상태
  const showAd = ref(false);
  const adTimeRemaining = ref(15);
  const adTimer = ref<number | null>(null);

  /**
   * 광고 타이머 정리
   */
  const clearAdTimer = () => {
    if (adTimer.value) {
      clearInterval(adTimer.value);
      adTimer.value = null;
    }
  };

  /**
   * 광고 상태 초기화
   */
  const resetAdState = () => {
    showAd.value = false;
    adTimeRemaining.value = 15;
    clearAdTimer();
  };

  /**
   * 리워드 광고 표시 및 처리
   * @param card 선택된 카드
   * @param generateInterpretationCallback AI 해석 생성 콜백 함수
   * @param onCardRevealed 카드 공개 콜백 함수
   * @param onInterpretationLoading 해석 로딩 상태 콜백 함수
   * @param onProgress 진행도 업데이트 콜백 함수
   */
  const showAdvertisement = async (
    card: TarotCard,
    generateInterpretationCallback: (card: TarotCard) => Promise<DailyInterpretation | null>,
    onCardRevealed: (revealed: boolean) => void,
    onInterpretationLoading: (loading: boolean) => void,
    onProgress: (progress: number) => void
  ) => {
    // 카드가 아직 공개되지 않도록 확실히 함
    onCardRevealed(false);
    
    try {
      // AdMob 리워드 광고 호출
      const { showRewardedAd } = await import('../services/admob');
      
      // 광고 UI 표시
      showAd.value = true;
      adTimeRemaining.value = 15;
      
      // 광고 표시 (15초 강제 시청)
      const adWatched = await showRewardedAd();
      
      // 광고 UI 숨김
      showAd.value = false;
      
      if (adWatched) {
        // 광고 시청 완료 시 AI 해석 로딩 화면 표시
        
        // 카드 확인
        if (!card) {
          showAd.value = false;
          onCardRevealed(false);
          await showAlert({
            title: '오류',
            message: '카드 정보를 찾을 수 없습니다. 다시 시도해주세요.'
          });
          return null;
        }
        
        // 로딩 화면을 반드시 표시
        onInterpretationLoading(true);
        onProgress(10); // 초기값 설정
        
        // DOM 업데이트 보장
        await nextTick();
        
        // 프로그레스 애니메이션 시작
        let progressInterval: number | null = null;
        progressInterval = setInterval(() => {
          onProgress(prev => prev < 90 ? prev + Math.random() * 15 + 5 : prev);
        }, 500) as unknown as number;
        
        // AI 해석 생성
        try {
          const interpretation = await generateInterpretationCallback(card);
          
          // AI 해석 완료 후 카드 공개
          if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
          }
          onProgress(100);
          
          // 로딩 화면을 잠시 유지 후 종료
          setTimeout(() => {
            onInterpretationLoading(false);
            onProgress(0);
            onCardRevealed(true);
          }, 800);

          return interpretation;
        } catch (error) {
          console.error('해석 생성 실패:', error);
          if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
          }
          
          // 로딩 화면 종료 및 카드 공개
          onInterpretationLoading(false);
          onProgress(0);
          onCardRevealed(true);

          return null; // 에러 시 null 반환
        }
      } else {
        // 광고 시청 실패 또는 중단
        await showAlert({
          title: '알림',
          message: '광고를 끝까지 시청해야 상세 해석을 볼 수 있습니다.'
        });
        
        // 다시 광고 보기 옵션 제공
        const retry = await showConfirm({
          title: '광고 다시 보기',
          message: '광고를 다시 시청하시겠습니까?',
          confirmText: '다시 보기',
          cancelText: '취소'
        });
        
        if (retry) {
          // 재귀 호출
          return await showAdvertisement(
            card, 
            generateInterpretationCallback, 
            onCardRevealed, 
            onInterpretationLoading, 
            onProgress
          );
        } else {
          // 광고 없이 기본 해석만 표시
          onCardRevealed(true);
          return null; // 기본 해석은 호출하는 쪽에서 처리
        }
      }
    } catch (error) {
      console.error('광고 표시 실패:', error);
      showAd.value = false;
      
      // 광고 실패 시에도 AI 해석 진행 (무료 패스)
      onInterpretationLoading(true);
      onProgress(0);
      
      let progressInterval: number | null = null;
      progressInterval = setInterval(() => {
        onProgress(prev => prev < 90 ? prev + Math.random() * 15 + 5 : prev);
      }, 500) as unknown as number;
      
      try {
        const interpretation = await generateInterpretationCallback(card);
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        onProgress(100);
        
        setTimeout(() => {
          onInterpretationLoading(false);
          onCardRevealed(true);
        }, 500);

        return interpretation;
      } catch (genError) {
        console.error('해석 생성도 실패:', genError);
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        onInterpretationLoading(false);
        onProgress(0);
        onCardRevealed(true);
        
        return null;
      }
    }
  };

  return {
    // 상태
    showAd,
    adTimeRemaining,
    
    // 메서드
    showAdvertisement,
    resetAdState,
    clearAdTimer
  };
}