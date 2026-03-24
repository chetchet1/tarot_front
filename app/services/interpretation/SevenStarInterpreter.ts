/**
 * 세븐스타 인터프리터
 * AI 연동 기반 타로 해석 서비스
 */

import { supabase } from '@/services/supabase';
import { fetchInterpretationStream } from '@/services/ai/streamingEdgeFetch';

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
  aiInterpretation: string;  // AI 해석 (필수)
  summary: string;           // 종합 요약
  advice: string;            // 구체적 조언
  luckyElements?: {          // 행운의 요소 (선택)
    color: string;
    number: number;
    direction: string;
    item: string;
  };
  timestamp: Date;
}

export class SevenStarInterpreter {
  private cards: CardData[] = [];
  private topic: string = 'general';
  private customQuestion?: string;
  private relationshipStatus?: string;
  
  // 세븐스타 배열법의 7개 포지션
  private readonly positions = [
    { name: '과거의 영향', description: '과거로부터 이어져 온 영향과 배경' },
    { name: '현재 상황', description: '현재 직면한 상황과 에너지' },
    { name: '미래의 가능성', description: '앞으로 펼쳐질 가능성과 잠재력' },
    { name: '내면의 상태', description: '당신의 내적 상태와 감정' },
    { name: '외부 환경', description: '주변 환경과 외부의 영향력' },
    { name: '조언과 지침', description: '상황을 헤쳐나가기 위한 조언' },
    { name: '최종 결과', description: '노력의 최종적인 결실과 결과' }
  ];

  constructor(cards?: CardData[], topic: string = 'general', customQuestion?: string) {
    if (cards) {
      this.cards = cards;
    }
    this.topic = topic;
    this.customQuestion = customQuestion;
  }
  
  /**
   * 연애 상태 설정
   */
  public setRelationshipStatus(status: string): void {
    this.relationshipStatus = status;
  }
  
