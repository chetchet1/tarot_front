// 프리미엄 사용자를 위한 고급 해석 서비스

interface CardInterpretation {
  card: any;
  position: any;
  orientation: string;
  spread: string;
  topic: string;
}

interface DetailedInterpretation {
  basic: string;
  deeper: string;
  shadow: string;
  advice: string;
  timing?: string;
  symbols?: string[];
  numerology?: string;
  elements?: string;
  chakras?: string;
  crystals?: string[];
  affirmation?: string;
}

// 켈틱 크로스 해석기 클래스
export class CelticCrossInterpreter {
  private cards: any[];
  private topic: string;

  constructor(cards: any[], topic: string) {
    this.cards = cards;
    this.topic = topic;
  }

  async generateInterpretation(): Promise<any> {
    const positions = this.cards.map((card, index) => ({
      meaning: this.getPositionMeaning(card, index),
      card: card
    }));

    const overallPattern = this.generateOverallPattern();
    const relationships = this.analyzeRelationships();
    const keywords = this.extractKeywords();
    const advice = this.generateAdvice();
    const elementAnalysis = this.generateElementAnalysis();
    const timelineAnalysis = this.generateTimelineAnalysis();

    return {
      positions,
      overallPattern,
      relationships,
      keywords,
      advice,
      elementAnalysis,
      timelineAnalysis
    };
  }

  private getPositionMeaning(card: any, index: number): string {
    const positionMeanings = [
      '현재 당신의 상황',
      '당면한 도전이나 영향',
      '먼 과거의 영향',
      '최근 과거의 사건',
      '가능한 미래의 결과',
      '가까운 미래의 전개',
      '당신의 접근 방식',
      '외부 환경과 영향',
      '희망과 두려움',
      '최종 결과와 교훈'
    ];

    const position = positionMeanings[index];
    const meaning = card.meanings?.[this.topic]?.[card.orientation] || 
                   card.meanings?.general?.[card.orientation] || 
                   '이 카드는 중요한 메시지를 담고 있습니다.';

    return `${position}: ${meaning}`;
  }

  private generateOverallPattern(): string {
    const majorCount = this.cards.filter(c => c.arcana === 'major').length;
    const uprightCount = this.cards.filter(c => c.orientation === 'upright').length;
    
    let pattern = '';
    
    if (majorCount >= 5) {
      pattern = '인생의 중대한 전환점에 서 있습니다. ';
    } else if (majorCount >= 3) {
      pattern = '중요한 변화와 성장의 시기입니다. ';
    } else {
      pattern = '일상적인 문제들이 주를 이루고 있습니다. ';
    }
    
    if (uprightCount >= 7) {
      pattern += '전반적으로 긍정적인 에너지가 흐르고 있습니다.';
    } else if (uprightCount <= 3) {
      pattern += '도전과 어려움이 있지만, 이는 성장의 기회입니다.';
    } else {
      pattern += '균형잡힌 상황으로, 신중한 접근이 필요합니다.';
    }
    
    return pattern;
  }

  private analyzeRelationships(): string[] {
    const relationships = [];
    
    // 과거와 현재의 연결
    if (this.cards[2].suit === this.cards[0].suit && this.cards[2].arcana === 'minor' && this.cards[0].arcana === 'minor') {
      relationships.push('과거의 경험이 현재 상황에 직접적인 영향을 미치고 있습니다.');
    }
    
    // 현재와 미래의 연결
    if (this.cards[0].orientation === this.cards[5].orientation) {
      relationships.push('현재의 에너지가 가까운 미래까지 이어질 것으로 보입니다.');
    }
    
    // 의식과 무의식의 대비
    if (this.cards[6].orientation !== this.cards[8].orientation) {
      relationships.push('의식적인 접근과 무의식적인 두려움 사이에 갈등이 있습니다.');
    }
    
    // 원소 분석
    const elements = this.analyzeElements();
    if (elements.dominant) {
      relationships.push(`${elements.dominant} 원소의 에너지가 강하게 작용하고 있습니다.`);
    }
    
    return relationships;
  }

  private analyzeElements(): any {
    const elementCount = { fire: 0, water: 0, air: 0, earth: 0 };
    const elementMap = {
      'wands': 'fire',
      'cups': 'water',
      'swords': 'air',
      'pentacles': 'earth'
    };
    
    this.cards.forEach(card => {
      if (card.suit && elementMap[card.suit]) {
        elementCount[elementMap[card.suit]]++;
      }
    });
    
    const dominant = Object.entries(elementCount)
      .sort(([,a], [,b]) => b - a)[0];
    
    return {
      dominant: dominant[1] >= 3 ? dominant[0] : null,
      counts: elementCount
    };
  }

  private extractKeywords(): string[] {
    const keywords = new Set<string>();
    
    this.cards.forEach(card => {
      if (card.keywords && card.keywords[card.orientation]) {
        card.keywords[card.orientation].forEach((kw: string) => keywords.add(kw));
      }
    });
    
    return Array.from(keywords).slice(0, 10);
  }

  private generateAdvice(): string {
    const futureCard = this.cards[9]; // 최종 결과
    const approachCard = this.cards[6]; // 당신의 접근
    
    let advice = '';
    
    if (futureCard.orientation === 'upright') {
      advice = '긍정적인 결과를 향해 나아가고 있습니다. ';
    } else {
      advice = '예상과 다른 결과가 나올 수 있지만, 이 또한 성장의 기회입니다. ';
    }
    
    if (approachCard.orientation === 'upright') {
      advice += '현재의 접근 방식을 유지하되, 유연성을 잃지 마세요.';
    } else {
      advice += '접근 방식을 재검토하고 새로운 관점을 시도해보세요.';
    }
    
    return advice;
  }

