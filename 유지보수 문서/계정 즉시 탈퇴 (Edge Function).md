# 계정 즉시 탈퇴 (Edge Function)

이 문서는 앱에서 "계정 삭제" 버튼을 누르면 **즉시 탈퇴**되도록 하는 방법을 정리합니다.

## 개요
- 클라이언트(앱)에서 직접 Supabase 사용자 삭제는 보안상 불가능
- **Supabase Edge Function**을 통해 서비스 롤 권한으로 삭제해야 함

## 1) 함수 코드 위치
`supabase/functions/delete-account/index.ts`

## 2) 필요한 환경변수
Supabase 프로젝트에 아래 환경변수를 설정해야 함:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

> 서비스 롤 키는 절대 클라이언트에 넣지 말 것.

## 3) 함수 배포
Supabase CLI가 필요:
```
supabase login
supabase link --project-ref <프로젝트_레퍼런스>
supabase functions deploy delete-account
```

## 4) 앱 호출 흐름
앱에서 `supabase.functions.invoke('delete-account')` 호출
- Supabase JS가 자동으로 JWT를 붙여 호출
- 함수는 JWT로 사용자 확인 후 데이터/계정 삭제

## 5) 삭제되는 데이터
기본 삭제 대상:
- readings (user_id)
- ai_interpretations (user_id)
- subscriptions (user_id)
- user_stats (user_id)
- profiles (id)
- Supabase Auth 사용자

필요시 테이블 목록 추가 가능.

## 6) 테스트 절차
1. 로그인 후 “계정 삭제” 클릭
2. 즉시 로그아웃 + 홈 이동
3. Supabase Auth > Users에서 해당 계정 삭제 확인

---
작성일: 2026-01-30
