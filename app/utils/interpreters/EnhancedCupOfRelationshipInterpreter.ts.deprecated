import { supabase } from '@/config/supabase';
import { BaseEnhancedInterpreter } from '../../services/interpretation/BaseEnhancedInterpreter';
import { DrawnCard, SpreadPosition } from '../../models/tarot';
import { generateStructuredPrompt, validateAndRestructureResponse } from '../interpretationUtils';

interface Pattern {
  pattern_name: string;
  description: string;
  positions: number[];
  topicMeaning?: string;
}

interface Synergy {
  card1Name: string;
  card2Name: string;
  positions: number[];
  description: string;
}

export class EnhancedCupOfRelationshipInterpreter extends BaseEnhancedInterpreter {
  private positions: SpreadPosition[];

  constructor(topic: string, cards: DrawnCard[]) {
    super(topic, cards);
    this.positions = cards.map(c => c.position);
  }

  // 컵 오브 릴레이션십 특화 패턴 분석
  analyzePatterns(): Pattern[] {
    const basePatterns = super.analyzePatterns();
    const relationshipPatterns: Pattern[] = [];

    // 나와 상대방 카드 분석 (1, 2번 위치)
    const myCard = this.cards.find(c => c.position.position === 1);
    const partnerCard = this.cards.find(c => c.position.position === 2);
    
    if (myCard && partnerCard) {
      // 같은 수트인 경우
      if (myCard.suit && partnerCard.suit && myCard.suit === partnerCard.suit) {
        relationshipPatterns.push({
          pattern_name: '에너지의 공명',
          description: `두 사람이 ${this.getSuitName(myCard.suit)} 에너지를 공유하고 있습니다.`,
          positions: [1, 2],
          topicMeaning: this.getSuitHarmonyMeaning(myCard.suit)
        });
      }
      
      // 메이저 아르카나 조합
      if (myCard.arcana === 'major' && partnerCard.arcana === 'major') {
        relationshipPatterns.push({
          pattern_name: '운명적 만남',
          description: '두 사람 사이에 깊은 영적 연결이 있습니다.',
          positions: [1, 2],
          topicMeaning: '이 관계는 단순한 만남을 넘어 영혼의 성장을 위한 것입니다.'
        });
      }
    }

    // 과거-현재-미래 흐름 분석 (3, 4, 5번 위치)
    const past = this.cards.find(c => c.position.position === 3);
    const present = this.cards.find(c => c.position.position === 4);
    const future = this.cards.find(c => c.position.position === 5);
    
    if (past && present && future) {
      const timelinePattern = this.analyzeTimeline(past, present, future);
      if (timelinePattern) {
        relationshipPatterns.push(timelinePattern);
      }
    }

    return [...basePatterns, ...relationshipPatterns];
  }

  private getSuitHarmonyMeaning(suit: string): string {
    const loveMeanings: Record<string, string> = {
      'wands': '열정적이고 역동적인 사랑입니다. 서로를 성장시키는 로맨스가 있습니다.',
      'cups': '깊은 감정적 유대와 사랑이 있습니다. 서로의 마음을 잘 이해합니다.',
      'swords': '진실한 소통과 이해가 있는 사랑입니다. 서로의 생각을 존중합니다.',
      'pentacles': '현실적이고 안정적인 사랑입니다. 함께 미래를 건설할 수 있습니다.'
    };
    
    const careerMeanings: Record<string, string> = {
      'wands': '열정적이고 창의적인 업무 환경입니다. 서로를 자극하며 성장합니다.',
      'cups': '협력적이고 화합이 잘 되는 업무 관계입니다. 팀워크가 우수합니다.',
      'swords': '전략적이고 효율적인 업무 환경입니다. 명확한 소통이 가능합니다.',
      'pentacles': '안정적이고 생산적인 업무 환경입니다. 실질적인 성과를 낼 수 있습니다.'
    };
    
    const generalMeanings: Record<string, string> = {
      'wands': '열정적이고 역동적인 관계입니다. 서로를 성장시키는 에너지가 있습니다.',
      'cups': '깊은 감정적 유대와 공감이 있습니다. 서로의 마음을 잘 이해합니다.',
      'swords': '지적인 교감과 소통이 활발합니다. 서로의 생각을 존중합니다.',
      'pentacles': '현실적이고 안정적인 관계입니다. 함께 미래를 건설할 수 있습니다.'
    };
    
    const meanings = this.topic === 'love' ? loveMeanings :
                    this.topic === 'career' ? careerMeanings :
                    generalMeanings;
                    
    return meanings[suit] || '특별한 조화를 이루고 있습니다.';
  }

