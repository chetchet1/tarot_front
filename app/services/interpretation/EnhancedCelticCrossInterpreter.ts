import { supabase } from '@/config/supabase';
import { BaseEnhancedInterpreter } from './BaseEnhancedInterpreter.js';
import { DrawnCard, SpreadPosition } from '../../models/tarot';

interface Pattern {
  pattern_name: string;
  description: string;
  positions: number[];
  topicMeaning?: string;
}

interface ActionSuggestion {
  position: number;
  cardName: string;
  action: string;
  context: string;
}

interface PositionMeaning {
  position: number;
  positionName: string;
  cardName: string;
  meaning: string;
}

export class EnhancedCelticCrossInterpreter extends BaseEnhancedInterpreter {
  private positions: SpreadPosition[];

  constructor(topic: string, cards: DrawnCard[]) {
    super(topic, cards);
    this.positions = cards.map(c => c.position);
  }

  // 켈틱 크로스 특화 패턴 분석
  protected analyzePatterns(): Pattern[] {
    const basePatterns = super.analyzePatterns();
    const celticPatterns: Pattern[] = [];

    // 시간축 분석 (과거-현재-미래)
    const pastCard = this.cards.find(c => c.position.position === 4);
    const presentCards = this.cards.filter(c => [1, 2].includes(c.position.position));
    const futureCard = this.cards.find(c => c.position.position === 6);
    
    if (pastCard && presentCards.length > 0 && futureCard) {
      const timelinePattern = this.analyzeTimeline(pastCard, presentCards, futureCard);
      if (timelinePattern) {
        celticPatterns.push(timelinePattern);
      }
    }

    // 내면과 외면의 조화 분석
    const innerCard = this.cards.find(c => c.position.position === 1);
    const outerCard = this.cards.find(c => c.position.position === 2);
    
    if (innerCard && outerCard) {
      if (innerCard.suit === outerCard.suit) {
        celticPatterns.push({
          pattern_name: '내외면의 조화',
          description: `${this.getSuitName(innerCard.suit)} 에너지가 내면과 외면에서 일치합니다.`,
          positions: [1, 2],
          topicMeaning: '생각과 행동이 일치하는 상태입니다.'
        });
      } else if (innerCard.arcana === 'major' && outerCard.arcana === 'major') {
        celticPatterns.push({
          pattern_name: '강력한 변화의 시기',
          description: '내면과 외면 모두에서 중요한 변화가 일어나고 있습니다.',
          positions: [1, 2],
          topicMeaning: '인생의 중요한 전환점에 있습니다.'
        });
      }
    }

    // 자아상 분석 (7번과 8번 위치)
    const selfView = this.cards.find(c => c.position.position === 7);
    const othersView = this.cards.find(c => c.position.position === 8);
    
    if (selfView && othersView) {
      const perceptionPattern = this.analyzePerception(selfView, othersView);
      if (perceptionPattern) {
        celticPatterns.push(perceptionPattern);
      }
    }

    return [...basePatterns, ...celticPatterns];
  }

  private analyzeTimeline(past: DrawnCard, present: DrawnCard[], future: DrawnCard): Pattern | null {
    // 에너지의 흐름 분석
    if (past.arcana === 'minor' && future.arcana === 'major') {
      return {
        pattern_name: '상승하는 운명',
        description: '작은 시작에서 큰 변화로 발전하고 있습니다.',
        positions: [4, 1, 2, 6],
        topicMeaning: '점진적으로 중요한 일이 펼쳐질 것입니다.'
      };
    }
    
    if (past.suit === future.suit) {
      return {
        pattern_name: '일관된 테마',
        description: `${this.getSuitName(past.suit)} 에너지가 지속적으로 영향을 미치고 있습니다.`,
        positions: [4, 6],
        topicMeaning: '특정 주제가 계속해서 중요한 역할을 합니다.'
      };
    }
    
    return null;
  }

  private analyzePerception(selfView: DrawnCard, othersView: DrawnCard): Pattern | null {
    if (selfView.number === othersView.number && selfView.arcana === 'minor') {
      return {
        pattern_name: '일치된 인식',
        description: '자신과 타인이 보는 모습이 일치합니다.',
        positions: [7, 8],
        topicMeaning: '진정성 있게 자신을 표현하고 있습니다.'
      };
    }
    
    if (selfView.arcana === 'major' && othersView.arcana === 'minor') {
      return {
        pattern_name: '내면의 깊이',
        description: '내면의 변화가 아직 외부에 완전히 드러나지 않았습니다.',
        positions: [7, 8],
        topicMeaning: '내적 성장을 외부로 표현할 시간이 필요합니다.'
      };
    }
    
    return null;
  }

