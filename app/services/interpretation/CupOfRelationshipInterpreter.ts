/**
 * 컵 오브 릴레이션쉽 인터프리터
 * AI 연동 기반 관계 해석 서비스
 */

import { supabase } from '@/services/supabase';

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

export interface CupRelationshipInterpretation {
  aiInterpretation: string;  // AI 해석 (필수)
  summary: string;           // 종합 요약
  advice: string;            // 구체적 조언
  relationshipScore?: number; // 관계 점수 (0-100)
  keyInsights?: string[];    // 핵심 통찰
  timestamp: Date;
}

export class CupOfRelationshipInterpreter {
  private cards: CardData[] = [];
  private topic: string = '연애';  // 기본값 연애
  private customQuestion?: string;
  
  // 컵 릴레이션쉽 배열법의 7개 포지션
  private readonly positions = [
    { name: '나의 마음', description: '질문자의 현재 감정과 마음 상태' },
    { name: '상대의 마음', description: '상대방의 감정과 마음 상태' },
    { name: '관계의 현재', description: '두 사람 관계의 현재 상황' },
    { name: '나의 무의식', description: '질문자가 인식하지 못하는 감정' },
    { name: '상대의 무의식', description: '상대방이 인식하지 못하는 감정' },
    { name: '관계의 도전', description: '관계에서 극복해야 할 과제' },
    { name: '관계의 미래', description: '관계가 나아갈 방향과 가능성' }
  ];

