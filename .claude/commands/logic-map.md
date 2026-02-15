---
description: 특정 기능의 코드 흐름을 추적하여 로직 맵 생성
argument-hint: <기능명 예: 비밀번호재설정, 오늘의카드, 결제>
allowed-tools: [Read, Grep, Glob, Bash]
---

지정된 기능의 전체 코드 흐름을 추적하여 로직 맵을 만드세요.

## 대상 기능: $ARGUMENTS

## 추적 순서

1. **진입점**: 해당 기능이 시작되는 Vue 컴포넌트/뷰 찾기
2. **Composable**: 사용되는 composable 함수 추적
3. **Service**: 호출되는 서비스 레이어 추적
4. **Supabase**: 어떤 테이블에 어떤 쿼리를 하는지
5. **스키마 대조**: docs/schemas/DATABASE_SCHEMA.md와 실제 사용 비교

## 결과 형식

```
[뷰] -> [composable 함수] -> [service 함수] -> [Supabase 테이블.칼럼]
```

흐름도 형태로 간결하게 정리하고, 비정상 경로(에러 처리)도 포함하세요.
