export interface CardData {
  id: string;
  name: string;
  nameKr: string;
  arcana: 'major' | 'minor';
  number?: number;
  suit?: string;
  element?: string;
  keywords?: string[];
  orientation: 'upright' | 'reversed';
  position?: {
    name: string;
    description: string;
  };
}

export interface ImprovedInterpretation {
  positiveAspects: string[];
  negativeAspects: string[];
  advice: string;
  keyThemes: string[];
  elementalBalance: {
    fire: number;
    water: number;
    air: number;
    earth: number;
    analysis: string;
  };
  timeFlow: {
    past: string;
    present: string;
    future: string;
  };
  relationships: {
    innerOuter: string;
    selfPerception: string;
    expectations: string;
  };
}

export class ImprovedCelticCrossInterpreter {
  private cards: CardData[] = [];
  
  private positionNames = [
    '현재 상황 (내면)',
    '도전과 외부 영향',
    '근본 원인',
    '과거',
    '가능한 미래',
    '가까운 미래',
    '자신의 상태',
    '외부 환경',
    '희망과 두려움',
    '최종 결과'
  ];

  constructor(cards?: CardData[]) {
    if (cards) {
      this.cards = cards;
    }
  }
  
  public getPositionName(index: number): string {
    return this.positionNames[index] || `위치 ${index + 1}`;
  }
  
  public async generateInterpretation(cardsData: any[]): Promise<ImprovedInterpretation> {
    // cardsData를 CardData 형식으로 변환
    this.cards = cardsData.map(data => ({
      id: data.card.id,
      name: data.card.name,
      nameKr: data.card.nameKr,
      arcana: data.card.arcana,
      number: data.card.number,
      suit: data.card.suit,
      element: data.card.element,
      keywords: data.card.keywords,
      orientation: data.orientation,
      position: {
        name: data.positionName,
        description: ''
      }
    }));
    
    return this.getInterpretation();
  }

  public getInterpretation(): ImprovedInterpretation {
    return {
      positiveAspects: this.analyzePositiveAspects(),
      negativeAspects: this.analyzeNegativeAspects(),
      advice: this.generateAdvice(),
      keyThemes: this.extractKeyThemes(),
      elementalBalance: this.analyzeElementalBalance(),
      timeFlow: this.analyzeTimeFlow(),
      relationships: this.analyzeRelationships()
    };
  }

  private analyzePositiveAspects(): string[] {
    const aspects: string[] = [];
    
    // 정방향 카드 분석
    const uprightCards = this.cards.filter(card => card.orientation === 'upright');
    const reversedCards = this.cards.filter(card => card.orientation === 'reversed');
    
    if (uprightCards.length >= 6) {
      aspects.push('전반적으로 긍정적인 에너지가 우세하여 목표 달성 가능성이 높습니다');
    }
    
    // 메이저 아르카나 분석
    const majorCards = this.cards.filter(card => card.arcana === 'major');
    if (majorCards.length >= 5) {
      aspects.push('중요한 인생의 전환점으로, 우주의 지원을 받고 있습니다');
    }
    
    // 특정 위치의 긍정적 카드 분석
    if (this.cards[5] && this.cards[5].orientation === 'upright') { // 미래 위치
      aspects.push(`미래(${this.cards[5].nameKr})가 정방향으로, 긍정적인 결과가 예상됩니다`);
    }
    
    if (this.cards[9] && this.cards[9].orientation === 'upright') { // 최종 결과
      aspects.push(`최종 결과(${this.cards[9].nameKr})가 긍정적으로 나타났습니다`);
    }
    
    // 원소 균형 분석
    const elementBalance = this.analyzeElementalBalance();
    if (Math.max(...Object.values(elementBalance).filter(v => typeof v === 'number')) <= 4) {
      aspects.push('원소들이 균형을 이루어 안정적인 상황입니다');
    }
    
    return aspects;
  }

