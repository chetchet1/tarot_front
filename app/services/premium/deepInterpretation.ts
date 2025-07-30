import { TarotCard, Reading as TarotReading } from '../../models/tarot';

interface DeepInterpretation {
  layers?: {
    psychological?: {
      consciousPatterns?: string[];
      unconsciousPatterns?: string[];
      growthOpportunities?: string[];
    };
    spiritual?: {
      soulLessons?: string[];
      spiritualGifts?: string[];
      chakraActivations?: string[];
    };
    shadow?: {
      hiddenAspects?: Array<{
        card: string;
        message: string;
      }>;
    };
  };
  synthesis?: string;
  keyInsights?: string[];
  actionPlan?: {
    immediate?: string[];
    weekly?: string[];
    monthly?: string[];
  };
  affirmations?: string[];
}

interface CardCombination {
  type: 'special' | 'suit' | 'number' | 'element';
  meaning: string;
  advice?: string;
}

interface CardPattern {
  name: string;
  description: string;
  implication?: string;
}

interface ProbabilityAnalysis {
  successProbability: number;
  challengeProbability: number;
  uncertaintyLevel: number;
  recommendation: string;
}

export class DeepInterpretationService {
  /**
   * 프리미엄 사용자를 위한 AI 심층 분석 생성
   */
  static generateDeepInterpretation(reading: TarotReading): DeepInterpretation {
    const cards = reading.cards;
    const topic = reading.topic || 'general';
    
    // 카드 구성 분석
    const majorCount = cards.filter(c => c.arcana === 'major').length;
    const uprightCount = cards.filter(c => c.orientation === 'upright').length;
    const reversedCount = cards.length - uprightCount;
    
    // 원소 분석
    const elements = this.analyzeElements(cards);
    
    // 숫자 패턴 분석
    const numberPatterns = this.analyzeNumbers(cards);
    
    return {
      layers: this.generateLayers(cards, topic, elements),
      synthesis: this.generateSynthesis(cards, topic, majorCount, uprightCount),
      keyInsights: this.generateKeyInsights(cards, topic, elements, numberPatterns),
      actionPlan: this.generateActionPlan(cards, topic),
      affirmations: this.generateAffirmations(cards, topic)
    };
  }
  
  /**
   * 카드 조합 분석
   */
  static analyzeCardCombinations(cards: TarotCard[]): CardCombination[] {
    const combinations: CardCombination[] = [];
    
    // 특별한 조합 체크
    combinations.push(...this.checkSpecialCombinations(cards));
    
    // 수트 조합 체크
    combinations.push(...this.checkSuitCombinations(cards));
    
    // 숫자 관계 체크
    combinations.push(...this.checkNumberRelationships(cards));
    
    // 원소 조합 체크
    combinations.push(...this.checkElementCombinations(cards));
    
    return combinations;
  }
  
  /**
   * 카드 패턴 분석
   */
  static analyzeCardPattern(cards: TarotCard[]): CardPattern | null {
    const majorCount = cards.filter(c => c.arcana === 'major').length;
    const uprightCount = cards.filter(c => c.orientation === 'upright').length;
    const reversedCount = cards.length - uprightCount;
    
    // 메이저 아르카나 우세
    if (majorCount >= cards.length * 0.6) {
      return {
        name: '운명의 부름',
        description: '메이저 아르카나가 우세하여 중요한 인생의 전환점을 나타냅니다.',
        implication: '우주가 당신에게 중요한 메시지를 전달하고 있습니다. 큰 그림을 보고 영적 성장에 집중하세요.'
      };
    }
    
    // 모두 정방향
    if (uprightCount === cards.length) {
      return {
        name: '순풍만범',
        description: '모든 카드가 정방향으로 매우 긍정적인 에너지를 나타냅니다.',
        implication: '지금이 바로 행동할 때입니다. 우주가 당신의 편이며 모든 것이 순조롭게 진행될 것입니다.'
      };
    }
    
    // 모두 역방향
    if (reversedCount === cards.length) {
      return {
        name: '내면의 탐구',
        description: '모든 카드가 역방향으로 깊은 내면의 작업이 필요함을 나타냅니다.',
        implication: '외부보다는 내면에 집중하세요. 숨겨진 진실과 무의식의 메시지에 귀 기울이세요.'
      };
    }
    
    // 균형
    if (Math.abs(uprightCount - reversedCount) <= 1) {
      return {
        name: '음양의 조화',
        description: '정방향과 역방향이 균형을 이루며 조화로운 상태를 나타냅니다.',
        implication: '빛과 그림자, 의식과 무의식의 균형을 유지하며 전진하세요.'
      };
    }
    
    return null;
  }
  
