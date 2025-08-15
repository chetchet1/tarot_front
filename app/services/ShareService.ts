import { supabase } from '../services/supabase';
import { initializeShare, shareWithNative } from '../utils/shareUtils';
import { Capacitor } from '@capacitor/core';
import type { Reading } from '../types/reading';

export class ShareService {
  constructor() {
    // Share 플러그인 초기화
    initializeShare();
  }

  /**
   * 공유용 베이스 URL 가져오기
   * 앱 환경에 따라 적절한 URL 반환
   */
  private getShareBaseUrl(): string {
    // 1. 환경 변수에서 고정 URL 확인 (권장)
    if (import.meta.env.VITE_APP_URL) {
      return import.meta.env.VITE_APP_URL;
    }
    
    // 2. 네이티브 앱(APK)에서는 프로젝트 고정 URL 사용
    if (Capacitor.isNativePlatform()) {
      // Vercel 프로젝트의 실제 고정 URL
      return 'https://tarot-app-psi-eight.vercel.app';
    }

    // 3. 프로덕션 환경 - 현재 origin 사용
    if (import.meta.env.PROD && !window.location.origin.includes('localhost')) {
      return window.location.origin;
    }

    // 4. Vercel 환경 변수 사용 (폴백)
    if (import.meta.env.VITE_VERCEL_URL) {
      return `https://${import.meta.env.VITE_VERCEL_URL}`;
    }
    
    // 5. 개발 환경 폴백
    console.warn('⚠️ 공유 URL이 localhost로 설정됩니다. 배포 또는 ngrok 설정이 필요합니다.');
    return window.location.origin;
  }

