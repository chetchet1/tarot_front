// 카드 조합 해석 서비스
import { DrawnCard } from '../../models/tarot';

interface CardCombination {
  cards: string[]; // 카드 이름 또는 ID
  meaning: string;
  advice: string;
  keywords: string[];
}

// 특정 카드 조합의 의미
const specialCombinations: CardCombination[] = [
  // 메이저 + 메이저 조합
  {
    cards: ['The Fool', 'The World'],
    meaning: '완전한 순환의 여정. 새로운 시작이 곧 완성으로 이어집니다.',
    advice: '대담하게 시작하되, 목표를 명확히 하세요.',
    keywords: ['순환', '여정', '완성']
  },
  {
    cards: ['The Lovers', 'Two of Cups'],
    meaning: '깊은 감정적 연결과 조화로운 관계가 형성됩니다.',
    advice: '마음을 열고 진정성 있게 소통하세요.',
    keywords: ['사랑', '조화', '연결']
  },
  {
    cards: ['Death', 'The Tower'],
    meaning: '급격한 변화와 변혁의 시기. 낡은 것은 무너지고 새로운 것이 탄생합니다.',
    advice: '변화를 두려워하지 말고 흐름에 맡기세요.',
    keywords: ['변혁', '재생', '극적인 변화']
  },
  {
    cards: ['The Star', 'The Sun'],
    meaning: '희망과 기쁨이 넘치는 시기. 꿈이 현실이 됩니다.',
    advice: '긍정적인 에너지를 유지하고 감사하는 마음을 가지세요.',
    keywords: ['희망', '성취', '기쁨']
  },
  {
    cards: ['The Hermit', 'The High Priestess'],
    meaning: '깊은 내면의 지혜와 영적 통찰력이 발현됩니다.',
    advice: '명상과 성찰을 통해 내면의 목소리에 귀 기울이세요.',
    keywords: ['내면의 지혜', '영성', '직관']
  },
  
  // 주제별 특화 조합 추가
  {
    cards: ['Three of Pentacles', 'The Emperor'],
    meaning: '체계적인 협업으로 큰 성과를 이룰 수 있습니다.',
    advice: '리더십을 발휘하되 팀워크를 중시하세요.',
    keywords: ['협업', '리더십', '성취']
  },
  {
    cards: ['Nine of Cups', 'Ten of Cups'],
    meaning: '감정적 만족과 가족의 행복이 동시에 이루어집니다.',
    advice: '현재의 행복을 소중히 여기고 나누세요.',
    keywords: ['만족', '행복', '풍요']
  },
  {
    cards: ['Five of Swords', 'Five of Cups'],
    meaning: '갈등과 상실감이 겹쳐 어려운 시기입니다.',
    advice: '과거에 집착하지 말고 새로운 가능성을 찾으세요.',
    keywords: ['갈등', '상실', '회복']
  }
];

// 수트별 조합 의미
const suitCombinations = {
  'cups-cups': {
    meaning: '감정이 깊고 풍부한 시기입니다. 직관을 신뢰하세요.',
    element: '물의 에너지가 강화되어 감수성이 예민해집니다.'
  },
  'wands-wands': {
    meaning: '열정과 창조력이 넘치는 시기입니다. 적극적으로 행동하세요.',
    element: '불의 에너지가 강화되어 추진력이 증가합니다.'
  },
  'swords-swords': {
    meaning: '논리적 사고와 명확한 판단이 필요한 시기입니다.',
    element: '공기의 에너지가 강화되어 지성이 날카로워집니다.'
  },
  'pentacles-pentacles': {
    meaning: '물질적 안정과 실용적 접근이 중요한 시기입니다.',
    element: '땅의 에너지가 강화되어 현실감각이 발달합니다.'
  },
  'cups-wands': {
    meaning: '감정과 행동의 조화가 필요합니다. 열정을 현명하게 표현하세요.',
    element: '물과 불의 조화로 창조적 감성이 발현됩니다.'
  },
  'swords-pentacles': {
    meaning: '아이디어를 현실로 구현할 수 있는 시기입니다.',
    element: '공기와 땅의 조화로 계획이 실현됩니다.'
  }
};