  /**
   * 확률적 분석
   */
  static generateProbabilityAnalysis(cards: TarotCard[], topic: string): ProbabilityAnalysis {
    const uprightCount = cards.filter(c => c.orientation === 'upright').length;
    const majorCount = cards.filter(c => c.arcana === 'major').length;
    
    // 기본 확률 계산
    let successBase = (uprightCount / cards.length) * 60;
    let challengeBase = ((cards.length - uprightCount) / cards.length) * 40;
    
    // 메이저 아르카나 보정
    successBase += (majorCount / cards.length) * 20;
    
    // 주제별 보정
    if (topic === 'love' && cards.some(c => c.name.includes('Lovers') || c.name.includes('Cups'))) {
      successBase += 10;
    } else if (topic === 'career' && cards.some(c => c.name.includes('Pentacles') || c.name.includes('Emperor'))) {
      successBase += 10;
    }
    
    const successProbability = Math.min(90, Math.max(10, Math.round(successBase)));
    const challengeProbability = Math.min(70, Math.max(10, Math.round(challengeBase + (100 - successBase) / 3)));
    const uncertaintyLevel = 100 - successProbability - challengeProbability;
    
    let recommendation = '';
    if (successProbability >= 70) {
      recommendation = '높은 성공 가능성이 보입니다. 자신감을 가지고 전진하되, 겸손함을 잃지 마세요.';
    } else if (successProbability >= 50) {
      recommendation = '긍정적인 결과를 위해서는 추가적인 노력과 인내가 필요합니다.';
    } else if (challengeProbability >= 50) {
      recommendation = '도전적인 시기입니다. 하지만 모든 도전은 성장의 기회임을 기억하세요.';
    } else {
      recommendation = '불확실성이 높습니다. 유연한 태도를 유지하고 다양한 가능성에 대비하세요.';
    }
    
    return {
      successProbability,
      challengeProbability,
      uncertaintyLevel,
      recommendation
    };
  }
  
  private static analyzeElements(cards: TarotCard[]): Record<string, number> {
    const elements: Record<string, number> = {
      fire: 0,
      water: 0,
      air: 0,
      earth: 0,
      spirit: 0
    };
    
    cards.forEach(card => {
      if (card.element) {
        const element = card.element.toLowerCase();
        if (element in elements) {
          elements[element]++;
        }
      } else if (card.suit) {
        // 수트별 원소 매핑
        switch (card.suit) {
          case 'wands': elements.fire++; break;
          case 'cups': elements.water++; break;
          case 'swords': elements.air++; break;
          case 'pentacles': elements.earth++; break;
        }
      } else if (card.arcana === 'major') {
        elements.spirit++;
      }
    });
    
    return elements;
  }
  
  private static analyzeNumbers(cards: TarotCard[]): Record<number, number> {
    const numbers: Record<number, number> = {};
    
    cards.forEach(card => {
      if (card.number !== undefined && card.number !== null) {
        numbers[card.number] = (numbers[card.number] || 0) + 1;
      }
    });
    
    return numbers;
  }
  
  private static generateLayers(cards: TarotCard[], topic: string, elements: Record<string, number>): DeepInterpretation['layers'] {
    const layers: DeepInterpretation['layers'] = {};
    
    // 심리적 층위
    layers.psychological = {
      consciousPatterns: this.generateConsciousPatterns(cards, topic),
      unconsciousPatterns: this.generateUnconsciousPatterns(cards, topic),
      growthOpportunities: this.generateGrowthOpportunities(cards, topic)
    };
    
    // 영적 층위
    layers.spiritual = {
      soulLessons: this.generateSoulLessons(cards, topic),
      spiritualGifts: this.generateSpiritualGifts(cards),
      chakraActivations: this.generateChakraActivations(cards, elements)
    };
    
    // 그림자 작업
    const reversedCards = cards.filter(c => c.orientation === 'reversed');
    if (reversedCards.length > 0) {
      layers.shadow = {
        hiddenAspects: reversedCards.slice(0, 3).map(card => ({
          card: card.nameKr || card.name,
          message: this.generateShadowMessage(card, topic)
        }))
      };
    }
    
    return layers;
  }
  
