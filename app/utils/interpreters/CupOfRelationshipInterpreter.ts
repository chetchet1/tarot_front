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

export interface CupOfRelationshipInterpretation {
  relationshipDynamics: {
    yourPerspective: string;
    partnerPerspective: string;
    mutualConnection: string;
  };
  emotionalLandscape: {
    yourFeelings: string;
    partnerFeelings: string;
    sharedEmotions: string;
  };
  challenges: {
    yourChallenges: string[];
    partnerChallenges: string[];
    mutualChallenges: string[];
  };
  strengths: {
    yourStrengths: string[];
    partnerStrengths: string[];
    relationshipStrengths: string[];
  };
  futureOutlook: {
    shortTerm: string;
    longTerm: string;
    potential: string;
  };
  advice: {
    forYou: string;
    forPartner: string;
    forRelationship: string;
  };
  harmonyLevel: {
    emotional: number; // 0-100
    mental: number;
    spiritual: number;
    overall: number;
    analysis: string;
  };
}

export class CupOfRelationshipInterpreter {
  private cards: CardData[] = [];
  
  // 컵 오브 릴레이션십의 7개 포지션
  private positionNames = [
    '1. 당신의 현재 상태',      // 왼쪽 위
    '2. 상대방의 현재 상태',    // 오른쪽 위
    '3. 관계의 기반',           // 중앙 아래
    '4. 당신의 감정',           // 왼쪽 중간
    '5. 상대방의 감정',         // 오른쪽 중간
    '6. 관계의 도전',           // 중앙
    '7. 관계의 미래'            // 중앙 위
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
      '관계에서 당신이 현재 어떤 상태인지 보여줍니다',
      '상대방이 관계에서 어떤 상태인지 나타냅니다',
      '두 사람의 관계가 무엇을 기반으로 하는지 보여줍니다',
      '당신이 상대방에 대해 느끼는 진짜 감정입니다',
      '상대방이 당신에 대해 느끼는 감정을 나타냅니다',
      '관계에서 극복해야 할 도전과 과제입니다',
      '노력한다면 관계가 어떻게 발전할지 보여줍니다'
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
      console.error('컵 오브 릴레이션십 해석 생성 오류:', error);
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

  public getInterpretation(): CupOfRelationshipInterpretation {
    return {
      relationshipDynamics: this.analyzeRelationshipDynamics(),
      emotionalLandscape: this.analyzeEmotionalLandscape(),
      challenges: this.analyzeChallenges(),
      strengths: this.analyzeStrengths(),
      futureOutlook: this.analyzeFutureOutlook(),
      advice: this.generateAdvice(),
      harmonyLevel: this.analyzeHarmonyLevel()
    };
  }

  private analyzeRelationshipDynamics(): CupOfRelationshipInterpretation['relationshipDynamics'] {
    const yourState = this.cards[0]; // 당신의 현재 상태
    const partnerState = this.cards[1]; // 상대방의 현재 상태
    const foundation = this.cards[2]; // 관계의 기반
    
    return {
      yourPerspective: this.analyzeYourPerspective(yourState),
      partnerPerspective: this.analyzePartnerPerspective(partnerState),
      mutualConnection: this.analyzeMutualConnection(yourState, partnerState, foundation)
    };
  }

  private analyzeYourPerspective(card: CardData | undefined): string {
    if (!card) return '당신의 상태를 파악할 수 없습니다';
    
    let perspective = `당신은 현재 ${card.nameKr}${card.orientation === 'reversed' ? '(역)' : ''}의 에너지를 보이고 있습니다. `;
    
    if (card.orientation === 'upright') {
      perspective += '관계에 대해 긍정적이고 개방적인 태도를 가지고 있으며, ';
      
      if (card.arcana === 'major') {
        perspective += '이 관계가 인생에서 중요한 의미를 지닌다고 느끼고 있습니다. ';
      } else {
        perspective += '일상적이고 실용적인 관점에서 관계를 바라보고 있습니다. ';
      }
    } else {
      perspective += '관계에서 어떤 불안이나 의구심을 품고 있을 수 있으며, ';
      perspective += '자신의 진정한 감정을 표현하는 데 어려움을 겪고 있을 수 있습니다. ';
    }
    
    // 수트별 추가 해석
    if (card.suit) {
      const suitPerspectives: { [key: string]: string } = {
        'wands': '열정과 에너지를 가지고 관계에 임하고 있습니다',
        'cups': '깊은 감정적 연결을 추구하고 있습니다',
        'swords': '이성적이고 논리적으로 관계를 분석하고 있습니다',
        'pentacles': '안정적이고 실질적인 관계를 원하고 있습니다'
      };
      
      if (suitPerspectives[card.suit]) {
        perspective += suitPerspectives[card.suit] + '.';
      }
    }
    
    return perspective;
  }

  private analyzePartnerPerspective(card: CardData | undefined): string {
    if (!card) return '상대방의 상태를 파악할 수 없습니다';
    
    let perspective = `상대방은 ${card.nameKr}${card.orientation === 'reversed' ? '(역)' : ''}의 상태입니다. `;
    
    if (card.orientation === 'upright') {
      perspective += '관계에 대해 진지하고 성실한 태도를 보이고 있으며, ';
      
      if (card.arcana === 'major') {
        perspective += '이 관계를 통해 중요한 성장과 변화를 경험하고 있습니다. ';
      } else {
        perspective += '현실적이고 실질적인 접근을 하고 있습니다. ';
      }
    } else {
      perspective += '내적 갈등이나 혼란을 겪고 있을 가능성이 있으며, ';
      perspective += '아직 준비가 되지 않았거나 과거의 상처가 영향을 미치고 있을 수 있습니다. ';
    }
    
    return perspective;
  }

  private analyzeMutualConnection(your: CardData | undefined, partner: CardData | undefined, foundation: CardData | undefined): string {
    if (!foundation) return '관계의 연결점을 파악할 수 없습니다';
    
    let connection = `두 사람의 관계는 ${foundation.nameKr}${foundation.orientation === 'reversed' ? '(역)' : ''}을 기반으로 하고 있습니다. `;
    
    // 기반 카드의 방향에 따른 해석
    if (foundation.orientation === 'upright') {
      connection += '견고하고 건강한 토대 위에 세워져 있으며, ';
      
      // 두 사람의 카드 방향 비교
      if (your?.orientation === 'upright' && partner?.orientation === 'upright') {
        connection += '서로가 같은 방향을 바라보며 조화를 이루고 있습니다. ';
      } else if (your?.orientation !== partner?.orientation) {
        connection += '서로 다른 관점을 가지고 있지만 이것이 관계를 풍부하게 만들 수 있습니다. ';
      }
    } else {
      connection += '아직 불안정하거나 해결되지 않은 문제가 있을 수 있으며, ';
      connection += '관계의 기초를 다시 다질 필요가 있습니다. ';
    }
    
    // 원소 조화 분석
    if (your?.element && partner?.element) {
      if (your.element === partner.element) {
        connection += '같은 원소 에너지를 공유하여 깊은 이해가 가능합니다.';
      } else if (this.areElementsCompatible(your.element, partner.element)) {
        connection += '서로 보완적인 에너지를 가지고 있어 균형잡힌 관계가 가능합니다.';
      } else {
        connection += '서로 다른 에너지로 인해 이해와 조율이 필요합니다.';
      }
    }
    
    return connection;
  }

  private areElementsCompatible(element1: string, element2: string): boolean {
    const compatibility: { [key: string]: string[] } = {
      'fire': ['air', 'fire'],
      'water': ['earth', 'water'],
      'air': ['fire', 'air'],
      'earth': ['water', 'earth']
    };
    
    return compatibility[element1]?.includes(element2) || false;
  }

  private analyzeEmotionalLandscape(): CupOfRelationshipInterpretation['emotionalLandscape'] {
    const yourEmotion = this.cards[3]; // 당신의 감정
    const partnerEmotion = this.cards[4]; // 상대방의 감정
    const challenge = this.cards[5]; // 관계의 도전
    
    return {
      yourFeelings: this.analyzeYourFeelings(yourEmotion),
      partnerFeelings: this.analyzePartnerFeelings(partnerEmotion),
      sharedEmotions: this.analyzeSharedEmotions(yourEmotion, partnerEmotion, challenge)
    };
  }

  private analyzeYourFeelings(card: CardData | undefined): string {
    if (!card) return '당신의 감정을 파악할 수 없습니다';
    
    let feelings = `당신의 감정은 ${card.nameKr}${card.orientation === 'reversed' ? '(역)' : ''}로 나타납니다. `;
    
    // 수트별 감정 해석
    if (card.suit === 'cups') {
      feelings += card.orientation === 'upright' ? 
        '깊고 진실한 감정을 느끼고 있으며, 감정적으로 충만합니다. ' :
        '감정적 혼란이나 실망을 경험하고 있을 수 있습니다. ';
    } else if (card.suit === 'wands') {
      feelings += card.orientation === 'upright' ? 
        '열정적이고 적극적인 감정을 가지고 있습니다. ' :
        '열정이 식었거나 좌절감을 느끼고 있을 수 있습니다. ';
    } else if (card.suit === 'swords') {
      feelings += card.orientation === 'upright' ? 
        '감정보다는 이성적으로 관계를 바라보고 있습니다. ' :
        '의심이나 불안한 생각들이 감정에 영향을 미치고 있습니다. ';
    } else if (card.suit === 'pentacles') {
      feelings += card.orientation === 'upright' ? 
        '안정적이고 실질적인 애정을 느끼고 있습니다. ' :
        '물질적 불안이 감정에 영향을 미치고 있을 수 있습니다. ';
    }
    
    // 메이저 아르카나인 경우
    if (card.arcana === 'major') {
      feelings += '이 감정은 단순한 일시적 느낌이 아니라 깊은 영혼의 울림입니다.';
    }
    
    return feelings;
  }

  private analyzePartnerFeelings(card: CardData | undefined): string {
    if (!card) return '상대방의 감정을 파악할 수 없습니다';
    
    let feelings = `상대방의 감정은 ${card.nameKr}${card.orientation === 'reversed' ? '(역)' : ''}로 표현됩니다. `;
    
    if (card.orientation === 'upright') {
      feelings += '상대방은 당신에 대해 긍정적인 감정을 가지고 있으며, ';
      
      // 특정 카드별 해석
      if (card.name === 'The Lovers') {
        feelings += '진정한 사랑과 연결을 느끼고 있습니다. ';
      } else if (card.name === 'Two of Cups') {
        feelings += '상호 존중과 애정을 느끼고 있습니다. ';
      } else if (card.arcana === 'major') {
        feelings += '이 관계를 매우 중요하게 생각하고 있습니다. ';
      } else {
        feelings += '안정적이고 편안한 감정을 느끼고 있습니다. ';
      }
    } else {
      feelings += '상대방은 어떤 감정적 어려움을 겪고 있을 수 있으며, ';
      feelings += '아직 마음을 완전히 열지 못했거나 과거의 상처가 영향을 미치고 있을 수 있습니다. ';
    }
    
    return feelings;
  }

  private analyzeSharedEmotions(your: CardData | undefined, partner: CardData | undefined, challenge: CardData | undefined): string {
    if (!your || !partner) return '공유된 감정을 파악할 수 없습니다';
    
    let shared = '두 사람이 공유하는 감정적 공간은 ';
    
    // 두 감정 카드의 조화도 분석
    if (your.orientation === partner.orientation) {
      shared += '조화롭고 일치된 느낌을 가지고 있습니다. ';
      
      if (your.orientation === 'upright') {
        shared += '서로에 대한 긍정적인 감정이 상호작용하며 관계를 강화시키고 있습니다. ';
      } else {
        shared += '함께 어려움을 극복해야 하는 시기이지만, 이것이 관계를 더욱 깊게 만들 수 있습니다. ';
      }
    } else {
      shared += '서로 다른 감정적 상태에 있어 이해와 소통이 필요합니다. ';
      shared += '한 사람은 준비가 되어 있지만 다른 사람은 시간이 필요할 수 있습니다. ';
    }
    
    // 도전 카드의 영향
    if (challenge) {
      if (challenge.orientation === 'reversed') {
        shared += `${challenge.nameKr}(역)가 감정적 소통을 방해하고 있을 수 있습니다.`;
      } else {
        shared += `${challenge.nameKr}를 통해 감정적 성장의 기회를 맞고 있습니다.`;
      }
    }
    
    return shared;
  }

  private analyzeChallenges(): CupOfRelationshipInterpretation['challenges'] {
    const yourState = this.cards[0];
    const partnerState = this.cards[1];
    const challenge = this.cards[5];
    const foundation = this.cards[2];
    
    return {
      yourChallenges: this.analyzeYourChallenges(yourState, challenge),
      partnerChallenges: this.analyzePartnerChallenges(partnerState, challenge),
      mutualChallenges: this.analyzeMutualChallenges(challenge, foundation)
    };
  }

  private analyzeYourChallenges(yourState: CardData | undefined, challenge: CardData | undefined): string[] {
    const challenges: string[] = [];
    
    if (yourState?.orientation === 'reversed') {
      challenges.push(`${yourState.nameKr}(역)가 나타내는 내적 갈등을 해결해야 합니다`);
    }
    
    if (this.cards[3]?.orientation === 'reversed') { // 당신의 감정
      challenges.push('자신의 진정한 감정을 인정하고 표현하는 것이 어려울 수 있습니다');
    }
    
    // 원소 불균형 체크
    if (yourState?.element === 'air' || yourState?.suit === 'swords') {
      challenges.push('지나친 분석과 생각이 감정적 연결을 방해할 수 있습니다');
    }
    
    if (challenge?.orientation === 'reversed') {
      challenges.push('관계의 도전을 직면하기보다 회피하려는 경향이 있을 수 있습니다');
    }
    
    return challenges;
  }

  private analyzePartnerChallenges(partnerState: CardData | undefined, challenge: CardData | undefined): string[] {
    const challenges: string[] = [];
    
    if (partnerState?.orientation === 'reversed') {
      challenges.push(`상대방은 ${partnerState.nameKr}(역)의 어려움을 겪고 있습니다`);
    }
    
    if (this.cards[4]?.orientation === 'reversed') { // 상대방의 감정
      challenges.push('상대방이 감정 표현에 어려움을 겪고 있을 수 있습니다');
    }
    
    // 메이저 아르카나가 역방향인 경우
    if (partnerState?.arcana === 'major' && partnerState?.orientation === 'reversed') {
      challenges.push('상대방이 인생의 중요한 전환기를 어렵게 통과하고 있습니다');
    }
    
    return challenges;
  }

  private analyzeMutualChallenges(challenge: CardData | undefined, foundation: CardData | undefined): string[] {
    const challenges: string[] = [];
    
    if (challenge) {
      const challengeName = `${challenge.nameKr}${challenge.orientation === 'reversed' ? '(역)' : ''}`;
      challenges.push(`관계의 주요 도전은 ${challengeName}입니다`);
      
      if (challenge.orientation === 'reversed') {
        challenges.push('이 도전을 직면하고 해결하는 것이 관계 성장의 열쇠입니다');
      } else {
        challenges.push('이 도전을 통해 관계가 더욱 성숙해질 수 있습니다');
      }
    }
    
    if (foundation?.orientation === 'reversed') {
      challenges.push('관계의 기반이 불안정하여 신뢰 구축이 필요합니다');
    }
    
    // 미래 카드가 역방향인 경우
    if (this.cards[6]?.orientation === 'reversed') {
      challenges.push('현재의 패턴을 바꾸지 않으면 원하는 미래를 얻기 어려울 수 있습니다');
    }
    
    return challenges;
  }

  private analyzeStrengths(): CupOfRelationshipInterpretation['strengths'] {
    return {
      yourStrengths: this.analyzeYourStrengths(),
      partnerStrengths: this.analyzePartnerStrengths(),
      relationshipStrengths: this.analyzeRelationshipStrengths()
    };
  }

  private analyzeYourStrengths(): string[] {
    const strengths: string[] = [];
    
    if (this.cards[0]?.orientation === 'upright') {
      strengths.push(`${this.cards[0].nameKr}의 긍정적 에너지를 발휘하고 있습니다`);
    }
    
    if (this.cards[3]?.orientation === 'upright') { // 당신의 감정
      strengths.push('진실한 감정을 가지고 관계에 임하고 있습니다');
    }
    
    // 메이저 아르카나가 정방향인 경우
    if (this.cards[0]?.arcana === 'major' && this.cards[0]?.orientation === 'upright') {
      strengths.push('영적 성숙함과 깊은 이해력을 보이고 있습니다');
    }
    
    return strengths;
  }

  private analyzePartnerStrengths(): string[] {
    const strengths: string[] = [];
    
    if (this.cards[1]?.orientation === 'upright') {
      strengths.push(`상대방은 ${this.cards[1].nameKr}의 장점을 보이고 있습니다`);
    }
    
    if (this.cards[4]?.orientation === 'upright') { // 상대방의 감정
      strengths.push('상대방은 당신에 대해 긍정적인 감정을 가지고 있습니다');
    }
    
    // 컵 수트가 정방향인 경우
    if (this.cards[1]?.suit === 'cups' && this.cards[1]?.orientation === 'upright') {
      strengths.push('상대방은 감정적으로 개방적이고 수용적입니다');
    }
    
    return strengths;
  }

  private analyzeRelationshipStrengths(): string[] {
    const strengths: string[] = [];
    
    if (this.cards[2]?.orientation === 'upright') { // 기반
      strengths.push(`${this.cards[2].nameKr}의 견고한 토대를 가지고 있습니다`);
    }
    
    if (this.cards[6]?.orientation === 'upright') { // 미래
      strengths.push(`밝은 미래(${this.cards[6].nameKr})가 기다리고 있습니다`);
    }
    
    // 정방향 카드가 많은 경우
    const uprightCount = this.cards.filter(c => c.orientation === 'upright').length;
    if (uprightCount >= 5) {
      strengths.push('전반적으로 긍정적인 에너지가 관계를 지배하고 있습니다');
    }
    
    // 같은 수트가 많은 경우
    const suitCounts = this.countSuits();
    const dominantSuit = Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0];
    if (dominantSuit && dominantSuit[1] >= 3) {
      const suitStrengths: { [key: string]: string } = {
        'cups': '깊은 감정적 연결과 공감대를 형성하고 있습니다',
        'wands': '열정과 활력이 넘치는 역동적인 관계입니다',
        'swords': '명확한 소통과 이해가 가능한 관계입니다',
        'pentacles': '현실적이고 안정적인 관계를 구축하고 있습니다'
      };
      if (suitStrengths[dominantSuit[0]]) {
        strengths.push(suitStrengths[dominantSuit[0]]);
      }
    }
    
    return strengths;
  }

