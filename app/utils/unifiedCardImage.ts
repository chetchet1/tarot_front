/**
 * 통합 카드 이미지 유틸리티
 * 모든 컴포넌트에서 일관되게 사용할 카드 이미지 경로 생성 함수
 * 
 * 지원하는 카드 데이터 형식:
 * 1. DB ID 기반: card.id 또는 card.cardNumber (0-77)
 * 2. 속성 기반: card.arcana, card.number, card.suit
 * 3. Supabase URL: card.imageUrl
 */

// DB ID to 파일명 매핑 테이블
const DB_ID_TO_FILE_MAP: Record<number, string> = {
  // 메이저 아르카나 (0-21)
  0: 'major/00-the-Fool.png',
  1: 'major/01-The-Magician.png',
  2: 'major/02-The-High-Priestess.png',
  3: 'major/03-The-Empress.png',
  4: 'major/04-The-Emperor.png',
  5: 'major/05-The-Hierophant.png',
  6: 'major/06-The-Lovers.png',
  7: 'major/07-The-Chariot.png',
  8: 'major/08-Strength.png',
  9: 'major/09-The-Hermit.png',
  10: 'major/10-Wheel-of-Fortune.png',
  11: 'major/11-Justice.png',
  12: 'major/12-The-Hanged-Man.png',
  13: 'major/13-Death.png',
  14: 'major/14-Temperance.png',
  15: 'major/15-The-Devil.png',
  16: 'major/16-The-Tower.png',
  17: 'major/17-The-Star.png',
  18: 'major/18-The-Moon.png',
  19: 'major/19-The-Sun.png',
  20: 'major/20-Judgement.png',
  21: 'major/21-The-World.png',
  
  // Cups 숫자 카드 (22-31)
  22: 'minor/01-ace-of-cups.png',
  23: 'minor/02-two-of-cups.png',
  24: 'minor/03-three-of-cups.png',
  25: 'minor/04-four-of-cups.png',
  26: 'minor/05-five-of-cups.png',
  27: 'minor/06-six-of-cups.png',
  28: 'minor/07-seven-of-cups.png',
  29: 'minor/08-eight-of-cups.png',
  30: 'minor/09-nine-of-cups.png',
  31: 'minor/10-ten-of-cups.png',
  
  // Cups 코트 카드 (32-35)
  32: 'minor/45-Page-of-Cups.png',
  33: 'minor/46-Knight-of-Cups.png',
  34: 'minor/47-Queen-of-Cups.png',
  35: 'minor/48-King-of-Cups.png',
  
  // Wands 숫자 카드 (36-45)
  36: 'minor/01-ace-of-wands.png',
  37: 'minor/02-two-of-wands.png',
  38: 'minor/03-three-of-wands.png',
  39: 'minor/04-four-of-wands.png',
  40: 'minor/05-five-of-wands.png',
  41: 'minor/06-six-of-wands.png',
  42: 'minor/07-seven-of-wands.png',
  43: 'minor/08-eight-of-wands.png',
  44: 'minor/09-nine-of-wands.png',
  45: 'minor/10-ten-of-wands.png',
  
  // Wands 코트 카드 (46-49)
  46: 'minor/41-Page-of-Wands.png',
  47: 'minor/42-Knight-of-Wands.png',
  48: 'minor/43-Queen-of-Wands.png',
  49: 'minor/44-King-of-Wands.png',
  
  // Swords 숫자 카드 (50-59)
  50: 'minor/01-ace-of-swords.png',
  51: 'minor/02-two-of-swords.png',
  52: 'minor/03-three-of-swords.png',
  53: 'minor/04-four-of-swords.png',
  54: 'minor/05-five-of-swords.png',
  55: 'minor/06-six-of-swords.png',
  56: 'minor/07-seven-of-swords.png',
  57: 'minor/08-eight-of-swords.png',
  58: 'minor/09-nine-of-swords.png',
  59: 'minor/10-ten-of-swords.png',
  
  // Swords 코트 카드 (60-63)
  60: 'minor/49-Page-of-Swords.png',
  61: 'minor/50-Knight-of-Swords.png',
  62: 'minor/51-Queen-of-Swords.png',
  63: 'minor/52-King-of-Swords.png',
  
  // Pentacles 숫자 카드 (64-73)
  64: 'minor/01-ace-of-pentacles.png',
  65: 'minor/02-two-of-pentacles.png',
  66: 'minor/03-three-of-pentacles.png',
  67: 'minor/04-four-of-pentacles.png',
  68: 'minor/05-five-of-pentacles.png',
  69: 'minor/06-six-of-pentacles.png',
  70: 'minor/07-seven-of-pentacles.png',
  71: 'minor/08-eight-of-pentacles.png',
  72: 'minor/09-nine-of-pentacles.png',
  73: 'minor/10-ten-of-pentacles.png',
  
  // Pentacles 코트 카드 (74-77)
  74: 'minor/53-Page-of-Pentacles.png',
  75: 'minor/54-Knight-of-Pentacles.png',
  76: 'minor/55-Queen-of-Pentacles.png',
  77: 'minor/56-King-of-Pentacles.png'
};