  // 주제별 전체 메시지 생성
  protected generateTopicMessage(): string {
    const coreCards = this.cards.filter(c => [1, 2].includes(c.position.position));
    const outcomeCard = this.cards.find(c => c.position.position === 10);
    
    let message = '';
    
    switch (this.topic) {
      case 'love':
        message = this.generateLoveMessage(coreCards, outcomeCard);
        break;
      case 'career':
        message = this.generateCareerMessage(coreCards, outcomeCard);
        break;
      case 'general':
      default:
        message = this.generateGeneralMessage(coreCards, outcomeCard);
    }
    
    return message;
  }

  private generateLoveMessage(coreCards: DrawnCard[], outcomeCard?: DrawnCard): string {
    let message = '사랑의 켈틱 크로스가 펼쳐졌습니다. ';
    
    const innerCard = coreCards.find(c => c.position.position === 1);
    const challengeCard = coreCards.find(c => c.position.position === 2);
    
    if (innerCard) {
      const innerEnergy = this.getCardEnergy(innerCard);
      message += `당신의 마음은 ${innerEnergy}로 가득합니다. `;
      
      if (innerCard.suit === 'cups') {
        message += '감정이 풍부하고 사랑을 받을 준비가 되어 있습니다. ';
      }
    }
    
    if (challengeCard) {
      const challengeEnergy = this.getCardEnergy(challengeCard);
      message += `현재 ${challengeEnergy}의 도전이 있지만, 이는 성장의 기회입니다. `;
    }
    
    if (outcomeCard) {
      const outcomeEnergy = this.getCardEnergy(outcomeCard);
      if (outcomeCard.orientation === 'upright') {
        message += `최종적으로 ${outcomeEnergy}의 긍정적인 결과가 예상됩니다.`;
      } else {
        message += `결과를 위해서는 ${outcomeEnergy}의 교훈을 이해해야 합니다.`;
      }
    }
    
    return message;
  }

  private generateCareerMessage(coreCards: DrawnCard[], outcomeCard?: DrawnCard): string {
    let message = '경력의 길을 비추는 켈틱 크로스입니다. ';
    
    const innerCard = coreCards.find(c => c.position.position === 1);
    const challengeCard = coreCards.find(c => c.position.position === 2);
    
    if (innerCard) {
      const innerEnergy = this.getCardEnergy(innerCard);
      message += `현재 당신의 업무 상태는 ${innerEnergy}로 나타납니다. `;
      
      if (innerCard.suit === 'pentacles') {
        message += '실질적인 성과를 향해 나아가고 있습니다. ';
      } else if (innerCard.suit === 'wands') {
        message += '창의적이고 열정적인 에너지가 있습니다. ';
      }
    }
    
    if (challengeCard) {
      const challengeEnergy = this.getCardEnergy(challengeCard);
      message += `${challengeEnergy}의 과제를 극복하면 더 큰 성장이 있을 것입니다. `;
    }
    
    if (outcomeCard && outcomeCard.arcana === 'major') {
      message += '중요한 경력 전환점이 다가오고 있습니다.';
    }
    
    return message;
  }

  private generateGeneralMessage(coreCards: DrawnCard[], outcomeCard?: DrawnCard): string {
    let message = '당신의 상황을 종합적으로 보여주는 켈틱 크로스입니다. ';
    
    const majorCount = this.cards.filter(c => c.arcana === 'major').length;
    
    if (majorCount >= 5) {
      message += '매우 중요한 인생의 전환기에 있습니다. ';
    }
    
    const innerCard = coreCards.find(c => c.position.position === 1);
    if (innerCard) {
      const innerEnergy = this.getCardEnergy(innerCard);
      message += `핵심은 ${innerEnergy}입니다. `;
    }
    
    if (outcomeCard) {
      const outcomeEnergy = this.getCardEnergy(outcomeCard);
      message += `모든 것이 ${outcomeEnergy}로 귀결될 것입니다.`;
    }
    
    return message;
  }