// 숫자 패턴 분석
const numberPatterns = {
  'ascending': { // 1, 2, 3
    meaning: '점진적인 성장과 발전의 흐름입니다.',
    advice: '단계별로 차근차근 진행하세요.'
  },
  'descending': { // 10, 9, 8
    meaning: '완성에서 새로운 시작으로 이어지는 흐름입니다.',
    advice: '과거의 성과를 바탕으로 새로운 도전을 준비하세요.'
  },
  'same_numbers': { // 3, 3, 3
    meaning: '특정 에너지가 강하게 집중되어 있습니다.',
    advice: '이 숫자의 의미를 깊이 탐구해보세요.'
  },
  'master_numbers': { // 11, 22 등
    meaning: '영적 각성과 높은 차원의 에너지가 작동합니다.',
    advice: '직관을 믿고 영적 성장에 집중하세요.'
  }
};

export class CardCombinationAnalyzer {
  // 두 카드 사이의 관계 분석
  static analyzeCardPair(card1: DrawnCard, card2: DrawnCard): any {
    // 특별한 조합 확인
    const specialCombo = this.findSpecialCombination([card1.name, card2.name]);
    if (specialCombo) {
      return {
        type: 'special',
        ...specialCombo
      };
    }

    // 수트 조합 분석
    if (card1.suit && card2.suit) {
      const suitKey = `${card1.suit}-${card2.suit}`;
      const suitCombo = suitCombinations[suitKey] || suitCombinations[`${card2.suit}-${card1.suit}`];
      if (suitCombo) {
        return {
          type: 'suit',
          ...suitCombo
        };
      }
    }

    // 숫자 관계 분석
    if (card1.number !== undefined && card2.number !== undefined) {
      const numberRelation = this.analyzeNumberRelation(card1.number, card2.number);
      if (numberRelation) {
        return {
          type: 'number',
          ...numberRelation
        };
      }
    }

    // 메이저/마이너 조합
    if (card1.arcana !== card2.arcana) {
      return {
        type: 'arcana_mix',
        meaning: '영적 교훈과 일상적 경험이 연결됩니다.',
        advice: '큰 그림을 보면서도 세부사항을 놓치지 마세요.'
      };
    }

    return null;
  }

  // 여러 카드의 패턴 분석
  static analyzeCardPattern(cards: DrawnCard[]): any {
    const patterns = {
      majorDominant: 0,
      suitBalance: {},
      numberSequence: [],
      elementBalance: {},
      uprightReversed: { upright: 0, reversed: 0 }
    };

    // 카드 분석
    cards.forEach(card => {
      // 메이저/마이너 비율
      if (card.arcana === 'major') patterns.majorDominant++;

      // 수트 분포
      if (card.suit) {
        patterns.suitBalance[card.suit] = (patterns.suitBalance[card.suit] || 0) + 1;
      }

      // 숫자 시퀀스
      if (card.number !== undefined) {
        patterns.numberSequence.push(card.number);
      }

      // 정/역 비율
      patterns.uprightReversed[card.orientation]++;
    });

    return this.interpretPatterns(patterns, cards.length);
  }

  // 특별한 조합 찾기
  private static findSpecialCombination(cardNames: string[]): CardCombination | null {
    return specialCombinations.find(combo => 
      combo.cards.every(card => cardNames.includes(card)) ||
      combo.cards.every((card, idx) => card === cardNames[idx])
    ) || null;
  }

  // 숫자 관계 분석
  private static analyzeNumberRelation(num1: number, num2: number): any {
    const diff = Math.abs(num1 - num2);
    
    if (diff === 0) {
      return {
        meaning: '같은 숫자의 반복은 그 에너지의 강조를 의미합니다.',
        advice: `숫자 ${num1}의 의미를 깊이 탐구하세요.`
      };
    }
    
    if (diff === 1) {
      return {
        meaning: '연속된 숫자는 자연스러운 진행과 발전을 나타냅니다.',
        advice: '단계적인 성장 과정을 신뢰하세요.'
      };
    }
    
    if (num1 + num2 === 10) {
      return {
        meaning: '두 숫자가 완성(10)을 이루며 균형을 맞춥니다.',
        advice: '서로 보완하는 에너지를 활용하세요.'
      };
    }

    return null;
  }

