import { SevenStarInterpreter, CardData, SevenStarInterpretation } from '../../utils/interpreters/SevenStarInterpreter';
import { getQuestionForSpread } from '../../data/spreads/spreadQuestions';
import { generateStructuredPrompt, validateAndRestructureResponse } from '../../utils/interpretationUtils';

export interface EnhancedSevenStarResult {
  basicInterpretation: SevenStarInterpretation;
  questionAnswers: {
    mainAnswer: string;
    subAnswers: string[];
  };
  summary: string;
  advice: string;
  luckyElements: {
    color: string;
    number: number;
    direction: string;
    item: string;
  };
  aiInterpretation?: string; // AI 해석 추가
}

export class EnhancedSevenStarInterpreter extends SevenStarInterpreter {
  private topic: string = 'general';
  private customQuestion?: string;
  
  constructor(cards?: CardData[], topic: string = 'general', customQuestion?: string) {
    super(cards);
    this.topic = topic;
    this.customQuestion = customQuestion;
  }
  
  /**
   * 향상된 해석 생성
   */
  public async generateEnhancedInterpretation(cardsData: any[]): Promise<EnhancedSevenStarResult> {
    // 기본 해석 생성
    const basicInterpretation = await this.generateInterpretation(cardsData);
    
    // 질문에 대한 답변 생성
    const questionAnswers = this.generateQuestionAnswers(cardsData);
    
    // 종합 요약
    const summary = this.generateSummary(basicInterpretation, cardsData);
    
    // 구체적인 조언
    const advice = this.generateDetailedAdvice(basicInterpretation, cardsData);
    
    // 행운의 요소들
    const luckyElements = this.generateLuckyElements(cardsData);
    
    return {
      basicInterpretation,
      questionAnswers,
      summary,
      advice,
      luckyElements
    };
  }
  
  /**
   * 구조화된 AI 해석 생성
   */
  public generateStructuredPromptForAI(cardsData: any[], question: string): string {
    const positions = [
      '과거의 영향',
      '현재 상황',
      '미래 가능성',
      '숨겨진 영향',
      '의식적 욕구',
      '무의식적 욕구',
      '최종 결과'
    ];
    
    const cards = cardsData.map(data => ({
      name_ko: data.card.nameKr,
      isReversed: data.orientation === 'reversed'
    }));
    
    return generateStructuredPrompt('seven-star', cards, positions, question);
  }
  
  /**
   * AI 응답 검증 및 재구조화
   */
  public validateAIResponse(response: string): string {
    return validateAndRestructureResponse(response, 'seven-star');
  }
  
  /**
   * 질문에 대한 답변 생성
   */
  private generateQuestionAnswers(cardsData: any[]): EnhancedSevenStarResult['questionAnswers'] {
    const spreadQuestion = getQuestionForSpread('seven_star', this.topic);
    const mainQuestion = this.customQuestion || spreadQuestion?.question || '당신의 운명은 어떻게 펼쳐질까요?';
    const subQuestions = spreadQuestion?.subQuestions || [];
    
    // 메인 질문에 대한 답변
    const mainAnswer = this.generateMainAnswer(cardsData, mainQuestion);
    
    // 서브 질문들에 대한 답변
    const subAnswers = this.generateSubAnswers(cardsData, subQuestions);
    
    return {
      mainAnswer,
      subAnswers
    };
  }
  
