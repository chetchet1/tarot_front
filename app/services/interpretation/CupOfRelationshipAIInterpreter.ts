/**
 * 컵 오브 릴레이션십 AI 해석 서비스
 * Edge Function 활용
 */

import { supabase } from '@/services/supabase';

export interface CupRelationshipCard {
  id: string;
  name: string;
  nameKr: string;
  arcana: 'major' | 'minor';
  number?: number;
  suit?: string;
  orientation: 'upright' | 'reversed';
  position?: {
    name: string;
    description: string;
  };
}

export interface CupRelationshipInterpretation {
  aiInterpretation: string;
  summary?: string;
  advice?: string;
  relationshipScore?: number;
  keyInsights?: string[];
  timestamp: Date;
}

export class CupOfRelationshipAIInterpreter {
  private cards: CupRelationshipCard[] = [];
  private topic: string = 'love';
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
  
  constructor() {}
  
  /**
   * 카드 데이터 설정
   */
  public setCards(cardsData: any[]): void {
    this.cards = cardsData.map((data, index) => ({
      id: data.card?.id || data.id,
      name: data.card?.name || data.name || data.nameEn,
      nameKr: data.card?.nameKr || data.nameKr || data.name_kr,
      arcana: data.card?.arcana || data.arcana,
      number: data.card?.number || data.number,
      suit: data.card?.suit || data.suit,
      orientation: data.orientation,
      position: this.positions[index]
    }));
  }
  
  /**
   * 관계 상태 설정
   */
  public setRelationshipStatus(status: string): void {
    this.relationshipStatus = status;
  }
  
  /**
   * 커스텀 질문 설정
   */
  public setCustomQuestion(question: string): void {
    this.customQuestion = question;
  }
  
  /**
   * AI 해석 생성
   */
  public async generateInterpretation(userId?: string): Promise<{ 
    success: boolean; 
    interpretation: CupRelationshipInterpretation | null;
    error?: string;
  }> {
    try {
      console.log('[CupRelationshipAI] 해석 생성 시작');
      console.log('[CupRelationshipAI] 카드:', this.cards);
      console.log('[CupRelationshipAI] 관계 상태:', this.relationshipStatus);
      console.log('[CupRelationshipAI] 커스텀 질문:', this.customQuestion);
      
      // 프롬프트 생성
      const customPrompt = this.generateAIPrompt();
      
      // Edge Function 호출
      const { data, error } = await supabase.functions.invoke('generate-interpretation', {
        body: {
          cards: this.cards.map(card => ({
            ...card,
            name_kr: card.nameKr // Edge Function이 기대하는 형식
          })),
          topic: 'love',
          spreadType: 'cup_of_relationship',
          isPremium: true,
          userId,
          customQuestion: this.customQuestion,
          customPrompt: customPrompt,
          relationshipStatus: this.relationshipStatus
        }
      });
      
      if (error) {
        console.error('[CupRelationshipAI] Edge Function 오류:', error);
        throw error;
      }
      
      console.log('[CupRelationshipAI] Edge Function 응답:', data);
      
      // 응답 파싱
      const interpretation: CupRelationshipInterpretation = {
        aiInterpretation: data.interpretation || this.generateFallbackInterpretation(),
        summary: data.summary || this.generateSummary(),
        advice: data.advice || this.generateAdvice(),
        relationshipScore: data.relationshipScore || this.calculateRelationshipScore(),
        keyInsights: data.keyInsights || this.generateKeyInsights(),
        timestamp: new Date()
      };
      
      return {
        success: true,
        interpretation
      };
    } catch (error) {
      console.error('[CupRelationshipAI] 해석 생성 실패:', error);
      return {
        success: false,
        interpretation: {
          aiInterpretation: this.generateFallbackInterpretation(),
          summary: this.generateSummary(),
          advice: this.generateAdvice(),
          relationshipScore: this.calculateRelationshipScore(),
          keyInsights: this.generateKeyInsights(),
          timestamp: new Date()
        },
        error: error.message
      };
    }
  }
  
