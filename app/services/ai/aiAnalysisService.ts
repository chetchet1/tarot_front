import { DrawnCard, Topic } from '../../models/tarot';

export interface CelticCrossAIAnalysis {
  overallTheme: string;
  keyMessages: string[];
  detailedPositionAnalysis: {
    position: number;
    title: string;
    deepMeaning: string;
    hiddenInfluences: string[];
    psychologicalInsight: string;
    spiritualGuidance: string;
  }[];
  relationshipDynamics: {
    innerOuter: string;
    pastPresentFuture: string;
    consciousUnconscious: string;
    challengesOpportunities: string;
  };
  energyFlow: {
    blockages: string[];
    strengths: string[];
    recommendations: string[];
  };
  transformationPath: {
    currentState: string;
    nextSteps: string[];
    ultimatePotential: string;
  };
  synchronicities: string[];
  ritualSuggestions: string[];
  crystalRecommendations: string[];
  affirmationSuggestions: string[];
}

export class AIAnalysisService {
  /**
   * 켈틱 크로스 전용 심층 AI 분석
   */
  static async generateCelticCrossAnalysis(
    cards: DrawnCard[],
    topic: Topic,
    question?: string
  ): Promise<CelticCrossAIAnalysis> {
    // 각 포지션별 심층 분석
    const positions = [
      { idx: 0, name: '현재내면', title: '당신의 내면 상태' },
      { idx: 1, name: '현재외부', title: '외부 환경과 영향' },
      { idx: 2, name: '근본', title: '상황의 뿌리' },
      { idx: 3, name: '과거', title: '과거의 영향' },
      { idx: 4, name: '드러나는 모습', title: '의식적 표현' },
      { idx: 5, name: '미래', title: '다가올 가능성' },
      { idx: 6, name: '내가보는나', title: '자아 인식' },
      { idx: 7, name: '남이보는나', title: '외부의 시선' },
      { idx: 8, name: '예상하는 결과', title: '희망과 두려움' },
      { idx: 9, name: '실제 결과', title: '최종 결과' }
    ];

    const detailedPositionAnalysis = positions.map((pos) => {
      const card = cards[pos.idx];
      return {
        position: pos.idx + 1,
        title: pos.title,
        deepMeaning: this.generateDeepMeaning(card, pos.name, topic),
        hiddenInfluences: this.extractHiddenInfluences(card, pos.idx, cards),
        psychologicalInsight: this.generatePsychologicalInsight(card, pos.name),
        spiritualGuidance: this.generateSpiritualGuidance(card, pos.name)
      };
    });

    // 전체 주제 분석
    const overallTheme = this.analyzeOverallTheme(cards, topic, question);
    
    // 핵심 메시지 추출
    const keyMessages = this.extractKeyMessages(cards, detailedPositionAnalysis);
    
    // 관계 역학 분석
    const relationshipDynamics = this.analyzeRelationshipDynamics(cards);
    
    // 에너지 흐름 분석
    const energyFlow = this.analyzeEnergyFlow(cards);
    
    // 변화의 경로
    const transformationPath = this.analyzeTransformationPath(cards);
    
    // 동시성과 의미있는 연결
    const synchronicities = this.findSynchronicities(cards);
    
    // 의식 제안
    const ritualSuggestions = this.generateRitualSuggestions(cards, topic);
    
    // 크리스탈 추천
    const crystalRecommendations = this.recommendCrystals(cards, topic);
    
    // 확언 제안
    const affirmationSuggestions = this.generateAffirmations(cards, topic);

    return {
      overallTheme,
      keyMessages,
      detailedPositionAnalysis,
      relationshipDynamics,
      energyFlow,
      transformationPath,
      synchronicities,
      ritualSuggestions,
      crystalRecommendations,
      affirmationSuggestions
    };
  }

