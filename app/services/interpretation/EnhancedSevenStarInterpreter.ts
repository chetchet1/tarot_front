import { supabase } from '@/config/supabase';
import { BaseEnhancedInterpreter } from './BaseEnhancedInterpreter.js';
import { DrawnCard, SpreadPosition } from '../../models/tarot';

interface Pattern {
  pattern_name: string;
  description: string;
  positions: number[];
  topicMeaning?: string;
}

export class EnhancedSevenStarInterpreter extends BaseEnhancedInterpreter {
  private positions: SpreadPosition[];

  constructor(topic: string, cards: DrawnCard[]) {
    super(topic, cards);
    this.positions = cards.map(c => c.position);
  }

  // 세븐스타 특화 패턴 분석
  analyzePatterns(): Pattern[] {
    const basePatterns = super.analyzePatterns();
    const sevenStarPatterns: Pattern[] = [];

    // 중앙 카드와 주변 카드의 관계 분석
    const centerCard = this.cards.find(c => c.position.position === 7);
    if (centerCard) {
      const surroundingCards = this.cards.filter(c => c.position.position !== 7);
      
      // 중앙이 메이저 아르카나인 경우
      if (centerCard.arcana === 'major') {
        sevenStarPatterns.push({
          pattern_name: '강력한 중심 에너지',
          description: `${centerCard.nameKr} 카드가 중심에서 전체 상황을 주도하고 있습니다.`,
          positions: [7],
          topicMeaning: this.getCenterCardMeaning(centerCard)
        });
      }

      // 대칭 위치 분석 (1-4, 2-5, 3-6)
      const symmetryPairs: [number, number][] = [[1, 4], [2, 5], [3, 6]];
      for (const [pos1, pos2] of symmetryPairs) {
        const card1 = this.cards.find(c => c.position.position === pos1);
        const card2 = this.cards.find(c => c.position.position === pos2);
        
        if (card1 && card2 && card1.suit === card2.suit) {
          sevenStarPatterns.push({
            pattern_name: '대칭의 조화',
            description: `${pos1}번과 ${pos2}번 위치의 ${this.getSuitName(card1.suit)} 에너지가 균형을 이룹니다.`,
            positions: [pos1, pos2],
            topicMeaning: '대립되는 요소들이 조화를 이루고 있습니다.'
          });
        }
      }
    }

    return [...basePatterns, ...sevenStarPatterns];
  }

  // 중앙 카드의 주제별 의미
  private getCenterCardMeaning(card: DrawnCard): string {
    const meanings: Record<string, string> = {
      love: '관계의 핵심 에너지와 방향성을 나타냅니다.',
      career: '업무의 중심 과제와 목표를 보여줍니다.',
      general: '현재 상황의 핵심 본질을 드러냅니다.'
    };
    return meanings[this.topic] || meanings.general;
  }

  // 주제별 전체 메시지 생성
  generateTopicMessage(): string {
    const majorCount = this.cards.filter(c => c.arcana === 'major').length;
    const centerCard = this.cards.find(c => c.position.position === 7);
    
    let message = '';
    
    switch (this.topic) {
      case 'love':
        message = this.generateLoveMessage(majorCount, centerCard);
        break;
      case 'career':
        message = this.generateCareerMessage(majorCount, centerCard);
        break;
      default:
        message = this.generateGeneralMessage(majorCount, centerCard);
    }
    
    return message;
  }

  private generateLoveMessage(majorCount: number, centerCard: DrawnCard | undefined): string {
    let message = '사랑의 별자리가 펼쳐졌습니다. ';
    
    if (majorCount >= 4) {
      message += '운명적인 만남이나 관계의 중대한 전환점에 있습니다. ';
    }
    
    if (centerCard) {
      message += `${centerCard.nameKr} 카드가 중심에서 관계의 본질을 보여주고 있습니다. `;
      
      if (centerCard.arcana === 'major') {
        message += '이는 매우 중요한 영적 메시지를 담고 있습니다. ';
      }
    }
    
    // 주변 카드 분석
    const emotionalCards = this.cards.filter(c => c.suit === 'cups').length;
    if (emotionalCards >= 3) {
      message += '감정의 흐름이 매우 강하게 나타나고 있어, 직관을 믿고 따르는 것이 중요합니다.';
    }
    
    return message;
  }