  // 위치별 의미 생성
  protected async generatePositionMeanings(): Promise<PositionMeaning[]> {
    const meanings: PositionMeaning[] = [];
    
    for (const card of this.cards) {
      const positionName = this.getPositionName(card.position.position);
      const meaning = await this.getCelticPositionMeaning(card, positionName);
      
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
      1: '현재 내면',
      2: '현재 외부',
      3: '근본 원인',
      4: '과거',
      5: '가능한 결과',
      6: '가까운 미래',
      7: '내가 보는 나',
      8: '주변이 보는 나',
      9: '희망과 두려움',
      10: '최종 결과'
    };
    return names[position] || `${position}번 위치`;
  }

  private async getCelticPositionMeaning(card: DrawnCard, positionName: string): Promise<string> {
    const position = card.position.position;
    const baseInterpretation = this.getCardInterpretation(card, position);
    const cardEnergy = this.getCardEnergy(card);
    
    // 주제별 특화 해석 추가
    const topicContext = this.getTopicContext(position);
    
    return `${positionName}에는 ${cardEnergy}가 나타났습니다. ${baseInterpretation} ${topicContext}`;
  }

  private getTopicContext(position: number): string {
    if (this.topic === 'love') {
      const loveContexts: Record<number, string> = {
        1: '당신의 사랑에 대한 진정한 마음을 보여줍니다.',
        2: '관계에서 직면한 현실적 상황입니다.',
        3: '이 관계의 깊은 뿌리와 기원입니다.',
        4: '과거의 사랑이 현재에 미치는 영향입니다.',
        5: '노력하면 이룰 수 있는 관계의 모습입니다.',
        6: '곧 다가올 관계의 변화입니다.',
        7: '사랑에 대한 당신의 자아상입니다.',
        8: '파트너가 보는 당신의 모습입니다.',
        9: '관계에 대한 깊은 소망이나 걱정입니다.',
        10: '이 사랑의 최종 운명입니다.'
      };
      return loveContexts[position] || '';
    }
    
    if (this.topic === 'career') {
      const careerContexts: Record<number, string> = {
        1: '현재 업무에 대한 내적 상태입니다.',
        2: '직면한 업무상 도전 과제입니다.',
        3: '현 상황의 근본적 원인입니다.',
        4: '과거 경험이 현재에 미치는 영향입니다.',
        5: '달성 가능한 최선의 결과입니다.',
        6: '곧 일어날 업무상 변화입니다.',
        7: '직업에 대한 자기 인식입니다.',
        8: '동료들이 보는 당신의 모습입니다.',
        9: '경력에 대한 포부와 우려입니다.',
        10: '이 경력 여정의 최종 도착지입니다.'
      };
      return careerContexts[position] || '';
    }
    
    return '';
  }

  // 행동 제안 생성
  protected async generateActionSuggestions(): Promise<ActionSuggestion[]> {
    const suggestions: ActionSuggestion[] = [];
    
    // 핵심 위치별 조언
    const keyPositions = [1, 2, 6, 10];
    
    for (const position of keyPositions) {
      const card = this.cards.find(c => c.position.position === position);
      if (card) {
        const action = this.getActionForPosition(card, position);
        suggestions.push({
          position,
          cardName: card.nameKr,
          action: action.action,
          context: action.context
        });
      }
    }
    
    return suggestions;
  }

  private getActionForPosition(card: DrawnCard, position: number): { action: string; context: string } {
    const cardEnergy = this.getCardEnergy(card);
    const actions: Record<number, { action: string; context: string }> = {
      1: {
        action: `현재 내면의 ${cardEnergy}를 인식하고 받아들이세요`,
        context: '자기 이해가 모든 변화의 시작입니다'
      },
      2: {
        action: `현재 외부의 ${cardEnergy}를 정면으로 마주하세요`,
        context: '장애물은 성장의 디딤돌입니다'
      },
      6: {
        action: `다가올 ${cardEnergy}를 준비하세요`,
        context: '준비된 자에게 기회가 찾아옵니다'
      },
      10: {
        action: `최종 ${cardEnergy}를 향해 꾸준히 나아가세요`,
        context: '목적지를 알면 길을 찾을 수 있습니다'
      }
    };
    
    return actions[position] || { action: '카드의 메시지를 깊이 성찰하세요', context: '' };
  }