  private static generateDeepMeaning(card: DrawnCard, position: string, topic: Topic): string {
    const meanings = {
      '현재내면': {
        upright: `${card.nameKr}가 당신의 내면에서 말하는 것은 깊은 ${card.keywords.upright[0]}의 에너지입니다. 이는 당신이 현재 경험하고 있는 내적 여정의 핵심을 나타냅니다.`,
        reversed: `역방향의 ${card.nameKr}는 당신이 내면에서 ${card.keywords.reversed[0]}와 씨름하고 있음을 보여줍니다. 이는 성장을 위한 중요한 단계입니다.`
      },
      '현재외부': {
        upright: `외부 환경에서 ${card.nameKr}의 에너지는 ${card.keywords.upright[1] || card.keywords.upright[0]}를 통해 나타납니다. 주변 상황이 당신에게 보내는 메시지에 주목하세요.`,
        reversed: `외부에서 오는 ${card.keywords.reversed[1] || card.keywords.reversed[0]}의 도전은 당신이 더 강해질 기회를 제공합니다.`
      },
      '근본': {
        upright: `이 상황의 근본에는 ${card.nameKr}가 상징하는 ${card.keywords.upright[2] || card.keywords.upright[0]}가 자리잡고 있습니다. 이는 모든 것의 시작점입니다.`,
        reversed: `뿌리 깊은 ${card.keywords.reversed[2] || card.keywords.reversed[0]}의 패턴이 현재 상황을 만들어냈습니다. 이를 인식하는 것이 변화의 첫걸음입니다.`
      },
      '과거': {
        upright: `과거의 ${card.nameKr} 경험은 당신에게 ${card.keywords.upright[0]}의 지혜를 남겼습니다. 이 교훈은 현재에도 유효합니다.`,
        reversed: `과거의 ${card.keywords.reversed[0]} 경험이 아직도 영향을 미치고 있습니다. 이제는 이를 놓아줄 때입니다.`
      },
      '드러나는 모습': {
        upright: `당신이 세상에 보여주는 ${card.nameKr}의 모습은 ${card.keywords.upright[1] || card.keywords.upright[0]}로 빛납니다. 이는 당신의 진정한 힘입니다.`,
        reversed: `표면적으로 보이는 ${card.keywords.reversed[1] || card.keywords.reversed[0]}는 실제로는 더 깊은 변화를 위한 위장일 수 있습니다.`
      },
      '미래': {
        upright: `다가올 미래에 ${card.nameKr}는 ${card.keywords.upright[0]}의 기회를 약속합니다. 이를 맞이할 준비를 하세요.`,
        reversed: `미래의 ${card.keywords.reversed[0]} 도전은 당신이 더 높은 차원으로 성장할 수 있는 관문입니다.`
      },
      '내가보는나': {
        upright: `당신은 자신을 ${card.nameKr}의 ${card.keywords.upright[0]}로 인식하고 있습니다. 이 자아상은 당신의 강력한 자산입니다.`,
        reversed: `자신에 대한 ${card.keywords.reversed[0]}의 인식은 재평가가 필요할 수 있습니다. 더 자비로운 시선을 가져보세요.`
      },
      '남이보는나': {
        upright: `타인들은 당신에게서 ${card.nameKr}의 ${card.keywords.upright[1] || card.keywords.upright[0]}를 봅니다. 이는 당신이 주는 영향력입니다.`,
        reversed: `타인이 보는 ${card.keywords.reversed[1] || card.keywords.reversed[0]}의 모습은 오해일 수 있습니다. 진정한 자신을 표현하세요.`
      },
      '예상하는 결과': {
        upright: `당신이 희망하는 ${card.nameKr}의 ${card.keywords.upright[0]}는 충분히 가능합니다. 믿음을 가지세요.`,
        reversed: `${card.keywords.reversed[0]}에 대한 두려움이 있지만, 이는 극복 가능한 환상입니다.`
      },
      '실제 결과': {
        upright: `최종적으로 ${card.nameKr}는 ${card.keywords.upright[0]}의 성취를 약속합니다. 여정을 신뢰하세요.`,
        reversed: `예상과 다른 ${card.keywords.reversed[0]}의 결과도 궁극적으로는 더 큰 선물이 될 것입니다.`
      }
    };

    const positionMeanings = meanings[position] || meanings['현재내면'];
    return card.orientation === 'upright' ? positionMeanings.upright : positionMeanings.reversed;
  }

  private static extractHiddenInfluences(card: DrawnCard, position: number, allCards: DrawnCard[]): string[] {
    const influences: string[] = [];

    // 원소 연결성
    const sameElementCards = allCards.filter((c, idx) => 
      idx !== position && c.element === card.element
    );
    if (sameElementCards.length > 0) {
      influences.push(`${card.element} 원소의 에너지가 다른 위치에서도 공명하고 있습니다`);
    }

    // 숫자 연결성 (Minor 카드의 경우)
    if (card.arcana === 'minor' && card.number !== undefined) {
      const sameNumberCards = allCards.filter((c, idx) => 
        idx !== position && c.arcana === 'minor' && c.number === card.number
      );
      if (sameNumberCards.length > 0) {
        influences.push(`숫자 ${card.number}의 진동이 여러 차원에서 작용하고 있습니다`);
      }
    }

    // 대립 관계
    if (position < 6) { // 십자가 부분
      const oppositePos = position % 2 === 0 ? position + 1 : position - 1;
      if (oppositePos < allCards.length) {
        const oppositeCard = allCards[oppositePos];
        if (oppositeCard.orientation !== card.orientation) {
          influences.push(`대립하는 에너지가 균형을 찾으려 하고 있습니다`);
        }
      }
    }

    // 시간축 연결 (과거-현재-미래)
    if ([3, 0, 1, 5].includes(position)) {
      influences.push(`시간의 흐름 속에서 중요한 전환점에 위치합니다`);
    }

    return influences;
  }

