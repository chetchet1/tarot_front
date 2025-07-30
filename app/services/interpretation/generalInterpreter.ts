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

export class GeneralInterpreter {
  // 기본 해석 템플릿
  private templates = {
    single: {
      upright: '${cardName}이(가) 나타났습니다. ${meaning} 이 카드는 ${keyword1}와 ${keyword2}를 상징합니다.',
      reversed: '${cardName} 역방향이 나타났습니다. ${meaning} ${keyword1}에 주의가 필요한 시기입니다.'
    },
    
    threeCard: {
      past: '과거에는 ${cardName}의 영향으로 ${keyword}의 시기를 보냈습니다. ${meaning}',
      present: '현재 ${cardName}이(가) 보여주듯이 ${keyword}의 상황에 있습니다. ${meaning}',
      future: '미래에는 ${cardName}처럼 ${keyword}이(가) 나타날 것입니다. ${meaning}'
    }
  };

  async interpretSingleCard(card: CardInfo, topic: string = 'general'): Promise<string> {
    const template = card.orientation === 'upright' 
      ? this.templates.single.upright 
      : this.templates.single.reversed;

    const meaning = card.meanings[topic]?.[card.orientation] || 
                   card.meanings.general[card.orientation];
    const keywords = card.keywords[card.orientation] || [];

    return this.fillTemplate(template, {
      cardName: card.nameKr,
      meaning: meaning,
      keyword1: keywords[0] || '',
      keyword2: keywords[1] || keywords[0] || ''
    });
  }

  async interpretThreeCards(
    cards: CardInfo[], 
    spreadType: string = 'past_present_future',
    topic: string = 'general'
  ): Promise<string[]> {
    const interpretations: string[] = [];
    const positions = ['past', 'present', 'future'];

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const position = positions[i];
      const template = this.templates.threeCard[position];

      const meaning = card.meanings[topic]?.[card.orientation] || 
                     card.meanings.general[card.orientation];
      const keywords = card.keywords[card.orientation] || [];

      const interpretation = this.fillTemplate(template, {
        cardName: card.nameKr,
        meaning: meaning,
        keyword: keywords[0] || ''
      });

      interpretations.push(interpretation);
    }

    // 전체 요약 추가
    const summary = this.generateThreeCardSummary(cards, topic);
    interpretations.push(summary);