  private analyzeTimeline(past: DrawnCard, present: DrawnCard, future: DrawnCard): Pattern | null {
    // 상승하는 에너지 (숫자가 증가하는 경우)
    if (past.number < present.number && present.number < future.number) {
      return {
        pattern_name: '성장하는 관계',
        description: '관계가 점진적으로 발전하고 있습니다.',
        positions: [3, 4, 5],
        topicMeaning: '시간이 지날수록 더 깊고 의미 있는 관계로 발전할 것입니다.'
      };
    }
    
    // 정화되는 관계 (메이저에서 마이너로)
    if (past.arcana === 'major' && future.arcana === 'minor') {
      return {
        pattern_name: '안정을 찾아가는 관계',
        description: '격정적인 시기를 지나 안정적인 단계로 접어들고 있습니다.',
        positions: [3, 4, 5],
        topicMeaning: '관계가 성숙해지고 일상적인 행복을 찾아가고 있습니다.'
      };
    }
    
    return null;
  }

  // 주제별 전체 메시지 생성
  generateTopicMessage(): string {
    switch (this.topic) {
      case 'love':
        return this.generateLoveMessage();
      case 'career':
        return this.generateCareerMessage();
      default:
        return this.generateGeneralMessage();
    }
  }

  private generateLoveMessage(): string {
    const myCard = this.cards.find(c => c.position.position === 1);
    const partnerCard = this.cards.find(c => c.position.position === 2);
    const relationCard = this.cards.find(c => c.position.position === 4);
    
    let message = '두 영혼의 만남이 펼쳐진 컵 오브 릴레이션십입니다. ';
    
    if (myCard && partnerCard) {
      message += `당신은 ${myCard.nameKr}의 에너지를, 상대방은 ${partnerCard.nameKr}의 에너지를 가지고 있습니다. `;
    }
    
    if (relationCard) {
      message += `현재 관계는 ${relationCard.nameKr}의 상태에 있으며, `;
      
      if (relationCard.suit === 'cups') {
        message += '감정적으로 깊은 연결이 이루어지고 있습니다. ';
      } else if (relationCard.arcana === 'major') {
        message += '중요한 전환점을 맞이하고 있습니다. ';
      }
    }
    
    // 조언 카드 분석
    const adviceCard = this.cards.find(c => c.position.position === 7);
    if (adviceCard) {
      message += `이 관계를 위한 우주의 조언은 ${adviceCard.nameKr}입니다.`;
    }
    
    return message;
  }

  private generateCareerMessage(): string {
    const myCard = this.cards.find(c => c.position.position === 1);
    const partnerCard = this.cards.find(c => c.position.position === 2);
    const relationCard = this.cards.find(c => c.position.position === 4);
    
    let message = '업무와 협력의 관계가 펼쳐진 컵 오브 릴레이션십입니다. ';
    
    if (myCard && partnerCard) {
      message += `당신은 ${myCard.nameKr}의 업무 스타일을, 협력자/상사/조직은 ${partnerCard.nameKr}의 특성을 보입니다. `;
    }
    
    if (relationCard) {
      message += `현재 업무 관계는 ${relationCard.nameKr}의 상태이며, `;
      
      if (relationCard.suit === 'pentacles') {
        message += '실질적인 성과와 안정을 향해 가고 있습니다. ';
      } else if (relationCard.suit === 'wands') {
        message += '역동적이고 창의적인 에너지가 흐르고 있습니다. ';
      }
    }
    
    const adviceCard = this.cards.find(c => c.position.position === 7);
    if (adviceCard) {
      message += `업무 성공을 위한 조언은 ${adviceCard.nameKr}입니다.`;
    }
    
    return message;
  }

