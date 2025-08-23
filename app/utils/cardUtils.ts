/**
 * @deprecated 이 파일의 모든 함수는 unifiedCardImage.ts로 이동되었습니다.
 * 하위 호환성을 위해 리다이렉트만 제공합니다.
 * 
 * 새로운 코드에서는 다음과 같이 사용하세요:
 * import { getUnifiedCardImagePath, handleUnifiedImageError, isCardReversed } from '@/utils/unifiedCardImage';
 */

import { 
  getUnifiedCardImagePath, 
  handleUnifiedImageError, 
  isCardReversed 
} from './unifiedCardImage';

// 하위 호환성을 위한 리다이렉트
export const getCardImageUrl = getUnifiedCardImagePath;
export const getCardImagePath = getUnifiedCardImagePath;
export const handleImageError = handleUnifiedImageError;
export const isReversedCard = isCardReversed;