  /**
   * 메인 질문에 대한 답변 생성
   */
  private generateMainAnswer(cardsData: any[], question: string): string {
    const past = cardsData[0]; // 과거의 영향
    const present = cardsData[1]; // 현재 상황
    const future = cardsData[2]; // 미래 가능성
    const hidden = cardsData[3]; // 숨겨진 영향
    const conscious = cardsData[4]; // 의식적 욕구
    const unconscious = cardsData[5]; // 무의식적 욕구
    const result = cardsData[6]; // 최종 결과
    
    let answer = `"${question}"에 대한 답변입니다.\n\n`;
    
    // 현재 상황 설명
    if (present) {
      answer += `현재 당신은 ${present.card.nameKr}`;
      answer += present.orientation === 'upright' ? '의 긍정적인 ' : '(역)의 도전적인 ';
      answer += '에너지 속에 있습니다. ';
    }
    
    // 과거의 영향
    if (past) {
      answer += `과거의 ${past.card.nameKr}`;
      answer += past.orientation === 'upright' ? '가 ' : '(역)가 ';
      answer += '현재까지 영향을 미치고 있으며, ';
    }
    
    // 숨겨진 요소
    if (hidden) {
      answer += `겉으로 드러나지 않지만 ${hidden.card.nameKr}`;
      answer += hidden.orientation === 'upright' ? '의 ' : '(역)의 ';
      answer += '숨겨진 힘이 작용하고 있습니다. ';
    }
    
    // 의식과 무의식
    if (conscious && unconscious) {
      answer += `\n\n당신이 의식적으로 원하는 것은 ${conscious.card.nameKr}`;
      answer += conscious.orientation === 'upright' ? '이지만, ' : '(역)이지만, ';
      answer += `진정으로 필요한 것은 ${unconscious.card.nameKr}`;
      answer += unconscious.orientation === 'upright' ? '입니다. ' : '(역)입니다. ';
    }
    
    // 미래와 결과
    if (future && result) {
      answer += `\n\n미래에는 ${future.card.nameKr}`;
      answer += future.orientation === 'upright' ? '의 가능성이 ' : '(역)의 도전이 ';
      answer += `펼쳐지며, 최종적으로 ${result.card.nameKr}`;
      answer += result.orientation === 'upright' ? '의 결과를 ' : '(역)의 교훈을 ';
      answer += '맞이하게 될 것입니다.';
    }
    
    return answer;
  }
  
  /**
   * 서브 질문들에 대한 답변 생성
   */
  private generateSubAnswers(cardsData: any[], subQuestions: string[]): string[] {
    const answers: string[] = [];
    
    // 각 포지션과 연관된 질문에 답변
    const positionMapping = [
      0, // 과거의 영향
      1, // 현재 상황
      3, // 숨겨진 영향
      [4, 5], // 의식적/무의식적 욕구
      6 // 최종 결과
    ];
    
    subQuestions.forEach((question, index) => {
      if (index < positionMapping.length) {
        const positions = Array.isArray(positionMapping[index]) 
          ? positionMapping[index] as number[]
          : [positionMapping[index] as number];
        
        let answer = `${question}\n→ `;
        
        positions.forEach((pos, i) => {
          if (cardsData[pos]) {
            if (i > 0) answer += ' 그리고 ';
            answer += `${cardsData[pos].card.nameKr}`;
            answer += cardsData[pos].orientation === 'upright' ? '' : '(역)';
            answer += `가 나타내듯, ${this.getCardMeaning(cardsData[pos])}`;
          }
        });
        
        answers.push(answer);
      }
    });
    
    return answers;
  }
  
  /**
   * 카드의 의미 해석
   */
  private getCardMeaning(cardData: any): string {
    const card = cardData.card;
    const isUpright = cardData.orientation === 'upright';
    
    // 주제별 해석
    switch (this.topic) {
      case 'love':
        return this.getLoveMeaning(card, isUpright);
      case 'career':
        return this.getCareerMeaning(card, isUpright);
      case 'money':
        return this.getMoneyMeaning(card, isUpright);
      default:
        return this.getGeneralMeaning(card, isUpright);
    }
  }
  
  /**
   * 연애운 관련 카드 의미
   */
  private getLoveMeaning(card: any, isUpright: boolean): string {
    // 메이저 아르카나 예시
    if (card.name === 'The Lovers') {
      return isUpright ? '진정한 사랑과 조화로운 관계가 예상됩니다' : '관계의 불균형이나 선택의 어려움이 있습니다';
    }
    if (card.name === 'The Empress') {
      return isUpright ? '풍요로운 사랑과 모성애적 보살핌이 있습니다' : '감정적 의존이나 질투심에 주의가 필요합니다';
    }
    
    // 수트별 기본 해석
    if (card.suit === 'cups') {
      return isUpright ? '감정적 만족과 사랑의 성취가 있습니다' : '감정적 혼란이나 실망이 있을 수 있습니다';
    }
    if (card.suit === 'wands') {
      return isUpright ? '열정적인 만남과 로맨스가 있습니다' : '성급함이나 충동적 행동을 조심하세요';
    }
    
    return isUpright ? '긍정적인 변화가 예상됩니다' : '주의와 인내가 필요합니다';
  }
  