  private generateGeneralMessage(): string {
    const myCard = this.cards.find(c => c.position.position === 1);
    const partnerCard = this.cards.find(c => c.position.position === 2);
    const relationCard = this.cards.find(c => c.position.position === 4);
    
    let message = '상호 관계의 역학이 펼쳐진 컵 오브 릴레이션십입니다. ';
    
    if (myCard && partnerCard) {
      message += `한 쪽은 ${myCard.nameKr}의 특성을, 다른 쪽은 ${partnerCard.nameKr}의 특성을 나타냅니다. `;
    }
    
    if (relationCard) {
      message += `현재 상황은 ${relationCard.nameKr}의 양상을 보이며, `;
      
      if (relationCard.arcana === 'major') {
        message += '중요한 변화나 깨달음의 시기입니다. ';
      }
    }
    
    const adviceCard = this.cards.find(c => c.position.position === 7);
    if (adviceCard) {
      message += `상황을 위한 지혜는 ${adviceCard.nameKr}에 담겨 있습니다.`;
    }
    
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
      const meaning = await this.getRelationshipPositionMeaning(card, positionName);
      
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
    const loveNames: Record<number, string> = {
      1: '나의 마음',
      2: '상대의 마음',
      3: '과거의 인연',
      4: '현재의 관계',
      5: '미래의 가능성',
      6: '관계의 장애물',
      7: '우주의 조언'
    };

    const careerNames: Record<number, string> = {
      1: '나의 업무 태도',
      2: '상대방/조직의 특성',
      3: '과거의 경험',
      4: '현재의 업무 관계',
      5: '커리어 전망',
      6: '업무상 도전과제',
      7: '성공을 위한 조언'
    };

    const generalNames: Record<number, string> = {
      1: '한 쪽의 입장',
      2: '다른 쪽의 입장',
      3: '과거의 영향',
      4: '현재의 상황',
      5: '미래의 가능성',
      6: '도전과 장애물',
      7: '핵심 조언'
    };

    const names = this.topic === 'love' ? loveNames : 
                  this.topic === 'career' ? careerNames : 
                  generalNames;
    
    return names[position] || `${position}번 위치`;
  }

  private async getRelationshipPositionMeaning(card: DrawnCard, positionName: string): Promise<string> {
    const position = card.position.position;
    
    if (this.topic === 'love') {
      return this.getLovePositionMeaning(card, position, positionName);
    } else if (this.topic === 'career') {
      return this.getCareerPositionMeaning(card, position, positionName);
    } else {
      return this.getGeneralPositionMeaning(card, position, positionName);
    }
  }

  private getLovePositionMeaning(card: DrawnCard, position: number, positionName: string): string {
    switch (position) {
      case 1:
        return `${card.nameKr} 카드는 당신이 사랑에서 ${this.getMyLoveEnergy(card)}을 보여줍니다.`;
      case 2:
        return `${card.nameKr} 카드는 상대방이 ${this.getPartnerLoveEnergy(card)}을 나타냅니다.`;
      case 3:
        return `${card.nameKr} 카드는 과거 연애에서 ${this.getPastLoveInfluence(card)}이 있었음을 보여줍니다.`;
      case 4:
        return `${card.nameKr} 카드는 현재 사랑이 ${this.getCurrentLoveRelationship(card)} 상태임을 나타냅니다.`;
      case 5:
        return `${card.nameKr} 카드는 미래 사랑에 ${this.getFutureLovePotential(card)}을 암시합니다.`;
      case 6:
        return `${card.nameKr} 카드는 ${this.getLoveObstacle(card)}이 도전 과제임을 보여줍니다.`;
      case 7:
        return `${card.nameKr} 카드는 ${this.getLoveAdvice(card)}라는 사랑의 조언을 전합니다.`;
      default:
        return `${positionName}의 ${card.nameKr} 카드입니다.`;
    }
  }

