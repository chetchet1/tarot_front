import { supabase } from '@/config/supabase';

interface InterpretationResult {
  overallMessage: string;
  patterns: PatternResult[];
  suggestions: ActionSuggestion[];
  synergies: SynergyResult[];
  specialMessage?: string;
}

interface PatternResult {
  type: string;
  name: string;
  description: string;
  cards: string[];
}

interface ActionSuggestion {
  action: string;
  context: string;
}

interface SynergyResult {
  type: string;
  card1: string;
  card2: string;
  description: string;
}

interface CardData {
  card: any;
  orientation: 'upright' | 'reversed';
  position: number;
}

export class EnhancedCelticCrossInterpreter {
  private topic: string;
  private cards: CardData[];
  private topicPositionMeanings: any[] = [];
  private combinationPatterns: any[] = [];
  private actionSuggestions: any[] = [];
  private messageTemplates: any[] = [];
  private cardSynergies: any[] = [];

  constructor(topic: string, cards: CardData[]) {
    this.topic = topic;
    this.cards = cards;
  }

  async loadData(): Promise<void> {
    try {
      // 주제별 위치 의미 로드
      const { data: positionData, error: positionError } = await supabase
        .from('topic_position_meanings')
        .select('*')
        .eq('topic', this.topic);
      
      if (!positionError && positionData) {
        this.topicPositionMeanings = positionData;
      }

      // 조합 패턴 로드
      const { data: patternData, error: patternError } = await supabase
        .from('combination_patterns')
        .select('*');
      
      if (!patternError && patternData) {
        this.combinationPatterns = patternData;
      }

      // 행동 제안 로드
      const { data: suggestionData, error: suggestionError } = await supabase
        .from('action_suggestions')
        .select('*')
        .eq('topic', this.topic);
      
      if (!suggestionError && suggestionData) {
        this.actionSuggestions = suggestionData;
      }

      // 메시지 템플릿 로드
      const { data: templateData, error: templateError } = await supabase
        .from('message_templates')
        .select('*')
        .eq('topic', this.topic);
      
      if (!templateError && templateData) {
        this.messageTemplates = templateData;
      }

      // 카드 시너지 로드
      const { data: synergyData, error: synergyError } = await supabase
        .from('card_synergies')
        .select('*');
      
      if (!synergyError && synergyData) {
        this.cardSynergies = synergyData;
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    }
  }

  async interpret(): Promise<InterpretationResult> {
    await this.loadData();

    const patterns = this.findPatterns();
    const suggestions = this.generateSuggestions();
    const synergies = this.findSynergies();
    const overallMessage = this.generateOverallMessage(patterns, synergies);
    const specialMessage = this.generateSpecialMessage();

    return {
      overallMessage,
      patterns,
      suggestions,
      synergies,
      specialMessage
    };
  }

  private findPatterns(): PatternResult[] {
    const results: PatternResult[] = [];

    for (const pattern of this.combinationPatterns) {
      if (this.checkPatternMatch(pattern)) {
        results.push({
          type: pattern.pattern_type,
          name: pattern.pattern_name,
          description: this.personalizeDescription(pattern.description),
          cards: this.getPatternCards(pattern)
        });
      }
    }

    return results;
  }

  private checkPatternMatch(pattern: any): boolean {
    // 포지션 기반 패턴 매칭
    if (pattern.positions && pattern.positions.length > 0) {
      const positions = JSON.parse(pattern.positions);
      
      // 자아인식갭 패턴: 7번과 8번 카드 비교
      if (pattern.pattern_type === 'self_perception_gap') {
        const card7 = this.cards[6];
        const card8 = this.cards[7];
        if (!card7 || !card8) return false;
        
        // 메이저/마이너 차이 또는 정/역 차이가 있을 때
        return (card7.card.arcana !== card8.card.arcana) || 
               (card7.orientation !== card8.orientation);
      }
      
      // 관계발전흐름 패턴: 4번, 1번, 6번 카드 확인
      if (pattern.pattern_type === 'relationship_flow') {
        const card4 = this.cards[3];
        const card1 = this.cards[0];
        const card6 = this.cards[5];
        if (!card4 || !card1 || !card6) return false;
        
        // 특정 카드나 패턴이 있을 때 (예: 연인 카드)
        return this.checkRelationshipCards([card4, card1, card6]);
      }
    }

    // 카드 타입 기반 패턴 매칭
    if (pattern.card_criteria) {
      const criteria = JSON.parse(pattern.card_criteria);
      return this.checkCardCriteria(criteria);
    }

    return false;
  }

  private checkRelationshipCards(cards: CardData[]): boolean {
    const relationshipCards = ['The Lovers', 'Two of Cups', 'Queen of Cups', 'Knight of Cups'];
    return cards.some(c => relationshipCards.includes(c.card.name));
  }

  private checkCardCriteria(criteria: any): boolean {
    // 메이저 카드 개수 확인
    if (criteria.majorCount) {
      const majorCount = this.cards.filter(c => c && c.card.arcana === 'major').length;
      if (criteria.majorCount.min && majorCount < criteria.majorCount.min) return false;
      if (criteria.majorCount.max && majorCount > criteria.majorCount.max) return false;
    }

    // 특정 수트 카드 확인
    if (criteria.suit) {
      const suitCount = this.cards.filter(c => c && c.card.suit === criteria.suit).length;
      if (suitCount < (criteria.minCount || 1)) return false;
    }

    return true;
  }

  private personalizeDescription(description: string): string {
    // 주제별로 설명을 개인화
    const replacements: Record<string, Record<string, string>> = {
      love: {
        '상황': '연애 상황',
        '관계': '연인과의 관계',
        '미래': '연애의 미래'
      },
      career: {
        '상황': '업무 상황',
        '관계': '직장 내 관계',
        '미래': '커리어의 미래'
      },
      money: {
        '상황': '재정 상황',
        '관계': '금전적 관계',
        '미래': '재정적 미래'
      }
    };

    let personalizedDesc = description;
    const topicReplacements = replacements[this.topic] || {};
    
    for (const [key, value] of Object.entries(topicReplacements)) {
      personalizedDesc = personalizedDesc.replace(new RegExp(key, 'g'), value);
    }

    return personalizedDesc;
  }

  private getPatternCards(pattern: any): string[] {
    const positions = JSON.parse(pattern.positions || '[]');
    return positions
      .map((pos: number) => this.cards[pos - 1])
      .filter(Boolean)
      .map((c: CardData) => {
        const meaning = this.getCardMeaning(c);
        const energy = this.getCardEnergy(c);
        return `${meaning}`;
      });
  }

  private generateSuggestions(): ActionSuggestion[] {
    const suggestions: ActionSuggestion[] = [];
    const majorCards = this.cards.filter(c => c && c.card.arcana === 'major');

    // 메이저 카드별 제안 추가
    for (const cardData of majorCards) {
      const suggestion = this.actionSuggestions.find(
        s => s.card_number === cardData.card.number
      );
      
      if (suggestion) {
        suggestions.push({
          action: suggestion.action,
          context: this.contextualizeAction(suggestion.context, cardData.position)
        });
      }
    }

    // 최대 5개까지만 반환
    return suggestions.slice(0, 5);
  }

  private contextualizeAction(context: string, position: number): string {
    const positionContexts: Record<number, string> = {
      1: '현재 내면의 상태를 고려하여',
      2: '외부 환경의 영향을 받아',
      3: '근본적인 원인을 해결하기 위해',
      4: '과거의 경험을 바탕으로',
      5: '겉으로 드러나는 모습을 개선하여',
      6: '미래를 준비하며',
      7: '자아 인식을 개선하여',
      8: '타인과의 관계를 고려하여',
      9: '기대하는 결과를 위해',
      10: '최종 결과를 향해'
    };

    return `${positionContexts[position] || ''} ${context}`;
  }

  private findSynergies(): SynergyResult[] {
    const results: SynergyResult[] = [];

    for (let i = 0; i < this.cards.length; i++) {
      for (let j = i + 1; j < this.cards.length; j++) {
        const card1 = this.cards[i];
        const card2 = this.cards[j];
        
        if (!card1 || !card2) continue;

        const synergy = this.checkSynergy(card1, card2);
        if (synergy) {
          const card1Energy = this.getCardEnergy(card1);
          const card2Energy = this.getCardEnergy(card2);
          
          results.push({
            type: synergy.synergy_type,
            card1: card1Energy,
            card2: card2Energy,
            description: synergy.description
          });
        }
      }
    }

    return results.slice(0, 3); // 최대 3개까지
  }

  private checkSynergy(card1: CardData, card2: CardData): any {
    // 동일 수트 시너지
    if (card1.card.suit && card1.card.suit === card2.card.suit) {
      return this.cardSynergies.find(
        s => s.synergy_type === 'harmonious' && s.card_criteria?.includes('same_suit')
      );
    }

    // 메이저 카드 조합
    if (card1.card.arcana === 'major' && card2.card.arcana === 'major') {
      // 특정 메이저 카드 조합 확인
      const combo1 = `${card1.card.number}-${card2.card.number}`;
      const combo2 = `${card2.card.number}-${card1.card.number}`;
      
      return this.cardSynergies.find(
        s => s.card1_number === card1.card.number && s.card2_number === card2.card.number ||
             s.card1_number === card2.card.number && s.card2_number === card1.card.number
      );
    }

    // 정/역 대립
    if (card1.orientation !== card2.orientation) {
      return this.cardSynergies.find(
        s => s.synergy_type === 'challenging' && s.card_criteria?.includes('opposite_orientation')
      );
    }

    return null;
  }

  private generateOverallMessage(patterns: PatternResult[], synergies: SynergyResult[]): string {
    // 템플릿 선택
    let template = this.messageTemplates.find(t => t.template_type === 'opening' || t.template_type === 'analysis');
    
    if (!template || !template.template_text) {
      return this.generateDefaultMessage();
    }

    let message = template.template_text;

    // 주요 카드 정보로 치환
    const mainCard = this.cards[0];
    const challengeCard = this.cards[1];
    const outcomeCard = this.cards[9];
    const baseCard = this.cards[2];
    const pastCard = this.cards[3];
    const futureCard = this.cards[5];

    // 현재 상황 (메인 카드)
    if (mainCard) {
      // 카드명 대신 의미 사용
      const mainMeaning = this.getCardMeaning(mainCard);
      const mainEnergy = this.getCardEnergy(mainCard);
      
      message = message.replace('{{main_card}}', mainMeaning);
      message = message.replace('{{main_energy}}', mainEnergy);
      message = message.replace('{{main_description}}', 
        `현재 당신의 ${this.getTopicName()} 상황은 ${mainEnergy}의 에너지가 중심을 이루고 있습니다. ${mainMeaning}의 상태로`);
    }

    // 도전과제
    if (challengeCard) {
      const challengeMeaning = this.getCardMeaning(challengeCard);
      const challengeDescription = challengeCard.orientation === 'reversed' 
        ? `${challengeMeaning}의 어려움을 극복하는 것`
        : `${challengeMeaning}을 통해 성장하는 것`;
      
      message = message.replace('{{challenge}}', challengeDescription);
      message = message.replace('{{challenge_description}}', 
        `지금 당신이 직면한 과제는 ${challengeDescription}입니다`);
    }

    // 결과
    if (outcomeCard) {
      const outcomeMeaning = this.getCardMeaning(outcomeCard);
      const outcomeDescription = outcomeCard.orientation === 'upright'
        ? `${outcomeMeaning}으로 이어질 것`
        : `${outcomeMeaning}의 교훈을 통해 성장할 것`;
      
      message = message.replace('{{outcome}}', outcomeDescription);
      message = message.replace('{{outcome_description}}', 
        `최종적으로 ${outcomeDescription}으로 예상됩니다`);
    }

    // 기초 에너지
    if (baseCard) {
      const baseMeaning = this.getCardMeaning(baseCard);
      message = message.replace('{{base_energy}}', baseMeaning);
      message = message.replace('{{base_description}}', 
        `이 상황의 근본에는 ${baseMeaning}이 자리하고 있습니다`);
    }

    // 과거와 미래
    if (pastCard) {
      const pastMeaning = this.getCardMeaning(pastCard);
      message = message.replace('{{past_influence}}', pastMeaning);
    }
    
    if (futureCard) {
      const futureMeaning = this.getCardMeaning(futureCard);
      message = message.replace('{{future_direction}}', futureMeaning);
    }

    // 패턴 정보 추가
    if (patterns.length > 0) {
      const patternDescriptions = patterns.map(p => p.description).join(' 또한 ');
      message = message.replace('{{patterns}}', patternDescriptions);
      message = message.replace('{{pattern_count}}', patterns.length.toString());
    }
    
    // 시너지 정보 추가
    if (synergies.length > 0) {
      const synergyDescriptions = synergies.map(s => s.description).join(' ');
      message = message.replace('{{synergies}}', synergyDescriptions);
    }

    // 남은 플레이스홀더 제거
    message = message.replace(/{{[^}]+}}/g, '');

    return message;
  }

