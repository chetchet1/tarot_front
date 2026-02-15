---
description: 프로젝트 보안 취약점 스캔
allowed-tools: [Read, Grep, Glob, Bash]
---

보안 전문가로서 이 Nuxt3 + Capacitor + Supabase 타로 앱의 보안 점검을 수행하세요.

## 점검 항목

1. **노출된 시크릿**: 소스코드에서 API 키, 패스워드, 토큰 하드코딩 검색
   - `sk-`, `supabase_key`, `password`, `secret` 패턴
   - .env 파일이 커밋되지 않았는지 확인
   - .gitignore 확인

2. **CLAUDE.md 규칙 위반**:
   - localStorage 사용 여부 (규칙 #2 위반)
   - 카드 데이터 JSON 직접 작성 (규칙 #1 위반)
   - 익명 사용자 로직 존재 여부 (규칙 #10 위반)

3. **인증 취약점**:
   - 세션 처리 로직 검토
   - 비밀번호 재설정 흐름 보안
   - OAuth redirect URL 검증

4. **프로덕션 디버그 코드**:
   - console.log 잔존 여부
   - debugger 문 검색
   - isDebugMode 같은 플래그

결과를 CRITICAL / HIGH / MEDIUM / LOW 등급으로 정리해서 보고하세요.
