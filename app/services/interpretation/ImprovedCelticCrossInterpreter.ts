import { supabase } from '@/config/supabase';
import { DrawnCard, SpreadPosition } from '../../models/tarot';

interface InterpretationResult {
  overallMessage: string;
  positionInterpretations: PositionInterpretation[];
  advice: string;
  positiveAspects: string[];
  challengeAspects: string[];
  outcome: OutcomeInterpretation;
}

interface PositionInterpretation {
  position: number;
  positionName: string;
  cardName: string;
  briefMeaning: string;
  detailedMeaning: string;
}

interface OutcomeInterpretation {
  isPositive: boolean;
  certaintyLevel: 'high' | 'medium' | 'low';
  summary: string;
  guidance: string;
}

export class ImprovedCelticCrossInterpreter {
  private topic: string;
  private cards: DrawnCard[];
  
  // 주제별 해석 데이터
  private readonly topicInterpretations = {
    love: {
      title: '연애운',
      focus: '사랑과 관계',
      positiveKeywords: ['사랑', '만남', '조화', '성장', '행복', '결합', '신뢰', '열정'],
      negativeKeywords: ['이별', '갈등', '불안', '의심', '정체', '거리감', '혼란', '집착'],
      positions: {
        1: '당신의 현재 마음',
        2: '관계의 현재 상황',
        3: '이 관계의 뿌리',
        4: '과거의 영향',
        5: '가능한 미래',
        6: '곧 일어날 일',
        7: '당신이 생각하는 사랑',
        8: '상대방의 관점',
        9: '숨겨진 감정',
        10: '최종 결과'
      }
    },
    career: {
      title: '직업운',
      focus: '일과 성취',
      positiveKeywords: ['성공', '승진', '성장', '기회', '인정', '발전', '안정', '성취'],
      negativeKeywords: ['정체', '갈등', '스트레스', '변화', '불안정', '경쟁', '좌절', '압박'],
      positions: {
        1: '현재 업무 상태',
        2: '직면한 도전',
        3: '상황의 근본 원인',
        4: '과거 경험의 영향',
        5: '달성 가능한 목표',
        6: '다가올 기회',
        7: '자신의 능력 평가',
        8: '타인의 평가',
        9: '직업적 포부',
        10: '최종 성과'
      }
    },
    general: {
      title: '종합운',
      focus: '전반적인 상황',
      positiveKeywords: ['성장', '기회', '발전', '조화', '성공', '행복', '안정', '달성'],
      negativeKeywords: ['도전', '변화', '시련', '정체', '갈등', '불안', '혼란', '지연'],
      positions: {
        1: '현재 상황',
        2: '도전 과제',
        3: '근본 원인',
        4: '과거의 영향',
        5: '가능한 결과',
        6: '가까운 미래',
        7: '자기 인식',
        8: '외부 영향',
        9: '희망과 두려움',
        10: '최종 결과'
      }
    }
  };

  constructor(topic: string, cards: DrawnCard[]) {
    this.topic = topic;
    this.cards = cards;
  }

  async interpret(): Promise<InterpretationResult> {
    const overallMessage = this.generateClearOverallMessage();
    const positionInterpretations = await this.generatePositionInterpretations();
    const { positiveAspects, challengeAspects } = this.analyzeAspects();
    const outcome = this.analyzeOutcome();
    const advice = this.generatePracticalAdvice();

    return {
      overallMessage,
      positionInterpretations,
      advice,
      positiveAspects,
      challengeAspects,
      outcome
    };
  }