  private generateCareerMessage(majorCount: number, centerCard: DrawnCard | undefined): string {
    let message = '경력의 별자리가 당신의 길을 비추고 있습니다. ';
    
    if (majorCount >= 4) {
      message += '커리어의 중요한 전환점이나 큰 기회가 다가오고 있습니다. ';
    }
    
    if (centerCard) {
      message += `${centerCard.nameKr} 카드가 현재 업무의 핵심 과제를 나타냅니다. `;
    }
    
    const pentacleCards = this.cards.filter(c => c.suit === 'pentacles').length;
    if (pentacleCards >= 3) {
      message += '물질적 성공과 안정을 위한 좋은 시기입니다.';
    }
    
    return message;
  }

  private generateGeneralMessage(majorCount: number, centerCard: DrawnCard | undefined): string {
    let message = '우주의 별들이 당신의 길을 안내하고 있습니다. ';
    
    if (centerCard) {
      message += `중심의 ${centerCard.nameKr} 카드는 현재 당신 삶의 핵심 테마를 보여줍니다. `;
    }
    
    message += '각 별의 위치는 삶의 다양한 측면을 비추고 있으며, 전체적인 조화를 이루고 있습니다.';
    
    return message;
  }

  // 위치별 의미 생성
  async generatePositionMeanings(): Promise<Array<{
    position: number;
    positionName: string;
    cardName: string;
    meaning: string;
  }>> {
    const meanings = [];
    
    for (const card of this.cards) {
      const positionName = this.getPositionName(card.position.position);
      const meaning = await this.getPositionMeaning(card, positionName);
      
      meanings.push({
        position: card.position.position,
        positionName,
        cardName: card.nameKr,
        meaning
      });
    }
    
    return meanings;
  }

  private getPositionName(position: number): string {
    const names: Record<number, string> = {
      1: '과거의 영향',
      2: '현재의 도전',
      3: '숨겨진 영향',
      4: '의식적 목표',
      5: '외부 환경',
      6: '내적 자원',
      7: '핵심 메시지'
    };
    return names[position] || `${position}번 위치`;
  }

  private async getPositionMeaning(card: DrawnCard, positionName: string): Promise<string> {
    // 주제별 위치 해석
    const topicMeanings: Record<string, Record<number, string>> = {
      love: {
        1: '과거의 연애 패턴과 경험',
        2: '현재 관계에서의 도전 과제',
        3: '무의식적인 감정과 욕구',
        4: '관계에서 원하는 것',
        5: '파트너나 주변의 영향',
        6: '사랑을 위한 내적 능력',
        7: '관계의 핵심 메시지'
      },
      career: {
        1: '과거의 경력과 경험',
        2: '현재 직면한 업무 과제',
        3: '숨겨진 재능과 가능성',
        4: '커리어 목표와 야망',
        5: '직장 환경과 동료',
        6: '업무 수행 능력',
        7: '경력의 핵심 방향'
      },
      general: {
        1: '과거의 영향과 토대',
        2: '현재의 도전과 기회',
        3: '무의식과 숨겨진 요소',
        4: '의식적 목표와 열망',
        5: '외부 환경과 타인',
        6: '내적 힘과 자원',
        7: '전체 상황의 핵심'
      }
    };
    
    const positionContext = topicMeanings[this.topic]?.[card.position.position] || positionName;
    
    return `${positionContext}를 나타내는 ${card.nameKr} 카드는 ${this.getCardInterpretation(card, card.position.position)}`;
  }

  private getCardInterpretation(card: DrawnCard, position: number): string {
    // 카드의 기본 의미와 위치를 고려한 해석
    if (card.arcana === 'major') {
      return this.getMajorCardInterpretation(card, position);
    } else {
      return this.getMinorCardInterpretation(card, position);
    }
  }

  private getMajorCardInterpretation(card: DrawnCard, position: number): string {
    // 주제별 메이저 카드 해석
    if (this.topic === 'love') {
      return this.getLoveMajorInterpretation(card);
    } else if (this.topic === 'career') {
      return this.getCareerMajorInterpretation(card);
    } else {
      return this.getGeneralMajorInterpretation(card);
    }
  }