  private analyzeNegativeAspects(): string[] {
    const aspects: string[] = [];
    
    // 역방향 카드 분석
    const reversedCards = this.cards.filter(card => card.orientation === 'reversed');
    
    if (reversedCards.length >= 6) {
      aspects.push('많은 역방향 카드로 인해 장애물과 도전이 예상됩니다');
    }
    
    // 특정 위치의 부정적 카드 분석
    if (this.cards[1] && this.cards[1].orientation === 'reversed') { // 현재 외부
      aspects.push(`외부 환경(${this.cards[1].nameKr})이 도전적입니다`);
    }
    
    if (this.cards[2] && this.cards[2].orientation === 'reversed') { // 근본
      aspects.push(`근본적인 문제(${this.cards[2].nameKr})를 해결해야 합니다`);
    }
    
    // 내외부 갈등 분석
    if (this.cards[0]?.orientation !== this.cards[1]?.orientation) {
      aspects.push('내면과 외부 환경 사이에 갈등이 있습니다');
    }
    
    // 기대와 결과의 불일치
    if (this.cards[8]?.orientation === 'upright' && this.cards[9]?.orientation === 'reversed') {
      aspects.push('기대와 실제 결과 사이에 차이가 있을 수 있습니다');
    }
    
    return aspects;
  }

  private generateAdvice(): string {
    const advice: string[] = [];
    
    // 현재 상황 기반 조언
    const present = this.cards[0];
    const challenge = this.cards[1];
    
    if (present && challenge) {
      if (present.orientation === 'upright' && challenge.orientation === 'reversed') {
        advice.push('내면의 힘을 믿고 외부의 도전을 극복하세요');
      } else if (present.orientation === 'reversed' && challenge.orientation === 'upright') {
        advice.push('외부의 지원을 활용하여 내면의 문제를 해결하세요');
      }
    }
    
    // 과거-현재-미래 흐름 기반 조언
    const past = this.cards[3];
    const future = this.cards[5];
    
    if (past?.orientation === 'reversed' && future?.orientation === 'upright') {
      advice.push('과거의 어려움이 미래의 성장으로 이어질 것입니다');
    }
    
    // 자아 인식 기반 조언
    const selfView = this.cards[6];
    const othersView = this.cards[7];
    
    if (selfView && othersView && selfView.orientation !== othersView.orientation) {
      advice.push('자신에 대한 인식과 타인의 시각 차이를 인지하고 균형을 찾으세요');
    }
    
    // 원소 균형 기반 조언
    const elementBalance = this.analyzeElementalBalance();
    const dominantElement = Object.entries(elementBalance)
      .filter(([key]) => key !== 'analysis')
      .sort((a, b) => (b[1] as number) - (a[1] as number))[0];
    
    if (dominantElement && (dominantElement[1] as number) >= 5) {
      const elementAdvice = {
        fire: '열정을 조절하고 신중함을 더하세요',
        water: '감정에 휩쓸리지 말고 논리적 사고를 활용하세요',
        air: '생각만 하지 말고 행동으로 옮기세요',
        earth: '유연성을 발휘하고 새로운 가능성에 열려있으세요'
      };
      advice.push(elementAdvice[dominantElement[0] as keyof typeof elementAdvice]);
    }
    
    return advice.join('. ') + '.';
  }

  private extractKeyThemes(): string[] {
    const themes = new Set<string>();
    
    // 카드별 주요 테마 추출
    this.cards.forEach(card => {
      // 메이저 아르카나 기반 테마
      if (card.arcana === 'major') {
        const majorThemes: { [key: string]: string } = {
          'The Fool': '새로운 시작',
          'The Magician': '능력 발휘',
          'The High Priestess': '직관과 내면',
          'The Empress': '풍요와 창조',
          'The Emperor': '권위와 구조',
          'The Hierophant': '전통과 가르침',
          'The Lovers': '선택과 관계',
          'The Chariot': '의지와 전진',
          'Strength': '내면의 힘',
          'The Hermit': '성찰과 지혜',
          'Wheel of Fortune': '변화와 운명',
          'Justice': '균형과 공정',
          'The Hanged Man': '희생과 관점 전환',
          'Death': '변화와 재생',
          'Temperance': '조화와 인내',
          'The Devil': '속박과 욕망',
          'The Tower': '갑작스런 변화',
          'The Star': '희망과 영감',
          'The Moon': '환상과 불안',
          'The Sun': '성공과 활력',
          'Judgement': '부활과 각성',
          'The World': '완성과 성취'
        };
        
        if (majorThemes[card.name]) {
          themes.add(majorThemes[card.name]);
        }
      }
      
      // 수트 기반 테마
      if (card.suit) {
        const suitThemes: { [key: string]: string } = {
          'wands': '열정과 창의성',
          'cups': '감정과 관계',
          'swords': '사고와 갈등',
          'pentacles': '물질과 실용성'
        };
        
        if (suitThemes[card.suit]) {
          themes.add(suitThemes[card.suit]);
        }
      }
    });
    
    // 위치별 특별 테마
    if (this.cards[0]?.arcana === 'major' && this.cards[1]?.arcana === 'major') {
      themes.add('중요한 전환점');
    }
    
    return Array.from(themes);
  }