  private generateClearOverallMessage(): string {
    const topicData = this.topicInterpretations[this.topic] || this.topicInterpretations.general;
    const coreCard = this.cards.find(c => c.position.position === 1);
    const challengeCard = this.cards.find(c => c.position.position === 2);
    const outcomeCard = this.cards.find(c => c.position.position === 10);

    let message = `${topicData.title} 타로 결과입니다.\n\n`;

    // 핵심 상황 설명
    if (coreCard) {
      const coreEnergy = this.getCardEnergyDescription(coreCard);
      message += `현재 ${topicData.focus}의 핵심은 **${coreEnergy}**입니다. `;
      
      if (coreCard.orientation === 'upright') {
        message += `긍정적인 에너지가 작동하고 있습니다.\n\n`;
      } else {
        message += `일부 조정이 필요한 상황입니다.\n\n`;
      }
    }

    // 도전 과제 설명
    if (challengeCard) {
      const challengeEnergy = this.getCardEnergyDescription(challengeCard);
      message += `현재 마주한 과제는 **${challengeEnergy}**와 관련이 있습니다. `;
      
      if (this.isPositiveCard(challengeCard)) {
        message += `이는 성장의 기회가 될 수 있습니다.\n\n`;
      } else {
        message += `주의 깊게 대처할 필요가 있습니다.\n\n`;
      }
    }

    // 전체적인 흐름 분석
    const majorCount = this.cards.filter(c => c.arcana === 'major').length;
    const cupCount = this.cards.filter(c => c.suit === 'cups').length;
    const swordCount = this.cards.filter(c => c.suit === 'swords').length;
    
    if (majorCount >= 5) {
      message += `**중요**: 인생의 중대한 전환점에 있습니다. 신중한 결정이 필요합니다.\n\n`;
    }
    
    if (this.topic === 'love' && cupCount >= 4) {
      message += `감정적으로 풍부한 시기입니다. 마음을 열고 소통하세요.\n\n`;
    }
    
    if (this.topic === 'career' && swordCount >= 4) {
      message += `명확한 판단과 전략이 필요한 시기입니다.\n\n`;
    }

    // 결과 예상
    if (outcomeCard) {
      const outcomeEnergy = this.getCardEnergyDescription(outcomeCard);
      if (this.isPositiveCard(outcomeCard)) {
        message += `최종적으로 **${outcomeEnergy}**의 긍정적인 결과가 예상됩니다. ✨`;
      } else {
        message += `결과를 개선하려면 **${outcomeEnergy}**에 대한 이해와 준비가 필요합니다. 💪`;
      }
    }

    return message;
  }

  private async generatePositionInterpretations(): Promise<PositionInterpretation[]> {
    const interpretations: PositionInterpretation[] = [];
    const topicData = this.topicInterpretations[this.topic] || this.topicInterpretations.general;

    for (const card of this.cards) {
      const position = card.position.position;
      const positionName = topicData.positions[position] || `${position}번 위치`;
      
      interpretations.push({
        position,
        positionName,
        cardName: card.nameKr,
        briefMeaning: this.getBriefMeaning(card, position),
        detailedMeaning: await this.getDetailedMeaning(card, position)
      });
    }

    return interpretations;
  }

  private getBriefMeaning(card: DrawnCard, position: number): string {
    const energy = this.getCardEnergyDescription(card);
    const isPositive = this.isPositiveCard(card);
    
    const positionMeanings = {
      1: isPositive ? `${energy}의 긍정적 상태` : `${energy}의 도전적 상태`,
      2: isPositive ? `${energy}의 지원` : `${energy}의 시련`,
      3: `${energy}가 근본 원인`,
      4: `과거의 ${energy} 경험`,
      5: `${energy}의 가능성`,
      6: `곧 ${energy}가 나타남`,
      7: `스스로를 ${energy}로 인식`,
      8: `타인은 ${energy}로 봄`,
      9: `${energy}에 대한 기대/우려`,
      10: isPositive ? `${energy}의 성취` : `${energy}의 교훈`
    };

    return positionMeanings[position] || `${energy}의 영향`;
  }

  private async getDetailedMeaning(card: DrawnCard, position: number): Promise<string> {
    // 카드의 기본 의미를 데이터베이스에서 가져오기
    const { data: cardData } = await supabase
      .from('tarot_cards')
      .select('meaning_upright, meaning_reversed')
      .eq('id', card.cardId)
      .single();

    if (!cardData) return '상세 해석을 불러올 수 없습니다.';

    const baseMeaning = card.orientation === 'upright' 
      ? cardData.meaning_upright 
      : cardData.meaning_reversed;

    // 주제와 위치에 맞게 의미 조정
    return this.contextualizeCardMeaning(baseMeaning, card, position);
  }

