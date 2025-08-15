/**
 * 캘틱 크로스 AI 인터프리터
 * AI 연동 기반 타로 해석 서비스
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
      
      // 카테고리별 AI 해석 요청
      const categories = await this.requestCategorizedInterpretation(userId);
      
      // 전체 AI 해석 생성 (기존 방식 유지 + 카테고리 통합)
      const fullInterpretation = this.combineInterpretations(categories);
      
      // 종합 요약과 조언 생성
      const summary = this.generateSummary();
      const advice = this.generateAdvice();
      const keyInsights = this.generateKeyInsights();
      const timelineAnalysis = this.generateTimelineAnalysis();
      
      const interpretation: CelticCrossInterpretation = {
        aiInterpretation: fullInterpretation,
        summary,
        advice,
        keyInsights,
        timelineAnalysis,
        categories,  // 카테고리별 답변 추가
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
   * 카테고리별 AI 해석 요청
   */
  private async requestCategorizedInterpretation(userId?: string): Promise<any> {
    const categories: any = {};
    
    try {
      // 1. 핵심 메시지 요청
      const corePrompt = this.generateCoreMessagePrompt();
      const coreResponse = await this.callAIFunction({
        cards: this.cards,
        spreadType: 'celtic_cross',
        topic: this.topic,
        customQuestion: this.customQuestion,
        customPrompt: corePrompt,
        userId: userId,
        isPremium: true
      });
      categories.핵심메시지 = this.removeHashSymbols(coreResponse.data?.interpretation || this.generateDefaultCoreMessage());
      
      // 2. 심층 분석 요청
      const deepPrompt = this.generateDeepAnalysisPrompt();
      const deepResponse = await this.callAIFunction({
        cards: this.cards,
        spreadType: 'celtic_cross',
        topic: this.topic,
        customQuestion: this.customQuestion,
        customPrompt: deepPrompt,
        userId: userId,
        isPremium: true
      });
      categories.심층분석 = this.removeHashSymbols(deepResponse.data?.interpretation || this.generateDefaultDeepAnalysis());
      
      // 3. 실천 조언 요청
      const actionPrompt = this.generateActionAdvicePrompt();
      const actionResponse = await this.callAIFunction({
        cards: this.cards,
        spreadType: 'celtic_cross',
        topic: this.topic,
        customQuestion: this.customQuestion,
        customPrompt: actionPrompt,
        userId: userId,
        isPremium: true
      });
      categories.실천조언 = this.removeHashSymbols(actionResponse.data?.interpretation || this.generateDefaultActionAdvice());
      
    } catch (error) {
      console.error('[CelticCross AI] 카테고리별 해석 오류:', error);
      // 에러 시 기본값 사용
      categories.핵심메시지 = this.generateDefaultCoreMessage();
      categories.심층분석 = this.generateDefaultDeepAnalysis();
      categories.실천조언 = this.generateDefaultActionAdvice();
    }
    
    return categories;
  }
  
  /**
   * AI Function 호출 헬퍼
   */
  private async callAIFunction(body: any): Promise<any> {
    try {
      const response = await supabase.functions.invoke('generate-interpretation', { body });
      return response;
    } catch (error) {
      console.error('[CelticCross AI] API 호출 오류:', error);
      return { data: null, error };
    }
  }
  
  /**
   * 카테고리별 해석 통합
   */
  private combineInterpretations(categories: any): string {
    let combined = '';
    
    // 핵심 메시지를 먼저 보여줌
    if (categories.핵심메시지) {
      combined += `🔮 핵심 메시지\n\n${categories.핵심메시지}\n\n`;
    }
    
    // 심층 분석 추가
    if (categories.심층분석) {
      combined += `📖 심층 분석\n\n${categories.심층분석}\n\n`;
    }
    
    // 실천 조언 추가
    if (categories.실천조언) {
      combined += `✨ 실천 조언\n\n${categories.실천조언}`;
    }
    
    return combined;
  }

  /**
   * 핵심 메시지 프롬프트 생성
   */
  private generateCoreMessagePrompt(): string {
    let prompt = `당신은 경험 많은 타로 마스터입니다. 캘틱 크로스 배열의 핵심 메시지를 2-3문장으로 간단명료하게 전달해주세요.\n\n`;
    
    if (this.topic === '연애' || this.topic === 'love') {
      prompt += `【주제: 연애운】\n`;
      if (this.relationshipStatus === 'single') {
        prompt += `질문자는 솔로입니다. 새로운 만남과 기회에 대한 핵심 메시지를 전달하세요.\n`;
      } else if (this.relationshipStatus === 'couple') {
        prompt += `질문자는 연인이 있습니다. 관계 발전에 대한 핵심 메시지를 전달하세요.\n`;
      }
    }
    
    prompt += `\n【카드 정보】\n`;
    prompt += `현재 상황: ${this.cards[0]?.nameKr} (${this.cards[0]?.orientation === 'upright' ? '정방향' : '역방향'})\n`;
    prompt += `최종 결과: ${this.cards[9]?.nameKr} (${this.cards[9]?.orientation === 'upright' ? '정방향' : '역방향'})\n`;
    
    prompt += `\n【요구사항】\n`;
    prompt += `• 2-3문장으로 핵심만 전달\n`;
    prompt += `• 가장 중요한 메시지에 집중\n`;
    prompt += `• 희망적이면서도 현실적인 톤\n`;
    prompt += `• 절대 #, ## 같은 마크다운 헤더 사용 금지\n`;
    
    return prompt;
  }
  
  /**
   * 심층 분석 프롬프트 생성
   */
  private generateDeepAnalysisPrompt(): string {
    let prompt = `당신은 경험 많은 타로 마스터입니다. 캘틱 크로스 배열에 대한 상세한 심층 분석을 제공해주세요.\n\n`;
    
    if (this.topic === '연애' || this.topic === 'love') {
      prompt += `【⚠️ 최우선 지침】\n`;
      prompt += `이 해석은 오직 연애와 사랑에 관한 것입니다. 다른 주제는 언급하지 마세요.\n\n`;
      
      if (this.relationshipStatus === 'single') {
        prompt += `【중요】 질문자는 현재 솔로입니다.\n`;
        prompt += `새로운 만남, 연애 기회, 자기 계발에 초점을 맞춰주세요.\n\n`;
      } else if (this.relationshipStatus === 'couple') {
        prompt += `【중요】 질문자는 현재 연인이 있습니다.\n`;
        prompt += `관계 발전, 상대방의 마음, 미래 가능성에 초점을 맞춰주세요.\n\n`;
      }
    }
    
    if (this.customQuestion) {
      prompt += `【질문자의 구체적 질문】\n${this.customQuestion}\n\n`;
    }
    
    prompt += `【캘틱 크로스 전체 카드】\n`;
    this.cards.forEach((card, index) => {
      const pos = this.positions[index];
      prompt += `${index + 1}. ${pos.name}: ${card.nameKr} (${card.orientation === 'upright' ? '정방향' : '역방향'})\n`;
    });
    
    prompt += `\n【시간의 흐름 분석】\n`;
    prompt += `• 과거의 영향: ${this.cards[2]?.nameKr}(근원) → ${this.cards[3]?.nameKr}(최근)\n`;
    prompt += `• 현재의 상황: ${this.cards[0]?.nameKr}(중심) vs ${this.cards[1]?.nameKr}(도전)\n`;
    prompt += `• 미래의 전개: ${this.cards[5]?.nameKr}(곧) → ${this.cards[4]?.nameKr}(가능성) → ${this.cards[9]?.nameKr}(결과)\n`;
    prompt += `• 내외부 영향: ${this.cards[6]?.nameKr}(내적) vs ${this.cards[7]?.nameKr}(외적)\n`;
    prompt += `• 심리 상태: ${this.cards[8]?.nameKr}(희망과 두려움)\n`;
    
    prompt += `\n【응답 지침】\n`;
    prompt += `• 5-7개 문단으로 상세하게 작성\n`;
    prompt += `• 카드 간의 연결성과 흐름을 중시\n`;
    prompt += `• 과거-현재-미래의 인과관계 설명\n`;
    prompt += `• 내적/외적 영향력 분석\n`;
    prompt += `• 도전과 기회를 균형있게 다룸\n`;
    prompt += `• 심리적 통찰을 깊이있게 제공\n`;
    prompt += `• 절대 #, ## 같은 마크다운 헤더 사용 금지\n`;
    
    return prompt;
  }
  
  /**
   * 실천 조언 프롬프트 생성
   */
  private generateActionAdvicePrompt(): string {
    let prompt = `당신은 경험 많은 타로 마스터입니다. 캘틱 크로스 배열을 바탕으로 구체적이고 실천 가능한 조언을 제공해주세요.\n\n`;
    
    if (this.topic === '연애' || this.topic === 'love') {
      prompt += `【주제: 연애운】\n`;
      if (this.relationshipStatus === 'single') {
        prompt += `솔로인 질문자가 실천할 수 있는 구체적인 연애 조언을 제공하세요.\n`;
      } else if (this.relationshipStatus === 'couple') {
        prompt += `연인이 있는 질문자가 관계 개선을 위해 실천할 수 있는 조언을 제공하세요.\n`;
      }
    }
    
    prompt += `\n【주요 카드 정보】\n`;
    prompt += `현재 접근: ${this.cards[6]?.nameKr} (${this.cards[6]?.orientation === 'upright' ? '정방향' : '역방향'})\n`;
    prompt += `외부 영향: ${this.cards[7]?.nameKr} (${this.cards[7]?.orientation === 'upright' ? '정방향' : '역방향'})\n`;
    prompt += `가까운 미래: ${this.cards[5]?.nameKr} (${this.cards[5]?.orientation === 'upright' ? '정방향' : '역방향'})\n`;
    
    prompt += `\n【요구사항】\n`;
    prompt += `• 3-5개의 구체적인 실천 사항 제시\n`;
    prompt += `• 각 조언은 2-3문장으로 설명\n`;
    prompt += `• 즉시 실천 가능한 행동 위주\n`;
    prompt += `• 긍정적이고 건설적인 톤\n`;
    prompt += `• 현실적이고 실용적인 조언\n`;
    prompt += `• 절대 #, ## 같은 마크다운 헤더 사용 금지\n`;
    
    return prompt;
  }
  
  /**
   * AI용 프롬프트 생성 (기존 메서드 - 폴백용)
   */
  private generateAIPrompt(): string {
    let prompt = `당신은 경험 많은 타로 마스터입니다. 캘틱 크로스 배열법으로 ${this.topic}에 대한 깊이 있는 해석을 제공해주세요.\n\n`;
    
    // 연애 카테고리 특별 처리
    if (this.topic === '연애' || this.topic === 'love' || this.topic.includes('사랑')) {
      prompt += `【⚠️ 최우선 지침】\n`;
      prompt += `이 해석은 오직 연애와 사랑에 관한 것입니다. 다른 주제는 언급하지 마세요.\n\n`;
      
      if (this.relationshipStatus === 'single') {
        prompt += `【중요】 질문자는 현재 솔로입니다.\n`;
        prompt += `새로운 만남, 연애 기회, 자기 계발에 초점을 맞춰주세요.\n\n`;
      } else if (this.relationshipStatus === 'couple') {
        prompt += `【중요】 질문자는 현재 연인이 있습니다.\n`;
        prompt += `관계 발전, 상대방의 마음, 미래 가능성에 초점을 맞춰주세요.\n\n`;
      }
    }
    
    if (this.customQuestion) {
      prompt += `【질문자의 구체적 질문】\n${this.customQuestion}\n\n`;
    }
    
    prompt += `【캘틱 크로스 카드 배열】\n`;
    this.cards.forEach((card, index) => {
      const pos = this.positions[index];
      prompt += `${index + 1}. ${pos.name}: ${card.nameKr} (${card.orientation === 'upright' ? '정방향' : '역방향'})\n`;
    });
    prompt += '\n';
    
    // 중요 포지션 강조
    prompt += `【핵심 포지션 분석】\n`;
    prompt += `• 현재 상황: ${this.cards[0]?.nameKr} - 중심 에너지\n`;
    prompt += `• 도전 과제: ${this.cards[1]?.nameKr} - 극복해야 할 것\n`;
    prompt += `• 최종 결과: ${this.cards[9]?.nameKr} - 예상되는 결말\n\n`;
    
    // 시간대별 분석
    prompt += `【시간의 흐름】\n`;
    prompt += `• 과거: ${this.cards[2]?.nameKr}(먼 과거), ${this.cards[3]?.nameKr}(가까운 과거)\n`;
    prompt += `• 현재: ${this.cards[0]?.nameKr}(상황), ${this.cards[6]?.nameKr}(접근법)\n`;
    prompt += `• 미래: ${this.cards[5]?.nameKr}(가까운 미래), ${this.cards[4]?.nameKr}(가능한 미래)\n\n`;
    
    prompt += `【응답 지침】\n`;
    prompt += `• 4-5개 문단으로 상세하게 작성\n`;
    prompt += `• 과거-현재-미래의 흐름을 명확히 설명\n`;
    prompt += `• 도전과 극복 방법을 구체적으로 제시\n`;
    prompt += `• 마지막에 "✨ 종합 메시지" 추가\n`;
    prompt += `• 절대 #, ## 같은 마크다운 헤더 사용 금지\n`;
    
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
   * 기본 핵심 메시지 생성
   */
  private generateDefaultCoreMessage(): string {
    const present = this.cards[0];
    const outcome = this.cards[9];
    
    let message = `현재 ${present?.nameKr} 카드가 보여주는 `;
    message += present?.orientation === 'upright' ? '긍정적인 에너지' : '도전적인 상황';
    message += `을 통해, ${outcome?.nameKr} 카드가 예시하는 `;
    message += outcome?.orientation === 'upright' ? '희망적인 결과' : '예상치 못한 전개';
    message += `로 나아가게 될 것입니다.`;
    
    return message;
  }
  
  /**
   * 기본 심층 분석 생성
   */
  private generateDefaultDeepAnalysis(): string {
    let analysis = `캘틱 크로스 배열이 드러내는 당신의 상황\n\n`;
    
    // 과거
    analysis += `과거의 영향: ${this.cards[2]?.nameKr}(근원)과 ${this.cards[3]?.nameKr}(최근)가 현재에 미친 영향이 크게 작용하고 있습니다. `;
    analysis += `이러한 과거의 경험들이 현재의 당신을 만들어냈습니다.\n\n`;
    
    // 현재
    analysis += `현재 상황: ${this.cards[0]?.nameKr}가 나타내는 중심 에너지와 ${this.cards[1]?.nameKr}가 보여주는 도전이 겵합하고 있습니다. `;
    analysis += `${this.cards[6]?.nameKr}의 내적 접근과 ${this.cards[7]?.nameKr}의 외부 영향이 함께 작용하고 있습니다.\n\n`;
    
    // 미래
    analysis += `미래 전망: ${this.cards[5]?.nameKr}로 곧 다가올 변화가 예상되며, ${this.cards[4]?.nameKr}의 가능성을 거쳐 `;
    analysis += `${this.cards[9]?.nameKr}의 최종 결과로 이어질 것입니다. `;
    analysis += `${this.cards[8]?.nameKr}가 보여주는 내면의 희망과 두려움을 잘 다루는 것이 중요합니다.\n\n`;
    
    analysis += `✨ 전체적으로 카드들은 변화와 성장의 과정을 보여주고 있으며, 현재의 도전을 기회로 삼아 더 나은 미래를 만들어가실 수 있을 것입니다.`;
    
    return analysis;
  }
  
  /**
   * 기본 실천 조언 생성
   */
  private generateDefaultActionAdvice(): string {
    let advice = `타로 카드가 제시하는 실천 조언\n\n`;
    
    // 접근 방식에 따른 조언
    if (this.cards[6]?.orientation === 'upright') {
      advice += `1. 현재의 접근 방식을 유지하면서 더욱 적극적으로 임하세요.\n`;
    } else {
      advice += `1. 접근 방식을 재고하고 새로운 관점에서 상황을 바라보세요.\n`;
    }
    
    // 외부 영향에 따른 조언
    if (this.cards[7]?.orientation === 'upright') {
      advice += `2. 주변의 긍정적인 영향력을 적극 활용하세요.\n`;
    } else {
      advice += `2. 외부의 부정적 영향에 흔들리지 마세요.\n`;
    }
    
    // 가까운 미래에 따른 조언
    if (this.cards[5]?.orientation === 'upright') {
      advice += `3. 곧 다가올 기회를 위해 미리 준비하세요.\n`;
    } else {
      advice += `3. 당분간 신중하게 행동하고 성급한 결정은 피하세요.\n`;
    }
    
    advice += `\n현재의 상황을 객관적으로 바라보고, 과거의 경험을 바탕으로 지혜롭게 선택하세요. `;
    advice += `당신의 내면의 힘을 믿고 긍정적인 태도로 나아가면 원하는 결과를 얻을 수 있을 것입니다.`;
    
    return advice;
  }
  
  /**
   * 패턴 분석 (보조 메서드)
   */
  private analyzePatterns(): string[] {
    const patterns: string[] = [];
    
    // 메이저 아르카나 수 확인
    const majorCount = this.cards.filter(c => c.arcana === 'major').length;
    if (majorCount >= 5) {
      patterns.push('메이저 아르카나가 다수 - 중요한 인생의 전환점');
    }
    
    // 정/역 비율 확인
    const uprightCount = this.cards.filter(c => c.orientation === 'upright').length;
    if (uprightCount >= 7) {
      patterns.push('정방향 카드 우세 - 긍정적 흐름');
    } else if (uprightCount <= 3) {
      patterns.push('역방향 카드 우세 - 내면의 성찰 필요');
    }
    
    // 슈트별 분포 (마이너 카드)
    const suits = { wands: 0, cups: 0, swords: 0, pentacles: 0 };
    this.cards.forEach(card => {
      if (card.suit) {
        suits[card.suit as keyof typeof suits]++;
      }
    });
    
    const dominantSuit = Object.entries(suits).sort((a, b) => b[1] - a[1])[0];
    if (dominantSuit[1] >= 3) {
      const suitMeanings: { [key: string]: string } = {
        wands: '열정과 창의성이 중요',
        cups: '감정과 관계가 핵심',
        swords: '이성적 판단이 필요',
        pentacles: '현실적 접근이 중요'
      };
      patterns.push(`${dominantSuit[0]} 우세 - ${suitMeanings[dominantSuit[0]]}`);
    }
    
    return patterns;
  }
}
