import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

// 이벤트 타입 정의
export interface Event {
  id: string;
  event_code: string;
  title: string;
  description: string;
  image_url?: string;
  event_type: 'auto' | 'manual' | 'hybrid';
  condition_type: string;
  condition_data: any;
  start_date: string;
  end_date: string;
  max_winners: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventParticipation {
  id: string;
  event_id: string;
  user_id: string;
  auto_qualified: boolean;
  bonus_entries: number;
  qualification_data?: any;
  participation_method: 'auto' | 'manual' | 'bonus';
  participation_date: string;
  created_at: string;
}

export interface DailyEventCheck {
  id: string;
  user_id: string;
  event_id: string;
  check_type: string;
  check_data: any;
  condition_met: boolean;
  check_date: string;
  created_at: string;
}

export interface EventWinner {
  id: string;
  event_id: string;
  user_id: string;
  coupon_id?: string;
  is_claimed: boolean;
  claimed_at?: string;
  won_at: string;
}

export class EventService {
  /**
   * 현재 활성화된 이벤트 목록 조회
   */
  async getActiveEvents(): Promise<Event[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', today)
      .gte('end_date', today)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('이벤트 조회 실패:', error);
      return [];
    }

    return data || [];
  }

  /**
   * 특정 이벤트 상세 조회
   */
  async getEventById(eventId: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('이벤트 상세 조회 실패:', error);
      return null;
    }

