// Supabase 설정 확인 스크립트
import { supabase } from '../services/supabase'

export async function checkSupabaseSetup() {
  console.log('=== Supabase 설정 확인 ===')
  
  // 1. Supabase URL 확인
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  console.log('Supabase URL:', supabaseUrl ? '✅ 설정됨' : '❌ 미설정')
  
  // 2. Supabase Anon Key 확인
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  console.log('Supabase Anon Key:', supabaseAnonKey ? '✅ 설정됨' : '❌ 미설정')
  
  // 3. 인증 상태 확인
  try {
    const { data: { user } } = await supabase.auth.getUser()
    console.log('현재 사용자:', user ? `✅ ${user.email}` : '❌ 로그인 안됨')
  } catch (error) {
    console.error('인증 확인 실패:', error)
  }
  
  // 4. Edge Function 테스트 (수동으로만 실행)
  console.log('\n=== Edge Function 테스트 ===')
  console.log('💡 수동 테스트를 원하면 콘솔에서: window.testEdgeFunction()')
  console.log('   자동 테스트는 API 비용 절감을 위해 비활성화됨')
  
  // 5. 데이터베이스 테이블 확인
  console.log('\n=== 데이터베이스 테이블 확인 ===')
  const tables = [
    'ai_interpretations',
    'user_ratings',
    'learned_patterns',
    'interpretation_cache'
  ]
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1)
      console.log(`${table}:`, error ? '❌ 없음' : '✅ 존재')
    } catch (error) {
      console.log(`${table}: ❌ 접근 불가`)
    }
  }
  
  console.log('\n=== 설정 완료 체크리스트 ===')
  console.log('1. [ ] Supabase 프로젝트 생성')
  console.log('2. [ ] 환경 변수 설정 (.env.local)')
  console.log('3. [ ] OpenAI API 키 설정 (supabase secrets set)')
  console.log('4. [ ] Edge Functions 배포')
  console.log('5. [ ] 데이터베이스 테이블 생성')
  console.log('6. [ ] RLS 정책 설정')
}

// 브라우저 콘솔에서 실행 가능하도록 전역 함수로 노출
if (typeof window !== 'undefined') {
  (window as any).checkSupabaseSetup = checkSupabaseSetup
}
