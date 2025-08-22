// 카드 뒷면 기본 이미지
const CARD_BACK_URL = '/assets/tarot-cards/back.jpg';

/**
 * DailyCard.vue의 카드 이미지 URL 가져오기 함수
 * 카드 속성(arcana, number, suit, court)을 기반으로 이미지 경로 생성
 */
export const getCardImageUrl = (card: any): string => {
  if (!card) {
    return CARD_BACK_URL;
  }
  
  // 메이저 아르카나
  if (card.arcana === 'major') {
    const cardNumber = (card.number !== undefined ? card.number : 0).toString().padStart(2, '0');
    
    // 메이저 카드 이름 매핑 (실제 파일명)
    const majorNames: Record<string, string> = {
      '00': 'the-Fool',
      '01': 'The-Magician',
      '02': 'The-High-Priestess',
      '03': 'The-Empress',
      '04': 'The-Emperor',
      '05': 'The-Hierophant',
      '06': 'The-Lovers',
      '07': 'The-Chariot',
      '08': 'Strength',
      '09': 'The-Hermit',
      '10': 'Wheel-of-Fortune',
      '11': 'Justice',
      '12': 'The-Hanged-Man',
      '13': 'Death',
      '14': 'Temperance',
      '15': 'The-Devil',
      '16': 'The-Tower',
      '17': 'The-Star',
      '18': 'The-Moon',
      '19': 'The-Sun',
      '20': 'Judgement',
      '21': 'The-World'
    };
    
    const cardName = majorNames[cardNumber] || card.name.replace(/ /g, '-');
    return `/assets/tarot-cards/major/${cardNumber}-${cardName}.png`;
  }
  
  // 마이너 아르카나
  if (card.arcana === 'minor') {
    const suit = card.suit?.toLowerCase() || 'wands';
    
    // 숫자 카드 (1-10)
    if (card.number && card.number >= 1 && card.number <= 10) {
      const cardNumber = card.number.toString().padStart(2, '0');
      const numberNames = ['', 'ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
      const cardName = `${numberNames[card.number]}-of-${suit}`;
      return `/assets/tarot-cards/minor/${cardNumber}-${cardName}.png`;
    }
    
    // 코트 카드 (11-14 또는 court 필드)
    let courtType = card.court;
    if (!courtType && card.number && card.number >= 11 && card.number <= 14) {
      const courtByNumber: Record<number, string> = {
        11: 'page',
        12: 'knight', 
        13: 'queen',
        14: 'king'
      };
      courtType = courtByNumber[card.number];
    }
    
    if (courtType) {
      const suitOrder = ['wands', 'cups', 'swords', 'pentacles'];
      const courtOrder = ['page', 'knight', 'queen', 'king'];
      const baseNumbers = [41, 45, 49, 53]; // 각 슈트의 시작 번호
      
      const suitIndex = suitOrder.indexOf(suit);
      const courtIndex = courtOrder.indexOf(courtType.toLowerCase());
      
      if (suitIndex !== -1 && courtIndex !== -1) {
        const cardNumber = baseNumbers[suitIndex] + courtIndex;
        const courtName = courtType.charAt(0).toUpperCase() + courtType.slice(1).toLowerCase();
        const suitName = suit.charAt(0).toUpperCase() + suit.slice(1).toLowerCase();
        return `/assets/tarot-cards/minor/${cardNumber}-${courtName}-of-${suitName}.png`;
      }
    }
  }
  
  return CARD_BACK_URL;
};

/**
 * 카드 이미지 경로를 반환하는 유틸리티 함수
 * CARD_IMAGE_NAMING_RULES.md 문서를 기준으로 정확한 매핑 사용
 */
export const getCardImagePath = (card: any): string => {
  try {
    // card가 없는 경우 기본 이미지 반환
    if (!card) {
      console.warn('카드 데이터가 없습니다');
      return '/assets/tarot-cards/back.jpg';
    }
    
    // cardNumber가 있는 경우 (History에서 사용)
    if (card.cardNumber !== undefined && card.cardNumber !== null) {
      const dbId = Number(card.cardNumber);
      
      // 메이저 아르카나 (0-21)
      if (dbId >= 0 && dbId <= 21) {
        const majorCardNames = {
          0: '00-the-Fool.png', 1: '01-The-Magician.png', 2: '02-The-High-Priestess.png',
          3: '03-The-Empress.png', 4: '04-The-Emperor.png', 5: '05-The-Hierophant.png',
          6: '06-The-Lovers.png', 7: '07-The-Chariot.png', 8: '08-Strength.png',
          9: '09-The-Hermit.png', 10: '10-Wheel-of-Fortune.png', 11: '11-Justice.png',
          12: '12-The-Hanged-Man.png', 13: '13-Death.png', 14: '14-Temperance.png',
          15: '15-The-Devil.png', 16: '16-The-Tower.png', 17: '17-The-Star.png',
          18: '18-The-Moon.png', 19: '19-The-Sun.png', 20: '20-Judgement.png',
          21: '21-The-World.png'
        };
        return `/assets/tarot-cards/major/${majorCardNames[dbId]}`;
      }
      
      // 마이너 아르카나 (22-77)
      if (dbId >= 22 && dbId <= 77) {
        const minorMapping: Record<number, string> = {
          // Cups 숫자 카드 (22-31)
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
          
          // Wands 숫자 카드 (36-45)
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
          
          // Swords 숫자 카드 (50-59)
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
          
          // Pentacles 숫자 카드 (64-73)
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
        
        const fileName = minorMapping[dbId];
        if (fileName) {
          return `/assets/tarot-cards/minor/${fileName}`;
        }
      }
    }
    
    // card.id가 있는 경우 (DB ID로 처리)
    if (card.id !== undefined && card.id !== null) {
      const dbId = Number(card.id);
      
      // 메이저 아르카나 (0-21)
      if (dbId >= 0 && dbId <= 21) {
        const majorCardNames = {
          0: '00-the-Fool.png', 1: '01-The-Magician.png', 2: '02-The-High-Priestess.png',
          3: '03-The-Empress.png', 4: '04-The-Emperor.png', 5: '05-The-Hierophant.png',
          6: '06-The-Lovers.png', 7: '07-The-Chariot.png', 8: '08-Strength.png',
          9: '09-The-Hermit.png', 10: '10-Wheel-of-Fortune.png', 11: '11-Justice.png',
          12: '12-The-Hanged-Man.png', 13: '13-Death.png', 14: '14-Temperance.png',
          15: '15-The-Devil.png', 16: '16-The-Tower.png', 17: '17-The-Star.png',
          18: '18-The-Moon.png', 19: '19-The-Sun.png', 20: '20-Judgement.png',
          21: '21-The-World.png'
        };
        return `/assets/tarot-cards/major/${majorCardNames[dbId]}`;
      }
      
      // 마이너 아르카나 (22-77)
      if (dbId >= 22 && dbId <= 77) {
        const minorMapping: Record<number, string> = {
          // Cups 숫자 카드 (22-31)
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
          
          // Wands 숫자 카드 (36-45)
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
          
          // Swords 숫자 카드 (50-59)
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
          
          // Pentacles 숫자 카드 (64-73)
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
        
        const fileName = minorMapping[dbId];
        if (fileName) {
          return `/assets/tarot-cards/minor/${fileName}`;
        }
      }
    }
    
    // Supabase에서 오는 imageUrl이 있다면 먼저 처리
    if (card.imageUrl && !card.imageUrl.includes('undefined')) {
      let finalUrl = card.imageUrl;
      // 수트 폴더가 포함된 경로를 수정
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/cups/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/wands/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/swords/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/pentacles/', '/assets/tarot-cards/minor/');
      
      // 메이저 아르카나 파일명 대소문자 수정
      if (finalUrl.includes('/assets/tarot-cards/major/')) {
        const corrections = {
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
        
        for (const [wrong, correct] of Object.entries(corrections)) {
          if (finalUrl.includes(wrong)) {
            finalUrl = finalUrl.replace(wrong, correct);
            break;
          }
        }
      }
      
      return finalUrl;
    }
    
    // 마이너 아르카나의 경우
    if (card.arcana === 'minor') {
      // DB ID로부터 파일 경로를 직접 매핑하는 함수
      const getFilePathFromId = (id: number): string => {
        // 완전한 매핑 테이블 (CARD_IMAGE_NAMING_RULES.md 기준)
        const completeMapping: Record<number, string> = {
          // Cups 숫자 카드 (22-31)
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
          
          // Wands 숫자 카드 (36-45)
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
          
          // Swords 숫자 카드 (50-59)
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
          
          // Pentacles 숫자 카드 (64-73)
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
        
        return completeMapping[id] || '';
      };
      
      // card.id가 있는 경우 ID 기반으로 처리
      if (card.id) {
        const fileName = getFilePathFromId(card.id);
        if (fileName) {
          return `/assets/tarot-cards/minor/${fileName}`;
        }
      }
      
      // 기존 로직 (card.number와 card.suit 기반) - 폴백용
      if (card.number >= 11 && card.number <= 14 && card.suit) {
        const courtNumbers = {
          'wands': { 11: 41, 12: 42, 13: 43, 14: 44 },
          'cups': { 11: 45, 12: 46, 13: 47, 14: 48 },
          'swords': { 11: 49, 12: 50, 13: 51, 14: 52 },
          'pentacles': { 11: 53, 12: 54, 13: 55, 14: 56 }
        };
        
        const suitLower = card.suit.toLowerCase();
        const fileNumber = courtNumbers[suitLower]?.[card.number];
        
        if (fileNumber) {
          const faceCards = {
            11: 'Page', 12: 'Knight', 13: 'Queen', 14: 'King'
          };
          const suitCapitalized = card.suit.charAt(0).toUpperCase() + card.suit.slice(1);
          const cardName = `${faceCards[card.number]}-of-${suitCapitalized}`;
          return `/assets/tarot-cards/minor/${fileNumber}-${cardName}.png`;
        }
      }
      
      // 숫자 카드의 경우 (1-10) - 폴백용
      if (card.number <= 10 && card.suit) {
        // suit별 시작 ID
        const suitStartIds = {
          'wands': 22,    // 22-31
          'cups': 36,     // 36-45
          'swords': 50,   // 50-59
          'pentacles': 64 // 64-73
        };
        
        const suitLower = card.suit.toLowerCase();
        const startId = suitStartIds[suitLower];
        
        if (startId) {
          const dbId = startId + (card.number - 1);
          const fileName = getFilePathFromId(dbId);
          if (fileName) {
            return `/assets/tarot-cards/minor/${fileName}`;
          }
        }
      }
      
      // suit가 없는 경우 이름으로 추측
      if (card.name) {
        const cardName = card.name.toLowerCase().replace(/\s+/g, '-');
        // 기본값으로 01번 사용
        return `/assets/tarot-cards/minor/01-${cardName}.png`;
      }
    }
    
    // 메이저 아르카나의 경우
    if (card.arcana === 'major') {
      const majorCardNames = {
        0: '00-the-Fool.png', 1: '01-The-Magician.png', 2: '02-The-High-Priestess.png',
        3: '03-The-Empress.png', 4: '04-The-Emperor.png', 5: '05-The-Hierophant.png',
        6: '06-The-Lovers.png', 7: '07-The-Chariot.png', 8: '08-Strength.png',
        9: '09-The-Hermit.png', 10: '10-Wheel-of-Fortune.png', 11: '11-Justice.png',
        12: '12-The-Hanged-Man.png', 13: '13-Death.png', 14: '14-Temperance.png',
        15: '15-The-Devil.png', 16: '16-The-Tower.png', 17: '17-The-Star.png',
        18: '18-The-Moon.png', 19: '19-The-Sun.png', 20: '20-Judgement.png',
        21: '21-The-World.png'
      };
      
      const fileName = majorCardNames[card.number] || '00-the-Fool.png';
      return `/assets/tarot-cards/major/${fileName}`;
    }
    
    return '/assets/tarot-cards/major/00-the-Fool.png';
  } catch (error) {
    console.error('카드 이미지 URL 생성 오류:', error);
    return '/assets/tarot-cards/major/00-the-Fool.png';
  }
};

/**
 * 카드가 역방향인지 확인하는 유틸리티 함수
 */
export const isReversedCard = (card: any): boolean => {
  if (!card) return false;
  return card.is_reversed || card.orientation === 'reversed' || false;
};

/**
 * 이미지 로드 에러 처리 함수
 */
export const handleImageError = (event: Event): void => {
  const img = event.target as HTMLImageElement;
  if (img && img.parentElement) {
    img.style.display = 'none';
    if (!img.parentElement.querySelector('.fallback-emoji')) {
      const fallbackEmoji = document.createElement('div');
      fallbackEmoji.className = 'fallback-emoji';
      fallbackEmoji.textContent = '🎴';
      fallbackEmoji.style.cssText = `
        font-size: 48px; text-align: center; display: flex;
        align-items: center; justify-content: center;
        width: 100%; height: 100%; position: absolute;
        top: 0; left: 0; background: rgba(75, 85, 99, 0.9);
        border-radius: 6px; z-index: 10;
      `;
      img.parentElement.appendChild(fallbackEmoji);
    }
  }
};
