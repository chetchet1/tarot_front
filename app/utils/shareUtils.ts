// 공유 유틸리티 함수들
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

// Capacitor Share 초기화 - 빈 함수로 유지 (호출하는 코드가 있으므로)
export const initializeShare = async () => {
  // 공유 기능은 shareWithNative 함수 내부에서 처리
  return;
};

// 네이티브 공유 함수
export const shareWithNative = async (
  title: string,
  text: string,
  url: string
): Promise<boolean> => {
  try {
    // 1. Web Share API 지원 체크 (먼저 시도)
    if (navigator.share) {
      await navigator.share({
        title: title,
        text: text,
        url: url
      });
      return true;
    }
    
    // 2. Capacitor Share 사용
    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title: title,
          text: text,
          url: url,
          dialogTitle: '공유하기'
        });
        return true;
      } catch (error) {
        console.log('⚠️ Capacitor Share 플러그인을 사용할 수 없음:', error);
      }
    }
    
    // 3. 클립보드 복사 (폴백)
    const fullText = `${title}\n\n${text}\n\n${url}`;
    await navigator.clipboard.writeText(fullText);
    return false;
    
  } catch (error) {
    console.error('공유 실패:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      return false; // 사용자 취소
    }
    throw error;
  }
};

// 공유 가능 여부 체크
export const canShare = (): boolean => {
  return !!(navigator.share || Capacitor.isNativePlatform() || navigator.clipboard);
};