  private generateDefaultMessage(): string {
    const mainCard = this.cards[0];
    const challengeCard = this.cards[1];
    const baseCard = this.cards[2];
    const outcomeCard = this.cards[9];
    
    let message = `현재 당신의 ${this.getTopicName()} 상황을 종합해보면, `;
    
    // 현재 상황
    if (mainCard) {
      const mainMeaning = this.getCardMeaning(mainCard);
      const mainEnergy = this.getCardEnergy(mainCard);
      message += `${mainEnergy}의 에너지가 중심을 이루고 있습니다. ${mainMeaning}의 상태로 현실을 마주하고 있으며, `;
    }
    
    // 도전과제
    if (challengeCard) {
      const challengeMeaning = this.getCardMeaning(challengeCard);
      const isReversed = challengeCard.orientation === 'reversed';
      message += isReversed 
        ? `${challengeMeaning}의 어려움을 극복해야 하는 시기입니다. `
        : `${challengeMeaning}을 통해 성장할 수 있는 기회가 주어져 있습니다. `;
    }
    
    // 근본 에너지
    if (baseCard) {
      const baseMeaning = this.getCardMeaning(baseCard);
      message += `이 모든 상황의 밑바탕에는 ${baseMeaning}이 자리하고 있으며, `;
    }
    
    // 결과 예측
    if (outcomeCard) {
      const outcomeMeaning = this.getCardMeaning(outcomeCard);
      const isPositive = this.isPositiveCard(outcomeCard);
      
      if (isPositive) {
        message += `최종적으로 ${outcomeMeaning}의 긍정적인 결과로 이어질 가능성이 높습니다.`;
      } else {
        message += `${outcomeMeaning}의 교훈을 통해 중요한 깨달음을 얻게 될 것입니다.`;
      }
    }
    
    // 전체적인 에너지 평가
    const majorCount = this.cards.filter(c => c && c.card.arcana === 'major').length;
    if (majorCount >= 5) {
      message += ` 이번 상황은 당신의 삶에서 매우 중요한 전환점이 될 것입니다.`;
    }
    
    return message;
  }

