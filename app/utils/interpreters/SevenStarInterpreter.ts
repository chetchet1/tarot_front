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

export interface SevenStarInterpretation {
  coreInsight: string;
  influences: {
    past: string;
    present: string;
    future: string;
  };
  challenges: string[];
  opportunities: string[];
  hiddenFactors: string;
  outcome: string;
  advice: string;
  starPattern: {
    balance: string;
    energy: string;
    direction: string;
  };
}

export class SevenStarInterpreter {
  private cards: CardData[] = [];
  
  // 세븐스타 배열법의 7개 포지션
  private positionNames = [
    '1. 과거의 영향',     // 왼쪽
    '2. 현재 상황',       // 중앙
    '3. 미래의 가능성',   // 오른쪽  
    '4. 내면의 상태',     // 위
    '5. 외부 환경',       // 아래
    '6. 조언과 지침',     // 왼쪽 위
    '7. 최종 결과'        // 오른쪽 위
  ];

  constructor(cards?: CardData[]) {
    if (cards) {
      this.cards = cards;
    }
  }
  
  public getPositionName(index: number): string {
    return this.positionNames[index] || `위치 ${index + 1}`;
  }
  
  public getPositionDescription(index: number): string {
    const descriptions = [
      '과거로부터 이어져 온 영향과 배경', 
      '현재 직면한 상황과 에너지',
      '앞으로 펼쳐질 가능성과 잠재력',
      '당신의 내적 상태와 감정',
      '주변 환경과 외부의 영향력',
      '상황을 헤쳐나가기 위한 조언',
      '노력의 최종적인 결실과 결과'
    ];
    return descriptions[index] || '';
  }
  
  public async generateInterpretation(userId?: string): Promise<{ success: boolean; interpretation: string }> {
    try {
      const interpretation = this.getInterpretation();
      const interpretationText = this.formatInterpretationAsText(interpretation);
      
      return {
        success: true,
        interpretation: interpretationText
      };
    } catch (error) {
      console.error('세븐스타 해석 생성 오류:', error);
      return {
        success: false,
        interpretation: '해석을 생성하는 중 오류가 발생했습니다.'
      };
    }
  }
  
  public setCards(cardsData: any[]): void {
    // cardsData를 CardData 형식으로 변환
    this.cards = cardsData.map((data, index) => ({
      id: data.card?.id || data.id,
      name: data.card?.name || data.name,
      nameKr: data.card?.nameKr || data.nameKr,
      arcana: data.card?.arcana || data.arcana,
      number: data.card?.number || data.number,
      suit: data.card?.suit || data.suit,
      element: data.card?.element || data.element,
      keywords: data.card?.keywords || data.keywords,
      orientation: data.orientation,
      position: {
        name: this.getPositionName(index),
        description: this.getPositionDescription(index)
      }
    }));
  }

  public getInterpretation(): SevenStarInterpretation {
    return {
      coreInsight: this.analyzeCoreInsight(),
      influences: this.analyzeInfluences(),
      challenges: this.analyzeChallenges(),
      opportunities: this.analyzeOpportunities(),
      hiddenFactors: this.analyzeHiddenFactors(),
      outcome: this.analyzeOutcome(),
      advice: this.generateAdvice(),
      starPattern: this.analyzeStarPattern()
    };
  }

  private analyzeCoreInsight(): string {
    // 중앙 카드(현재)를 중심으로 전체 상황 분석
    const present = this.cards[1]; // 현재 상황
    const inner = this.cards[3]; // 내면
    const outer = this.cards[4]; // 외부
    
    const insights: string[] = [];
    
    if (present) {
      const presentState = present.orientation === 'upright' ? '순조롭게' : '어렵게';
      insights.push(`현재 ${present.nameKr} 카드가 나타내듯, 상황이 ${presentState} 흘러가고 있습니다`);
    }
    
    // 내외부 균형 분석
    if (inner && outer) {
      if (inner.orientation === outer.orientation) {
        insights.push('내면과 외부 환경이 조화를 이루고 있어 안정적입니다');
      } else {
        insights.push('내면과 외부 환경 사이에 긴장이 존재합니다');
      }
    }
    
    // 시간의 흐름 분석
    const past = this.cards[0];
    const future = this.cards[2];
    
    if (past && future) {
      if (past.orientation === 'reversed' && future.orientation === 'upright') {
        insights.push('과거의 어려움을 극복하고 긍정적인 미래로 나아가고 있습니다');
      } else if (past.orientation === 'upright' && future.orientation === 'reversed') {
        insights.push('현재 직면한 도전을 통해 성장의 기회를 맞고 있습니다');
      }
    }
    
    return insights.join('. ');
  }