  private getCareerPositionMeaning(card: DrawnCard, position: number, positionName: string): string {
    switch (position) {
      case 1:
        return `${card.nameKr} 카드는 당신의 ${this.getMyCareerEnergy(card)} 업무 스타일을 보여줍니다.`;
      case 2:
        return `${card.nameKr} 카드는 조직/협력자가 ${this.getPartnerCareerEnergy(card)}을 나타냅니다.`;
      case 3:
        return `${card.nameKr} 카드는 과거 경력에서 ${this.getPastCareerInfluence(card)}이 있었음을 보여줍니다.`;
      case 4:
        return `${card.nameKr} 카드는 현재 업무 관계가 ${this.getCurrentCareerRelationship(card)} 상태임을 나타냅니다.`;
      case 5:
        return `${card.nameKr} 카드는 커리어에 ${this.getFutureCareerPotential(card)}을 암시합니다.`;
      case 6:
        return `${card.nameKr} 카드는 ${this.getCareerObstacle(card)}이 업무상 도전임을 보여줍니다.`;
      case 7:
        return `${card.nameKr} 카드는 ${this.getCareerAdvice(card)}라는 성공을 위한 조언을 전합니다.`;
      default:
        return `${positionName}의 ${card.nameKr} 카드입니다.`;
    }
  }

  private getGeneralPositionMeaning(card: DrawnCard, position: number, positionName: string): string {
    switch (position) {
      case 1:
        return `${card.nameKr} 카드는 한 쪽이 ${this.getMyEnergy(card)}을 보여줍니다.`;
      case 2:
        return `${card.nameKr} 카드는 다른 쪽이 ${this.getPartnerEnergy(card)}을 나타냅니다.`;
      case 3:
        return `${card.nameKr} 카드는 과거에 ${this.getPastInfluence(card)}이 있었음을 보여줍니다.`;
      case 4:
        return `${card.nameKr} 카드는 현재 상황이 ${this.getCurrentRelationship(card)} 상태임을 나타냅니다.`;
      case 5:
        return `${card.nameKr} 카드는 미래에 ${this.getFuturePotential(card)}을 암시합니다.`;
      case 6:
        return `${card.nameKr} 카드는 ${this.getObstacle(card)}이 도전 과제임을 보여줍니다.`;
      case 7:
        return `${card.nameKr} 카드는 ${this.getAdvice(card)}라는 조언을 전합니다.`;
      default:
        return `${positionName}의 ${card.nameKr} 카드입니다.`;
    }
  }

  // 연애 해석 함수들
  private getMyLoveEnergy(card: DrawnCard): string {
    if (card.suit === 'cups') return '깊은 감정과 진정한 사랑';
    if (card.suit === 'wands') return '열정적인 로맨스와 끌림';
    if (card.suit === 'swords') return '소통과 이해를 중시하는 사랑';
    if (card.suit === 'pentacles') return '헌신적이고 안정적인 사랑';
    if (card.arcana === 'major') return '운명적이고 강력한 사랑의 힘';
    return '특별한 사랑의 에너지';
  }

  private getPartnerLoveEnergy(card: DrawnCard): string {
    if (card.suit === 'cups') return '감성적이고 따뜻한 사랑';
    if (card.suit === 'wands') return '열정적이고 적극적인 구애';
    if (card.suit === 'swords') return '이성적이고 진실한 사랑';
    if (card.suit === 'pentacles') return '현실적이고 안정을 주는 사랑';
    if (card.arcana === 'major') return '깊은 영향력과 특별한 사랑';
    return '독특한 사랑의 매력';
  }

  private getPastLoveInfluence(card: DrawnCard): string {
    if (card.number >= 1 && card.number <= 3) return '새로운 사랑의 시작이나 첫사랑';
    if (card.number >= 4 && card.number <= 6) return '안정적이고 평화로웠던 연애 시기';
    if (card.number >= 7 && card.number <= 9) return '사랑의 시련과 성장의 경험';
    if (card.number === 10) return '사랑의 완성이나 끝맺음';
    if (card.arcana === 'major') return '인생을 바꾼 중요한 사랑';
    return '특별한 연애 경험';
  }