  private getLoveMajorInterpretation(card: DrawnCard): string {
    const loveInterpretations: Record<number, string> = {
      0: '새로운 사랑의 시작이나 순수한 감정의 가능성을 암시합니다.',
      1: '관계에서 자신의 매력과 능력을 발휘할 때입니다.',
      2: '사랑에 대한 직관과 내면의 지혜를 신뢰하세요.',
      3: '풍요로운 사랑과 모성애를 나타냅니다.',
      4: '안정적이고 헌신적인 관계를 의미합니다.',
      5: '영적인 연결과 이해를 보여줍니다.',
      6: '사랑의 선택과 관계의 중요성을 나타냅니다.',
      7: '관계에서의 주도권과 승리를 의미합니다.',
      8: '감정을 다스리는 힘과 용기를 보여줍니다.',
      9: '내면의 성찰과 혼자만의 시간이 필요함을 알립니다.',
      10: '연애 운의 변화와 운명적 만남을 암시합니다.',
      11: '관계에서의 균형과 공정함을 의미합니다.',
      12: '사랑을 위한 희생과 기다림을 나타냅니다.',
      13: '관계의 끝과 새로운 시작을 의미합니다.',
      14: '감정의 조화와 균형을 나타냅니다.',
      15: '욕망과 집착에 대한 경고를 전합니다.',
      16: '갑작스러운 감정의 폭발이나 갈등을 예고합니다.',
      17: '사랑에 대한 희망과 영감을 전합니다.',
      18: '감정의 혼란과 환상을 경계하세요.',
      19: '사랑의 성공과 행복한 관계를 약속합니다.',
      20: '관계의 큰 전환점과 각성을 의미합니다.',
      21: '사랑의 완성과 새로운 차원을 나타냅니다.'
    };
    return loveInterpretations[card.number] || '사랑에 대한 중요한 메시지를 담고 있습니다.';
  }

  private getCareerMajorInterpretation(card: DrawnCard): string {
    const careerInterpretations: Record<number, string> = {
      0: '새로운 커리어의 시작이나 도전을 의미합니다.',
      1: '업무 능력과 기술을 활용할 때입니다.',
      2: '직관을 통한 현명한 판단이 필요합니다.',
      3: '풍요로운 성과와 창의성을 보여줍니다.',
      4: '리더십과 권위를 확립할 때입니다.',
      5: '멘토나 상사의 지도가 도움이 됩니다.',
      6: '커리어 선택의 중요한 시점입니다.',
      7: '경쟁에서의 승리와 목표 달성을 의미합니다.',
      8: '어려움을 극복하는 힘과 의지를 보여줍니다.',
      9: '전문성 강화와 독립적 업무가 중요합니다.',
      10: '커리어의 전환점과 새로운 기회를 암시합니다.',
      11: '공정한 대우와 업무 균형을 의미합니다.',
      12: '인내와 희생을 통한 성장을 나타냅니다.',
      13: '경력의 큰 변화와 전환을 의미합니다.',
      14: '업무 균형과 팀워크를 나타냅니다.',
      15: '과도한 업무나 부정적 환경에 대한 경고입니다.',
      16: '갑작스러운 변화나 위기를 예고합니다.',
      17: '커리어 목표에 대한 희망과 비전을 전합니다.',
      18: '불확실성과 혼란을 주의하세요.',
      19: '커리어 성공과 인정을 약속합니다.',
      20: '중요한 평가나 승진을 의미합니다.',
      21: '커리어 목표의 달성과 완성을 나타냅니다.'
    };
    return careerInterpretations[card.number] || '커리어에 대한 중요한 메시지를 담고 있습니다.';
  }