  private generateSpecialMessage(): string | undefined {
    const template = this.messageTemplates.find(t => t.template_type === 'closing' || t.template_type === 'advice');
    
    if (!template) return undefined;

    let message = template.template_text;

    // 핵심 카드들의 에너지 분석
    const coreCards = [this.cards[0], this.cards[1], this.cards[5], this.cards[9]].filter(Boolean);
    const positiveCount = coreCards.filter(c => this.isPositiveCard(c)).length;
    const majorCount = coreCards.filter(c => c.card.arcana === 'major').length;

    // 긍정/부정 에너지에 따른 메시지 조정
    if (positiveCount >= 3) {
      message = message.replace('{{energy_state}}', '매우 긍정적인 에너지가 흐르고 있어');
    } else if (positiveCount <= 1) {
      message = message.replace('{{energy_state}}', '도전적인 상황이지만 성장의 기회가 숨어 있어');
    } else {
      message = message.replace('{{energy_state}}', '균형잡힌 에너지 속에서');
    }

    // 메이저 카드 비중에 따른 조정
    if (majorCount >= 3) {
      message = message.replace('{{importance}}', '인생에서 중요한 전환점에 있으며');
    } else {
      message = message.replace('{{importance}}', '일상적인 변화 속에서');
    }

    return message;
  }