  private countSuits(): { [key: string]: number } {
    const suits: { [key: string]: number } = {
      'cups': 0,
      'wands': 0,
      'swords': 0,
      'pentacles': 0
    };
    
    this.cards.forEach(card => {
      if (card.suit && suits[card.suit] !== undefined) {
        suits[card.suit]++;
      }
    });
    
    return suits;
  }

  private analyzeFutureOutlook(): CupOfRelationshipInterpretation['futureOutlook'] {
    const future = this.cards[6]; // 관계의 미래
    const challenge = this.cards[5]; // 관계의 도전
    const foundation = this.cards[2]; // 기반
    
    return {
      shortTerm: this.analyzeShortTermFuture(challenge, foundation),
      longTerm: this.analyzeLongTermFuture(future),
      potential: this.analyzePotential(future, foundation)
    };
  }

  private analyzeShortTermFuture(challenge: CardData | undefined, foundation: CardData | undefined): string {
    let outlook = '단기적으로는 ';
    
    if (challenge) {
      if (challenge.orientation === 'upright') {
        outlook += `${challenge.nameKr}의 과제를 건설적으로 다루며 성장할 것입니다. `;
      } else {
        outlook += `${challenge.nameKr}(역)의 어려움을 극복하는 과정이 필요합니다. `;
      }
    }
    
    if (foundation?.orientation === 'upright') {
      outlook += '견고한 기반 덕분에 어려움도 함께 이겨낼 수 있습니다.';
    } else {
      outlook += '기초를 다지는 시간이 필요할 것입니다.';
    }
    
    return outlook;
  }

