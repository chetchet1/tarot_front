import { TarotCard, DrawnCard, SpreadPosition } from '../../models/tarot';

interface Pattern {
  pattern_name: string;
  description: string;
  positions: number[];
}

interface Synergy {
  card1Name: string;
  card2Name: string;
  positions: number[];
  description: string;
}

interface EnhancedInterpretation {
  overallMessage: string;
  combinationPatterns: Pattern[];
  synergies: Synergy[];
  actionSuggestions: string[];
  positionMeanings: Array<{
    position: string;
    meaning: string;
    card_name: string;
  }>;
}

// 기본 향상된 해석기 클래스
export class BaseEnhancedInterpreter {
  protected topic: string;
  protected cards: DrawnCard[];

  constructor(topic: string, cards: DrawnCard[]) {
    this.topic = topic;
    this.cards = cards;
  }

  // 카드의 에너지를 설명하는 텍스트 반환 (주제별로 다르게)
  protected getCardEnergy(card: DrawnCard): string {
    if (this.topic === 'love') {
      return this.getLoveCardEnergy(card);
    } else if (this.topic === 'career') {
      return this.getCareerCardEnergy(card);
    }
    
    if (card.arcana === 'major') {
      const energies: Record<number, string> = {
        0: '새로운 시작의 에너지',
        1: '창조와 의지의 에너지',
        2: '직관과 신비의 에너지',
        3: '풍요와 창조의 에너지',
        4: '권위와 구조의 에너지',
        5: '전통과 지혜의 에너지',
        6: '사랑과 선택의 에너지',
        7: '의지와 전진의 에너지',
        8: '내면의 힘',
        9: '내적 탐구의 에너지',
        10: '운명의 순환',
        11: '균형과 공정의 에너지',
        12: '희생과 관점 전환의 에너지',
        13: '변화와 재생의 에너지',
        14: '조화와 절제의 에너지',
        15: '물질과 욕망의 에너지',
        16: '급변과 해방의 에너지',
        17: '희망과 영감의 에너지',
        18: '환상과 직관의 에너지',
        19: '성공과 활력의 에너지',
        20: '재생과 심판의 에너지',
        21: '완성과 통합의 에너지'
      };
      return energies[card.number] || '강력한 에너지';
    } else {
      const suitEnergies: Record<string, string> = {
        'wands': '열정과 창의의',
        'cups': '감정과 직관의',
        'swords': '사고와 결단의',
        'pentacles': '현실과 안정의'
      };
      const numberEnergies: Record<number, string> = {
        1: '시작',
        2: '균형',
        3: '성장',
        4: '안정',
        5: '도전',
        6: '조화',
        7: '성찰',
        8: '발전',
        9: '완성',
        10: '순환',
        11: '탐구',
        12: '헌신',
        13: '변혁',
        14: '통달'
      };
      const suit = suitEnergies[card.suit || ''] || '특별한';
      const number = numberEnergies[card.number] || '과정의';
      return `${suit} ${number} 에너지`;
    }
  }

  // 연애운 전용 카드 에너지 설명
  protected getLoveCardEnergy(card: DrawnCard): string {
    if (card.arcana === 'major') {
      const loveEnergies: Record<number, string> = {
        0: '새로운 만남의 가능성',
        1: '매력과 자신감',
        2: '깊은 감정의 교류',
        3: '풍요로운 사랑',
        4: '안정적인 관계',
        5: '진실한 약속',
        6: '운명적인 사랑',
        7: '관계의 진전',
        8: '내면의 사랑',
        9: '진정한 마음 찾기',
        10: '인연의 순환',
        11: '관계의 균형',
        12: '사랑을 위한 희생',
        13: '관계의 변화',
        14: '조화로운 사랑',
        15: '강한 이끌림',
        16: '관계의 급변',
        17: '희망찬 사랑',
        18: '감정의 혼란',
        19: '행복한 관계',
        20: '관계의 재평가',
        21: '완전한 사랑'
      };
      return loveEnergies[card.number] || '특별한 감정';
    } else {
      const suitLoveEnergies: Record<string, string> = {
        'wands': '열정적인',
        'cups': '감정적인',
        'swords': '이성적인',
        'pentacles': '현실적인'
      };
      const numberLoveEnergies: Record<number, string> = {
        1: '새로운 감정',
        2: '서로를 바라보는 마음',
        3: '사랑의 성장',
        4: '안정된 관계',
        5: '갈등과 화해',
        6: '조화로운 사랑',
        7: '관계의 재점검',
        8: '사랑의 발전',
        9: '깊어지는 마음',
        10: '사랑의 완성',
        11: '설레는 마음',
        12: '헌신적인 사랑',
        13: '사랑의 변혁',
        14: '성숙한 사랑'
      };
      const suit = suitLoveEnergies[card.suit || ''] || '특별한';
      const number = numberLoveEnergies[card.number] || '감정';
      return `${suit} ${number}`;
    }
  }