  private generateElementAnalysis(): string[] {
    const elements = this.analyzeElements();
    const analysis = [];
    
    // 원소 분포 분석
    const { fire, water, air, earth } = elements.counts;
    
    if (fire >= 3) {
      analysis.push('화(불)의 에너지가 강합니다 - 열정, 행동력, 창의성이 중요한 시기입니다.');
    }
    if (water >= 3) {
      analysis.push('수(물)의 에너지가 강합니다 - 감정, 직관, 내면의 지혜에 주목하세요.');
    }
    if (air >= 3) {
      analysis.push('풍(공기)의 에너지가 강합니다 - 의사소통, 분석, 새로운 아이디어가 중요합니다.');
    }
    if (earth >= 3) {
      analysis.push('지(흙)의 에너지가 강합니다 - 현실성, 안정성, 구체적 성과가 중요합니다.');
    }
    
    // 불균형 분석
    if (fire === 0) analysis.push('화(불) 에너지가 부족합니다 - 더 적극적인 행동이 필요할 수 있습니다.');
    if (water === 0) analysis.push('수(물) 에너지가 부족합니다 - 감정적 연결과 공감이 필요합니다.');
    if (air === 0) analysis.push('풍(공기) 에너지가 부족합니다 - 명확한 사고와 계획이 필요합니다.');
    if (earth === 0) analysis.push('지(흙) 에너지가 부족합니다 - 현실적인 기반 마련이 필요합니다.');
    
    // 메이저 아르카나 분석
    const majorCount = this.cards.filter(c => c.arcana === 'major').length;
    if (majorCount >= 4) {
      analysis.push('메이저 카드가 많습니다 - 인생의 중요한 전환점, 운명적 순간입니다.');
    }
    
    return analysis;
  }

  private generateTimelineAnalysis(): any {
    const past = [this.cards[2], this.cards[3]]; // 먼 과거, 가까운 과거
    const present = [this.cards[0], this.cards[1]]; // 현재 상황, 도전
    const future = [this.cards[4], this.cards[5], this.cards[9]]; // 가능한 미래, 가까운 미래, 최종 결과
    
    const timeline = {
      past: {
        energy: this.analyzeTimeEnergy(past),
        lesson: '과거의 경험이 현재에 미치는 영향'
      },
      present: {
        energy: this.analyzeTimeEnergy(present),
        challenge: '현재 직면한 핵심 과제'
      },
      future: {
        energy: this.analyzeTimeEnergy(future),
        potential: '미래의 가능성과 방향'
      },
      flow: this.analyzeTimeFlow(past, present, future),
      advice: this.generateTimelineAdvice(past, present, future)
    };
    
    return timeline;
  }

  private analyzeTimeEnergy(cards: any[]): string {
    const uprightCount = cards.filter(c => c.orientation === 'upright').length;
    const majorCount = cards.filter(c => c.arcana === 'major').length;
    
    if (uprightCount === cards.length) {
      return '매우 긍정적이고 순탄한 에너지';
    } else if (uprightCount === 0) {
      return '도전과 변화가 필요한 에너지';
    } else if (majorCount >= 2) {
      return '중요한 변화와 전환의 에너지';
    } else {
      return '균형잡힌 에너지';
    }
  }

  private analyzeTimeFlow(past: any[], present: any[], future: any[]): string {
    const pastEnergy = past.filter(c => c.orientation === 'upright').length;
    const presentEnergy = present.filter(c => c.orientation === 'upright').length;
    const futureEnergy = future.filter(c => c.orientation === 'upright').length;
    
    if (pastEnergy < presentEnergy && presentEnergy < futureEnergy) {
      return '과거의 어려움을 극복하고 점점 더 나은 미래로 향하고 있습니다.';
    } else if (pastEnergy > presentEnergy && presentEnergy > futureEnergy) {
      return '현재 어려움을 겪고 있지만, 이는 새로운 시작을 위한 준비 과정일 수 있습니다.';
    } else {
      return '삶의 자연스러운 순환과 리듬 속에 있습니다.';
    }
  }

  private generateTimelineAdvice(past: any[], present: any[], future: any[]): string {
    const futureCard = future[2]; // 최종 결과
    
    if (futureCard.orientation === 'upright') {
      return '과거의 경험을 토대로 현재에 충실하면 밝은 미래가 기다리고 있습니다.';
    } else {
      return '과거의 패턴을 반복하지 말고, 새로운 접근 방식을 시도해보세요.';
    }
  }
}

// 기존 함수도 유지 (호환성을 위해)
export const getCelticCrossInterpretation = (cards: CardInterpretation[]): any => {
  const interpretations: any = {};
  
  // 각 포지션별 특별 해석
  cards.forEach((cardData, index) => {
    const position = index + 1;
    let positionInterpretation = '';
    
    switch(position) {
      case 1: // 현재 상황
        positionInterpretation = getDetailedPositionInterpretation(cardData, 'present_situation');
        break;
      case 2: // 도전/십자가
        positionInterpretation = getChallengeInterpretation(cardData, cards[0]);
        break;
      case 3: // 먼 과거
        positionInterpretation = getDetailedPositionInterpretation(cardData, 'distant_past');
        break;
      case 4: // 가까운 과거
        positionInterpretation = getDetailedPositionInterpretation(cardData, 'recent_past');
        break;
      case 5: // 가능한 미래
        positionInterpretation = getDetailedPositionInterpretation(cardData, 'possible_future');
        break;
      case 6: // 가까운 미래
        positionInterpretation = getDetailedPositionInterpretation(cardData, 'immediate_future');
        break;
      case 7: // 당신의 접근
        positionInterpretation = getDetailedPositionInterpretation(cardData, 'your_approach');
        break;
      case 8: // 외부 영향
        positionInterpretation = getDetailedPositionInterpretation(cardData, 'external_influences');
        break;
      case 9: // 희망과 두려움
        positionInterpretation = getHopesAndFearsInterpretation(cardData);
        break;
      case 10: // 최종 결과
        positionInterpretation = getFinalOutcomeInterpretation(cardData, cards);
        break;
    }
    
    interpretations[`position_${position}`] = positionInterpretation;
  });
  
  // 전체적인 스토리라인 생성
  const overallStory = generateCelticCrossStory(cards, interpretations);
  
  return {
    interpretations,
    overallStory,
    specialInsights: getCelticCrossInsights(cards)
  };
};

