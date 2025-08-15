/**
 * 타로 카드 이미지 경로 유틸리티
 * 
 * 이 파일은 타로 카드 ID를 올바른 이미지 파일 경로로 변환합니다.
 * 참조 문서: /docs/images/CARD_IMAGE_NAMING_RULES.md
 */

/**
 * 카드 ID(또는 cardNumber)를 이미지 경로로 변환
 * @param cardId - 데이터베이스 카드 ID (0-77)
 * @returns 카드 이미지 파일 경로
 */
export function getCardImagePath(cardId: number): string {
  // 숫자가 아니거나 범위를 벗어난 경우
  if (typeof cardId !== 'number' || cardId < 0 || cardId > 77) {
    console.warn(`Invalid card ID: ${cardId}`);
    return '/assets/tarot-cards/major/00-the-Fool.png';
  }
  
  console.log(`🎯 getCardImagePath called with ID: ${cardId}`);

  // 메이저 아르카나 (0-21)
  if (cardId <= 21) {
    const majorCards: Record<number, string> = {
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
    
    const path = `/assets/tarot-cards/major/${majorCards[cardId]}`;
    console.log(`🎯 Major Arcana: ID ${cardId} -> ${path}`);
    return path;
  }

  // 마이너 아르카나 - 완전한 매핑 테이블 (DB 기준)
  // DB ID 범위:
  // - Cups: 22-35 (숫자: 22-31, 코트: 32-35)
  // - Wands: 36-49 (숫자: 36-45, 코트: 46-49)
  // - Swords: 50-63 (숫자: 50-59, 코트: 60-63)
  // - Pentacles: 64-77 (숫자: 64-73, 코트: 74-77)
  
  const minorCards: Record<number, string> = {
    // Cups 숫자 카드 (22-31) - 파일번호 01-10
    22: '01-ace-of-cups.png',
    23: '02-two-of-cups.png',
    24: '03-three-of-cups.png',
    25: '04-four-of-cups.png',
    26: '05-five-of-cups.png',
    27: '06-six-of-cups.png',
    28: '07-seven-of-cups.png',
    29: '08-eight-of-cups.png',
    30: '09-nine-of-cups.png',
    31: '10-ten-of-cups.png',
    
    // Cups 코트 카드 (32-35) - 파일번호 45-48
    32: '45-Page-of-Cups.png',
    33: '46-Knight-of-Cups.png',
    34: '47-Queen-of-Cups.png',
    35: '48-King-of-Cups.png',
    
    // Wands 숫자 카드 (36-45) - 파일번호 01-10
    36: '01-ace-of-wands.png',
    37: '02-two-of-wands.png',
    38: '03-three-of-wands.png',
    39: '04-four-of-wands.png',
    40: '05-five-of-wands.png',
    41: '06-six-of-wands.png',
    42: '07-seven-of-wands.png',
    43: '08-eight-of-wands.png',
    44: '09-nine-of-wands.png',
    45: '10-ten-of-wands.png',
    
    // Wands 코트 카드 (46-49) - 파일번호 41-44
    46: '41-Page-of-Wands.png',
    47: '42-Knight-of-Wands.png',
    48: '43-Queen-of-Wands.png',
    49: '44-King-of-Wands.png',
    
    // Swords 숫자 카드 (50-59) - 파일번호 01-10
    50: '01-ace-of-swords.png',
    51: '02-two-of-swords.png',
    52: '03-three-of-swords.png',
    53: '04-four-of-swords.png',
    54: '05-five-of-swords.png',
    55: '06-six-of-swords.png',
    56: '07-seven-of-swords.png',
    57: '08-eight-of-swords.png',
    58: '09-nine-of-swords.png',
    59: '10-ten-of-swords.png',
    
    // Swords 코트 카드 (60-63) - 파일번호 49-52
    60: '49-Page-of-Swords.png',
    61: '50-Knight-of-Swords.png',
    62: '51-Queen-of-Swords.png',
    63: '52-King-of-Swords.png',
    
    // Pentacles 숫자 카드 (64-73) - 파일번호 01-10
    64: '01-ace-of-pentacles.png',
    65: '02-two-of-pentacles.png',
    66: '03-three-of-pentacles.png',
    67: '04-four-of-pentacles.png',
    68: '05-five-of-pentacles.png',
    69: '06-six-of-pentacles.png',
    70: '07-seven-of-pentacles.png',
    71: '08-eight-of-pentacles.png',
    72: '09-nine-of-pentacles.png',
    73: '10-ten-of-pentacles.png',
    
    // Pentacles 코트 카드 (74-77) - 파일번호 53-56
    74: '53-Page-of-Pentacles.png',
    75: '54-Knight-of-Pentacles.png',
    76: '55-Queen-of-Pentacles.png',
    77: '56-King-of-Pentacles.png'
  };

  if (minorCards[cardId]) {
    const path = `/assets/tarot-cards/minor/${minorCards[cardId]}`;
    
    // 슈트 판별
    let suit = '';
    if (cardId >= 22 && cardId <= 35) suit = 'Cups';
    else if (cardId >= 36 && cardId <= 49) suit = 'Wands';
    else if (cardId >= 50 && cardId <= 63) suit = 'Swords';
    else if (cardId >= 64 && cardId <= 77) suit = 'Pentacles';
    
    console.log(`🎯 Minor Arcana (${suit}): ID ${cardId} -> ${minorCards[cardId]}`);
    return path;
  }

  // 폴백 - The Fool
  console.warn(`Card ID ${cardId} not found in mapping`);
  return '/assets/tarot-cards/major/00-the-Fool.png';
}

/**
 * 카드 정보 객체에서 이미지 경로 추출
 * @param card - 카드 정보 객체
 * @returns 카드 이미지 파일 경로
 */
export function getCardImageFromObject(card: any): string {
  // 디버깅 로그
  console.log('🎴 getCardImageFromObject input:', {
    cardNumber: card.cardNumber,
    id: card.id,
    number: card.number,
    name: card.name,
    nameKr: card.nameKr,
    suit: card.suit,
    arcana: card.arcana
  });
  
  // cardNumber 우선, 없으면 id, 그도 없으면 number 사용
  let cardId: number | undefined;
  
  if (card.cardNumber !== undefined && card.cardNumber !== null) {
    cardId = Number(card.cardNumber);
    console.log('🔵 Using cardNumber:', cardId);
  } else if (card.id !== undefined && card.id !== null) {
    cardId = Number(card.id);
    console.log('🟢 Using id:', cardId);
  } else if (card.number !== undefined && card.number !== null) {
    cardId = Number(card.number);
    console.log('🟡 Using number:', cardId);
  }
  
  console.log('🎴 Resolved cardId:', cardId);
  
  if (cardId === undefined || isNaN(cardId)) {
    console.warn('Card object has no valid cardNumber, id, or number:', card);
    return '/assets/tarot-cards/major/00-the-Fool.png';
  }
  
  const result = getCardImagePath(cardId);
  console.log('🎴 Final image path:', result);
  return result;
}

/**
 * 카드 ID가 메이저 아르카나인지 확인
 * @param cardId - 카드 ID
 * @returns 메이저 아르카나 여부
 */
export function isMajorArcana(cardId: number): boolean {
  return cardId >= 0 && cardId <= 21;
}

/**
 * 카드 ID가 코트 카드인지 확인
 * @param cardId - 카드 ID
 * @returns 코트 카드 여부
 */
export function isCourtCard(cardId: number): boolean {
  return (cardId >= 32 && cardId <= 35) ||  // Cups Court
         (cardId >= 46 && cardId <= 49) ||  // Wands Court
         (cardId >= 60 && cardId <= 63) ||  // Swords Court
         (cardId >= 74 && cardId <= 77);    // Pentacles Court
}

/**
 * 카드 ID에서 슈트(suit) 추출
 * @param cardId - 카드 ID
 * @returns 슈트 이름 또는 null (메이저 아르카나의 경우)
 */
export function getCardSuit(cardId: number): string | null {
  if (cardId <= 21) return null;  // Major Arcana
  if (cardId >= 22 && cardId <= 35) return 'cups';
  if (cardId >= 36 && cardId <= 49) return 'wands';
  if (cardId >= 50 && cardId <= 63) return 'swords';
  if (cardId >= 64 && cardId <= 77) return 'pentacles';
  return null;
}

/**
 * 카드 이름으로 ID 추론 (폴백용)
 * @param name - 카드 이름
 * @returns 추론된 카드 ID 또는 null
 */
export function inferCardIdFromName(name: string): number | null {
  if (!name) return null;
  
  const lowerName = name.toLowerCase();
  
  // 코트 카드 체크
  const courtMapping: Record<string, number> = {
    'page of cups': 32,
    'knight of cups': 33,
    'queen of cups': 34,
    'king of cups': 35,
    'page of wands': 46,
    'knight of wands': 47,
    'queen of wands': 48,
    'king of wands': 49,
    'page of swords': 60,
    'knight of swords': 61,
    'queen of swords': 62,
    'king of swords': 63,
    'page of pentacles': 74,
    'knight of pentacles': 75,
    'queen of pentacles': 76,
    'king of pentacles': 77
  };
  
  if (courtMapping[lowerName]) {
    return courtMapping[lowerName];
  }
  
  // 숫자 카드 체크
  const numberWords = ['ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const suits = ['cups', 'wands', 'swords', 'pentacles'];
  
  for (let i = 0; i < numberWords.length; i++) {
    for (const suit of suits) {
      if (lowerName === `${numberWords[i]} of ${suit}`) {
        const baseIds: Record<string, number> = {
          'cups': 22,
          'wands': 36,
          'swords': 50,
          'pentacles': 64
        };
        return baseIds[suit] + i;
      }
    }
  }
  
  // 메이저 아르카나 체크
  const majorMapping: Record<string, number> = {
    'the fool': 0,
    'fool': 0,
    'the magician': 1,
    'magician': 1,
    'the high priestess': 2,
    'high priestess': 2,
    'the empress': 3,
    'empress': 3,
    'the emperor': 4,
    'emperor': 4,
    'the hierophant': 5,
    'hierophant': 5,
    'the lovers': 6,
    'lovers': 6,
    'the chariot': 7,
    'chariot': 7,
    'strength': 8,
    'the hermit': 9,
    'hermit': 9,
    'wheel of fortune': 10,
    'the wheel of fortune': 10,
    'justice': 11,
    'the hanged man': 12,
    'hanged man': 12,
    'death': 13,
    'temperance': 14,
    'the devil': 15,
    'devil': 15,
    'the tower': 16,
    'tower': 16,
    'the star': 17,
    'star': 17,
    'the moon': 18,
    'moon': 18,
    'the sun': 19,
    'sun': 19,
    'judgement': 20,
    'judgment': 20,
    'the world': 21,
    'world': 21
  };
  
  if (majorMapping[lowerName] !== undefined) {
    return majorMapping[lowerName];
  }
  
  return null;
}