  private static generatePsychologicalInsight(card: DrawnCard, position: string): string {
    const insights = {
      'The Fool': '새로운 시작에 대한 두려움과 설렘이 공존하는 심리 상태',
      'The Magician': '자신의 능력을 인식하고 활용하려는 의지의 발현',
      'The High Priestess': '무의식과 직관의 메시지에 귀 기울이는 내적 지혜',
      'The Empress': '양육과 창조의 에너지가 풍부한 심리적 풍요',
      'The Emperor': '구조와 권위에 대한 욕구 또는 저항',
      'The Hierophant': '전통과 혁신 사이에서의 내적 갈등',
      'The Lovers': '선택과 관계에서의 깊은 감정적 연결',
      'The Chariot': '의지력과 통제에 대한 심리적 욕구',
      'Strength': '내면의 힘과 용기를 발견하는 과정',
      'The Hermit': '내적 탐구와 고독의 필요성',
      'Wheel of Fortune': '변화에 대한 수용과 운명에 대한 태도',
      'Justice': '균형과 공정성에 대한 심리적 욕구',
      'The Hanged Man': '관점의 전환과 희생을 통한 성장',
      'Death': '변화와 재생에 대한 심리적 준비',
      'Temperance': '내적 조화와 통합을 향한 여정',
      'The Devil': '그림자와 억압된 욕구의 인식',
      'The Tower': '급격한 변화와 깨달음의 충격',
      'The Star': '희망과 영감을 통한 치유',
      'The Moon': '무의식과 환상의 영역 탐험',
      'The Sun': '자아실현과 기쁨의 표현',
      'Judgement': '과거의 청산과 새로운 시작',
      'The World': '완성과 통합의 심리적 성취'
    };

    const defaultInsight = `${card.nameKr}가 나타내는 심리적 역동성과 내적 과정`;
    let baseInsight = insights[card.name] || defaultInsight;

    if (card.orientation === 'reversed') {
      baseInsight = `${baseInsight}의 그림자 측면 또는 억압된 형태`;
    }

    return `${position}에서 ${baseInsight}가 작용하고 있습니다.`;
  }

  private static generateSpiritualGuidance(card: DrawnCard, position: string): string {
    const guidances = {
      'major': {
        upright: `${card.nameKr}의 영적 교훈은 우주의 큰 계획 속에서 당신의 역할을 이해하는 것입니다.`,
        reversed: `${card.nameKr}의 도전은 영적 성장을 위한 필수적인 시험입니다.`
      },
      'wands': {
        upright: `불의 에너지가 당신의 영적 열정과 창조력을 깨우고 있습니다.`,
        reversed: `내면의 불꽃을 다시 점화할 시간입니다. 영감의 원천을 찾으세요.`
      },
      'cups': {
        upright: `물의 에너지가 감정적 치유와 영적 연결을 가져다줍니다.`,
        reversed: `감정의 물결을 받아들이고 정화의 과정을 거치세요.`
      },
      'swords': {
        upright: `바람의 에너지가 명확한 통찰과 영적 각성을 제공합니다.`,
        reversed: `생각의 폭풍을 가라앉히고 내면의 고요를 찾으세요.`
      },
      'pentacles': {
        upright: `대지의 에너지가 영적 실천과 현실적 적용을 돕습니다.`,
        reversed: `물질과 영성의 균형을 재조정할 필요가 있습니다.`
      }
    };

    let guidance: string;
    if (card.arcana === 'major') {
      guidance = card.orientation === 'upright' ? guidances.major.upright : guidances.major.reversed;
    } else {
      const suit = this.getCardSuit(card);
      const suitGuidance = guidances[suit] || guidances.wands;
      guidance = card.orientation === 'upright' ? suitGuidance.upright : suitGuidance.reversed;
    }

    return `${position}에서 ${guidance}`;
  }

  private static analyzeOverallTheme(cards: DrawnCard[], topic: Topic, question?: string): string {
    // 주요 아르카나 카드 수
    const majorCount = cards.filter(c => c.arcana === 'major').length;
    
    // 각 슈트별 카드 수
    const suitCounts = this.countSuits(cards);
    const dominantSuit = Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0];
    
    // 정방향/역방향 비율
    const uprightCount = cards.filter(c => c.orientation === 'upright').length;
    const reversedCount = cards.length - uprightCount;
    
    let theme = '';
    