  private analyzeInfluences(): SevenStarInterpretation['influences'] {
    const past = this.cards[0];
    const present = this.cards[1];
    const future = this.cards[2];
    
    return {
      past: past ? 
        `${past.nameKr}${past.orientation === 'reversed' ? '(역)' : ''}가 과거로부터 영향을 미치고 있습니다. ${this.getCardInfluence(past)}` : 
        '과거의 영향이 명확하지 않습니다',
      
      present: present ? 
        `${present.nameKr}${present.orientation === 'reversed' ? '(역)' : ''}가 현재 상황을 지배하고 있습니다. ${this.getCardInfluence(present)}` : 
        '현재 상황이 유동적입니다',
      
      future: future ? 
        `${future.nameKr}${future.orientation === 'reversed' ? '(역)' : ''}가 미래의 가능성을 시사합니다. ${this.getCardInfluence(future)}` : 
        '미래가 열려 있습니다'
    };
  }

  private getCardInfluence(card: CardData): string {
    // 카드별 주요 영향력 해석
    const influences: { [key: string]: { upright: string; reversed: string } } = {
      'The Fool': { 
        upright: '새로운 시작과 순수한 가능성이 열려 있습니다', 
        reversed: '무모함과 준비 부족에 주의가 필요합니다' 
      },
      'The Magician': { 
        upright: '능력과 재능을 발휘할 때입니다', 
        reversed: '재능을 제대로 활용하지 못하고 있습니다' 
      },
      'The High Priestess': { 
        upright: '직관과 내면의 지혜를 신뢰하세요', 
        reversed: '감정에 압도되지 않도록 주의하세요' 
      },
      'The Empress': { 
        upright: '풍요와 창조성이 넘치는 시기입니다', 
        reversed: '자기 돌봄과 균형이 필요합니다' 
      },
      'The Emperor': { 
        upright: '리더십과 통제력을 발휘하세요', 
        reversed: '지나친 통제욕을 경계하세요' 
      },
      // ... 더 많은 카드 추가 가능
    };
    
    const influence = influences[card.name];
    if (influence) {
      return card.orientation === 'upright' ? influence.upright : influence.reversed;
    }
    
    // 수트 기반 기본 해석
    if (card.suit) {
      const suitInfluences: { [key: string]: { upright: string; reversed: string } } = {
        'wands': { 
          upright: '열정과 창의적 에너지가 활발합니다', 
          reversed: '에너지가 차단되거나 방향을 잃었습니다' 
        },
        'cups': { 
          upright: '감정적 만족과 조화를 이루고 있습니다', 
          reversed: '감정적 불균형이나 실망이 있습니다' 
        },
        'swords': { 
          upright: '명확한 사고와 결단력이 있습니다', 
          reversed: '혼란스럽거나 갈등이 있습니다' 
        },
        'pentacles': { 
          upright: '물질적 안정과 실용성이 강조됩니다', 
          reversed: '물질적 불안정이나 손실이 우려됩니다' 
        }
      };
      
      const suitInfluence = suitInfluences[card.suit];
      if (suitInfluence) {
        return card.orientation === 'upright' ? suitInfluence.upright : suitInfluence.reversed;
      }
    }
    
    return card.orientation === 'upright' ? 
      '긍정적인 에너지가 작용하고 있습니다' : 
      '도전과 성장의 기회가 있습니다';
  }