  private analyzeLongTermFuture(future: CardData | undefined): string {
    if (!future) return '장기적 미래를 예측할 수 없습니다';
    
    let outlook = `장기적으로 ${future.nameKr}${future.orientation === 'reversed' ? '(역)' : ''}의 결과가 예상됩니다. `;
    
    if (future.orientation === 'upright') {
      outlook += '노력과 헌신이 아름다운 결실을 맺을 것입니다. ';
      
      if (future.arcana === 'major') {
        outlook += '이 관계는 두 사람의 인생에 중요한 의미를 남길 것입니다. ';
      } else {
        outlook += '안정적이고 만족스러운 관계로 발전할 것입니다. ';
      }
    } else {
      outlook += '예상과 다른 전개가 있을 수 있으나, ';
      outlook += '이것이 반드시 부정적인 것은 아니며 성장의 기회가 될 수 있습니다. ';
    }
    
    return outlook;
  }

  private analyzePotential(future: CardData | undefined, foundation: CardData | undefined): string {
    let potential = '이 관계의 잠재력은 ';
    
    // 미래와 기반 카드가 모두 정방향인 경우
    if (future?.orientation === 'upright' && foundation?.orientation === 'upright') {
      potential += '매우 높습니다. 서로에 대한 헌신과 노력으로 아름다운 관계를 만들어갈 수 있습니다. ';
    } else if (future?.orientation === 'reversed' || foundation?.orientation === 'reversed') {
      potential += '아직 완전히 발현되지 않았습니다. 도전을 극복하면서 더 깊은 관계로 발전할 수 있습니다. ';
    } else {
      potential += '두 사람의 노력에 따라 결정될 것입니다. ';
    }
    
    // 메이저 아르카나가 많은 경우
    const majorCount = this.cards.filter(c => c.arcana === 'major').length;
    if (majorCount >= 4) {
      potential += '이 관계는 단순한 인연을 넘어 영혼의 성장을 위한 만남입니다.';
    }
    
    return potential;
  }