  // 직업운 전용 카드 에너지 설명
  protected getCareerCardEnergy(card: DrawnCard): string {
    if (card.arcana === 'major') {
      const careerEnergies: Record<number, string> = {
        0: '새로운 직업 기회',
        1: '리더십과 창의성',
        2: '직관적 통찰력',
        3: '창의적 프로젝트',
        4: '조직과 체계',
        5: '전문성과 권위',
        6: '중요한 선택',
        7: '목표 달성의 추진력',
        8: '내적 강인함',
        9: '전문성 탐구',
        10: '경력의 전환',
        11: '공정한 대우',
        12: '관점의 전환',
        13: '직업의 변화',
        14: '워라밸',
        15: '업무 스트레스',
        16: '급격한 변화',
        17: '비전 실현',
        18: '불확실성',
        19: '성공과 인정',
        20: '새로운 평가',
        21: '목표 달성'
      };
      return careerEnergies[card.number] || '중요한 전환';
    } else {
      const suitCareerEnergies: Record<string, string> = {
        'wands': '창의적인',
        'cups': '협력적인',
        'swords': '전략적인',
        'pentacles': '실무적인'
      };
      const numberCareerEnergies: Record<number, string> = {
        1: '새 프로젝트',
        2: '협업',
        3: '팀워크',
        4: '안정적 기반',
        5: '경쟁과 도전',
        6: '성공',
        7: '재평가',
        8: '숙련',
        9: '거의 완성',
        10: '완료와 새출발',
        11: '배움과 성장',
        12: '헌신',
        13: '리더십',
        14: '전문가'
      };
      const suit = suitCareerEnergies[card.suit || ''] || '특별한';
      const number = numberCareerEnergies[card.number] || '과정';
      return `${suit} ${number}`;
    }
  }

  // 카드 조합 패턴 분석
  protected analyzePatterns(): Pattern[] {
    const patterns: Pattern[] = [];
    
    // 메이저 아르카나 비율 분석
    const majorCount = this.cards.filter(c => c.arcana === 'major').length;
    if (majorCount >= Math.ceil(this.cards.length * 0.6)) {
      patterns.push({
        pattern_name: '운명의 전환점',
        description: '메이저 아르카나가 다수를 차지하여 중요한 인생의 전환점을 나타냅니다.',
        positions: this.cards.filter(c => c.arcana === 'major').map(c => c.position.position)
      });
    }

    // 같은 수트 연속 체크
    const suitGroups = this.groupBySuit();
    for (const [suit, cards] of Object.entries(suitGroups)) {
      if (cards.length >= 3) {
        patterns.push({
          pattern_name: `${this.getSuitName(suit)} 에너지 집중`,
          description: this.getSuitDescription(suit),
          positions: cards.map(c => c.position.position)
        });
      }
    }

    return patterns;
  }

  // 수트별 그룹화
  protected groupBySuit(): Record<string, DrawnCard[]> {
    const groups: Record<string, DrawnCard[]> = {};
    this.cards.forEach(card => {
      if (card.suit) {
        if (!groups[card.suit]) groups[card.suit] = [];
        groups[card.suit].push(card);
      }
    });
    return groups;
  }

  // 수트 이름 한글화
  protected getSuitName(suit: string): string {
    const suitNames: Record<string, string> = {
      'wands': '지팡이',
      'cups': '컵',
      'swords': '검',
      'pentacles': '펜타클'
    };
    return suitNames[suit] || suit;
  }