  // 패턴 해석
  private static interpretPatterns(patterns: any, totalCards: number): any {
    const insights = [];

    // 메이저 아르카나 비율
    const majorRatio = patterns.majorDominant / totalCards;
    if (majorRatio > 0.5) {
      insights.push({
        type: 'major_dominant',
        meaning: '인생의 중대한 전환점에 있습니다. 영적 성장이 강조됩니다.',
        advice: '큰 그림을 보고 장기적인 관점에서 결정하세요.'
      });
    }

    // 수트 균형
    const dominantSuit = Object.entries(patterns.suitBalance)
      .sort(([,a]: any, [,b]: any) => b - a)[0];
    
    if (dominantSuit && dominantSuit[1] as number >= totalCards * 0.4) {
      const suitMeanings = {
        cups: '감정과 관계가 중심이 되는 시기입니다.',
        wands: '행동과 열정이 요구되는 시기입니다.',
        swords: '명확한 사고와 결정이 필요한 시기입니다.',
        pentacles: '현실적이고 실용적인 접근이 필요합니다.'
      };
      
      insights.push({
        type: 'suit_dominant',
        suit: dominantSuit[0],
        meaning: suitMeanings[dominantSuit[0]],
        advice: '이 에너지를 중심으로 상황을 해석하세요.'
      });
    }

    // 정/역 비율
    const reversedRatio = patterns.uprightReversed.reversed / totalCards;
    if (reversedRatio > 0.6) {
      insights.push({
        type: 'reversed_dominant',
        meaning: '내면의 작업과 재조정이 필요한 시기입니다.',
        advice: '외부보다 내면에 집중하고, 막힌 에너지를 해소하세요.'
      });
    }

    // 숫자 시퀀스 분석
    if (patterns.numberSequence.length >= 3) {
      const sequence = this.analyzeNumberSequence(patterns.numberSequence);
      if (sequence) {
        insights.push(sequence);
      }
    }

    return insights;
  }

  // 숫자 시퀀스 분석
  private static analyzeNumberSequence(numbers: number[]): any {
    // 오름차순 확인
    const sorted = [...numbers].sort((a, b) => a - b);
    const isAscending = numbers.every((num, idx) => idx === 0 || num >= numbers[idx - 1]);
    const isDescending = numbers.every((num, idx) => idx === 0 || num <= numbers[idx - 1]);

    if (isAscending && sorted[sorted.length - 1] - sorted[0] === sorted.length - 1) {
      return {
        type: 'ascending_sequence',
        meaning: '점진적인 성장과 발전의 과정에 있습니다.',
        advice: '인내심을 가지고 단계별로 전진하세요.'
      };
    }

    if (isDescending) {
      return {
        type: 'descending_sequence',
        meaning: '내려놓음과 정리의 과정에 있습니다.',
        advice: '불필요한 것을 버리고 본질에 집중하세요.'
      };
    }

    // 반복되는 숫자
    const frequency = {};
    numbers.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
    });

    const repeated = Object.entries(frequency).find(([_, count]) => count >= 2);
    if (repeated) {
      return {
        type: 'repeated_number',
        number: repeated[0],
        meaning: `숫자 ${repeated[0]}의 에너지가 강조되고 있습니다.`,
        advice: '이 숫자가 상징하는 의미를 깊이 탐구하세요.'
      };
    }

    return null;
  }

  // 시간대별 영향 분석 (켈틱 크로스용)
  static analyzeTimelineInfluence(pastCards: DrawnCard[], presentCard: DrawnCard, futureCards: DrawnCard[]): any {
    const timeline = {
      past: this.summarizeCards(pastCards),
      present: this.summarizeCard(presentCard),
      future: this.summarizeCards(futureCards),
      flow: '',
      advice: ''
    };

    // 시간의 흐름 분석
    if (timeline.past.energy === 'negative' && timeline.future.energy === 'positive') {
      timeline.flow = '어려움을 극복하고 밝은 미래로 나아가는 상승 곡선입니다.';
      timeline.advice = '과거의 교훈을 발판으로 삼아 자신감을 가지세요.';
    } else if (timeline.past.energy === 'positive' && timeline.future.energy === 'negative') {
      timeline.flow = '주의가 필요한 하강 곡선입니다.';
      timeline.advice = '과거의 성공에 안주하지 말고 새로운 도전에 대비하세요.';
    } else {
      timeline.flow = '일관된 에너지가 지속되고 있습니다.';
      timeline.advice = '현재의 흐름을 유지하면서 세심한 조정을 하세요.';
    }

    return timeline;
  }

  // 카드 요약
  private static summarizeCard(card: DrawnCard): any {
    return {
      energy: card.orientation === 'upright' ? 'positive' : 'challenging',
      theme: card.arcana === 'major' ? 'spiritual' : 'practical',
      element: this.getCardElement(card)
    };
  }

  // 여러 카드 요약
  private static summarizeCards(cards: DrawnCard[]): any {
    const summary = {
      energy: '',
      dominantTheme: '',
      elements: []
    };

    const uprightCount = cards.filter(c => c.orientation === 'upright').length;
    summary.energy = uprightCount > cards.length / 2 ? 'positive' : 'challenging';

    const majorCount = cards.filter(c => c.arcana === 'major').length;
    summary.dominantTheme = majorCount > cards.length / 2 ? 'spiritual' : 'practical';

    summary.elements = cards.map(c => this.getCardElement(c));

    return summary;
  }

  // 카드의 원소 얻기
  private static getCardElement(card: DrawnCard): string {
    const suitElements = {
      cups: '물',
      wands: '불',
      swords: '공기',
      pentacles: '땅'
    };

    if (card.suit) {
      return suitElements[card.suit];
    }

    // 메이저 아르카나의 원소 (간단한 매핑)
    const majorElements = {
      0: '공기', // The Fool
      1: '수성', // The Magician
      2: '달', // The High Priestess
      3: '금성', // The Empress
      4: '양자리', // The Emperor
      // ... 나머지 메이저 아르카나
    };

    return majorElements[card.number] || '영성';
  }
}