  // 켈틱 크로스 특별 시너지
  protected findSynergies() {
    const synergies = super.findSynergies();
    
    // 과거-현재-미래 연결
    const past = this.cards.find(c => c.position.position === 4);
    const present = this.cards.find(c => c.position.position === 1);
    const future = this.cards.find(c => c.position.position === 6);
    
    if (past && present && future) {
      // 시간축 시너지 분석
      if (past.suit === present.suit && present.suit === future.suit) {
        synergies.push({
          card1Name: `과거와 현재의 ${this.getSuitName(past.suit)} 에너지`,
          card2Name: `미래의 ${this.getSuitName(future.suit)} 에너지`,
          positions: [4, 1, 6],
          description: `${this.getSuitName(past.suit)} 에너지가 시간을 관통하며 일관되게 작용하고 있습니다.`
        });
      }
    }
    
    // 내면과 결과의 관계
    const inner = this.cards.find(c => c.position.position === 1);
    const outcome = this.cards.find(c => c.position.position === 10);
    
    if (inner && outcome) {
      if (inner.number === outcome.number && inner.arcana === 'minor') {
        synergies.push({
          card1Name: `현재 내면의 에너지`,
          card2Name: `최종 결과의 에너지`,
          positions: [1, 10],
          description: '현재의 내면 상태가 그대로 결과에 반영될 것입니다. 시작과 끝이 연결되어 있습니다.'
        });
      }
    }
    
    // 희망과 결과의 일치
    const hope = this.cards.find(c => c.position.position === 9);
    const finalOutcome = this.cards.find(c => c.position.position === 10);
    
    if (hope && finalOutcome && hope.suit === finalOutcome.suit) {
      synergies.push({
        card1Name: `희망의 에너지`,
        card2Name: `결과의 에너지`,
        positions: [9, 10],
        description: '희망하는 바와 실제 결과가 같은 에너지를 공유합니다. 긍정적인 기대가 현실화될 가능성이 높습니다.'
      });
    }
    
    return synergies;
  }

  private getCardInterpretation(card: DrawnCard, position: number): string {
    // 주제별로 다른 해석 제공
    if (card.arcana === 'major') {
      return this.getMajorCardInterpretation(card, position);
    } else {
      return this.getMinorCardInterpretation(card, position);
    }
  }

  private getMajorCardInterpretation(card: DrawnCard, position: number): string {
    // 연애운 해석
    if (this.topic === 'love') {
      const loveInterpretations: Record<number, string> = {
        0: '새로운 사랑의 시작, 순수한 마음으로 다가가기',
        1: '사랑을 실현시킬 능력과 매력',
        2: '직관적인 사랑, 깊은 감정적 이해',
        3: '풍요로운 사랑, 모성애적 보살핌',
        4: '안정적인 관계, 책임감 있는 사랑',
        5: '전통적인 사랑관, 결혼을 향한 길',
        6: '사랑의 선택, 운명적 만남',
        7: '관계의 주도권, 열정적 추구',
        8: '내면의 사랑, 자기 사랑의 중요성',
        9: '혼자만의 시간, 사랑의 성찰',
        10: '인연의 변화, 새로운 만남의 시기',
        11: '균형잡힌 관계, 공정한 사랑',
        12: '사랑을 위한 희생, 관점의 전환',
        13: '관계의 종료와 새로운 시작',
        14: '조화로운 관계, 서로를 위한 절제',
        15: '집착이나 욕망, 불건전한 관계',
        16: '관계의 급격한 변화, 진실의 폭로',
        17: '희망찬 사랑, 이상적 관계',
        18: '불확실한 감정, 착각의 위험',
        19: '행복한 관계, 밝은 미래',
        20: '관계의 재평가, 새로운 단계',
        21: '완벽한 결합, 행복한 결말'
      };
      return loveInterpretations[card.number] || '사랑의 중요한 전환점';
    }
    
    // 직업운 해석
    if (this.topic === 'career') {
      const careerInterpretations: Record<number, string> = {
        0: '새로운 직업 기회, 창업의 가능성',
        1: '업무 능력 발휘, 리더십',
        2: '직관적 판단, 숨겨진 정보',
        3: '창의적 프로젝트, 풍성한 결과',
        4: '조직 내 안정, 체계적 업무',
        5: '멘토의 조언, 전통적 방식',
        6: '직업 선택, 중요한 결정',
        7: '목표 달성을 위한 추진력',
        8: '내적 강인함, 어려움 극복',
        9: '전문성 개발, 깊이 있는 연구',
        10: '경력의 전환점, 새로운 기회',
        11: '공정한 평가, 계약의 성사',
        12: '일시적 정체, 새로운 시각 필요',
        13: '직업의 변화, 이직이나 전직',
        14: '워라밸, 업무의 조화',
        15: '과도한 업무, 스트레스',
        16: '갑작스런 변화, 구조조정',
        17: '비전 실현, 목표 달성 가능',
        18: '불확실한 상황, 혼란',
        19: '성공과 인정, 승진 기회',
        20: '경력 재평가, 새로운 시작',
        21: '목표 달성, 경력의 정점'
      };
      return careerInterpretations[card.number] || '경력의 중요한 전환점';
    }
    
    // 종합운 해석 (기본)
    const generalInterpretations: Record<number, string> = {
      0: '새로운 시작과 무한한 가능성',
      1: '의지력과 창조적 능력',
      2: '직관과 숨겨진 지혜',
      3: '풍요와 양육의 에너지',
      4: '구조와 안정성',
      5: '전통과 영적 지혜',
      6: '선택과 조화',
      7: '의지와 결단력',
      8: '내면의 힘과 용기',
      9: '내적 탐구와 지혜',
      10: '운명의 순환',
      11: '균형과 공정성',
      12: '희생과 새로운 관점',
      13: '변화와 재생',
      14: '절제와 조화',
      15: '속박과 물질주의',
      16: '급격한 변화와 해방',
      17: '희망과 영감',
      18: '환상과 직관',
      19: '성공과 활력',
      20: '재생과 새로운 시작',
      21: '완성과 통합'
    };
    
    return generalInterpretations[card.number] || '중요한 전환점';
  }