  private static generateConsciousPatterns(cards: TarotCard[], topic: string): string[] {
    const patterns: string[] = [];
    
    // 주요 카드 기반 패턴 생성
    const majorCards = cards.filter(c => c.arcana === 'major' && c.orientation === 'upright');
    
    if (majorCards.some(c => c.name.includes('Emperor') || c.name.includes('Empress'))) {
      patterns.push('리더십과 권위에 대한 욕구');
    }
    
    if (majorCards.some(c => c.name.includes('Lovers') || c.name.includes('Star'))) {
      patterns.push('조화와 연결에 대한 갈망');
    }
    
    if (topic === 'love') {
      patterns.push('사랑을 통한 자아 실현 추구');
    } else if (topic === 'career') {
      patterns.push('성공을 통한 자기 증명 욕구');
    }
    
    return patterns;
  }
  
  private static generateUnconsciousPatterns(cards: TarotCard[], topic: string): string[] {
    const patterns: string[] = [];
    
    const reversedCards = cards.filter(c => c.orientation === 'reversed');
    
    if (reversedCards.length > cards.length / 2) {
      patterns.push('억압된 감정의 표출 필요성');
    }
    
    if (cards.some(c => c.name.includes('Moon') || c.name.includes('High Priestess'))) {
      patterns.push('직관력의 각성');
    }
    
    if (cards.some(c => c.name.includes('Death') || c.name.includes('Tower'))) {
      patterns.push('변화에 대한 무의식적 준비');
    }
    
    return patterns;
  }
  
  private static generateGrowthOpportunities(cards: TarotCard[], topic: string): string[] {
    const opportunities: string[] = [];
    
    if (cards.some(c => c.name.includes('Fool'))) {
      opportunities.push('새로운 시작을 받아들이는 용기 개발');
    }
    
    if (cards.some(c => c.name.includes('Hermit'))) {
      opportunities.push('내면의 지혜와 연결하는 시간 갖기');
    }
    
    const challengeCards = cards.filter(c => c.orientation === 'reversed');
    if (challengeCards.length > 0) {
      opportunities.push('도전을 통한 내적 강인함 구축');
    }
    
    return opportunities;
  }
  
  private static generateSoulLessons(cards: TarotCard[], topic: string): string[] {
    const lessons: string[] = [];
    
    const majorCards = cards.filter(c => c.arcana === 'major');
    
    if (majorCards.some(c => c.name.includes('World'))) {
      lessons.push('완성과 새로운 시작의 순환 이해하기');
    }
    
    if (majorCards.some(c => c.name.includes('Wheel of Fortune'))) {
      lessons.push('운명의 수레바퀴를 받아들이는 지혜');
    }
    
    if (topic === 'love') {
      lessons.push('무조건적인 사랑의 진정한 의미 배우기');
    }
    
    return lessons;
  }
  
  private static generateSpiritualGifts(cards: TarotCard[]): string[] {
    const gifts: string[] = [];
    
    if (cards.some(c => c.name.includes('Magician'))) {
      gifts.push('현실 창조의 능력');
    }
    
    if (cards.some(c => c.name.includes('High Priestess'))) {
      gifts.push('직관력과 영적 통찰력');
    }
    
    if (cards.some(c => c.name.includes('Star'))) {
      gifts.push('희망과 영감을 전달하는 능력');
    }
    
    return gifts;
  }
  
  private static generateChakraActivations(cards: TarotCard[], elements: Record<string, number>): string[] {
    const activations: string[] = [];
    
    if (elements.earth > 2) {
      activations.push('루트 차크라 - 안정과 기반 강화');
    }
    
    if (elements.water > 2) {
      activations.push('천골 차크라 - 창조성과 감정의 흐름');
    }
    
    if (elements.fire > 2) {
      activations.push('태양신경총 차크라 - 개인의 힘과 의지');
    }
    
    if (elements.air > 2) {
      activations.push('목 차크라 - 진실된 소통과 표현');
    }
    
    if (elements.spirit > 2) {
      activations.push('크라운 차크라 - 우주적 연결과 깨달음');
    }
    
    return activations;
  }
  