// 주제별 특화 해석
export class TopicSpecificInterpretation {
  static enhanceInterpretation(card: DrawnCard, topic: string, position?: any): any {
    const baseInterpretation = card.meanings[topic]?.[card.orientation] || 
                             card.meanings.general[card.orientation];

    const enhanced = {
      basic: baseInterpretation,
      detailed: '',
      practical: '',
      spiritual: '',
      timing: '',
      advice: ''
    };

    switch (topic) {
      case 'love':
        enhanced.detailed = this.getLoveDetailed(card, position);
        enhanced.practical = this.getLovePractical(card);
        enhanced.spiritual = this.getLoveSpiritual(card);
        enhanced.timing = this.getLoveTiming(card);
        enhanced.advice = this.getLoveAdvice(card);
        break;
      
      case 'career':
        enhanced.detailed = this.getCareerDetailed(card, position);
        enhanced.practical = this.getCareerPractical(card);
        enhanced.spiritual = this.getCareerSpiritual(card);
        enhanced.timing = this.getCareerTiming(card);
        enhanced.advice = this.getCareerAdvice(card);
        break;
      
      case 'money':
        enhanced.detailed = this.getMoneyDetailed(card, position);
        enhanced.practical = this.getMoneyPractical(card);
        enhanced.spiritual = this.getMoneySpiritual(card);
        enhanced.timing = this.getMoneyTiming(card);
        enhanced.advice = this.getMoneyAdvice(card);
        break;
      
      case 'health':
        enhanced.detailed = this.getHealthDetailed(card, position);
        enhanced.practical = this.getHealthPractical(card);
        enhanced.spiritual = this.getHealthSpiritual(card);
        enhanced.timing = this.getHealthTiming(card);
        enhanced.advice = this.getHealthAdvice(card);
        break;
    }

    return enhanced;
  }

  // 사랑 주제 상세 해석
  private static getLoveDetailed(card: DrawnCard, position?: any): string {
    const loveDetails = {
      'The Lovers': {
        upright: '진정한 사랑의 선택이 다가옵니다. 영혼의 파트너를 만날 가능성이 높습니다.',
        reversed: '관계에서의 불균형이나 선택의 어려움을 겪고 있습니다.'
      },
      'Two of Cups': {
        upright: '상호 존중과 애정이 넘치는 관계가 시작됩니다.',
        reversed: '감정적 연결이 약해지고 있거나 소통 문제가 있습니다.'
      },
      // ... 더 많은 카드별 상세 해석
    };

    return loveDetails[card.name]?.[card.orientation] || 
           `${card.nameKr} 카드는 사랑에서 ${card.orientation === 'upright' ? '긍정적인' : '도전적인'} 영향을 나타냅니다.`;
  }