  private contextualizeCardMeaning(baseMeaning: string, card: DrawnCard, position: number): string {
    let contextualizedMeaning = baseMeaning;

    // 주제별 맥락화
    if (this.topic === 'love') {
      const loveKeywords = {
        'wands': '열정과 로맨스',
        'cups': '감정과 사랑',
        'swords': '소통과 이해',
        'pentacles': '헌신과 안정'
      };
      
      if (card.suit && loveKeywords[card.suit]) {
        contextualizedMeaning = `${loveKeywords[card.suit]}의 관점에서 ${contextualizedMeaning}`;
      }
    } else if (this.topic === 'career') {
      const careerKeywords = {
        'wands': '창의성과 도전',
        'cups': '협업과 만족',
        'swords': '전략과 결정',
        'pentacles': '성과와 보상'
      };
      
      if (card.suit && careerKeywords[card.suit]) {
        contextualizedMeaning = `${careerKeywords[card.suit]}의 측면에서 ${contextualizedMeaning}`;
      }
    }

    // 위치별 맥락 추가
    const positionContexts = {
      1: '현재 상황에서 ',
      2: '도전으로서 ',
      3: '근본적으로 ',
      4: '과거로부터 ',
      5: '가능성으로 ',
      6: '곧 다가올 ',
      7: '내면적으로 ',
      8: '외부적으로 ',
      9: '희망 또는 우려로 ',
      10: '최종적으로 '
    };

    const context = positionContexts[position] || '';
    return context + contextualizedMeaning;
  }

  private analyzeAspects(): { positiveAspects: string[], challengeAspects: string[] } {
    const positiveAspects: string[] = [];
    const challengeAspects: string[] = [];

    // 긍정적 카드 분석
    const positiveCards = this.cards.filter(c => this.isPositiveCard(c));
    const challengingCards = this.cards.filter(c => !this.isPositiveCard(c));

    // 주요 위치의 긍정적 측면
    const keyPositivePositions = [1, 6, 10];
    positiveCards.forEach(card => {
      if (keyPositivePositions.includes(card.position.position)) {
        positiveAspects.push(`${this.getPositionNameSimple(card.position.position)}에 ${card.nameKr}가 긍정적으로 작용합니다.`);
      }
    });

    // 도전적 측면
    challengingCards.forEach(card => {
      if ([2, 3, 9].includes(card.position.position)) {
        challengeAspects.push(`${this.getPositionNameSimple(card.position.position)}의 ${card.nameKr}에 주의가 필요합니다.`);
      }
    });

    // 슈트 균형 분석
    const suitCounts = this.analyzeSuitBalance();
    if (suitCounts.wands >= 4) positiveAspects.push('열정과 에너지가 충만합니다.');
    if (suitCounts.cups >= 4) positiveAspects.push('감정적 충족이 예상됩니다.');
    if (suitCounts.swords >= 4) challengeAspects.push('갈등이나 결정의 어려움이 있을 수 있습니다.');
    if (suitCounts.pentacles >= 4) positiveAspects.push('물질적 안정이 기대됩니다.');

    return { positiveAspects, challengeAspects };
  }

  private analyzeOutcome(): OutcomeInterpretation {
    const outcomeCard = this.cards.find(c => c.position.position === 10);
    if (!outcomeCard) {
      return {
        isPositive: false,
        certaintyLevel: 'low',
        summary: '결과를 예측하기 어렵습니다.',
        guidance: '상황을 지켜보며 유연하게 대처하세요.'
      };
    }

    const isPositive = this.isPositiveCard(outcomeCard);
    const certaintyLevel = this.determineCertaintyLevel();
    
    let summary = '';
    let guidance = '';

    if (this.topic === 'love') {
      if (isPositive) {
        summary = `${outcomeCard.nameKr}는 관계의 발전과 행복을 예고합니다.`;
        guidance = '긍정적인 마음을 유지하며 관계에 투자하세요.';
      } else {
        summary = `${outcomeCard.nameKr}는 관계에 변화나 성장통을 암시합니다.`;
        guidance = '인내심을 갖고 서로를 이해하려 노력하세요.';
      }
    } else if (this.topic === 'career') {
      if (isPositive) {
        summary = `${outcomeCard.nameKr}는 직업적 성공과 만족을 나타냅니다.`;
        guidance = '현재의 노력을 지속하면 좋은 결과가 있을 것입니다.';
      } else {
        summary = `${outcomeCard.nameKr}는 새로운 방향 전환이 필요함을 시사합니다.`;
        guidance = '유연한 사고로 새로운 기회를 모색하세요.';
      }
    } else {
      if (isPositive) {
        summary = `${outcomeCard.nameKr}는 전반적으로 긍정적인 결과를 예상합니다.`;
        guidance = '자신감을 갖고 앞으로 나아가세요.';
      } else {
        summary = `${outcomeCard.nameKr}는 예상과 다른 결과를 암시합니다.`;
        guidance = '변화를 받아들이고 새로운 가능성을 열어두세요.';
      }
    }

    return { isPositive, certaintyLevel, summary, guidance };
  }