  private generateAdvice(): CupOfRelationshipInterpretation['advice'] {
    return {
      forYou: this.generateAdviceForYou(),
      forPartner: this.generateAdviceForPartner(),
      forRelationship: this.generateAdviceForRelationship()
    };
  }

  private generateAdviceForYou(): string {
    const yourState = this.cards[0];
    const yourEmotion = this.cards[3];
    const challenge = this.cards[5];
    
    const advices: string[] = [];
    
    if (yourState?.orientation === 'reversed') {
      advices.push('먼저 자신의 내면을 정리하고 안정을 찾으세요');
    }
    
    if (yourEmotion?.orientation === 'upright') {
      advices.push('당신의 진실한 감정을 상대방에게 표현하세요');
    } else {
      advices.push('자신의 감정을 명확히 인식하고 수용하는 것이 중요합니다');
    }
    
    if (challenge?.suit === 'swords') {
      advices.push('지나친 분석보다는 마음의 소리에 귀 기울이세요');
    }
    
    // 원소별 조언
    if (yourState?.element === 'fire' || yourState?.suit === 'wands') {
      advices.push('열정을 유지하되 상대방의 속도를 존중하세요');
    } else if (yourState?.element === 'water' || yourState?.suit === 'cups') {
      advices.push('감정에 휩쓸리지 말고 균형을 유지하세요');
    } else if (yourState?.element === 'air' || yourState?.suit === 'swords') {
      advices.push('생각만 하지 말고 감정도 표현하세요');
    } else if (yourState?.element === 'earth' || yourState?.suit === 'pentacles') {
      advices.push('현실적 기대와 낭만적 이상 사이의 균형을 찾으세요');
    }
    
    return advices.join('. ') + '.';
  }

