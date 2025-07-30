// AI 기반 해석 확장 서비스
import { DrawnCard, TarotSpread } from '../../models/tarot';

interface InterpretationContext {
  cards: DrawnCard[];
  spread: TarotSpread;
  topic: string;
  question?: string;
  userProfile?: any;
}

export class AIInterpretationEnhancer {
  // 해석의 깊이를 더하는 다층적 분석
  static async generateDeepInterpretation(context: InterpretationContext): Promise<any> {
    const layers = {
      surface: this.getSurfaceReading(context),
      psychological: this.getPsychologicalReading(context),
      spiritual: this.getSpiritualReading(context),
      practical: this.getPracticalReading(context),
      shadow: this.getShadowReading(context),
      potential: this.getPotentialReading(context)
    };

    return {
      layers,
      synthesis: this.synthesizeLayers(layers),
      keyInsights: this.extractKeyInsights(context),
      actionPlan: this.createActionPlan(context),
      affirmations: this.generateAffirmations(context),
      journalPrompts: this.createJournalPrompts(context)
    };
  }

  // 표면적 해석
  private static getSurfaceReading(context: InterpretationContext): string {
    const { cards, topic } = context;
    let reading = `현재 상황에 대한 기본 해석:\n\n`;

    cards.forEach((card, index) => {
      const position = context.spread.positions[index];
      reading += `${position.name}: ${card.nameKr} (${card.orientation === 'upright' ? '정방향' : '역방향'})\n`;
      reading += `${card.meanings[topic]?.[card.orientation] || card.meanings.general[card.orientation]}\n\n`;
    });

    return reading;
  }

  // 심리적 해석
  private static getPsychologicalReading(context: InterpretationContext): any {
    const { cards } = context;
    
    const psychological = {
      consciousPatterns: [],
      unconsciousPatterns: [],
      defenseMechanisms: [],
      growthOpportunities: [],
      emotionalThemes: []
    };

    // 의식적 패턴 분석
    const consciousCards = cards.filter((_, index) => 
      context.spread.positions[index].name.includes('의식') || 
      context.spread.positions[index].name.includes('접근')
    );
    
    consciousCards.forEach(card => {
      if (card.suit === 'swords') {
        psychological.consciousPatterns.push('논리적이고 분석적인 접근');
      } else if (card.suit === 'wands') {
        psychological.consciousPatterns.push('적극적이고 행동 지향적인 태도');
      }
    });

    // 무의식적 패턴 분석
    const unconsciousCards = cards.filter((_, index) => 
      context.spread.positions[index].name.includes('무의식') || 
      context.spread.positions[index].name.includes('숨겨진')
    );

    unconsciousCards.forEach(card => {
      if (card.orientation === 'reversed') {
        psychological.unconsciousPatterns.push(`${card.nameKr}의 억압된 에너지`);
      }
    });

    // 방어기제 식별
    const reversedCards = cards.filter(c => c.orientation === 'reversed');
    if (reversedCards.length > cards.length / 2) {
      psychological.defenseMechanisms.push('회피', '부정', '투사');
    }

    // 성장 기회
    cards.forEach(card => {
      if (card.arcana === 'major') {
        psychological.growthOpportunities.push(`${card.nameKr}를 통한 영적 성장`);
      }
    });

    // 감정적 주제
    const cupsCards = cards.filter(c => c.suit === 'cups');
    if (cupsCards.length > 0) {
      psychological.emotionalThemes.push('감정적 치유와 연결');
    }

    return psychological;
  }