// 세븐 스타 특별 해석
export const getSevenStarInterpretation = (cards: CardInterpretation[]): any => {
  const interpretations: any = {};
  
  cards.forEach((cardData, index) => {
    const position = index + 1;
    let positionInterpretation = '';
    
    switch(position) {
      case 1: // 과거의 영향
        positionInterpretation = getStarInfluenceInterpretation(cardData, 'past_star');
        break;
      case 2: // 현재 상황
        positionInterpretation = getStarInfluenceInterpretation(cardData, 'present_star');
        break;
      case 3: // 숨겨진 영향
        positionInterpretation = getHiddenInfluenceInterpretation(cardData);
        break;
      case 4: // 의식적 욕구
        positionInterpretation = getDesireInterpretation(cardData, 'conscious');
        break;
      case 5: // 무의식적 욕구
        positionInterpretation = getDesireInterpretation(cardData, 'unconscious');
        break;
      case 6: // 조언
        positionInterpretation = getStarAdviceInterpretation(cardData);
        break;
      case 7: // 최종 결과
        positionInterpretation = getStarOutcomeInterpretation(cardData, cards);
        break;
    }
    
    interpretations[`star_${position}`] = positionInterpretation;
  });
  
  // 별자리 연결 해석
  const constellationReading = generateConstellationReading(cards);
  
  return {
    interpretations,
    constellationReading,
    cosmicGuidance: getCosmicGuidance(cards)
  };
};

// 컵 오브 릴레이션십 특별 해석
export const getCupOfRelationshipInterpretation = (cards: CardInterpretation[]): any => {
  const interpretations: any = {};
  
  cards.forEach((cardData, index) => {
    const position = index + 1;
    let positionInterpretation = '';
    
    switch(position) {
      case 1: // 당신의 감정
        positionInterpretation = getEmotionalStateInterpretation(cardData, 'your_feelings');
        break;
      case 2: // 상대의 감정
        positionInterpretation = getEmotionalStateInterpretation(cardData, 'partner_feelings');
        break;
      case 3: // 관계의 기반
        positionInterpretation = getRelationshipFoundationInterpretation(cardData);
        break;
      case 4: // 소통의 상태
        positionInterpretation = getCommunicationInterpretation(cardData);
        break;
      case 5: // 친밀감
        positionInterpretation = getIntimacyInterpretation(cardData);
        break;
      case 6: // 장애물
        positionInterpretation = getObstacleInterpretation(cardData);
        break;
      case 7: // 관계의 미래
        positionInterpretation = getRelationshipFutureInterpretation(cardData, cards);
        break;
    }
    
    interpretations[`cup_${position}`] = positionInterpretation;
  });
  
  // 사랑의 조화도 분석
  const loveHarmony = analyzeLoveHarmony(cards);
  
  return {
    interpretations,
    loveHarmony,
    relationshipAdvice: getRelationshipAdvice(cards)
  };
};

// 상세한 포지션 해석
function getDetailedPositionInterpretation(cardData: CardInterpretation, positionType: string): DetailedInterpretation {
  const card = cardData.card;
  const orientation = cardData.orientation;
  
  // 기본 해석에 추가적인 레이어 더하기
  const basic = getBasicMeaning(card, orientation, cardData.topic);
  const deeper = getDeeperMeaning(card, orientation, positionType);
  const shadow = getShadowAspect(card, orientation);
  const advice = getPositionAdvice(card, orientation, positionType);
  
  // 추가적인 신비학적 요소들
  const timing = getTimingIndication(card);
  const symbols = getKeySymbols(card);
  const numerology = getNumerologicalMeaning(card);
  const elements = getElementalInfluence(card);
  const chakras = getChakraAssociation(card);
  const crystals = getCrystalRecommendations(card);
  const affirmation = getAffirmation(card, orientation);
  
  return {
    basic,
    deeper,
    shadow,
    advice,
    timing,
    symbols,
    numerology,
    elements,
    chakras,
    crystals,
    affirmation
  };
}

// 도전 카드 특별 해석 (켈틱 크로스 2번 위치)
function getChallengeInterpretation(challengeCard: CardInterpretation, situationCard: CardInterpretation): any {
  const challenge = challengeCard.card;
  const situation = situationCard.card;
  
  // 두 카드의 상호작용 분석
  const interaction = analyzeCardInteraction(situation, challenge);
  const conflictType = identifyConflictType(situation, challenge);
  const resolution = suggestResolution(challenge, challengeCard.orientation);
  
  return {
    challengeNature: `이 도전은 ${getChallengeName(challenge)}의 형태로 나타납니다.`,
    interaction: interaction,
    conflictType: conflictType,
    resolution: resolution,
    hiddenOpportunity: getHiddenOpportunity(challenge),
    transformationPath: getTransformationPath(challenge, challengeCard.orientation)
  };
}

// 희망과 두려움 해석 (켈틱 크로스 9번 위치)
function getHopesAndFearsInterpretation(cardData: CardInterpretation): any {
  const card = cardData.card;
  const orientation = cardData.orientation;
  
  // 희망과 두려움의 이중성 탐구
  const hope = orientation === 'upright' 
    ? getHopeAspect(card) 
    : getShadowHope(card);
    
  const fear = orientation === 'upright'
    ? getUnderlyingFear(card)
    : getDeepFear(card);
    
  return {
    hope: hope,
    fear: fear,
    balance: `이 카드는 당신이 ${hope.theme}을(를) 갈망하면서도 동시에 ${fear.theme}을(를) 두려워하고 있음을 보여줍니다.`,
    integration: getIntegrationAdvice(hope, fear),
    unconsciousPattern: getUnconsciousPattern(card)
  };
}