  private generateAdviceForPartner(): string {
    const partnerState = this.cards[1];
    const partnerEmotion = this.cards[4];
    
    const advices: string[] = [];
    
    advices.push('상대방에게는 ');
    
    if (partnerState?.orientation === 'reversed') {
      advices.push('시간과 공간을 주어 스스로를 정리할 수 있도록 하세요');
    } else {
      advices.push('상대방의 긍정적 에너지를 인정하고 격려해주세요');
    }
    
    if (partnerEmotion?.orientation === 'reversed') {
      advices.push('상대방이 감정을 표현할 수 있도록 안전한 공간을 만들어주세요');
    }
    
    if (partnerState?.arcana === 'major') {
      advices.push('상대방이 겪고 있는 중요한 변화를 이해하고 지지해주세요');
    }
    
    return advices.join('. ') + '.';
  }

  private generateAdviceForRelationship(): string {
    const foundation = this.cards[2];
    const challenge = this.cards[5];
    const future = this.cards[6];
    
    const advices: string[] = [];
    
    // 기반 카드 기반 조언
    if (foundation?.orientation === 'upright') {
      advices.push('관계의 견고한 기반을 신뢰하고 앞으로 나아가세요');
    } else {
      advices.push('관계의 기초를 다시 점검하고 강화할 필요가 있습니다');
    }
    
    // 도전 카드 기반 조언
    if (challenge) {
      if (challenge.orientation === 'upright') {
        advices.push(`${challenge.nameKr}의 교훈을 함께 배워가세요`);
      } else {
        advices.push(`${challenge.nameKr}(역)의 함정을 인식하고 극복하세요`);
      }
    }
    
    // 미래 카드 기반 조언
    if (future?.orientation === 'upright') {
      advices.push('긍정적인 미래를 위해 현재의 노력을 계속하세요');
    } else {
      advices.push('예상치 못한 변화를 성장의 기회로 받아들이세요');
    }
    
    // 전체적인 조언
    const uprightCount = this.cards.filter(c => c.orientation === 'upright').length;
    if (uprightCount >= 5) {
      advices.push('전반적으로 긍정적인 흐름이니 자신감을 가지세요');
    } else if (uprightCount <= 2) {
      advices.push('어려운 시기이지만 함께라면 극복할 수 있습니다');
    }
    
    return advices.join('. ') + '.';
  }