  private analyzeChallenges(): string[] {
    const challenges: string[] = [];
    
    // 역방향 카드 분석
    const reversedCards = this.cards.filter(card => card.orientation === 'reversed');
    
    if (reversedCards.length >= 4) {
      challenges.push('많은 역방향 카드가 나타나 전반적인 어려움이 예상됩니다');
    }
    
    // 특정 위치의 역방향 카드 분석
    if (this.cards[1]?.orientation === 'reversed') { // 현재
      challenges.push(`현재 상황(${this.cards[1].nameKr})에서 직접적인 도전에 직면해 있습니다`);
    }
    
    if (this.cards[3]?.orientation === 'reversed') { // 내면
      challenges.push(`내적 갈등(${this.cards[3].nameKr})을 해결해야 합니다`);
    }
    
    if (this.cards[4]?.orientation === 'reversed') { // 외부
      challenges.push(`외부 환경(${this.cards[4].nameKr})이 우호적이지 않습니다`);
    }
    
    // 과거-미래 연결 분석
    if (this.cards[0]?.orientation === 'reversed' && this.cards[2]?.orientation === 'reversed') {
      challenges.push('과거의 문제가 미래까지 이어질 가능성이 있습니다');
    }
    
    return challenges;
  }

  private analyzeOpportunities(): string[] {
    const opportunities: string[] = [];
    
    // 정방향 카드 분석
    const uprightCards = this.cards.filter(card => card.orientation === 'upright');
    
    if (uprightCards.length >= 4) {
      opportunities.push('전반적으로 긍정적인 에너지가 우세합니다');
    }
    
    // 특정 위치의 정방향 카드 분석
    if (this.cards[2]?.orientation === 'upright') { // 미래
      opportunities.push(`미래(${this.cards[2].nameKr})에 좋은 기회가 기다리고 있습니다`);
    }
    
    if (this.cards[5]?.orientation === 'upright') { // 조언
      opportunities.push(`조언 카드(${this.cards[5].nameKr})가 명확한 방향을 제시합니다`);
    }
    
    if (this.cards[6]?.orientation === 'upright') { // 결과
      opportunities.push(`최종 결과(${this.cards[6].nameKr})가 긍정적으로 나타났습니다`);
    }
    
    // 메이저 아르카나 분석
    const majorCards = this.cards.filter(card => card.arcana === 'major');
    if (majorCards.length >= 4) {
      opportunities.push('중요한 영적 성장과 변화의 시기입니다');
    }
    
    return opportunities;
  }

  private analyzeHiddenFactors(): string {
    // 내면과 외부의 상호작용 분석
    const inner = this.cards[3];
    const outer = this.cards[4];
    const advice = this.cards[5];
    
    const factors: string[] = [];
    
    // 내외부 불일치 분석
    if (inner && outer && inner.orientation !== outer.orientation) {
      factors.push('겉으로 드러나지 않는 내적 갈등이 상황에 영향을 미치고 있습니다');
    }
    
    // 조언 카드와 현재 상황의 관계
    if (advice && this.cards[1]) {
      if (advice.arcana === 'major' && this.cards[1].arcana === 'minor') {
        factors.push('일상적인 문제보다 더 깊은 영적 차원의 이해가 필요합니다');
      }
    }
    
    // 과거 카드가 메이저이고 현재가 마이너인 경우
    if (this.cards[0]?.arcana === 'major' && this.cards[1]?.arcana === 'minor') {
      factors.push('과거의 중요한 경험이 아직 완전히 통합되지 않았습니다');
    }
    
    // 원소 불균형 체크
    const elements = this.analyzeElementBalance();
    if (elements.imbalance) {
      factors.push(elements.message);
    }
    
    return factors.join('. ') || '모든 요소가 명확하게 드러나 있습니다';
  }