// 최종 결과 종합 해석 (켈틱 크로스 10번 위치)
function getFinalOutcomeInterpretation(outcomeCard: CardInterpretation, allCards: CardInterpretation[]): any {
  const outcome = outcomeCard.card;
  const orientation = outcomeCard.orientation;
  
  // 전체 스프레드의 에너지 흐름 분석
  const energyFlow = analyzeEnergyFlow(allCards);
  const timeline = estimateTimeline(outcome, allCards);
  const keyLessons = extractKeyLessons(allCards);
  
  return {
    outcome: getOutcomeMeaning(outcome, orientation),
    probability: calculateOutcomeProbability(allCards),
    timeline: timeline,
    keyFactors: identifyKeyFactors(allCards),
    alternativePaths: getAlternativePaths(outcome, allCards),
    finalAdvice: generateFinalAdvice(outcome, orientation, allCards),
    spiritualMessage: getSpiritualMessage(outcome),
    nextSteps: getNextSteps(outcome, orientation)
  };
}

// 켈틱 크로스 전체 스토리 생성
function generateCelticCrossStory(cards: CardInterpretation[], interpretations: any): string {
  // 카드들의 주요 테마 추출
  const majorThemes = extractMajorThemes(cards);
  const elementalBalance = analyzeElementalBalance(cards);
  const numerologicalPattern = findNumerologicalPattern(cards);
  
  let story = `당신의 켈틱 크로스 리딩은 ${majorThemes.primary}의 여정을 보여주고 있습니다.\n\n`;
  
  // 시간의 흐름에 따른 스토리
  story += `과거에서 현재로: ${interpretations.position_3.basic}에서 시작하여, `;
  story += `${interpretations.position_4.basic}을 거쳐 현재 ${interpretations.position_1.basic}의 상황에 이르렀습니다.\n\n`;
  
  // 현재의 도전
  story += `현재 당신이 마주한 핵심 도전은 ${interpretations.position_2.challengeNature}. `;
  story += `이는 ${interpretations.position_2.interaction}\n\n`;
  
  // 미래의 가능성
  story += `앞으로의 전개: ${interpretations.position_6.basic}이 곧 일어날 것이며, `;
  story += `이는 ${interpretations.position_5.basic}으로 이어질 가능성이 있습니다.\n\n`;
  
  // 내적/외적 영향
  story += `당신의 내면: ${interpretations.position_7.basic} 이러한 접근은 `;
  story += `${interpretations.position_9.balance}\n\n`;
  
  story += `외부 환경: ${interpretations.position_8.basic} 이는 당신의 여정에 중요한 영향을 미칩니다.\n\n`;
  
  // 최종 메시지
  story += `결론: ${interpretations.position_10.outcome} `;
  story += `${interpretations.position_10.finalAdvice}\n\n`;
  
  // 원소 균형과 조언
  if (elementalBalance.imbalance) {
    story += `💫 원소 균형: ${elementalBalance.message}\n`;
  }
  
  // 수비학적 메시지
  if (numerologicalPattern.pattern) {
    story += `🔢 수비학적 통찰: ${numerologicalPattern.message}\n`;
  }
  
  return story;
}

// 세븐 스타 별자리 연결 해석
function generateConstellationReading(cards: CardInterpretation[]): string {
  const starEnergies = cards.map(c => getStarEnergy(c.card));
  const dominantElement = findDominantElement(starEnergies);
  const cosmicMessage = generateCosmicMessage(cards);
  
  let reading = `✨ 7개의 별이 그리는 당신의 운명:\n\n`;
  
  // 각 별의 메시지
  reading += `첫 번째 별 (과거): ${starEnergies[0].message}\n`;
  reading += `두 번째 별 (현재): ${starEnergies[1].message}\n`;
  reading += `세 번째 별 (숨은 힘): ${starEnergies[2].message}\n`;
  reading += `네 번째 별 (의식): ${starEnergies[3].message}\n`;
  reading += `다섯 번째 별 (무의식): ${starEnergies[4].message}\n`;
  reading += `여섯 번째 별 (지혜): ${starEnergies[5].message}\n`;
  reading += `일곱 번째 별 (운명): ${starEnergies[6].message}\n\n`;
  
  reading += `🌌 우주의 메시지: ${cosmicMessage}\n`;
  reading += `⭐ 지배적인 에너지: ${dominantElement.description}\n`;
  
  return reading;
}

// 사랑의 조화도 분석
function analyzeLoveHarmony(cards: CardInterpretation[]): any {
  const yourEnergy = getEmotionalEnergy(cards[0]);
  const partnerEnergy = getEmotionalEnergy(cards[1]);
  const compatibility = calculateCompatibility(yourEnergy, partnerEnergy);
  
  const foundation = analyzeFoundationStrength(cards[2]);
  const communication = analyzeCommunicationQuality(cards[3]);
  const intimacy = analyzeIntimacyLevel(cards[4]);
  const obstacles = analyzeObstacleImpact(cards[5]);
  
  return {
    overallHarmony: calculateOverallHarmony(compatibility, foundation, communication, intimacy, obstacles),
    yourEnergy,
    partnerEnergy,
    compatibility,
    strengths: identifyRelationshipStrengths(cards),
    challenges: identifyRelationshipChallenges(cards),
    growthAreas: identifyGrowthAreas(cards),
    soulConnection: analyzeSoulConnection(cards),
    karmicLessons: identifyKarmicLessons(cards)
  };
}