  // 헬퍼 메서드들
  private getCardEnergy(cardData: CardData): string {
    const majorEnergies: Record<string, string> = {
      'The Fool': '새로운 시작',
      'The Magician': '실현 능력',
      'The High Priestess': '직관과 지혜',
      'The Empress': '풍요와 창조',
      'The Emperor': '권위와 안정',
      'The Hierophant': '전통과 가르침',
      'The Lovers': '선택과 조화',
      'The Chariot': '의지와 전진',
      'Strength': '내면의 힘',
      'The Hermit': '성찰과 탐구',
      'Wheel of Fortune': '운명의 변화',
      'Justice': '균형과 공정',
      'The Hanged Man': '희생과 관점 전환',
      'Death': '변화와 재생',
      'Temperance': '조화와 절제',
      'The Devil': '속박과 욕망',
      'The Tower': '급격한 변화',
      'The Star': '희망과 영감',
      'The Moon': '환상과 불안',
      'The Sun': '성공과 활력',
      'Judgement': '각성과 심판',
      'The World': '완성과 성취'
    };

    // 마이너 카드의 경우 수트와 숫자에 따른 에너지
    let baseEnergy = majorEnergies[cardData.card.name];
    
    if (!baseEnergy && cardData.card.arcana === 'minor') {
      baseEnergy = this.getMinorCardEnergy(cardData.card);
    }
    
    if (!baseEnergy) {
      baseEnergy = this.getDefaultCardEnergy(cardData.card);
    }
    
    return cardData.orientation === 'reversed' ? `억압된 ${baseEnergy}` : baseEnergy;
  }
  