  /**
   * 직업운 관련 카드 의미
   */
  private getCareerMeaning(card: any, isUpright: boolean): string {
    if (card.name === 'The Emperor') {
      return isUpright ? '리더십 발휘와 승진의 기회가 있습니다' : '권위에 대한 도전이나 통제력 상실에 주의하세요';
    }
    if (card.name === 'The Magician') {
      return isUpright ? '능력 발휘와 새로운 프로젝트 성공이 예상됩니다' : '준비 부족이나 자만심을 경계하세요';
    }
    
    if (card.suit === 'pentacles') {
      return isUpright ? '안정적인 성과와 물질적 보상이 있습니다' : '재정적 어려움이나 정체기가 있을 수 있습니다';
    }
    if (card.suit === 'swords') {
      return isUpright ? '명확한 판단과 전략적 성공이 가능합니다' : '갈등이나 의사소통 문제에 주의하세요';
    }
    
    return isUpright ? '발전과 성장의 기회가 있습니다' : '도전과 시련을 통한 성장이 필요합니다';
  }
  
  /**
   * 금전운 관련 카드 의미
   */
  private getMoneyMeaning(card: any, isUpright: boolean): string {
    if (card.name === 'The Wheel of Fortune') {
      return isUpright ? '재정적 행운과 예상치 못한 수입이 있습니다' : '재정 변동성에 대비가 필요합니다';
    }
    if (card.name === 'The Star') {
      return isUpright ? '희망적인 재정 전망과 투자 기회가 있습니다' : '비현실적인 기대를 조심하세요';
    }
    
    if (card.suit === 'pentacles') {
      return isUpright ? '재정 안정과 수입 증가가 예상됩니다' : '지출 관리와 절약이 필요합니다';
    }
    
    return isUpright ? '재정적 기회가 찾아옵니다' : '신중한 재정 관리가 필요합니다';
  }
  
  /**
   * 일반적인 카드 의미
   */
  private getGeneralMeaning(card: any, isUpright: boolean): string {
    // 카드 키워드 활용
    if (card.keywords && card.keywords.length > 0) {
      const keyword = isUpright ? card.keywords[0] : card.keywords[card.keywords.length - 1];
      return `${keyword}의 에너지가 작용하고 있습니다`;
    }
    
    return isUpright ? '긍정적인 영향이 있습니다' : '도전과 성장의 기회입니다';
  }
  
  /**
   * 종합 요약 생성
   */
  private generateSummary(interpretation: SevenStarInterpretation, cardsData: any[]): string {
    let summary = '【종합 요약】\n\n';
    
    // 별 패턴 분석
    summary += `${interpretation.starPattern.direction} `;
    summary += `${interpretation.starPattern.balance} `;
    summary += `${interpretation.starPattern.energy}\n\n`;
    
    // 핵심 통찰
    summary += interpretation.coreInsight + '\n\n';
    
    // 주요 카드 언급
    const keyCards = [cardsData[1], cardsData[6]]; // 현재와 결과
    summary += '핵심 카드는 ';
    keyCards.forEach((card, index) => {
      if (card) {
        if (index > 0) summary += '와 ';
        summary += `${card.card.nameKr}${card.orientation === 'reversed' ? '(역)' : ''}`;
      }
    });
    summary += '입니다. ';
    
    // 전체적인 방향성
    const uprightCount = cardsData.filter(c => c.orientation === 'upright').length;
    if (uprightCount >= 5) {
      summary += '전반적으로 매우 긍정적인 흐름입니다.';
    } else if (uprightCount >= 3) {
      summary += '균형잡힌 에너지 속에서 성장의 기회가 있습니다.';
    } else {
      summary += '도전이 많지만 이를 통해 더 강해질 수 있습니다.';
    }
    
    return summary;
  }
  