  private getCurrentLoveRelationship(card: DrawnCard): string {
    if (card.suit === 'cups') return '감정적으로 깊이 연결된';
    if (card.suit === 'wands') return '열정적이고 로맨틱한';
    if (card.suit === 'swords') return '소통과 이해가 필요한';
    if (card.suit === 'pentacles') return '안정적이고 헌신적인';
    if (card.arcana === 'major') return '인생의 중요한 전환점에 있는';
    return '특별한';
  }

  private getFutureLovePotential(card: DrawnCard): string {
    if (card.orientation === 'upright') {
      if (card.suit === 'cups') return '더 깊은 사랑과 감정적 만족';
      if (card.suit === 'wands') return '새로운 로맨스와 열정';
      if (card.suit === 'swords') return '명확한 소통과 서로에 대한 이해';
      if (card.suit === 'pentacles') return '안정적인 미래와 함께하는 삶';
      if (card.arcana === 'major') return '운명적인 사랑의 성취';
    } else {
      return '사랑을 통한 성장과 배움의 기회';
    }
    return '새로운 사랑의 가능성';
  }

  private getLoveObstacle(card: DrawnCard): string {
    if (card.suit === 'cups') return '감정적 오해나 질투';
    if (card.suit === 'wands') return '성급함이나 지나친 열정';
    if (card.suit === 'swords') return '의사소통의 부족이나 오해';
    if (card.suit === 'pentacles') return '현실적 차이나 가치관의 차이';
    if (card.arcana === 'major') return '사랑을 시험하는 큰 도전';
    return '극복해야 할 사랑의 과제';
  }

  private getLoveAdvice(card: DrawnCard): string {
    if (card.suit === 'cups') return '서로의 감정을 깊이 이해하고 공감하세요';
    if (card.suit === 'wands') return '열정을 유지하면서도 서로를 존중하세요';
    if (card.suit === 'swords') return '솔직하고 명확한 소통을 하세요';
    if (card.suit === 'pentacles') return '함께 안정적인 미래를 만들어가세요';
    if (card.arcana === 'major') return '이 사랑의 더 큰 의미를 이해하세요';
    return '서로를 이해하고 사랑하세요';
  }

  // 커리어 해석 함수들
  private getMyCareerEnergy(card: DrawnCard): string {
    if (card.suit === 'cups') return '인간관계를 중시하는';
    if (card.suit === 'wands') return '열정적이고 창의적인';
    if (card.suit === 'swords') return '전략적이고 분석적인';
    if (card.suit === 'pentacles') return '실무적이고 결과지향적인';
    if (card.arcana === 'major') return '리더십이 강한';
    return '특별한';
  }

  private getPartnerCareerEnergy(card: DrawnCard): string {
    if (card.suit === 'cups') return '협력적이고 포용적인 분위기';
    if (card.suit === 'wands') return '역동적이고 도전적인 환경';
    if (card.suit === 'swords') return '체계적이고 효율적인 시스템';
    if (card.suit === 'pentacles') return '안정적이고 성과중심적인 문화';
    if (card.arcana === 'major') return '강력한 영향력과 비전';
    return '특별한 업무 환경';
  }

  private getPastCareerInfluence(card: DrawnCard): string {
    if (card.number >= 1 && card.number <= 3) return '새로운 커리어의 시작';
    if (card.number >= 4 && card.number <= 6) return '안정적인 성장과 발전';
    if (card.number >= 7 && card.number <= 9) return '도전과 승진의 경험';
    if (card.number === 10) return '프로젝트 완료나 직무 전환';
    if (card.arcana === 'major') return '커리어의 중요한 전환점';
    return '특별한 경력 경험';
  }

  private getCurrentCareerRelationship(card: DrawnCard): string {
    if (card.suit === 'cups') return '협력적이고 화합이 잘 되는';
    if (card.suit === 'wands') return '역동적이고 활기찬';
    if (card.suit === 'swords') return '전략적 계획이 필요한';
    if (card.suit === 'pentacles') return '안정적이고 생산적인';
    if (card.arcana === 'major') return '중요한 변화가 일어나는';
    return '특별한';
  }

