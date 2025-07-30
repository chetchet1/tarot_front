import { supabase } from './supabase'
import { MockAIService } from './MockAIService'

export interface InterpretationResult {
  text: string
  interpretationId?: string
  cached?: boolean
}

export interface Card {
  id: number
  name: string
  name_kr: string
  nameKr?: string
  arcana: string
  suit?: string
  orientation: 'upright' | 'reversed'
  position?: {
    position: number
    name: string
  }
}

export class AIInterpretationService {
  private isPremium: boolean
  
  constructor(isPremium: boolean) {
    this.isPremium = isPremium
  }
  
  async generateInterpretation(
    cards: Card[], 
    topic: string, 
    spreadType: string
  ): Promise<InterpretationResult> {
    if (!this.isPremium) {
      // 무료 사용자는 템플릿 해석
      return this.generateTemplateInterpretation(cards, topic)
    }
    
    try {
      console.log('AI 해석 시작:', { cards, topic, spreadType })
      
      // 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser()
      console.log('사용자 ID:', user?.id)
      
      const requestBody = {
        allCards: cards.map(card => ({
          ...card,
          name_kr: card.name_kr || card.nameKr,
          nameKr: card.name_kr || card.nameKr
        })),
        topic,
        spreadType,
        userId: user?.id,
        isPremium: this.isPremium,
        interpretationType: 'overall' // 전체 해석 요청
      }
      
      console.log('Edge Function 호출 요청:', requestBody)
      
      // Supabase Edge Function 호출
      const { data, error } = await supabase.functions.invoke('generate-interpretation', {
        body: requestBody
      })
      
      console.log('Edge Function 응답:', { data, error })
      
      if (error) {
        console.error('Edge Function 오류:', error)
        throw error
      }
      
      if (!data || !data.interpretation) {
        throw new Error('해석 데이터가 없습니다')
      }
      
      return {
        text: data.interpretation,
        interpretationId: data.interpretationId,
        cached: data.cached
      }
    } catch (error: any) {
      console.error('AI 해석 실패:', error)
      
      // 개발 모드에서는 Mock AI 사용
      if (error.message?.includes('not implemented') || 
          error.message?.includes('Function not found') ||
          error.message?.includes('Failed to fetch')) {
        console.log('Mock AI 사용 중...')
        const mockText = await MockAIService.generateMockInterpretation(cards, topic)
        return {
          text: mockText,
          interpretationId: 'mock-' + Date.now(),
          cached: false
        }
      }
      
      // 그 외의 오류는 템플릿 해석
      return this.generateTemplateInterpretation(cards, topic)
    }
  }
  
  async submitRating(interpretationId: string, rating: number, feedback?: string) {
    try {
      // Mock ID인 경우 로컬 저장만
      if (interpretationId.startsWith('mock-')) {
        console.log('Mock 평점 저장:', { interpretationId, rating, feedback })
        // 로컬 스토리지에 저장 (선택사항)
        const mockRatings = JSON.parse(localStorage.getItem('mockRatings') || '[]')
        mockRatings.push({ interpretationId, rating, feedback, timestamp: new Date().toISOString() })
        localStorage.setItem('mockRatings', JSON.stringify(mockRatings))
        return
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      
      await supabase.functions.invoke('submit-rating', {
        body: {
          interpretationId,
          rating,
          feedback,
          userId: user?.id
        }
      })
    } catch (error) {
      console.error('평점 제출 실패:', error)
    }
  }
  
  private generateTemplateInterpretation(cards: Card[], topic: string): InterpretationResult {
    // 기본 템플릿 해석 생성
    const topicMessages = {
      love: '연애운에 대한',
      career: '직업운에 대한',
      money: '금전운에 대한',
      general: '종합적인'
    }
    
    const message = topicMessages[topic] || '종합적인'
    
    const interpretation = `${message} 타로 해석입니다.\n\n` +
      `주요 카드들이 보여주는 에너지는 다음과 같습니다:\n\n` +
      cards.slice(0, 3).map((card, idx) => 
        `${idx + 1}. ${card.name_kr || card.nameKr} (${card.orientation === 'upright' ? '정방향' : '역방향'}): ` +
        `이 카드는 ${this.getBasicMeaning(card)}을 나타냅니다.`
      ).join('\n\n') +
      `\n\n전체적으로 긍정적인 변화의 시기가 다가오고 있음을 보여줍니다. ` +
      `구체적인 행동을 통해 원하는 결과를 얻을 수 있을 것입니다.`
    
    return { text: interpretation }
  }
  
  private getBasicMeaning(card: Card): string {
    // 간단한 기본 의미 반환
    const meanings = {
      '바보': '새로운 시작과 순수한 열정',
      '마법사': '의지와 창조력',
      '여사제': '직관과 내면의 지혜',
      '여황제': '풍요와 창조성',
      '황제': '권위와 안정성',
      '교황': '전통과 지혜',
      '연인': '선택과 관계',
      '전차': '의지와 극복',
      '힘': '내면의 힘과 용기',
      '은둔자': '성찰과 지혜',
      '운명의 수레바퀴': '변화와 운명',
      '정의': '균형과 공정함',
      '매달린 사람': '희생과 새로운 관점',
      '죽음': '변화와 재생',
      '절제': '조화와 균형',
      '악마': '속박과 욕망',
      '탑': '급격한 변화',
      '별': '희망과 영감',
      '달': '환상과 불안',
      '태양': '성공과 활력',
      '심판': '재생과 각성',
      '세계': '완성과 성취'
    }
    
    return meanings[card.name_kr || card.nameKr] || '중요한 메시지'
  }
}