  // 영적 해석
  private static getSpiritualReading(context: InterpretationContext): any {
    const { cards } = context;
    
    const spiritual = {
      soulLessons: [],
      karmicPatterns: [],
      spiritualGifts: [],
      chakraActivations: [],
      divineGuidance: ''
    };

    // 영혼의 교훈
    const majorCards = cards.filter(c => c.arcana === 'major');
    majorCards.forEach(card => {
      const lessons = {
        0: '순수한 신뢰와 새로운 시작의 교훈',
        1: '의지력과 현현의 마법',
        2: '직관과 내면의 지혜',
        3: '창조와 풍요의 어머니 에너지',
        4: '구조와 권위의 균형',
        5: '전통과 영적 가르침',
        6: '사랑과 선택의 신성함',
        7: '의지와 전진의 힘',
        8: '내적 힘과 부드러운 통제',
        9: '고독과 내면의 빛',
        10: '운명의 순환과 카르마',
        11: '정의와 균형의 법칙',
        12: '희생과 새로운 관점',
        13: '변환과 재생의 신비',
        14: '절제와 연금술적 변화',
        15: '그림자와 물질적 속박',
        16: '파괴와 깨달음',
        17: '희망과 영적 인도',
        18: '환상과 직관의 미로',
        19: '태양의 축복과 성공',
        20: '심판과 부활',
        21: '완성과 새로운 차원'
      };
      
      spiritual.soulLessons.push(lessons[card.number] || '깊은 영적 교훈');
    });

    // 카르마 패턴
    if (cards.some(c => c.name === 'Justice') || cards.some(c => c.name === 'The Wheel of Fortune')) {
      spiritual.karmicPatterns.push('인과응보의 법칙이 작동하고 있습니다');
    }

    // 영적 재능
    cards.forEach(card => {
      if (card.name === 'The High Priestess') {
        spiritual.spiritualGifts.push('직관력과 영적 지각력');
      } else if (card.name === 'The Hermit') {
        spiritual.spiritualGifts.push('내면의 지혜와 영적 안내');
      }
    });

    // 차크라 활성화
    spiritual.chakraActivations = this.identifyChakraActivations(cards);

    // 신성한 안내
    spiritual.divineGuidance = '우주는 당신이 준비된 만큼의 깨달음을 허락합니다.';

    return spiritual;
  }

  // 실용적 해석
  private static getPracticalReading(context: InterpretationContext): any {
    const { cards, topic } = context;
    
    const practical = {
      immediateActions: [],
      shortTermGoals: [],
      longTermStrategies: [],
      resourcesNeeded: [],
      potentialObstacles: [],
      successIndicators: []
    };

    // 즉각적인 행동
    const actionCards = cards.filter(c => c.suit === 'wands' || c.name.includes('Ace'));
    actionCards.forEach(card => {
      if (card.orientation === 'upright') {
        practical.immediateActions.push('적극적으로 새로운 기회를 탐색하세요');
      }
    });

    // 단기 목표
    const nearFutureCards = cards.filter((_, index) => 
      context.spread.positions[index].name.includes('가까운') || 
      context.spread.positions[index].name.includes('단기')
    );
    
    nearFutureCards.forEach(card => {
      practical.shortTermGoals.push(`${card.nameKr}의 에너지를 활용한 3개월 계획`);
    });

    // 장기 전략
    const outcomeCards = cards.filter((_, index) => 
      context.spread.positions[index].name.includes('결과') || 
      context.spread.positions[index].name.includes('최종')
    );
    
    outcomeCards.forEach(card => {
      practical.longTermStrategies.push(`${card.nameKr}를 향한 1년 로드맵`);
    });

    // 필요한 자원
    const pentaclesCards = cards.filter(c => c.suit === 'pentacles');
    if (pentaclesCards.length > 0) {
      practical.resourcesNeeded.push('재정적 준비', '실용적 기술', '안정적 기반');
    }

    // 잠재적 장애물
    const reversedCards = cards.filter(c => c.orientation === 'reversed');
    reversedCards.forEach(card => {
      practical.potentialObstacles.push(`${card.nameKr}의 역방향이 나타내는 도전`);
    });

    // 성공 지표
    practical.successIndicators = this.defineSuccessIndicators(context);

    return practical;
  }

  // 그림자 작업 해석
  private static getShadowReading(context: InterpretationContext): any {
    const { cards } = context;
    
    const shadow = {
      hiddenAspects: [],
      projections: [],
      repressedQualities: [],
      integrationPath: [],
      healingInsights: []
    };

    // 숨겨진 측면
    const reversedCards = cards.filter(c => c.orientation === 'reversed');
    reversedCards.forEach(card => {
      shadow.hiddenAspects.push({
        card: card.nameKr,
        aspect: `억압된 ${card.keywords.upright[0]} 에너지`,
        message: '이 특질을 인정하고 통합할 때입니다'
      });
    });

    // 투사
    if (cards.some(c => c.name === 'The Devil')) {
      shadow.projections.push('외부에 투사하던 그림자를 내면에서 발견하세요');
    }

    // 억압된 특질
    cards.forEach(card => {
      if (card.orientation === 'reversed' && card.arcana === 'major') {
        shadow.repressedQualities.push({
          quality: card.keywords.upright[0],
          reason: '과거의 상처나 두려움',
          healing: '자비로운 자기 수용'
        });
      }
    });

    // 통합의 길
    shadow.integrationPath = [
      '그림자 인식하기',
      '감정적 반응 관찰하기',
      '투사 거두어들이기',
      '억압된 부분 포용하기',
      '전체성 회복하기'
    ];

    // 치유 통찰
    shadow.healingInsights = this.generateHealingInsights(cards);

    return shadow;
  }