  /**
   * CupOfRelationshipInterpretation 객체를 읽기 쉬운 텍스트로 변환
   */
  private formatInterpretationAsText(interpretation: CupOfRelationshipInterpretation): string {
    let text = '';
    
    // 관계 다이나믹스
    text += '👥 **관계의 역학**\n';
    text += `• 당신의 관점: ${interpretation.relationshipDynamics.yourPerspective}\n`;
    text += `• 상대의 관점: ${interpretation.relationshipDynamics.partnerPerspective}\n`;
    text += `• 상호 연결: ${interpretation.relationshipDynamics.mutualConnection}\n\n`;
    
    // 감정의 풍경
    text += '💖 **감정의 흐름**\n';
    text += `• 당신의 감정: ${interpretation.emotionalLandscape.yourFeelings}\n`;
    text += `• 상대의 감정: ${interpretation.emotionalLandscape.partnerFeelings}\n`;
    text += `• 공유하는 감정: ${interpretation.emotionalLandscape.sharedEmotions}\n\n`;
    
    // 강점
    text += '✨ **관계의 강점**\n';
    if (interpretation.strengths.yourStrengths.length > 0) {
      text += '당신의 강점:\n';
      interpretation.strengths.yourStrengths.forEach(strength => {
        text += `  • ${strength}\n`;
      });
    }
    if (interpretation.strengths.partnerStrengths.length > 0) {
      text += '상대의 강점:\n';
      interpretation.strengths.partnerStrengths.forEach(strength => {
        text += `  • ${strength}\n`;
      });
    }
    if (interpretation.strengths.relationshipStrengths.length > 0) {
      text += '관계의 강점:\n';
      interpretation.strengths.relationshipStrengths.forEach(strength => {
        text += `  • ${strength}\n`;
      });
    }
    text += '\n';
    
    // 도전
    if (interpretation.challenges.yourChallenges.length > 0 || 
        interpretation.challenges.partnerChallenges.length > 0 || 
        interpretation.challenges.mutualChallenges.length > 0) {
      text += '⚠️ **극복해야 할 도전**\n';
      if (interpretation.challenges.yourChallenges.length > 0) {
        text += '당신이 마주한 도전:\n';
        interpretation.challenges.yourChallenges.forEach(challenge => {
          text += `  • ${challenge}\n`;
        });
      }
      if (interpretation.challenges.partnerChallenges.length > 0) {
        text += '상대가 마주한 도전:\n';
        interpretation.challenges.partnerChallenges.forEach(challenge => {
          text += `  • ${challenge}\n`;
        });
      }
      if (interpretation.challenges.mutualChallenges.length > 0) {
        text += '함께 극복해야 할 도전:\n';
        interpretation.challenges.mutualChallenges.forEach(challenge => {
          text += `  • ${challenge}\n`;
        });
      }
      text += '\n';
    }
    
    // 미래 전망
    text += '🔮 **미래 전망**\n';
    text += `• 단기: ${interpretation.futureOutlook.shortTerm}\n`;
    text += `• 장기: ${interpretation.futureOutlook.longTerm}\n`;
    text += `• 잠재력: ${interpretation.futureOutlook.potential}\n\n`;
    
    // 조화 수준
    text += '🌈 **조화 수준**\n';
    text += `• 감정적 조화: ${interpretation.harmonyLevel.emotional}%\n`;
    text += `• 정신적 조화: ${interpretation.harmonyLevel.mental}%\n`;
    text += `• 영적 조화: ${interpretation.harmonyLevel.spiritual}%\n`;
    text += `• 종합 조화도: ${interpretation.harmonyLevel.overall}%\n`;
    text += `${interpretation.harmonyLevel.analysis}\n\n`;
    
    // 조언
    text += '💡 **조언과 지침**\n';
    text += `당신에게: ${interpretation.advice.forYou}\n\n`;
    text += `상대를 위해: ${interpretation.advice.forPartner}\n\n`;
    text += `관계를 위해: ${interpretation.advice.forRelationship}`;
    
    return text;
  }

