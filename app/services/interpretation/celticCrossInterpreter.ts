import { supabase } from '@/config/supabase';

interface CardInfo {
  id: number;
  name: string;
  nameKr: string;
  arcana: string;
  suit?: string;
  number?: number;
  element?: string;
  keywords: any;
  meanings: any;
  orientation: 'upright' | 'reversed';
}

interface PositionInfo {
  position: number;
  card: CardInfo;
  meaning: string;
}

interface InterpretationResult {
  positions: PositionInfo[];
  relationships: string[];
  overallPattern: string;
  advice: string;
  keywords: string[];
}

export class CelticCrossInterpreter {
  private cards: CardInfo[];
  private topic: string;
  
  // 켈틱 크로스 위치 의미
  private positionMeanings = {
    1: { name: '현재내면', focus: 'inner_state' },
    2: { name: '현재외부', focus: 'external_challenge' },
    3: { name: '근본', focus: 'foundation' },
    4: { name: '과거', focus: 'past_influence' },
    5: { name: '드러나는 모습', focus: 'conscious_goals' },
    6: { name: '미래', focus: 'near_future' },
    7: { name: '내가보는나', focus: 'self_perception' },
    8: { name: '남이보는나', focus: 'external_perception' },
    9: { name: '예상하는 결과', focus: 'hopes_fears' },
    10: { name: '실제 결과', focus: 'final_outcome' }
  };

  constructor(cards: CardInfo[], topic: string = 'general') {
    this.cards = cards;
    this.topic = topic;
  }

  async generateInterpretation(): Promise<InterpretationResult> {
    const positions = await this.interpretPositions();
    const relationships = await this.analyzeRelationships();
    const overallPattern = await this.identifyPattern();
    const advice = this.generateAdvice(positions, relationships, overallPattern);
    const keywords = this.extractKeywords();

    return {
      positions,
      relationships,
      overallPattern,
      advice,
      keywords
    };
  }

  private async interpretPositions(): Promise<PositionInfo[]> {
    const interpretations: PositionInfo[] = [];

    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      const position = i + 1;
      const positionInfo = this.positionMeanings[position];

      // 먼저 DB에서 특정 해석이 있는지 확인
      const { data: dbInterpretation } = await supabase
        .from('position_interpretations')
        .select('interpretation')
        .eq('spread_id', 'celtic_cross')
        .eq('position', position)
        .eq('card_id', card.id)
        .eq('orientation', card.orientation)
        .eq('topic', this.topic)
        .single();

      let meaning: string;
      if (dbInterpretation) {
        meaning = dbInterpretation.interpretation;
      } else {
        // DB에 없으면 동적으로 생성
        meaning = this.generatePositionMeaning(card, position, positionInfo);
      }

      interpretations.push({
        position,
        card,
        meaning
      });
    }