  // 잠재력 해석
  private static getPotentialReading(context: InterpretationContext): any {
    const { cards } = context;
    
    const potential = {
      hiddenTalents: [],
      futureOpportunities: [],
      growthAreas: [],
      manifestationPower: '',
      highestPotential: ''
    };

    // 숨겨진 재능
    cards.forEach(card => {
      if (card.arcana === 'major' && card.orientation === 'upright') {
        const talents = {
          'The Magician': '현실 창조의 재능',
          'The High Priestess': '직관적 지혜',
          'The Empress': '창조와 양육의 재능',
          'The Star': '영감과 치유의 재능',
          'The Sun': '리더십과 긍정의 힘'
        };
        
        if (talents[card.name]) {
          potential.hiddenTalents.push(talents[card.name]);
        }
      }
    });

    // 미래 기회
    const futurePositions = cards.filter((_, index) => 
      context.spread.positions[index].name.includes('미래')
    );
    
    futurePositions.forEach(card => {
      if (card.orientation === 'upright') {
        potential.futureOpportunities.push(`${card.nameKr}가 가져올 새로운 가능성`);
      }
    });

    // 성장 영역
    potential.growthAreas = this.identifyGrowthAreas(cards);

    // 현현의 힘
    const aceCount = cards.filter(c => c.name.includes('Ace')).length;
    if (aceCount > 0) {
      potential.manifestationPower = `${aceCount}개의 에이스가 나타내는 강력한 시작의 에너지`;
    }

    // 최고 잠재력
    potential.highestPotential = this.defineHighestPotential(context);

    return potential;
  }

  // 레이어 통합
  private static synthesizeLayers(layers: any): string {
    let synthesis = '종합적 통찰:\n\n';
    
    synthesis += '이 리딩은 여러 차원에서 당신에게 메시지를 전합니다. ';
    synthesis += '표면적으로는 현실적인 상황을 다루고 있지만, ';
    synthesis += '더 깊은 차원에서는 영적 성장과 심리적 변화를 암시합니다.\n\n';
    
    synthesis += '특히 주목할 점은:\n';
    
    if (layers.psychological.unconsciousPatterns.length > 0) {
      synthesis += `- 무의식적 패턴: ${layers.psychological.unconsciousPatterns.join(', ')}\n`;
    }
    
    if (layers.spiritual.soulLessons.length > 0) {
      synthesis += `- 영혼의 교훈: ${layers.spiritual.soulLessons[0]}\n`;
    }
    
    if (layers.shadow.hiddenAspects.length > 0) {
      synthesis += `- 그림자 작업: ${layers.shadow.hiddenAspects[0].message}\n`;
    }
    
    synthesis += '\n이 모든 차원을 통합할 때, 진정한 변화가 일어납니다.';
    
    return synthesis;
  }

  // 핵심 통찰 추출
  private static extractKeyInsights(context: InterpretationContext): string[] {
    const insights = [];
    const { cards } = context;
    
    // 메이저 아르카나 통찰
    const majorCount = cards.filter(c => c.arcana === 'major').length;
    if (majorCount >= 3) {
      insights.push('🌟 중대한 인생의 전환점에 있습니다');
    }
    
    // 수트 패턴 통찰
    const suitCounts = this.countSuits(cards);
    const dominantSuit = Object.entries(suitCounts).sort(([,a], [,b]) => b - a)[0];
    if (dominantSuit && dominantSuit[1] >= 3) {
      const suitInsights = {
        cups: '💧 감정과 관계가 핵심 테마입니다',
        wands: '🔥 열정과 행동이 요구됩니다',
        swords: '⚔️ 명확한 사고와 결단이 필요합니다',
        pentacles: '🪙 현실적 기반과 안정이 중요합니다'
      };
      insights.push(suitInsights[dominantSuit[0]]);
    }
    
    // 정역 비율 통찰
    const reversedRatio = cards.filter(c => c.orientation === 'reversed').length / cards.length;
    if (reversedRatio > 0.6) {
      insights.push('🔄 내면의 작업과 재조정이 필요한 시기입니다');
    }
    
    return insights;
  }