  private analyzeOutcome(): string {
    const result = this.cards[6]; // 최종 결과
    const advice = this.cards[5]; // 조언
    const future = this.cards[2]; // 미래
    
    if (!result) return '결과를 예측할 수 없습니다';
    
    let outcome = `최종 결과로 ${result.nameKr}${result.orientation === 'reversed' ? '(역)' : ''}가 나타났습니다. `;
    
    // 결과 카드 방향에 따른 해석
    if (result.orientation === 'upright') {
      outcome += '노력이 긍정적인 결실을 맺을 것입니다. ';
      
      // 조언과 결과의 연관성
      if (advice?.orientation === 'upright') {
        outcome += '조언을 잘 따른다면 더욱 좋은 결과를 얻을 수 있습니다. ';
      }
    } else {
      outcome += '예상과 다른 결과가 나타날 수 있으나, 이것이 반드시 부정적인 것은 아닙니다. ';
      outcome += '성장과 깨달음의 기회로 삼으세요. ';
    }
    
    // 미래와 결과의 일치성
    if (future && result) {
      if (future.orientation === result.orientation) {
        outcome += '미래의 가능성이 그대로 실현될 가능성이 높습니다.';
      } else {
        outcome += '상황이 예상과 다르게 전개될 수 있으니 유연하게 대처하세요.';
      }
    }
    
    return outcome;
  }

  private generateAdvice(): string {
    const adviceCard = this.cards[5];
    const present = this.cards[1];
    const inner = this.cards[3];
    const outer = this.cards[4];
    
    const advices: string[] = [];
    
    // 조언 카드 기반 조언
    if (adviceCard) {
      if (adviceCard.orientation === 'upright') {
        advices.push(`${adviceCard.nameKr} 카드가 제시하는 긍정적인 방향을 따르세요`);
      } else {
        advices.push(`${adviceCard.nameKr}(역)가 경고하는 함정을 피하세요`);
      }
    }
    
    // 내외부 균형 조언
    if (inner && outer) {
      if (inner.orientation === 'reversed' && outer.orientation === 'upright') {
        advices.push('내면의 평화를 찾는 것이 우선입니다');
      } else if (inner.orientation === 'upright' && outer.orientation === 'reversed') {
        advices.push('외부 환경 개선에 적극적으로 나서세요');
      }
    }
    
    // 현재 상황 기반 조언
    if (present?.orientation === 'reversed') {
      advices.push('현재의 어려움을 성장의 기회로 전환하세요');
    }
    
    // 원소 균형 기반 조언
    const elements = this.analyzeElementBalance();
    if (elements.advice) {
      advices.push(elements.advice);
    }
    
    return advices.join('. ') + '.';
  }

  private analyzeStarPattern(): SevenStarInterpretation['starPattern'] {
    // 별 모양의 에너지 패턴 분석
    const balance = this.analyzeBalance();
    const energy = this.analyzeEnergy();
    const direction = this.analyzeDirection();
    
    return {
      balance,
      energy,
      direction
    };
  }

  private analyzeBalance(): string {
    // 정방향과 역방향 카드의 균형
    const uprightCount = this.cards.filter(c => c.orientation === 'upright').length;
    const reversedCount = this.cards.filter(c => c.orientation === 'reversed').length;
    
    if (Math.abs(uprightCount - reversedCount) <= 1) {
      return '음양의 에너지가 균형을 이루고 있습니다';
    } else if (uprightCount > reversedCount) {
      return '양의 에너지가 우세하여 적극적인 행동이 유리합니다';
    } else {
      return '음의 에너지가 우세하여 내적 성찰이 필요합니다';
    }
  }

  private analyzeEnergy(): string {
    // 메이저와 마이너 카드의 비율로 에너지 강도 분석
    const majorCount = this.cards.filter(c => c.arcana === 'major').length;
    
    if (majorCount >= 5) {
      return '매우 강력한 우주적 에너지가 작동하고 있습니다';
    } else if (majorCount >= 3) {
      return '중요한 전환기의 에너지가 흐르고 있습니다';
    } else {
      return '일상적이고 실용적인 에너지가 주를 이룹니다';
    }
  }