  private static generateShadowMessage(card: TarotCard, topic: string): string {
    const cardName = card.nameKr || card.name;
    
    // 카드별 그림자 메시지
    const shadowMessages: Record<string, string> = {
      'The Fool': '순진함 뒤에 숨은 두려움을 직시하세요',
      'The Magician': '조작하려는 욕구를 인정하고 진정성을 찾으세요',
      'The High Priestess': '직관을 무시하는 습관을 버리세요',
      'The Empress': '과도한 통제욕을 내려놓으세요',
      'The Emperor': '권위에 대한 저항을 이해하세요',
      'The Lovers': '선택에 대한 두려움을 극복하세요',
      'Death': '변화에 대한 저항을 놓아주세요',
      'The Devil': '중독적 패턴을 인식하고 해방하세요'
    };
    
    // 카드 이름으로 메시지 찾기
    for (const [key, message] of Object.entries(shadowMessages)) {
      if (card.name.includes(key)) {
        return message;
      }
    }
    
    // 기본 메시지
    if (topic === 'love') {
      return '사랑에 대한 숨겨진 두려움과 마주하세요';
    } else if (topic === 'career') {
      return '성공에 대한 내면의 저항을 탐구하세요';
    }
    
    return '무의식 속 억압된 감정을 인정하고 통합하세요';
  }
  
  private static generateSynthesis(cards: TarotCard[], topic: string, majorCount: number, uprightCount: number): string {
    let synthesis = '';
    
    const balance = uprightCount / cards.length;
    const spiritualWeight = majorCount / cards.length;
    
    if (spiritualWeight > 0.5) {
      synthesis += '이 점괘는 깊은 영적 메시지를 담고 있습니다. 우주가 당신에게 중요한 전환점을 알리고 있습니다. ';
    }
    
    if (balance > 0.7) {
      synthesis += '전반적으로 매우 긍정적인 에너지가 흐르고 있습니다. 지금이 바로 행동할 때입니다. ';
    } else if (balance < 0.3) {
      synthesis += '도전적인 시기이지만, 이는 깊은 내적 성장을 위한 필수적인 과정입니다. ';
    } else {
      synthesis += '빛과 그림자가 균형을 이루고 있습니다. 양면성을 받아들이고 통합하세요. ';
    }
    
    if (topic === 'love') {
      synthesis += '사랑은 거울과 같아서, 당신의 내면을 비춥니다. 이 카드들이 보여주는 것은 단순한 관계의 미래가 아니라, 당신 자신의 성장 여정입니다.';
    } else if (topic === 'career') {
      synthesis += '진정한 성공은 외적 성취뿐만 아니라 내적 만족에서 옵니다. 이 카드들은 당신의 소명을 찾는 여정을 안내합니다.';
    } else {
      synthesis += '삶은 끊임없는 변화의 춤입니다. 이 순간의 메시지를 받아들이고, 우주의 리듬에 몸을 맡기세요.';
    }
    
    return synthesis;
  }
  
  private static generateKeyInsights(cards: TarotCard[], topic: string, elements: Record<string, number>, numberPatterns: Record<number, number>): string[] {
    const insights: string[] = [];
    
    // 원소 기반 인사이트
    const dominantElement = Object.entries(elements).reduce((a, b) => elements[a] > elements[b[0]] ? a : b[0]);
    
    switch (dominantElement) {
      case 'fire':
        insights.push('열정과 창조적 에너지가 당신의 길을 밝히고 있습니다');
        break;
      case 'water':
        insights.push('감정의 깊은 바다가 당신에게 직관적 지혜를 선사합니다');
        break;
      case 'air':
        insights.push('명확한 사고와 소통이 문제 해결의 열쇠입니다');
        break;
      case 'earth':
        insights.push('현실적 기반과 인내가 성공으로 이끕니다');
        break;
      case 'spirit':
        insights.push('높은 차원의 인도가 당신과 함께합니다');
        break;
    }
    
    // 숫자 패턴 인사이트
    Object.entries(numberPatterns).forEach(([number, count]) => {
      if (count >= 2) {
        const num = parseInt(number);
        if (num === 1) insights.push('새로운 시작의 에너지가 강력하게 작용하고 있습니다');
        else if (num === 2) insights.push('균형과 파트너십이 중요한 시기입니다');
        else if (num === 3) insights.push('창조성과 표현의 시간입니다');
        else if (num === 7) insights.push('내면의 탐구와 영적 성장의 시기입니다');
        else if (num === 10) insights.push('한 사이클의 완성과 새로운 시작이 동시에 일어납니다');
      }
    });
    
    // 특별한 카드 조합 인사이트
    if (cards.some(c => c.name.includes('Death')) && cards.some(c => c.name.includes('Fool'))) {
      insights.push('끝과 시작이 만나는 강력한 변화의 순간입니다');
    }
    
    if (cards.some(c => c.name.includes('Sun')) && cards.some(c => c.name.includes('Moon'))) {
      insights.push('의식과 무의식의 완벽한 통합이 일어나고 있습니다');
    }
    
    return insights;
  }
  