  private getMinorCardEnergy(card: any): string {
    const suitEnergies: Record<string, string> = {
      'wands': '열정과 창의성',
      'cups': '감정과 관계',
      'swords': '사고와 소통',
      'pentacles': '물질과 안정'
    };
    
    const numberEnergies: Record<number, string> = {
      1: '새로운 시작',
      2: '균형과 선택',
      3: '성장과 협력',
      4: '안정과 기반',
      5: '도전과 갈등',
      6: '조화와 성공',
      7: '인내와 성찰',
      8: '숙련과 발전',
      9: '성취와 만족',
      10: '완성과 새로운 시작'
    };
    
    const courtEnergies: Record<string, string> = {
      'page': '시작과 배움',
      'knight': '행동과 열정',
      'queen': '성숙과 보살핌',
      'king': '통솔과 완성'
    };
    
    if (card.rank) {
      return courtEnergies[card.rank.toLowerCase()] || '인물의 에너지';
    } else if (card.number) {
      return numberEnergies[card.number] || suitEnergies[card.suit] || '변화의 에너지';
    }
    
    return suitEnergies[card.suit] || '특별한 에너지';
  }
  
  private getDefaultCardEnergy(card: any): string {
    if (card.arcana === 'major') {
      return '중요한 전환점';
    }
    return '일상적 변화';
  }

  private getCardChallenge(cardData: CardData): string {
    const cardMeaning = this.getCardMeaning(cardData);
    const cardEnergy = this.getCardEnergy(cardData);
    
    if (cardData.orientation === 'reversed') {
      return `${cardMeaning}에서 오는 어려움을 극복하는 것`;
    }
    return `${cardEnergy}의 에너지를 받아들이고 ${cardMeaning}을 통해 성장하는 것`;
  }

  private getCardOutcome(cardData: CardData): string {
    const cardMeaning = this.getCardMeaning(cardData);
    const cardEnergy = this.getCardEnergy(cardData);
    
    if (cardData.orientation === 'reversed') {
      return `${cardMeaning}의 도전을 통해 얻는 깨달음과 성장`;
    }
    return `${cardEnergy}의 긍정적인 실현으로 ${cardMeaning}이 현실화되는 것`;
  }

