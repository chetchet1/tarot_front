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
    const pastCard = this.cards.find(c => c.position.position === 4);
    const futureCard = this.cards.find(c => c.position.position === 6);
    const rootCard = this.cards.find(c => c.position.position === 3);
    const hopeCard = this.cards.find(c => c.position.position === 9);

    // 전체 카드의 에너지 패턴 분석
    const majorCount = this.cards.filter(c => c.arcana === 'major').length;
    const uprightCount = this.cards.filter(c => c.orientation === 'upright').length;
    const reversedCount = this.cards.filter(c => c.orientation === 'reversed').length;
    
    // 슈트별 카운트
    const suitCounts = this.analyzeSuitBalance();
    
    // 주제별로 자연스러운 서사 구성
    if (this.topic === 'love') {
      return this.generateLoveNarrative({
        coreCard, challengeCard, outcomeCard, pastCard, 
        futureCard, rootCard, hopeCard, majorCount, 
        uprightCount, suitCounts
      });
    } else if (this.topic === 'career') {
      return this.generateCareerNarrative({
        coreCard, challengeCard, outcomeCard, pastCard, 
        futureCard, rootCard, hopeCard, majorCount, 
        uprightCount, suitCounts
      });
    } else {
      return this.generateGeneralNarrative({
        coreCard, challengeCard, outcomeCard, pastCard, 
        futureCard, rootCard, hopeCard, majorCount, 
        uprightCount, suitCounts
      });
    }
  }

  private generateLoveNarrative(cards: any): string {
    const { coreCard, challengeCard, outcomeCard, pastCard, futureCard, rootCard, hopeCard, majorCount, uprightCount, suitCounts } = cards;
    
    let narrative = '';
    
    // 시작 - 현재 상황의 핵심을 자연스럽게 표현
    if (coreCard) {
      const loveState = this.describeLoveState(coreCard);
      narrative += loveState;
      
      // 현재 외부 상황과의 관계를 자연스럽게 연결
      if (challengeCard) {
        const relationContext = this.describeLoveContext(coreCard, challengeCard);
        narrative += relationContext;
      }
    }
    
    // 과거와 현재의 연결을 스토리텔링으로
    if (pastCard && rootCard) {
      const pastStory = this.weaveLovePastStory(pastCard, rootCard);
      narrative += `\n\n${pastStory}`;
    }
    
    // 현재의 감정적 풍경을 세밀하게 묘사
    const emotionalLandscape = this.paintLoveEmotionalLandscape(cards);
    if (emotionalLandscape) {
      narrative += `\n\n${emotionalLandscape}`;
    }
    
    // 미래의 흐름을 희망적이면서도 현실적으로
    if (futureCard && outcomeCard) {
      const futureFlow = this.narrateLoveFuture(futureCard, outcomeCard, hopeCard);
      narrative += `\n\n${futureFlow}`;
    }
    
    // 전체적인 메시지를 주제에 맞게 마무리
    const closingMessage = this.createLoveClosingMessage(majorCount, uprightCount, suitCounts);
    narrative += `\n\n${closingMessage}`;
    
    return narrative;
  }

  private generateCareerNarrative(cards: any): string {
    const { coreCard, challengeCard, outcomeCard, pastCard, futureCard, rootCard, hopeCard, majorCount, uprightCount, suitCounts } = cards;
    
    let narrative = '';
    
    // 현재 직업 상황의 핵심을 자연스럽게
    if (coreCard) {
      const careerState = this.describeCareerState(coreCard);
      narrative += careerState;
      
      // 현재 업무 환경과의 관계
      if (challengeCard) {
        const workContext = this.describeCareerContext(coreCard, challengeCard);
        narrative += workContext;
      }
    }
    
    // 경력의 흐름을 스토리로
    if (pastCard && rootCard) {
      const careerStory = this.weaveCareerPastStory(pastCard, rootCard);
      narrative += `\n\n${careerStory}`;
    }
    
    // 현재 업무 환경의 세밀한 묘사
    const workLandscape = this.paintCareerLandscape(cards);
    if (workLandscape) {
      narrative += `\n\n${workLandscape}`;
    }
    
    // 미래 경력 전망
    if (futureCard && outcomeCard) {
      const careerFuture = this.narrateCareerFuture(futureCard, outcomeCard, hopeCard);
      narrative += `\n\n${careerFuture}`;
    }
    
    // 전체적인 커리어 메시지
    const closingMessage = this.createCareerClosingMessage(majorCount, uprightCount, suitCounts);
    narrative += `\n\n${closingMessage}`;
    
    return narrative;
  }

  private generateGeneralNarrative(cards: any): string {
    const { coreCard, challengeCard, outcomeCard, pastCard, futureCard, rootCard, hopeCard, majorCount, uprightCount, suitCounts } = cards;
    
    let narrative = '';
    
    // 현재 상황의 전반적 묘사를 자연스럽게
    if (coreCard) {
      const lifeState = this.describeLifeState(coreCard);
      narrative += lifeState;
      
      // 현재 삶의 도전과의 관계
      if (challengeCard) {
        const lifeContext = this.describeLifeContext(coreCard, challengeCard);
        narrative += lifeContext;
      }
    }
    
    // 삶의 여정을 스토리로
    if (pastCard && rootCard) {
      const lifeStory = this.weaveLifePastStory(pastCard, rootCard);
      narrative += `\n\n${lifeStory}`;
    }
    
    // 현재 삶의 풍경을 세밀하게 묘사
    const lifeLandscape = this.paintLifeLandscape(cards);
    if (lifeLandscape) {
      narrative += `\n\n${lifeLandscape}`;
    }
    
    // 미래의 흐름과 가능성
    if (futureCard && outcomeCard) {
      const lifeFuture = this.narrateLifeFuture(futureCard, outcomeCard, hopeCard);
      narrative += `\n\n${lifeFuture}`;
    }
    
    // 전체적인 삶의 메시지
    const closingMessage = this.createGeneralClosingMessage(majorCount, uprightCount, suitCounts);
    narrative += `\n\n${closingMessage}`;
    
    return narrative;
  }

  // 주제별 감정/상태 해석 헬퍼 메서드
  private getLoveEmotion(card: DrawnCard): string {
    const emotions = {
      upright: {
        major: '깊고 진실한 감정이 움직이고 있으며',
        wands: '열정적인 끌림과 설렘이 가득하며',
        cups: '부드럽고 따뜻한 사랑이 흐르고 있으며',
        swords: '명확한 이해와 소통을 추구하며',
        pentacles: '안정적이고 지속적인 관계를 원하며'
      },
      reversed: {
        major: '감정의 혼란과 변화를 겪고 있으며',
        wands: '열정이 식어가거나 방향을 잃고 있으며',
        cups: '감정적 상처나 불안을 안고 있으며',
        swords: '오해와 갈등의 가능성이 있으며',
        pentacles: '현실적 문제로 인한 거리감이 있으며'
      }
    };
    
    const orientation = card.orientation;
    const type = card.arcana === 'major' ? 'major' : (card.suit || 'wands');
    
    return emotions[orientation][type] || '복잡한 감정이 교차하고 있으며';
  }

  private getCareerState(card: DrawnCard): string {
    const states = {
      upright: {
        major: '커리어의 중요한 전환점에 와 있으며',
        wands: '창의적 에너지와 도전정신이 충만하며',
        cups: '일에서 만족과 성취감을 느끼고 있으며',
        swords: '전략적 사고와 명확한 판단력을 발휘하며',
        pentacles: '실질적 성과와 안정을 구축하고 있으며'
      },
      reversed: {
        major: '직업적 정체성에 대한 고민이 있으며',
        wands: '동기부여가 부족하거나 방향성을 잃고 있으며',
        cups: '일에서 감정적 만족을 얻지 못하고 있으며',
        swords: '판단의 혼란이나 의사결정의 어려움이 있으며',
        pentacles: '물질적 보상이나 안정성이 부족하며'
      }
    };
    
    const orientation = card.orientation;
    const type = card.arcana === 'major' ? 'major' : (card.suit || 'wands');
    
    return states[orientation][type] || '변화의 과정을 겪고 있으며';
  }

  private getGeneralMessage(card: DrawnCard): string {
    const messages = {
      upright: {
        major: '인생의 큰 흐름이 당신과 함께하고 있습니다.',
        wands: '활력과 추진력이 당신을 이끌고 있습니다.',
        cups: '감정의 풍요로움이 당신을 감싸고 있습니다.',
        swords: '명확한 사고가 길을 밝혀주고 있습니다.',
        pentacles: '현실적 기반이 단단해지고 있습니다.'
      },
      reversed: {
        major: '내면의 재정비가 필요한 시기입니다.',
        wands: '에너지의 방향을 다시 설정할 때입니다.',
        cups: '감정의 균형을 찾아가는 과정입니다.',
        swords: '생각을 정리하고 명확히 할 시간입니다.',
        pentacles: '현실적 기반을 다시 점검할 때입니다.'
      }
    };
    
    const orientation = card.orientation;
    const type = card.arcana === 'major' ? 'major' : (card.suit || 'wands');
    
    return messages[orientation][type] || '새로운 가능성이 열리고 있습니다.';
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

  // 새로운 헬퍼 메서드들 - 더 자연스러운 서사를 위해
  private getEmotionalIntensity(card: DrawnCard): string {
    if (card.arcana === 'major') {
      return card.orientation === 'upright' ? '강렬하게' : '복잡하게';
    }
    
    const intensities = {
      wands: { upright: '열정적으로', reversed: '불안정하게' },
      cups: { upright: '깊이', reversed: '혼란스럽게' },
      swords: { upright: '명확하게', reversed: '갈등 속에' },
      pentacles: { upright: '안정적으로', reversed: '불확실하게' }
    };
    
    const suit = card.suit || 'wands';
    return intensities[suit][card.orientation];
  }

  private analyzeLoveRelationDynamic(coreCard: DrawnCard, challengeCard: DrawnCard): string {
    const coreSuit = coreCard.suit || (coreCard.arcana === 'major' ? 'major' : '');
    const challengeSuit = challengeCard.suit || (challengeCard.arcana === 'major' ? 'major' : '');
    
    // 두 카드의 관계를 분석하여 자연스러운 문장 생성
    if (coreCard.orientation === 'upright' && challengeCard.orientation === 'upright') {
      return `그리고 주변 상황도 ${challengeCard.nameKr}의 긍정적인 에너지로 당신을 지지하고 있습니다.`;
    } else if (coreCard.orientation === 'upright' && challengeCard.orientation === 'reversed') {
      return `하지만 ${challengeCard.nameKr}가 나타내듯 외부 환경에는 어려움이 존재합니다.`;
    } else if (coreCard.orientation === 'reversed' && challengeCard.orientation === 'upright') {
      return `반면 ${challengeCard.nameKr}로 보여지는 외부 환경은 당신에게 새로운 가능성을 제시합니다.`;
    } else {
      return `그리고 ${challengeCard.nameKr}로 나타나는 현재 상황 역시 복잡한 감정을 담고 있습니다.`;
    }
  }

  private createPastLoveStory(pastCard: DrawnCard, rootCard: DrawnCard): string {
    const pastEnergy = this.getCardEnergyDescription(pastCard);
    const rootEnergy = this.getCardEnergyDescription(rootCard);
    
    let story = `지금의 감정은 하루아침에 만들어진 것이 아닙니다. `;
    
    if (this.isPositiveCard(pastCard)) {
      story += `과거 ${pastCard.nameKr}의 시기에 경험한 ${pastEnergy}는 당신에게 사랑의 소중함을 가르쳐주었고, `;
    } else {
      story += `과거 ${pastCard.nameKr}가 남긴 ${pastEnergy}의 상처는 아직 완전히 치유되지 않았으며, `;
    }
    
    story += `이 모든 것의 바탕에는 ${rootCard.nameKr}가 상징하는 ${rootEnergy}가 깊이 자리하고 있습니다.`;
    
    return story;
  }

  private describeLoveEmotionalLandscape(cards: any): string {
    const { coreCard, challengeCard, rootCard } = cards;
    const suitCounts = this.analyzeSuitBalance();
    
    let landscape = '';
    
    // 감정적 풍경을 세밀하게 묘사
    if (suitCounts.cups >= 3) {
      landscape += `지금 당신의 마음은 깊은 감정의 바다와 같습니다. 사랑의 물결이 일렁이고 있으며, `;
    } else if (suitCounts.wands >= 3) {
      landscape += `당신의 마음은 지금 열정의 불꽃으로 타오르고 있습니다. 설렘과 기대가 가득하며, `;
    } else if (suitCounts.swords >= 3) {
      landscape += `현재 당신의 마음에는 여러 생각들이 교차하고 있습니다. 명확함을 찾고자 하는 마음과 `;
    } else if (suitCounts.pentacles >= 3) {
      landscape += `당신은 지금 안정적이고 현실적인 사랑을 추구하고 있습니다. 단단한 기반 위에 `;
    }
    
    // 현재 상황의 감정적 뉴앙스 추가
    const selfCard = cards.cards.find((c: DrawnCard) => c.position.position === 7);
    const environmentCard = cards.cards.find((c: DrawnCard) => c.position.position === 8);
    
    if (selfCard && environmentCard) {
      if (selfCard.orientation === environmentCard.orientation) {
        landscape += `당신의 내면과 주변 환경이 조화를 이루고 있어 긍정적입니다.`;
      } else {
        landscape += `내면의 바람과 현실 사이에 약간의 긴장이 존재합니다.`;
      }
    }
    
    return landscape;
  }

  private createLoveFutureFlow(futureCard: DrawnCard, outcomeCard: DrawnCard, hopeCard?: DrawnCard): string {
    let flow = `시간이 흐르면서 당신의 사랑 이야기는 새로운 장으로 접어듭니다. `;
    
    // 가까운 미래
    if (futureCard) {
      const futureEnergy = this.getCardEnergyDescription(futureCard);
      
      if (this.isPositiveCard(futureCard)) {
        flow += `머지않아 ${futureCard.nameKr}의 축복이 찾아올 것입니다. ${futureEnergy}의 시간이 당신을 기다리고 있으며, `;
      } else {
        flow += `${futureCard.nameKr}가 암시하듯, 조금의 시련이 있을 수 있습니다. 하지만 이는 ${futureEnergy}를 통해 더 깊은 사랑으로 나아가는 과정이며, `;
      }
    }
    
    // 희망과 두려움
    if (hopeCard) {
      const hopeEnergy = this.getCardEnergyDescription(hopeCard);
      
      if (this.isPositiveCard(hopeCard)) {
        flow += `당신이 마음 깊이 품고 있는 ${hopeEnergy}에 대한 열망은 `;
      } else {
        flow += `당신이 느끼는 ${hopeEnergy}에 대한 불안은 `;
      }
    }
    
    // 최종 결과
    if (outcomeCard) {
      const outcomeEnergy = this.getCardEnergyDescription(outcomeCard);
      
      if (this.isPositiveCard(outcomeCard)) {
        flow += `결국 ${outcomeCard.nameKr}의 아름다운 결실로 이어질 것입니다. ${outcomeEnergy}의 축복이 당신을 기다리고 있습니다.`;
      } else {
        flow += `${outcomeCard.nameKr}로 나타날 것입니다. 이는 예상과 다를 수 있지만, ${outcomeEnergy}를 통해 진정한 사랑의 의미를 배우게 될 것입니다.`;
      }
    }
    
    return flow;
  }

  private createLoveClosingMessage(majorCount: number, uprightCount: number, suitCounts: Record<string, number>): string {
    let closing = '';
    
    // 전체적인 에너지 패턴 분석
    if (uprightCount >= 7) {
      closing += `타로가 전하는 메시지는 명확합니다. 사랑의 길이 환하게 열려 있으며, 당신의 마음을 믿고 따라가면 행복을 찾을 수 있습니다.`;
    } else if (uprightCount <= 3) {
      closing += `지금은 내면의 성찰과 치유가 필요한 시기입니다. 서두르지 말고 자신의 속도로 사랑을 키워가세요.`;
    } else {
      closing += `빛과 그림자가 공존하듯, 당신의 사랑에도 기쁨과 도전이 함께합니다. 이 모든 과정을 통해 더 깊고 진실한 사랑으로 성장할 것입니다.`;
    }
    
    // 주요 슈트에 따른 특별 메시지
    if (suitCounts.cups >= 4) {
      closing += ` 특히 감정의 물결이 풍부한 지금, 진심을 나누는 것이 가장 중요합니다.`;
    } else if (suitCounts.wands >= 4) {
      closing += ` 열정의 불꽃이 타오르는 시기, 용기를 내어 사랑을 표현하세요.`;
    } else if (suitCounts.swords >= 3) {
      closing += ` 소통과 이해가 필요한 시기입니다. 서로의 마음을 열고 대화하세요.`;
    }
    
    // 메이저 카드가 많을 때의 특별 메시지
    if (majorCount >= 5) {
      closing += `\n\n특별히 주목할 점은, 이 연애가 당신의 인생에서 중요한 의미를 지닌다는 것입니다. 우주가 당신에게 특별한 메시지를 전하고 있으니, 이 인연을 소중히 여기세요.`;
    }
    
    return closing;
  }

  // 직업운 관련 헬퍼 메서드들
  private getCareerIntensity(card: DrawnCard): string {
    if (card.arcana === 'major') {
      return card.orientation === 'upright' ? '중요한 전환점에서' : '도전적인 시기에';
    }
    
    const intensities = {
      wands: { upright: '열정적으로', reversed: '동력을 잃고' },
      cups: { upright: '만족을 느끼며', reversed: '감정적 혼란 속에' },
      swords: { upright: '명확한 판단력으로', reversed: '혼란스러운 생각 속에' },
      pentacles: { upright: '안정적으로', reversed: '불안정한 기반 위에' }
    };
    
    const suit = card.suit || 'wands';
    return intensities[suit][card.orientation];
  }

  private analyzeCareerDynamic(coreCard: DrawnCard, challengeCard: DrawnCard): string {
    if (coreCard.orientation === 'upright' && challengeCard.orientation === 'upright') {
      return `업무 환경 역시 ${challengeCard.nameKr}의 긍정적인 에너지로 당신의 성장을 돕고 있습니다.`;
    } else if (coreCard.orientation === 'upright' && challengeCard.orientation === 'reversed') {
      return `그러나 ${challengeCard.nameKr}가 나타내듯 업무 환경에 어려움이 존재합니다.`;
    } else if (coreCard.orientation === 'reversed' && challengeCard.orientation === 'upright') {
      return `다행히 ${challengeCard.nameKr}로 보여지는 외부 환경은 당신에게 새로운 돌파구를 제시합니다.`;
    } else {
      return `${challengeCard.nameKr}로 나타나는 현재 업무 환경도 복잡한 상황을 보여줍니다.`;
    }
  }

  private createCareerStory(pastCard: DrawnCard, rootCard: DrawnCard): string {
    const pastEnergy = this.getCardEnergyDescription(pastCard);
    const rootEnergy = this.getCardEnergyDescription(rootCard);
    
    let story = `지금의 커리어는 오랫동안 차근차근 쌓아온 결과입니다. `;
    
    if (this.isPositiveCard(pastCard)) {
      story += `과거 ${pastCard.nameKr}의 시기에 얻은 ${pastEnergy}의 경험은 소중한 자산이 되었고, `;
    } else {
      story += `과거 ${pastCard.nameKr}이 주었던 ${pastEnergy}의 시련은 당신을 더 강하게 만들었으며, `;
    }
    
    story += `이 모든 경험의 바탕에는 ${rootCard.nameKr}가 나타내는 ${rootEnergy}가 깊이 뛿리내리고 있습니다.`;
    
    return story;
  }

  private describeCareerLandscape(cards: any): string {
    const suitCounts = this.analyzeSuitBalance();
    let landscape = '';
    
    // 업무 환경의 에너지를 세밀하게 묘사
    if (suitCounts.pentacles >= 3) {
      landscape += `현재 당신의 업무 환경은 안정적이고 실질적인 성과가 강조되고 있습니다. `;
    } else if (suitCounts.wands >= 3) {
      landscape += `지금은 창의적인 에너지가 충만한 시기로, 새로운 프로젝트와 도전이 기다리고 있습니다. `;
    } else if (suitCounts.swords >= 3) {
      landscape += `현재 업무 환경에는 전략적 사고와 명확한 결정이 필요한 상황이 많습니다. `;
    } else if (suitCounts.cups >= 3) {
      landscape += `지금 당신의 업무는 사람과의 관계가 중요하며, 협업과 조화가 강조되고 있습니다. `;
    }
    
    // 자아 인식과 환경의 관계
    const selfCard = cards.cards.find((c: DrawnCard) => c.position.position === 7);
    const environmentCard = cards.cards.find((c: DrawnCard) => c.position.position === 8);
    
    if (selfCard && environmentCard) {
      if (selfCard.orientation === environmentCard.orientation) {
        landscape += `당신의 자기 평가와 주변의 평가가 일치하여 안정적인 성장이 가능합니다.`;
      } else {
        landscape += `자신에 대한 평가와 타인의 시각 사이에 차이가 있으니 균형을 찾아야 합니다.`;
      }
    }
    
    return landscape;
  }

  private createCareerFutureFlow(futureCard: DrawnCard, outcomeCard: DrawnCard, hopeCard?: DrawnCard): string {
    let flow = `당신의 커리어는 이제 새로운 단계로 접어들고 있습니다. `;
    
    // 가까운 미래
    if (futureCard) {
      const futureEnergy = this.getCardEnergyDescription(futureCard);
      
      if (this.isPositiveCard(futureCard)) {
        flow += `곧 ${futureCard.nameKr}의 기회가 찾아올 것입니다. ${futureEnergy}의 시기가 다가오면서 `;
      } else {
        flow += `${futureCard.nameKr}가 암시하는 도전이 있겠지만, 이는 ${futureEnergy}를 통해 더 큰 성장으로 이어지며, `;
      }
    }
    
    // 목표와 포부
    if (hopeCard) {
      const hopeEnergy = this.getCardEnergyDescription(hopeCard);
      
      if (this.isPositiveCard(hopeCard)) {
        flow += `당신이 추구하는 ${hopeEnergy}에 대한 포부는 `;
      } else {
        flow += `당신이 우려하는 ${hopeEnergy}는 `;
      }
    }
    
    // 최종 결과
    if (outcomeCard) {
      const outcomeEnergy = this.getCardEnergyDescription(outcomeCard);
      
      if (this.isPositiveCard(outcomeCard)) {
        flow += `결국 ${outcomeCard.nameKr}의 성공적인 결과로 이어질 것입니다. ${outcomeEnergy}의 성취가 당신을 기다리고 있습니다.`;
      } else {
        flow += `${outcomeCard.nameKr}로 나타날 것입니다. 예상과 다를 수 있지만, ${outcomeEnergy}를 통해 더 큰 지혜와 경험을 얻게 될 것입니다.`;
      }
    }
    
    return flow;
  }

  private createCareerClosingMessage(majorCount: number, uprightCount: number, suitCounts: Record<string, number>): string {
    let closing = '';
    
    // 전체적인 에너지 패턴
    if (uprightCount >= 7) {
      closing += `타로가 전하는 메시지는 밝습니다. 당신의 커리어는 상승 곡선을 그리고 있으며, 노력한 만큼의 보상이 따를 것입니다.`;
    } else if (uprightCount <= 3) {
      closing += `지금은 재충전과 재정비의 시기입니다. 성급하게 행동하지 말고 신중히 계획을 세우세요.`;
    } else {
      closing += `커리어의 여정에는 성공과 도전이 공존합니다. 지금의 경험들이 모두 당신을 더 강하게 만들어줄 것입니다.`;
    }
    
    // 주요 슈트에 따른 특별 메시지
    if (suitCounts.pentacles >= 4) {
      closing += ` 특히 물질적 성과와 안정성이 강조되는 시기, 꾸준한 노력이 결실을 맺을 것입니다.`;
    } else if (suitCounts.wands >= 4) {
      closing += ` 창의적 에너지가 넘치는 시기, 새로운 도전을 두려워하지 마세요.`;
    } else if (suitCounts.swords >= 3) {
      closing += ` 전략적 사고가 필요한 시기입니다. 명확한 목표를 설정하고 진행하세요.`;
    }
    
    // 메이저 카드가 많을 때
    if (majorCount >= 5) {
      closing += `\n\n중요한 점은, 지금이 당신의 커리어에서 중대한 전환점이라는 것입니다. 우주가 당신에게 특별한 기회를 주고 있으니, 이 시기를 잘 활용하세요.`;
    }
    
    return closing;
  }

  // 종합운 관련 헬퍼 메서드들
  private getLifeIntensity(card: DrawnCard): string {
    if (card.arcana === 'major') {
      return card.orientation === 'upright' ? '중요한 시기를 보내며' : '도전적인 과정 속에서';
    }
    
    const intensities = {
      wands: { upright: '활력 넘치게', reversed: '에너지가 분산되어' },
      cups: { upright: '감정적으로 풍요롭게', reversed: '감정적 혼란 속에서' },
      swords: { upright: '명료한 사고로', reversed: '혼란스러운 생각들로' },
      pentacles: { upright: '현실적으로 안정되어', reversed: '물질적 불안 속에서' }
    };
    
    const suit = card.suit || 'wands';
    return intensities[suit][card.orientation];
  }

  private analyzeLifeDynamic(coreCard: DrawnCard, challengeCard: DrawnCard): string {
    if (coreCard.orientation === 'upright' && challengeCard.orientation === 'upright') {
      return `주변 환경도 ${challengeCard.nameKr}의 긍정적인 에너지로 당신을 응원하고 있습니다.`;
    } else if (coreCard.orientation === 'upright' && challengeCard.orientation === 'reversed') {
      return `하지만 ${challengeCard.nameKr}가 보여주듯 외부에는 극복해야 할 장애물이 있습니다.`;
    } else if (coreCard.orientation === 'reversed' && challengeCard.orientation === 'upright') {
      return `그러나 ${challengeCard.nameKr}로 나타나는 외부 환경은 당신에게 희망을 주고 있습니다.`;
    } else {
      return `${challengeCard.nameKr}로 보여지는 현재 상황도 복잡하고 어려운 국면입니다.`;
    }
  }

  private createLifeStory(pastCard: DrawnCard, rootCard: DrawnCard): string {
    const pastEnergy = this.getCardEnergyDescription(pastCard);
    const rootEnergy = this.getCardEnergyDescription(rootCard);
    
    let story = `당신의 현재는 과거와 연결되어 있습니다. `;
    
    if (this.isPositiveCard(pastCard)) {
      story += `과거 ${pastCard.nameKr}의 시절에 경험한 ${pastEnergy}는 소중한 자산이 되어 지금의 당신을 지탱하고 있으며, `;
    } else {
      story += `과거 ${pastCard.nameKr}가 남긴 ${pastEnergy}의 흔적은 여전히 당신에게 영향을 미치고 있으며, `;
    }
    
    story += `이 모든 경험의 근본에는 ${rootCard.nameKr}가 상징하는 ${rootEnergy}가 깊이 자리하고 있습니다.`;
    
    return story;
  }

  private describeLifeLandscape(cards: any): string {
    const suitCounts = this.analyzeSuitBalance();
    let landscape = '';
    
    // 현재 삶의 에너지 풍경
    if (suitCounts.wands >= 3) {
      landscape += `지금 당신의 삶은 열정과 활력으로 충만해 있습니다. 새로운 도전에 대한 용기가 샘쇟고 있으며, `;
    } else if (suitCounts.cups >= 3) {
      landscape += `현재 당신의 삶은 깊은 감정과 인간관계가 중심이 되고 있습니다. 마음의 교류가 중요하며, `;
    } else if (suitCounts.swords >= 3) {
      landscape += `지금은 명확한 판단과 결정이 필요한 시기입니다. 여러 생각들이 교차하고 있으며, `;
    } else if (suitCounts.pentacles >= 3) {
      landscape += `현재 당신의 삶은 현실적인 기반을 다지는 데 집중하고 있습니다. 안정과 성장을 추구하며, `;
    }
    
    // 내면과 외부의 관계
    const selfCard = cards.cards.find((c: DrawnCard) => c.position.position === 7);
    const environmentCard = cards.cards.find((c: DrawnCard) => c.position.position === 8);
    
    if (selfCard && environmentCard) {
      if (selfCard.orientation === environmentCard.orientation) {
        landscape += `당신의 내면과 외부 환경이 조화를 이루고 있어 원활한 흐름이 가능합니다.`;
      } else {
        landscape += `내면의 바람과 외부 현실 사이에 간극이 존재하니 균형을 찾아야 합니다.`;
      }
    }
    
    return landscape;
  }

  private createLifeFutureFlow(futureCard: DrawnCard, outcomeCard: DrawnCard, hopeCard?: DrawnCard): string {
    let flow = `삶의 흐름은 계속됩니다. `;
    
    // 가까운 미래
    if (futureCard) {
      const futureEnergy = this.getCardEnergyDescription(futureCard);
      
      if (this.isPositiveCard(futureCard)) {
        flow += `머지않아 ${futureCard.nameKr}의 축복이 당신을 찾아올 것입니다. ${futureEnergy}의 시기가 다가오면서 `;
      } else {
        flow += `${futureCard.nameKr}가 나타내는 시련이 있겠지만, 이는 ${futureEnergy}를 통해 더 큰 성장으로 연결되며, `;
      }
    }
    
    // 희망과 두려움
    if (hopeCard) {
      const hopeEnergy = this.getCardEnergyDescription(hopeCard);
      
      if (this.isPositiveCard(hopeCard)) {
        flow += `당신이 품고 있는 ${hopeEnergy}에 대한 희망은 `;
      } else {
        flow += `당신이 느끼는 ${hopeEnergy}에 대한 우려는 `;
      }
    }
    
    // 최종 결과
    if (outcomeCard) {
      const outcomeEnergy = this.getCardEnergyDescription(outcomeCard);
      
      if (this.isPositiveCard(outcomeCard)) {
        flow += `결국 ${outcomeCard.nameKr}의 아름다운 결실로 이어질 것입니다. ${outcomeEnergy}의 축복이 당신의 삶을 풍요롭게 할 것입니다.`;
      } else {
        flow += `${outcomeCard.nameKr}로 나타날 것입니다. 예상과 다를 수 있지만, ${outcomeEnergy}를 통해 삶의 깊은 지혜를 얻게 될 것입니다.`;
      }
    }
    
    return flow;
  }

  private createGeneralClosingMessage(majorCount: number, uprightCount: number, suitCounts: Record<string, number>): string {
    let closing = '';
    
    // 전체적인 에너지 패턴
    if (uprightCount >= 7) {
      closing += `타로가 전하는 메시지는 희망적입니다. 삶의 길이 밝게 열려 있으며, 당신이 가진 힘을 믿고 앞으로 나아가세요.`;
    } else if (uprightCount <= 3) {
      closing += `지금은 내면의 성찰과 준비가 필요한 시기입니다. 서두르지 말고 자신의 속도로 차근차근 준비하세요.`;
    } else {
      closing += `삶은 빛과 그림자로 이루어져 있습니다. 지금의 도전들은 모두 당신을 더 강하고 지혜롭게 만들어줄 것입니다.`;
    }
    
    // 주요 슈트에 따른 특별 메시지
    if (suitCounts.wands >= 4) {
      closing += ` 특히 열정과 에너지가 넘치는 시기, 용기를 내어 행동하세요.`;
    } else if (suitCounts.cups >= 4) {
      closing += ` 감정이 풍부한 시기입니다. 마음의 소리를 듣고 따르세요.`;
    } else if (suitCounts.swords >= 3) {
      closing += ` 명확한 판단이 필요한 시기입니다. 지혜롭게 결정하세요.`;
    } else if (suitCounts.pentacles >= 3) {
      closing += ` 현실적인 기반을 다지는 시기입니다. 꾸준히 노력하세요.`;
    }
    
    // 메이저 카드가 많을 때
    if (majorCount >= 5) {
      closing += `\n\n무엇보다 중요한 것은, 지금이 당신의 인생에서 중대한 시기라는 점입니다. 우주가 당신에게 특별한 메시지를 전하고 있으니, 이 순간을 소중히 여기고 현명하게 행동하세요.`;
    }
    
    return closing;
  }

  // 새로운 헬퍼 메서드들 - 카드 이름 대신 상황을 자연스럽게 묘사
  private describeLoveState(card: DrawnCard): string {
    // 연애운 - 현재 마음 상태를 자연스럽게 묘사
    if (card.arcana === 'major') {
      return this.describeLoveMajorState(card);
    } else {
      return this.describeLoveMinorState(card);
    }
  }

  private describeLoveMajorState(card: DrawnCard): string {
    const majorLoveStates: Record<number, { upright: string, reversed: string }> = {
      0: { upright: '지금 당신의 마음은 새로운 사랑에 대한 호기심과 설레임으로 가득합니다. 마치 백지 같은 순수함으로 사랑을 바라보고 있으며, 어디로든 떠날 준비가 되어 있습니다.', reversed: '사랑에 대한 두려움이나 불확실함 때문에 한 발짝을 내딛지 못하고 있습니다. 마음은 원하지만 현실적인 고민이 발목을 잡고 있네요.' },
      1: { upright: '당신은 지금 사랑을 창조하는 마법사와 같습니다. 자신감이 넘치고 매력이 발산되며, 원하는 관계를 만들어갈 모든 도구가 손 안에 있습니다.', reversed: '자신감이 흔들리고 있거나 사랑에서 자신의 진정한 모습을 보여주기 어려워하고 있습니다. 마치 가면을 쓰고 있는 듯한 느낌이 들 수 있습니다.' },
      2: { upright: '깊은 직관과 감수성이 예민해져 상대의 마음을 잘 읽고 있습니다. 조용히 기다리며 사랑이 무르익기를 기다리는 지혜로운 상태입니다.', reversed: '감정이 혼란스럽고 직관을 믿기 어려워하고 있습니다. 또한 자신의 진짜 감정을 감추고 있을 가능성이 있습니다.' },
      3: { upright: '사랑이 풍성하게 피어나고 있습니다. 따뜻한 보살핌과 포용력으로 관계를 키워가며, 편안하고 안정적인 사랑을 누리고 있습니다.', reversed: '사랑에 대한 불안감이나 소홀함을 느끼고 있을 수 있습니다. 관계에서 자신의 역할을 찾기 어려워하거나 정서적 결핍을 느낄 수 있습니다.' },
      4: { upright: '안정적이고 확고한 사랑을 추구합니다. 자신이 원하는 것이 무엇인지 명확히 알고 있으며, 관계에서 주도권을 가지고 있습니다.', reversed: '사랑에서 지나치게 통제하려 하거나 경직된 태도를 보이고 있을 수 있습니다. 유연성이 부족해 관계가 답답해질 수 있습니다.' },
      5: { upright: '전통적인 가치관을 중시하며 진지한 헌신을 추구합니다. 결혼이나 장기적인 약속에 대한 생각이 강해지고 있습니다.', reversed: '기존의 가치관에 의문을 가지거나 전통적인 관계 방식에 회의를 느끼고 있습니다. 자유로운 사랑을 추구할 수 있습니다.' },
      6: { upright: '사랑의 교차로에 서 있습니다. 두 마음이 하나로 합쳐지는 아름다운 순간을 경험하고 있으며, 선택의 시기가 다가오고 있습니다.', reversed: '선택의 어려움이나 가치관의 차이로 고민하고 있습니다. 두 마음 사이에서 방황하거나 관계의 불균형을 경험할 수 있습니다.' },
      7: { upright: '사랑을 향해 전진하는 전사와 같습니다. 목표가 명확하고 어떤 장애물도 극복할 의지가 있으며, 성공적인 관계로 나아가고 있습니다.', reversed: '사랑을 위해 너무 급하게 달려가고 있거나 지나치게 경쟁적이 되고 있을 수 있습니다. 자제력을 기르는 것이 필요합니다.' },
      8: { upright: '내면의 강함과 부드러움이 조화를 이루고 있습니다. 사랑을 다루는 데 있어 성숙함과 인내력을 보여주며, 깊은 유대감을 형성하고 있습니다.', reversed: '감정을 다스리기 어려워하거나 사랑에 대한 두려움이 있을 수 있습니다. 자신감 부족이나 과거의 상처가 영향을 미칠 수 있습니다.' },
      9: { upright: '혼자만의 시간을 통해 자신을 돌아보고 있습니다. 사랑에 대한 깊은 통찰을 얻고 있으며, 내면의 빛이 길을 비추고 있습니다.', reversed: '고독감을 느끼거나 사랑에서 소외감을 경험하고 있을 수 있습니다. 다른 사람과의 연결을 갈망하고 있습니다.' },
      10: { upright: '운명의 바퀴가 돌아가며 새로운 사랑의 싸이클이 시작되고 있습니다. 예상치 못한 만남이나 관계의 전환점을 맞고 있습니다.', reversed: '사랑의 흐름이 정체되어 있거나 같은 패턴이 반복되고 있을 수 있습니다. 변화를 받아들이기 어려워하고 있습니다.' },
      11: { upright: '사랑에서 균형과 공정함을 추구합니다. 서로에게 주고받는 것이 균등하며, 건강한 관계를 유지하고 있습니다.', reversed: '관계에서 불균형이나 불공평함을 느끼고 있을 수 있습니다. 한쪽이 더 많이 희생하거나 양보하고 있을 가능성이 있습니다.' },
      12: { upright: '사랑을 위해 기꺼이 희생하고 있습니다. 다른 관점에서 관계를 바라보며 깊은 통찰을 얻고 있으며, 진정한 사랑의 의미를 깨닫고 있습니다.', reversed: '관계에서 희생만 하고 있거나 보상받지 못한다고 느낄 수 있습니다. 관계에 대한 새로운 시각이 필요합니다.' },
      13: { upright: '한 사랑이 끝나고 새로운 사랑이 시작되는 변화의 시기입니다. 과거를 떠나보내고 새로운 가능성을 맞이할 준비가 되어 있습니다.', reversed: '변화를 두려워하거나 과거에 집착하고 있을 수 있습니다. 끝내야 할 관계를 붙잡고 있거나 새로운 시작을 거부하고 있을 수 있습니다.' },
      14: { upright: '사랑에서 조화와 균형을 찾아가고 있습니다. 서로 다른 두 사람이 하나로 어우러지며, 인내와 이해로 관계가 성숙해지고 있습니다.', reversed: '관계에서 균형을 잃거나 조급함을 보이고 있을 수 있습니다. 서로를 이해하고 수용하는 데 어려움을 겪고 있습니다.' },
      15: { upright: '강렬한 육체적 끌림이나 집착적인 사랑을 경험하고 있습니다. 열정이 넘치지만 건강하지 않은 의존 관계일 수 있습니다.', reversed: '집착이나 속박에서 벗어나려고 하고 있습니다. 불건강한 관계 패턴을 깨닫고 자유를 찾고 있습니다.' },
      16: { upright: '갑작스러운 격변이나 충격적인 사건이 관계를 흔들고 있습니다. 기존의 틀이 깨지면서 새로운 진실이 드러나고 있습니다.', reversed: '변화를 거부하거나 현실을 회피하고 있을 수 있습니다. 관계의 문제를 직면하기 두려워하고 있습니다.' },
      17: { upright: '희망과 영감이 가득한 시기입니다. 사랑에 대한 순수한 믿음을 가지고 있으며, 꿈꾸던 관계가 현실이 될 가능성이 있습니다.', reversed: '사랑에 대한 희망을 잃거나 실망감을 느끼고 있을 수 있습니다. 이상과 현실 사이의 괴리를 경험하고 있습니다.' },
      18: { upright: '감정의 혼란이나 불안감을 경험하고 있습니다. 상대의 진심을 의심하거나 관계에 대한 두려움이 있을 수 있습니다.', reversed: '혼란에서 벗어나 명확성을 찾아가고 있습니다. 환상이 걷히고 진실이 드러나고 있습니다.' },
      19: { upright: '밝고 행복한 사랑이 빛나고 있습니다. 서로를 있는 그대로 받아들이며, 순수하고 기쁜 관계를 누리고 있습니다.', reversed: '관계에서 기쁨을 느끼지 못하거나 서로에게 솔직하지 못하고 있을 수 있습니다. 가면을 벗고 진정한 모습을 보여줄 필요가 있습니다.' },
      20: { upright: '관계의 큰 전환점을 맞이하고 있습니다. 과거를 정리하고 새로운 차원의 사랑으로 나아가는 중요한 시기입니다.', reversed: '과거에 얽매여 있거나 관계의 변화를 받아들이기 어려워하고 있습니다. 용서와 화해가 필요할 수 있습니다.' },
      21: { upright: '사랑이 완성되고 성취되는 시기입니다. 원하던 관계를 이루었으며, 조화롭고 만족스러운 사랑을 경험하고 있습니다.', reversed: '관계에서 뭔가 부족함을 느끼거나 완성되지 못한 느낌이 있을 수 있습니다. 더 나은 관계를 위해 노력이 필요합니다.' }
    };
    
    const state = majorLoveStates[card.number];
    if (state) {
      return state[card.orientation];
    }
    
    return card.orientation === 'upright' 
      ? '지금 당신의 마음은 중요한 변화의 시기를 맞이하고 있습니다.' 
      : '내면의 혼란이나 도전을 겪고 있는 시기입니다.';
  }

  private describeLoveMinorState(card: DrawnCard): string {
    const suitStates = {
      wands: {
        upright: '열정과 설레임이 가득한 시기입니다. 새로운 로맨스의 불꽃이 타오르고 있으며, 적극적으로 사랑을 표현하고 싶어합니다.',
        reversed: '열정이 식어가거나 관계에서 동력을 잃어가고 있습니다. 새로운 자극이나 변화가 필요한 시기일 수 있습니다.'
      },
      cups: {
        upright: '감정이 풍부하고 사랑이 깊어지는 시기입니다. 상대와의 정서적 교감이 활발하며, 따뜻한 마음을 나누고 있습니다.',
        reversed: '감정적으로 불안정하거나 상처받기 쉬운 상태입니다. 과거의 아픔이 현재 관계에 영향을 미칠 수 있습니다.'
      },
      swords: {
        upright: '관계에서 명확한 소통과 이해를 추구합니다. 서로의 생각을 솔직하게 나누며, 오해를 풀어가고 있습니다.',
        reversed: '의사소통의 어려움이나 오해가 있을 수 있습니다. 서로의 마음을 제대로 전달하지 못하고 있을 가능성이 있습니다.'
      },
      pentacles: {
        upright: '안정적이고 현실적인 사랑을 추구합니다. 함께 미래를 계획하고, 실질적인 기반을 다져가고 있습니다.',
        reversed: '물질적인 문제나 현실적인 장애물이 관계에 영향을 미치고 있습니다. 안정감이 부족할 수 있습니다.'
      }
    };
    
    const suit = card.suit || 'wands';
    const state = suitStates[suit];
    
    // 숫자별로 더 구체적인 묘사 추가
    if (card.number === 1) {
      return card.orientation === 'upright'
        ? `새로운 사랑의 씨앗이 뿌려지고 있습니다. ${state.upright}`
        : `사랑을 시작하기 어려운 상황입니다. ${state.reversed}`;
    } else if (card.number >= 2 && card.number <= 4) {
      return card.orientation === 'upright'
        ? `관계가 안정적으로 발전하고 있습니다. ${state.upright}`
        : `관계에서 균형을 찾기 어려워하고 있습니다. ${state.reversed}`;
    } else if (card.number >= 5 && card.number <= 7) {
      return card.orientation === 'upright'
        ? `도전을 극복하며 성장하는 시기입니다. ${state.upright}`
        : `관계에서 어려움을 겪고 있습니다. ${state.reversed}`;
    } else if (card.number >= 8 && card.number <= 10) {
      return card.orientation === 'upright'
        ? `사랑이 성숙하고 결실을 맺어가고 있습니다. ${state.upright}`
        : `관계의 전환점에서 고민하고 있습니다. ${state.reversed}`;
    }
    
    return state[card.orientation];
  }

  private describeLoveContext(coreCard: DrawnCard, challengeCard: DrawnCard): string {
    // 두 카드의 관계를 분석하여 자연스러운 문장 생성
    if (coreCard.orientation === 'upright' && challengeCard.orientation === 'upright') {
      return ' 더욱 기쁜 것은, 주변 상황도 당신의 사랑을 응원하고 있다는 점입니다. 모든 것이 조화를 이루며 관계가 순조롭게 흘러가고 있습니다.';
    } else if (coreCard.orientation === 'upright' && challengeCard.orientation === 'reversed') {
      return ' 하지만 외부 환경은 쉽지만은 않습니다. 주변의 반대나 현실적인 어려움이 있을 수 있지만, 이는 당신의 사랑을 더욱 단단하게 만들 시련일 뿐입니다.';
    } else if (coreCard.orientation === 'reversed' && challengeCard.orientation === 'upright') {
      return ' 그러나 희망적인 것은, 주변 환경이 당신을 도우려 하고 있다는 점입니다. 지금의 어려움을 극복할 수 있는 기회와 지원이 존재합니다.';
    } else {
      return ' 현재 상황도 복잡하고 어려운 국면을 보이고 있습니다. 내면과 외부 모두에서 도전을 받고 있지만, 이는 진정한 사랑을 찾아가는 과정의 일부입니다.';
    }
  }

  private weaveLovePastStory(pastCard: DrawnCard, rootCard: DrawnCard): string {
    let story = '지금의 사랑 이야기는 과거로부터 이어져 왔습니다. ';
    
    // 과거 카드 해석
    if (pastCard.arcana === 'major') {
      if (this.isPositiveCard(pastCard)) {
        story += '과거에 경험한 깊고 의미 있는 사랑이 당신에게 소중한 교훈을 남겼고, ';
      } else {
        story += '과거의 아픈 경험이나 실패한 관계가 아직도 그림자를 드리우고 있으며, ';
      }
    } else {
      const pastSuit = pastCard.suit || 'wands';
      const pastMessages = {
        wands: { upright: '과거의 열정적인 로맨스가', reversed: '과거의 불타올랐다 식어버린 관계가' },
        cups: { upright: '과거의 깊은 감정적 유대가', reversed: '과거의 감정적 상처가' },
        swords: { upright: '과거의 명확했던 관계가', reversed: '과거의 갈등과 오해가' },
        pentacles: { upright: '과거의 안정적이었던 관계가', reversed: '과거의 물질적 어려움이' }
      };
      story += pastMessages[pastSuit][pastCard.orientation] + ' 현재에도 영향을 미치고 있습니다. ';
    }
    
    // 뿌리 카드 해석
    if (rootCard.arcana === 'major') {
      story += '이 모든 것의 근본에는 당신의 운명적인 사랑에 대한 갈망이 자리하고 있습니다.';
    } else {
      const rootSuit = rootCard.suit || 'wands';
      const rootMessages = {
        wands: '열정과 모험을 추구하는 당신의 본성이',
        cups: '깊은 감정적 연결을 원하는 당신의 욕구가',
        swords: '진실하고 명확한 관계를 원하는 당신의 바람이',
        pentacles: '안정적이고 지속적인 관계를 추구하는 당신의 가치관이'
      };
      story += '그리고 ' + rootMessages[rootSuit] + ' 현재 관계의 토대가 되고 있습니다.';
    }
    
    return story;
  }

  private paintLoveEmotionalLandscape(cards: any): string {
    const suitCounts = this.analyzeSuitBalance();
    let landscape = '당신을 둘러싼 사랑의 풍경을 살펴보면, ';
    
    // 감정적 풍경을 생생하게 묘사
    if (suitCounts.cups >= 3) {
      landscape += '감정의 바다가 일렁이고 있습니다. 깊은 사랑의 물결이 당신을 감싸고 있으며, 때로는 벅차오르는 감정에 휩쓸릴 수도 있습니다. ';
    } else if (suitCounts.wands >= 3) {
      landscape += '열정의 불꽃이 활활 타오르고 있습니다. 뜨거운 욕망과 모험에 대한 갈망이 당신을 이끌고 있으며, 새로운 경험을 추구하고 있습니다. ';
    } else if (suitCounts.swords >= 3) {
      landscape += '머리와 가슴 사이에서 고민이 많습니다. 이성적으로 생각하려 하지만 감정이 개입되고, 명확한 답을 찾기 어려운 상황입니다. ';
    } else if (suitCounts.pentacles >= 3) {
      landscape += '현실적이고 안정적인 토대 위에 사랑을 쌓아가고 있습니다. 미래를 함께 계획하고, 실질적인 행복을 추구하고 있습니다. ';
    } else {
      landscape += '다양한 감정과 상황이 복잡하게 얽혀 있습니다. 열정, 감정, 이성, 현실이 모두 어우러진 풍부한 관계를 경험하고 있습니다. ';
    }
    
    // 자아와 환경의 관계 추가
    const selfCard = cards.cards.find((c: DrawnCard) => c.position.position === 7);
    const environmentCard = cards.cards.find((c: DrawnCard) => c.position.position === 8);
    
    if (selfCard && environmentCard) {
      if (selfCard.orientation === environmentCard.orientation) {
        landscape += '당신이 느끼는 것과 주변이 보는 것이 일치하여, 진실된 관계를 만들어가고 있습니다.';
      } else {
        landscape += '내면의 진실과 겉으로 보이는 모습 사이에 차이가 있어, 좀 더 솔직해질 필요가 있을 수 있습니다.';
      }
    }
    
    return landscape;
  }

  private narrateLoveFuture(futureCard: DrawnCard, outcomeCard: DrawnCard, hopeCard?: DrawnCard): string {
    let narrative = '앞으로 펼쳐질 사랑의 이야기를 들려드리겠습니다. ';
    
    // 가까운 미래 묘사
    if (futureCard) {
      if (this.isPositiveCard(futureCard)) {
        if (futureCard.arcana === 'major') {
          narrative += '머지않아 운명적인 전환점이 찾아올 것입니다. 삶을 바꿀 만한 중요한 만남이나 관계의 큰 발전이 예상됩니다. ';
        } else {
          const futureSuit = futureCard.suit || 'wands';
          const futureMessages = {
            wands: '곧 새로운 열정과 로맨스가 당신을 찾아올 것입니다. ',
            cups: '감정적으로 충만한 시기가 다가오고 있습니다. ',
            swords: '관계에서 명확한 결정과 진전이 있을 것입니다. ',
            pentacles: '관계가 더욱 안정적이고 견고해질 것입니다. '
          };
          narrative += futureMessages[futureSuit];
        }
      } else {
        narrative += '일시적인 어려움이나 시련이 있을 수 있지만, 이는 더 강한 사랑으로 거듭나기 위한 과정입니다. ';
      }
    }
    
    // 희망과 두려움 묘사
    if (hopeCard) {
      if (this.isPositiveCard(hopeCard)) {
        narrative += '당신이 마음 깊이 품고 있는 사랑에 대한 꿈은 ';
      } else {
        narrative += '당신이 은연중에 걱정하는 것들은 ';
      }
    }
    
    // 최종 결과 묘사
    if (outcomeCard) {
      if (this.isPositiveCard(outcomeCard)) {
        if (outcomeCard.arcana === 'major') {
          narrative += '결국 큰 성취와 만족으로 이어질 것입니다. 운명이 당신 편이며, 진정한 사랑을 찾게 될 것입니다.';
        } else {
          narrative += '좋은 결실을 맺게 될 것입니다. 노력한 만큼의 행복이 당신을 기다리고 있습니다.';
        }
      } else {
        narrative += '예상과는 다른 결과가 나타날 수 있습니다. 하지만 이것이 끝이 아니라 새로운 시작이 될 수 있으며, 더 나은 사랑을 위한 성장의 기회가 될 것입니다.';
      }
    }
    
    return narrative;
  }

  // 직업운 관련 새로운 헬퍼 메서드들
  private describeCareerState(card: DrawnCard): string {
    if (card.arcana === 'major') {
      return this.describeCareerMajorState(card);
    } else {
      return this.describeCareerMinorState(card);
    }
  }

  private describeCareerMajorState(card: DrawnCard): string {
    const majorCareerStates: Record<number, { upright: string, reversed: string }> = {
      0: { upright: '새로운 커리어의 시작점에 서 있습니다. 무한한 가능성이 열려 있으며, 어떤 방향으로든 나아갈 수 있는 자유가 있습니다.', reversed: '경력에 대한 불확실성과 두려움이 있습니다. 방향을 잃고 헤매고 있거나, 새로운 도전을 주저하고 있을 수 있습니다.' },
      1: { upright: '당신은 지금 자신의 재능을 마음껏 발휘하고 있습니다. 필요한 모든 도구와 능력을 갖추고 있으며, 원하는 성과를 창출할 수 있습니다.', reversed: '능력을 제대로 발휘하지 못하고 있거나, 자신감이 부족한 상황입니다. 가진 재능을 숨기고 있을 수 있습니다.' },
      2: { upright: '직관과 통찰력이 빛을 발하는 시기입니다. 겉으로 드러나지 않는 기회를 포착하고, 때를 기다리는 지혜를 발휘하고 있습니다.', reversed: '직장에서 소통이 원활하지 않거나, 자신의 의견을 제대로 표현하지 못하고 있습니다. 숨겨진 정보가 있을 수 있습니다.' },
      3: { upright: '창의적이고 생산적인 시기를 보내고 있습니다. 프로젝트가 풍성한 결실을 맺고 있으며, 동료들과의 협업도 원활합니다.', reversed: '창의성이 막혀있거나 업무에서 만족감을 느끼지 못하고 있습니다. 성과가 기대에 미치지 못할 수 있습니다.' },
      4: { upright: '리더십을 발휘하며 조직을 이끌어가고 있습니다. 안정적인 기반 위에서 권위를 인정받고 있으며, 목표를 향해 착실히 나아가고 있습니다.', reversed: '권위에 도전받거나 리더십에 의문이 제기되고 있습니다. 지나친 통제나 경직성이 문제가 될 수 있습니다.' },
      5: { upright: '전통적이고 체계적인 방식으로 일하고 있습니다. 멘토의 역할을 하거나 전문 지식을 전수하는 위치에 있을 수 있습니다.', reversed: '기존 시스템에 의문을 품거나 혁신을 추구하고 있습니다. 전통적인 방식에서 벗어나려는 욕구가 있습니다.' },
      6: { upright: '중요한 선택의 기로에 서 있습니다. 여러 제안이나 기회 중에서 결정을 내려야 하며, 가치관에 따른 선택이 필요합니다.', reversed: '결정을 내리기 어려워하거나 잘못된 선택을 했다고 후회하고 있을 수 있습니다. 우유부단함이 문제가 될 수 있습니다.' },
      7: { upright: '목표를 향해 전속력으로 달려가고 있습니다. 경쟁에서 우위를 점하고 있으며, 성공을 향한 추진력이 강합니다.', reversed: '너무 급하게 일을 진행하거나 방향성을 잃고 있을 수 있습니다. 통제력을 잃거나 번아웃 위험이 있습니다.' },
      8: { upright: '어려운 상황을 인내와 끈기로 극복하고 있습니다. 내적 강인함이 외부의 도전을 이겨내고 있으며, 조용한 리더십을 발휘합니다.', reversed: '자신감이 부족하거나 도전에 압도당하고 있을 수 있습니다. 스트레스 관리가 필요한 시기입니다.' },
      9: { upright: '경력을 돌아보고 성찰하는 시기입니다. 전문성을 더욱 깊이 있게 추구하거나, 독립적인 길을 모색하고 있습니다.', reversed: '고립감을 느끼거나 조직에서 소외되고 있을 수 있습니다. 네트워킹이나 협업이 필요한 시기입니다.' },
      10: { upright: '커리어에 큰 변화가 일어나고 있습니다. 새로운 기회가 예상치 못하게 찾아오거나, 업계의 변화에 적응하고 있습니다.', reversed: '경력이 정체되어 있거나 같은 자리에 머물러 있습니다. 변화를 두려워하거나 기회를 놓치고 있을 수 있습니다.' }
    };
    
    // 11-21번 카드는 지면 관계상 생략하고 기본 메시지 사용
    const state = majorCareerStates[card.number];
    if (state) {
      return state[card.orientation];
    }
    
    return card.orientation === 'upright'
      ? '커리어에서 중요한 전환점을 맞이하고 있습니다.'
      : '직업적 도전과 성장의 기회를 경험하고 있습니다.';
  }

  private describeCareerMinorState(card: DrawnCard): string {
    const suitStates = {
      wands: {
        upright: '창의적인 에너지와 열정이 넘치는 시기입니다. 새로운 프로젝트나 아이디어로 가득하며, 도전정신이 빛나고 있습니다.',
        reversed: '업무에 대한 열정이 식어가거나 동기부여가 부족합니다. 번아웃이나 창의성 고갈을 경험할 수 있습니다.'
      },
      cups: {
        upright: '직장에서 좋은 인간관계를 형성하고 있습니다. 일에서 만족감을 느끼며, 동료들과의 협업이 즐겁습니다.',
        reversed: '업무에서 감정적 만족을 얻지 못하고 있습니다. 직장 내 인간관계에 어려움이 있을 수 있습니다.'
      },
      swords: {
        upright: '전략적 사고와 명확한 판단력을 발휘하고 있습니다. 문제 해결 능력이 뛰어나며, 효율적으로 업무를 처리합니다.',
        reversed: '의사결정에 어려움을 겪거나 판단력이 흐려져 있습니다. 과도한 스트레스나 정신적 피로를 경험할 수 있습니다.'
      },
      pentacles: {
        upright: '안정적인 수입과 실질적인 성과를 거두고 있습니다. 꾸준한 노력이 결실을 맺으며, 경제적 안정을 누리고 있습니다.',
        reversed: '재정적 어려움이나 직업적 불안정을 경험하고 있습니다. 노력에 비해 보상이 부족할 수 있습니다.'
      }
    };
    
    const suit = card.suit || 'wands';
    return suitStates[suit][card.orientation];
  }

  private describeCareerContext(coreCard: DrawnCard, challengeCard: DrawnCard): string {
    if (coreCard.orientation === 'upright' && challengeCard.orientation === 'upright') {
      return ' 더욱 고무적인 것은, 업무 환경도 당신에게 호의적이라는 점입니다. 조직과 동료들이 당신의 성장을 지원하고 있습니다.';
    } else if (coreCard.orientation === 'upright' && challengeCard.orientation === 'reversed') {
      return ' 그러나 외부 환경은 녹록지 않습니다. 조직의 변화나 업계의 어려움이 있을 수 있지만, 이는 당신을 더욱 강하게 만들 것입니다.';
    } else if (coreCard.orientation === 'reversed' && challengeCard.orientation === 'upright') {
      return ' 다행히 주변 환경은 당신을 도우려 하고 있습니다. 좋은 기회들이 있으니 자신감을 회복하고 도전해보세요.';
    } else {
      return ' 업무 환경도 복잡하고 어려운 상황입니다. 내외부적으로 도전을 받고 있지만, 이는 더 큰 성장을 위한 과정입니다.';
    }
  }

  private weaveCareerPastStory(pastCard: DrawnCard, rootCard: DrawnCard): string {
    let story = '지금의 커리어는 과거의 경험 위에 쌓아올려진 것입니다. ';
    
    if (this.isPositiveCard(pastCard)) {
      story += '과거의 성공과 성취가 든든한 자산이 되어 현재를 뒷받침하고 있으며, ';
    } else {
      story += '과거의 실패나 어려움이 오히려 값진 교훈이 되어 더 현명한 선택을 하게 만들고 있으며, ';
    }
    
    if (rootCard.arcana === 'major') {
      story += '이 모든 여정의 바탕에는 당신의 소명과 운명적인 길이 깔려 있습니다.';
    } else {
      const rootSuit = rootCard.suit || 'wands';
      const rootMessages = {
        wands: '창의성과 열정을 추구하는 당신의 본성이',
        cups: '사람들과의 관계를 중시하는 당신의 가치관이',
        swords: '논리와 전략을 중시하는 당신의 사고방식이',
        pentacles: '실질적 성과를 추구하는 당신의 철학이'
      };
      story += rootMessages[rootSuit] + ' 커리어의 근간을 이루고 있습니다.';
    }
    
    return story;
  }

  private paintCareerLandscape(cards: any): string {
    const suitCounts = this.analyzeSuitBalance();
    let landscape = '현재 당신의 업무 환경을 살펴보면, ';
    
    if (suitCounts.pentacles >= 3) {
      landscape += '실질적인 성과와 안정성이 강조되는 시기입니다. 꾸준한 노력이 가시적인 결과로 나타나고 있으며, 경제적 보상도 따르고 있습니다. ';
    } else if (suitCounts.wands >= 3) {
      landscape += '창의적인 프로젝트와 새로운 도전으로 가득합니다. 혁신적인 아이디어가 샘솟고 있으며, 열정적인 업무 분위기가 조성되어 있습니다. ';
    } else if (suitCounts.swords >= 3) {
      landscape += '전략과 분석이 중요한 시기입니다. 복잡한 문제를 해결해야 하며, 명확한 의사결정이 요구되고 있습니다. ';
    } else if (suitCounts.cups >= 3) {
      landscape += '팀워크와 협업이 중요한 시기입니다. 동료들과의 관계가 업무 성과에 큰 영향을 미치고 있습니다. ';
    } else {
      landscape += '다양한 요소들이 복합적으로 작용하고 있습니다. 창의성, 전략, 인간관계, 실행력이 모두 필요한 종합적인 상황입니다. ';
    }
    
    return landscape;
  }

  private narrateCareerFuture(futureCard: DrawnCard, outcomeCard: DrawnCard, hopeCard?: DrawnCard): string {
    let narrative = '앞으로의 커리어 전망을 말씀드리면, ';
    
    if (futureCard && this.isPositiveCard(futureCard)) {
      narrative += '머지않아 좋은 기회가 찾아올 것입니다. 승진, 이직, 새로운 프로젝트 등 발전의 계기가 마련될 것이며, ';
    } else if (futureCard) {
      narrative += '일시적인 도전이나 변화가 있을 것입니다. 하지만 이는 더 나은 미래를 위한 필수적인 과정이며, ';
    }
    
    if (hopeCard && this.isPositiveCard(hopeCard)) {
      narrative += '당신이 꿈꾸는 커리어 목표는 ';
    } else if (hopeCard) {
      narrative += '당신이 우려하는 상황은 ';
    }
    
    if (outcomeCard && this.isPositiveCard(outcomeCard)) {
      narrative += '결국 성공적으로 달성될 것입니다. 노력한 만큼의 성과와 인정을 받게 될 것입니다.';
    } else if (outcomeCard) {
      narrative += '예상과 다를 수 있지만, 이는 더 나은 방향으로의 전환점이 될 것입니다. 새로운 가능성을 열어두세요.';
    }
    
    return narrative;
  }

  // 종합운 관련 새로운 헬퍼 메서드들
  private describeLifeState(card: DrawnCard): string {
    if (card.arcana === 'major') {
      const majorMessages = {
        upright: '인생의 중요한 전환점에 서 있습니다. 우주의 큰 흐름이 당신과 함께하고 있으며, 의미 있는 변화가 일어나고 있습니다.',
        reversed: '내면의 혼란이나 외부의 도전을 겪고 있습니다. 하지만 이는 더 큰 성장을 위한 필수적인 과정입니다.'
      };
      return majorMessages[card.orientation];
    } else {
      const suitMessages = {
        wands: { upright: '활력과 열정이 넘치는 시기를 보내고 있습니다. 새로운 시작과 도전이 당신을 기다리고 있습니다.', reversed: '에너지가 분산되거나 방향을 잃고 있을 수 있습니다. 집중력을 회복할 필요가 있습니다.' },
        cups: { upright: '감정적으로 풍요로운 시기입니다. 주변 사람들과의 관계가 당신에게 큰 의미를 주고 있습니다.', reversed: '감정적으로 불안정하거나 관계에서 어려움을 겪고 있을 수 있습니다.' },
        swords: { upright: '명확한 사고와 판단력이 빛을 발하는 시기입니다. 문제를 해결하고 진실을 찾아가고 있습니다.', reversed: '혼란스러운 생각들로 인해 결정을 내리기 어려운 상황일 수 있습니다.' },
        pentacles: { upright: '현실적인 기반을 다지는 시기입니다. 물질적 안정과 실질적인 성과를 추구하고 있습니다.', reversed: '물질적 어려움이나 현실적 장애물을 마주하고 있을 수 있습니다.' }
      };
      const suit = card.suit || 'wands';
      return suitMessages[suit][card.orientation];
    }
  }

  private describeLifeContext(coreCard: DrawnCard, challengeCard: DrawnCard): string {
    if (coreCard.orientation === 'upright' && challengeCard.orientation === 'upright') {
      return ' 주변 환경도 당신을 지지하고 있어, 원하는 방향으로 나아가기에 좋은 시기입니다.';
    } else if (coreCard.orientation === 'upright' && challengeCard.orientation === 'reversed') {
      return ' 하지만 외부 환경은 도전적입니다. 장애물이 있지만 이를 극복하면 더 큰 성장이 있을 것입니다.';
    } else if (coreCard.orientation === 'reversed' && challengeCard.orientation === 'upright') {
      return ' 그러나 주변에는 도움의 손길이 있습니다. 지원을 받아들이고 함께 나아가세요.';
    } else {
      return ' 상황이 복잡하고 어려운 국면입니다. 하지만 어둠이 깊을수록 새벽이 가까워집니다.';
    }
  }

  private weaveLifePastStory(pastCard: DrawnCard, rootCard: DrawnCard): string {
    let story = '현재의 삶은 과거의 여정에서 이어진 것입니다. ';
    
    if (this.isPositiveCard(pastCard)) {
      story += '과거의 긍정적인 경험과 성취가 현재의 든든한 토대가 되고 있으며, ';
    } else {
      story += '과거의 시련과 도전이 오늘의 지혜와 강인함을 만들어냈으며, ';
    }
    
    story += '이 모든 것의 근원에는 ';
    if (rootCard.arcana === 'major') {
      story += '당신의 삶을 관통하는 큰 주제와 운명이 자리하고 있습니다.';
    } else {
      story += '당신이 추구하는 핵심 가치와 신념이 깊이 뿌리내리고 있습니다.';
    }
    
    return story;
  }

  private paintLifeLandscape(cards: any): string {
    const suitCounts = this.analyzeSuitBalance();
    let landscape = '현재 당신의 삶의 풍경을 보면, ';
    
    const dominantSuit = Object.keys(suitCounts).reduce((a, b) => 
      suitCounts[a] > suitCounts[b] ? a : b
    );
    
    if (dominantSuit === 'wands' && suitCounts.wands >= 3) {
      landscape += '열정과 모험의 에너지가 가득합니다. 새로운 도전을 두려워하지 않으며, 삶의 활력이 넘치고 있습니다.';
    } else if (dominantSuit === 'cups' && suitCounts.cups >= 3) {
      landscape += '감정과 인간관계가 중심이 되고 있습니다. 사랑하는 사람들과의 연결이 삶의 의미를 더해주고 있습니다.';
    } else if (dominantSuit === 'swords' && suitCounts.swords >= 3) {
      landscape += '많은 고민과 결정의 순간들이 있습니다. 진실을 추구하며 명확한 방향을 찾아가고 있습니다.';
    } else if (dominantSuit === 'pentacles' && suitCounts.pentacles >= 3) {
      landscape += '실질적인 성과와 안정을 추구하고 있습니다. 현실적인 목표를 향해 착실히 나아가고 있습니다.';
    } else {
      landscape += '다양한 영역에서 균형잡힌 성장을 이루고 있습니다. 삶의 여러 측면이 조화롭게 발전하고 있습니다.';
    }
    
    return landscape;
  }

  private narrateLifeFuture(futureCard: DrawnCard, outcomeCard: DrawnCard, hopeCard?: DrawnCard): string {
    let narrative = '앞으로의 삶은 ';
    
    if (futureCard && this.isPositiveCard(futureCard)) {
      narrative += '밝은 가능성으로 가득합니다. 새로운 기회와 축복이 당신을 기다리고 있으며, ';
    } else if (futureCard) {
      narrative += '몇 가지 도전이 있을 것입니다. 하지만 이는 당신을 더욱 성장시킬 소중한 경험이 될 것이며, ';
    }
    
    if (outcomeCard && this.isPositiveCard(outcomeCard)) {
      narrative += '결국 당신이 원하는 곳에 도달하게 될 것입니다. 인내와 노력이 아름다운 결실을 맺을 것입니다.';
    } else if (outcomeCard) {
      narrative += '예상과는 다른 곳에 도착할 수도 있습니다. 하지만 그곳이 진정으로 당신이 있어야 할 곳일지도 모릅니다.';
    }
    
    return narrative;
  }

  // Court 카드 특별 해석 메서드
  private describeCourtCardState(card: DrawnCard, topic: string): string {
    if (card.arcana !== 'minor' || !card.nameKr.includes('King') && 
        !card.nameKr.includes('Queen') && !card.nameKr.includes('Knight') && 
        !card.nameKr.includes('Page')) {
      return '';
    }
    
    const courtType = this.getCourtType(card.nameKr);
    const suit = card.suit || 'wands';
    
    const courtDescriptions = {
      love: {
        King: {
          wands: { upright: '열정적이고 주도적인 파트너의 모습', reversed: '지배적이거나 이기적인 태도' },
          cups: { upright: '감정적으로 성숙하고 배려심 깊은 사람', reversed: '감정적으로 불안정하거나 변덕스러운 면' },
          swords: { upright: '명확하고 공정한 의사소통을 하는 사람', reversed: '비판적이거나 차가운 태도' },
          pentacles: { upright: '안정적이고 책임감 있는 파트너', reversed: '물질적인 것에만 집착하는 면' }
        },
        Queen: {
          wands: { upright: '열정적이고 독립적인 사랑의 에너지', reversed: '질투심이나 소유욕이 강한 면' },
          cups: { upright: '직관적이고 감성적인 사랑의 접근', reversed: '감정적으로 의존적이거나 불안정한 면' },
          swords: { upright: '명확한 기준과 독립성을 가진 사람', reversed: '비판적이거나 감정을 숨기는 면' },
          pentacles: { upright: '현실적이고 안정적인 관계 추구', reversed: '물질적 안정에만 치중하는 면' }
        },
        Knight: {
          wands: { upright: '로맨틱하고 모험적인 구애', reversed: '충동적이고 무책임한 행동' },
          cups: { upright: '로맨틱하고 감성적인 접근', reversed: '비현실적인 기대나 환상' },
          swords: { upright: '직접적이고 솔직한 의사표현', reversed: '공격적이거나 무례한 태도' },
          pentacles: { upright: '신중하고 헌신적인 접근', reversed: '지나치게 조심스럽거나 소극적인 면' }
        },
        Page: {
          wands: { upright: '새로운 열정과 설렘의 시작', reversed: '미성숙하거나 변덕스러운 감정' },
          cups: { upright: '순수하고 진실한 감정의 표현', reversed: '감정적으로 미성숙하거나 의존적' },
          swords: { upright: '호기심과 새로운 관점', reversed: '의심이나 불신의 마음' },
          pentacles: { upright: '실질적인 노력과 헌신', reversed: '현실감각이 부족하거나 게으른 면' }
        }
      },
      career: {
        King: {
          wands: { upright: '카리스마 있는 리더나 창업가', reversed: '독재적이거나 충동적인 상사' },
          cups: { upright: '공감능력이 뛰어난 관리자', reversed: '감정적으로 불안정한 리더' },
          swords: { upright: '전략적이고 공정한 의사결정자', reversed: '냉정하거나 비인간적인 관리 스타일' },
          pentacles: { upright: '실무능력이 뛰어난 성공한 전문가', reversed: '물질적 성공에만 집착하는 사람' }
        },
        Queen: {
          wands: { upright: '창의적이고 영감을 주는 멘토', reversed: '경쟁심이 강하거나 질투심 많은 동료' },
          cups: { upright: '팀의 감정적 지원자나 상담자', reversed: '감정적으로 조작하는 사람' },
          swords: { upright: '명확한 커뮤니케이션과 조직력', reversed: '비판적이거나 까다로운 상사' },
          pentacles: { upright: '실무에 강하고 신뢰할 수 있는 전문가', reversed: '융통성이 없거나 변화를 거부하는 사람' }
        },
        Knight: {
          wands: { upright: '열정적인 프로젝트 추진자', reversed: '성급하고 무계획적인 접근' },
          cups: { upright: '팀워크와 협업을 중시하는 사람', reversed: '감정에 치우쳐 업무 판단을 그르침' },
          swords: { upright: '빠른 실행력과 문제해결 능력', reversed: '공격적이거나 무모한 접근' },
          pentacles: { upright: '꾸준하고 신뢰할 수 있는 일꾼', reversed: '완벽주의나 지나친 신중함' }
        },
        Page: {
          wands: { upright: '새로운 아이디어와 열정', reversed: '경험 부족이나 산만함' },
          cups: { upright: '창의적이고 직관적인 접근', reversed: '비현실적이거나 나태한 태도' },
          swords: { upright: '학습 욕구와 새로운 관점', reversed: '경험 부족으로 인한 실수' },
          pentacles: { upright: '실무를 배우려는 의지', reversed: '동기부여 부족이나 게으름' }
        }
      },
      general: {
        King: {
          wands: { upright: '리더십과 비전을 가진 영향력', reversed: '독선적이거나 폭력적인 에너지' },
          cups: { upright: '감정적 성숙과 지혜', reversed: '감정 조절의 어려움' },
          swords: { upright: '명확한 판단력과 권위', reversed: '독재적이거나 냉혹한 면' },
          pentacles: { upright: '물질적 성공과 안정', reversed: '탐욕이나 고집' }
        },
        Queen: {
          wands: { upright: '창조적 에너지와 독립성', reversed: '질투나 복수심' },
          cups: { upright: '직관과 감성의 힘', reversed: '감정적 조작이나 의존' },
          swords: { upright: '명확한 사고와 독립성', reversed: '냉담함이나 잔인함' },
          pentacles: { upright: '실용적 지혜와 풍요', reversed: '물질주의나 인색함' }
        },
        Knight: {
          wands: { upright: '모험과 도전 정신', reversed: '무모함이나 폭력성' },
          cups: { upright: '감정적 추구와 이상', reversed: '환상이나 도피' },
          swords: { upright: '신속한 행동과 용기', reversed: '공격성이나 파괴성' },
          pentacles: { upright: '꾸준한 진보와 신뢰', reversed: '정체나 고집' }
        },
        Page: {
          wands: { upright: '새로운 시작과 열정', reversed: '미성숙이나 무책임' },
          cups: { upright: '감정적 개방성과 창의성', reversed: '감정적 미성숙' },
          swords: { upright: '호기심과 학습', reversed: '험담이나 속임수' },
          pentacles: { upright: '실용적 학습과 기회', reversed: '게으름이나 낭비' }
        }
      }
    };
    
    const description = courtDescriptions[topic]?.[courtType]?.[suit]?.[card.orientation];
    if (description) {
      return `이는 ${description}을 나타냅니다.`;
    }
    
    return '';
  }
  
  private getCourtType(nameKr: string): string {
    if (nameKr.includes('King')) return 'King';
    if (nameKr.includes('Queen')) return 'Queen';
    if (nameKr.includes('Knight')) return 'Knight';
    if (nameKr.includes('Page')) return 'Page';
    return '';
  }

  // 특정 카드 조합 해석
  private analyzeCardCombinations(cards: DrawnCard[]): string {
    let combinationMessage = '';
    
    // 메이저 카드가 연속으로 나타나는 경우
    const majorSequence = this.findMajorSequence(cards);
    if (majorSequence.length >= 3) {
      combinationMessage += '특히 주목할 점은, 여러 메이저 카드가 연속으로 나타나 인생의 중대한 전환기를 암시하고 있다는 것입니다. ';
    }
    
    // 같은 숫자가 반복되는 경우
    const repeatingNumbers = this.findRepeatingNumbers(cards);
    if (repeatingNumbers.length > 0) {
      const numberMeanings: Record<number, string> = {
        1: '새로운 시작의 에너지가 강하게 작용하고 있습니다',
        2: '균형과 선택의 테마가 반복되고 있습니다',
        3: '성장과 창조의 힘이 강조되고 있습니다',
        4: '안정과 기초를 다지는 것이 중요합니다',
        5: '변화와 도전이 핵심 주제입니다',
        6: '조화와 책임감이 요구되고 있습니다',
        7: '내면의 성찰과 영적 성장이 필요합니다',
        8: '힘과 성취의 에너지가 강합니다',
        9: '완성과 지혜의 단계에 있습니다',
        10: '한 사이클의 완성과 새로운 시작이 동시에 일어납니다'
      };
      
      repeatingNumbers.forEach(num => {
        if (numberMeanings[num]) {
          combinationMessage += `${num}번이 반복되어 나타나며, ${numberMeanings[num]}. `;
        }
      });
    }
    
    // 모든 카드가 정방향 또는 역방향인 경우
    const allUpright = cards.every(c => c.orientation === 'upright');
    const allReversed = cards.every(c => c.orientation === 'reversed');
    
    if (allUpright) {
      combinationMessage += '모든 카드가 정방향으로 나타나 매우 긍정적이고 순조로운 흐름을 보여줍니다. ';
    } else if (allReversed) {
      combinationMessage += '모든 카드가 역방향으로 나타나 내면의 성찰과 재정비가 필요한 시기임을 강하게 암시합니다. ';
    }
    
    return combinationMessage;
  }
  
  private findMajorSequence(cards: DrawnCard[]): DrawnCard[] {
    const majors = cards.filter(c => c.arcana === 'major').sort((a, b) => a.position.position - b.position.position);
    const sequences: DrawnCard[][] = [];
    let currentSequence: DrawnCard[] = [];
    
    majors.forEach((card, index) => {
      if (index === 0 || card.position.position === majors[index - 1].position.position + 1) {
        currentSequence.push(card);
      } else {
        if (currentSequence.length >= 2) {
          sequences.push(currentSequence);
        }
        currentSequence = [card];
      }
    });
    
    if (currentSequence.length >= 2) {
      sequences.push(currentSequence);
    }
    
    return sequences.sort((a, b) => b.length - a.length)[0] || [];
  }
  
  private findRepeatingNumbers(cards: DrawnCard[]): number[] {
    const numberCounts: Record<number, number> = {};
    
    cards.forEach(card => {
      if (card.number >= 1 && card.number <= 10) {
        numberCounts[card.number] = (numberCounts[card.number] || 0) + 1;
      }
    });
    
    return Object.entries(numberCounts)
      .filter(([_, count]) => count >= 2)
      .map(([number]) => parseInt(number));
  }

  // 카드 간의 원소 균형 분석
  private analyzeElementalBalance(): string {
    const suitCounts = this.analyzeSuitBalance();
    const elements = {
      wands: '불(열정과 행동)',
      cups: '물(감정과 직관)',
      swords: '공기(사고와 소통)',
      pentacles: '흙(물질과 실현)'
    };
    
    let balanceMessage = '';
    const dominantSuits = Object.entries(suitCounts)
      .filter(([suit, count]) => suit !== 'major' && count >= 3)
      .map(([suit]) => suit);
    
    if (dominantSuits.length === 1) {
      const suit = dominantSuits[0];
      balanceMessage = `${elements[suit]}의 원소가 강하게 작용하고 있어, 이 에너지를 잘 활용하는 것이 중요합니다.`;
    } else if (dominantSuits.length > 1) {
      const elementNames = dominantSuits.map(s => elements[s]).join('과 ');
      balanceMessage = `${elementNames}의 원소가 함께 작용하고 있어, 균형을 잘 맞추는 것이 중요합니다.`;
    } else if (suitCounts.major >= 5) {
      balanceMessage = '운명적인 힘이 강하게 작용하는 시기로, 큰 그림을 보고 행동하는 것이 중요합니다.';
    } else {
      balanceMessage = '네 가지 원소가 균형 있게 나타나고 있어, 조화로운 접근이 가능합니다.';
    }
    
    return balanceMessage;
  }

  // 시간적 흐름 분석
  private analyzeTemporalFlow(): string {
    const pastCard = this.cards.find(c => c.position.position === 4);
    const presentCard = this.cards.find(c => c.position.position === 1);
    const futureCard = this.cards.find(c => c.position.position === 6);
    const outcomeCard = this.cards.find(c => c.position.position === 10);
    
    let flowMessage = '';
    
    // 과거에서 현재로의 흐름
    if (pastCard && presentCard) {
      if (!this.isPositiveCard(pastCard) && this.isPositiveCard(presentCard)) {
        flowMessage += '과거의 어려움을 극복하고 현재는 긍정적인 상태로 발전했습니다. ';
      } else if (this.isPositiveCard(pastCard) && !this.isPositiveCard(presentCard)) {
        flowMessage += '과거의 좋았던 시기를 지나 현재는 새로운 도전에 직면해 있습니다. ';
      }
    }
    
    // 현재에서 미래로의 흐름
    if (presentCard && futureCard && outcomeCard) {
      const positivePresent = this.isPositiveCard(presentCard);
      const positiveFuture = this.isPositiveCard(futureCard);
      const positiveOutcome = this.isPositiveCard(outcomeCard);
      
      if (!positivePresent && positiveFuture && positiveOutcome) {
        flowMessage += '현재의 어려움은 일시적이며, 곧 상황이 호전될 것입니다. ';
      } else if (positivePresent && !positiveFuture && positiveOutcome) {
        flowMessage += '일시적인 어려움이 있겠지만, 최종적으로는 좋은 결과를 얻게 될 것입니다. ';
      } else if (positivePresent && positiveFuture && positiveOutcome) {
        flowMessage += '현재의 긍정적인 흐름이 계속 이어져 훌륭한 결과를 만들어낼 것입니다. ';
      }
    }
    
    return flowMessage;
  }
}