    // 메이저 아르카나가 많은 경우
    if (majorCount >= 4) {
      theme = '이것은 영혼의 깊은 여정을 나타내는 중대한 시기입니다. 우주가 직접적으로 당신에게 말하고 있습니다. ';
    } else if (majorCount >= 2) {
      theme = '중요한 인생의 교훈과 성장의 기회가 펼쳐지고 있습니다. ';
    }
    
    // 지배적인 슈트 분석
    if (dominantSuit[1] >= 3) {
      const suitThemes = {
        'wands': '열정, 창조성, 그리고 행동의 에너지가 강하게 나타나고 있습니다. ',
        'cups': '감정, 직관, 그리고 관계의 흐름이 중심을 이루고 있습니다. ',
        'swords': '사고, 소통, 그리고 명확성의 필요성이 강조되고 있습니다. ',
        'pentacles': '현실적 안정, 물질적 성취, 그리고 실용성이 중요한 시기입니다. '
      };
      theme += suitThemes[dominantSuit[0]] || '';
    }
    
    // 방향성 분석
    if (reversedCount > uprightCount) {
      theme += '내면의 작업, 재평가, 그리고 숨겨진 측면들을 다루는 것이 중요합니다. ';
    } else if (uprightCount >= 8) {
      theme += '긍정적인 에너지와 순조로운 흐름이 당신을 지지하고 있습니다. ';
    }
    
    // 주제별 특화
    const topicThemes = {
      'love': '사랑의 에너지는 변화와 성장을 통해 더 깊은 차원으로 진화하고 있습니다.',
      'career': '직업적 여정에서 새로운 가능성과 도전이 균형을 이루고 있습니다.',
      'money': '물질적 풍요는 내적 가치와 조화를 이룰 때 진정으로 실현됩니다.',
      'health': '몸과 마음, 영혼의 전체적인 웰빙이 중요한 시점입니다.',
      'general': '삶의 다양한 측면들이 하나의 큰 그림을 만들어가고 있습니다.'
    };
    
    theme += topicThemes[topic];
    