  private analyzeHarmonyLevel(): CupOfRelationshipInterpretation['harmonyLevel'] {
    const emotional = this.calculateEmotionalHarmony();
    const mental = this.calculateMentalHarmony();
    const spiritual = this.calculateSpiritualHarmony();
    const overall = Math.round((emotional + mental + spiritual) / 3);
    
    return {
      emotional,
      mental,
      spiritual,
      overall,
      analysis: this.analyzeHarmonyPattern(emotional, mental, spiritual, overall)
    };
  }

  private calculateEmotionalHarmony(): number {
    let harmony = 50; // 기본값
    
    // 감정 카드들의 조화
    if (this.cards[3]?.orientation === 'upright') harmony += 15;
    if (this.cards[4]?.orientation === 'upright') harmony += 15;
    
    // 두 감정이 같은 방향이면 추가 점수
    if (this.cards[3]?.orientation === this.cards[4]?.orientation) harmony += 10;
    
    // 컵 카드가 많으면 감정적 조화 증가
    const cupCount = this.cards.filter(c => c.suit === 'cups').length;
    harmony += cupCount * 3;
    
    // 기반이 정방향이면 추가
    if (this.cards[2]?.orientation === 'upright') harmony += 10;
    
    return Math.min(100, Math.max(0, harmony));
  }

