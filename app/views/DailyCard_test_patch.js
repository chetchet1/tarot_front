// 테스트 계정 캐싱 비활성화 패치
// DailyCard.vue의 generateInterpretation 함수에서 사용할 코드

// 1. generateInterpretation 함수 내 캐싱 부분 수정
// 기존 코드:
/*
      // interpretation_data 컬럼이 있는 경우만 DB에 캐싱 시도
      try {
        const today = new Date().toISOString().split('T')[0];
        const { error: updateError } = await supabase
          .from('daily_cards')
          .update({ interpretation_data: data.interpretation })
          .eq('user_id', userStore.currentUser?.id)
          .eq('date', today);
        
        if (updateError) {
          console.log('interpretation_data 컬럼 없거나 업데이트 실패:', updateError);
        } else {
          console.log('해석 데이터 캐싱 성공');
        }
      } catch (cacheError) {
        console.log('DB 캐싱 스킵 (컬럼 없음)');
      }
*/

// 새로운 코드:
/*
      // 테스트 계정은 캐싱하지 않음
      const isTestAccount = userStore.currentUser?.email === 'test@example.com';
      
      if (!isTestAccount) {
        // 일반 계정만 interpretation_data 컬럼에 DB 캐싱 시도
        try {
          const today = new Date().toISOString().split('T')[0];
          const { error: updateError } = await supabase
            .from('daily_cards')
            .update({ interpretation_data: data.interpretation })
            .eq('user_id', userStore.currentUser?.id)
            .eq('date', today);
          
          if (updateError) {
            console.log('interpretation_data 컬럼 없거나 업데이트 실패:', updateError);
          } else {
            console.log('해석 데이터 캐싱 성공');
          }
        } catch (cacheError) {
          console.log('DB 캐싱 스킵 (컬럼 없음)');
        }
      } else {
        console.log('테스트 계정: 해석 데이터 캐싱 스킵');
      }
*/

// 2. 기본 해석 캐싱 부분도 동일하게 수정 필요
// 파일 마지막 부분의 catch 블록 내:
/*
    // 테스트 계정 확인
    const isTestAccount = userStore.currentUser?.email === 'test@example.com';
    
    if (!isTestAccount) {
      // interpretation_data 컬럼이 있는 경우만 기본 해석도 DB에 캐싱
      try {
        const today = new Date().toISOString().split('T')[0];
        const { error: updateError } = await supabase
          .from('daily_cards')
          .update({ interpretation_data: interpretation.value })
          .eq('user_id', userStore.currentUser?.id)
          .eq('date', today);
        
        if (updateError) {
          console.log('기본 해석 캐싱 스킵:', updateError?.message);
        }
      } catch (cacheError) {
        console.log('interpretation_data 컬럼 없음, 캐싱 스킵');
      }
    } else {
      console.log('테스트 계정: 기본 해석 캐싱 스킵');
    }
*/

console.log(`
=== DailyCard.vue 수정 지침 ===

test@example.com 계정에 대해서만 캐싱을 비활성화하려면:

1. loadTodayCard 함수는 이미 수정됨 (테스트 계정의 경우 기존 데이터 삭제)

2. generateInterpretation 함수 내 두 곳 수정 필요:
   - AI 해석 성공 시 캐싱 부분
   - 실패 시 기본 해석 캐싱 부분

3. 각 캐싱 부분에서:
   - isTestAccount 변수로 테스트 계정 확인
   - 테스트 계정이 아닌 경우에만 캐싱 수행

이렇게 하면 test@example.com 계정은:
- 항상 새로운 카드를 뽑을 수 있음
- AI 해석이 캐싱되지 않아 매번 새로 생성됨
- 다른 계정들은 기존대로 작동
`);