  // 실행 계획 생성
  private static createActionPlan(context: InterpretationContext): any {
    const plan = {
      immediate: [], // 24-48시간 내
      weekly: [],    // 1주일 내
      monthly: [],   // 1개월 내
      quarterly: []  // 3개월 내
    };
    
    const { cards, topic } = context;
    
    // 즉시 실행 (Ace 카드나 정방향 Wands)
    if (cards.some(c => c.name.includes('Ace') && c.orientation === 'upright')) {
      plan.immediate.push('새로운 시작을 위한 첫 걸음을 내딛으세요');
      plan.immediate.push('의도를 명확히 설정하고 기록하세요');
    }
    
    // 주간 실행
    plan.weekly.push('매일 카드의 메시지를 명상하세요');
    plan.weekly.push('저널에 통찰과 느낌을 기록하세요');
    
    // 월간 실행
    plan.monthly.push('진전 상황을 검토하고 조정하세요');
    plan.monthly.push('새로운 관점에서 상황을 재평가하세요');
    
    // 분기별 실행
    plan.quarterly.push('전체적인 변화와 성장을 평가하세요');
    plan.quarterly.push('다음 단계를 위한 새로운 목표를 설정하세요');
    
    return plan;
  }

  // 확언 생성
  private static generateAffirmations(context: InterpretationContext): string[] {
    const affirmations = [];
    const { cards } = context;
    
    cards.forEach(card => {
      if (card.orientation === 'upright') {
        // 정방향 카드 기반 확언
        const affirmation = `나는 ${card.nameKr}의 긍정적인 에너지를 온전히 받아들입니다.`;
        affirmations.push(affirmation);
      } else {
        // 역방향 카드 기반 치유 확언
        const healingAffirmation = `나는 ${card.nameKr}의 도전을 성장의 기회로 변화시킵니다.`;
        affirmations.push(healingAffirmation);
      }
    });
    
    // 주제별 특별 확언
    const topicAffirmations = {
      love: '나는 사랑을 주고받을 자격이 있습니다.',
      career: '나는 나의 재능과 열정을 세상과 나눕니다.',
      money: '나는 풍요의 흐름과 조화롭게 연결되어 있습니다.',
      health: '나의 몸과 마음과 영혼은 완벽한 조화를 이룹니다.',
      general: '나는 우주의 지혜와 연결되어 있습니다.'
    };
    
    affirmations.push(topicAffirmations[context.topic] || topicAffirmations.general);
    
    return affirmations;
  }

  // 저널 프롬프트 생성
  private static createJournalPrompts(context: InterpretationContext): string[] {
    const prompts = [];
    const { cards, topic } = context;
    
    // 전체적인 성찰 프롬프트
    prompts.push('이 카드들이 나타내는 전체적인 메시지는 무엇인가요?');
    prompts.push('현재 내 삶에서 이 메시지가 어떻게 나타나고 있나요?');
    
    // 카드별 깊은 탐구 프롬프트
    cards.forEach((card, index) => {
      const position = context.spread.positions[index];
      prompts.push(`${position.name}에 ${card.nameKr}가 나온 것이 내게 주는 개인적 의미는?`);
    });
    
    // 주제별 특화 프롬프트
    const topicPrompts = {
      love: [
        '내가 사랑에서 진정으로 원하는 것은 무엇인가?',
        '관계에서 내가 성장해야 할 부분은?',
        '나의 사랑 패턴은 어떻게 형성되었는가?'
      ],
      career: [
        '나의 진정한 소명은 무엇인가?',
        '경력에서 나를 가로막는 두려움은?',
        '나의 독특한 재능을 어떻게 활용할 수 있는가?'
      ],
      money: [
        '돈에 대한 나의 믿음 체계는 어떠한가?',
        '풍요를 받아들이는 데 있어 나의 장벽은?',
        '진정한 풍요란 나에게 무엇을 의미하는가?'
      ],
      health: [
        '내 몸이 나에게 전하는 메시지는?',
        '스트레스가 내 건강에 미치는 영향은?',
        '전인적 건강을 위해 필요한 변화는?'
      ]
    };
    
    if (topicPrompts[topic]) {
      prompts.push(...topicPrompts[topic]);
    }
    
    // 통합 프롬프트
    prompts.push('이 리딩을 통해 얻은 가장 중요한 통찰은 무엇인가요?');
    prompts.push('이 메시지를 일상에 어떻게 적용할 수 있을까요?');
    
    return prompts;
  }