  private static getLovePractical(card: DrawnCard): string {
    // 실용적 조언
    if (card.suit === 'cups') {
      return '감정을 솔직하게 표현하고 상대방의 마음에 귀 기울이세요.';
    } else if (card.suit === 'pentacles') {
      return '안정적인 관계를 위해 현실적인 계획을 세우세요.';
    }
    return '마음과 행동의 균형을 유지하세요.';
  }

  private static getLoveSpiritual(card: DrawnCard): string {
    if (card.arcana === 'major') {
      return '이 관계는 당신의 영적 성장에 중요한 역할을 합니다.';
    }
    return '일상 속에서 사랑의 신성함을 발견하세요.';
  }

  private static getLoveTiming(card: DrawnCard): string {
    const timings = {
      'Ace': '새로운 만남이나 관계의 시작 - 1-3개월 이내',
      'Two': '관계의 선택과 결정 - 2-4주 이내',
      'Three': '관계의 성장과 축하 - 3개월 전후',
      // ... 더 많은 타이밍
    };

    const cardRank = card.name.split(' ')[0];
    return timings[cardRank] || '시기는 당신의 준비 상태에 따라 결정됩니다.';
  }

  private static getLoveAdvice(card: DrawnCard): string {
    if (card.orientation === 'upright') {
      return '이 카드의 긍정적인 에너지를 믿고 사랑에 열린 마음을 가지세요.';
    }
    return '관계의 어려움을 성장의 기회로 삼으세요.';
  }

  // 경력 주제 해석들...
  private static getCareerDetailed(card: DrawnCard, position?: any): string {
    // 구현...
    return `${card.nameKr}는 경력에서 중요한 메시지를 전합니다.`;
  }

  private static getCareerPractical(card: DrawnCard): string {
    return '실용적인 경력 조언입니다.';
  }

  private static getCareerSpiritual(card: DrawnCard): string {
    return '일을 통한 영적 성장의 기회입니다.';
  }

  private static getCareerTiming(card: DrawnCard): string {
    return '경력 변화의 시기에 대한 조언입니다.';
  }

  private static getCareerAdvice(card: DrawnCard): string {
    return '경력 발전을 위한 구체적인 조언입니다.';
  }

  // 재정 주제 해석들...
  private static getMoneyDetailed(card: DrawnCard, position?: any): string {
    return `${card.nameKr}는 재정 상황에 대한 통찰을 제공합니다.`;
  }

  private static getMoneyPractical(card: DrawnCard): string {
    return '실용적인 재정 관리 조언입니다.';
  }

  private static getMoneySpiritual(card: DrawnCard): string {
    return '물질과 영성의 균형에 대한 메시지입니다.';
  }

  private static getMoneyTiming(card: DrawnCard): string {
    return '재정적 변화의 시기에 대한 안내입니다.';
  }

  private static getMoneyAdvice(card: DrawnCard): string {
    return '풍요를 창출하기 위한 조언입니다.';
  }

  // 건강 주제 해석들...
  private static getHealthDetailed(card: DrawnCard, position?: any): string {
    return `${card.nameKr}는 건강과 웰빙에 대한 메시지를 담고 있습니다.`;
  }

  private static getHealthPractical(card: DrawnCard): string {
    return '건강 관리를 위한 실용적 조언입니다.';
  }

  private static getHealthSpiritual(card: DrawnCard): string {
    return '몸과 마음, 영혼의 조화에 대한 메시지입니다.';
  }

  private static getHealthTiming(card: DrawnCard): string {
    return '건강 회복이나 변화의 시기에 대한 안내입니다.';
  }

  private static getHealthAdvice(card: DrawnCard): string {
    return '전인적 건강을 위한 조언입니다.';
  }
}

