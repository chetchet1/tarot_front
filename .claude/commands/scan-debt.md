---
description: 코드레벨 인지부채 분석 및 문서화 필요 영역 식별
allowed-tools: [Read, Grep, Glob, Bash]
---

코드베이스의 인지부채를 분석하세요.

## 분석 항목

1. **TODO/FIXME/HACK 코멘트**: 위치와 내용 수집
2. **비즈니스 로직 미문서화**: 50줄 이상 함수 중 설명 없는 것
3. **CLAUDE.md 규칙 위반**:
   - localStorage 사용 (-> DB여야 함)
   - 익명 사용자 로직 (-> 없어야 함)
   - 카드 데이터 JSON 직접 작성 (-> Supabase 참조여야 함)
4. **데드 코드**: 사용되지 않는 export, 도달 불가능한 분기
5. **핵심 로직 추적**: composables/, services/ 의 주요 함수 목록과 역할

## 결과 형식

우선순위별 정리:
- CRITICAL: CLAUDE.md 규칙 위반
- HIGH: 핵심 비즈니스 로직 미문서화
- MEDIUM: 긴 함수, 복잡한 조건문
- LOW: 사소한 TODO

파일 경로와 라인 번호를 포함하세요.
