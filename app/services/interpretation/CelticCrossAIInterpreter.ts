/**
 * 캘틱 크로스 AI 인터프리터
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

export interface CelticCrossInterpretation {
  aiInterpretation: string;  // AI 해석 (필수)
  summary: string;           // 종합 요약
  advice: string;            // 구체적 조언
  keyInsights?: {           // 핵심 통찰
    present: string;
    challenge: string;
    outcome: string;
  };
  timelineAnalysis?: {      // 시간대별 분석
    past: string;
    present: string;
    future: string;
  };
  // 카테고리별 답변 추가
  categories?: {
    핵심메시지?: string;      // 간단명료한 핵심 메시지
    심층분석?: string;        // 상세한 심층 분석
    실천조언?: string;        // 구체적인 실천 조언
  };
  timestamp: Date;
}

export class CelticCrossAIInterpreter {
  private cards: CardData[] = [];
  private topic: string = 'general';
  private customQuestion?: string;
  private relationshipStatus?: string;
  
  // 캘틱 크로스 배열법의 10개 포지션
  private readonly positions = [
    { name: '현재 상황', description: '현재 직면한 상황과 중심 에너지' },
    { name: '도전/십자가', description: '극복해야 할 도전이나 영향력' },
    { name: '먼 과거', description: '상황의 근원이 된 과거의 영향' },
    { name: '가까운 과거', description: '최근에 일어난 관련 사건' },
    { name: '가능한 미래', description: '현재 경로를 따를 때의 가능한 결과' },
    { name: '가까운 미래', description: '곧 일어날 일이나 다음 단계' },
    { name: '당신의 접근', description: '상황에 대한 당신의 태도와 접근법' },
    { name: '외부 영향', description: '주변 환경과 타인의 영향' },
    { name: '희망과 두려움', description: '내면의 희망과 두려움' },
    { name: '최종 결과', description: '현재 경로의 최종적인 결과' }
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
  public async generateInterpretation(userId?: string): Promise<{ success: boolean; interpretation: CelticCrossInterpretation | string }> {
    try {
      console.log('[CelticCross AI] 해석 생성 시작');
      console.log('[CelticCross AI] 카드 데이터:', this.cards);
      console.log('[CelticCross AI] 주제:', this.topic);
      console.log('[CelticCross AI] userId:', userId);
      
      // AI 해석 요청 (단일 호출)
      const aiResponse = await this.requestAIInterpretation(userId);
      
      if (!aiResponse.success || !aiResponse.interpretation) {
        console.error('[CelticCross AI] AI 해석 요청 실패');
        throw new Error('AI 해석 생성 실패');
      }
      
      console.log('[CelticCross AI] AI 해석 생성 성공');
      
      // AI 응답에서 # 기호 제거
      const cleanedInterpretation = this.removeHashSymbols(aiResponse.interpretation);
      
      // 종합 요약과 조언 생성
      const summary = this.generateSummary();
      const advice = this.generateAdvice();
      const keyInsights = this.generateKeyInsights();
      const timelineAnalysis = this.generateTimelineAnalysis();
      
      const interpretation: CelticCrossInterpretation = {
        aiInterpretation: cleanedInterpretation,
        summary,
        advice,
        keyInsights,
        timelineAnalysis,
        timestamp: new Date()
      };
      
      return {
        success: true,
        interpretation
      };
    } catch (error) {
      console.error('[CelticCross AI] 해석 생성 오류:', error);
      
      // 에러 시 기본 해석 반환
      return {
        success: false,
        interpretation: this.generateFallbackInterpretation()
      };
    }
  }

  /**
   * AI 해석 요청 (단일 호출)
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
        spreadType: 'celtic_cross',
        userId,
        isPremium: true,
        customQuestion: this.customQuestion,
        customPrompt: customPrompt,
        relationshipStatus: this.relationshipStatus
      }, 'CelticCross');

      return { success: true, interpretation };
    } catch (error) {
      console.error('[CelticCross AI] AI 해석 요청 실패:', error);
      return { success: false };
    }
  }
  

  
  /**
   * AI용 프롬프트 생성
   */
  private generateAIPrompt(): string {
    let prompt = `당신은 경험 많은 타로 마스터입니다. `;
    
    // 커스텀 질문이 있는 경우
    if (this.customQuestion && this.customQuestion.trim()) {
      prompt += `캘틱 크로스 배열법으로 다음 질문에 대한 명확하고 깊이 있는 답변을 제공해주세요.\n\n`;
      prompt += `【질문자의 구체적 질문】\n"${this.customQuestion}"\n\n`;
      prompt += `【답변 우선순위】\n`;
      prompt += `1. 첫 문장에서 반드시 질문에 대한 직접적인 답변을 제시하세요\n`;
      prompt += `2. 질문의 핵심 키워드를 자연스럽게 반복 사용하세요\n`;
      prompt += `3. 일반적인 조언이 아닌 질문과 관련된 구체적인 해석만 제공하세요\n\n`;
    } else if (this.topic !== 'custom') {
      prompt += `캘틱 크로스 배열법으로 ${this.topic}에 대한 깊이 있는 해석을 제공해주세요.\n\n`;
    } else {
      prompt += `캘틱 크로스 배열법으로 전반적인 운세에 대한 해석을 제공해주세요.\n\n`;
    }
    
    // 연애 카테고리 처리
    if (!this.customQuestion && (this.topic === '연애' || this.topic === 'love')) {
      if (this.relationshipStatus === 'single') {
        prompt += `질문자는 현재 솔로입니다. 새로운 만남과 연애 기회에 초점을 맞춰주세요.\n\n`;
      } else if (this.relationshipStatus === 'couple') {
        prompt += `질문자는 현재 연인이 있습니다. 관계 발전과 미래에 초점을 맞춰주세요.\n\n`;
      }
    }
    
    prompt += `【캘틱 크로스 카드 배열】\n`;
    this.cards.forEach((card, index) => {
      const pos = this.positions[index];
      prompt += `${index + 1}. ${pos.name}: ${card.nameKr} (${card.orientation === 'upright' ? '정방향' : '역방향'})\n`;
    });
    prompt += '\n';
    
    // 핵심 포지션 분석
    prompt += `【핵심 카드 의미】\n`;
    prompt += `• 현재 상황: ${this.cards[0]?.nameKr} - 중심 에너지\n`;
    prompt += `• 도전/십자가: ${this.cards[1]?.nameKr} - 극복해야 할 것\n`;
    prompt += `• 최종 결과: ${this.cards[9]?.nameKr} - 예상되는 결말\n\n`;
    
    // 시간대별 흐름
    prompt += `【시간의 흐름】\n`;
    prompt += `• 과거: ${this.cards[2]?.nameKr}(먼 과거), ${this.cards[3]?.nameKr}(가까운 과거)\n`;
    prompt += `• 현재: ${this.cards[0]?.nameKr}(상황), ${this.cards[6]?.nameKr}(접근법)\n`;
    prompt += `• 미래: ${this.cards[5]?.nameKr}(가까운 미래), ${this.cards[4]?.nameKr}(가능한 미래)\n\n`;
    
    // 응답 형식 지침
    prompt += `【응답 형식】\n`;
    
    if (this.customQuestion && this.customQuestion.trim()) {
      prompt += `첫 문장에서 "${this.customQuestion}"에 대한 명확한 답변을 제시하세요.\n\n`;
    }
    
    prompt += `다음과 같은 형식으로 작성하세요:\n\n`;
    prompt += `🌟 핵심 통찰\n`;
    prompt += `(현재 상황과 도전 카드가 보여주는 핵심 메시지를 3-4문장으로 설명)\n\n`;
    prompt += `⏰ 시간의 흐름\n`;
    prompt += `(과거가 현재에 미친 영향과 미래로의 연결을 3-4문장으로 설명)\n\n`;
    prompt += `✨ 기회와 가능성\n`;
    prompt += `(가능한 미래와 희망 카드가 보여주는 긍정적 요소를 3-4문장으로 설명)\n\n`;
    prompt += `🔍 숨겨진 요소\n`;
    prompt += `(외부 영향과 내면의 희망/두려움이 암시하는 것을 3-4문장으로 설명)\n\n`;
    prompt += `🎯 예상되는 결과\n`;
    prompt += `(최종 결과 카드를 중심으로 예상되는 결말을 3-4문장으로 설명)\n\n`;
    prompt += `💡 조언과 지침\n`;
    prompt += `(구체적이고 실천 가능한 조언을 3가지 제시)\n\n`;
    prompt += `🌟 마무리 조언\n`;
    prompt += `(전체 카드의 흐름을 종합한 따뜻한 격려와 응원의 메시지를 2-3문장으로. 이 섹션이 해석의 최종 마무리이므로, 카카오톡 공유 시 "핵심 메시지"로 표시됩니다. 핵심을 담은 아름다운 문장으로 마무리하세요.)\n\n`;

    prompt += `각 섹션은 이모지와 제목을 먼저 쓰고 줄바꿈 후 내용을 작성하세요.\n`;
    prompt += `전체 길이는 1000-1200자 정도로 충실하게 작성하세요.\n`;
    prompt += `절대 "원하시면 ~도 만들어 드리겠습니다"나 "추가로 ~해 드릴까요?" 같은 후속 제안을 하지 마세요. 해석을 전하고 깔끔하게 끝내세요.`;
    
    return prompt;
  }

  /**
   * # 기호 제거
   */
  private removeHashSymbols(text: string): string {
    return text.replace(/#{1,6}\s*/g, '');
  }

  /**
   * 종합 요약 생성
   */
  private generateSummary(): string {
    const present = this.cards[0];
    const challenge = this.cards[1];
    const outcome = this.cards[9];
    
    let summary = `현재 ${present?.nameKr} 카드가 나타내는 `;
    summary += present?.orientation === 'upright' ? '긍정적인 에너지가 ' : '도전적인 상황이 ';
    summary += `펼쳐지고 있습니다. `;
    
    summary += `${challenge?.nameKr} 카드가 보여주는 `;
    summary += challenge?.orientation === 'upright' ? '성장의 기회를 ' : '극복해야 할 과제를 ';
    summary += `마주하고 있으며, `;
    
    summary += `최종적으로 ${outcome?.nameKr} 카드가 예시하는 `;
    summary += outcome?.orientation === 'upright' ? '희망적인 결과' : '예상치 못한 전개';
    summary += `가 기다리고 있습니다.`;
    
    return summary;
  }

  /**
   * 조언 생성
   */
  private generateAdvice(): string {
    const approach = this.cards[6];
    const advice = this.cards[5];
    
    let adviceText = '';
    
    if (approach?.orientation === 'upright') {
      adviceText += '현재의 접근 방식을 유지하면서 ';
    } else {
      adviceText += '접근 방식을 재고하고 ';
    }
    
    if (advice?.orientation === 'upright') {
      adviceText += '적극적으로 기회를 활용하세요. ';
    } else {
      adviceText += '신중하게 상황을 관찰하세요. ';
    }
    
    adviceText += '과거의 경험을 바탕으로 현재를 이해하고, 미래를 향해 나아가세요.';
    
    return adviceText;
  }

  /**
   * 핵심 통찰 생성
   */
  private generateKeyInsights(): { present: string; challenge: string; outcome: string } {
    return {
      present: `${this.cards[0]?.nameKr} 카드가 보여주는 현재의 핵심`,
      challenge: `${this.cards[1]?.nameKr} 카드가 나타내는 도전 과제`,
      outcome: `${this.cards[9]?.nameKr} 카드가 예시하는 최종 결과`
    };
  }

  /**
   * 시간대별 분석 생성
   */
  private generateTimelineAnalysis(): { past: string; present: string; future: string } {
    return {
      past: `과거의 ${this.cards[2]?.nameKr}와 ${this.cards[3]?.nameKr}가 현재에 미친 영향`,
      present: `${this.cards[0]?.nameKr}가 나타내는 현재 상황과 ${this.cards[6]?.nameKr}의 접근법`,
      future: `${this.cards[5]?.nameKr}를 거쳐 ${this.cards[4]?.nameKr}로 향하는 미래`
    };
  }

  /**
   * 포지션 이름 반환
   */
  public getPositionName(index: number): string {
    return this.positions[index]?.name || `포지션 ${index + 1}`;
  }

  /**
   * 폴백 해석 생성
   */
  private generateFallbackInterpretation(): string {
    let interpretation = '캘틱 크로스가 전하는 메시지\n\n';
    
    this.cards.forEach((card, index) => {
      const position = this.positions[index];
      interpretation += `${position.name}: ${card.nameKr} (${card.orientation === 'upright' ? '정방향' : '역방향'})\n`;
      interpretation += `${position.description}\n\n`;
    });
    
    interpretation += '\n✨ 카드들이 보여주는 전체적인 흐름을 통해 당신의 상황을 이해하고 앞으로 나아갈 방향을 찾으세요.';
    
    return interpretation;
  }

  
  /**
   * 패턴 분석
   */
  private analyzePatterns(): string[] {
    const patterns: string[] = [];
    
    // 정/역방향 비율
    const uprightCount = this.cards.filter(c => c.orientation === 'upright').length;
    const reversedCount = this.cards.length - uprightCount;
    
    if (uprightCount >= 7) {
      patterns.push('전반적으로 긍정적인 에너지가 우세합니다');
    } else if (reversedCount >= 7) {
      patterns.push('변화와 성장의 기회가 많이 나타나고 있습니다');
    } else {
      patterns.push('균형잡힌 에너지가 흐르고 있습니다');
    }
    
    // 메이저/마이너 비율
    const majorCount = this.cards.filter(c => c.arcana === 'major').length;
    if (majorCount >= 5) {
      patterns.push('운명적이고 중요한 전환기에 있습니다');
    } else if (majorCount <= 2) {
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
}