// 보조 함수들...
function getBasicMeaning(card: any, orientation: string, topic: string): string {
  // card 객체가 중첩되어 있을 수 있음
  const cardObj = card.card || card;
  
  // Supabase의 meanings 데이터 활용
  if (cardObj.meanings) {
    if (cardObj.meanings[topic] && cardObj.meanings[topic][orientation]) {
      return cardObj.meanings[topic][orientation];
    }
    if (cardObj.meanings.general && cardObj.meanings.general[orientation]) {
      return cardObj.meanings.general[orientation];
    }
  }
  
  // 기본 메시지
  const cardName = cardObj.nameKr || cardObj.name_kr || cardObj.name || '알 수 없는 카드';
  return `${cardName} 카드가 ${orientation === 'upright' ? '정방향' : '역방향'}으로 나타났습니다.`;
}

function getDeeperMeaning(card: any, orientation: string, positionType: string): string {
  // 포지션과 카드의 깊은 의미 조합
  const deeperMeanings = {
    'present_situation': {
      'major': `이 메이저 아르카나는 당신의 현재 삶에서 중요한 영적 교훈을 나타냅니다.`,
      'cups': `감정과 관계의 영역에서 중요한 변화가 일어나고 있습니다.`,
      'wands': `창조적 에너지와 열정이 당신의 현재를 지배하고 있습니다.`,
      'swords': `생각과 소통의 영역에서 명확성이 필요한 시기입니다.`,
      'pentacles': `물질적, 실질적인 문제들이 당신의 주요 관심사입니다.`
    }
  };
  
  const suit = card.suit || 'major';
  return deeperMeanings[positionType]?.[suit] || '더 깊은 통찰이 필요합니다.';
}

function getShadowAspect(card: any, orientation: string): string {
  // 카드의 그림자 측면
  if (orientation === 'reversed') {
    return `이 카드의 그림자는 ${card.nameKr}의 에너지가 차단되거나 왜곡되어 나타나고 있음을 시사합니다.`;
  }
  return `빛이 있는 곳에 그림자도 있듯이, 이 카드는 숨겨진 잠재력도 함께 보여줍니다.`;
}

function getPositionAdvice(card: any, orientation: string, positionType: string): string {
  // 포지션별 구체적 조언
  const advice = {
    'present_situation': '현재 상황을 있는 그대로 받아들이고, 여기서 배울 수 있는 교훈을 찾으세요.',
    'distant_past': '과거의 경험이 현재에 미치는 영향을 인식하고, 필요하다면 화해하세요.',
    'recent_past': '최근의 사건들이 주는 메시지를 이해하고, 그것을 성장의 발판으로 삼으세요.',
    'possible_future': '이 가능성을 현실로 만들기 위해 지금 할 수 있는 일을 시작하세요.',
    'immediate_future': '곧 다가올 변화에 대비하고, 열린 마음으로 받아들일 준비를 하세요.',
    'your_approach': '당신의 태도와 접근방식이 결과를 좌우합니다. 필요하다면 관점을 바꿔보세요.',
    'external_influences': '외부 영향을 무시하지 말되, 그것에 휘둘리지도 마세요.',
    'hopes_fears': '희망과 두려움 사이에서 균형을 찾고, 둘 다를 성장의 원동력으로 삼으세요.',
    'final_outcome': '이 결과를 향해 나아가되, 여정 자체에서도 의미를 찾으세요.'
  };
  
  return advice[positionType] || '이 카드가 주는 지혜를 일상에 적용해보세요.';
}

// 추가 신비학적 해석들
function getTimingIndication(card: any): string {
  // 카드별 시기 예측
  const timings = {
    'Ace': '새로운 시작, 1-3일 이내',
    'Two': '결정의 시기, 2주 이내',
    'Three': '성장기, 3주-3개월',
    'Four': '안정기, 4주-4개월',
    'Five': '도전기, 5일-5주',
    'Six': '조화기, 6주-6개월',
    'Seven': '내적 탐구기, 7일-7주',
    'Eight': '변화기, 8주 전후',
    'Nine': '완성 직전, 9일-9주',
    'Ten': '완성과 새로운 시작, 10주-10개월',
    'Page': '메시지나 소식, 며칠 이내',
    'Knight': '빠른 움직임, 2-4주',
    'Queen': '성숙한 발전, 3-6개월',
    'King': '완전한 실현, 6개월-1년'
  };
  
  // 메이저 아르카나는 더 긴 주기
  if (card.arcana === 'major') {
    return '중요한 인생의 전환기, 수개월에서 수년에 걸친 변화';
  }
  
  const cardName = card.name.split(' ')[0];
  return timings[cardName] || '시간은 당신의 준비 상태에 따라 결정됩니다';
}

function getKeySymbols(card: any): string[] {
  // 카드의 주요 상징들
  const symbols = [];
  
  if (card.arcana === 'major') {
    // 메이저 아르카나별 주요 상징
    const majorSymbols = {
      0: ['무한의 가능성', '순수함', '새로운 시작'],
      1: ['의지력', '창조', '현현'],
      2: ['직관', '신비', '잠재의식'],
      3: ['풍요', '창조성', '모성'],
      4: ['구조', '권위', '안정'],
      5: ['전통', '영적 지혜', '가르침'],
      6: ['선택', '관계', '조화'],
      7: ['의지', '승리', '전진'],
      8: ['내적 힘', '용기', '인내'],
      9: ['내적 탐구', '지혜', '고독'],
      10: ['운명의 순환', '변화', '기회'],
      // ... 더 많은 메이저 아르카나 상징들
    };
    
    symbols.push(...(majorSymbols[card.number] || []));
  } else {
    // 마이너 아르카나 수트별 상징
    const suitSymbols = {
      'cups': ['감정', '직관', '관계'],
      'wands': ['열정', '창조성', '행동'],
      'swords': ['생각', '소통', '도전'],
      'pentacles': ['물질', '실현', '안정']
    };
    
    symbols.push(...(suitSymbols[card.suit] || []));
  }
  
  return symbols;
}

