---
description: 배포 준비 상태 검증 (빌드 전 체크)
allowed-tools: [Read, Grep, Glob, Bash]
---

배포 전 체크리스트를 검증하세요. 빌드 프로세스: npm run build:cap -> npx cap sync -> Android Studio

## 체크 항목

1. **디버그 코드**: console.log, debugger, isDebugMode 검색
2. **환경 설정**: .env.production 존재 및 값 확인 (값 자체를 노출하지 말 것, 키 존재 여부만 확인)
3. **버전 확인**: package.json 현재 버전 표시
4. **테스트 계정**: test@example.com, premium@example.com 참조 무결성
5. **localStorage 사용**: DB 방식이어야 함 (CLAUDE.md 규칙 #2)
6. **익명 사용자 로직**: 존재하면 안 됨 (CLAUDE.md 규칙 #10)
7. **git 상태**: 커밋되지 않은 변경사항 확인

각 항목을 PASS / FAIL / WARNING으로 보고하세요.
