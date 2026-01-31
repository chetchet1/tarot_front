# Vercel 배포 방법

이 문서는 tarot-garden(프론트엔드)의 Vercel 배포/도메인/이메일 인증 링크(404) 문제를 포함한 유지보수 절차를 정리합니다.

## 1) Vercel 배포 상태 확인
1. Vercel 대시보드 접속
2. 해당 프로젝트 선택
3. **Deployments** 탭에서 최근 배포가 존재하는지 확인
   - 최근 배포가 없거나 삭제됨 → 도메인 접속 시 404 발생 가능
4. **Production** 배포가 성공했는지 확인

## 2) 도메인 연결 확인 (404 해결 핵심)
1. 프로젝트 화면에서 **Settings → Domains** 이동
2. `tarot-garden.vercel.app`가 등록되어 있는지 확인
3. 상태가 **Valid**인지 확인
4. 등록이 없으면 **Add**로 추가
5. 배포 후 `https://tarot-garden.vercel.app` 접속 시 404가 아닌지 확인

※ 도메인이 다른 프로젝트에 붙어있거나 삭제된 프로젝트로 연결되어 있으면 404가 뜹니다.

## 3) Supabase 이메일 인증 링크가 404 뜨는 이유
- 이메일 링크는 Supabase의 **Site URL**을 기반으로 생성됨
- Site URL이 Vercel 주소인데 Vercel 쪽 도메인 배포가 끊겨있으면 404 발생

정상 설정 예시:
- Site URL: `https://tarot-garden.vercel.app`
- Redirect URLs: 
  - `com.tarotgarden.app://auth/callback`
  - `capacitor://localhost`
  - `http://localhost:8082/**`
  - 기타 배포/테스트 URL

> **주의:** Site URL에 앱 딥링크(`com.xxx.app://`)는 넣지 말 것

## 4) 실제 배포 플로우(간단)
1. 로컬에서 작업
2. GitHub `dev-gemini` 브랜치에 커밋/푸시
3. GitHub Actions가 실행되어 빌드/배포
4. Vercel 프로젝트에 연동되어 있으면 자동 배포됨
5. 배포 성공 후 Vercel 도메인 접속 확인

## 5) Vercel이 자동 배포되지 않을 때
- GitHub Actions 성공 여부 확인
- Vercel 프로젝트가 해당 GitHub 저장소에 연결되어 있는지 확인
- Vercel에서 Git 연동(Integrations → GitHub) 재확인
- Vercel Deployments가 멈춰있다면 수동 재배포(“Redeploy”) 가능

## 6) 자주 발생하는 문제 체크리스트
- [ ] 도메인(예: tarot-garden.vercel.app)이 다른 프로젝트에 연결됨
- [ ] 도메인 연결 해제됨 (Valid 아님)
- [ ] 최근 Production 배포가 삭제됨
- [ ] Supabase Site URL이 잘못됨(로컬/와일드카드 포함)
- [ ] 배포 성공했는데 DNS 캐시로 옛날 상태가 보임

## 7) 빠른 복구 요약
1. Vercel → 프로젝트 → Deployments 확인
2. Vercel → Settings → Domains에서 `tarot-garden.vercel.app` Valid 확인
3. Supabase → Authentication → URL Configuration에서 Site URL 확인
4. 필요시 Vercel에서 Redeploy

---

작성일: 2026-01-30