  private calculateMentalHarmony(): number {
    let harmony = 50;
    
    // 상태 카드들의 조화
    if (this.cards[0]?.orientation === 'upright') harmony += 10;
    if (this.cards[1]?.orientation === 'upright') harmony += 10;
    
    // 두 상태가 같은 방향이면 추가 점수
    if (this.cards[0]?.orientation === this.cards[1]?.orientation) harmony += 15;
    
    // 소드 카드가 적당히 있으면 정신적 명료함
    const swordCount = this.cards.filter(c => c.suit === 'swords').length;
    if (swordCount >= 1 && swordCount <= 2) harmony += 10;
    else if (swordCount > 3) harmony -= 10; // 너무 많으면 갈등
    
    // 도전이 정방향이면 건설적
    if (this.cards[5]?.orientation === 'upright') harmony += 15;
    
    return Math.min(100, Math.max(0, harmony));
  }

  private calculateSpiritualHarmony(): number {
    let harmony = 50;
    
    // 메이저 아르카나 개수
    const majorCount = this.cards.filter(c => c.arcana === 'major').length;
    harmony += majorCount * 5;
    
    // 미래가 정방향이면 영적 성장
    if (this.cards[6]?.orientation === 'upright') harmony += 20;
    
    // 기반과 미래가 같은 방향이면 일관된 성장
    if (this.cards[2]?.orientation === this.cards[6]?.orientation) harmony += 10;
    
    // 정방향 카드가 많으면 영적 조화
    const uprightCount = this.cards.filter(c => c.orientation === 'upright').length;
    harmony += (uprightCount - 3) * 5;
    
    return Math.min(100, Math.max(0, harmony));
  }

  private analyzeHarmonyPattern(emotional: number, mental: number, spiritual: number, overall: number): string {
    let analysis = '';
    
    // 전체적인 조화도 분석
    if (overall >= 75) {
      analysis = '두 사람은 매우 높은 수준의 조화를 이루고 있습니다. ';
    } else if (overall >= 50) {
      analysis = '적당한 수준의 조화를 유지하고 있으며, 노력으로 더 발전할 수 있습니다. ';
    } else {
      analysis = '현재 조화를 찾아가는 과정에 있으며, 서로를 이해하려는 노력이 필요합니다. ';
    }
    
    // 가장 높은 조화 영역
    const highest = Math.max(emotional, mental, spiritual);
    if (highest === emotional) {
      analysis += '특히 감정적 연결이 강합니다. ';
    } else if (highest === mental) {
      analysis += '정신적 이해와 소통이 잘 이루어지고 있습니다. ';
    } else {
      analysis += '영적인 차원에서 깊은 연결을 느끼고 있습니다. ';
    }
    
    // 가장 낮은 조화 영역
    const lowest = Math.min(emotional, mental, spiritual);
    if (lowest === emotional && lowest < 50) {
      analysis += '감정적 교류를 더 활발히 할 필요가 있습니다.';
    } else if (lowest === mental && lowest < 50) {
      analysis += '서로의 생각을 더 명확히 공유할 필요가 있습니다.';
    } else if (lowest === spiritual && lowest < 50) {
      analysis += '더 깊은 차원의 연결을 추구해보세요.';
    }
    
    return analysis;
  }
}