  private analyzeDirection(): string {
    // 과거-현재-미래 카드의 방향성 분석
    const past = this.cards[0];
    const present = this.cards[1];
    const future = this.cards[2];
    
    let direction = 0; // -1: 하향, 0: 정체, 1: 상향
    
    if (past?.orientation === 'reversed') direction++;
    if (present?.orientation === 'upright') direction++;
    if (future?.orientation === 'upright') direction++;
    
    if (direction >= 2) {
      return '상승하는 궤도를 따라 발전하고 있습니다';
    } else if (direction <= 0) {
      return '하향 곡선을 그리고 있으나 반전의 기회가 있습니다';
    } else {
      return '변화의 기로에 서 있으며 선택이 중요합니다';
    }
  }

  /**
   * SevenStarInterpretation 객체를 읽기 쉬운 텍스트로 변환
   */
  private formatInterpretationAsText(interpretation: SevenStarInterpretation): string {
    let text = '';
    
    // 핵심 통찰
    text += '🌟 **핵심 통찰**\n';
    text += interpretation.coreInsight + '\n\n';
    
    // 시간의 흐름에 따른 영향
    text += '⏰ **시간의 흐름**\n';
    text += `• 과거: ${interpretation.influences.past}\n`;
    text += `• 현재: ${interpretation.influences.present}\n`;
    text += `• 미래: ${interpretation.influences.future}\n\n`;
    
    // 도전과 기회
    if (interpretation.challenges.length > 0) {
      text += '⚠️ **직면한 도전**\n';
      interpretation.challenges.forEach(challenge => {
        text += `• ${challenge}\n`;
      });
      text += '\n';
    }
    
    if (interpretation.opportunities.length > 0) {
      text += '✨ **기회와 가능성**\n';
      interpretation.opportunities.forEach(opportunity => {
        text += `• ${opportunity}\n`;
      });
      text += '\n';
    }
    
    // 숨겨진 요소
    if (interpretation.hiddenFactors) {
      text += '🔍 **숨겨진 요소**\n';
      text += interpretation.hiddenFactors + '\n\n';
    }
    
    // 별의 패턴
    text += '⭐ **별의 에너지 패턴**\n';
    text += `• 균형: ${interpretation.starPattern.balance}\n`;
    text += `• 에너지: ${interpretation.starPattern.energy}\n`;
    text += `• 방향: ${interpretation.starPattern.direction}\n\n`;
    
    // 최종 결과
    text += '🎯 **예상되는 결과**\n';
    text += interpretation.outcome + '\n\n';
    
    // 조언
    text += '💡 **조언과 지침**\n';
    text += interpretation.advice;
    
    return text;
  }

  private analyzeElementBalance(): { imbalance: boolean; message: string; advice?: string } {
    const elements: { [key: string]: number } = {
      fire: 0,
      water: 0,
      air: 0,
      earth: 0
    };
    
    // 원소 계산
    this.cards.forEach(card => {
      if (card.element) {
        elements[card.element]++;
      } else if (card.suit) {
        const suitElement: { [key: string]: string } = {
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
    
    const values = Object.values(elements);
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    if (max - min > 3) {
      const dominant = Object.entries(elements).find(([_, v]) => v === max)?.[0];
      const lacking = Object.entries(elements).find(([_, v]) => v === min)?.[0];
      
      const elementNames: { [key: string]: string } = {
        fire: '불(열정)',
        water: '물(감정)',
        air: '공기(사고)',
        earth: '땅(현실)'
      };
      
      const elementAdvice: { [key: string]: string } = {
        fire: '열정을 조절하고 신중함을 더하세요',
        water: '감정보다는 이성적 판단이 필요합니다',
        air: '생각을 행동으로 옮기는 것이 중요합니다',
        earth: '유연성을 발휘하고 변화를 수용하세요'
      };
      
      return {
        imbalance: true,
        message: `${elementNames[dominant!]} 원소가 과도하고 ${elementNames[lacking!]} 원소가 부족합니다`,
        advice: dominant ? elementAdvice[dominant] : undefined
      };
    }
    
    return {
      imbalance: false,
      message: '원소들이 조화를 이루고 있습니다',
      advice: undefined
    };
  }
}