    return data;
  }

  /**
   * 오늘의 카드 이벤트 자동 체크
   */
  async checkDailyCardEvent(userId: string, cardData: any): Promise<void> {
    try {
      // 현재 진행 중인 오늘의 카드 관련 이벤트 확인
      const activeEvents = await this.getActiveEvents();
      const dailyCardEvents = activeEvents.filter(
        event => event.condition_data?.source === 'daily_card'
      );

      for (const event of dailyCardEvents) {
        const condition = event.condition_data;
        let conditionMet = false;
        let qualificationData: any = {};

        // 조건 타입별 체크
        switch (event.condition_type) {
          case 'specific_card':
            // 특정 카드 체크
            if (cardData.name === condition.card_name || 
                cardData.name_kr === condition.card_name) {
              conditionMet = true;
              qualificationData = {
                card: cardData,
                method: 'auto',
                timestamp: new Date().toISOString()
              };
            }
            break;

          case 'lucky_color_match':
            // 행운의 색상 매칭 체크
            const luckyColor = cardData.interpretation?.luckyItems?.color;
            if (luckyColor === condition.target_color) {
              conditionMet = true;
              qualificationData = {
                matched_color: luckyColor,
                card: cardData,
                method: 'auto'
              };
            }
            break;

          case 'lucky_number':
            // 행운의 숫자 체크
            const luckyNumber = cardData.interpretation?.luckyItems?.number;
            if (luckyNumber === condition.target_number) {
              conditionMet = true;
              qualificationData = {
                matched_number: luckyNumber,
                card: cardData,
                method: 'auto'
              };
            }
            break;
        }

        // 조건이 충족되면 자동 응모
        if (conditionMet) {
          await this.autoEnterEvent(userId, event.id, qualificationData);
          
          // 일일 체크 기록
          await this.recordDailyCheck(userId, event.id, 'daily_card', {
            card: cardData,
            condition_met: true
          });
        }
      }
    } catch (error) {
      console.error('오늘의 카드 이벤트 체크 실패:', error);
    }
  }

  /**
   * 타로 점술 이벤트 자동 체크
   */
  async checkSpreadEvent(userId: string, spreadData: any): Promise<void> {
    try {
      const activeEvents = await this.getActiveEvents();
      
      for (const event of activeEvents) {
        const condition = event.condition_data;
        let conditionMet = false;
        let qualificationData: any = {};

        switch (event.condition_type) {
          case 'specific_card_in_spread':
            // 특정 스프레드에서 특정 카드 체크
            if (spreadData.spreadId === condition.spread_type || 
                condition.spread_type === 'any') {
              const hasTargetCard = spreadData.cards.some((card: any) => 
                card.name === condition.card_name || 
                card.nameKr === condition.card_name
              );
              
              if (hasTargetCard) {
                conditionMet = true;
                qualificationData = {
                  spread: spreadData.spreadId,
                  cards: spreadData.cards,
                  method: 'auto'
                };
              }
            }
            break;

          case 'premium_spread_use':
            // 프리미엄 스프레드 사용 체크
            if (spreadData.spreadId === condition.spread_type) {
              // 질문 키워드 체크 (옵션)
              if (condition.question_keywords && spreadData.customQuestion) {
                const hasKeyword = condition.question_keywords.some((keyword: string) =>
                  spreadData.customQuestion.toLowerCase().includes(keyword.toLowerCase())
                );
                
                if (hasKeyword) {
                  conditionMet = true;
                  qualificationData = {
                    spread: spreadData.spreadId,
                    question: spreadData.customQuestion,
                    method: 'auto'
                  };
                }
              } else {
                conditionMet = true;
                qualificationData = {
                  spread: spreadData.spreadId,
                  method: 'auto'
                };
              }
            }
            break;

          case 'topic_streak':
            // 특정 주제 연속 사용 체크
            if (spreadData.topic === condition.topic) {
              // 연속 사용 체크는 별도 로직 필요
              await this.updateTopicStreak(userId, event.id, condition.topic);
            }
            break;
        }

        if (conditionMet) {
          await this.autoEnterEvent(userId, event.id, qualificationData);
          
          // 일일 체크 기록
          await this.recordDailyCheck(userId, event.id, 'spread_use', {
            spread: spreadData,
            condition_met: true
          });
        }
      }
    } catch (error) {
      console.error('스프레드 이벤트 체크 실패:', error);
    }
  }

  /**
   * 공유 이벤트 자동 체크
   */
  async checkShareEvent(userId: string, shareData: any): Promise<void> {
    try {
      const activeEvents = await this.getActiveEvents();
      const shareEvents = activeEvents.filter(
        event => event.condition_type === 'share_count' || 
                 event.condition_type === 'share_with_message'
      );

      for (const event of shareEvents) {
        const condition = event.condition_data;
        
        if (event.condition_type === 'share_count') {
          // 공유 횟수 체크
          const shareCount = await this.getUserShareCount(userId, event.id);
          
          if (shareCount >= condition.min_shares) {
            await this.autoEnterEvent(userId, event.id, {
              share_count: shareCount,
              method: 'auto'
            });
          }
        } else if (event.condition_type === 'share_with_message') {
          // 메시지 키워드 체크
          if (condition.keywords && shareData.message) {
            const hasKeyword = condition.keywords.some((keyword: string) =>
              shareData.message.toLowerCase().includes(keyword.toLowerCase())
            );
            
            if (hasKeyword) {
              await this.autoEnterEvent(userId, event.id, {
                message: shareData.message,
                method: 'auto'
              });
            }
          }
        }
        
        // 일일 체크 기록
        await this.recordDailyCheck(userId, event.id, 'share', {
          share_data: shareData,
          condition_met: true
        });
      }
    } catch (error) {
      console.error('공유 이벤트 체크 실패:', error);
    }
  }

  /**
   * 이벤트 자동 응모 처리
   */
  private async autoEnterEvent(
    userId: string, 
    eventId: string, 
    qualificationData: any
  ): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 오늘 이미 참여했는지 확인
      const { data: existing } = await supabase
        .from('event_participations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .eq('participation_date', today)
        .single();

      if (existing) {
        console.log('이미 오늘 참여한 이벤트입니다');
        return false;
      }

      // 자동 응모 등록
      const { error } = await supabase
        .from('event_participations')
        .insert({
          event_id: eventId,
          user_id: userId,
          auto_qualified: true,
          bonus_entries: 1,
          qualification_data: qualificationData,
          participation_method: 'auto',
          participation_date: today
        });

      if (error) {
        console.error('자동 응모 실패:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('자동 응모 처리 실패:', error);
      return false;
    }
  }

  /**
   * 수동/보너스 응모 처리
   */
  async addBonusEntry(
    userId: string, 
    eventId: string, 
    bonusData: any
  ): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 기존 참여 확인
      const { data: existing } = await supabase
        .from('event_participations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .eq('participation_date', today)
        .single();

      if (existing) {
        // 보너스 응모권 추가
        const { error } = await supabase
          .from('event_participations')
          .update({
            bonus_entries: existing.bonus_entries + 1,
            qualification_data: {
              ...existing.qualification_data,
              bonus: bonusData
            }
          })
          .eq('id', existing.id);

        if (error) {
          console.error('보너스 응모권 추가 실패:', error);
          return false;
        }
      } else {
        // 새로운 보너스 응모
        const { error } = await supabase
          .from('event_participations')
          .insert({
            event_id: eventId,
            user_id: userId,
            auto_qualified: false,
            bonus_entries: 1,
            qualification_data: bonusData,
            participation_method: 'bonus',
            participation_date: today
          });

        if (error) {
          console.error('보너스 응모 등록 실패:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('보너스 응모 처리 실패:', error);
      return false;
    }
  }

  /**
   * 일일 이벤트 체크 기록
   */
  private async recordDailyCheck(
    userId: string,
    eventId: string,
    checkType: string,
    checkData: any
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await supabase
        .from('daily_event_checks')
        .upsert({
          user_id: userId,
          event_id: eventId,
          check_type: checkType,
          check_data: checkData,
          condition_met: checkData.condition_met || false,
          check_date: today
        }, {
          onConflict: 'user_id,event_id,check_type,check_date'
        });
    } catch (error) {
      console.error('일일 체크 기록 실패:', error);
    }
  }

  /**
   * 사용자의 이벤트 참여 내역 조회
   */
  async getUserParticipations(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('event_participations')
      .select(`
        *,
        event:events(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('참여 내역 조회 실패:', error);
      return [];
    }

    return data || [];
  }

  /**
   * 사용자의 당첨 내역 조회
   */
  async getUserWinnings(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('event_winners')
      .select(`
        *,
        event:events(*),
        coupon:coupons(*)
      `)
      .eq('user_id', userId)
      .order('won_at', { ascending: false });

    if (error) {
      console.error('당첨 내역 조회 실패:', error);
      return [];
    }

    return data || [];
  }

  /**
   * 주제별 연속 사용 업데이트
   */
  private async updateTopicStreak(
    userId: string,
    eventId: string,
    topic: string
  ): Promise<void> {
    // 주제별 연속 사용 로직 구현
    // 이는 별도의 추적 테이블이나 로직이 필요할 수 있음
    console.log('주제 연속 사용 체크:', topic);
  }

  /**
   * 사용자의 공유 횟수 조회
   */
  private async getUserShareCount(userId: string, eventId: string): Promise<number> {
    // 이벤트 기간 동안의 공유 횟수 조회
    const event = await this.getEventById(eventId);
    if (!event) return 0;

    const { count, error } = await supabase
      .from('shared_readings')
      .select('*', { count: 'exact', head: true })
      .eq('shared_by', userId)
      .gte('created_at', event.start_date)
      .lte('created_at', event.end_date);

    if (error) {
      console.error('공유 횟수 조회 실패:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * 연속 일수 체크
   */
  async checkConsecutiveDays(userId: string, eventId: string, action: string): Promise<number> {
    const event = await this.getEventById(eventId);
    if (!event) return 0;

    const { data, error } = await supabase
      .from('daily_event_checks')
      .select('check_date')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .eq('check_type', action)
      .eq('condition_met', true)
      .order('check_date', { ascending: false });

    if (error || !data || data.length === 0) {
      return 0;
    }

    // 연속 일수 계산
    let consecutiveDays = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < data.length - 1; i++) {
      const currentDate = new Date(data[i].check_date);
      const nextDate = new Date(data[i + 1].check_date);
      
      const diffTime = currentDate.getTime() - nextDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    return consecutiveDays;
  }
}

// 싱글톤 인스턴스
export const eventService = new EventService();