    return interpretations;
  }

  private generatePositionMeaning(card: CardInfo, position: number, positionInfo: any): string {
    const orientation = card.orientation === 'upright' ? '정방향' : '역방향';
    const keywords = card.keywords[card.orientation] || [];
    const generalMeaning = card.meanings[this.topic]?.[card.orientation] || 
                          card.meanings.general[card.orientation];

    // 위치별 맞춤 해석 생성
    switch (position) {
      case 1: // 현재내면
        return `${card.nameKr} ${orientation}이 당신의 현재 내면을 나타냅니다. ${generalMeaning} ` +
               `이는 당신이 지금 ${keywords[0]}의 상태에 있음을 보여줍니다.`;
      
      case 2: // 현재외부
        return `${card.nameKr} ${orientation}이 현재 직면한 도전이나 영향을 나타냅니다. ` +
               `${generalMeaning} 이 상황은 당신에게 ${keywords[1] || keywords[0]}을(를) 요구하고 있습니다.`;
      
      case 3: // 근본
        return `${card.nameKr} ${orientation}이 현재 상황의 근본적인 원인이나 기반을 보여줍니다. ` +
               `${generalMeaning} 모든 것의 뿌리에는 ${keywords[0]}이(가) 있습니다.`;
      
      case 4: // 과거
        return `과거에 ${card.nameKr} ${orientation}의 영향이 있었습니다. ${generalMeaning} ` +
               `이 과거의 ${keywords[0]}은(는) 현재까지 영향을 미치고 있습니다.`;
      
      case 5: // 드러나는 모습
        const futureKeyword = card.orientation === 'upright' 
          ? this.getPositiveAspect(keywords[0])
          : this.getChallengeAspect(keywords[0]);
        return `${card.nameKr} ${orientation}이 앞으로 나타날 가능성을 보여줍니다. ` +
               `${generalMeaning} ${futureKeyword}이(가) 드러날 것입니다.`;
      
      case 6: // 미래
        return `가까운 미래에 ${card.nameKr} ${orientation}의 상황이 펼쳐질 것입니다. ` +
               `${generalMeaning} ${keywords[0]}의 시기가 다가오고 있습니다.`;
      
      case 7: // 내가보는나
        return `당신은 스스로를 ${card.nameKr} ${orientation}으로 인식하고 있습니다. ` +
               `${generalMeaning} 자신을 ${keywords[0]}의 존재로 보고 있습니다.`;
      
      case 8: // 남이보는나
        return `다른 사람들은 당신을 ${card.nameKr} ${orientation}으로 봅니다. ` +
               `${generalMeaning} 주변에서는 당신의 ${keywords[0]}을(를) 인식하고 있습니다.`;
      
      case 9: // 예상하는 결과
        const hopeOrFear = card.orientation === 'upright' ? '희망' : '두려움';
        return `${card.nameKr} ${orientation}이 당신의 ${hopeOrFear}을 나타냅니다. ` +
               `${generalMeaning} ${keywords[0]}을(를) ${hopeOrFear}하고 있습니다.`;
      
      case 10: // 실제 결과
        return `최종적으로 ${card.nameKr} ${orientation}의 결과가 나타날 것입니다. ` +
               `${generalMeaning} ${keywords[0]}의 결실을 맺게 될 것입니다.`;
      
      default:
        return generalMeaning;
    }
  }

  private async analyzeRelationships(): Promise<string[]> {
    const relationships: string[] = [];

    // 1. 현재 내면(1)과 외부(2)의 관계
    const innerOuter = await this.compareCards(this.cards[0], this.cards[1]);
    if (innerOuter) relationships.push(innerOuter);

    // 2. 과거(4)-현재(1)-미래(6)의 흐름
    const timeline = this.analyzeTimeline();
    if (timeline) relationships.push(timeline);

    // 3. 자아 인식의 차이 (7번과 8번)
    const selfPerception = await this.analyzeSelfPerception();
    if (selfPerception) relationships.push(selfPerception);

    // 4. 기대(9)와 결과(10)의 관계
    const expectationResult = await this.compareExpectationAndResult();
    if (expectationResult) relationships.push(expectationResult);

    // 5. 원소 상호작용 분석
    const elementInteractions = await this.analyzeElements();
    relationships.push(...elementInteractions);

    return relationships;
  }

  private async compareCards(card1: CardInfo, card2: CardInfo): Promise<string | null> {
    // DB에서 카드 조합 확인
    const { data: combination } = await supabase
      .from('card_combinations')
      .select('interpretation, relationship_type')
      .or(`card1_id.eq.${card1.id},card2_id.eq.${card1.id}`)
      .or(`card1_id.eq.${card2.id},card2_id.eq.${card2.id}`)
      .single();

    if (combination) {
      return combination.interpretation;
    }

    // 동적 비교
    if (card1.arcana === 'major' && card2.arcana === 'major') {
      return this.compareMajorCards(card1, card2);
    }

    return this.compareByElement(card1, card2);
  }

  private compareMajorCards(card1: CardInfo, card2: CardInfo): string {
    const num1 = card1.number || 0;
    const num2 = card2.number || 0;

    if (Math.abs(num1 - num2) === 1) {
      return `${card1.nameKr}와 ${card2.nameKr}는 연속된 여정을 나타내며, 자연스러운 진화의 과정을 보여줍니다.`;
    }

    if ((num1 <= 9 && num2 <= 9) || (num1 >= 10 && num2 >= 10)) {
      return `${card1.nameKr}와 ${card2.nameKr}는 같은 차원의 경험을 나타내며, 서로를 강화합니다.`;
    }

    return `${card1.nameKr}와 ${card2.nameKr}는 서로 다른 차원의 메시지를 전달하며, 균형을 맞춰야 합니다.`;
  }

  private compareByElement(card1: CardInfo, card2: CardInfo): string {
    if (!card1.element || !card2.element) return '';

    const elementRelations = {
      'Fire-Water': '열정과 감정이 만나 강렬한 변화를 일으킵니다.',
      'Fire-Air': '열정과 지성이 조화를 이루어 창의적인 해결책을 만듭니다.',
      'Fire-Earth': '열정이 현실적 토대 위에서 구체화됩니다.',
      'Water-Air': '감정과 이성 사이에서 균형을 찾아야 합니다.',
      'Water-Earth': '감정이 안정적인 기반 위에서 성장합니다.',
      'Air-Earth': '아이디어가 현실로 구현될 준비가 되었습니다.'
    };

    const key = [card1.element, card2.element].sort().join('-');
    return elementRelations[key] || `${card1.element}와 ${card2.element}의 에너지가 상호작용하고 있습니다.`;
  }

  private analyzeTimeline(): string {
    const past = this.cards[3];
    const present = this.cards[0];
    const future = this.cards[5];

    // 긍정적 흐름
    if (past.orientation === 'reversed' && 
        present.orientation === 'upright' && 
        future.orientation === 'upright') {
      return '과거의 어려움을 극복하고 현재는 안정을 찾았으며, 미래는 더욱 밝아질 것입니다.';
    }

    // 도전적 흐름
    if (past.orientation === 'upright' && 
        present.orientation === 'reversed' && 
        future.orientation === 'upright') {
      return '현재는 과도기적 어려움을 겪고 있지만, 이는 더 나은 미래를 위한 준비 과정입니다.';
    }

    // 주의가 필요한 흐름
    if (past.orientation === 'upright' && 
        present.orientation === 'upright' && 
        future.orientation === 'reversed') {
      return '현재는 안정적이지만 미래에 대한 준비가 필요합니다. 예상치 못한 변화에 대비하세요.';
    }

    return '과거, 현재, 미래가 유기적으로 연결되어 있으며, 각 시기의 교훈을 통합하는 것이 중요합니다.';
  }

  private async analyzeSelfPerception(): Promise<string> {
    const self = this.cards[6]; // 내가보는나
    const others = this.cards[7]; // 남이보는나

    if (self.id === others.id) {
      return '당신의 자아 인식과 타인의 인식이 일치합니다. 진정성 있는 모습을 보여주고 있습니다.';
    }

    if (self.arcana === 'major' && others.arcana === 'minor') {
      return '당신은 자신을 중요한 변화의 중심에 있다고 보지만, 타인은 일상적인 모습만을 봅니다.';
    }

    if (self.orientation !== others.orientation && self.id === others.id) {
      return '같은 특성이지만 당신과 타인이 다르게 해석하고 있습니다. 소통을 통해 간극을 좁혀보세요.';
    }

    return '자아 인식과 타인의 인식 사이에 차이가 있습니다. 열린 마음으로 피드백을 받아들이세요.';
  }

  private async compareExpectationAndResult(): Promise<string> {
    const expectation = this.cards[8];
    const result = this.cards[9];

    if (expectation.orientation === 'upright' && result.orientation === 'upright') {
      return '긍정적인 기대가 실제로 이루어질 가능성이 높습니다. 계속해서 노력하세요.';
    }

    if (expectation.orientation === 'reversed' && result.orientation === 'upright') {
      return '두려워하던 것보다 훨씬 좋은 결과가 나타날 것입니다. 걱정을 내려놓으세요.';
    }

    if (expectation.orientation === 'upright' && result.orientation === 'reversed') {
      return '기대와 다른 결과가 나올 수 있지만, 이는 더 큰 성장을 위한 과정입니다.';
    }

    return '예상하지 못한 방향으로 전개될 수 있습니다. 유연한 대처가 필요합니다.';
  }

  private async analyzeElements(): Promise<string[]> {
    const elements: string[] = [];
    const elementCounts: Record<string, number> = {};

    // 원소 카운트
    this.cards.forEach(card => {
      if (card.element) {
        elementCounts[card.element] = (elementCounts[card.element] || 0) + 1;
      }
    });

    // 지배적인 원소 분석
    const dominantElement = Object.entries(elementCounts)
      .sort(([, a], [, b]) => b - a)[0];

    if (dominantElement && dominantElement[1] >= 3) {
      const [element, count] = dominantElement;
      elements.push(this.getElementDominanceMessage(element, count));
    }

    // 부족한 원소 분석
    const missingElements = ['Fire', 'Water', 'Air', 'Earth']
      .filter(el => !elementCounts[el]);

    if (missingElements.length > 0) {
      elements.push(this.getMissingElementMessage(missingElements));
    }

    return elements;
  }

  private getElementDominanceMessage(element: string, count: number): string {
    const messages = {
      'Fire': `불의 에너지가 강합니다(${count}장). 열정과 행동력이 넘치지만 성급함에 주의하세요.`,
      'Water': `물의 에너지가 강합니다(${count}장). 감정과 직관이 예민하지만 감정에 휩쓸리지 마세요.`,
      'Air': `바람의 에너지가 강합니다(${count}장). 명확한 사고력이 있지만 지나친 분석은 피하세요.`,
      'Earth': `땅의 에너지가 강합니다(${count}장). 안정적이고 실용적이지만 유연성도 필요합니다.`
    };
    return messages[element] || '';
  }

  private getMissingElementMessage(elements: string[]): string {
    const elementNames = {
      'Fire': '열정과 추진력',
      'Water': '감정과 직관',
      'Air': '소통과 사고력',
      'Earth': '안정성과 실용성'
    };

    const missing = elements.map(el => elementNames[el]).join(', ');
    return `${missing}이 부족할 수 있습니다. 균형을 맞추는 것이 중요합니다.`;
  }

  private async identifyPattern(): Promise<string> {
    // DB에서 패턴 확인
    const { data: patterns } = await supabase
      .from('celtic_cross_patterns')
      .select('*')
      .order('priority', { ascending: false });

    if (patterns) {
      for (const pattern of patterns) {
        if (this.matchesPattern(pattern.conditions)) {
          return pattern.interpretation_template;
        }
      }
    }

    // 기본 패턴 분석
    return this.generateDefaultPattern();
  }

  private matchesPattern(conditions: any): boolean {
    // 패턴 매칭 로직
    if (conditions.positions) {
      for (const [pos, condition] of Object.entries(conditions.positions)) {
        const cardIndex = parseInt(pos) - 1;
        const card = this.cards[cardIndex];

        if (condition === 'positive' && card.orientation !== 'upright') {
          return false;
        }
        if (condition === 'negative' && card.orientation !== 'reversed') {
          return false;
        }
      }
    }
    return true;
  }

  private generateDefaultPattern(): string {
    const uprightCount = this.cards.filter(c => c.orientation === 'upright').length;
    const majorCount = this.cards.filter(c => c.arcana === 'major').length;

    if (uprightCount >= 7) {
      return '전반적으로 긍정적인 에너지가 우세합니다. 현재의 방향을 유지하면서 기회를 최대한 활용하세요.';
    }

    if (uprightCount <= 3) {
      return '도전적인 시기를 겪고 있습니다. 하지만 이는 성장을 위한 필수적인 과정입니다.';
    }

    if (majorCount >= 6) {
      return '중요한 인생의 전환점에 있습니다. 우주의 메시지에 귀 기울이고 큰 그림을 보세요.';
    }

    return '균형과 조화가 필요한 시기입니다. 각 측면을 통합하여 전진하세요.';
  }

  private generateAdvice(positions: PositionInfo[], relationships: string[], pattern: string): string {
    const advice: string[] = [];

    // 핵심 카드 기반 조언
    const present = positions[0].card;
    const challenge = positions[1].card;
    const outcome = positions[9].card;

    // 현재 상황에 대한 조언
    if (present.orientation === 'upright') {
      advice.push(`${present.nameKr}의 긍정적인 에너지를 최대한 활용하세요.`);
    } else {
      advice.push(`${present.nameKr} 역방향이 나타내는 과제를 정면으로 마주하세요.`);
    }

    // 도전 극복 조언
    if (challenge.arcana === 'major') {
      advice.push('현재의 도전은 인생의 중요한 교훈을 담고 있습니다. 깊이 있게 성찰하세요.');
    }

    // 결과 달성을 위한 조언
    if (outcome.orientation === 'upright') {
      advice.push('긍정적인 결과를 위해 현재의 노력을 지속하세요.');
    } else {
      advice.push('예상과 다른 결과가 나올 수 있지만, 이 또한 성장의 기회입니다.');
    }

    // 주제별 특별 조언
    const topicAdvice = this.getTopicSpecificAdvice();
    if (topicAdvice) advice.push(topicAdvice);

    return advice.join(' ');
  }

  private getTopicSpecificAdvice(): string {
    const adviceMap = {
      'love': '사랑은 상호 이해와 소통에서 시작됩니다. 마음을 열고 진실되게 대하세요.',
      'career': '목표를 명확히 하고 단계별로 접근하세요. 인내심이 성공의 열쇠입니다.',
      'money': '재정적 안정을 위해서는 장기적인 관점이 필요합니다. 충동적인 결정은 피하세요.',
      'health': '몸과 마음의 균형을 유지하세요. 작은 습관의 변화가 큰 결과를 만듭니다.',
      'general': '전체적인 그림을 보면서도 현재에 충실하세요. 모든 경험은 성장의 기회입니다.'
    };

    return adviceMap[this.topic] || adviceMap.general;
  }

  private extractKeywords(): string[] {
    const keywords = new Set<string>();

    // 각 카드의 핵심 키워드 추출
    this.cards.forEach(card => {
      const cardKeywords = card.keywords[card.orientation] || [];
      if (cardKeywords.length > 0) {
        keywords.add(cardKeywords[0]);
      }
    });

    // 전체적인 분위기 키워드 추가
    const uprightCount = this.cards.filter(c => c.orientation === 'upright').length;
    if (uprightCount >= 7) {
      keywords.add('긍정적 전망');
    } else if (uprightCount <= 3) {
      keywords.add('도전과 성장');
    } else {
      keywords.add('균형 필요');
    }

    return Array.from(keywords).slice(0, 5);
  }

  private getPositiveAspect(keyword: string): string {
    const positiveAspects = {
      '새로운 시작': '신선한 기회',
      '변화': '긍정적 전환',
      '도전': '성장의 기회',
      '혼란': '새로운 관점',
      '끝': '새로운 시작'
    };
    return positiveAspects[keyword] || keyword;
  }

  private getChallengeAspect(keyword: string): string {
    const challengeAspects = {
      '안정': '정체',
      '성공': '자만',
      '사랑': '집착',
      '지혜': '고립',
      '힘': '남용'
    };
    return challengeAspects[keyword] || `${keyword}의 그림자`;
  }
}