  private static generateActionPlan(cards: TarotCard[], topic: string): DeepInterpretation['actionPlan'] {
    const actionPlan: DeepInterpretation['actionPlan'] = {
      immediate: [],
      weekly: [],
      monthly: []
    };
    
    // 즉시 실행 항목 (24-48시간)
    if (cards.some(c => c.name.includes('Fool') || c.name.includes('Magician'))) {
      actionPlan.immediate?.push('새로운 프로젝트나 아이디어를 시작하세요');
    }
    
    if (cards.some(c => c.orientation === 'reversed')) {
      actionPlan.immediate?.push('내면의 목소리에 귀 기울이는 명상 시간을 가지세요');
    }
    
    if (topic === 'love') {
      actionPlan.immediate?.push('마음속 진실한 감정을 일기에 적어보세요');
    }
    
    // 주간 실행 항목
    if (cards.some(c => c.name.includes('Hermit'))) {
      actionPlan.weekly?.push('혼자만의 시간을 통해 내면을 탐구하세요');
    }
    
    if (cards.some(c => c.suit === 'pentacles')) {
      actionPlan.weekly?.push('재정 계획을 점검하고 실질적인 목표를 설정하세요');
    }
    
    actionPlan.weekly?.push('이번 주 매일 하나씩 작은 긍정적 변화를 실천하세요');
    
    // 월간 실행 항목
    if (cards.some(c => c.name.includes('World') || c.name.includes('Ten'))) {
      actionPlan.monthly?.push('큰 프로젝트를 완성하거나 새로운 장을 시작하세요');
    }
    
    actionPlan.monthly?.push('한 달 후 이 점괘를 다시 보며 성장을 확인하세요');
    actionPlan.monthly?.push('배운 교훈을 바탕으로 장기 계획을 수립하세요');
    
    return actionPlan;
  }
  
  private static generateAffirmations(cards: TarotCard[], topic: string): string[] {
    const affirmations: string[] = [];
    
    // 일반 확언
    affirmations.push('나는 우주의 인도를 신뢰하고 따릅니다');
    
    // 주제별 확언
    if (topic === 'love') {
      affirmations.push('나는 사랑받을 자격이 있으며, 진정한 사랑을 끌어당깁니다');
    } else if (topic === 'career') {
      affirmations.push('나의 재능과 열정이 풍요로운 성공으로 이어집니다');
    } else if (topic === 'money') {
      affirmations.push('풍요는 나의 자연스러운 상태이며, 나는 번영을 받아들입니다');
    }
    
    // 카드 기반 확언
    if (cards.some(c => c.name.includes('Star'))) {
      affirmations.push('희망의 빛이 항상 나를 인도합니다');
    }
    
    if (cards.some(c => c.name.includes('Strength'))) {
      affirmations.push('나는 내면의 힘과 용기로 모든 도전을 극복합니다');
    }
    
    return affirmations;
  }
  
  private static checkSpecialCombinations(cards: TarotCard[]): CardCombination[] {
    const combinations: CardCombination[] = [];
    const cardNames = cards.map(c => c.name);
    
    // 운명의 트리오
    if (cardNames.includes('The Fool') && cardNames.includes('The Magician') && cardNames.includes('The World')) {
      combinations.push({
        type: 'special',
        meaning: '완벽한 여정의 순환 - 시작, 창조, 완성이 모두 나타났습니다',
        advice: '인생의 큰 전환점에 있습니다. 과거를 마무리하고 새로운 장을 시작하세요'
      });
    }
    
    // 사랑의 축복
    if (cardNames.includes('The Lovers') && cardNames.includes('The Sun')) {
      combinations.push({
        type: 'special',
        meaning: '진정한 사랑과 기쁨의 결합',
        advice: '관계에서 큰 행복과 성취가 예상됩니다'
      });
    }
    
    // 변화의 관문
    if (cardNames.includes('Death') && cardNames.includes('The Tower')) {
      combinations.push({
        type: 'special',
        meaning: '급격한 변화와 재탄생의 시기',
        advice: '오래된 것을 놓아주고 새로운 것을 받아들일 준비를 하세요'
      });
    }
    
    return combinations;
  }
  
