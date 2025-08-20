// 오늘의 카드 관련 서비스 함수들
import { supabase } from './supabase';
import type { TarotCard } from '../types/tarot';

interface SaveDailyCardParams {
  userId: string;
  card: TarotCard;
  date: string;
  isTestAccount?: boolean;
}

/**
 * 오늘의 카드를 daily_cards 테이블에 저장
 * readings 테이블 저장은 현재 권한 문제로 스킵
 */
export async function saveDailyCardWithReading(
  userId: string,
  card: TarotCard,
  date: string,
  isTestAccount: boolean = false
) {
  console.log('===== saveDailyCardWithReading 시작 =====');
  console.log('👤 사용자 정보:');
  console.log('  - User ID:', userId);
  console.log('  - 테스트 계정 여부:', isTestAccount);
  console.log('🎴 카드 정보:');
  console.log('  - Card ID:', card?.id);
  console.log('  - Card Name:', card?.name_kr);
  console.log('📅 날짜:', date);
  console.log('=========================================');
  
  // card가 undefined인지 체크
  if (!card || !card.id) {
    console.error('카드 정보가 없습니다:', card);
    return null;
  }
  
  // 테스트 계정인 경우 기존 데이터 삭제
  if (isTestAccount) {
    console.log('🧹 테스트 계정 데이터 정리 시작...');
    await cleanupTestAccountData(userId, date);
  }
  
  const results = {
    dailyCard: null as any,
    reading: null as any,
    errors: [] as string[]
  };
  
  try {
    // 1. 먼저 중복 체크
    const { data: existingDaily } = await supabase
      .from('daily_cards')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();
    
    // readings 테이블에 이미 있는지 확인
    const { data: existingReading } = await supabase
      .from('readings')
      .select('id')
      .eq('user_id', userId)
      .eq('spread_id', 'daily_card')
      .eq('question', `${date} 오늘의 카드`)
      .maybeSingle();
    
    // 2. daily_cards 저장 (없을 때만)
    if (!existingDaily) {
      console.log('💾 daily_cards 테이블에 새 데이터 저장 중...');
      console.log('  저장할 데이터:', {
        user_id: userId,
        card_id: card.id,
        date: date,
        orientation: 'upright'
      });
      
      const { data: savedDaily, error: dailyError } = await supabase
        .from('daily_cards')
        .insert({
          user_id: userId,
          card_id: card.id,
          date: date,
          orientation: 'upright'
        })
        .select('*')
        .single();
      
      if (dailyError) {
        console.error('❌ daily_cards 저장 실패!');
        console.error('  에러 코드:', dailyError.code);
        console.error('  에러 메시지:', dailyError.message);
        console.error('  에러 상세:', dailyError.details);
        console.error('  에러 힌트:', dailyError.hint);
        results.errors.push(`daily_cards: ${dailyError.message}`);
      } else {
        console.log('✅ daily_cards 저장 성공!');
        console.log('  저장된 ID:', savedDaily?.id);
        results.dailyCard = savedDaily;
      }
    } else {
      console.log('daily_cards 이미 존재함');
      results.dailyCard = existingDaily;
    }
    
    // 3. readings 테이블에도 저장 (점괘 기록 표시를 위해)
    if (!existingReading) {
      const cardData = {
        id: card.id,
        cardNumber: card.id,
        name: card.name,
        nameKr: card.name_kr,
        orientation: 'upright',
        is_reversed: false,
        arcana: card.arcana,
        suit: card.suit,
        number: card.number,
        element: card.element,
        keywords: card.keywords,
        meanings: card.meanings,
        imageUrl: card.image_url
      };
      
      const readingData = {
        user_id: userId,
        spread_id: 'daily_card',
        topic: 'general',
        question: `${date} 오늘의 카드`,
        cards: [cardData],
        overall_message: `오늘의 카드: ${card.name_kr}`,
        is_premium: false,
        shared: false,
        created_at: new Date().toISOString()
      };
      
      // spread_type 필드가 있다면 추가 (데이터베이스에 따라)
      // readingData['spread_type'] = 'daily_card';
      
      console.log('💾 readings 테이블에 새 데이터 저장 중...');
      console.log('  저장할 데이터 (요약):', {
        user_id: readingData.user_id,
        spread_id: readingData.spread_id,
        question: readingData.question,
        card_count: readingData.cards?.length
      });
      
      const { data: savedReading, error: readingError } = await supabase
        .from('readings')
        .insert(readingData)
        .select('*')
        .single();
      
      if (readingError) {
        console.error('❌ readings 저장 실패!');
        console.error('  에러 코드:', readingError.code);
        console.error('  에러 메시지:', readingError.message);
        console.error('  에러 상세:', readingError.details);
        console.error('  에러 힌트:', readingError.hint);
        results.errors.push(`readings: ${readingError.message}`);
      } else {
        console.log('✅ readings 저장 성공!');
        console.log('  저장된 ID:', savedReading?.id);
        results.reading = savedReading;
      }
    } else {
      console.log('readings 이미 존재함');
      results.reading = existingReading;
    }
    
    // 4. 결과 반환 - DailyCard.vue에서 기대하는 형식으로
    if (results.errors.length > 0) {
      console.warn('일부 저장 실패:', results.errors);
    }
    
    // daily_cards 데이터에 card 정보 추가하여 반환
    if (results.dailyCard) {
      results.dailyCard.card = card;
      return results.dailyCard;
    }
    
    return null;
    
  } catch (error) {
    console.error('saveDailyCardWithReading 예외:', error);
    throw error;
  }
}

