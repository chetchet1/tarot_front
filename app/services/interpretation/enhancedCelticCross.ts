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
  topicSpecificMeaning?: string;
  focusAreas?: string[];
}

interface RelationshipAnalysis {
  type: string;
  positions: number[];
  interpretation: string;
  strength: number;
}

interface ActionSuggestion {
  timeFrame: string;
  actionType: string;
  suggestion: string;
  priority: number;
}

interface EnhancedInterpretationResult {
  positions: PositionInfo[];
  relationships: RelationshipAnalysis[];
  overallPattern: {
    name: string;
    description: string;
    message: string;
  };
  synergies: {
    type: string;
    cards: string[];
    interpretation: string;
    strength: number;
  }[];
  advice: {
    immediate: ActionSuggestion[];
    shortTerm: ActionSuggestion[];
    longTerm: ActionSuggestion[];
  };
  keywords: string[];
  overallMessage: string;
}

export class EnhancedCelticCrossInterpreter {
  private cards: CardInfo[];
  private topic: string;
  private userName: string;
  
  constructor(cards: CardInfo[], topic: string = 'general', userName: string = '당신') {
    this.cards = cards;
    this.topic = topic;
    this.userName = userName;
  }

  async generateEnhancedInterpretation(): Promise<EnhancedInterpretationResult> {
    // 1. 주제별 특화된 위치 해석
    const positions = await this.interpretPositionsWithTopic();
    
    // 2. 카드 조합 패턴 분석
    const relationships = await this.analyzeEnhancedRelationships();
    
    // 3. 전체적인 패턴 인식
    const overallPattern = await this.identifyEnhancedPattern();
    
    // 4. 카드 시너지 분석
    const synergies = await this.analyzeSynergies();
    
    // 5. 구체적인 행동 제안
    const advice = await this.generateActionableAdvice();
    
    // 6. 핵심 키워드 추출
    const keywords = this.extractEnhancedKeywords();
    
    // 7. 종합 메시지 생성
    const overallMessage = await this.generatePersonalizedMessage(
      positions, relationships, overallPattern, synergies
    );

    return {
      positions,
      relationships,
      overallPattern,
      synergies,
      advice,
      keywords,
      overallMessage
    };
  }

  private async interpretPositionsWithTopic(): Promise<PositionInfo[]> {
    const interpretations: PositionInfo[] = [];

    // DB에서 주제별 위치 의미 가져오기
    const { data: topicMeanings } = await supabase
      .from('topic_position_meanings')
      .select('*')
      .eq('spread_id', 'celtic_cross')
      .eq('topic', this.topic);

    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      const position = i + 1;
      
      // 주제별 위치 의미 찾기
      const topicMeaning = topicMeanings?.find(tm => tm.position === position);
      
      // DB에서 특정 카드-위치-주제 조합의 해석 확인
      const { data: specificInterpretation } = await supabase
        .from('position_interpretations')
        .select('interpretation')
        .eq('spread_id', 'celtic_cross')
        .eq('position', position)
        .eq('card_id', card.id)
        .eq('orientation', card.orientation)
        .eq('topic', this.topic)
        .single();

      let meaning: string;
      let topicSpecificMeaning: string | undefined;
      
      if (specificInterpretation) {
        meaning = specificInterpretation.interpretation;
      } else {
        // 동적으로 생성
        meaning = await this.generateEnhancedPositionMeaning(
          card, position, topicMeaning
        );
      }
      
      // 주제별 추가 해석
      if (topicMeaning) {
        topicSpecificMeaning = this.generateTopicContext(
          card, topicMeaning.position_question
        );
      }

      interpretations.push({
        position,
        card,
        meaning,
        topicSpecificMeaning,
        focusAreas: topicMeaning?.focus_areas || []
      });
    }

