import { supabase } from '../services/supabase';
import { initializeShare, shareWithNative } from '../utils/shareUtils';
import type { Reading } from '../types/reading';

export class ShareService {
  constructor() {
    // Share 플러그인 초기화
    initializeShare();
  }

  /**
   * 점괘 결과를 공유 가능한 링크로 생성
   */
  async createShareLink(reading: Reading): Promise<string> {
    try {
      // 1. 공유 데이터 준비
      const shareData = {
        spread_type: reading.spreadId,
        cards: reading.cards.map(card => ({
          cardNumber: card.cardNumber || card.id,
          nameKr: card.nameKr,
          name: card.name,
          orientation: card.orientation,
          position: card.position
        })),
        custom_question: reading.customQuestion || null,
        basic_interpretation: reading.overallMessage || null,
        ai_interpretation: reading.aiInterpretation || null,
        shared_by: (await supabase.auth.getUser()).data?.user?.id || null
      };
      
      // 2. Supabase에 저장
      const { data, error } = await supabase
        .from('shared_readings')
        .insert(shareData)
        .select('id')
        .single();
      
      if (error) {
        console.error('Supabase 저장 에러:', error);
        throw error;
      }
      
      // 3. 공유 URL 생성
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      return `${baseUrl}/s/${data.id}`;
      
    } catch (error) {
      console.error('공유 링크 생성 실패:', error);
      throw error;
    }
  }
  
  /**
   * 공유 메시지 생성
   */
  generateShareMessage(reading: Reading, shareUrl: string): string {
    const emoji = '🔮';
    const title = '타로 점괘 결과를 공유합니다';
    
    let message = `${emoji} ${title}\n\n`;
    
    // 질문 추가
    if (reading.customQuestion) {
      message += `💭 "${reading.customQuestion}"\n\n`;
    }
    
    // 스프레드 타입
    const spreadNames: Record<string, string> = {
      'one_card': '1장 뽑기',
      'three_card_timeline': '3장 시간 배열',
      'celtic_cross': '켈틱 크로스 10장',
      'seven_star': '세븐 스타',
      'hexagram': '헥사그램',
      'cup_of_relationship': '관계의 컵'
    };
    message += `📍 ${spreadNames[reading.spreadId] || reading.spreadId}\n`;
    
    // 주요 카드 (최대 3장)
    const mainCards = reading.cards.slice(0, 3).map(card => 
      `${card.nameKr} (${card.orientation === 'upright' ? '정방향' : '역방향'})`
    ).join(', ');
    message += `🎴 ${mainCards}`;
    
    if (reading.cards.length > 3) {
      message += ` 외 ${reading.cards.length - 3}장`;
    }
    message += '\n\n';
    
    // 간단한 해석 (50자 제한)
    if (reading.aiInterpretation) {
      const shortInterpretation = reading.aiInterpretation.substring(0, 50) + '...';
      message += `✨ ${shortInterpretation}\n\n`;
    } else if (reading.overallMessage) {
      const shortMessage = reading.overallMessage.substring(0, 50) + '...';
      message += `✨ ${shortMessage}\n\n`;
    }
    
    // 링크
    message += `👉 전체 결과 보기\n${shareUrl}\n\n`;
    message += `🎯 무료 타로 점보기 - 타로카드`;
    
    return message;
  }

  /**
   * 결과 공유하기
   */
  async shareResult(reading: Reading): Promise<void> {
    // 1. 공유 링크 생성
    const shareUrl = await this.createShareLink(reading);
    
    // 2. 공유 메시지 생성
    const shareMessage = this.generateShareMessage(reading, shareUrl);
    
    // 3. 네이티브 공유 실행
    const shared = await shareWithNative(
      '타로 점괘 결과',
      shareMessage,
      shareUrl
    );
    
    if (!shared) {
      // 클립보드에 복사된 경우
      throw new Error('CLIPBOARD_COPY');
    }
  }
}

// 싱글톤 인스턴스 export
export const shareService = new ShareService();