    return interpretations;
  }

  private generateThreeCardSummary(cards: CardInfo[], topic: string): string {
    const [past, present, future] = cards;
    
    // 긍정적 흐름
    if (past.orientation === 'reversed' && 
        present.orientation === 'upright' && 
        future.orientation === 'upright') {
      return '어려운 과거를 극복하고 현재는 안정을 찾았으며, 미래는 더욱 밝아질 것입니다. 지금의 긍정적인 에너지를 유지하세요.';
    }

    // 도전 중
    if (present.orientation === 'reversed') {
      return '현재 도전적인 시기를 겪고 있지만, 이는 성장을 위한 과정입니다. 인내심을 갖고 상황을 헤쳐나가세요.';
    }

    // 주의 필요
    if (future.orientation === 'reversed') {
      return '미래에 예상치 못한 변화가 있을 수 있습니다. 현재부터 준비하고 유연하게 대처할 준비를 하세요.';
    }

    // 일반적인 긍정
    return '과거의 경험이 현재의 지혜가 되고, 현재의 노력이 미래의 성공으로 이어질 것입니다.';
  }

  async generateDailyMessage(card: CardInfo): Promise<string> {
    const orientation = card.orientation === 'upright' ? '정방향' : '역방향';
    const keywords = card.keywords[card.orientation] || [];
    const generalMeaning = card.meanings.general[card.orientation];

    const messages = {
      upright: [
        `오늘은 ${card.nameKr}의 에너지가 함께합니다. ${keywords[0]}의 날이 될 것입니다.`,
        `${card.nameKr}이(가) 전하는 메시지: ${generalMeaning}`,
        `오늘의 키워드는 '${keywords[0]}'입니다. 이를 마음에 새기고 하루를 시작하세요.`
      ],
      reversed: [
        `${card.nameKr} ${orientation}이 암시하듯, 오늘은 ${keywords[0]}에 주의가 필요합니다.`,
        `도전이 있을 수 있지만 이는 성장의 기회입니다. ${generalMeaning}`,
        `'${keywords[0]}'를 극복하는 것이 오늘의 과제입니다.`
      ]
    };

    const selectedMessages = messages[card.orientation];
    return selectedMessages.join('\n\n');
  }

  // 카드 조합 분석
  async analyzeCardCombination(card1: CardInfo, card2: CardInfo): Promise<string> {
    // DB에서 조합 확인
    const { data: combination } = await supabase
      .from('card_combinations')
      .select('interpretation')
      .or(`and(card1_id.eq.${card1.id},card2_id.eq.${card2.id}),and(card1_id.eq.${card2.id},card2_id.eq.${card1.id})`)
      .single();

    if (combination) {
      return combination.interpretation;
    }

    // 동적 분석
    return this.generateCombinationInterpretation(card1, card2);
  }

  private generateCombinationInterpretation(card1: CardInfo, card2: CardInfo): string {
    // 메이저 + 메이저
    if (card1.arcana === 'major' && card2.arcana === 'major') {
      return `${card1.nameKr}와 ${card2.nameKr}의 만남은 인생의 중요한 전환점을 암시합니다. 두 카드의 메시지에 깊이 귀 기울이세요.`;
    }

    // 같은 슈트
    if (card1.suit && card1.suit === card2.suit) {
      const suitMeanings = {
        'wands': '열정과 창의성',
        'cups': '감정과 관계',
        'swords': '사고와 소통',
        'pentacles': '물질과 안정'
      };
      const meaning = suitMeanings[card1.suit] || '에너지';
      return `두 카드 모두 ${meaning}에 관련되어 있어, 이 영역에 특별한 주의가 필요합니다.`;
    }

    // 정방향 + 역방향
    if (card1.orientation !== card2.orientation) {
      return `${card1.nameKr}와 ${card2.nameKr}가 서로 다른 방향을 가리키고 있습니다. 균형을 찾는 것이 중요합니다.`;
    }

    return `${card1.nameKr}와 ${card2.nameKr}가 함께 나타나 복합적인 메시지를 전달합니다.`;
  }

  // 주제별 조언 생성
  generateTopicAdvice(cards: CardInfo[], topic: string): string {
    const topicAdvice = {
      love: this.generateLoveAdvice(cards),
      career: this.generateCareerAdvice(cards),
      money: this.generateMoneyAdvice(cards),
      health: this.generateHealthAdvice(cards),
      general: this.generateGeneralAdvice(cards)
    };

    return topicAdvice[topic] || topicAdvice.general;
  }

  private generateLoveAdvice(cards: CardInfo[]): string {
    const hasLovers = cards.some(c => c.id === 6); // The Lovers
    const hasCups = cards.filter(c => c.suit === 'cups').length;

    if (hasLovers) {
      return '사랑의 카드가 나타났습니다. 관계에서 중요한 선택이나 발전이 있을 것입니다.';
    }

    if (hasCups >= 2) {
      return '감정적인 교류가 활발한 시기입니다. 마음을 열고 소통하세요.';
    }

    const reversedCount = cards.filter(c => c.orientation === 'reversed').length;
    if (reversedCount > cards.length / 2) {
      return '관계에서 어려움이 있을 수 있지만, 이는 더 깊은 이해로 가는 과정입니다.';
    }

    return '사랑은 인내와 이해를 필요로 합니다. 상대방의 입장에서 생각해보세요.';
  }

  private generateCareerAdvice(cards: CardInfo[]): string {
    const hasPentacles = cards.filter(c => c.suit === 'pentacles').length;
    const hasWands = cards.filter(c => c.suit === 'wands').length;

    if (hasPentacles >= 2) {
      return '실질적인 성과와 안정성에 집중하세요. 꾸준한 노력이 결실을 맺을 것입니다.';
    }

    if (hasWands >= 2) {
      return '창의성과 열정이 성공의 열쇠입니다. 새로운 아이디어를 두려워하지 마세요.';
    }

    const majorCount = cards.filter(c => c.arcana === 'major').length;
    if (majorCount >= Math.ceil(cards.length / 2)) {
      return '커리어에 중요한 전환점이 다가오고 있습니다. 큰 그림을 보고 결정하세요.';
    }

    return '현재 하고 있는 일에 집중하면서도 새로운 기회에 열려있으세요.';
  }

  private generateMoneyAdvice(cards: CardInfo[]): string {
    const hasPentacles = cards.filter(c => c.suit === 'pentacles').length;
    const reversedPentacles = cards.filter(c => 
      c.suit === 'pentacles' && c.orientation === 'reversed'
    ).length;

    if (reversedPentacles > 0) {
      return '재정 관리에 주의가 필요합니다. 불필요한 지출을 줄이고 저축을 늘리세요.';
    }

    if (hasPentacles >= 2) {
      return '재정적 안정과 성장의 기회가 있습니다. 현명한 투자와 관리가 중요합니다.';
    }

    return '돈은 에너지의 한 형태입니다. 긍정적인 마음가짐이 풍요를 끌어당깁니다.';
  }

  private generateHealthAdvice(cards: CardInfo[]): string {
    const hasSwords = cards.filter(c => c.suit === 'swords').length;
    const reversedCount = cards.filter(c => c.orientation === 'reversed').length;

    if (hasSwords >= 2) {
      return '정신적 스트레스에 주의하세요. 명상이나 휴식을 통해 마음을 안정시키세요.';
    }

    if (reversedCount > cards.length / 2) {
      return '에너지 균형이 깨져있을 수 있습니다. 충분한 휴식과 영양 섭취가 필요합니다.';
    }

    return '몸과 마음의 조화가 건강의 기본입니다. 규칙적인 생활습관을 유지하세요.';
  }

  private generateGeneralAdvice(cards: CardInfo[]): string {
    const elements = cards.map(c => c.element).filter(Boolean);
    const uniqueElements = new Set(elements);

    if (uniqueElements.size === 1) {
      return `${elements[0]}의 에너지가 강하게 나타나고 있습니다. 이를 잘 활용하되 균형도 잊지 마세요.`;
    }

    if (uniqueElements.size === 4) {
      return '모든 원소가 조화롭게 나타나고 있습니다. 균형잡힌 접근이 성공으로 이끌 것입니다.';
    }

    return '현재 상황을 다각도로 바라보고, 직관과 이성을 함께 사용하여 결정하세요.';
  }

  private fillTemplate(template: string, values: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(values)) {
      result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
    }
    return result;
  }
}
