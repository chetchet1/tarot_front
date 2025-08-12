/**
 * 타로 해석을 위한 공통 유틸리티 함수들
 */

import { supabase } from '../../services/supabase';

// 카드 타입 정의
export interface TarotCard {
  id?: string | number;
  name: string;
  name_kr: string;
  nameKr?: string;
  arcana: 'major' | 'minor' | 'unknown';
  suit?: string | null;
  number?: number | null;
  orientation: 'upright' | 'reversed';
  position: {
    position: number;
    name: string;
  };
  meanings?: Record<string, any>;
}

// 해석 요청 타입
export interface InterpretationRequest {
  cards: TarotCard[];
  topic: string;
  customQuestion?: string;
  spreadType: string;
}

/**
 * 카드 조합에서 시너지 패턴 찾기
 */
export function findSynergyPatterns(cards: TarotCard[]): string[] {
  const patterns: string[] = [];
  
  // 메이저 아르카나 패턴
  const majorCards = cards.filter(c => c.arcana === 'major');
  if (majorCards.length >= 3) {
    patterns.push('중요한 인생의 전환점 - 메이저 아르카나 다수');
  }
  
  // 같은 슈트 패턴
  const suitCounts: Record<string, number> = {};
  cards.forEach(card => {
    if (card.suit) {
      suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
    }
  });
  
  Object.entries(suitCounts).forEach(([suit, count]) => {
    if (count >= 3) {
      const suitMeanings: Record<string, string> = {
        'wands': '열정과 행동력',
        'cups': '감정과 관계',
        'swords': '사고와 소통',
        'pentacles': '물질과 안정'
      };
      patterns.push(`${suitMeanings[suit] || suit} 에너지 집중`);
    }
  });
  
  // 숫자 패턴
  const numberCounts: Record<number, number> = {};
  cards.forEach(card => {
    if (card.number !== null && card.number !== undefined) {
      numberCounts[card.number] = (numberCounts[card.number] || 0) + 1;
    }
  });
  
  Object.entries(numberCounts).forEach(([num, count]) => {
    if (count >= 2) {
      const numberMeanings: Record<string, string> = {
        '1': '새로운 시작',
        '2': '균형과 선택',
        '3': '성장과 창조',
        '4': '안정과 기반',
        '5': '도전과 변화',
        '6': '조화와 회복',
        '7': '성찰과 평가',
        '8': '숙련과 진전',
        '9': '완성 직전',
        '10': '완성과 새로운 순환'
      };
      patterns.push(`${numberMeanings[num] || `숫자 ${num}`}의 반복적 메시지`);
    }
  });
  
  // 정/역 비율 패턴
  const uprightCount = cards.filter(c => c.orientation === 'upright').length;
  const reversedCount = cards.length - uprightCount;
  
  if (reversedCount > uprightCount) {
    patterns.push('내면의 도전과 성찰이 필요한 시기');
  } else if (uprightCount === cards.length) {
    patterns.push('긍정적 에너지가 우세한 상황');
  }
  
  return patterns;
}

/**
 * 주제별 핵심 키워드 추출
 */
export function extractTopicKeywords(topic: string): string[] {
  const topicKeywords: Record<string, string[]> = {
    'love': ['사랑', '관계', '감정', '소통', '신뢰', '애정', '연결', '파트너십'],
    'career': ['일', '성장', '목표', '성취', '도전', '기회', '발전', '책임'],
    'money': ['재정', '안정', '풍요', '투자', '보상', '가치', '자원', '계획'],
    'general': ['인생', '방향', '에너지', '가능성', '변화', '균형', '지혜', '성장'],
    '연애운': ['사랑', '관계', '감정', '소통', '신뢰', '애정', '연결', '파트너십'],
    '직업운': ['일', '성장', '목표', '성취', '도전', '기회', '발전', '책임'],
    '금전운': ['재정', '안정', '풍요', '투자', '보상', '가치', '자원', '계획'],
    '종합운': ['인생', '방향', '에너지', '가능성', '변화', '균형', '지혜', '성장']
  };
  
  return topicKeywords[topic] || topicKeywords['general'];
}

/**
 * 카드 간 관계 분석
 */
export function analyzeCardRelationships(cards: TarotCard[]): {
  complementary: Array<[number, number]>;
  conflicting: Array<[number, number]>;
  supporting: Array<[number, number]>;
} {
  const relationships = {
    complementary: [] as Array<[number, number]>,
    conflicting: [] as Array<[number, number]>,
    supporting: [] as Array<[number, number]>
  };
  
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const card1 = cards[i];
      const card2 = cards[j];
      
      // 보완 관계 (예: Fool과 World)
      if (
        (card1.name === 'The Fool' && card2.name === 'The World') ||
        (card1.name === 'The World' && card2.name === 'The Fool')
      ) {
        relationships.complementary.push([i, j]);
      }
      
      // 충돌 관계 (예: 같은 슈트의 정/역)
      if (
        card1.suit === card2.suit && 
        card1.orientation !== card2.orientation
      ) {
        relationships.conflicting.push([i, j]);
      }
      
      // 지원 관계 (예: 같은 슈트의 연속 숫자)
      if (
        card1.suit === card2.suit && 
        card1.number !== null && 
        card2.number !== null &&
        Math.abs(card1.number - card2.number) === 1
      ) {
        relationships.supporting.push([i, j]);
      }
    }
  }
  
  return relationships;
}