  private generatePracticalAdvice(): string {
    const topicData = this.topicInterpretations[this.topic] || this.topicInterpretations.general;
    const coreCard = this.cards.find(c => c.position.position === 1);
    const challengeCard = this.cards.find(c => c.position.position === 2);
    const adviceCard = this.cards.find(c => c.position.position === 9);

    let advice = `💡 ${topicData.title} 조언:\n\n`;

    // 핵심 카드 기반 조언
    if (coreCard) {
      const coreAdvice = this.getCardAdvice(coreCard, this.topic);
      advice += `1. ${coreAdvice}\n`;
    }

    // 도전 과제 대응 조언
    if (challengeCard && !this.isPositiveCard(challengeCard)) {
      const challengeAdvice = this.getChallengeAdvice(challengeCard, this.topic);
      advice += `2. ${challengeAdvice}\n`;
    }

    // 희망과 두려움 카드 기반 조언
    if (adviceCard) {
      const hopeAdvice = this.getHopeAdvice(adviceCard, this.topic);
      advice += `3. ${hopeAdvice}\n`;
    }

    // 전체적인 조언
    const majorCount = this.cards.filter(c => c.arcana === 'major').length;
    if (majorCount >= 5) {
      advice += `\n⚠️ 중요한 시기입니다. 신중하게 결정하되, 직관도 믿으세요.`;
    }

    return advice;
  }

  // 헬퍼 메서드들
  private getCardEnergyDescription(card: DrawnCard): string {
    if (card.arcana === 'major') {
      // 메이저 카드의 핵심 에너지
      const majorEnergies: Record<number, string> = {
        0: '새로운 시작',
        1: '의지와 창조',
        2: '직관과 신비',
        3: '풍요와 창조',
        4: '권위와 구조',
        5: '전통과 가르침',
        6: '사랑과 선택',
        7: '의지와 승리',
        8: '힘과 용기',
        9: '내적 지혜',
        10: '운명의 변화',
        11: '정의와 균형',
        12: '희생과 관점 전환',
        13: '변화와 종료',
        14: '절제와 조화',
        15: '속박과 욕망',
        16: '갑작스런 변화',
        17: '희망과 영감',
        18: '환상과 불안',
        19: '성공과 기쁨',
        20: '심판과 재생',
        21: '완성과 성취'
      };
      return majorEnergies[card.number] || '특별한 에너지';
    } else {
      // 마이너 카드의 슈트별 에너지
      const suitEnergies: Record<string, string> = {
        'wands': '열정과 행동',
        'cups': '감정과 직관',
        'swords': '사고와 도전',
        'pentacles': '물질과 실현'
      };
      const numberEnergies: Record<number, string> = {
        1: '새로운 시작',
        2: '균형과 협력',
        3: '성장과 확장',
        4: '안정과 기초',
        5: '갈등과 변화',
        6: '조화와 성공',
        7: '인내와 방어',
        8: '숙달과 발전',
        9: '완성 직전',
        10: '완전한 실현'
      };
      
      const suit = suitEnergies[card.suit || ''] || '에너지';
      const number = numberEnergies[card.number] || '과정';
      return `${suit}의 ${number}`;
    }
  }

