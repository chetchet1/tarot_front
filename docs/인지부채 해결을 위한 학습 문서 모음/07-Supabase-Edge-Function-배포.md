# Supabase Edge Function 배포 방법

## Edge Function이란?

- 서버리스 함수 (서버 없이 코드 실행)
- Supabase 서버에서 실행됨
- 우리 앱에서는 **OpenAI API 호출** 용도로 사용
- 프론트엔드에서 직접 OpenAI를 호출하면 API 키가 노출되므로, Edge Function을 중간 서버로 사용

```
앱 (프론트엔드)
  → Supabase Edge Function 호출 (API 키 안전)
    → Edge Function이 OpenAI API 호출
    → AI 해석 결과 반환
  ← 해석 결과 수신
```

## 파일 위치

```
e:\tarot-app\supabase\functions\generate-interpretation\index.ts
```

이 파일이 AI 타로 해석을 생성하는 Edge Function이다.

## 배포 방법

### 사전 준비
1. Supabase CLI 설치 확인
```bash
supabase --version
```

2. 설치 안 되어있으면:
```bash
npm install -g supabase
```

3. Supabase 로그인:
```bash
supabase login
```
→ 브라우저에서 Supabase 계정 인증

### 배포 명령어

```bash
cd e:\tarot-app

# 특정 함수만 배포
supabase functions deploy generate-interpretation

# 모든 함수 한번에 배포
supabase functions deploy
```

### 배포 확인
- Supabase 대시보드 → Edge Functions 메뉴
- `generate-interpretation` 함수가 목록에 있으면 성공
- 마지막 배포 시간 확인

## 환경 변수 설정

Edge Function에서 사용하는 환경 변수 (Supabase 대시보드에서 설정):

| 변수명 | 역할 | 설정 위치 |
|--------|------|----------|
| `OPENAI_API_KEY` | OpenAI API 호출 키 | Supabase 대시보드 → Settings → Edge Functions |
| `SUPABASE_URL` | Supabase 프로젝트 URL | 자동 설정됨 |
| `SUPABASE_SERVICE_ROLE_KEY` | DB 접근 키 | 자동 설정됨 |

### 환경 변수 설정 방법
```bash
supabase secrets set OPENAI_API_KEY=sk-xxxxxxxxxxxx
```

또는 Supabase 대시보드 → Settings → Edge Functions → Secrets에서 직접 입력

## 예정된 변경: GPT 모델 교체

### 변경 사항
`index.ts` 75번째 줄:
```typescript
// 변경 전
model: 'gpt-3.5-turbo'

// 변경 후
model: 'gpt-5-nano'
```

### 왜 바꾸는가?
| 항목 | gpt-3.5-turbo | gpt-5-nano |
|------|--------------|------------|
| 입력 비용 | $0.50/1M 토큰 | $0.05/1M 토큰 |
| 출력 비용 | $1.50/1M 토큰 | $0.40/1M 토큰 |
| 성능 | 2023년 수준 | 2025년 최신 |
| 컨텍스트 | 16K 토큰 | 400K 토큰 |

### 바꾼 후 할 일
1. `index.ts`에서 model 이름 변경
2. `supabase functions deploy generate-interpretation` 실행
3. 앱에서 점술 해석이 정상 동작하는지 확인
