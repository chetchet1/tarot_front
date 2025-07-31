import { supabase } from '@/services/supabase'

export interface CustomInterpretationRequest {
  readingId: string
  cards: Array<{
    id: number
    name: string
    nameKr: string
    arcana: string
    suit?: string
    number: number
    orientation: 'upright' | 'reversed'
    position: {
      name: string
      description: string
    }
    meanings: any
  }>
  spreadId: string
  topic: string
  customQuestion?: string
  userId?: string
}

export interface CustomInterpretationResponse {
  success: boolean
  interpretation?: string
  interpretationId?: number
  probabilityAnalysis?: {
    successProbability: number
    challengeProbability: number
    uncertaintyLevel: number
    successReason: string
    challengeReason: string
    uncertaintyReason: string
    recommendation: string
  }
  error?: string
}

export class CustomInterpretationService {
  /**
   * 커스텀 질문에 대한 AI 해석을 생성합니다.
   */
  async generateInterpretation(request: CustomInterpretationRequest): Promise<CustomInterpretationResponse> {
    try {
      // 현재 세션 가져오기
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.error('세션이 없습니다')
        throw new Error('로그인이 필요합니다')
      }

      // generate-interpretation Edge Function 호출 (올바른 함수 이름)
      const { data, error } = await supabase.functions.invoke('generate-interpretation', {
        body: {
          ...request,
          isPremium: true // 프리미엄 사용자임을 명시
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (error) {
        console.error('Edge Function 호출 오류:', error)
        throw new Error(error.message || 'AI 해석 생성 중 오류가 발생했습니다.')
      }

      // Edge Function 응답 형식에 맞게 변환
      if (data && data.interpretation) {
        return {
          success: true,
          interpretation: data.interpretation,
          interpretationId: data.interpretationId,
          probabilityAnalysis: data.probabilityAnalysis
        }
      } else {
        throw new Error('AI 해석 응답이 올바르지 않습니다')
      }
    } catch (error) {
      console.error('AI 해석 서비스 오류:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      }
    }
  }

  /**
   * 이전 해석 기록을 가져옵니다.
   */
  async getPreviousInterpretations(userId: string, limit: number = 5) {
    try {
      const { data, error } = await supabase
        .from('ai_interpretations')
        .select(`
          id,
          reading_id,
          interpretation_text,
          created_at,
          rating,
          reading:tarot_readings(
            spread_id,
            topic,
            created_at
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('이전 해석 조회 오류:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('이전 해석 서비스 오류:', error)
      return []
    }
  }

  /**
   * 해석에 대한 평점을 제출합니다.
   */
  async submitRating(interpretationId: number, rating: number) {
    try {
      const { error } = await supabase
        .from('ai_interpretations')
        .update({ rating })
        .eq('id', interpretationId)

      if (error) {
        console.error('평점 제출 오류:', error)
        throw new Error('평점 제출 중 오류가 발생했습니다.')
      }

      return { success: true }
    } catch (error) {
      console.error('평점 서비스 오류:', error)
      return { success: false, error: error.message }
    }
  }
}

// 싱글톤 인스턴스
export const customInterpretationService = new CustomInterpretationService()