function getNumerologicalMeaning(card: any): string {
  if (card.number === undefined || card.number === null) return '';
  
  const numerology = {
    0: '무한의 잠재력과 시작',
    1: '새로운 시작, 독립, 리더십',
    2: '균형, 파트너십, 선택',
    3: '창조성, 표현, 성장',
    4: '안정, 구조, 실용성',
    5: '변화, 자유, 모험',
    6: '조화, 책임, 사랑',
    7: '영성, 내적 지혜, 분석',
    8: '물질적 성공, 균형, 카르마',
    9: '완성, 지혜, 인도주의',
    10: '완성과 새로운 시작의 순환',
    11: '직관, 영적 통찰, 마스터 넘버',
    12: '희생, 새로운 관점, 영적 성장',
    13: '변환, 재생, 해방',
    14: '절제, 균형, 통합',
    15: '물질적 속박, 그림자 작업',
    16: '급작스러운 변화, 계시, 해방',
    17: '희망, 영감, 영적 인도',
    18: '환상, 직관, 무의식',
    19: '성공, 기쁨, 깨달음',
    20: '심판, 부활, 각성',
    21: '완성, 통합, 새로운 차원'
  };
  
  return numerology[card.number] || `숫자 ${card.number}의 에너지`;
}

function getElementalInfluence(card: any): string {
  const elements = {
    'cups': '물 - 감정, 직관, 흐름, 정화',
    'wands': '불 - 열정, 영감, 변화, 정화',
    'swords': '공기 - 생각, 소통, 명확성, 움직임',
    'pentacles': '땅 - 안정, 실현, 풍요, 기반'
  };
  
  if (card.suit) {
    return elements[card.suit] || '';
  }
  
  // 메이저 아르카나의 원소 연결
  if (card.arcana === 'major') {
    // 점성술적 연결을 통한 원소 배정
    const majorElements = {
      0: '공기 - 무한한 가능성',
      1: '모든 원소의 마스터',
      2: '물 - 직관과 신비',
      3: '땅 - 풍요와 창조',
      4: '불 - 권위와 행동',
      // ... 더 많은 메이저 아르카나 원소
    };
    
    return majorElements[card.number] || '영적 원소';
  }
  
  return '';
}

function getChakraAssociation(card: any): string {
  // 카드와 차크라 연결
  const chakras = {
    'cups': {
      'Ace': '하트 차크라 - 사랑과 연민',
      'Two': '하트 차크라 - 관계와 조화',
      'Three': '천골 차크라 - 기쁨과 창조성',
      // ... 더 많은 컵스 카드
    },
    'wands': {
      'Ace': '태양신경총 차크라 - 의지력과 열정',
      'Two': '루트 차크라 - 기반과 안정',
      // ... 더 많은 완드 카드
    },
    'swords': {
      'Ace': '목 차크라 - 진실과 소통',
      'Two': '제3의 눈 차크라 - 직관과 통찰',
      // ... 더 많은 소드 카드
    },
    'pentacles': {
      'Ace': '루트 차크라 - 물질적 안정',
      'Two': '천골 차크라 - 균형과 흐름',
      // ... 더 많은 펜타클 카드
    }
  };
  
  // 메이저 아르카나 차크라
  const majorChakras = {
    0: '크라운 차크라 - 무한한 가능성',
    1: '모든 차크라 - 전체적 조화',
    2: '제3의 눈 차크라 - 직관과 지혜',
    3: '하트 차크라 - 사랑과 풍요',
    4: '루트 차크라 - 구조와 안정',
    5: '목 차크라 - 영적 가르침',
    6: '하트 차크라 - 사랑의 선택',
    7: '태양신경총 차크라 - 의지와 전진',
    8: '하트 차크라 - 내적 힘과 용기',
    9: '제3의 눈 차크라 - 내적 지혜',
    10: '모든 차크라 - 운명의 순환',
    // ... 더 많은 메이저 아르카나
  };
  
  if (card.arcana === 'major') {
    return majorChakras[card.number] || '크라운 차크라 - 영적 연결';
  }
  
  const cardRank = card.name.split(' ')[0];
  return chakras[card.suit]?.[cardRank] || '에너지 센터 활성화';
}

function getCrystalRecommendations(card: any): string[] {
  // 카드에 따른 크리스탈 추천
  const crystals = {
    'cups': ['로즈쿼츠', '문스톤', '아쿠아마린'],
    'wands': ['카넬리안', '시트린', '파이어 아게이트'],
    'swords': ['투명 수정', '라피스라줄리', '플루오라이트'],
    'pentacles': ['타이거아이', '말라카이트', '헤마타이트']
  };
  
  const majorCrystals = {
    0: ['투명 수정', '셀레나이트'],
    1: ['시트린', '파이라이트'],
    2: ['문스톤', '라브라도라이트'],
    3: ['로즈쿼츠', '에메랄드'],
    4: ['레드 자스퍼', '가넷'],
    // ... 더 많은 메이저 아르카나
  };
  
  if (card.arcana === 'major') {
    return majorCrystals[card.number] || ['자수정', '투명 수정'];
  }
  
  return crystals[card.suit] || ['투명 수정'];
}

function getAffirmation(card: any, orientation: string): string {
  // 카드별 확언
  const baseAffirmation = `나는 ${card.nameKr}의 지혜를 받아들입니다.`;
  
  if (orientation === 'upright') {
    return `${baseAffirmation} 이 에너지가 나를 통해 자연스럽게 흐릅니다.`;
  } else {
    return `${baseAffirmation} 나는 이 에너지의 균형을 회복합니다.`;
  }
}