    return interpretations;
  }

  private async generateEnhancedPositionMeaning(
    card: CardInfo, 
    position: number, 
    topicMeaning: any
  ): string {
    const orientation = card.orientation === 'upright' ? '정방향' : '역방향';
    const keywords = card.keywords[card.orientation] || [];
    const meaning = card.meanings[this.topic]?.[card.orientation] || 
                   card.meanings.general[card.orientation];

    // 주제별 맥락 추가
    const context = topicMeaning ? 
      `${topicMeaning.position_title}을 살펴보면, ` : 
      `${position}번 위치에서 `;

    // 카드 해석
    const cardInterpretation = `${card.nameKr} ${orientation}이 나타났습니다. ${meaning}`;
    
    // 포커스 영역 강조
    const focusEmphasis = topicMeaning?.focus_areas?.length > 0 ?
      ` 특히 ${topicMeaning.focus_areas[0]}에 주목하세요.` : '';

    return context + cardInterpretation + focusEmphasis;
  }

  private generateTopicContext(card: CardInfo, question: string): string {
    const keyword = card.keywords[card.orientation]?.[0] || '변화';
    
    if (this.topic === 'love') {
      return `${question}에 대한 답은 '${keyword}'입니다. ` +
             `연애에서 이는 ${this.getLoveContext(keyword)}를 의미합니다.`;
    } else if (this.topic === 'career') {
      return `${question}에 대한 답은 '${keyword}'입니다. ` +
             `직업적으로 이는 ${this.getCareerContext(keyword)}를 뜻합니다.`;
    } else if (this.topic === 'money') {
      return `${question}에 대한 답은 '${keyword}'입니다. ` +
             `재정적으로 이는 ${this.getMoneyContext(keyword)}를 나타냅니다.`;
    }
    
    return `${question}에 대한 핵심은 '${keyword}'입니다.`;
  }

  private getLoveContext(keyword: string): string {
    const contextMap = {
      '새로운 시작': '새로운 만남이나 관계의 새로운 국면',
      '안정': '서로에 대한 신뢰와 편안함',
      '변화': '관계의 발전이나 전환',
      '도전': '함께 극복해야 할 시련',
      '성장': '사랑을 통한 개인적 성숙'
    };
    return contextMap[keyword] || keyword;
  }

  private getCareerContext(keyword: string): string {
    const contextMap = {
      '새로운 시작': '새 프로젝트나 직장',
      '안정': '현재 위치에서의 안정적 성과',
      '변화': '업무 전환이나 승진',
      '도전': '극복해야 할 업무상 과제',
      '성장': '전문성 향상과 경력 발전'
    };
    return contextMap[keyword] || keyword;
  }

  private getMoneyContext(keyword: string): string {
    const contextMap = {
      '새로운 시작': '새로운 수입원이나 투자',
      '안정': '재정적 안정성 확보',
      '변화': '재정 상황의 전환점',
      '도전': '재정적 어려움이나 선택',
      '성장': '자산 증가와 재정적 성장'
    };
    return contextMap[keyword] || keyword;
  }

  private async analyzeEnhancedRelationships(): Promise<RelationshipAnalysis[]> {
    const relationships: RelationshipAnalysis[] = [];

    // DB에서 조합 패턴 가져오기
    const { data: patterns } = await supabase
      .from('combination_patterns')
      .select('*')
      .eq('spread_id', 'celtic_cross')
      .eq('topic', this.topic)
      .order('priority', { ascending: false });

    if (patterns) {
      for (const pattern of patterns) {
        const analysis = await this.analyzePattern(pattern);
        if (analysis) {
          relationships.push(analysis);
        }
      }
    }

    // 추가 동적 분석
    const additionalAnalyses = await this.performDynamicAnalysis();
    relationships.push(...additionalAnalyses);

    return relationships;
  }

  private async analyzePattern(pattern: any): Promise<RelationshipAnalysis | null> {
    const positions = pattern.positions;
    const cards = positions.map((pos: number) => this.cards[pos - 1]);
    
    // 패턴 매칭 확인
    if (!this.matchesPatternCriteria(cards, pattern.pattern_type)) {
      return null;
    }

    // 구체적인 해석 생성
    const interpretation = await this.generatePatternInterpretation(
      pattern, cards
    );

    return {
      type: pattern.pattern_name,
      positions: positions,
      interpretation: interpretation,
      strength: pattern.priority
    };
  }

  private matchesPatternCriteria(cards: CardInfo[], patternType: string): boolean {
    switch (patternType) {
      case 'timeline':
        // 시간적 흐름이 있는지 확인
        return true;
      case 'relationship':
        // 관계성이 있는지 확인
        return cards.length >= 2;
      case 'energy':
        // 에너지 패턴 확인
        return cards.some(c => c.arcana === 'major');
      case 'conflict':
        // 갈등 패턴 확인
        return cards.some(c => c.orientation === 'reversed');
      case 'growth':
        // 성장 패턴 확인
        return cards.some(c => c.orientation === 'upright');
      default:
        return true;
    }
  }

  private async generatePatternInterpretation(
    pattern: any, 
    cards: CardInfo[]
  ): Promise<string> {
    let interpretation = pattern.interpretation_guide;
    
    // 카드 이름으로 치환
    cards.forEach((card, index) => {
      interpretation = interpretation.replace(
        `{{card${index + 1}}}`, 
        `${card.nameKr} ${card.orientation === 'upright' ? '정방향' : '역방향'}`
      );
    });
    
    // 추가 컨텍스트
    if (pattern.pattern_type === 'relationship' && cards.length === 2) {
      const comparison = await this.compareCardsInDepth(cards[0], cards[1]);
      interpretation += ` ${comparison}`;
    }
    
    return interpretation;
  }

  private async compareCardsInDepth(card1: CardInfo, card2: CardInfo): Promise<string> {
    // 카드 간 깊이 있는 비교
    if (card1.element && card2.element) {
      const { data: elementInteraction } = await supabase
        .from('element_interactions')
        .select('*')
        .or(`element1.eq.${card1.element},element2.eq.${card1.element}`)
        .or(`element1.eq.${card2.element},element2.eq.${card2.element}`)
        .single();
      
      if (elementInteraction) {
        return elementInteraction.description;
      }
    }
    
    // 숫자 카드 비교
    if (card1.number !== undefined && card2.number !== undefined) {
      const diff = Math.abs(card1.number - card2.number);
      if (diff === 0) {
        return '같은 숫자가 반복되어 그 에너지가 강조됩니다.';
      } else if (diff === 1) {
        return '연속된 단계를 나타내며 자연스러운 진행을 보여줍니다.';
      }
    }
    
    return '';
  }

  private async performDynamicAnalysis(): Promise<RelationshipAnalysis[]> {
    const analyses: RelationshipAnalysis[] = [];
    
    // 1. 에너지 흐름 분석
    const energyFlow = this.analyzeEnergyFlow();
    if (energyFlow) analyses.push(energyFlow);
    
    // 2. 원소 균형 분석
    const elementBalance = await this.analyzeElementBalance();
    if (elementBalance) analyses.push(elementBalance);
    
    // 3. 숫자 패턴 분석
    const numberPattern = this.analyzeNumberPatterns();
    if (numberPattern) analyses.push(numberPattern);
    
    return analyses;
  }

  private analyzeEnergyFlow(): RelationshipAnalysis | null {
    const uprightCount = this.cards.filter(c => c.orientation === 'upright').length;
    const majorCount = this.cards.filter(c => c.arcana === 'major').length;
    
    if (majorCount >= 6) {
      return {
        type: '강력한 운명적 에너지',
        positions: this.cards
          .map((c, i) => c.arcana === 'major' ? i + 1 : null)
          .filter(p => p !== null) as number[],
        interpretation: `${majorCount}장의 메이저 카드가 나타나 인생의 중대한 전환점임을 알립니다. ` +
                       `우주의 큰 흐름이 당신과 함께하고 있으며, 개인의 의지를 넘어선 변화가 일어나고 있습니다.`,
        strength: 10
      };
    }
    
    if (uprightCount >= 8) {
      return {
        type: '긍정적 에너지 우세',
        positions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        interpretation: `${uprightCount}장의 정방향 카드는 매우 긍정적인 에너지를 나타냅니다. ` +
                       `현재의 방향이 올바르며, 노력이 결실을 맺을 시기입니다.`,
        strength: 8
      };
    }
    
    return null;
  }

  private async analyzeElementBalance(): Promise<RelationshipAnalysis | null> {
    const elementCounts: Record<string, number> = {};
    const elementPositions: Record<string, number[]> = {};
    
    this.cards.forEach((card, index) => {
      if (card.element) {
        elementCounts[card.element] = (elementCounts[card.element] || 0) + 1;
        if (!elementPositions[card.element]) {
          elementPositions[card.element] = [];
        }
        elementPositions[card.element].push(index + 1);
      }
    });
    
    const dominantElement = Object.entries(elementCounts)
      .sort(([, a], [, b]) => b - a)[0];
    
    if (dominantElement && dominantElement[1] >= 4) {
      const [element, count] = dominantElement;
      return {
        type: `${element} 원소 우세`,
        positions: elementPositions[element],
        interpretation: await this.getElementDominanceInterpretation(element, count),
        strength: 7
      };
    }
    
    return null;
  }

  private async getElementDominanceInterpretation(element: string, count: number): Promise<string> {
    const interpretations = {
      'Fire': `불의 원소가 ${count}장으로 우세합니다. 열정, 창의성, 행동력이 넘치는 시기입니다. ` +
              `적극적으로 도전하되, 성급함은 경계하세요.`,
      'Water': `물의 원소가 ${count}장으로 우세합니다. 감정과 직관이 중요한 시기입니다. ` +
               `내면의 목소리에 귀 기울이고 감정을 잘 다스리세요.`,
      'Air': `바람의 원소가 ${count}장으로 우세합니다. 소통과 지적 활동이 활발한 시기입니다. ` +
             `명확한 사고와 효과적인 의사소통이 성공의 열쇠입니다.`,
      'Earth': `땅의 원소가 ${count}장으로 우세합니다. 실용성과 안정성이 중요한 시기입니다. ` +
               `꾸준한 노력과 현실적인 접근이 좋은 결과를 가져올 것입니다.`
    };
    
    return interpretations[element] || '';
  }

  private analyzeNumberPatterns(): RelationshipAnalysis | null {
    const numbers = this.cards
      .filter(c => c.number !== undefined)
      .map(c => c.number as number);
    
    if (numbers.length < 3) return null;
    
    // 연속된 숫자 찾기
    const sequences = this.findSequences(numbers);
    if (sequences.length > 0) {
      return {
        type: '숫자 진행 패턴',
        positions: this.cards
          .map((c, i) => sequences.includes(c.number || -1) ? i + 1 : null)
          .filter(p => p !== null) as number[],
        interpretation: `연속된 숫자들(${sequences.join(', ')})이 나타나 ` +
                       `단계적인 발전과 성장의 과정을 보여줍니다.`,
        strength: 6
      };
    }
    
    return null;
  }

  private findSequences(numbers: number[]): number[] {
    const sorted = [...new Set(numbers)].sort((a, b) => a - b);
    const sequences: number[] = [];
    
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] - sorted[i] === 1) {
        if (!sequences.includes(sorted[i])) sequences.push(sorted[i]);
        sequences.push(sorted[i + 1]);
      }
    }
    
    return [...new Set(sequences)];
  }

  private async identifyEnhancedPattern(): Promise<{
    name: string;
    description: string;
    message: string;
  }> {
    // DB에서 패턴 확인
    const { data: patterns } = await supabase
      .from('celtic_cross_patterns')
      .select('*')
      .order('priority', { ascending: false });

    if (patterns) {
      for (const pattern of patterns) {
        if (this.matchesEnhancedPattern(pattern.conditions)) {
          const message = this.personalizePatternMessage(
            pattern.interpretation_template
          );
          return {
            name: pattern.pattern_name,
            description: pattern.description,
            message: message
          };
        }
      }
    }

    // 기본 패턴
    return this.generateDefaultEnhancedPattern();
  }

  private matchesEnhancedPattern(conditions: any): boolean {
    // 메이저 카드 수 조건
    if (conditions.major_count) {
      const majorCount = this.cards.filter(c => c.arcana === 'major').length;
      if (conditions.major_count.min && majorCount < conditions.major_count.min) {
        return false;
      }
      if (conditions.major_count.max && majorCount > conditions.major_count.max) {
        return false;
      }
    }
    
    // 역방향 카드 수 조건
    if (conditions.reversed_count) {
      const reversedCount = this.cards.filter(c => c.orientation === 'reversed').length;
      if (conditions.reversed_count.min && reversedCount < conditions.reversed_count.min) {
        return false;
      }
    }
    
    // 특정 슈트 우세 조건
    if (conditions.suit_count) {
      for (const [suit, requirement] of Object.entries(conditions.suit_count)) {
        const count = this.cards.filter(c => c.suit === suit).length;
        if (requirement.min && count < requirement.min) {
          return false;
        }
      }
    }
    
    return true;
  }

  private personalizePatternMessage(template: string): string {
    // 템플릿 변수 치환
    return template
      .replace(/{{name}}/g, this.userName)
      .replace(/{{major_count}}/g, this.cards.filter(c => c.arcana === 'major').length.toString())
      .replace(/{{reversed_count}}/g, this.cards.filter(c => c.orientation === 'reversed').length.toString())
      .replace(/{{dominant_suit}}/g, this.getDominantSuit())
      .replace(/{{strongest_positions}}/g, this.getStrongestPositions().join(', '));
  }

  private getDominantSuit(): string {
    const suitCounts: Record<string, number> = {};
    this.cards.forEach(card => {
      if (card.suit) {
        suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
      }
    });
    
    const dominant = Object.entries(suitCounts)
      .sort(([, a], [, b]) => b - a)[0];
    
    if (dominant) {
      const suitNames = {
        'wands': 'Wands(열정)',
        'cups': 'Cups(감정)',
        'swords': 'Swords(지성)',
        'pentacles': 'Pentacles(물질)'
      };
      return suitNames[dominant[0]] || dominant[0];
    }
    
    return '균형잡힌';
  }

  private getStrongestPositions(): number[] {
    return this.cards
      .map((card, index) => ({
        position: index + 1,
        strength: card.arcana === 'major' ? 2 : 1
      }))
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 3)
      .map(item => item.position);
  }

  private generateDefaultEnhancedPattern(): {
    name: string;
    description: string;
    message: string;
  } {
    const majorCount = this.cards.filter(c => c.arcana === 'major').length;
    const uprightCount = this.cards.filter(c => c.orientation === 'upright').length;
    
    if (majorCount >= 5) {
      return {
        name: '운명의 전환점',
        description: '인생의 중요한 변화가 일어나는 시기',
        message: `${this.userName}님은 지금 인생의 중대한 전환점에 서 있습니다. ` +
                `${majorCount}장의 메이저 카드가 보여주듯, 우주적 흐름이 강하게 작용하고 있습니다.`
      };
    }
    
    if (uprightCount >= 7) {
      return {
        name: '긍정적 성장기',
        description: '모든 것이 순조롭게 흘러가는 시기',
        message: `${this.userName}님에게 매우 긍정적인 시기가 펼쳐지고 있습니다. ` +
                `${uprightCount}장의 정방향 카드는 노력이 결실을 맺고 있음을 보여줍니다.`
      };
    }
    
    return {
      name: '균형과 조화',
      description: '다양한 에너지가 조화를 이루는 시기',
      message: `${this.userName}님은 현재 균형을 찾아가는 과정에 있습니다. ` +
                `정방향과 역방향의 조화는 성장을 위한 필수적인 과정입니다.`
    };
  }

  private async analyzeSynergies(): Promise<{
    type: string;
    cards: string[];
    interpretation: string;
    strength: number;
  }[]> {
    const synergies = [];
    
    // DB에서 카드 시너지 확인
    const { data: cardSynergies } = await supabase
      .from('card_synergies')
      .select('*')
      .eq('topic', this.topic);
    
    if (cardSynergies) {
      for (const synergy of cardSynergies) {
        if (this.matchesSynergy(synergy.cards)) {
          synergies.push({
            type: synergy.synergy_type,
            cards: this.getSynergyCardNames(synergy.cards),
            interpretation: synergy.interpretation,
            strength: synergy.strength
          });
        }
      }
    }
    
    // 추가 동적 시너지 분석
    const dynamicSynergies = this.findDynamicSynergies();
    synergies.push(...dynamicSynergies);
    
    // 강도순으로 정렬
    return synergies.sort((a, b) => b.strength - a.strength).slice(0, 3);
  }

  private matchesSynergy(synergyCondition: any): boolean {
    if (synergyCondition.cards) {
      // 특정 카드 조합 확인
      for (const cardCondition of synergyCondition.cards) {
        const found = this.cards.some(c => 
          c.id === cardCondition.id || 
          c.name === cardCondition.name
        );
        if (!found) return false;
      }
    }
    
    if (synergyCondition.arcana && synergyCondition.count) {
      // 아르카나 수 확인
      const count = this.cards.filter(c => 
        c.arcana === synergyCondition.arcana
      ).length;
      if (count < synergyCondition.count) return false;
    }
    
    if (synergyCondition.suit && synergyCondition.count) {
      // 슈트 수 확인
      const count = this.cards.filter(c => 
        c.suit === synergyCondition.suit
      ).length;
      if (count < synergyCondition.count) return false;
    }
    
    return true;
  }

  private getSynergyCardNames(condition: any): string[] {
    if (condition.cards) {
      return condition.cards.map((c: any) => c.name || `Card ${c.id}`);
    }
    return [];
  }

  private findDynamicSynergies(): {
    type: string;
    cards: string[];
    interpretation: string;
    strength: number;
  }[] {
    const synergies = [];
    
    // 1. 같은 숫자 시너지
    const numberGroups = this.groupByNumber();
    for (const [number, cards] of Object.entries(numberGroups)) {
      if (cards.length >= 2) {
        synergies.push({
          type: 'number_synergy',
          cards: cards.map(c => c.nameKr),
          interpretation: `${number}번의 에너지가 ${cards.length}번 반복되어 ` +
                         `그 의미가 크게 강조됩니다.`,
          strength: 5 + cards.length
        });
      }
    }
    
    // 2. 연속 메이저 시너지
    const consecutiveMajors = this.findConsecutiveMajors();
    if (consecutiveMajors.length >= 2) {
      synergies.push({
        type: 'consecutive_majors',
        cards: consecutiveMajors.map(c => c.nameKr),
        interpretation: `연속된 메이저 카드들이 나타나 영적 여정의 단계적 진행을 보여줍니다.`,
        strength: 7
      });
    }
    
    return synergies;
  }

  private groupByNumber(): Record<number, CardInfo[]> {
    const groups: Record<number, CardInfo[]> = {};
    
    this.cards.forEach(card => {
      if (card.number !== undefined) {
        if (!groups[card.number]) {
          groups[card.number] = [];
        }
        groups[card.number].push(card);
      }
    });
    
    return groups;
  }

  private findConsecutiveMajors(): CardInfo[] {
    const majors = this.cards
      .filter(c => c.arcana === 'major')
      .sort((a, b) => (a.number || 0) - (b.number || 0));
    
    const consecutive: CardInfo[] = [];
    for (let i = 0; i < majors.length - 1; i++) {
      if ((majors[i].number || 0) + 1 === (majors[i + 1].number || 0)) {
        if (!consecutive.includes(majors[i])) consecutive.push(majors[i]);
        consecutive.push(majors[i + 1]);
      }
    }
    
    return consecutive;
  }

  private async generateActionableAdvice(): Promise<{
    immediate: ActionSuggestion[];
    shortTerm: ActionSuggestion[];
    longTerm: ActionSuggestion[];
  }> {
    const advice = {
      immediate: [] as ActionSuggestion[],
      shortTerm: [] as ActionSuggestion[],
      longTerm: [] as ActionSuggestion[]
    };
    
    // 핵심 위치의 카드들에 대한 조언 생성
    const keyPositions = [1, 2, 6, 10]; // 현재, 도전, 가까운 미래, 최종 결과
    
    for (const position of keyPositions) {
      const card = this.cards[position - 1];
      
      // DB에서 행동 제안 가져오기
      const { data: suggestions } = await supabase
        .from('action_suggestions')
        .select('*')
        .eq('card_id', card.id)
        .eq('topic', this.topic)
        .eq('orientation', card.orientation)
        .order('priority', { ascending: false })
        .limit(3);
      
      if (suggestions) {
        suggestions.forEach(suggestion => {
          const actionSuggestion: ActionSuggestion = {
            timeFrame: suggestion.time_frame,
            actionType: suggestion.action_type,
            suggestion: suggestion.suggestion,
            priority: suggestion.priority
          };
          
          // 시간 프레임별로 분류
          if (suggestion.time_frame === 'immediate') {
            advice.immediate.push(actionSuggestion);
          } else if (suggestion.time_frame === 'this_week') {
            advice.shortTerm.push(actionSuggestion);
          } else if (suggestion.time_frame === 'this_month' || 
                     suggestion.time_frame === 'long_term') {
            advice.longTerm.push(actionSuggestion);
          }
        });
      }
    }
    
    // 우선순위별로 정렬하고 상위 3개씩만 선택
    advice.immediate = advice.immediate
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);
    advice.shortTerm = advice.shortTerm
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);
    advice.longTerm = advice.longTerm
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);
    
    // 부족한 부분은 동적으로 생성
    if (advice.immediate.length === 0) {
      advice.immediate.push(this.generateDynamicAdvice('immediate'));
    }
    if (advice.shortTerm.length === 0) {
      advice.shortTerm.push(this.generateDynamicAdvice('this_week'));
    }
    if (advice.longTerm.length === 0) {
      advice.longTerm.push(this.generateDynamicAdvice('long_term'));
    }
    
    return advice;
  }

  private generateDynamicAdvice(timeFrame: string): ActionSuggestion {
    const currentCard = this.cards[0]; // 현재 상황
    const challengeCard = this.cards[1]; // 도전
    
    let suggestion = '';
    let actionType = 'practical';
    
    if (timeFrame === 'immediate') {
      if (challengeCard.orientation === 'reversed') {
        suggestion = `오늘 ${challengeCard.nameKr}가 나타내는 어려움을 인정하고, ` +
                    `작은 한 걸음이라도 전진해보세요.`;
        actionType = 'emotional';
      } else {
        suggestion = `지금 바로 ${currentCard.nameKr}의 에너지를 활용하여 ` +
                    `구체적인 행동을 시작하세요.`;
        actionType = 'practical';
      }
    } else if (timeFrame === 'this_week') {
      suggestion = `이번 주에는 ${this.getWeeklyFocus()}에 집중하여 ` +
                  `꾸준히 노력해보세요.`;
      actionType = 'mental';
    } else {
      suggestion = `장기적으로 ${this.getLongTermGoal()}을 목표로 ` +
                  `단계별 계획을 세워보세요.`;
      actionType = 'spiritual';
    }
    
    return {
      timeFrame,
      actionType,
      suggestion,
      priority: 5
    };
  }

  private getWeeklyFocus(): string {
    if (this.topic === 'love') return '파트너와의 깊은 대화';
    if (this.topic === 'career') return '중요한 프로젝트 진행';
    if (this.topic === 'money') return '지출 패턴 점검';
    return '내면의 균형 찾기';
  }

  private getLongTermGoal(): string {
    if (this.topic === 'love') return '신뢰와 친밀감 구축';
    if (this.topic === 'career') return '전문성 향상과 인정';
    if (this.topic === 'money') return '재정적 안정과 성장';
    return '지속적인 성장과 발전';
  }

  private extractEnhancedKeywords(): string[] {
    const keywords = new Set<string>();
    
    // 각 카드의 핵심 키워드
    this.cards.forEach(card => {
      const cardKeywords = card.keywords[card.orientation] || [];
      if (cardKeywords.length > 0) {
        keywords.add(cardKeywords[0]);
      }
    });
    
    // 전체 패턴 키워드
    const majorCount = this.cards.filter(c => c.arcana === 'major').length;
    const uprightCount = this.cards.filter(c => c.orientation === 'upright').length;
    
    if (majorCount >= 5) {
      keywords.add('운명적 전환');
    }
    if (uprightCount >= 7) {
      keywords.add('긍정적 흐름');
    } else if (uprightCount <= 3) {
      keywords.add('내면의 성찰');
    }
    
    // 주제별 특별 키워드
    const topicKeywords = {
      'love': ['사랑', '관계', '감정'],
      'career': ['성공', '발전', '기회'],
      'money': ['풍요', '안정', '성장'],
      'health': ['치유', '균형', '활력']
    };
    
    if (topicKeywords[this.topic]) {
      keywords.add(topicKeywords[this.topic][0]);
    }
    
    return Array.from(keywords).slice(0, 7);
  }

  private async generatePersonalizedMessage(
    positions: PositionInfo[],
    relationships: RelationshipAnalysis[],
    pattern: any,
    synergies: any[]
  ): Promise<string> {
    // DB에서 메시지 템플릿 가져오기
    const { data: templates } = await supabase
      .from('message_templates')
      .select('*')
      .eq('spread_id', 'celtic_cross')
      .eq('topic', this.topic)
      .order('created_at', { ascending: false });
    
    let message = '';
    
    // 오프닝
    const openingTemplate = templates?.find(t => t.template_type === 'opening');
    if (openingTemplate && this.matchesEnergyCondition(openingTemplate.energy_condition)) {
      message += this.fillTemplate(openingTemplate.template_text, {
        name: this.userName,
        major_count: this.cards.filter(c => c.arcana === 'major').length,
        reversed_count: this.cards.filter(c => c.orientation === 'reversed').length,
        dominant_suit: this.getDominantSuit()
      });
    } else {
      message += this.generateDefaultOpening();
    }
    
    message += '\n\n';
    
    // 핵심 분석
    message += '✨ **핵심 메시지**\n';
    message += pattern.message + '\n\n';
    
    // 주요 관계성
    if (relationships.length > 0) {
      message += '🔗 **카드 간의 관계**\n';
      const topRelationships = relationships
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 2);
      
      topRelationships.forEach(rel => {
        message += `- ${rel.interpretation}\n`;
      });
      message += '\n';
    }
    
    // 시너지
    if (synergies.length > 0) {
      message += '💫 **특별한 조합**\n';
      const topSynergy = synergies[0];
      message += `${topSynergy.interpretation}\n\n`;
    }
    
    // 구체적 조언
    message += '📌 **당신을 위한 조언**\n';
    const adviceTemplate = templates?.find(t => 
      t.template_type === 'advice' && 
      this.matchesEnergyCondition(t.energy_condition)
    );
    
    if (adviceTemplate) {
      message += this.fillTemplate(adviceTemplate.template_text, {
        main_advice: this.getMainAdvice(),
        time_frame: '이번 주',
        specific_action: this.getSpecificAction()
      });
    } else {
      message += this.generateDefaultAdvice();
    }
    
    message += '\n\n';
    
    // 클로징
    const closingTemplate = templates?.find(t => t.template_type === 'closing');
    if (closingTemplate) {
      message += this.fillTemplate(closingTemplate.template_text, {
        position10_card: positions[9].card.nameKr,
        outcome_detail: this.getOutcomeDetail(positions[9].card),
        final_message: this.getFinalMessage()
      });
    } else {
      message += this.generateDefaultClosing(positions[9].card);
    }
    
    return message;
  }

  private matchesEnergyCondition(condition: any): boolean {
    if (!condition) return true;
    
    if (condition.major_count) {
      const majorCount = this.cards.filter(c => c.arcana === 'major').length;
      if (condition.major_count.min && majorCount < condition.major_count.min) {
        return false;
      }
    }
    
    if (condition.energy === 'positive') {
      const uprightCount = this.cards.filter(c => c.orientation === 'upright').length;
      return uprightCount >= 6;
    }
    
    if (condition.energy === 'challenging') {
      const reversedCount = this.cards.filter(c => c.orientation === 'reversed').length;
      return reversedCount >= 5;
    }
    
    return true;
  }

  private fillTemplate(template: string, variables: Record<string, any>): string {
    let filled = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      filled = filled.replace(regex, String(value));
    }
    
    return filled;
  }

  private generateDefaultOpening(): string {
    const majorCount = this.cards.filter(c => c.arcana === 'major').length;
    
    if (majorCount >= 5) {
      return `${this.userName}님, 당신의 ${this.getTopicName()}에 우주의 강력한 메시지가 담겨 있습니다. ` +
             `${majorCount}장의 메이저 카드가 중요한 전환점을 알리고 있습니다.`;
    }
    
    return `${this.userName}님의 ${this.getTopicName()}를 살펴보니, ` +
           `현재 당신은 ${this.getCurrentState()}의 시기를 보내고 계십니다.`;
  }

  private getTopicName(): string {
    const names = {
      'love': '연애운',
      'career': '직업운',
      'money': '금전운',
      'health': '건강운',
      'general': '전체운'
    };
    return names[this.topic] || '운세';
  }

  private getCurrentState(): string {
    const uprightCount = this.cards.filter(c => c.orientation === 'upright').length;
    
    if (uprightCount >= 7) return '매우 긍정적인 에너지';
    if (uprightCount >= 5) return '안정과 성장';
    if (uprightCount >= 3) return '변화와 도전';
    return '깊은 성찰과 재정립';
  }

  private getMainAdvice(): string {
    const currentCard = this.cards[0];
    const keyword = currentCard.keywords[currentCard.orientation]?.[0] || '변화';
    
    return `현재 ${currentCard.nameKr}가 보여주는 ${keyword}의 에너지를 ` +
           `적극적으로 활용하는 것이 중요합니다`;
  }

  private getSpecificAction(): string {
    if (this.topic === 'love') {
      return '파트너와 진솔한 대화를 나누거나 새로운 만남에 열린 마음을 가져보세요';
    } else if (this.topic === 'career') {
      return '새로운 프로젝트를 제안하거나 스킬 향상을 위한 계획을 세워보세요';
    } else if (this.topic === 'money') {
      return '재정 계획을 재점검하고 새로운 수입원을 탐색해보세요';
    }
    return '내면의 목소리에 귀 기울이고 직관을 따라 행동해보세요';
  }

  private generateDefaultAdvice(): string {
    const advice = [];
    
    // 현재 상황 기반 조언
    const currentCard = this.cards[0];
    if (currentCard.orientation === 'upright') {
      advice.push(`${currentCard.nameKr}의 긍정적 에너지를 최대한 활용하세요.`);
    } else {
      advice.push(`${currentCard.nameKr} 역방향이 알려주는 내면의 메시지에 귀 기울이세요.`);
    }
    
    // 도전 극복 조언
    const challengeCard = this.cards[1];
    advice.push(`${challengeCard.nameKr}가 나타내는 도전은 성장의 기회입니다.`);
    
    return advice.join(' ');
  }

  private getOutcomeDetail(outcomeCard: CardInfo): string {
    if (outcomeCard.orientation === 'upright') {
      return `${outcomeCard.nameKr}의 긍정적인 에너지가 실현되어`;
    } else {
      return `${outcomeCard.nameKr} 역방향이 보여주는 교훈을 통해`;
    }
  }

  private getFinalMessage(): string {
    const outcomeCard = this.cards[9];
    const keyword = outcomeCard.keywords[outcomeCard.orientation]?.[0] || '성장';
    
    if (this.topic === 'love') {
      return `${keyword}을 통한 더 깊은 사랑으로 발전할 것입니다.`;
    } else if (this.topic === 'career') {
      return `${keyword}을 바탕으로 한 직업적 성취를 이룰 것입니다.`;
    } else if (this.topic === 'money') {
      return `${keyword}을 통해 재정적 안정을 찾을 것입니다.`;
    }
    
    return `${keyword}의 결실을 맺게 될 것입니다.`;
  }

  private generateDefaultClosing(outcomeCard: CardInfo): string {
    const orientation = outcomeCard.orientation === 'upright' ? '정방향' : '역방향';
    
    return `최종적으로 ${outcomeCard.nameKr} ${orientation}이 보여주듯, ` +
           `이 여정은 당신에게 ${this.getFinalMessage()}`;
  }
}