    return theme;
  }

  private static extractKeyMessages(cards: DrawnCard[], analysis: any[]): string[] {
    const messages: string[] = [];
    
    // 1. 십자가 중앙 (현재 상황)의 핵심 메시지
    const presentCards = [cards[0], cards[1]];
    if (presentCards.every(c => c.orientation === 'upright')) {
      messages.push('현재 상황은 조화롭고 긍정적인 에너지로 가득합니다.');
    } else if (presentCards.every(c => c.orientation === 'reversed')) {
      messages.push('현재 직면한 도전들은 깊은 내적 변화를 요구하고 있습니다.');
    } else {
      messages.push('내면과 외면의 갈등을 통합하는 것이 현재의 과제입니다.');
    }
    
    // 2. 과거-현재-미래 축의 메시지
    const timelineCards = [cards[3], cards[0], cards[5]];
    const timelineMessage = this.analyzeTimeline(timelineCards);
    messages.push(timelineMessage);
    
    // 3. 의식-무의식 축의 메시지
    const consciousCards = [cards[4], cards[6]];
    const unconsciousCards = [cards[2], cards[7]];
    const psycheMessage = this.analyzePsyche(consciousCards, unconsciousCards);
    messages.push(psycheMessage);
    
    // 4. 희망과 현실의 메시지
    const hopeCard = cards[8];
    const outcomeCard = cards[9];
    const manifestationMessage = this.analyzeManifestation(hopeCard, outcomeCard);
    messages.push(manifestationMessage);
    
    // 5. 가장 강력한 카드의 메시지
    const mostPowerfulCard = this.findMostPowerfulCard(cards);
    messages.push(`${mostPowerfulCard.nameKr}의 에너지가 전체 상황을 강력하게 이끌고 있습니다.`);
    
    return messages;
  }

  private static analyzeRelationshipDynamics(cards: DrawnCard[]): any {
    return {
      innerOuter: this.analyzeInnerOuterDynamic(cards[0], cards[1]),
      pastPresentFuture: this.analyzePastPresentFuture(cards[3], cards[0], cards[5]),
      consciousUnconscious: this.analyzeConsciousUnconscious(cards[4], cards[2]),
      challengesOpportunities: this.analyzeChallengesOpportunities(cards)
    };
  }

  private static analyzeEnergyFlow(cards: DrawnCard[]): any {
    const blockages: string[] = [];
    const strengths: string[] = [];
    const recommendations: string[] = [];

    // 역방향 카드 분석 (블록)
    cards.forEach((card, idx) => {
      if (card.orientation === 'reversed') {
        blockages.push(`${this.getPositionName(idx)}에서 ${card.nameKr}의 에너지가 막혀 있습니다`);
      }
    });

    // 정방향 메이저 카드 (강점)
    cards.forEach((card, idx) => {
      if (card.orientation === 'upright' && card.arcana === 'major') {
        strengths.push(`${this.getPositionName(idx)}의 ${card.nameKr}가 강력한 지원을 제공합니다`);
      }
    });

    // 원소 균형 분석
    const elementBalance = this.analyzeElementBalance(cards);
    recommendations.push(...elementBalance);

    // 에너지 흐름 개선 제안
    if (blockages.length > 3) {
      recommendations.push('에너지 정화와 그라운딩 작업이 필요합니다');
    }
    if (strengths.length < 2) {
      recommendations.push('내면의 힘을 더 신뢰하고 활용하세요');
    }

    return { blockages, strengths, recommendations };
  }

  private static analyzeTransformationPath(cards: DrawnCard[]): any {
    const currentState = this.defineCurrentState(cards[0], cards[1]);
    const nextSteps = this.defineNextSteps(cards);
    const ultimatePotential = this.defineUltimatePotential(cards[9]);

    return {
      currentState,
      nextSteps,
      ultimatePotential
    };
  }

  private static findSynchronicities(cards: DrawnCard[]): string[] {
    const synchronicities: string[] = [];

    // 연속 숫자 찾기
    const numbers = cards
      .filter(c => c.arcana === 'minor' && c.number !== undefined)
      .map(c => c.number as number)
      .sort((a, b) => a - b);
    
    for (let i = 0; i < numbers.length - 1; i++) {
      if (numbers[i + 1] === numbers[i] + 1) {
        synchronicities.push(`연속된 숫자의 출현은 단계적 진화를 암시합니다`);
        break;
      }
    }

    // 같은 숫자 반복
    const numberCounts: { [key: number]: number } = {};
    cards.forEach(c => {
      if (c.arcana === 'minor' && c.number !== undefined) {
        numberCounts[c.number] = (numberCounts[c.number] || 0) + 1;
      }
    });
    
    Object.entries(numberCounts).forEach(([num, count]) => {
      if (count >= 2) {
        synchronicities.push(`숫자 ${num}의 반복은 그 에너지의 강조를 의미합니다`);
      }
    });

    // 코트 카드 패턴
    const courtCards = cards.filter(c => 
      c.name.includes('Page') || c.name.includes('Knight') || 
      c.name.includes('Queen') || c.name.includes('King')
    );
    
    if (courtCards.length >= 3) {
      synchronicities.push(`많은 코트 카드는 다양한 인물이나 성격적 측면의 영향을 나타냅니다`);
    }

    // 특별한 조합
    const hasFool = cards.some(c => c.name === 'The Fool');
    const hasWorld = cards.some(c => c.name === 'The World');
    if (hasFool && hasWorld) {
      synchronicities.push(`바보와 세계의 만남은 완전한 순환과 새로운 시작을 의미합니다`);
    }

    return synchronicities;
  }

  private static generateRitualSuggestions(cards: DrawnCard[], topic: Topic): string[] {
    const suggestions: string[] = [];
    const elements = this.getdominantElements(cards);

    // 원소별 의식 제안
    if (elements.includes('불')) {
      suggestions.push('붉은 양초를 켜고 당신의 의도를 불꽃에 전달하세요');
    }
    if (elements.includes('물')) {
      suggestions.push('정화를 위한 목욕 의식이나 물을 이용한 명상을 시도하세요');
    }
    if (elements.includes('공기')) {
      suggestions.push('향을 피우고 깊은 호흡 명상을 통해 정신을 맑게 하세요');
    }
    if (elements.includes('땅')) {
      suggestions.push('자연 속에서 맨발로 걷거나 크리스탈을 이용한 그라운딩을 하세요');
    }

    // 주제별 특별 의식
    const topicRituals = {
      'love': '분홍색 양초와 장미 꽃잎으로 사랑의 제단을 만드세요',
      'career': '성공을 상징하는 물건들로 비전 보드를 만드세요',
      'money': '풍요를 위한 녹색 양초 의식과 감사 일기를 작성하세요',
      'health': '치유를 위한 백색 양초와 함께 몸을 위한 감사 명상을 하세요',
      'general': '보름달 아래서 당신의 의도를 종이에 적고 태우세요'
    };

    suggestions.push(topicRituals[topic]);

    return suggestions;
  }

  private static recommendCrystals(cards: DrawnCard[], topic: Topic): string[] {
    const recommendations: string[] = [];
    
    // 주요 카드에 따른 크리스탈
    cards.slice(0, 3).forEach(card => {
      if (card.arcana === 'major') {
        const crystalMap = {
          'The Fool': '클리어 쿼츠 - 새로운 시작과 순수한 가능성',
          'The Magician': '시트린 - 의지력과 현현의 힘',
          'The High Priestess': '문스톤 - 직관과 내면의 지혜',
          'The Empress': '로즈 쿼츠 - 사랑과 풍요',
          'The Emperor': '레드 재스퍼 - 리더십과 안정',
          'The Hierophant': '라피스 라줄리 - 영적 지혜',
          'The Lovers': '로도나이트 - 관계의 조화',
          'The Chariot': '흑요석 - 보호와 의지력',
          'Strength': '카넬리안 - 용기와 생명력',
          'The Hermit': '라브라도라이트 - 내면의 빛',
          'Wheel of Fortune': '어벤츄린 - 행운과 기회',
          'Justice': '소달라이트 - 균형과 진실',
          'The Hanged Man': '아쿠아마린 - 관점의 전환',
          'Death': '스모키 쿼츠 - 변화와 재생',
          'Temperance': '아메시스트 - 영적 균형',
          'The Devil': '헤마타이트 - 그라운딩과 보호',
          'The Tower': '블랙 투르말린 - 부정적 에너지 정화',
          'The Star': '셀레스타이트 - 희망과 영감',
          'The Moon': '셀레나이트 - 직관과 정화',
          'The Sun': '선스톤 - 기쁨과 활력',
          'Judgement': '몰다바이트 - 영적 각성',
          'The World': '플루오라이트 - 완성과 통합'
        };
        
        const crystal = crystalMap[card.name];
        if (crystal) {
          recommendations.push(crystal);
        }
      }
    });

    // 주제별 추가 크리스탈
    const topicCrystals = {
      'love': '로즈 쿼츠를 심장 차크라에 두고 명상하세요',
      'career': '파이라이트를 작업 공간에 두어 성공 에너지를 끌어당기세요',
      'money': '그린 어벤츄린을 지갑에 넣어 풍요를 초대하세요',
      'health': '클리어 쿼츠로 전체적인 에너지 균형을 맞추세요',
      'general': '아메시스트로 영적 통찰력을 높이세요'
    };

    recommendations.push(topicCrystals[topic]);

    return [...new Set(recommendations)]; // 중복 제거
  }

  private static generateAffirmations(cards: DrawnCard[], topic: Topic): string[] {
    const affirmations: string[] = [];
    
    // 현재 상황 카드 기반 확언
    const presentCard = cards[0];
    if (presentCard.orientation === 'upright') {
      affirmations.push(`나는 ${presentCard.keywords.upright[0]}의 에너지와 하나가 됩니다`);
    } else {
      affirmations.push(`나는 ${presentCard.keywords.reversed[0]}를 사랑으로 변화시킵니다`);
    }

    // 결과 카드 기반 확언
    const outcomeCard = cards[9];
    affirmations.push(`나는 ${outcomeCard.nameKr}의 최고의 가능성을 실현합니다`);

    // 주제별 확언
    const topicAffirmations = {
      'love': '나는 사랑을 주고받을 자격이 있으며, 완전한 사랑 속에 살아갑니다',
      'career': '나의 재능과 열정은 세상에 가치 있는 기여를 만들어냅니다',
      'money': '나는 우주의 무한한 풍요와 연결되어 있습니다',
      'health': '내 몸은 완벽한 건강과 활력의 성전입니다',
      'general': '나는 내 삶의 창조자이며, 모든 것이 완벽한 시기에 펼쳐집니다'
    };

    affirmations.push(topicAffirmations[topic]);

    // 전환을 위한 특별 확언
    if (cards.filter(c => c.orientation === 'reversed').length > 5) {
      affirmations.push('나는 모든 도전을 성장의 기회로 변화시키는 힘을 가지고 있습니다');
    }

    return affirmations;
  }

  // Helper methods
  private static getCardSuit(card: DrawnCard): string {
    if (card.name.toLowerCase().includes('wand')) return 'wands';
    if (card.name.toLowerCase().includes('cup')) return 'cups';
    if (card.name.toLowerCase().includes('sword')) return 'swords';
    if (card.name.toLowerCase().includes('pentacle')) return 'pentacles';
    return 'major';
  }

  private static countSuits(cards: DrawnCard[]): { [key: string]: number } {
    const counts = {
      wands: 0,
      cups: 0,
      swords: 0,
      pentacles: 0
    };

    cards.forEach(card => {
      const suit = this.getCardSuit(card);
      if (suit !== 'major' && counts.hasOwnProperty(suit)) {
        counts[suit]++;
      }
    });

    return counts;
  }

  private static analyzeTimeline(timelineCards: DrawnCard[]): string {
    const [past, present, future] = timelineCards;
    
    if (past.orientation === 'reversed' && future.orientation === 'upright') {
      return '과거의 어려움이 미래의 성공을 위한 토대가 되고 있습니다.';
    } else if (past.orientation === 'upright' && future.orientation === 'reversed') {
      return '과거의 성공에 안주하지 말고 새로운 도전을 준비하세요.';
    } else if (timelineCards.every(c => c.arcana === 'major')) {
      return '인생의 주요 전환점들이 연속적으로 펼쳐지고 있습니다.';
    }
    
    return '시간의 흐름 속에서 꾸준한 진화가 일어나고 있습니다.';
  }

  private static analyzePsyche(conscious: DrawnCard[], unconscious: DrawnCard[]): string {
    const consciousUpright = conscious.filter(c => c.orientation === 'upright').length;
    const unconsciousUpright = unconscious.filter(c => c.orientation === 'upright').length;
    
    if (consciousUpright > unconsciousUpright) {
      return '의식적 노력이 무의식의 저항을 극복하고 있습니다.';
    } else if (unconsciousUpright > consciousUpright) {
      return '무의식의 지혜가 의식적 이해를 이끌고 있습니다.';
    }
    
    return '의식과 무의식이 조화롭게 협력하고 있습니다.';
  }

  private static analyzeManifestation(hope: DrawnCard, outcome: DrawnCard): string {
    if (hope.orientation === outcome.orientation) {
      return '당신의 희망과 실제 결과가 일치하는 방향으로 나아가고 있습니다.';
    } else if (hope.orientation === 'upright' && outcome.orientation === 'reversed') {
      return '기대와 다른 결과가 나타날 수 있지만, 이는 더 큰 지혜로 이어집니다.';
    } else {
      return '두려움을 넘어선 곳에 예상치 못한 축복이 기다리고 있습니다.';
    }
  }

  private static findMostPowerfulCard(cards: DrawnCard[]): DrawnCard {
    // 우선순위: 1) The World, 2) The Fool, 3) 기타 메이저, 4) 에이스, 5) 코트 카드
    const priorityCards = ['The World', 'The Fool', 'The Magician', 'The High Priestess'];
    
    for (const priority of priorityCards) {
      const found = cards.find(c => c.name === priority);
      if (found) return found;
    }
    
    // 메이저 카드 중 정방향
    const uprightMajor = cards.find(c => c.arcana === 'major' && c.orientation === 'upright');
    if (uprightMajor) return uprightMajor;
    
    // 아무 메이저 카드
    const anyMajor = cards.find(c => c.arcana === 'major');
    if (anyMajor) return anyMajor;
    
    // 에이스
    const ace = cards.find(c => c.number === 1);
    if (ace) return ace;
    
    return cards[0]; // 기본값
  }

  private static analyzeInnerOuterDynamic(inner: DrawnCard, outer: DrawnCard): string {
    if (inner.orientation === outer.orientation) {
      return '내면과 외면이 일치하여 진정성 있는 표현이 가능합니다.';
    } else if (inner.arcana === 'major' && outer.arcana === 'minor') {
      return '깊은 내적 변화가 일상적 현실로 표현되고 있습니다.';
    } else if (inner.orientation === 'reversed' && outer.orientation === 'upright') {
      return '내적 갈등에도 불구하고 외적으로는 균형을 유지하고 있습니다.';
    }
    
    return '내면과 외면 사이의 창조적 긴장이 성장을 촉진합니다.';
  }

  private static analyzePastPresentFuture(past: DrawnCard, present: DrawnCard, future: DrawnCard): string {
    const elements = [past, present, future].map(c => c.element).filter(e => e);
    const uniqueElements = new Set(elements);
    
    if (uniqueElements.size === 1) {
      return `${elements[0]} 원소의 에너지가 시간을 관통하여 지속됩니다.`;
    } else if (past.arcana === 'major' && future.arcana === 'major') {
      return '중요한 인생의 교훈이 미래의 중대한 변화로 이어집니다.';
    }
    
    return '과거, 현재, 미래가 유기적으로 연결되어 진화하고 있습니다.';
  }

  private static analyzeConsciousUnconscious(conscious: DrawnCard, unconscious: DrawnCard): string {
    if (conscious.element === unconscious.element) {
      return '의식과 무의식이 같은 원소적 힘으로 공명하고 있습니다.';
    } else if (conscious.orientation === 'upright' && unconscious.orientation === 'reversed') {
      return '의식적 명확성과 무의식적 혼란 사이의 균형이 필요합니다.';
    }
    
    return '의식과 무의식의 대화가 깊은 통찰을 가져다줍니다.';
  }

  private static analyzeChallengesOpportunities(cards: DrawnCard[]): string {
    const reversedCount = cards.filter(c => c.orientation === 'reversed').length;
    const majorCount = cards.filter(c => c.arcana === 'major').length;
    
    if (reversedCount > 6) {
      return '많은 도전이 있지만, 각각은 변화와 성장의 씨앗을 품고 있습니다.';
    } else if (majorCount > 5) {
      return '우주적 차원의 기회들이 당신 앞에 펼쳐져 있습니다.';
    } else if (reversedCount < 3) {
      return '순조로운 흐름 속에서도 겸손함을 잃지 마세요.';
    }
    
    return '도전과 기회가 완벽한 균형을 이루며 성장을 돕고 있습니다.';
  }

  private static getPositionName(index: number): string {
    const positions = [
      '현재내면', '현재외부', '근본', '과거', 
      '드러나는 모습', '미래', '내가보는나', '남이보는나',
      '예상하는 결과', '실제 결과'
    ];
    return positions[index] || `포지션 ${index + 1}`;
  }

  private static analyzeElementBalance(cards: DrawnCard[]): string[] {
    const elements = cards.map(c => c.element).filter(e => e);
    const elementCounts: { [key: string]: number } = {};
    
    elements.forEach(e => {
      elementCounts[e] = (elementCounts[e] || 0) + 1;
    });
    
    const recommendations: string[] = [];
    
    // 부족한 원소 찾기
    const allElements = ['불', '물', '공기', '땅'];
    allElements.forEach(element => {
      if (!elementCounts[element] || elementCounts[element] < 2) {
        const elementRecommendations = {
          '불': '의지력과 열정을 강화하는 활동을 추가하세요',
          '물': '감정적 흐름과 직관을 활성화하는 시간을 가지세요',
          '공기': '명상과 호흡법으로 정신적 명료성을 키우세요',
          '땅': '자연과 연결되고 실용적인 계획을 세우세요'
        };
        recommendations.push(elementRecommendations[element]);
      }
    });
    
    return recommendations;
  }

  private static defineCurrentState(inner: DrawnCard, outer: DrawnCard): string {
    const innerKeyword = inner.orientation === 'upright' 
      ? inner.keywords.upright[0] 
      : inner.keywords.reversed[0];
    
    const outerKeyword = outer.orientation === 'upright'
      ? outer.keywords.upright[0]
      : outer.keywords.reversed[0];
    
    return `내면의 ${innerKeyword}와 외적 ${outerKeyword}가 만나는 지점에 있습니다.`;
  }

  private static defineNextSteps(cards: DrawnCard[]): string[] {
    const steps: string[] = [];
    
    // 조언 위치의 카드 (6번째)들을 기반으로
    const adviceCard = cards[5];
    if (adviceCard) {
      const keyword = adviceCard.orientation === 'upright'
        ? adviceCard.keywords.upright[0]
        : adviceCard.keywords.reversed[0];
      steps.push(`${keyword}의 에너지를 일상에 통합하세요`);
    }
    
    // 가장 많은 역방향 카드가 있는 영역 찾기
    const reversedPositions = cards
      .map((c, idx) => ({ card: c, position: idx }))
      .filter(({ card }) => card.orientation === 'reversed')
      .slice(0, 3);
    
    reversedPositions.forEach(({ position }) => {
      steps.push(`${this.getPositionName(position)}의 블록을 해소하는 작업을 시작하세요`);
    });
    
    // 메이저 카드의 교훈
    const majorCards = cards.filter(c => c.arcana === 'major').slice(0, 2);
    majorCards.forEach(card => {
      steps.push(`${card.nameKr}의 교훈을 일상에서 실천하세요`);
    });
    
    return steps.slice(0, 3); // 최대 3개
  }

  private static defineUltimatePotential(outcomeCard: DrawnCard): string {
    if (outcomeCard.arcana === 'major') {
      return `${outcomeCard.nameKr}가 상징하는 영적 성취와 삶의 대전환이 기다리고 있습니다.`;
    } else if (outcomeCard.orientation === 'upright') {
      const keywords = outcomeCard.keywords.upright.join(', ');
      return `${keywords}의 실현을 통해 구체적인 성과와 만족을 얻게 됩니다.`;
    } else {
      return `예상과 다른 형태로 나타날 수 있지만, 더 깊은 지혜와 성장을 가져다줄 것입니다.`;
    }
  }

  private static getdominantElements(cards: DrawnCard[]): string[] {
    const elementCounts: { [key: string]: number } = {};
    
    cards.forEach(card => {
      if (card.element) {
        elementCounts[card.element] = (elementCounts[card.element] || 0) + 1;
      }
    });
    
    // 2개 이상 나온 원소들
    return Object.entries(elementCounts)
      .filter(([_, count]) => count >= 2)
      .map(([element, _]) => element);
  }
}