  // 보조 메서드들
  private static identifyChakraActivations(cards: DrawnCard[]): string[] {
    const activations = [];
    
    cards.forEach(card => {
      // 메이저 아르카나 차크라 연결
      const majorChakras = {
        'The Fool': '크라운 차크라 - 무한한 가능성',
        'The Magician': '모든 차크라 - 전체적 조화',
        'The High Priestess': '제3의 눈 - 직관과 지혜',
        'The Empress': '하트 차크라 - 사랑과 창조',
        'The Emperor': '루트 차크라 - 안정과 구조',
        'The Hierophant': '목 차크라 - 진실과 가르침',
        'The Lovers': '하트 차크라 - 연결과 선택',
        'The Chariot': '태양신경총 - 의지와 힘',
        'Strength': '하트 차크라 - 내적 힘',
        'The Hermit': '제3의 눈 - 내면의 빛',
        'The Star': '크라운 차크라 - 영적 인도'
      };
      
      if (majorChakras[card.name]) {
        activations.push(majorChakras[card.name]);
      }
      
      // 수트별 차크라
      const suitChakras = {
        'cups': '하트와 천골 차크라',
        'wands': '태양신경총과 루트 차크라',
        'swords': '목과 제3의 눈 차크라',
        'pentacles': '루트 차크라'
      };
      
      if (card.suit && suitChakras[card.suit]) {
        activations.push(suitChakras[card.suit]);
      }
    });
    
    return [...new Set(activations)];
  }

  private static defineSuccessIndicators(context: InterpretationContext): string[] {
    const indicators = [];
    const { topic } = context;
    
    const topicIndicators = {
      love: [
        '깊은 감정적 연결과 상호 이해',
        '건강한 경계와 상호 존중',
        '함께 성장하는 파트너십'
      ],
      career: [
        '열정과 목적의 일치',
        '지속적인 성장과 학습',
        '의미 있는 기여와 인정'
      ],
      money: [
        '안정적인 수입원 확보',
        '건전한 재정 습관 형성',
        '풍요 마인드셋 정착'
      ],
      health: [
        '활력과 에너지 증가',
        '정신적 명료함과 평화',
        '전인적 웰빙 달성'
      ]
    };
    
    return topicIndicators[topic] || ['긍정적 변화', '내적 평화', '목표 달성'];
  }

  private static generateHealingInsights(cards: DrawnCard[]): string[] {
    const insights = [];
    
    // 역방향 카드의 치유 메시지
    cards.filter(c => c.orientation === 'reversed').forEach(card => {
      insights.push(`${card.nameKr}의 역방향은 치유가 필요한 영역을 보여줍니다.`);
    });
    
    // 메이저 아르카나의 치유력
    cards.filter(c => c.arcana === 'major').forEach(card => {
      if (['The Star', 'Temperance', 'The Sun'].includes(card.name)) {
        insights.push(`${card.nameKr}는 강력한 치유 에너지를 가져옵니다.`);
      }
    });
    
    return insights;
  }

  private static identifyGrowthAreas(cards: DrawnCard[]): string[] {
    const areas = [];
    
    // 수트별 성장 영역
    const suitGrowth = {
      'cups': '감정 지능과 공감 능력',
      'wands': '창의성과 리더십',
      'swords': '명확한 사고와 소통',
      'pentacles': '실용적 기술과 인내'
    };
    
    const suitCounts = this.countSuits(cards);
    Object.entries(suitCounts).forEach(([suit, count]) => {
      if (count >= 2) {
        areas.push(suitGrowth[suit]);
      }
    });
    
    return areas;
  }