  private getFutureCareerPotential(card: DrawnCard): string {
    if (card.orientation === 'upright') {
      if (card.suit === 'cups') return '좋은 팀워크와 만족스러운 결과';
      if (card.suit === 'wands') return '새로운 프로젝트와 성장 기회';
      if (card.suit === 'swords') return '전략적 성공과 인정';
      if (card.suit === 'pentacles') return '안정적인 수입과 승진';
      if (card.arcana === 'major') return '커리어의 큰 도약';
    } else {
      return '극복해야 할 도전과 성장의 기회';
    }
    return '새로운 커리어 가능성';
  }

  private getCareerObstacle(card: DrawnCard): string {
    if (card.suit === 'cups') return '직장 내 인간관계 문제';
    if (card.suit === 'wands') return '과도한 경쟁이나 번아웃';
    if (card.suit === 'swords') return '의견 충돌이나 소통 부족';
    if (card.suit === 'pentacles') return '자원 부족이나 예산 문제';
    if (card.arcana === 'major') return '커리어의 큰 전환점';
    return '극복해야 할 업무 과제';
  }

  private getCareerAdvice(card: DrawnCard): string {
    if (card.suit === 'cups') return '동료들과의 관계를 개선하고 협력하세요';
    if (card.suit === 'wands') return '열정을 유지하면서 균형을 찾으세요';
    if (card.suit === 'swords') return '명확한 전략과 계획을 세우세요';
    if (card.suit === 'pentacles') return '꾸준히 실력을 쌓고 성과를 만들어가세요';
    if (card.arcana === 'major') return '더 큰 비전을 가지고 도약하세요';
    return '성공을 위해 노력하세요';
  }

  // 일반 해석 함수들 (기존 코드)
  private getMyEnergy(card: DrawnCard): string {
    if (card.suit === 'cups') return '깊은 감정과 사랑';
    if (card.suit === 'wands') return '열정과 적극성';
    if (card.suit === 'swords') return '명확한 의사소통';
    if (card.suit === 'pentacles') return '안정과 헌신';
    if (card.arcana === 'major') return '강력한 개성과 영향력';
    return '특별한 에너지';
  }

  private getPartnerEnergy(card: DrawnCard): string {
    if (card.suit === 'cups') return '감정적이고 배려심 깊은 마음';
    if (card.suit === 'wands') return '적극적이고 열정적인 태도';
    if (card.suit === 'swords') return '이성적이고 분석적인 접근';
    if (card.suit === 'pentacles') return '현실적이고 안정을 추구하는 성향';
    if (card.arcana === 'major') return '깊은 영향력과 특별한 역할';
    return '독특한 에너지';
  }

  private getPastInfluence(card: DrawnCard): string {
    if (card.number >= 1 && card.number <= 3) return '새로운 시작이나 초기 단계';
    if (card.number >= 4 && card.number <= 6) return '안정과 조화를 찾던 시기';
    if (card.number >= 7 && card.number <= 9) return '도전과 성장의 경험';
    if (card.number === 10) return '완성이나 전환점';
    if (card.arcana === 'major') return '중요한 인생 사건이나 만남';
    return '특별한 경험';
  }

  private getCurrentRelationship(card: DrawnCard): string {
    if (card.suit === 'cups') return '감정적으로 연결된';
    if (card.suit === 'wands') return '열정적이고 역동적인';
    if (card.suit === 'swords') return '소통과 이해가 중요한';
    if (card.suit === 'pentacles') return '안정적이고 실질적인';
    if (card.arcana === 'major') return '중요한 전환기에 있는';
    return '특별한';
  }

  private getFuturePotential(card: DrawnCard): string {
    if (card.orientation === 'upright') {
      if (card.suit === 'cups') return '더 깊은 사랑과 이해';
      if (card.suit === 'wands') return '새로운 모험과 성장';
      if (card.suit === 'swords') return '명확한 소통과 이해';
      if (card.suit === 'pentacles') return '안정적인 미래 건설';
      if (card.arcana === 'major') return '중요한 변화와 성장';
    } else {
      return '극복해야 할 도전과 성장의 기회';
    }
    return '새로운 가능성';
  }