/**
 * 해석의 일관성 검증
 */
export function validateInterpretationCoherence(interpretation: string): boolean {
  // 최소 길이 검증
  if (interpretation.length < 100) {
    return false;
  }
  
  // 필수 구조 요소 확인
  const hasIntro = interpretation.includes('전체적으로') || 
                   interpretation.includes('종합적으로') ||
                   interpretation.includes('전반적으로');
  
  const hasConclusion = interpretation.includes('조언') || 
                        interpretation.includes('제안') ||
                        interpretation.includes('추천') ||
                        interpretation.includes('마지막으로');
  
  // 문단 구조 확인 (최소 2개 이상의 문단)
  const paragraphs = interpretation.split('\n\n').filter(p => p.trim().length > 0);
  if (paragraphs.length < 2) {
    return false;
  }
  
  return hasIntro || hasConclusion;
}

/**
 * 카드 데이터베이스에서 상세 정보 가져오기
 */
export async function fetchCardDetails(cardId: string | number): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('tarot_cards')
      .select('*')
      .eq('id', cardId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('카드 상세 정보 조회 실패:', error);
    return null;
  }
}

/**
 * 해석 템플릿 생성
 */
export function createInterpretationTemplate(
  cards: TarotCard[],
  topic: string,
  spreadType: string
): string {
  const keywords = extractTopicKeywords(topic);
  const patterns = findSynergyPatterns(cards);
  
  let template = `【${topic} 해석】\n\n`;
  
  // 전체적인 에너지
  template += '◆ 전체적인 에너지\n';
  if (patterns.length > 0) {
    template += patterns.map(p => `• ${p}`).join('\n');
  }
  template += '\n\n';
  
  // 핵심 메시지
  template += '◆ 핵심 메시지\n';
  template += `${keywords.slice(0, 3).join(', ')}에 대한 중요한 통찰\n\n`;
  
  // 각 카드별 해석
  template += '◆ 카드별 상세 해석\n';
  cards.forEach(card => {
    template += `• ${card.position.name} - ${card.nameKr || card.name_kr} (${card.orientation === 'upright' ? '정방향' : '역방향'})\n`;
  });
  template += '\n';
  
  // 조언
  template += '◆ 조언과 제안\n';
  template += '앞으로의 방향성과 실천 사항\n';
  
  return template;
}

/**
 * AI 응답 후처리
 */
export function postProcessAIResponse(response: string): string {
  // 불필요한 반복 제거
  const lines = response.split('\n');
  const uniqueLines: string[] = [];
  let lastLine = '';
  
  for (const line of lines) {
    if (line.trim() !== lastLine.trim() || line.trim() === '') {
      uniqueLines.push(line);
      lastLine = line;
    }
  }
  
  // 과도한 줄바꿈 정리
  let processedResponse = uniqueLines.join('\n');
  processedResponse = processedResponse.replace(/\n{4,}/g, '\n\n\n');
  
  // 이모지 일관성 확인
  const emojiPattern = /[🔮✨💫⭐🌟💖❤️🌙☀️]/g;
  const emojiCount = (processedResponse.match(emojiPattern) || []).length;
  
  // 이모지가 너무 많으면 제거
  if (emojiCount > 10) {
    processedResponse = processedResponse.replace(emojiPattern, '');
  }
  
  return processedResponse.trim();
}

/**
 * 확률 분석 (선택적 기능)
 */
export function calculateProbabilityScore(
  cards: TarotCard[],
  topic: string
): { score: number; factors: string[] } {
  let score = 50; // 기본 50%
  const factors: string[] = [];
  
  // 정방향 카드 비율
  const uprightRatio = cards.filter(c => c.orientation === 'upright').length / cards.length;
  if (uprightRatio > 0.7) {
    score += 20;
    factors.push('긍정적 카드 우세 (+20%)');
  } else if (uprightRatio < 0.3) {
    score -= 20;
    factors.push('도전적 카드 우세 (-20%)');
  }
  
  // 메이저 아르카나 비율
  const majorRatio = cards.filter(c => c.arcana === 'major').length / cards.length;
  if (majorRatio > 0.5) {
    score += 10;
    factors.push('중요한 전환점 (+10%)');
  }
  
  // 주제별 특수 카드
  const topicSpecialCards: Record<string, string[]> = {
    'love': ['The Lovers', 'Two of Cups', 'Ten of Cups'],
    'career': ['Three of Pentacles', 'Eight of Pentacles', 'Ten of Pentacles'],
    'money': ['Ace of Pentacles', 'Nine of Pentacles', 'Ten of Pentacles']
  };
  
  const specialCards = topicSpecialCards[topic] || [];
  const hasSpecialCard = cards.some(c => specialCards.includes(c.name));
  if (hasSpecialCard) {
    score += 15;
    factors.push('주제 관련 특별 카드 출현 (+15%)');
  }
  
  // 점수 범위 제한
  score = Math.max(0, Math.min(100, score));
  
  return { score, factors };
}