  private isPositiveCard(card: DrawnCard): boolean {
    // 정방향인 경우
    if (card.orientation === 'upright') {
      // 긍정적인 메이저 카드들
      const positiveMajors = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 14, 17, 19, 21];
      if (card.arcana === 'major' && positiveMajors.includes(card.number)) {
        return true;
      }
      
      // 마이너 카드는 5를 제외하고 대부분 긍정적
      if (card.arcana === 'minor' && card.number !== 5) {
        return true;
      }
    }
    
    // 역방향인 경우 대부분 도전적
    return false;
  }

  private getPositionNameSimple(position: number): string {
    const names: Record<number, string> = {
      1: '현재',
      2: '도전',
      3: '원인',
      4: '과거',
      5: '가능성',
      6: '미래',
      7: '자아',
      8: '환경',
      9: '희망/두려움',
      10: '결과'
    };
    return names[position] || `${position}번`;
  }

  private analyzeSuitBalance(): Record<string, number> {
    const counts = {
      wands: 0,
      cups: 0,
      swords: 0,
      pentacles: 0,
      major: 0
    };

    this.cards.forEach(card => {
      if (card.arcana === 'major') {
        counts.major++;
      } else if (card.suit) {
        counts[card.suit]++;
      }
    });

    return counts;
  }

  private determineCertaintyLevel(): 'high' | 'medium' | 'low' {
    const outcomeCard = this.cards.find(c => c.position.position === 10);
    const hopeCard = this.cards.find(c => c.position.position === 9);
    
    if (!outcomeCard) return 'low';
    
    // 결과 카드가 메이저면 확실성 높음
    if (outcomeCard.arcana === 'major') return 'high';
    
    // 희망 카드와 결과 카드가 같은 슈트면 확실성 높음
    if (hopeCard && hopeCard.suit === outcomeCard.suit) return 'high';
    
    // 결과 카드가 10이나 에이스면 확실성 높음
    if (outcomeCard.number === 1 || outcomeCard.number === 10) return 'high';
    
    // 나머지는 중간
    return 'medium';
  }

  private getCardAdvice(card: DrawnCard, topic: string): string {
    const adviceMap = {
      love: {
        wands: '열정을 유지하되 상대방을 배려하세요',
        cups: '감정을 솔직하게 표현하세요',
        swords: '명확한 소통이 필요합니다',
        pentacles: '관계에 실질적인 노력을 기울이세요'
      },
      career: {
        wands: '창의적인 접근을 시도하세요',
        cups: '동료들과의 관계를 중시하세요',
        swords: '전략적 사고가 필요합니다',
        pentacles: '꾸준한 노력이 결실을 맺을 것입니다'
      },
      general: {
        wands: '적극적으로 행동하세요',
        cups: '마음의 소리를 들으세요',
        swords: '객관적으로 상황을 분석하세요',
        pentacles: '현실적인 계획을 세우세요'
      }
    };

    if (card.arcana === 'major') {
      return '인생의 큰 흐름을 믿고 따르세요';
    }

    const topicAdvice = adviceMap[topic] || adviceMap.general;
    return topicAdvice[card.suit || 'wands'] || '신중하게 행동하세요';
  }

  private getChallengeAdvice(card: DrawnCard, topic: string): string {
    if (card.arcana === 'major') {
      const majorChallenges: Record<number, string> = {
        15: '집착에서 벗어나 자유를 찾으세요',
        16: '변화를 두려워하지 마세요',
        18: '직관을 믿되 현실도 확인하세요',
        13: '끝은 새로운 시작입니다'
      };
      return majorChallenges[card.number] || '도전을 성장의 기회로 삼으세요';
    }

    const suitChallenges: Record<string, string> = {
      wands: '충동적인 행동을 자제하세요',
      cups: '감정에 휩쓸리지 마세요',
      swords: '부정적인 생각을 멈추세요',
      pentacles: '물질에만 집착하지 마세요'
    };

    return suitChallenges[card.suit || ''] || '균형을 찾으세요';
  }

  private getHopeAdvice(card: DrawnCard, topic: string): string {
    if (this.isPositiveCard(card)) {
      return '희망을 현실로 만들 수 있습니다. 자신감을 가지세요';
    } else {
      return '두려움을 직면하고 극복하면 성장할 수 있습니다';
    }
  }
}