  // 수트 설명
  protected getSuitDescription(suit: string): string {
    if (this.topic === 'love') {
      const loveDescriptions: Record<string, string> = {
        'wands': '열정적이고 로맨틱한 사랑의 에너지가 강하게 작용하고 있습니다.',
        'cups': '깊은 감정과 정서적 교감이 중요한 시기입니다.',
        'swords': '소통과 이해를 통해 관계가 발전할 수 있습니다.',
        'pentacles': '안정적이고 현실적인 사랑을 추구하는 시기입니다.'
      };
      return loveDescriptions[suit] || '';
    } else if (this.topic === 'career') {
      const careerDescriptions: Record<string, string> = {
        'wands': '창의적이고 도전적인 프로젝트가 진행되고 있습니다.',
        'cups': '팀워크와 협업이 중요한 시기입니다.',
        'swords': '전략적 사고와 명확한 의사결정이 필요합니다.',
        'pentacles': '실질적인 성과와 재정적 안정을 추구합니다.'
      };
      return careerDescriptions[suit] || '';
    }
    
    const descriptions: Record<string, string> = {
      'wands': '열정과 창조적 에너지가 강하게 작용하고 있습니다.',
      'cups': '감정과 관계의 영역에서 중요한 변화가 있습니다.',
      'swords': '사고와 의사소통, 결정의 영역에서 활발한 움직임이 있습니다.',
      'pentacles': '물질적, 현실적인 측면에서 구체적인 변화가 나타납니다.'
    };
    return descriptions[suit] || '';
  }

  // 카드 시너지 분석
  protected findSynergies(): Synergy[] {
    const synergies: Synergy[] = [];
    
    // 특별한 조합 찾기
    for (let i = 0; i < this.cards.length; i++) {
      for (let j = i + 1; j < this.cards.length; j++) {
        const synergy = this.checkSynergy(this.cards[i], this.cards[j]);
        if (synergy) {
          synergies.push({
            card1Name: this.getCardEnergy(this.cards[i]),
            card2Name: this.getCardEnergy(this.cards[j]),
            positions: [this.cards[i].position.position, this.cards[j].position.position],
            description: synergy
          });
        }
      }
    }

    return synergies;
  }

  // 두 카드 간의 시너지 체크
  protected checkSynergy(card1: DrawnCard, card2: DrawnCard): string | null {
    // 특별한 메이저 아르카나 조합
    if (card1.arcana === 'major' && card2.arcana === 'major') {
      // 연인과 악마
      if ((card1.number === 6 && card2.number === 15) || (card1.number === 15 && card2.number === 6)) {
        return '관계의 양면성을 보여줍니다. 순수한 사랑과 집착 사이의 균형이 필요합니다.';
      }
      // 태양과 달
      if ((card1.number === 19 && card2.number === 18) || (card1.number === 18 && card2.number === 19)) {
        return '의식과 무의식의 조화를 나타냅니다. 직관과 논리를 함께 사용하세요.';
      }
      // 죽음과 심판
      if ((card1.number === 13 && card2.number === 20) || (card1.number === 20 && card2.number === 13)) {
        return '완전한 변화와 새로운 시작을 암시합니다. 과거를 정리하고 미래로 나아가세요.';
      }
    }

    // 같은 숫자의 마이너 카드
    if (card1.arcana === 'minor' && card2.arcana === 'minor' && card1.number === card2.number) {
      return `${card1.number}번의 에너지가 강조됩니다. 이 숫자의 의미를 깊이 고민해보세요.`;
    }

    return null;
  }

  // 주제별 메시지 생성
  protected generateTopicMessage(): string {
    // 하위 클래스에서 구현
    return '';
  }

  // 전체 해석 생성
  async generateInterpretation(): Promise<EnhancedInterpretation> {
    const patterns = this.analyzePatterns();
    const synergies = this.findSynergies();
    const overallMessage = this.generateTopicMessage();
    const actionSuggestions = await this.generateActionSuggestions();
    const positionMeanings = await this.generatePositionMeanings();

    return {
      overallMessage,
      combinationPatterns: patterns,
      synergies,
      actionSuggestions,
      positionMeanings
    };
  }

  // 행동 제안 생성 (하위 클래스에서 구현)
  protected async generateActionSuggestions(): Promise<string[]> {
    return [];
  }

  // 위치별 의미 생성 (하위 클래스에서 구현)
  protected async generatePositionMeanings(): Promise<Array<{
    position: string;
    meaning: string;
    card_name: string;
  }>> {
    return [];
  }
}