  /**
   * 카드 데이터 설정
   */
  public setCards(cardsData: any[]): void {
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
        name: this.positions[index].name,
        description: this.positions[index].description
      }
    }));
  }

  /**
   * AI 해석 생성 (메인 메서드)
   */
  public async generateInterpretation(userId?: string): Promise<{ success: boolean; interpretation: SevenStarInterpretation | string }> {
    try {
      // console.trace('두번 호출 출처를 찾자');
      console.log('[SevenStar] AI 해석 생성 시작');
      console.log('[SevenStar] 카드 데이터:', this.cards);
      console.log('[SevenStar] 주제:', this.topic);
      console.log('[SevenStar] relationshipStatus:', this.relationshipStatus);
      console.log('[SevenStar] userId:', userId);
      
      // AI 해석 요청
      const aiResponse = await this.requestAIInterpretation(userId);
      
      if (!aiResponse.success || !aiResponse.interpretation) {
        console.error('[SevenStar] AI 해석 요청 실패');
        throw new Error('AI 해석 생성 실패');
      }
      
      console.log('[SevenStar] AI 해석 생성 성공');
      
      // AI 응답에서 # 기호 제거
      const cleanedInterpretation = this.removeHashSymbols(aiResponse.interpretation);
      
      // 종합 요약과 조언 생성
      const summary = this.generateSummary();
      const advice = this.generateAdvice();
      const luckyElements = this.generateLuckyElements();
      
      const interpretation: SevenStarInterpretation = {
        aiInterpretation: cleanedInterpretation,
        summary,
        advice,
        luckyElements,
        timestamp: new Date()
      };
      
      return {
        success: true,
        interpretation
      };
    } catch (error) {
      console.error('[SevenStar] 해석 생성 오류:', error);
      
      // 에러 시 기본 해석 반환
      return {
        success: false,
        interpretation: this.generateFallbackInterpretation()
      };
    }
  }

  /**
   * AI용 프롬프트 생성
   */
  private generateAIPrompt(): string {
    let prompt = `당신은 경험 많은 타로 마스터입니다. `;
    
    // 커스텀 질문이 있는 경우
    if (this.customQuestion && this.customQuestion.trim()) {
      prompt += `세븐 스타 배열법으로 다음 질문에 대한 명확하고 깊이 있는 답변을 제공해주세요.\n\n`;
      prompt += `【질문자의 구체적 질문】\n"${this.customQuestion}"\n\n`;
      prompt += `【답변 우선순위】\n`;
      prompt += `1. 첫 문장에서 반드시 질문에 대한 직접적인 답변을 제시하세요\n`;
      prompt += `2. 질문의 핵심 키워드를 자연스럽게 반복 사용하세요\n`;
      prompt += `3. 일반적인 조언이 아닌 질문과 관련된 구체적인 해석만 제공하세요\n\n`;
    } else if (this.topic !== 'custom') {
      prompt += `세븐 스타 배열법으로 ${this.topic}에 대한 깊이 있는 해석을 제공해주세요.\n\n`;
    } else {
      prompt += `세븐 스타 배열법으로 전반적인 운세에 대한 해석을 제공해주세요.\n\n`;
    }
    
    // 연애 카테고리 처리
    if (!this.customQuestion && (this.topic === '연애' || this.topic === 'love')) {
      if (this.relationshipStatus === 'single') {
        prompt += `질문자는 현재 솔로입니다. 새로운 만남과 연애 기회에 초점을 맞춰주세요.\n\n`;
      } else if (this.relationshipStatus === 'couple') {
        prompt += `질문자는 현재 연인이 있습니다. 관계 발전과 미래에 초점을 맞춰주세요.\n\n`;
      }
    }
    
    prompt += `【세븐 스타 카드 배열】\n`;
    this.cards.forEach((card, index) => {
      const pos = this.positions[index];
      prompt += `${index + 1}. ${pos.name}: ${card.nameKr} (${card.orientation === 'upright' ? '정방향' : '역방향'})\n`;
    });
    prompt += '\n';
    
    // 핵심 포지션 분석
    prompt += `【핵심 카드 의미】\n`;
    prompt += `• 과거의 영향: ${this.cards[0]?.nameKr} - 지나온 길\n`;
    prompt += `• 현재 상황: ${this.cards[1]?.nameKr} - 지금의 에너지\n`;
    prompt += `• 미래 가능성: ${this.cards[2]?.nameKr} - 앞으로의 방향\n`;
    prompt += `• 최종 결과: ${this.cards[6]?.nameKr} - 예상되는 결과\n\n`;
    
    // 응답 형식 지침
    prompt += `【응답 형식】\n`;
    
    if (this.customQuestion && this.customQuestion.trim()) {
      prompt += `첫 문장에서 "${this.customQuestion}"에 대한 명확한 답변을 제시하세요.\n\n`;
    }
    
    prompt += `다음과 같은 형식으로 작성하세요:\n\n`;
    prompt += `🔮 현재 상황\n`;
    prompt += `(현재 카드들이 보여주는 상황을 3-4문장으로 설명)\n\n`;
    prompt += `⏰ 시간의 흐름\n`;
    prompt += `(과거-현재-미래의 연결성을 3-4문장으로 설명)\n\n`;
    prompt += `✨ 숨겨진 메시지\n`;
    prompt += `(내면과 외부 환경 카드가 암시하는 것을 3-4문장으로 설명)\n\n`;
    prompt += `💡 실천 조언\n`;
    prompt += `(조언 카드를 바탕으로 구체적인 행동 지침을 3-4문장으로 제시)\n\n`;
    prompt += `🌟 종합 메시지\n`;
    prompt += `(전체 카드의 흐름을 종합한 희망적인 메시지를 2-3문장으로)\n\n`;
    
    prompt += `각 섹션은 이모지와 제목을 먼저 쓰고 줄바꿈 후 내용을 작성하세요.\n`;
    prompt += `전체 길이는 800-1000자 정도로 충실하게 작성하세요.`;
    
    return prompt;
  }

  /**
   * AI 해석 요청
   */
  private async requestAIInterpretation(userId?: string): Promise<{ success: boolean; interpretation?: string }> {
    try {
      const cardsForAPI = this.cards.map((card, index) => ({
        ...card,
        name_kr: card.nameKr,
        position: {
          name: this.positions[index].name,
          description: this.positions[index].description
        }
      }));

      const customPrompt = this.generateAIPrompt();

      const interpretation = await fetchInterpretationStream({
        cards: cardsForAPI,
        topic: this.topic,
        spreadType: 'seven_star',
        userId,
        isPremium: true,
        customQuestion: this.customQuestion,
        customPrompt: customPrompt,
        relationshipStatus: this.relationshipStatus
      }, 'SevenStar');

      return { success: true, interpretation };
    } catch (error) {
      console.error('[SevenStar] AI 해석 요청 실패:', error);
      return { success: false };
    }
  }

  /**
   * 패턴 분석
   */
  private analyzePatterns(): string[] {
    const patterns: string[] = [];
    
    // 정/역방향 비율
    const uprightCount = this.cards.filter(c => c.orientation === 'upright').length;
    const reversedCount = this.cards.length - uprightCount;
    
    if (uprightCount >= 5) {
      patterns.push('전반적으로 긍정적인 에너지가 우세합니다');
    } else if (reversedCount >= 5) {
      patterns.push('변화와 성장의 기회가 많이 나타나고 있습니다');
    } else {
      patterns.push('균형잡힌 에너지가 흐르고 있습니다');
    }
    
    // 메이저/마이너 비율
    const majorCount = this.cards.filter(c => c.arcana === 'major').length;
    if (majorCount >= 4) {
      patterns.push('운명적이고 중요한 전환기에 있습니다');
    } else if (majorCount <= 1) {
      patterns.push('일상적인 노력과 실천이 중요한 시기입니다');
    }
    
    // 원소 분석
    const elements = this.analyzeElements();
    if (elements.dominant) {
      patterns.push(`${elements.dominant} 에너지가 강하게 작용하고 있습니다`);
    }
    
    return patterns;
  }

  /**
   * 원소 분석
   */
  private analyzeElements(): { dominant?: string; balance: string } {
    const elementCount: { [key: string]: number } = {
      '불': 0,
      '물': 0,
      '공기': 0,
      '흙': 0
    };
    
    const elementMap: { [key: string]: string } = {
      'wands': '불',
      'cups': '물',
      'swords': '공기',
      'pentacles': '흙',
      'fire': '불',
      'water': '물',
      'air': '공기',
      'earth': '흙'
    };
    
    this.cards.forEach(card => {
      if (card.suit && elementMap[card.suit]) {
        elementCount[elementMap[card.suit]]++;
      } else if (card.element && elementMap[card.element]) {
        elementCount[elementMap[card.element]]++;
      }
    });
    
    const sorted = Object.entries(elementCount).sort((a, b) => b[1] - a[1]);
    const dominant = sorted[0][1] >= 3 ? sorted[0][0] : undefined;
    
    return {
      dominant,
      balance: sorted[0][1] - sorted[3][1] <= 2 ? '균형' : '불균형'
    };
  }

  /**
   * 종합 요약 생성
   */
  private generateSummary(): string {
    const present = this.cards[1];
    const result = this.cards[6];
    
    let summary = `현재 ${present?.nameKr || '알 수 없는 카드'}의 `;
    summary += present?.orientation === 'upright' ? '긍정적인 ' : '도전적인 ';
    summary += '에너지 속에서 ';
    
    const elements = this.analyzeElements();
    if (elements.dominant) {
      summary += `${elements.dominant}의 힘이 강하게 작용하고 있으며, `;
    }
    
    summary += `최종적으로 ${result?.nameKr || '미래'}`;
    summary += result?.orientation === 'upright' ? '의 긍정적인 결실을 ' : '를 통한 성장을 ';
    summary += '맞이하게 될 것입니다.';
    
    return summary;
  }

  /**
   * 조언 생성
   */
  private generateAdvice(): string {
    const adviceCard = this.cards[5]; // 조언과 지침 위치
    const present = this.cards[1];
    
    let advice = '';
    
    if (adviceCard) {
      advice += `${adviceCard.nameKr}`;
      advice += adviceCard.orientation === 'upright' ? '가 제시하는 ' : '(역)이 암시하는 ';
      advice += '방향을 따라 ';
    }
    
    // 주제별 조언
    switch (this.topic) {
      case '연애':
        advice += '마음을 열고 진실된 감정을 표현하세요. ';
        advice += '솔로라면 새로운 만남에 열려있고, 연인이 있다면 더 깊은 이해를 추구하세요.';
        break;
      case '직업':
        advice += '전문성을 발휘하고 목표를 명확히 하세요. ';
        advice += '변화를 두려워하지 말고 기회를 포착하세요.';
        break;
      case '금전':
        advice += '신중한 계획과 실천이 필요합니다. ';
        advice += '장기적인 관점에서 재정을 관리하세요.';
        break;
      default:
        advice += '현재의 흐름을 신뢰하고 직관을 따르세요. ';
        advice += '모든 경험이 성장의 기회임을 기억하세요.';
    }
    
    return advice;
  }

  /**
   * 행운의 요소 생성
   */
  private generateLuckyElements(): SevenStarInterpretation['luckyElements'] {
    const elements = this.analyzeElements();
    const uprightCount = this.cards.filter(c => c.orientation === 'upright').length;
    
    const elementColors: { [key: string]: string } = {
      '불': '빨간색',
      '물': '파란색',
      '공기': '노란색',
      '흙': '초록색'
    };
    
    const elementDirections: { [key: string]: string } = {
      '불': '남쪽',
      '물': '북쪽',
      '공기': '동쪽',
      '흙': '서쪽'
    };
    
    const elementItems: { [key: string]: string } = {
      '불': '양초나 붉은 보석',
      '물': '수정이나 푸른 천',
      '공기': '깃털이나 풍경',
      '흙': '식물이나 돌'
    };
    
    const luckyNumber = ((uprightCount + this.cards.filter(c => c.arcana === 'major').length) % 9) + 1;
    
    return {
      color: elements.dominant ? elementColors[elements.dominant] : '보라색',
      number: luckyNumber,
      direction: elements.dominant ? elementDirections[elements.dominant] : '중앙',
      item: elements.dominant ? elementItems[elements.dominant] : '수정 구슬'
    };
  }

  /**
   * 폴백 해석 (AI 실패 시)
   */
  private generateFallbackInterpretation(): string {
    let interpretation = `🌟 세븐 스타가 전하는 ${this.topic} 메시지 🌟\n\n`;
    
    interpretation += `7장의 카드가 별자리처럼 펼쳐져 당신의 운명을 비추고 있습니다.\n\n`;
    
    // 카드 나열
    this.cards.forEach((card, index) => {
      interpretation += `${this.positions[index].name}: ${card.nameKr}`;
      interpretation += card.orientation === 'upright' ? '\n' : ' (역방향)\n';
    });
    
    interpretation += `\n${this.generateSummary()}\n\n`;
    interpretation += `조언: ${this.generateAdvice()}\n\n`;
    
    const lucky = this.generateLuckyElements();
    if (lucky) {
      interpretation += `행운의 요소:\n`;
      interpretation += `• 색상: ${lucky.color}\n`;
      interpretation += `• 숫자: ${lucky.number}\n`;
      interpretation += `• 방향: ${lucky.direction}\n`;
      interpretation += `• 아이템: ${lucky.item}\n`;
    }
    
    return interpretation;
  }
  
  /**
   * 포지션 이름 가져오기
   */
  public getPositionName(index: number): string {
    return this.positions[index]?.name || `위치 ${index + 1}`;
  }
  
  /**
   * 포지션 설명 가져오기
   */
  public getPositionDescription(index: number): string {
    return this.positions[index]?.description || '';
  }
  
  /**
   * AI 응답에서 # 기호 제거
   */
  private removeHashSymbols(text: string): string {
    if (!text) return '';
    
    // 마크다운 헤더 제거 (### 제목 -> 제목)
    let cleaned = text.replace(/^#{1,6}\s+/gm, '');
    
    // 제목 앞뒤의 # 제거
    cleaned = cleaned.replace(/#{1,6}\s*([^#\n]+)\s*#{0,6}/g, '$1');
    
    // 연속된 줄바꿈 정리
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    return cleaned.trim();
  }
}