  private static defineHighestPotential(context: InterpretationContext): string {
    const { cards } = context;
    
    // 가장 강력한 정방향 메이저 아르카나 찾기
    const powerfulMajor = cards.find(c => 
      c.arcana === 'major' && 
      c.orientation === 'upright' &&
      ['The Sun', 'The World', 'The Star', 'The Magician'].includes(c.name)
    );
    
    if (powerfulMajor) {
      const potentials = {
        'The Sun': '완전한 성공과 기쁨의 실현',
        'The World': '모든 차원에서의 완성과 통합',
        'The Star': '영적 각성과 신성한 목적 발견',
        'The Magician': '현실 창조의 마스터가 되기'
      };
      return potentials[powerfulMajor.name];
    }
    
    return '무한한 가능성과 잠재력의 실현';
  }

  private static countSuits(cards: DrawnCard[]): Record<string, number> {
    const counts = { cups: 0, wands: 0, swords: 0, pentacles: 0 };
    
    cards.forEach(card => {
      if (card.suit) {
        counts[card.suit]++;
      }
    });
    
    return counts;
  }
}

// 확률적 해석 도구
export class ProbabilityInterpreter {
  static calculateOutcomeProbability(cards: DrawnCard[], spread: TarotSpread): any {
    const factors = {
      positive: 0,
      negative: 0,
      neutral: 0
    };
    
    // 카드 방향성 분석
    cards.forEach((card, index) => {
      const weight = this.getPositionWeight(spread.positions[index]);
      
      if (card.orientation === 'upright') {
        if (this.isPositiveCard(card)) {
          factors.positive += weight;
        } else if (this.isNegativeCard(card)) {
          factors.negative += weight * 0.5; // 정방향이면 부정적 영향 감소
        } else {
          factors.neutral += weight;
        }
      } else {
        if (this.isPositiveCard(card)) {
          factors.positive += weight * 0.3; // 역방향이면 긍정적 영향 감소
        } else if (this.isNegativeCard(card)) {
          factors.negative += weight;
        } else {
          factors.neutral += weight;
        }
      }
    });
    
    const total = factors.positive + factors.negative + factors.neutral;
    
    return {
      successProbability: Math.round((factors.positive / total) * 100),
      challengeProbability: Math.round((factors.negative / total) * 100),
      uncertaintyLevel: Math.round((factors.neutral / total) * 100),
      recommendation: this.getRecommendation(factors)
    };
  }
  
  private static getPositionWeight(position: any): number {
    // 포지션별 가중치 (켈틱 크로스 기준)
    const weights = {
      '현재 상황': 1.0,
      '도전/십자가': 0.8,
      '최종 결과': 1.5,
      '가까운 미래': 1.2,
      '외부 영향': 0.7
    };
    
    return weights[position.name] || 1.0;
  }
  
  private static isPositiveCard(card: DrawnCard): boolean {
    const positiveCards = [
      'The Sun', 'The Star', 'The World', 'Ten of Cups', 
      'Nine of Cups', 'Three of Cups', 'Ace of Cups',
      'Four of Wands', 'Three of Pentacles', 'Nine of Pentacles'
    ];
    
    return positiveCards.includes(card.name);
  }
  
  private static isNegativeCard(card: DrawnCard): boolean {
    const negativeCards = [
      'The Tower', 'Death', 'The Devil', 'Five of Cups',
      'Three of Swords', 'Five of Swords', 'Ten of Swords',
      'Five of Pentacles', 'Seven of Swords'
    ];
    
    return negativeCards.includes(card.name);
  }
  
  private static getRecommendation(factors: any): string {
    const ratio = factors.positive / (factors.negative || 1);
    
    if (ratio > 2) {
      return '매우 긍정적인 결과가 예상됩니다. 자신감을 가지고 진행하세요.';
    } else if (ratio > 1) {
      return '전반적으로 긍정적이나 주의할 점이 있습니다. 신중하게 진행하세요.';
    } else if (ratio > 0.5) {
      return '도전이 있지만 극복 가능합니다. 준비를 철저히 하세요.';
    } else {
      return '상당한 어려움이 예상됩니다. 계획을 재검토하거나 시기를 조정하세요.';
    }
  }
}

export default {
  AIInterpretationEnhancer,
  ProbabilityInterpreter
};