  private getObstacle(card: DrawnCard): string {
    if (card.suit === 'cups') return '감정적 오해나 상처';
    if (card.suit === 'wands') return '성급함이나 충돌';
    if (card.suit === 'swords') return '의사소통의 어려움';
    if (card.suit === 'pentacles') return '현실적 제약이나 차이';
    if (card.arcana === 'major') return '큰 인생의 과제';
    return '극복해야 할 과제';
  }

  private getAdvice(card: DrawnCard): string {
    if (card.suit === 'cups') return '서로의 감정을 깊이 이해하고 공감하세요';
    if (card.suit === 'wands') return '열정을 유지하되 서로를 존중하세요';
    if (card.suit === 'swords') return '솔직하고 명확한 소통을 하세요';
    if (card.suit === 'pentacles') return '현실적인 기반을 함께 만들어가세요';
    if (card.arcana === 'major') return '이 관계의 더 큰 의미를 이해하세요';
    return '서로를 이해하고 성장하세요';
  }

  // 행동 제안 생성
  async generateActionSuggestions(): Promise<Array<{
    position: number;
    cardName: string;
    action: string;
    context: string;
  }>> {
    const suggestions = [];
    
    // 주제별 위치별 구체적 조언
    const loveActions: Record<number, { action: string; context: string }> = {
      1: { 
        action: '사랑에 대한 진실한 마음을 탐구하고 표현하세요',
        context: '진정성 있는 사랑이 관계의 기초입니다'
      },
      2: {
        action: '연인의 사랑 방식을 이해하고 수용하세요',
        context: '사랑의 표현은 사람마다 다릅니다'
      },
      3: {
        action: '과거 연애의 상처를 치유하고 놓아주세요',
        context: '과거의 사랑에서 배운 교훈을 활용하세요'
      },
      4: {
        action: '현재 사랑의 아름다움을 감사하고 소중히 하세요',
        context: '현재의 사랑에 충실할 때 미래가 풍요로워집니다'
      },
      5: {
        action: '함께 사랑의 미래를 그려보고 꿈을 공유하세요',
        context: '공동의 비전이 사랑을 더욱 깊게 만듭니다'
      },
      6: {
        action: '사랑의 장애물을 함께 극복할 방법을 찾으세요',
        context: '시련은 사랑을 더 강하게 만드는 기회입니다'
      },
      7: {
        action: '사랑의 지혜를 일상에서 실천하세요',
        context: '작은 사랑의 실천이 큰 행복을 만듭니다'
      }
    };

    const careerActions: Record<number, { action: string; context: string }> = {
      1: { 
        action: '당신의 업무 강점을 파악하고 발휘하세요',
        context: '자신의 강점을 아는 것이 성공의 시작입니다'
      },
      2: {
        action: '조직 문화를 이해하고 적응하세요',
        context: '환경을 이해하면 더 효과적으로 일할 수 있습니다'
      },
      3: {
        action: '과거 경험을 토대로 더 나은 방향을 모색하세요',
        context: '경험은 최고의 스승입니다'
      },
      4: {
        action: '현재 업무 관계를 개선하고 발전시키세요',
        context: '좋은 관계는 업무 성과로 이어집니다'
      },
      5: {
        action: '커리어 목표를 설정하고 실행 계획을 세우세요',
        context: '명확한 목표가 성공으로 가는 길입니다'
      },
      6: {
        action: '업무상 도전을 성장의 기회로 삼으세요',
        context: '도전을 극복하면 더 강해집니다'
      },
      7: {
        action: '성공을 위한 조언을 실무에 적용하세요',
        context: '지혜를 행동으로 옮길 때 성과가 나타납니다'
      }
    };

    const generalActions: Record<number, { action: string; context: string }> = {
      1: { 
        action: '자신의 진정한 마음을 탐구하고 표현하세요',
        context: '진정성 있는 자기표현이 관계의 기초입니다'
      },
      2: {
        action: '상대방의 입장에서 생각하고 공감하세요',
        context: '이해와 공감이 관계를 깊게 만듭니다'
      },
      3: {
        action: '과거의 패턴을 인식하고 필요하면 놓아주세요',
        context: '과거에서 배우되 얽매이지 마세요'
      },
      4: {
        action: '현재 관계의 장점을 감사하고 키워나가세요',
        context: '현재에 충실할 때 미래가 열립니다'
      },
      5: {
        action: '함께 미래를 그려보고 목표를 공유하세요',
        context: '공동의 비전이 관계를 강화합니다'
      },
      6: {
        action: '장애물을 함께 극복할 방법을 찾으세요',
        context: '도전은 관계를 더 강하게 만드는 기회입니다'
      },
      7: {
        action: '우주의 조언을 일상에서 실천하세요',
        context: '작은 실천이 큰 변화를 만듭니다'
      }
    };
    
    const positionActions = this.topic === 'love' ? loveActions :
                           this.topic === 'career' ? careerActions :
                           generalActions;
    
    for (const card of this.cards) {
      const position = card.position.position;
      const actionInfo = positionActions[position];
      
      if (actionInfo) {
        suggestions.push({
          position,
          cardName: card.nameKr,
          action: actionInfo.action,
          context: actionInfo.context
        });
      }
    }
    
    return suggestions;
  }