  private static checkSuitCombinations(cards: TarotCard[]): CardCombination[] {
    const combinations: CardCombination[] = [];
    const suitCounts: Record<string, number> = {};
    
    cards.forEach(card => {
      if (card.suit) {
        suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
      }
    });
    
    Object.entries(suitCounts).forEach(([suit, count]) => {
      if (count >= 3) {
        let meaning = '';
        let advice = '';
        
        switch (suit) {
          case 'cups':
            meaning = '감정과 직관이 강하게 작용하는 시기';
            advice = '마음의 소리에 귀 기울이고 감정을 신뢰하세요';
            break;
          case 'wands':
            meaning = '열정과 창조적 에너지가 넘치는 시기';
            advice = '아이디어를 행동으로 옮기고 열정을 따르세요';
            break;
          case 'swords':
            meaning = '논리적 사고와 명확한 소통이 필요한 시기';
            advice = '생각을 정리하고 명확하게 의사를 전달하세요';
            break;
          case 'pentacles':
            meaning = '물질적 안정과 실용적 접근이 중요한 시기';
            advice = '현실적인 계획을 세우고 꾸준히 실행하세요';
            break;
        }
        
        combinations.push({
          type: 'suit',
          meaning,
          advice
        });
      }
    });
    
    return combinations;
  }
  
  private static checkNumberRelationships(cards: TarotCard[]): CardCombination[] {
    const combinations: CardCombination[] = [];
    const numbers = cards.map(c => c.number).filter(n => n !== undefined && n !== null) as number[];
    
    // 연속된 숫자 체크
    const sorted = [...new Set(numbers)].sort((a, b) => a - b);
    let consecutive = 1;
    
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === sorted[i-1] + 1) {
        consecutive++;
      } else {
        consecutive = 1;
      }
      
      if (consecutive >= 3) {
        combinations.push({
          type: 'number',
          meaning: '단계적 발전과 자연스러운 진행을 나타냅니다',
          advice: '과정을 신뢰하고 한 걸음씩 나아가세요'
        });
        break;
      }
    }
    
    // 같은 숫자 반복
    const numberCounts: Record<number, number> = {};
    numbers.forEach(n => {
      numberCounts[n] = (numberCounts[n] || 0) + 1;
    });
    
    Object.entries(numberCounts).forEach(([num, count]) => {
      if (count >= 2) {
        const number = parseInt(num);
        if (number === 1) {
          combinations.push({
            type: 'number',
            meaning: '여러 영역에서 동시에 새로운 시작이 일어납니다',
            advice: '각 영역의 새로운 기회를 놓치지 마세요'
          });
        } else if (number === 10) {
          combinations.push({
            type: 'number',
            meaning: '여러 사이클이 동시에 완성되고 있습니다',
            advice: '완성을 축하하고 다음 단계를 준비하세요'
          });
        }
      }
    });
    
    return combinations;
  }
  
  private static checkElementCombinations(cards: TarotCard[]): CardCombination[] {
    const combinations: CardCombination[] = [];
    const elements = this.analyzeElements(cards);
    
    // 상호 보완적 원소
    if (elements.fire >= 2 && elements.water >= 2) {
      combinations.push({
        type: 'element',
        meaning: '열정(불)과 감정(물)이 균형을 이루고 있습니다',
        advice: '창조적 에너지와 감정적 깊이를 조화롭게 활용하세요'
      });
    }
    
    if (elements.air >= 2 && elements.earth >= 2) {
      combinations.push({
        type: 'element',
        meaning: '사고(공기)와 실행(땅)이 조화를 이룹니다',
        advice: '아이디어를 현실로 구현할 완벽한 시기입니다'
      });
    }
    
    // 모든 원소가 존재
    if (elements.fire > 0 && elements.water > 0 && elements.air > 0 && elements.earth > 0) {
      combinations.push({
        type: 'element',
        meaning: '네 원소가 모두 존재하여 완벽한 균형을 이룹니다',
        advice: '모든 측면에서 조화로운 접근이 가능한 시기입니다'
      });
    }
    
    return combinations;
  }
}