  /**
   * 구체적인 조언 생성
   */
  private generateDetailedAdvice(interpretation: SevenStarInterpretation, cardsData: any[]): string {
    let advice = '【구체적인 조언】\n\n';
    
    // 기본 조언
    advice += interpretation.advice + '\n\n';
    
    // 주제별 특화 조언
    switch (this.topic) {
      case 'love':
        advice += this.getLoveAdvice(cardsData);
        break;
      case 'career':
        advice += this.getCareerAdvice(cardsData);
        break;
      case 'money':
        advice += this.getMoneyAdvice(cardsData);
        break;
      default:
        advice += this.getGeneralAdvice(cardsData);
    }
    
    // 시기별 조언
    advice += '\n\n【시기별 행동 지침】\n';
    advice += '• 단기(1주일): ' + this.getShortTermAdvice(cardsData) + '\n';
    advice += '• 중기(1개월): ' + this.getMidTermAdvice(cardsData) + '\n';
    advice += '• 장기(3개월): ' + this.getLongTermAdvice(cardsData);
    
    return advice;
  }
  
  /**
   * 연애 관련 조언
   */
  private getLoveAdvice(cardsData: any[]): string {
    const present = cardsData[1];
    const conscious = cardsData[4];
    const unconscious = cardsData[5];
    
    let advice = '💕 연애 조언:\n';
    
    if (present?.orientation === 'upright') {
      advice += '• 현재 좋은 에너지가 흐르고 있으니 적극적으로 표현하세요.\n';
    } else {
      advice += '• 먼저 자신의 마음을 정리하는 시간이 필요합니다.\n';
    }
    
    if (conscious && unconscious) {
      if (conscious.card.suit === unconscious.card.suit) {
        advice += '• 의식과 무의식이 조화를 이루고 있어 진실한 사랑이 가능합니다.\n';
      } else {
        advice += '• 겉마음과 속마음의 차이를 인식하고 진정한 마음을 따르세요.\n';
      }
    }
    
    return advice;
  }
  
  /**
   * 직업 관련 조언
   */
  private getCareerAdvice(cardsData: any[]): string {
    const present = cardsData[1];
    const hidden = cardsData[3];
    const result = cardsData[6];
    
    let advice = '💼 직업 조언:\n';
    
    if (present?.card.suit === 'pentacles') {
      advice += '• 실무 능력을 발휘할 좋은 시기입니다.\n';
    } else if (present?.card.suit === 'swords') {
      advice += '• 전략적 사고와 명확한 커뮤니케이션이 중요합니다.\n';
    }
    
    if (hidden?.orientation === 'reversed') {
      advice += '• 숨겨진 경쟁자나 예상치 못한 변수에 대비하세요.\n';
    }
    
    if (result?.orientation === 'upright') {
      advice += '• 꾸준한 노력이 좋은 결과로 이어질 것입니다.\n';
    }
    
    return advice;
  }
  
  /**
   * 금전 관련 조언
   */
  private getMoneyAdvice(cardsData: any[]): string {
    const present = cardsData[1];
    const future = cardsData[2];
    
    let advice = '💰 금전 조언:\n';
    
    if (present?.card.arcana === 'major') {
      advice += '• 큰 재정적 변화가 예상되니 준비하세요.\n';
    }
    
    if (future?.orientation === 'upright') {
      advice += '• 투자나 저축을 시작하기 좋은 시기입니다.\n';
    } else {
      advice += '• 보수적인 재정 관리가 필요한 시기입니다.\n';
    }
    
    return advice;
  }
  