  // 관계 시너지 특별 분석
  findSynergies(): Synergy[] {
    const synergies = super.findSynergies();
    
    // 나와 상대방 카드의 특별한 시너지
    const myCard = this.cards.find(c => c.position.position === 1);
    const partnerCard = this.cards.find(c => c.position.position === 2);
    
    if (myCard && partnerCard) {
      // 보완적 에너지
      if (this.areComplementary(myCard, partnerCard)) {
        synergies.push({
          card1Name: myCard.nameKr,
          card2Name: partnerCard.nameKr,
          positions: [1, 2],
          description: '서로를 완벽하게 보완하는 에너지를 가지고 있습니다. 각자의 강점이 상대의 약점을 채워줍니다.'
        });
      }
      
      // 같은 숫자 - 공명
      if (myCard.number === partnerCard.number && myCard.arcana === 'minor') {
        synergies.push({
          card1Name: myCard.nameKr,
          card2Name: partnerCard.nameKr,
          positions: [1, 2],
          description: `${myCard.number}번의 에너지가 공명합니다. 비슷한 발달 단계에서 서로를 이해할 수 있습니다.`
        });
      }
    }
    
    return synergies;
  }

  private areComplementary(card1: DrawnCard, card2: DrawnCard): boolean {
    // 불과 물, 공기와 흙은 서로 보완적
    const complementPairs: [string, string][] = [
      ['wands', 'cups'],
      ['swords', 'pentacles']
    ];
    
    for (const [suit1, suit2] of complementPairs) {
      if ((card1.suit === suit1 && card2.suit === suit2) ||
          (card1.suit === suit2 && card2.suit === suit1)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * 구조화된 AI 해석 프롬프트 생성
   */
  public generateStructuredPromptForAI(
    cards: DrawnCard[],
    topic: string,
    question?: string
  ): string {
    const positions = [
      '나의 현재 상태',
      '상대방의 현재 상태',
      '관계의 기본',
      '관계의 과거',
      '현재 느낌',
      '현재 외부 상황',
      '현재 나는 어떻게 생각?',
      '현재 상대는 어떻게 생각?',
      '미래 나는 어떻게 생각?',
      '미래 상대는 어떻게 생각?',
      '결과'
    ];
    
    const cardsForPrompt = cards.map(card => ({
      name_ko: card.nameKr || card.name_kr || card.name,
      isReversed: card.orientation === 'reversed'
    }));
    
    return generateStructuredPrompt('cup-of-relationship', cardsForPrompt, positions, question);
  }
  
  /**
   * AI 응답 검증 및 재구조화
   */
  public validateAIResponse(response: string): string {
    return validateAndRestructureResponse(response, 'cup-of-relationship');
  }
}