  /**
   * 점괘 결과를 공유 가능한 링크로 생성
   */
  async createShareLink(reading: Reading): Promise<string> {
    try {
      // 타로 카드 데이터 가져오기 (폴백을 위해)
      const { data: allCards } = await supabase
        .from('tarot_cards')
        .select('id, name, name_kr');
      
      // 카드 이름으로 ID를 찾기 위한 맵 생성
      const cardNameToIdMap = new Map<string, number>();
      const cardNameKrToIdMap = new Map<string, number>();
      
      if (allCards) {
        allCards.forEach(card => {
          if (card.name) cardNameToIdMap.set(card.name.toLowerCase(), card.id);
          if (card.name_kr) cardNameKrToIdMap.set(card.name_kr, card.id);
        });
      }
      
      // AI 해석 가져오기 - aiInterpretation 또는 enhancedInterpretation 사용
      let aiInterpretationText = null;
      
      // 먼저 aiInterpretation 확인
      if (reading.aiInterpretation) {
        aiInterpretationText = reading.aiInterpretation;
      }
      // enhancedInterpretation 확인 (세븐스타, 컵오브릴레이션십 등)
      else if ((reading as any).enhancedInterpretation) {
        const enhanced = (reading as any).enhancedInterpretation;
        if (typeof enhanced === 'object') {
          // 객체인 경우 적절한 필드 선택
          aiInterpretationText = enhanced.aiInterpretation || 
                                 enhanced.overallMessage || 
                                 enhanced.summary || 
                                 JSON.stringify(enhanced);
        } else if (typeof enhanced === 'string') {
          aiInterpretationText = enhanced;
        }
      }
      
      // 1. 공유 데이터 준비
      const shareData = {
        spread_type: reading.spreadId,
        cards: reading.cards.map(card => {
          // 카드 ID 결정 - id가 메인 식별자
          let cardId = card.id;
          
          // id가 없거나 잘못된 값인 경우 폴백 로직
          if (cardId === undefined || cardId === null || typeof cardId !== 'number') {
            // 1. cardNumber 확인
            if (card.cardNumber !== undefined && card.cardNumber !== null && typeof card.cardNumber === 'number') {
              cardId = card.cardNumber;
              console.warn('⚠️ Using cardNumber instead of id:', cardId, 'for card:', card.name);
            }
            // 2. number 확인
            else if (card.number !== undefined && card.number !== null && typeof card.number === 'number') {
              cardId = card.number;
              console.warn('⚠️ Using number instead of id:', cardId, 'for card:', card.name);
            }
            // 3. 카드 이름으로 ID 찾기 (최종 폴백)
            else if (card.name || card.nameKr) {
              // 영어 이름으로 찾기
              if (card.name && cardNameToIdMap.has(card.name.toLowerCase())) {
                cardId = cardNameToIdMap.get(card.name.toLowerCase())!;
                console.warn('⚠️ Found ID by English name:', cardId, 'for card:', card.name);
              }
              // 한글 이름으로 찾기
              else if (card.nameKr && cardNameKrToIdMap.has(card.nameKr)) {
                cardId = cardNameKrToIdMap.get(card.nameKr)!;
                console.warn('⚠️ Found ID by Korean name:', cardId, 'for card:', card.nameKr);
              }
              // 특수 케이스 처리: Ace of Cups = 36
              else if (card.name === 'Ace of Cups' || card.nameKr === '컵의 에이스') {
                cardId = 36;
                console.warn('⚠️ Hardcoded ID for Ace of Cups:', cardId);
              }
              else {
                console.error('❌ Could not find ID for card:', card);
                cardId = 0; // 기본값
              }
            }
          }
          
          console.log('🎴 ShareService - Mapping card:', {
            originalCard: card,
            resolvedId: cardId,
            name: card.name,
            nameKr: card.nameKr,
            id_field: card.id,
            cardNumber_field: card.cardNumber,
            number_field: card.number
          });
          
          return {
            cardNumber: cardId,  // cardNumber 필드에 올바른 ID 저장
            nameKr: card.nameKr,
            name: card.name,
            orientation: card.orientation,
            position: card.position
          };
        }),
        theme: (reading as any).theme || null,  // 테마 정보 추가
        sub_theme: (reading as any).subTheme || null,  // 서브테마 정보 추가
        custom_question: reading.customQuestion || null,
        basic_interpretation: reading.overallMessage || null,
        ai_interpretation: aiInterpretationText,
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
      
      // 3. 공유 URL 생성 (개선된 방식)
      const baseUrl = this.getShareBaseUrl();
      const shareUrl = `${baseUrl}/s/${data.id}`;
      
      console.log('📤 생성된 공유 링크:', shareUrl);
      
      return shareUrl;
      
    } catch (error) {
      console.error('공유 링크 생성 실패:', error);
      throw error;
    }
  }
  
  /**
   * 공유 메시지 생성 (카카오톡 최적화)
   */
  generateShareMessage(reading: Reading, shareUrl: string): string {
    const emoji = '🔮';
    const title = '타로 점괘 결과';
    
    let message = `${emoji} ${title}\n`;
    message += '━━━━━━━━━━━━━━━\n\n';
    
    // 질문 추가
    if (reading.customQuestion) {
      message += `💭 질문\n"${reading.customQuestion}"\n\n`;
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
    message += `📍 배열법: ${spreadNames[reading.spreadId] || reading.spreadId}\n\n`;
    
    // 주요 카드 (최대 3장)
    message += '🎴 뽑은 카드\n';
    const mainCards = reading.cards.slice(0, 3);
    mainCards.forEach((card, index) => {
      const orientation = card.orientation === 'upright' ? '정방향' : '역방향';
      message += `${index + 1}. ${card.nameKr} (${orientation})\n`;
    });
    
    if (reading.cards.length > 3) {
      message += `... 외 ${reading.cards.length - 3}장 더\n`;
    }
    message += '\n';
    
    // 간단한 해석 - AI 해석 또는 기본 해석
    let interpretationText = reading.aiInterpretation || reading.overallMessage;
    
    // enhancedInterpretation도 확인
    if (!interpretationText && (reading as any).enhancedInterpretation) {
      const enhanced = (reading as any).enhancedInterpretation;
      if (typeof enhanced === 'object') {
        interpretationText = enhanced.aiInterpretation || enhanced.overallMessage || enhanced.summary;
      } else if (typeof enhanced === 'string') {
        interpretationText = enhanced;
      }
    }
    
    if (interpretationText) {
      const shortInterpretation = interpretationText.substring(0, 60);
      message += `✨ 해석\n${shortInterpretation}...\n\n`;
    }
    
    // 구분선과 링크
    message += '━━━━━━━━━━━━━━━\n';
    message += '👇 전체 결과 보기\n';
    message += `${shareUrl}\n\n`;
    message += '🎯 무료 타로카드 점보기';
    
    return message;
  }

  /**
   * 결과 공유하기 (개선된 버전)
   */
  async shareResult(reading: Reading): Promise<void> {
    try {
      // 1. 공유 링크 생성
      const shareUrl = await this.createShareLink(reading);
      
      // 2. 공유 메시지 생성
      const shareMessage = this.generateShareMessage(reading, shareUrl);
      
      // 3. 네이티브 공유 시도
      const shared = await shareWithNative(
        '타로 점괘 결과',
        shareMessage,
        shareUrl
      );
      
      if (!shared) {
        // 클립보드에 복사된 경우
        throw new Error('CLIPBOARD_COPY');
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'CLIPBOARD_COPY') {
        // 클립보드 복사는 별도 처리
        throw error;
      }
      console.error('공유 실패:', error);
      throw error;
    }
  }

  /**
   * 오늘의 카드 공유 링크 생성
   */
  async createDailyCardShareLink(dailyCard: any): Promise<string> {
    try {
      console.log('📤 [ShareService] 오늘의 카드 공유 데이터 준비');
      console.log('  - card:', dailyCard.card);
      console.log('  - interpretation 타입:', typeof dailyCard.interpretation);
      
      // AI 해석 데이터는 사용하지 않음 (basic_interpretation으로 통합)
      // 오늘의 카드는 항상 포맷팅된 텍스트로만 공유
      
      // 1. 공유 데이터 준비
      // basic_interpretation에 포맷팅된 텍스트 저장
      let formattedInterpretation = '';
      if (dailyCard.interpretation) {
        const interp = dailyCard.interpretation;
        
        // 메인 메시지
        if (interp.detailedFortune?.mainMessage) {
          formattedInterpretation += interp.detailedFortune.mainMessage + '\n\n';
        }
        
        // 운세 지수
        if (interp.fortuneIndex) {
          formattedInterpretation += '📊 오늘의 운세\n\n';
          const labels: Record<string, string> = {
            overall: '전체운',
            love: '애정운', 
            money: '금전운',
            health: '건강운',
            work: '학업/업무운'
          };
          for (const [key, value] of Object.entries(interp.fortuneIndex)) {
            const stars = '⭐'.repeat(value as number) + '☆'.repeat(5 - (value as number));
            formattedInterpretation += `${labels[key] || key}: ${stars}\n`;
          }
          formattedInterpretation += '\n';
        }
        
        // 행운 아이템
        if (interp.luckyItems) {
          formattedInterpretation += '🍀 행운 아이템\n\n';
          formattedInterpretation += `색상: ${interp.luckyItems.color}\n`;
          formattedInterpretation += `숫자: ${interp.luckyItems.number}\n`;
          formattedInterpretation += `방향: ${interp.luckyItems.direction}\n`;
          formattedInterpretation += `활동: ${interp.luckyItems.activity}\n\n`;
        }
        
        // 오늘의 격언
        if (interp.dailyQuote) {
          formattedInterpretation += `💬 오늘의 격언\n\n"${interp.dailyQuote}"\n\n`;
        }
        
        // 상세 조언
        if (interp.detailedFortune) {
          if (interp.detailedFortune.keyPoint) {
            formattedInterpretation += `💫 핵심 포인트\n\n${interp.detailedFortune.keyPoint}\n\n`;
          }
          if (interp.detailedFortune.caution) {
            formattedInterpretation += `⚡ 주의할 점\n\n${interp.detailedFortune.caution}\n\n`;
          }
          if (interp.detailedFortune.luckyMoment) {
            formattedInterpretation += `🌟 행운의 순간\n\n${interp.detailedFortune.luckyMoment}\n\n`;
          }
          if (interp.detailedFortune.advice) {
            formattedInterpretation += `💡 조언\n\n${interp.detailedFortune.advice}`;
          }
        }
      }
      
      const shareData = {
        spread_type: 'daily_card',
        cards: [{
          cardNumber: dailyCard.card.id || dailyCard.card.number,
          nameKr: dailyCard.card.name_kr,
          name: dailyCard.card.name,
          orientation: 'upright',
          position: 0
        }],
        custom_question: `${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}의 오늘의 카드`,
        basic_interpretation: formattedInterpretation || dailyCard.interpretation?.detailedFortune?.mainMessage || null,
        ai_interpretation: null, // AI 해석은 저장하지 않음 (basic_interpretation으로 대체)
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
      
      // 3. 공유 URL 생성 (개선된 방식)
      const baseUrl = this.getShareBaseUrl();
      const shareUrl = `${baseUrl}/s/${data.id}`;
      
      console.log('📤 생성된 오늘의 카드 공유 링크:', shareUrl);
      
      return shareUrl;
      
    } catch (error) {
      console.error('오늘의 카드 공유 링크 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 오늘의 카드 공유 메시지 생성 (카카오톡 최적화)
   */
  generateDailyCardShareMessage(card: any, interpretation: any, shareUrl: string): string {
    const emoji = '🌟';
    const date = new Date().toLocaleDateString('ko-KR', { 
      month: 'numeric',
      day: 'numeric',
      weekday: 'short'
    });
    
    let message = `${emoji} ${date} 오늘의 타로\n`;
    message += '━━━━━━━━━━━━━━━\n\n';
    
    // 카드 정보
    message += `🎴 ${card.name_kr}\n`;
    if (card.name) {
      message += `   ${card.name}\n\n`;
    }
    
    // 운세 지수
    if (interpretation?.fortuneIndex) {
      const overall = interpretation.fortuneIndex.overall || 3;
      message += `📊 오늘의 운세\n`;
      message += `${'⭐'.repeat(overall)}${'☆'.repeat(5 - overall)}\n\n`;
    }
    
    // 오늘의 메시지
    if (interpretation?.detailedFortune?.mainMessage) {
      const shortMessage = interpretation.detailedFortune.mainMessage.substring(0, 60);
      message += `💬 메시지\n${shortMessage}...\n\n`;
    }
    
    // 행운 아이템
    if (interpretation?.luckyItems) {
      message += `🍀 행운 아이템\n`;
      message += `색상: ${interpretation.luckyItems.color}\n`;
      message += `숫자: ${interpretation.luckyItems.number}\n\n`;
    }
    
    // 구분선과 링크
    message += '━━━━━━━━━━━━━━━\n';
    message += '👇 상세 운세 보기\n';
    message += `${shareUrl}\n\n`;
    message += '🔮 무료 타로카드 점보기';
    
    return message;
  }

  /**
   * 네이티브 공유 실행 (공통)
   */
  async shareWithNative(title: string, message: string, url: string): Promise<boolean> {
    return await shareWithNative(title, message, url);
  }
}

// 싱글톤 인스턴스 export
export const shareService = new ShareService();