  private getGeneralMajorInterpretation(card: DrawnCard): string {
    const generalInterpretations: Record<number, string> = {
      0: '새로운 시작과 순수한 가능성을 암시합니다.',
      1: '자신의 능력을 활용할 때입니다.',
      2: '직관과 내면의 지혜를 신뢰하세요.',
      6: '선택과 관계의 중요성을 나타냅니다.',
      10: '변화의 순환과 운명의 흐름을 보여줍니다.',
      13: '변화와 재생의 필요성을 알립니다.',
      17: '희망과 영감의 메시지를 전합니다.',
      19: '성공과 긍정적 에너지를 약속합니다.',
      21: '완성과 새로운 차원으로의 도약을 의미합니다.'
    };
    return generalInterpretations[card.number] || '중요한 영적 메시지를 담고 있습니다.';
  }

  private getMinorCardInterpretation(card: DrawnCard, position: number): string {
    // 주제별 마이너 카드 해석
    if (this.topic === 'love') {
      return this.getLoveMinorInterpretation(card);
    } else if (this.topic === 'career') {
      return this.getCareerMinorInterpretation(card);
    } else {
      return this.getGeneralMinorInterpretation(card);
    }
  }

  private getLoveMinorInterpretation(card: DrawnCard): string {
    const loveSuitMeanings: Record<string, string> = {
      wands: '열정적인 사랑과 로맨스의 에너지를',
      cups: '깊은 감정과 사랑의 흐름을',
      swords: '진실한 소통과 이해의 필요성을',
      pentacles: '안정적인 관계와 헌신을'
    };
    return `${loveSuitMeanings[card.suit] || '특별한 사랑의 에너지를'} 나타냅니다.`;
  }

  private getCareerMinorInterpretation(card: DrawnCard): string {
    const careerSuitMeanings: Record<string, string> = {
      wands: '업무 열정과 창의적 도전을',
      cups: '직장 내 인간관계와 만족감을',
      swords: '전략적 사고와 문제 해결을',
      pentacles: '실질적 성과와 재정적 안정을'
    };
    return `${careerSuitMeanings[card.suit] || '커리어의 특별한 에너지를'} 나타냅니다.`;
  }

  private getGeneralMinorInterpretation(card: DrawnCard): string {
    const suitMeanings: Record<string, string> = {
      wands: '열정과 창의성의 에너지를',
      cups: '감정과 직관의 흐름을',
      swords: '사고와 소통의 명확성을',
      pentacles: '현실적 성과와 안정을'
    };
    return `${suitMeanings[card.suit] || '특별한 에너지를'} 나타냅니다.`;
  }

  // 행동 제안 생성
  async generateActionSuggestions(): Promise<Array<{
    position: number;
    cardName: string;
    action: string;
    context: string;
  }>> {
    const suggestions = [];
    
    // 각 위치별 구체적 조언
    for (const card of this.cards) {
      const action = this.getActionForPosition(card);
      if (action) {
        suggestions.push({
          position: card.position.position,
          cardName: card.nameKr,
          action,
          context: this.getActionContext(card.position.position)
        });
      }
    }
    
    return suggestions;
  }

  private getActionForPosition(card: DrawnCard): string {
    const positionActions: Record<number, string> = {
      1: `과거의 ${card.nameKr} 에너지를 이해하고 받아들이세요.`,
      2: `현재의 ${card.nameKr} 도전을 정면으로 마주하세요.`,
      3: `숨겨진 ${card.nameKr} 측면을 의식적으로 탐구하세요.`,
      4: `${card.nameKr}의 목표를 명확히 설정하세요.`,
      5: `외부의 ${card.nameKr} 영향을 현명하게 활용하세요.`,
      6: `내면의 ${card.nameKr} 힘을 신뢰하고 발휘하세요.`,
      7: `${card.nameKr}의 핵심 메시지를 삶에 통합하세요.`
    };
    
    return positionActions[card.position.position] || '';
  }

  private getActionContext(position: number): string {
    const contexts: Record<number, string> = {
      1: '과거를 이해하면 현재가 명확해집니다.',
      2: '도전은 성장의 기회입니다.',
      3: '무의식의 지혜를 활용하세요.',
      4: '명확한 목표가 성공의 열쇠입니다.',
      5: '환경과 조화를 이루세요.',
      6: '내면의 힘이 가장 강력합니다.',
      7: '핵심을 놓치지 마세요.'
    };
    
    return contexts[position] || '';
  }
}
