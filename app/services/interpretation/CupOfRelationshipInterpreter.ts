/**
 * 컵 오브 릴레이션쉽 인터프리터
 * AI 연동 기반 관계 해석 서비스
 */

import { supabase } from '@/services/supabase';
import { logger } from '@/services/debugLogger';
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
  private relationshipStatus?: string;
  
  // 컵 오브 릴레이션십 포지션 정의 (11장)
  private readonly positions = [
    { name: '나', description: '나의 현재 감정과 상태' },
    { name: '상대', description: '상대방의 현재 감정과 상태' },
    { name: '관계 기본', description: '두 사람 관계의 기본적인 성향' },
    { name: '관계 과거', description: '과거의 관계 상태' },
    { name: '현재 느낌', description: '현재 두 사람의 관계 상태' },
    { name: '현재 외부 상황', description: '관계에 영향을 미치는 외부 요인' },
    { name: '현재 나는 어떻게 생각?', description: '현재 관계에 대한 나의 생각' },
    { name: '현재 상대는 어떻게 생각?', description: '현재 관계에 대한 상대의 생각' },
    { name: '미래 나는 어떻게 생각?', description: '미래에 나는 어떻게 생각할지' },
    { name: '미래 상대는 어떻게 생각?', description: '미래에 상대는 어떻게 생각할지' },
    { name: '결과', description: '관계의 최종 결과' }
  ];

  constructor(cards?: CardData[], topic: string = '연애', customQuestion?: string) {
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
  public async generateInterpretation(userId?: string): Promise<{ success: boolean; interpretation: CupRelationshipInterpretation | string }> {
    try {
      console.log('[CupRelationship] AI 해석 생성 시작');
      console.log('[CupRelationship] 카드 데이터:', this.cards);
      console.log('[CupRelationship] 주제:', this.topic);
      console.log('[CupRelationship] userId:', userId);
      
      // AI 해석 요청
      const aiResponse = await this.requestAIInterpretation(userId);
      
      if (!aiResponse.success || !aiResponse.interpretation) {
        console.error('[CupRelationship] AI 해석 요청 실패');
        throw new Error('AI 해석 생성 실패');
      }
      
      console.log('[CupRelationship] AI 해석 생성 성공');
      
      // AI 응답에서 # 기호 제거
      const cleanedInterpretation = this.removeHashSymbols(aiResponse.interpretation);
      
      // 추가 분석 생성
      const summary = this.generateSummary();
      const advice = this.generateAdvice();
      const relationshipScore = this.calculateRelationshipScore();
      const keyInsights = this.generateKeyInsights();
      
      const interpretation: CupRelationshipInterpretation = {
        aiInterpretation: cleanedInterpretation,
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
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.log('[CupRelationship] 해석 생성 오류: ' + errMsg);
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
    let prompt = `당신은 경험 많은 타로 마스터이자 연애 전문 상담가입니다. `;
    
    // 커스텀 질문이 있는 경우
    if (this.customQuestion && this.customQuestion.trim()) {
      prompt += `컵 오브 릴레이션쉽 배열법으로 다음 연애 질문에 대한 명확하고 깊이 있는 답변을 제공해주세요.\n\n`;
      prompt += `【질문자의 구체적 질문】\n"${this.customQuestion}"\n\n`;
      prompt += `【답변 우선순위】\n`;
      prompt += `1. 첫 문장에서 반드시 질문에 대한 직접적인 답변을 제시하세요\n`;
      prompt += `2. 질문의 핵심 키워드를 자연스럽게 반복 사용하세요\n`;
      prompt += `3. 일반적인 관계 조언이 아닌 질문과 관련된 구체적인 해석만 제공하세요\n\n`;
    } else {
      prompt += `컵 오브 릴레이션쉽 배열법으로 연애와 관계에 대한 깊이 있는 해석을 제공해주세요.\n\n`;
    }
    
    // 연애 상태 반영
    prompt += `【관계 상태】\n`;
    if (this.relationshipStatus === 'couple') {
      prompt += `질문자는 현재 연인이 있는 상태입니다. 현재 관계의 깊이, 발전 가능성, 결혼까지의 여정에 초점을 맞춰주세요.\n\n`;
    } else {
      prompt += `질문자는 마음에 둔 상대가 있거나 썸타는 단계입니다. 상대의 진심, 고백 타이밍, 관계 발전 가능성에 초점을 맞춰주세요.\n\n`;
    }
    
    prompt += `【컵 오브 릴레이션쉽 카드 배열 (11장)】\n`;
    this.cards.forEach((card, index) => {
      const pos = this.positions[index];
      prompt += `${index + 1}. ${pos.name}: ${card.nameKr} (${card.orientation === 'upright' ? '정방향' : '역방향'})\n`;
    });
    prompt += '\n';
    
    // 핵심 카드 분석
    prompt += `【핵심 카드 의미】\n`;
    prompt += `• 나의 마음: ${this.cards[0]?.nameKr} - 나의 현재 감정 상태\n`;
    prompt += `• 상대의 마음: ${this.cards[1]?.nameKr} - 상대방의 현재 감정 상태\n`;
    prompt += `• 관계의 기본: ${this.cards[2]?.nameKr} - 두 사람의 기본적 연결고리\n`;
    prompt += `• 최종 결과: ${this.cards[10]?.nameKr} - 예상되는 관계의 미래\n\n`;
    
    // 응답 형식 지침
    prompt += `【응답 형식】\n`;
    
    if (this.customQuestion && this.customQuestion.trim()) {
      prompt += `첫 문장에서 "${this.customQuestion}"에 대한 명확한 답변을 제시하세요.\n\n`;
    }
    
    prompt += `다음과 같은 형식으로 작성하세요:\n\n`;
    prompt += `👥 관계의 역학\n`;
    prompt += `(나와 상대의 현재 감정 상태와 관계 역학을 3-4문장으로 설명)\n\n`;
    prompt += `💖 감정의 흐름\n`;
    prompt += `(과거부터 현재까지의 감정 변화와 앞으로의 흐름을 3-4문장으로 설명)\n\n`;
    prompt += `✨ 관계의 강점\n`;
    prompt += `(두 사람 사이의 긍정적 요소와 발전 가능성을 3-4문장으로 설명)\n\n`;
    prompt += `🔮 미래 전망\n`;
    prompt += `(3개월, 6개월 후의 관계 전망을 구체적으로 3-4문장으로 설명)\n\n`;
    prompt += `💡 조언과 지침\n`;
    prompt += `(관계 발전을 위한 구체적이고 실천 가능한 조언을 3가지 제시)\n\n`;
    
    if (this.relationshipStatus === 'couple') {
      prompt += `💑 관계 발전 팁\n`;
      prompt += `(더 깊은 사랑으로 나아가기 위한 구체적 방법을 2-3문장으로)\n\n`;
    } else {
      prompt += `💘 고백 타이밍\n`;
      prompt += `(언제, 어떻게 마음을 전하면 좋을지 구체적으로 2-3문장으로)\n\n`;
    }
    
    prompt += `🌟 종합 메시지\n`;
    prompt += `(전체 카드의 흐름을 종합한 따뜻한 격려와 응원의 메시지를 2-3문장으로. 이 섹션이 해석의 최종 마무리이므로, 카카오톡 공유 시 "핵심 메시지"로 표시됩니다. 핵심을 담은 아름다운 문장으로 마무리하세요.)\n\n`;

    prompt += `각 섹션은 이모지와 제목을 먼저 쓰고 줄바꿈 후 내용을 작성하세요.\n`;
    prompt += `전체 길이는 1000-1200자 정도로 충실하게 작성하세요.\n`;
    prompt += `연애와 관계에만 집중하고, 직업이나 돈 같은 다른 주제는 절대 언급하지 마세요.\n`;
    prompt += `절대 "원하시면 ~도 만들어 드리겠습니다"나 "추가로 ~해 드릴까요?" 같은 후속 제안을 하지 마세요. 해석을 전하고 깔끔하게 끝내세요.`;
    
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
        topic: this.topic === '연애' ? 'love' : this.topic,
        spreadType: 'cup_of_relationship',
        userId,
        isPremium: true,
        customQuestion: this.customQuestion,
        customPrompt: customPrompt
      }, 'CupRelationship');

      return { success: true, interpretation };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.log('[CupRelationship] AI 해석 요청 실패: ' + errMsg);
      console.error('[CupRelationship] AI 해석 요청 실패:', error);
      return { success: false };
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