// 카드 조합 분석기에 시간대별 분석 기능 추가
export class TimelineAnalyzer {
  // 시간대별 영향 분석 (켈틱 크로스용)
  static analyzeTimelineInfluence(pastCards: DrawnCard[], presentCard: DrawnCard, futureCards: DrawnCard[]): any {
    // 과거 에너지 분석
    const pastEnergy = this.analyzePastEnergy(pastCards);
    
    // 현재 에너지 분석
    const presentEnergy = this.analyzePresentEnergy(presentCard);
    
    // 미래 에너지 분석
    const futureEnergy = this.analyzeFutureEnergy(futureCards);
    
    // 에너지 흐름 분석
    const flow = this.analyzeEnergyFlow(pastEnergy, presentEnergy, futureEnergy);
    
    return {
      past: pastEnergy,
      present: presentEnergy,
      future: futureEnergy,
      flow: flow.description,
      advice: flow.advice
    };
  }
  
  private static analyzePastEnergy(cards: DrawnCard[]): any {
    const dominantSuit = this.getDominantSuit(cards);
    const majorCount = cards.filter(c => c.arcana === 'major').length;
    
    let energy = '';
    if (majorCount >= 2) {
      energy = '중요한 인생의 전환점';
    } else if (dominantSuit === 'cups') {
      energy = '감정적 경험과 관계';
    } else if (dominantSuit === 'wands') {
      energy = '열정과 도전';
    } else if (dominantSuit === 'swords') {
      energy = '갈등과 결단';
    } else if (dominantSuit === 'pentacles') {
      energy = '현실적 기반 구축';
    } else {
      energy = '다양한 경험의 혼합';
    }
    
    return { energy, cards };
  }
  
  private static analyzePresentEnergy(card: DrawnCard): any {
    let energy = '';
    
    if (card.arcana === 'major') {
      energy = `${card.nameKr}의 강력한 에너지`;
    } else {
      const suitEnergies = {
        cups: '감정적 연결과 치유',
        wands: '창의적 행동과 열정',
        swords: '명확한 사고와 소통',
        pentacles: '안정과 성취'
      };
      energy = suitEnergies[card.suit] || '변화의 에너지';
    }
    
    if (card.orientation === 'reversed') {
      energy += '의 도전';
    }
    
    return { energy, card };
  }
  
  private static analyzeFutureEnergy(cards: DrawnCard[]): any {
    const uprightCount = cards.filter(c => c.orientation === 'upright').length;
    const majorCount = cards.filter(c => c.arcana === 'major').length;
    
    let energy = '';
    if (uprightCount === cards.length) {
      energy = '긍정적이고 순탄한 발전';
    } else if (uprightCount === 0) {
      energy = '도전적이지만 성장의 기회';
    } else if (majorCount >= 1) {
      energy = '중요한 변화와 전환';
    } else {
      energy = '점진적 발전과 성장';
    }
    
    return { energy, cards };
  }
  
  private static analyzeEnergyFlow(past: any, present: any, future: any): any {
    let description = '';
    let advice = '';
    
    // 과거에서 현재로의 흐름
    if (past.energy.includes('전환점') && present.energy.includes('도전')) {
      description = '과거의 중요한 경험이 현재의 도전을 만들었습니다.';
      advice = '과거의 교훈을 현재에 적용하세요.';
    } else if (past.energy.includes('감정') && future.energy.includes('긍정')) {
      description = '감정적 경험이 긍정적 미래로 이어집니다.';
      advice = '감정을 소중히 다루며 전진하세요.';
    } else {
      description = '에너지가 자연스럽게 흐르고 변화하고 있습니다.';
      advice = '현재에 집중하면서 미래를 준비하세요.';
    }
    
    return { description, advice };
  }
  
  private static getDominantSuit(cards: DrawnCard[]): string | null {
    const suitCounts = { cups: 0, wands: 0, swords: 0, pentacles: 0 };
    
    cards.forEach(card => {
      if (card.suit) {
        suitCounts[card.suit]++;
      }
    });
    
    const maxCount = Math.max(...Object.values(suitCounts));
    if (maxCount === 0) return null;
    
    return Object.entries(suitCounts).find(([suit, count]) => count === maxCount)?.[0] || null;
  }
}

// CardCombinationAnalyzer에 메서드 추가
CardCombinationAnalyzer.analyzeTimelineInfluence = TimelineAnalyzer.analyzeTimelineInfluence.bind(TimelineAnalyzer);

// Export
export default {
  CardCombinationAnalyzer,
  TopicSpecificInterpretation,
  TimelineAnalyzer
};