  private analyzeElementalBalance(): ImprovedInterpretation['elementalBalance'] {
    const elements = { fire: 0, water: 0, air: 0, earth: 0 };
    
    this.cards.forEach(card => {
      if (card.element) {
        elements[card.element as keyof typeof elements]++;
      } else if (card.suit) {
        const suitElement: { [key: string]: keyof typeof elements } = {
          'wands': 'fire',
          'cups': 'water',
          'swords': 'air',
          'pentacles': 'earth'
        };
        
        if (suitElement[card.suit]) {
          elements[suitElement[card.suit]]++;
        }
      }
    });
    
    // 균형 분석
    const values = Object.values(elements);
    const max = Math.max(...values);
    const min = Math.min(...values);
    let analysis = '';
    
    if (max - min <= 2) {
      analysis = '원소들이 균형잡힌 상태로, 조화로운 에너지가 흐르고 있습니다.';
    } else {
      const dominant = Object.entries(elements).find(([_, v]) => v === max)?.[0];
      const lacking = Object.entries(elements).find(([_, v]) => v === min)?.[0];
      
      const elementNames: { [key: string]: string } = {
        fire: '불(열정)',
        water: '물(감정)',
        air: '공기(사고)',
        earth: '땅(현실)'
      };
      
      analysis = `${elementNames[dominant!]} 원소가 우세하고 ${elementNames[lacking!]} 원소가 부족합니다. 균형을 맞추기 위한 노력이 필요합니다.`;
    }
    
    return { ...elements, analysis };
  }

  private analyzeTimeFlow(): ImprovedInterpretation['timeFlow'] {
    const past = this.cards[3];
    const present = `${this.cards[0]?.nameKr}(내면)과 ${this.cards[1]?.nameKr}(외부)`;
    const future = this.cards[5];
    
    return {
      past: past ? `${past.nameKr}${past.orientation === 'reversed' ? '(역)' : ''}의 영향이 현재까지 이어지고 있습니다` : '',
      present: `현재는 ${present}의 상호작용 속에 있습니다`,
      future: future ? `${future.nameKr}${future.orientation === 'reversed' ? '(역)' : ''}로 향하고 있습니다` : ''
    };
  }

  private analyzeRelationships(): ImprovedInterpretation['relationships'] {
    const inner = this.cards[0];
    const outer = this.cards[1];
    const selfView = this.cards[6];
    const othersView = this.cards[7];
    const expectedOutcome = this.cards[8];
    const actualOutcome = this.cards[9];
    
    return {
      innerOuter: this.compareCards(inner, outer, '내면과 외부'),
      selfPerception: this.compareCards(selfView, othersView, '자아 인식'),
      expectations: this.compareCards(expectedOutcome, actualOutcome, '기대와 결과')
    };
  }

  private compareCards(card1: CardData | undefined, card2: CardData | undefined, context: string): string {
    if (!card1 || !card2) return '';
    
    if (card1.orientation === card2.orientation) {
      return `${context}가 조화를 이루고 있습니다`;
    } else {
      return `${context} 사이에 갈등이나 불일치가 있습니다`;
    }
  }
}