  private getCardMeaning(cardData: CardData): string {
    // 마이너 카드의 경우 수트별 핵심 의미
    if (cardData.card.arcana === 'minor') {
      return this.getMinorCardMeaning(cardData);
    }
    
    // 메이저 카드의 경우 각 카드의 핵심 의미
    const majorMeanings: Record<string, { upright: string; reversed: string }> = {
      'The Fool': {
        upright: '새로운 여정을 시작하는 순수한 마음',
        reversed: '무모한 결정과 준비 부족'
      },
      'The Magician': {
        upright: '의지력과 기술로 목표를 실현하는 힘',
        reversed: '잘못된 방향성과 능력의 낭비'
      },
      'The High Priestess': {
        upright: '직관을 따르고 내면의 지혜를 신뢰하는 상태',
        reversed: '자신의 내면을 무시하고 혼란스러운 상태'
      },
      'The Empress': {
        upright: '풍요로운 창조력과 모성애',
        reversed: '창의성 차단과 자기 돌봄 부족'
      },
      'The Emperor': {
        upright: '안정적인 권위와 통제력',
        reversed: '권위주의와 경직된 사고'
      },
      'The Hierophant': {
        upright: '전통과 지혜를 따르는 성숙함',
        reversed: '전통에 얽매이고 유연성 부족'
      },
      'The Lovers': {
        upright: '사랑과 조화로운 선택',
        reversed: '불화와 잘못된 선택'
      },
      'The Chariot': {
        upright: '의지와 결단력으로 전진',
        reversed: '방향 상실과 통제력 부족'
      },
      'Strength': {
        upright: '내면의 힘과 용기',
        reversed: '자신감 부족과 내적 갈등'
      },
      'The Hermit': {
        upright: '내면의 지혜를 찾는 성찰',
        reversed: '고립과 외로움'
      },
      'Wheel of Fortune': {
        upright: '운명의 긍정적 전환',
        reversed: '불운과 정체'
      },
      'Justice': {
        upright: '공정한 판단과 균형',
        reversed: '불공정과 불균형'
      },
      'The Hanged Man': {
        upright: '새로운 관점과 희생',
        reversed: '희생을 거부하고 정체'
      },
      'Death': {
        upright: '변화와 새로운 시작',
        reversed: '변화를 거부하고 정체'
      },
      'Temperance': {
        upright: '조화와 절제의 지혜',
        reversed: '불균형과 과도함'
      },
      'The Devil': {
        upright: '속박과 집착의 인식',
        reversed: '속박에서 벗어나려는 노력'
      },
      'The Tower': {
        upright: '급격한 변화와 깨달음',
        reversed: '변화를 피하려는 시도'
      },
      'The Star': {
        upright: '희망과 영감이 빛나는 시기',
        reversed: '희망을 잃고 절망하는 상태'
      },
      'The Moon': {
        upright: '직관과 무의식의 메시지',
        reversed: '환상과 혼란'
      },
      'The Sun': {
        upright: '활력과 성공이 찾아오는 긍정적 시기',
        reversed: '자신감 부족과 행복의 지연'
      },
      'Judgement': {
        upright: '각성과 새로운 시작',
        reversed: '과거에 얽매임'
      },
      'The World': {
        upright: '완성과 성취의 기쁨',
        reversed: '미완성과 지연'
      }
    };
    
    const meaning = majorMeanings[cardData.card.name];
    if (meaning) {
      return cardData.orientation === 'upright' ? meaning.upright : meaning.reversed;
    }
    
    // 기본값
    return cardData.orientation === 'upright' ? '긍정적 변화' : '내면의 도전';
  }
  
  private getMinorCardMeaning(cardData: CardData): string {
    const { suit, number, rank } = cardData.card;
    const isReversed = cardData.orientation === 'reversed';
    
    // 코트 카드
    if (rank) {
      const rankMeanings: Record<string, string> = {
        'page': isReversed ? '미숙한 접근' : '새로운 시작',
        'knight': isReversed ? '감정적 충동' : '열정적 행동',
        'queen': isReversed ? '감정적 불균형' : '성숙한 보살핌',
        'king': isReversed ? '독단적 통제' : '실력과 리더십'
      };
      return rankMeanings[rank.toLowerCase()] || '인물의 에너지';
    }
    
    // 숫자 카드
    if (number) {
      const numberMeanings: Record<number, { upright: string; reversed: string }> = {
        1: { upright: '새로운 기회', reversed: '지연된 시작' },
        2: { upright: '균형과 협력', reversed: '불균형과 갈등' },
        3: { upright: '성장과 확장', reversed: '좌절과 지연' },
        4: { upright: '안정과 보호', reversed: '경직성과 제한' },
        5: { upright: '도전과 갈등', reversed: '해결과 회복' },
        6: { upright: '성공과 조화', reversed: '불균형과 자만' },
        7: { upright: '인내와 평가', reversed: '의심과 조급함' },
        8: { upright: '숙련과 향상', reversed: '지체와 좌절' },
        9: { upright: '성취와 만족', reversed: '미완성과 불만' },
        10: { upright: '완성과 새로운 시작', reversed: '종료와 부담' }
      };
      
      const meaning = numberMeanings[number];
      if (meaning) {
        return isReversed ? meaning.reversed : meaning.upright;
      }
    }
    
    return isReversed ? '억압된 에너지' : '흐르는 에너지';
  }

  private isPositiveCard(cardData: CardData): boolean {
    const positiveCards = [
      'The Sun', 'The Star', 'The World', 'The Empress', 
      'Ace of Cups', 'Ten of Cups', 'Nine of Cups',
      'Ace of Pentacles', 'Ten of Pentacles', 'Nine of Pentacles'
    ];
    
    if (cardData.orientation === 'reversed') {
      return false;
    }
    
    return positiveCards.includes(cardData.card.name) || 
           (cardData.card.number === 1 && cardData.card.arcana === 'minor');
  }

  private getTopicName(): string {
    const names: Record<string, string> = {
      love: '연애',
      career: '직업',
      money: '금전',
      general: '전반적인'
    };
    return names[this.topic] || '전반적인';
  }
}