// 보조 함수들 계속...
function extractMajorThemes(cards: CardInterpretation[]): any {
  const themes = [];
  let majorArcanaCount = 0;
  const suitCounts = { cups: 0, wands: 0, swords: 0, pentacles: 0 };
  
  cards.forEach(({ card }) => {
    if (card.arcana === 'major') {
      majorArcanaCount++;
      themes.push(getMajorArcanaTheme(card));
    } else {
      suitCounts[card.suit]++;
    }
  });
  
  const dominantSuit = Object.entries(suitCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  return {
    primary: majorArcanaCount > 3 ? '중대한 영적 전환' : getSuitTheme(dominantSuit[0]),
    secondary: themes,
    balance: analyzeThemeBalance(suitCounts, majorArcanaCount)
  };
}

function getMajorArcanaTheme(card: any): string {
  const themes = {
    0: '새로운 시작과 무한한 가능성',
    1: '의지력과 현현의 힘',
    2: '직관과 숨겨진 지식',
    3: '창조성과 풍요',
    4: '구조와 권위',
    5: '영적 지혜와 전통',
    6: '사랑과 선택',
    7: '의지와 승리',
    8: '내적 힘과 용기',
    9: '지혜와 고독',
    10: '운명과 변화',
    11: '균형과 정의',
    12: '희생과 새로운 관점',
    13: '변환과 재생',
    14: '절제와 조화',
    15: '그림자와 속박',
    16: '파괴와 재건',
    17: '희망과 영감',
    18: '환상과 직관',
    19: '성공과 기쁨',
    20: '재생과 심판',
    21: '완성과 통합'
  };
  
  return themes[card.number] || '영적 여정';
}

function getSuitTheme(suit: string): string {
  const themes = {
    'cups': '감정과 관계의 여정',
    'wands': '열정과 창조의 여정',
    'swords': '지성과 소통의 여정',
    'pentacles': '물질과 성취의 여정'
  };
  
  return themes[suit] || '삶의 여정';
}

function analyzeElementalBalance(cards: CardInterpretation[]): any {
  const elements = { water: 0, fire: 0, air: 0, earth: 0 };
  
  cards.forEach(({ card }) => {
    if (card.suit) {
      const suitElements = {
        'cups': 'water',
        'wands': 'fire',
        'swords': 'air',
        'pentacles': 'earth'
      };
      elements[suitElements[card.suit]]++;
    }
  });
  
  const dominant = Object.entries(elements)
    .sort(([,a], [,b]) => b - a)[0];
  const missing = Object.entries(elements)
    .filter(([,count]) => count === 0)
    .map(([element]) => element);
  
  return {
    dominant: dominant[0],
    missing: missing,
    imbalance: missing.length > 0,
    message: generateElementalMessage(elements)
  };
}

function generateElementalMessage(elements: any): string {
  const total = Object.values(elements).reduce((a: number, b: number) => a + b, 0);
  
  if (elements.water > total / 2) {
    return '감정의 물결이 강하게 흐르고 있습니다. 직관을 신뢰하되 논리적 사고도 균형있게 활용하세요.';
  }
  if (elements.fire > total / 2) {
    return '열정의 불꽃이 타오르고 있습니다. 이 에너지를 건설적으로 활용하되 때로는 휴식도 필요합니다.';
  }
  if (elements.air > total / 2) {
    return '명확한 사고와 소통이 중요한 시기입니다. 머리와 가슴의 균형을 유지하세요.';
  }
  if (elements.earth > total / 2) {
    return '실질적인 성과와 안정이 강조됩니다. 꿈을 현실로 만들되 유연성도 잃지 마세요.';
  }
  
  return '네 원소가 조화롭게 균형을 이루고 있습니다.';
}

// 더 많은 보조 함수들...
function getChallengeName(card: any): string {
  return `${card.nameKr}`;
}

function analyzeCardInteraction(situation: any, challenge: any): string {
  // 두 카드의 수트, 숫자, 원소 등을 비교하여 상호작용 분석
  if (situation.suit === challenge.suit) {
    return '같은 영역 내에서의 내적 갈등을 나타냅니다.';
  }
  
  const elementInteraction = getElementInteraction(situation.suit, challenge.suit);
  return elementInteraction;
}

function getElementInteraction(suit1: string, suit2: string): string {
  const interactions = {
    'cups-wands': '감정과 열정 사이의 갈등 - 마음과 욕망의 조화가 필요합니다.',
    'cups-swords': '감정과 논리 사이의 갈등 - 머리와 가슴의 균형을 찾으세요.',
    'cups-pentacles': '감정과 현실 사이의 갈등 - 이상과 실용성을 조화시키세요.',
    'wands-swords': '행동과 계획 사이의 갈등 - 열정과 전략의 균형이 필요합니다.',
    'wands-pentacles': '열정과 안정 사이의 갈등 - 모험과 보수의 중도를 찾으세요.',
    'swords-pentacles': '아이디어와 실행 사이의 갈등 - 계획을 현실로 만드는 방법을 찾으세요.'
  };
  
  const key = [suit1, suit2].sort().join('-');
  return interactions[key] || '서로 다른 에너지가 만나 새로운 가능성을 창출합니다.';
}

// 켈틱 크로스 특별 통찰
function getCelticCrossInsights(cards: CardInterpretation[]): any {
  return {
    soulLesson: identifySoulLesson(cards),
    karmicDebt: identifyKarmicDebt(cards),
    spiritualGifts: identifySpiritualGifts(cards),
    shadowWork: identifyShadowWork(cards),
    timeline: estimateOverallTimeline(cards),
    actionSteps: generateActionSteps(cards)
  };
}

// 우주적 지침 (세븐 스타)
function getCosmicGuidance(cards: CardInterpretation[]): any {
  return {
    stellarAlignment: analyzeStarAlignment(cards),
    cosmicTiming: determineCosmicTiming(cards),
    universalMessage: extractUniversalMessage(cards),
    starSeedActivation: checkStarSeedActivation(cards),
    dimensionalShift: analyzeDimensionalShift(cards)
  };
}

// 관계 조언 (컵 오브 릴레이션십)
function getRelationshipAdvice(cards: CardInterpretation[]): any {
  return {
    communicationTips: generateCommunicationTips(cards),
    intimacyGuidance: generateIntimacyGuidance(cards),
    conflictResolution: generateConflictResolution(cards),
    growthOpportunities: identifyGrowthOpportunities(cards),
    soulContractInsights: analyzeSoulContract(cards),
    healingRecommendations: generateHealingRecommendations(cards)
  };
}

// Export 추가 함수들
export function generatePremiumInsights(spread: string, cards: any[], topic: string): any {
  const cardInterpretations = cards.map((card, index) => ({
    card: card.card,
    position: card.position,
    orientation: card.orientation,
    spread: spread,
    topic: topic
  }));
  
  switch(spread) {
    case 'celtic_cross':
      return getCelticCrossInterpretation(cardInterpretations);
    case 'seven_star':
      return getSevenStarInterpretation(cardInterpretations);
    case 'cup_of_relationship':
      return getCupOfRelationshipInterpretation(cardInterpretations);
    default:
      return {
        message: '이 스프레드에 대한 특별한 해석을 준비중입니다.'
      };
  }
}

// 메인 해석 생성 함수
export function generateEnhancedInterpretation(
  cards: any[],
  spread: any,
  topic: string,
  isPremium: boolean
): any {
  // 1장/3장 배열의 경우 기본 해석 생성
  if (spread.spreadId === 'one_card' || spread.spreadId === 'three_card_timeline') {
    return {
      overallMessage: generateBasicOverallMessage(cards, topic),
      cards: cards.map((card, index) => {
        const cardObj = card.card || card;
        const meaning = cardObj.meanings?.[topic]?.[card.orientation] || 
                       cardObj.meanings?.general?.[card.orientation] ||
                       `${cardObj.nameKr || cardObj.name} 카드의 해석입니다.`;
        
        return {
          ...card,
          interpretation: {
            basic: meaning,
            advice: generatePositionAdvice(card, spread.spreadId, index),
            keywords: cardObj.keywords?.[card.orientation] || []
          }
        };
      })
    };
  }
  
  if (!isPremium) {
    // 무료 사용자를 위한 기본 해석
    return {
      overallMessage: generateBasicOverallMessage(cards, topic),
      cards: cards.map(card => ({
        ...card,
        interpretation: {
          basic: getBasicMeaning(card.card || card, card.orientation, topic)
        }
      }))
    };
  }
  
  // 프리미엄 사용자를 위한 고급 해석
  const premiumInsights = generatePremiumInsights(spread.spreadId, cards, topic);
  
  return {
    overallMessage: premiumInsights.overallStory || premiumInsights.constellationReading || premiumInsights.loveHarmony.overallHarmony,
    cards: cards.map((card, index) => ({
      ...card,
      interpretation: {
        basic: getBasicMeaning(card.card, card.orientation, topic),
        deeper: premiumInsights.interpretations[`position_${index + 1}`] || 
                premiumInsights.interpretations[`star_${index + 1}`] || 
                premiumInsights.interpretations[`cup_${index + 1}`],
        premium: true
      }
    })),
    premiumInsights: premiumInsights.specialInsights || 
                     premiumInsights.cosmicGuidance || 
                     premiumInsights.relationshipAdvice,
    isPremium: true
  };
}

function generateBasicOverallMessage(cards: any[], topic: string): string {
  const topicMessages = {
    'general': '당신의 카드는 삶의 여정에서 중요한 메시지를 전하고 있습니다.',
    'love': '사랑과 관계에 대한 우주의 메시지가 펼쳐집니다.',
    'career': '당신의 직업적 여정에 대한 통찰이 드러납니다.',
    'money': '풍요와 번영에 대한 길이 보입니다.',
    'health': '건강과 웰빙에 대한 지혜가 나타납니다.'
  };
  
  return topicMessages[topic] || topicMessages.general;
}

// 1장/3장 배열을 위한 포지션별 조언 생성
function generatePositionAdvice(card: any, spreadId: string, index: number): string {
  const cardObj = card.card || card;
  const orientation = card.orientation || 'upright';
  
  if (spreadId === 'one_card') {
    return orientation === 'upright' 
      ? '이 카드의 긍정적인 에너지를 활용하여 상황을 개선할 수 있습니다.' 
      : '내면의 균형을 찾고 장애물을 극복해야 할 시기입니다.';
  }
  
  if (spreadId === 'three_card_timeline') {
    const positions = ['과거', '현재', '미래'];
    const position = positions[index] || '';
    
    if (position === '과거') {
      return '과거의 경험이 현재에 미치는 영향을 인식하고, 필요하다면 화해하세요.';
    } else if (position === '현재') {
      return '현재 상황을 있는 그대로 받아들이고, 여기서 배울 수 있는 교훈을 찾으세요.';
    } else if (position === '미래') {
      return orientation === 'upright'
        ? '긍정적인 결과를 향해 나아가고 있습니다. 현재의 접근 방식을 유지하세요.'
        : '예상과 다른 결과가 나올 수 있지만, 이 또한 성장의 기회가 될 것입니다.';
    }
  }
  
  return '이 카드가 주는 지혜를 일상에 적용해보세요.';
}

// 더미 구현들 (실제로는 더 복잡한 로직 필요)
function identifyConflictType(situation: any, challenge: any): string {
  return '내적 갈등과 외적 도전이 교차하는 지점';
}

function suggestResolution(challenge: any, orientation: string): string {
  return orientation === 'upright' 
    ? '이 도전을 정면으로 마주하고 그 안의 교훈을 찾으세요.'
    : '다른 관점에서 이 상황을 바라보고 숨겨진 기회를 발견하세요.';
}

function getHiddenOpportunity(challenge: any): string {
  return '모든 도전 속에는 성장의 씨앗이 숨어 있습니다.';
}

function getTransformationPath(challenge: any, orientation: string): string {
  return '이 경험을 통해 더 높은 차원의 이해에 도달할 수 있습니다.';
}

// ... 나머지 모든 더미 함수들도 실제 구현 필요

export default {
  generateEnhancedInterpretation,
  generatePremiumInsights,
  CelticCrossInterpreter
};