/**
 * 테스트 계정의 기존 데이터 삭제
 */
async function cleanupTestAccountData(userId: string, date: string) {
  console.log('테스트 계정 데이터 정리 시작');
  
  // daily_cards 삭제
  const { error: dailyDeleteError } = await supabase
    .from('daily_cards')
    .delete()
    .eq('user_id', userId)
    .eq('date', date);
  
  if (dailyDeleteError) {
    console.log('daily_cards 삭제 실패 (무시):', dailyDeleteError);
  }
  
  // readings 테이블에서도 삭제
  const { error: readingDeleteError } = await supabase
    .from('readings')
    .delete()
    .eq('user_id', userId)
    .eq('spread_id', 'daily_card')
    .eq('question', `${date} 오늘의 카드`);
  
  if (readingDeleteError) {
    console.log('readings 삭제 실패 (무시):', readingDeleteError);
  }
  
  console.log('테스트 계정 데이터 정리 완료');
}

/**
 * 이미 뽑은 오늘의 카드에 대해 readings 테이블 동기화
 */
export async function syncDailyCardToReadings(userId: string, card: TarotCard, date: string) {
  console.log('syncDailyCardToReadings 시작:', { userId, cardId: card.id, date });
  
  try {
    // readings에 이미 있는지 확인
    const { data: existingReading } = await supabase
      .from('readings')
      .select('id')
      .eq('user_id', userId)
      .eq('spread_id', 'daily_card')
      .eq('question', `${date} 오늘의 카드`)
      .maybeSingle();
    
    if (existingReading) {
      console.log('readings에 이미 존재함');
      return existingReading;
    }
    
    // 없으면 새로 저장
    const cardData = {
      id: card.id,
      cardNumber: card.id,
      name: card.name,
      nameKr: card.name_kr,
      orientation: 'upright',
      is_reversed: false,
      arcana: card.arcana,
      suit: card.suit,
      number: card.number,
      element: card.element,
      keywords: card.keywords,
      meanings: card.meanings,
      imageUrl: card.image_url
    };
    
    const readingData = {
      user_id: userId,
      spread_id: 'daily_card',
      topic: 'general',
      question: `${date} 오늘의 카드`,
      cards: [cardData],
      overall_message: `오늘의 카드: ${card.name_kr}`,
      is_premium: false,
      shared: false,
      created_at: new Date().toISOString()
    };
    
    const { data: savedReading, error } = await supabase
      .from('readings')
      .insert(readingData)
      .select('*')
      .single();
    
    if (error) {
      console.error('readings 동기화 실패:', error);
      throw error;
    }
    
    console.log('readings 동기화 성공');
    return savedReading;
    
  } catch (error) {
    console.error('syncDailyCardToReadings 예외:', error);
    throw error;
  }
}
