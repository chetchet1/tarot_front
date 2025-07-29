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

// 켈틱 크로스 특별 해석
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
  // Supabase의 meanings 데이터 활용
  if (card.meanings && card.meanings[topic]) {
    return card.meanings[topic][orientation] || card.meanings.general[orientation];
  }
  return `${card.nameKr}의 기본적인 의미`;
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
  if (!isPremium) {
    // 무료 사용자를 위한 기본 해석
    return {
      overallMessage: generateBasicOverallMessage(cards, topic),
      cards: cards.map(card => ({
        ...card,
        interpretation: {
          basic: getBasicMeaning(card.card, card.orientation, topic)
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
  generatePremiumInsights
};