// 기본 카드 뒷면 이미지
const CARD_BACK_URL = '/assets/tarot-cards/back.jpg';
const FALLBACK_CARD = '/assets/tarot-cards/major/00-the-Fool.png';

/**
 * 통합 카드 이미지 경로 생성 함수
 * @param card - 카드 객체
 * @returns 카드 이미지 경로
 */
export function getUnifiedCardImagePath(card: any): string {
  try {
    if (!card) {
      console.warn('[UnifiedCardImage] 카드 데이터가 없습니다');
      return CARD_BACK_URL;
    }

    // 1. DB ID 기반 처리 (가장 정확)
    const dbId = card.id ?? card.cardNumber ?? card.card_id;
    if (dbId !== undefined && dbId !== null) {
      const numericId = Number(dbId);
      if (!isNaN(numericId) && DB_ID_TO_FILE_MAP[numericId]) {
        return `/assets/tarot-cards/${DB_ID_TO_FILE_MAP[numericId]}`;
      }
    }

    // 2. imageUrl이 있는 경우 (Supabase에서 제공)
    if (card.imageUrl && typeof card.imageUrl === 'string' && !card.imageUrl.includes('undefined')) {
      let finalUrl = card.imageUrl;
      
      // 수트 폴더 경로 제거 (minor 폴더 바로 아래에 모든 파일이 있음)
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/cups/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/wands/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/swords/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/pentacles/', '/assets/tarot-cards/minor/');
      
      // 메이저 아르카나 파일명 대소문자 수정
      if (finalUrl.includes('/assets/tarot-cards/major/')) {
        // 소문자로 된 파일명을 올바른 대소문자로 변환
        const majorCorrections: Record<string, string> = {
          '00-the-fool.png': '00-the-Fool.png',
          '01-the-magician.png': '01-The-Magician.png',
          '02-the-high-priestess.png': '02-The-High-Priestess.png',
          '03-the-empress.png': '03-The-Empress.png',
          '04-the-emperor.png': '04-The-Emperor.png',
          '05-the-hierophant.png': '05-The-Hierophant.png',
          '06-the-lovers.png': '06-The-Lovers.png',
          '07-the-chariot.png': '07-The-Chariot.png',
          '08-strength.png': '08-Strength.png',
          '09-the-hermit.png': '09-The-Hermit.png',
          '10-wheel-of-fortune.png': '10-Wheel-of-Fortune.png',
          '11-justice.png': '11-Justice.png',
          '12-the-hanged-man.png': '12-The-Hanged-Man.png',
          '13-death.png': '13-Death.png',
          '14-temperance.png': '14-Temperance.png',
          '15-the-devil.png': '15-The-Devil.png',
          '16-the-tower.png': '16-The-Tower.png',
          '17-the-star.png': '17-The-Star.png',
          '18-the-moon.png': '18-The-Moon.png',
          '19-the-sun.png': '19-The-Sun.png',
          '20-judgement.png': '20-Judgement.png',
          '21-the-world.png': '21-The-World.png'
        };
        
        for (const [wrong, correct] of Object.entries(majorCorrections)) {
          if (finalUrl.toLowerCase().includes(wrong)) {
            const urlParts = finalUrl.split('/');
            urlParts[urlParts.length - 1] = correct;
            finalUrl = urlParts.join('/');
            break;
          }
        }
      }
      
      return finalUrl;
    }

    // 3. 속성 기반 처리 (arcana, number, suit)
    if (card.arcana === 'major' && card.number !== undefined) {
      const majorFiles: Record<number, string> = {
        0: '00-the-Fool.png',
        1: '01-The-Magician.png',
        2: '02-The-High-Priestess.png',
        3: '03-The-Empress.png',
        4: '04-The-Emperor.png',
        5: '05-The-Hierophant.png',
        6: '06-The-Lovers.png',
        7: '07-The-Chariot.png',
        8: '08-Strength.png',
        9: '09-The-Hermit.png',
        10: '10-Wheel-of-Fortune.png',
        11: '11-Justice.png',
        12: '12-The-Hanged-Man.png',
        13: '13-Death.png',
        14: '14-Temperance.png',
        15: '15-The-Devil.png',
        16: '16-The-Tower.png',
        17: '17-The-Star.png',
        18: '18-The-Moon.png',
        19: '19-The-Sun.png',
        20: '20-Judgement.png',
        21: '21-The-World.png'
      };
      
      const fileName = majorFiles[card.number];
      if (fileName) {
        return `/assets/tarot-cards/major/${fileName}`;
      }
    }

    if (card.arcana === 'minor' && card.suit && card.number !== undefined) {
      const suitLower = card.suit.toLowerCase();
      
      // 숫자 카드 (1-10)
      if (card.number >= 1 && card.number <= 10) {
        const numberNames = ['', 'ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
        const cardNumber = String(card.number).padStart(2, '0');
        const cardName = `${numberNames[card.number]}-of-${suitLower}`;
        return `/assets/tarot-cards/minor/${cardNumber}-${cardName}.png`;
      }
      
      // 코트 카드 (11-14)
      if (card.number >= 11 && card.number <= 14) {
        const courtFileNumbers: Record<string, Record<number, number>> = {
          'wands': { 11: 41, 12: 42, 13: 43, 14: 44 },
          'cups': { 11: 45, 12: 46, 13: 47, 14: 48 },
          'swords': { 11: 49, 12: 50, 13: 51, 14: 52 },
          'pentacles': { 11: 53, 12: 54, 13: 55, 14: 56 }
        };
        
        const fileNumber = courtFileNumbers[suitLower]?.[card.number];
        if (fileNumber) {
          const courtNames: Record<number, string> = {
            11: 'Page',
            12: 'Knight',
            13: 'Queen',
            14: 'King'
          };
          const courtName = courtNames[card.number];
          const suitCapitalized = card.suit.charAt(0).toUpperCase() + card.suit.slice(1);
          return `/assets/tarot-cards/minor/${fileNumber}-${courtName}-of-${suitCapitalized}.png`;
        }
      }
    }

    // 4. court 필드가 있는 경우
    if (card.court && card.suit) {
      const courtTypes = ['page', 'knight', 'queen', 'king'];
      const courtIndex = courtTypes.indexOf(card.court.toLowerCase());
      
      if (courtIndex !== -1) {
        const suitLower = card.suit.toLowerCase();
        const courtFileNumbers: Record<string, number> = {
          'wands': 41,
          'cups': 45,
          'swords': 49,
          'pentacles': 53
        };
        
        const baseNumber = courtFileNumbers[suitLower];
        if (baseNumber) {
          const fileNumber = baseNumber + courtIndex;
          const courtName = card.court.charAt(0).toUpperCase() + card.court.slice(1).toLowerCase();
          const suitCapitalized = card.suit.charAt(0).toUpperCase() + card.suit.slice(1);
          return `/assets/tarot-cards/minor/${fileNumber}-${courtName}-of-${suitCapitalized}.png`;
        }
      }
    }

    console.warn('[UnifiedCardImage] 카드 이미지 경로를 생성할 수 없습니다:', card);
    return FALLBACK_CARD;
    
  } catch (error) {
    console.error('[UnifiedCardImage] 카드 이미지 경로 생성 오류:', error, card);
    return FALLBACK_CARD;
  }
}

/**
 * 이미지 로드 에러 처리 함수
 */
export function handleUnifiedImageError(event: Event): void {
  const img = event.target as HTMLImageElement;
  if (!img || !img.parentElement) return;
  
  // 이미 폴백 처리가 되었는지 확인
  if (img.dataset.fallbackApplied === 'true') return;
  
  img.dataset.fallbackApplied = 'true';
  img.style.display = 'none';
  
  // 이미 폴백 엘리먼트가 있는지 확인
  if (!img.parentElement.querySelector('.fallback-emoji')) {
    const fallbackEmoji = document.createElement('div');
    fallbackEmoji.className = 'fallback-emoji';
    fallbackEmoji.textContent = '🎴';
    fallbackEmoji.style.cssText = `
      font-size: 48px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background: rgba(75, 85, 99, 0.9);
      border-radius: 6px;
      z-index: 10;
    `;
    img.parentElement.appendChild(fallbackEmoji);
  }
}

/**
 * 카드가 역방향인지 확인하는 유틸리티 함수
 */
export function isCardReversed(card: any): boolean {
  if (!card) return false;
  return card.is_reversed === true || 
         card.isReversed === true || 
         card.orientation === 'reversed' || 
         card.orientation === 'reverse' ||
         false;
}

// 기존 cardUtils와의 호환성을 위한 별칭 내보내기
export const getCardImagePath = getUnifiedCardImagePath;
export const handleImageError = handleUnifiedImageError;
export const isReversedCard = isCardReversed;