  constructor(cards?: CardData[], topic: string = '연애', customQuestion?: string) {
    if (cards) {
      this.cards = cards;
    }
    this.topic = topic;
    this.customQuestion = customQuestion;
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
  public async generateInterpretation(userId?: string): Promise<{ success: boolean; interpretation: CupRelationshipInterpretation | string }> {
    try {
      // AI 프롬프트 생성
      const prompt = this.generateAIPrompt();
      
      // AI 해석 요청
      const aiResponse = await this.requestAIInterpretation(prompt, userId);
      
      if (!aiResponse.success || !aiResponse.interpretation) {
        throw new Error('AI 해석 생성 실패');
      }
      
      // 추가 분석 생성
      const summary = this.generateSummary();
      const advice = this.generateAdvice();
      const relationshipScore = this.calculateRelationshipScore();
      const keyInsights = this.generateKeyInsights();
      
      const interpretation: CupRelationshipInterpretation = {
        aiInterpretation: aiResponse.interpretation,
        summary,
        advice,
        relationshipScore,
        keyInsights,
        timestamp: new Date()
      };
      
      return {
        success: true,
        interpretation
      };
    } catch (error) {
      console.error('컵 릴레이션쉽 해석 생성 오류:', error);
      
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
    let prompt = `당신은 경험 많은 타로 마스터입니다. 컵 오브 릴레이션쉽 배열법으로 관계에 대한 깊이 있는 해석을 제공해주세요.\n\n`;
    
    // 관계 상태 고려
    prompt += `【중요 지침】\n`;
    prompt += `질문자의 관계 상태를 알 수 없으므로, 다음 세 가지 경우를 모두 고려하여 해석해주세요:\n`;
    prompt += `1. 현재 솔로인 경우: 미래의 연애 가능성, 자기 이해와 준비\n`;
    prompt += `2. 썸/짝사랑 중인 경우: 관계 발전 가능성, 상대방의 마음\n`;
    prompt += `3. 연인 관계인 경우: 관계의 깊이, 발전 방향, 조화\n`;
    prompt += `세 가지 경우를 자연스럽게 통합하여 설명해주세요.\n\n`;
    
    if (this.customQuestion) {
      prompt += `【질문자의 구체적 질문】\n${this.customQuestion}\n\n`;
    }
    
    prompt += `【카드 배열】\n`;
    this.cards.forEach((card, index) => {
      const pos = this.positions[index];
      prompt += `${index + 1}. ${pos.name}: ${card.nameKr} - ${card.orientation === 'upright' ? '정방향' : '역방향'}\n`;
    });
    prompt += '\n';
    
    // 관계 패턴 분석
    const patterns = this.analyzeRelationshipPatterns();
    if (patterns.length > 0) {
      prompt += `【발견된 관계 패턴】\n`;
      patterns.forEach(pattern => {
        prompt += `• ${pattern}\n`;
      });
      prompt += '\n';
    }
    
    prompt += `【해석 가이드라인】
1. 나와 상대방의 마음 상태 비교 분석
2. 의식과 무의식의 차이점 설명
3. 관계의 현재 상황과 도전 과제 연결
4. 미래의 가능성을 희망적으로 제시
5. 각 관계 상태(솔로/썸/연인)에 맞는 조언
6. 성장과 발전의 관점에서 해석
7. 따뜻하고 공감적인 톤 유지

【응답 형식】
관계의 역동성을 중심으로 자연스럽게 이야기를 풀어가세요.
전체 해석은 3-4개 문단으로 구성하고, 각 문단은 2-3문장으로 작성해주세요.
구체적이고 실용적인 조언을 포함해주세요.`;
    
    return prompt;
  }

  /**
   * AI 해석 요청
   */
  private async requestAIInterpretation(prompt: string, userId?: string): Promise<{ success: boolean; interpretation?: string }> {
    try {
      // Supabase Edge Function 호출
      const { data, error } = await supabase.functions.invoke('tarot-interpretation', {
        body: {
          prompt,
          userId,
          spreadType: 'cup_relationship',
          topic: this.topic
        }
      });
      
      if (error) throw error;
      
      return {
        success: true,
        interpretation: data.interpretation
      };
    } catch (error) {
      console.error('AI 해석 요청 실패:', error);
      return {
        success: false
      };
    }
  }

  /**
   * 관계 패턴 분석
   */
  private analyzeRelationshipPatterns(): string[] {
    const patterns: string[] = [];
    
    // 나와 상대의 조화도
    const myCard = this.cards[0];
    const partnerCard = this.cards[1];
    
    if (myCard && partnerCard) {
      if (myCard.orientation === partnerCard.orientation) {
        patterns.push('두 사람의 감정 상태가 비슷한 파장을 보입니다');
      } else {
        patterns.push('두 사람의 감정 상태에 차이가 있어 조율이 필요합니다');
      }
      
      if (myCard.suit === partnerCard.suit) {
        patterns.push('감정 표현 방식이 유사하여 소통이 원활합니다');
      }
    }
    
    // 의식과 무의식의 일치도
    const myConscious = this.cards[0];
    const myUnconscious = this.cards[3];
    const partnerConscious = this.cards[1];
    const partnerUnconscious = this.cards[4];
    
    if (myConscious?.orientation === myUnconscious?.orientation) {
      patterns.push('질문자의 겉마음과 속마음이 일치합니다');
    } else {
      patterns.push('질문자의 내면에 숨겨진 감정이 있습니다');
    }
    
    if (partnerConscious?.orientation === partnerUnconscious?.orientation) {
      patterns.push('상대방의 마음이 투명하고 일관됩니다');
    } else {
      patterns.push('상대방도 표현하지 못한 감정을 품고 있습니다');
    }
    
    // 컵 카드의 비율 (감정적 요소)
    const cupCards = this.cards.filter(c => c.suit === 'cups').length;
    if (cupCards >= 4) {
      patterns.push('감정적으로 매우 깊은 연결이 있습니다');
    } else if (cupCards <= 1) {
      patterns.push('감정보다는 다른 요소가 관계를 이끌고 있습니다');
    }
    
    return patterns;
  }

  /**
   * 관계 점수 계산
   */
  private calculateRelationshipScore(): number {
    let score = 50; // 기본 점수
    
    // 정방향 카드 보너스
    const uprightCount = this.cards.filter(c => c.orientation === 'upright').length;
    score += uprightCount * 5;
    
    // 나와 상대의 조화 보너스
    if (this.cards[0]?.orientation === this.cards[1]?.orientation) {
      score += 10;
    }
    
    // 미래 카드 보너스/패널티
    if (this.cards[6]?.orientation === 'upright') {
      score += 15;
    } else {
      score -= 5; // 역방향도 성장의 기회이므로 큰 패널티는 없음
    }
    
    // 컵 카드 보너스 (감정적 연결)
    const cupCards = this.cards.filter(c => c.suit === 'cups').length;
    score += cupCards * 3;
    
    // 메이저 아르카나 보너스 (운명적 연결)
    const majorCards = this.cards.filter(c => c.arcana === 'major').length;
    score += majorCards * 2;
    
    // 0-100 범위로 제한
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 핵심 통찰 생성
   */
  private generateKeyInsights(): string[] {
    const insights: string[] = [];
    
    // 나의 마음
    const myCard = this.cards[0];
    if (myCard) {
      insights.push(`당신의 마음: ${myCard.nameKr}${myCard.orientation === 'reversed' ? '(역)' : ''}가 나타내는 ${this.getCardEmotion(myCard)}`);
    }
    
    // 상대의 마음
    const partnerCard = this.cards[1];
    if (partnerCard) {
      insights.push(`상대의 마음: ${partnerCard.nameKr}${partnerCard.orientation === 'reversed' ? '(역)' : ''}가 보여주는 ${this.getCardEmotion(partnerCard)}`);
    }
    
    // 관계의 핵심
    const relationshipCard = this.cards[2];
    if (relationshipCard) {
      insights.push(`관계의 현재: ${this.getRelationshipState(relationshipCard)}`);
    }
    
    // 극복 과제
    const challengeCard = this.cards[5];
    if (challengeCard?.orientation === 'reversed') {
      insights.push('도전: 성장을 위한 기회가 눈앞에 있습니다');
    } else if (challengeCard) {
      insights.push(`도전: ${challengeCard.nameKr}가 제시하는 과제를 함께 극복하세요`);
    }
    
    // 미래 전망
    const futureCard = this.cards[6];
    if (futureCard?.orientation === 'upright') {
      insights.push('미래: 밝고 희망적인 발전이 예상됩니다');
    } else if (futureCard) {
      insights.push('미래: 새로운 관점과 성장의 기회가 기다립니다');
    }
    
    return insights;
  }

  /**
   * 카드의 감정 상태 해석
   */
  private getCardEmotion(card: CardData): string {
    // 수트별 기본 감정
    const suitEmotions: { [key: string]: { upright: string; reversed: string } } = {
      'cups': { upright: '사랑과 충만함', reversed: '감정적 혼란' },
      'wands': { upright: '열정과 활력', reversed: '불안정한 에너지' },
      'swords': { upright: '명료한 생각', reversed: '의구심' },
      'pentacles': { upright: '안정감', reversed: '불안정' }
    };
    
    if (card.suit && suitEmotions[card.suit]) {
      return card.orientation === 'upright' 
        ? suitEmotions[card.suit].upright 
        : suitEmotions[card.suit].reversed;
    }
    
    // 메이저 아르카나는 카드명 기반
    if (card.name === 'The Lovers') {
      return card.orientation === 'upright' ? '진정한 사랑' : '선택의 어려움';
    }
    if (card.name === 'The Empress') {
      return card.orientation === 'upright' ? '풍요로운 애정' : '과도한 집착';
    }
    
    return card.orientation === 'upright' ? '긍정적 감정' : '복잡한 감정';
  }

  /**
   * 관계 상태 해석
   */
  private getRelationshipState(card: CardData): string {
    if (card.suit === 'cups') {
      return card.orientation === 'upright' 
        ? '감정적으로 깊은 연결 상태' 
        : '감정적 조율이 필요한 상태';
    }
    
    if (card.arcana === 'major') {
      return card.orientation === 'upright'
        ? '운명적이고 중요한 시기'
        : '변화와 성장이 필요한 시기';
    }
    
    return card.orientation === 'upright'
      ? '안정적이고 조화로운 상태'
      : '발전을 위한 노력이 필요한 상태';
  }

  /**
   * 종합 요약 생성
   */
  private generateSummary(): string {
    const score = this.calculateRelationshipScore();
    const myCard = this.cards[0];
    const partnerCard = this.cards[1];
    const futureCard = this.cards[6];
    
    let summary = '';
    
    // 점수 기반 전반적 평가
    if (score >= 80) {
      summary += '매우 긍정적이고 발전 가능성이 높은 관계입니다. ';
    } else if (score >= 60) {
      summary += '좋은 잠재력을 가진 관계로, 노력하면 더욱 발전할 수 있습니다. ';
    } else if (score >= 40) {
      summary += '도전과 기회가 공존하는 관계로, 서로의 이해가 필요합니다. ';
    } else {
      summary += '많은 성장과 변화가 필요한 시기이지만, 이는 더 나은 관계를 위한 과정입니다. ';
    }
    
    // 감정 상태 요약
    if (myCard && partnerCard) {
      if (myCard.orientation === 'upright' && partnerCard.orientation === 'upright') {
        summary += '두 사람 모두 긍정적인 감정 상태에 있습니다. ';
      } else if (myCard.orientation !== partnerCard.orientation) {
        summary += '서로의 감정 온도차가 있지만, 이는 조율 가능합니다. ';
      }
    }
    
    // 미래 전망
    if (futureCard?.orientation === 'upright') {
      summary += '앞으로 밝은 미래가 기다리고 있습니다.';
    } else {
      summary += '성장과 변화를 통해 더 깊은 관계로 발전할 수 있습니다.';
    }
    
    return summary;
  }

  /**
   * 조언 생성
   */
  private generateAdvice(): string {
    const challengeCard = this.cards[5];
    const futureCard = this.cards[6];
    const score = this.calculateRelationshipScore();
    
    let advice = '';
    
    // 관계 상태별 조언
    advice += '【관계 상태별 조언】\n';
    advice += '• 솔로인 경우: 자신을 사랑하는 것부터 시작하세요. 준비된 당신에게 좋은 인연이 찾아올 것입니다.\n';
    advice += '• 썸/짝사랑 중인 경우: 진심을 전달할 적절한 시기를 기다리되, 너무 오래 망설이지는 마세요.\n';
    advice += '• 연인인 경우: 서로의 차이를 인정하고 함께 성장하는 관계를 만들어가세요.\n\n';
    
    // 도전 과제 기반 조언
    if (challengeCard) {
      advice += '【극복 포인트】\n';
      if (challengeCard.orientation === 'reversed') {
        advice += '현재의 어려움은 일시적입니다. 서로를 믿고 소통하면 극복할 수 있습니다.\n';
      } else {
        advice += `${challengeCard.nameKr}가 제시하는 과제를 함께 해결해 나가세요.\n`;
      }
    }
    
    // 점수 기반 조언
    if (score >= 70) {
      advice += '\n좋은 에너지가 흐르고 있으니 자신감을 가지세요.';
    } else if (score >= 50) {
      advice += '\n꾸준한 노력과 인내로 관계를 발전시켜 나가세요.';
    } else {
      advice += '\n지금은 자기 성찰과 성장의 시간이 필요합니다.';
    }
    
    return advice;
  }

  /**
   * 폴백 해석 (AI 실패 시)
   */
  private generateFallbackInterpretation(): string {
    let interpretation = `💕 컵 오브 릴레이션쉽이 전하는 관계의 메시지 💕\n\n`;
    
    interpretation += `7장의 카드가 당신의 관계를 비추고 있습니다.\n\n`;
    
    // 카드 나열
    this.cards.forEach((card, index) => {
      interpretation += `${this.positions[index].name}: ${card.nameKr}`;
      interpretation += card.orientation === 'upright' ? '\n' : ' (역방향)\n';
    });
    
    interpretation += `\n${this.generateSummary()}\n\n`;
    
    const insights = this.generateKeyInsights();
    if (insights.length > 0) {
      interpretation += `핵심 통찰:\n`;
      insights.forEach(insight => {
        interpretation += `• ${insight}\n`;
      });
      interpretation += '\n';
    }
    
    interpretation += this.generateAdvice();
    
    const score = this.calculateRelationshipScore();
    interpretation += `\n\n관계 점수: ${score}/100`;
    
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
}