  /**
   * 관계 점수 계산 (11장 기준)
   */
  private calculateRelationshipScore(): number {
    let score = 50;
    
    // 정방향 카드 보너스
    const uprightCount = this.cards.filter(c => c.orientation === 'upright').length;
    score += uprightCount * 3; // 11장이므로 비율 조정
    
    // 나와 상대의 조화 (카드 0,1)
    if (this.cards[0]?.orientation === this.cards[1]?.orientation) {
      score += 10;
    }
    
    // 미래 생각의 조화 (카드 8,9)
    if (this.cards[8]?.orientation === 'upright' && this.cards[9]?.orientation === 'upright') {
      score += 10;
    }
    
    // 최종 결과 카드 보너스 (카드 10)
    if (this.cards[10]?.orientation === 'upright') {
      score += 15;
    }
    
    // 컵 카드 보너스
    const cupCards = this.cards.filter(c => c.suit === 'cups').length;
    score += cupCards * 2;
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * 핵심 통찰 생성 (11장 기준)
   */
  private generateKeyInsights(): string[] {
    const insights: string[] = [];
    
    // 나의 현재 상태
    if (this.cards[0]) {
      insights.push(`당신의 현재: ${this.cards[0].nameKr} - ${this.cards[0].orientation === 'upright' ? '긍정적 에너지' : '조심스러운 마음'}`);
    }
    
    // 상대의 현재 상태
    if (this.cards[1]) {
      insights.push(`상대의 현재: ${this.cards[1].nameKr} - ${this.cards[1].orientation === 'upright' ? '호의적 신호' : '복잡한 감정'}`);
    }
    
    // 관계의 현재 상태
    if (this.cards[4]) {
      insights.push(`현재 관계: ${this.cards[4].nameKr} - ${this.cards[4].orientation === 'upright' ? '안정적인 흐름' : '주의가 필요'}`);
    }
    
    // 최종 결과
    if (this.cards[10]) {
      insights.push(`결과 전망: ${this.cards[10].nameKr} - ${this.cards[10].orientation === 'upright' ? '밝은 미래' : '노력이 필요'}`);
    }
    
    return insights;
  }
  
  /**
   * 요약 생성
   */
  private generateSummary(): string {
    const score = this.calculateRelationshipScore();
    
    if (score >= 80) {
      return '매우 긍정적이고 발전 가능성이 높은 관계입니다. 서로의 마음이 잘 통하고 있습니다.';
    } else if (score >= 60) {
      return '좋은 잠재력을 가진 관계입니다. 서로를 이해하려는 노력이 더해진다면 더욱 발전할 수 있습니다.';
    } else if (score >= 40) {
      return '도전과 기회가 공존하는 관계입니다. 소통과 이해를 통해 관계를 개선할 수 있습니다.';
    } else {
      return '현재 어려움이 있지만, 이는 성장의 기회가 될 수 있습니다. 자신을 먼저 돌아보는 시간이 필요합니다.';
    }
  }
  
  /**
   * 조언 생성 (11장 기준)
   */
  private generateAdvice(): string {
    const currentThinkMe = this.cards[6]; // 현재 나는 어떻게 생각?
    const currentThinkPartner = this.cards[7]; // 현재 상대는 어떻게 생각?
    const futureThinkMe = this.cards[8]; // 미래 나는 어떻게 생각?
    const futureThinkPartner = this.cards[9]; // 미래 상대는 어떻게 생각?
    const result = this.cards[10]; // 결과
    
    let advice = '';
    
    if (this.relationshipStatus === 'couple') {
      advice = '현재 연인과의 관계를 더욱 깊게 발전시키기 위해 ';
    } else if (this.relationshipStatus === 'interested') {
      advice = '관심 있는 상대와의 관계를 발전시키기 위해 ';
    } else {
      advice = '새로운 인연을 만나거나 관계를 개선하기 위해 ';
    }
    
    // 현재 생각의 차이가 있는 경우
    if (currentThinkMe?.orientation !== currentThinkPartner?.orientation) {
      advice += '서로의 입장 차이를 이해하고 소통을 강화하세요. ';
    } else {
      advice += '서로의 마음이 통하고 있으니 자신감을 가지세요. ';
    }
    
    // 미래 전망에 따른 조언
    if (futureThinkMe?.orientation === 'upright' && futureThinkPartner?.orientation === 'upright') {
      advice += '미래가 밝고 희망적입니다. ';
    } else {
      advice += '인내심을 갖고 서로를 이해하려 노력하세요. ';
    }
    
    // 최종 결과에 따른 조언
    if (result?.orientation === 'upright') {
      advice += '우주가 당신의 사랑을 축복하고 있습니다.';
    } else {
      advice += '어려움이 있어도 진실한 마음이 결국 길을 열 것입니다.';
    }
    
    return advice;
  }
  
  /**
   * AI용 프롬프트 생성
   */
  private generateAIPrompt(): string {
    let prompt = `당신은 경험 많은 타로 마스터입니다. 컵 오브 릴레이션십 배열법으로 `;
    
    // 커스텀 질문이 있는 경우 우선 처리
    if (this.customQuestion && this.customQuestion.trim()) {
      prompt += `다음 질문에 대한 깊이 있는 관계 해석을 제공해주세요.\n\n`;
      prompt += `【질문자의 구체적 질문】\n${this.customQuestion}\n\n`;
    } else {
      prompt += `연애와 관계에 대한 깊이 있는 해석을 제공해주세요.\n\n`;
    }
    
    // 관계 상태에 따른 지침
    if (this.relationshipStatus === 'couple') {
      prompt += `【중요】 질문자는 현재 연인이 있습니다.\n`;
      prompt += `현재 관계의 발전과 미래에 초점을 맞춰주세요.\n\n`;
    } else if (this.relationshipStatus === 'interested') {
      prompt += `【중요】 질문자는 관심 있는 상대가 있습니다.\n`;
      prompt += `상대방의 마음과 관계 발전 가능성에 초점을 맞춰주세요.\n\n`;
    } else if (this.relationshipStatus === 'single') {
      prompt += `【중요】 질문자는 현재 솔로입니다.\n`;
      prompt += `새로운 만남과 연애 기회에 초점을 맞춰주세요.\n\n`;
    }
    
    prompt += `【컵 오브 릴레이션십 카드 배열 (11장)】\n`;
    this.cards.forEach((card, index) => {
      const position = this.positions[index];
      prompt += `${index + 1}. ${position.name}: ${card.nameKr} - ${card.orientation === 'upright' ? '정방향' : '역방향'}\n`;
    });
    prompt += '\n';
    
    prompt += `【응답 지침】\n`;
    prompt += `• 11장 전체의 흐름을 고려한 종합적 해석\n`;
    prompt += `• 나와 상대의 생각 차이를 명확히 분석\n`;
    prompt += `• 현재와 미래의 변화를 구체적으로 설명\n`;
    prompt += `• 3-4개 문단으로 자연스럽게 작성\n`;
    prompt += `• 마지막에 "✨ 종합 메시지" 추가\n`;
    
    return prompt;
  }
  
  /**
   * 폴백 해석 생성 (11장 기준)
   */
  private generateFallbackInterpretation(): string {
    let interpretation = `💕 컵 오브 릴레이션십 해석 💕\n\n`;
    
    // 각 포지션별 카드 설명
    this.cards.forEach((card, index) => {
      const position = this.positions[index];
      if (position) {
        interpretation += `【${position.name}】\n`;
        interpretation += `${card.nameKr} - ${card.orientation === 'upright' ? '정방향' : '역방향'}\n`;
        interpretation += `${position.description}\n\n`;
      }
    });
    
    // 관계 점수
    const score = this.calculateRelationshipScore();
    interpretation += `\n💝 관계 점수: ${score}/100\n\n`;
    
    // 요약
    interpretation += `【종합 해석】\n`;
    interpretation += this.generateSummary() + '\n\n';
    
    // 조언
    interpretation += `【조언】\n`;
    interpretation += this.generateAdvice();
    
    return interpretation;
  }
}
