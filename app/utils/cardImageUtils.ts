/**
 * @deprecated 이 파일의 모든 함수는 unifiedCardImage.ts로 이동되었습니다.
 * 하위 호환성을 위해 리다이렉트만 제공합니다.
 * 
 * 새로운 코드에서는 다음과 같이 사용하세요:
 * import { getUnifiedCardImagePath } from '@/utils/unifiedCardImage';
 */

import { getUnifiedCardImagePath } from './unifiedCardImage';

/**
 * 카드 ID(또는 cardNumber)를 이미지 경로로 변환
 * @deprecated unifiedCardImage.ts의 getUnifiedCardImagePath 사용
 */
export function getCardImagePath(cardId: number): string {
  // DB ID 기반으로 처리하도록 객체 형태로 전달
  return getUnifiedCardImagePath({ id: cardId });
}

/**
 * 카드 정보 객체에서 이미지 경로 추출
 * @deprecated unifiedCardImage.ts의 getUnifiedCardImagePath 사용
 */
export function getCardImageFromObject(card: any): string {
  return getUnifiedCardImagePath(card);
}

/**
 * 카드 ID가 메이저 아르카나인지 확인
 */
export function isMajorArcana(cardId: number): boolean {
  return cardId >= 0 && cardId <= 21;
}

/**
 * 카드 ID가 코트 카드인지 확인
 */
export function isCourtCard(cardId: number): boolean {
  return (cardId >= 32 && cardId <= 35) ||  // Cups Court
         (cardId >= 46 && cardId <= 49) ||  // Wands Court
         (cardId >= 60 && cardId <= 63) ||  // Swords Court
         (cardId >= 74 && cardId <= 77);    // Pentacles Court
}

/**
 * 카드 ID에서 슈트(suit) 추출
 */
export function getCardSuit(cardId: number): string | null {
  if (cardId <= 21) return null;  // Major Arcana
  if (cardId >= 22 && cardId <= 35) return 'cups';
  if (cardId >= 36 && cardId <= 49) return 'wands';
  if (cardId >= 50 && cardId <= 63) return 'swords';
  if (cardId >= 64 && cardId <= 77) return 'pentacles';
  return null;
}