  /**
   * 일반적인 조언
   */
  private getGeneralAdvice(cardsData: any[]): string {
    let advice = '✨ 일반 조언:\n';
    
    // 메이저 아르카나 비율에 따른 조언
    const majorCount = cardsData.filter(c => c.card.arcana === 'major').length;
    if (majorCount >= 5) {
      advice += '• 인생의 중요한 전환기입니다. 큰 그림을 보세요.\n';
    } else if (majorCount <= 2) {
      advice += '• 일상적인 노력과 실천이 중요한 시기입니다.\n';
    }
    
    // 원소 균형에 따른 조언
    const elements = this.countElements(cardsData);
    const dominantElement = Object.entries(elements).sort((a, b) => b[1] - a[1])[0];
    
    if (dominantElement) {
      const elementAdvice: { [key: string]: string } = {
        'fire': '• 열정을 행동으로 옮기되 인내심을 가지세요.\n',
        'water': '• 감정을 소중히 하되 이성적 판단도 필요합니다.\n',
        'air': '• 생각을 정리하고 명확하게 소통하세요.\n',
        'earth': '• 현실적인 목표를 세우고 차근차근 실천하세요.\n'
      };
      advice += elementAdvice[dominantElement[0]] || '';
    }
    
    return advice;
  }
  
  /**
   * 단기 조언 (1주일)
   */
  private getShortTermAdvice(cardsData: any[]): string {
    const present = cardsData[1];
    
    if (present?.orientation === 'upright') {
      return '현재의 긍정적 에너지를 최대한 활용하세요.';
    } else {
      return '신중하게 상황을 관찰하고 준비하세요.';
    }
  }
  
  /**
   * 중기 조언 (1개월)
   */
  private getMidTermAdvice(cardsData: any[]): string {
    const hidden = cardsData[3];
    const conscious = cardsData[4];
    
    if (hidden?.orientation === 'reversed') {
      return '숨겨진 문제들이 드러날 수 있으니 대비하세요.';
    } else if (conscious?.orientation === 'upright') {
      return '목표를 향해 적극적으로 나아가세요.';
    }
    
    return '꾸준한 노력과 인내가 필요한 시기입니다.';
  }
  
  /**
   * 장기 조언 (3개월)
   */
  private getLongTermAdvice(cardsData: any[]): string {
    const future = cardsData[2];
    const result = cardsData[6];
    
    if (result?.orientation === 'upright') {
      return '계획대로 진행하면 좋은 결과를 얻을 것입니다.';
    } else if (future?.orientation === 'upright') {
      return '미래의 기회를 위해 지금부터 준비하세요.';
    }
    
    return '유연한 대처와 지속적인 성장이 열쇠입니다.';
  }
  
  /**
   * 원소 카운트
   */
  private countElements(cardsData: any[]): { [key: string]: number } {
    const elements: { [key: string]: number } = {
      fire: 0,
      water: 0,
      air: 0,
      earth: 0
    };
    
    cardsData.forEach(data => {
      const card = data.card;
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
    
    return elements;
  }
  
  /**
   * 행운의 요소들 생성
   */
  private generateLuckyElements(cardsData: any[]): EnhancedSevenStarResult['luckyElements'] {
    // 지배적인 원소 찾기
    const elements = this.countElements(cardsData);
    const dominantElement = Object.entries(elements).sort((a, b) => b[1] - a[1])[0];
    
    // 원소별 행운의 색상
    const elementColors: { [key: string]: string } = {
      fire: '빨간색',
      water: '파란색',
      air: '노란색',
      earth: '초록색'
    };
    
    // 원소별 방향
    const elementDirections: { [key: string]: string } = {
      fire: '남쪽',
      water: '북쪽',
      air: '동쪽',
      earth: '서쪽'
    };
    
    // 원소별 행운의 아이템
    const elementItems: { [key: string]: string } = {
      fire: '양초나 붉은 보석',
      water: '수정이나 푸른 천',
      air: '깃털이나 풍경',
      earth: '식물이나 돌'
    };
    
    // 행운의 숫자 계산 (정방향 카드 수 + 메이저 아르카나 수)
    const uprightCount = cardsData.filter(c => c.orientation === 'upright').length;
    const majorCount = cardsData.filter(c => c.card.arcana === 'major').length;
    const luckyNumber = ((uprightCount + majorCount) % 9) + 1; // 1-9 사이의 숫자
    
    return {
      color: dominantElement ? elementColors[dominantElement[0]] : '보라색',
      number: luckyNumber,
      direction: dominantElement ? elementDirections[dominantElement[0]] : '중앙',
      item: dominantElement ? elementItems[dominantElement[0]] : '수정 구슬'
    };
  }
}