  private getMinorCardInterpretation(card: DrawnCard, position: number): string {
    // 연애운 해석
    if (this.topic === 'love') {
      const loveSuitMeanings: Record<string, string> = {
        wands: '열정과 로맨스',
        cups: '감정과 사랑',
        swords: '소통과 이해',
        pentacles: '안정과 헌신'
      };
      
      const loveNumberMeanings: Record<number, string> = {
        1: '새로운 사랑의 시작',
        2: '파트너십과 조화',
        3: '관계의 성장과 축하',
        4: '안정적인 사랑',
        5: '관계의 시련과 갈등',
        6: '사랑의 조화와 회복',
        7: '관계에 대한 성찰',
        8: '사랑의 발전과 노력',
        9: '관계의 성숙',
        10: '사랑의 완성과 가족'
      };
      
      const suit = loveSuitMeanings[card.suit || ''] || '사랑의 에너지';
      const number = loveNumberMeanings[card.number] || '사랑의 과정';
      return `${suit}의 ${number}`;
    }
    
    // 직업운 해석
    if (this.topic === 'career') {
      const careerSuitMeanings: Record<string, string> = {
        wands: '창의성과 도전',
        cups: '협업과 만족',
        swords: '전략과 결정',
        pentacles: '성과와 보상'
      };
      
      const careerNumberMeanings: Record<number, string> = {
        1: '새로운 프로젝트 시작',
        2: '협업과 균형',
        3: '팀워크와 성장',
        4: '안정적 기반 구축',
        5: '경쟁과 도전',
        6: '성공과 인정',
        7: '전략 재검토',
        8: '기술 향상과 숙련',
        9: '목표 달성 직전',
        10: '완성과 새로운 도약'
      };
      
      const suit = careerSuitMeanings[card.suit || ''] || '업무 에너지';
      const number = careerNumberMeanings[card.number] || '업무 과정';
      return `${suit}의 ${number}`;
    }
    
    // 종합운 해석 (기본)
    const suitMeanings: Record<string, string> = {
      wands: '창의성과 열정',
      cups: '감정과 관계',
      swords: '사고와 소통',
      pentacles: '물질과 실현'
    };
    
    const numberMeanings: Record<number, string> = {
      1: '새로운 시작',
      2: '균형과 선택',
      3: '성장과 확장',
      4: '안정과 기초',
      5: '갈등과 도전',
      6: '조화와 성공',
      7: '인내와 평가',
      8: '숙달과 발전',
      9: '거의 완성',
      10: '완성과 새로운 순환'
    };
    
    const suit = suitMeanings[card.suit || ''] || '에너지';
    const number = numberMeanings[card.number] || '과정';
    return `${suit}의 ${number}`;
  }
}
