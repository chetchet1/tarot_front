import fs from 'node:fs';
import path from 'node:path';
import PptxGenJS from 'pptxgenjs';

const repoRoot = process.cwd();
const outDir = path.join(repoRoot, 'docs', '20260202 로직 로드맵 문서');
const outPath = path.join(outDir, '가입시 이메일 인증 로드맵.pptx');

fs.mkdirSync(outDir, { recursive: true });

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';

const themeFont = 'Calibri';
const colors = {
  bg: '0B1020',
  fg: 'FFFFFF',
  muted: 'C7D2FE',
  accent: 'F97316',
  accent2: 'A855F7',
  panel: '111A33',
  panel2: '16204A',
  ok: '22C55E',
  warn: 'F59E0B',
  bad: 'EF4444'
};

function addTitle(slide, title, subtitle) {
  slide.background = { color: colors.bg };
  slide.addText(title, {
    x: 0.6,
    y: 0.5,
    w: 12.1,
    h: 0.8,
    fontFace: themeFont,
    fontSize: 38,
    color: colors.fg,
    bold: true
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6,
      y: 1.35,
      w: 12.1,
      h: 0.6,
      fontFace: themeFont,
      fontSize: 18,
      color: colors.muted
    });
  }
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.6,
    y: 2.05,
    w: 12.1,
    h: 0.08,
    fill: { color: colors.accent2 }
  });
}

function addSectionHeader(slide, title, note) {
  slide.background = { color: colors.bg };
  slide.addText(title, {
    x: 0.6,
    y: 0.35,
    w: 12.1,
    h: 0.7,
    fontFace: themeFont,
    fontSize: 30,
    color: colors.fg,
    bold: true
  });
  if (note) {
    slide.addText(note, {
      x: 0.6,
      y: 1.05,
      w: 12.1,
      h: 0.45,
      fontFace: themeFont,
      fontSize: 14,
      color: colors.muted
    });
  }
}

function panel(slide, x, y, w, h, title, lines, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    fill: { color: opts.fill ?? colors.panel },
    line: { color: opts.border ?? colors.panel2, width: 1 }
  });
  slide.addText(title, {
    x: x + 0.25,
    y: y + 0.18,
    w: w - 0.5,
    h: 0.4,
    fontFace: themeFont,
    fontSize: 16,
    color: colors.fg,
    bold: true
  });
  slide.addText(Array.isArray(lines) ? lines.join('\n') : String(lines), {
    x: x + 0.25,
    y: y + 0.62,
    w: w - 0.5,
    h: h - 0.85,
    fontFace: themeFont,
    fontSize: 12.5,
    color: colors.muted,
    valign: 'top'
  });
}

function arrow(slide, x1, y1, x2, y2, color = colors.muted) {
  slide.addShape(pptx.ShapeType.line, {
    x: x1,
    y: y1,
    w: x2 - x1,
    h: y2 - y1,
    line: { color, width: 2, endArrowType: 'triangle' }
  });
}

// Slide 1: Title
{
  const slide = pptx.addSlide();
  addTitle(
    slide,
    '가입 시 이메일 인증 로드맵',
    'tarot-app (Vue + Capacitor + Supabase) | 로직/화면/환경별 동작 + SMTP 기초'
  );
  slide.addText(`생성: ${new Date().toLocaleString('ko-KR')}`, {
    x: 0.6,
    y: 6.6,
    w: 12.1,
    h: 0.4,
    fontFace: themeFont,
    fontSize: 12,
    color: '9CA3AF'
  });
}

// Slide 2: What users see
{
  const slide = pptx.addSlide();
  addSectionHeader(slide, '사용자 관점: 무엇이 언제 보이나', '회원가입 직후 → “인증 메일 발송 안내” 모달 → 메일 클릭 → 인증 완료 안내');
  panel(
    slide,
    0.6,
    1.6,
    6.0,
    5.2,
    'A. 회원가입 직후 (앱 내부)',
    [
      'Home 화면에서 LoginModal → 이메일 회원가입',
      '성공 시 EmailVerificationModal(인증 안내 모달) 표시',
      '사용자에게 “메일함 확인 → 링크 클릭 → 앱으로 돌아와 로그인” 안내',
      '',
      '관련 파일:',
      '- app/views/Home.vue',
      '- app/components/LoginModal.vue',
      '- app/components/EmailVerificationModal.vue'
    ].join('\n')
  );
  panel(
    slide,
    6.85,
    1.6,
    5.85,
    5.2,
    'B. 이메일 링크 클릭 (웹/브라우저)',
    [
      'Supabase가 emailRedirectTo 로 이동',
      '현재 프로젝트는 /auth/email-verified 로 이동하도록 설정',
      '해당 페이지는 웹에서도 열리도록 allowlist 처리 필요',
      '',
      '관련 파일:',
      '- app/services/supabase.ts (emailRedirectTo)',
      '- app/router/index.ts (public routes)',
      '- app/utils/platformCheck.ts (웹 차단 allowlist)',
      '- app/views/EmailVerified.vue'
    ].join('\n')
  );
}

// Slide 3: System overview
{
  const slide = pptx.addSlide();
  addSectionHeader(slide, '시스템 구성 요소', '이메일 인증은 “Supabase Auth”가 담당하고, 앱은 결과 페이지/가이드를 제공한다');

  panel(
    slide,
    0.6,
    1.5,
    3.9,
    5.3,
    '모바일 앱 (Capacitor)',
    [
      '- Vue SPA + WebView',
      '- 회원가입/로그인 UI',
      '- 이메일 인증 안내 모달',
      '- 딥링크 처리(OAuth/콜백)',
      '- 웹 차단 로직(배포환경)',
      '',
      '키 포인트:',
      'WebView 특성상 뷰포트/안전영역 문제가 자주 발생'
    ].join('\n')
  );

  panel(
    slide,
    4.75,
    1.5,
    3.9,
    5.3,
    'Supabase Auth',
    [
      '- signUp 시 확인 메일 발송',
      '- 메일의 링크는 “redirectTo”로 이동',
      '- 이메일 인증(verify) 처리',
      '',
      '키 포인트:',
      'redirectTo URL이 올바르지 않으면 404/차단/잘못된 페이지로 감'
    ].join('\n')
  );

  panel(
    slide,
    8.9,
    1.5,
    3.8,
    5.3,
    'Vercel (웹 호스팅)',
    [
      '- SPA 라우팅(/index.html rewrite)',
      '- 프리뷰/프로덕션 배포',
      '- “모바일 전용 앱” 정책과 충돌 가능',
      '',
      '키 포인트:',
      '웹 접근 차단(install 유도)와 “이메일 인증 페이지”는 서로 상충할 수 있어 allowlist 필요'
    ].join('\n')
  );
}

// Slide 4: Email signup flow (sequence)
{
  const slide = pptx.addSlide();
  addSectionHeader(slide, '플로우 1) 이메일 회원가입 → 인증 메일 발송', '실제 로직의 “트리거 지점”과 “데이터 흐름”');

  // swimlanes
  panel(slide, 0.6, 1.5, 4.0, 5.2, 'User', '앱에서 이메일/비번 입력\n회원가입 버튼 클릭', { fill: colors.panel });
  panel(slide, 4.8, 1.5, 4.0, 5.2, 'App (Vue/Store)', 'userStore.signUp()\nauthService.signUp()\nUI: EmailVerificationModal 표시', { fill: colors.panel });
  panel(slide, 9.0, 1.5, 3.7, 5.2, 'Supabase', 'auth.signUp()\nconfirm email 발송\nredirectTo 포함', { fill: colors.panel });

  arrow(slide, 2.6, 3.0, 5.0, 3.0, colors.accent2);
  slide.addText('회원가입 요청', { x: 3.2, y: 2.7, w: 2.2, h: 0.3, fontFace: themeFont, fontSize: 11, color: colors.muted });

  arrow(slide, 6.8, 3.8, 9.2, 3.8, colors.accent2);
  slide.addText('signUp + emailRedirectTo', { x: 7.15, y: 3.5, w: 2.6, h: 0.3, fontFace: themeFont, fontSize: 11, color: colors.muted });

  arrow(slide, 9.2, 4.9, 6.8, 4.9, colors.ok);
  slide.addText('응답(세션/유저)\n+ 메일 발송', { x: 7.0, y: 4.5, w: 2.5, h: 0.5, fontFace: themeFont, fontSize: 11, color: colors.muted });

  arrow(slide, 5.0, 5.9, 2.6, 5.9, colors.ok);
  slide.addText('“메일 확인 안내”\n모달 표시', { x: 3.05, y: 5.5, w: 2.5, h: 0.6, fontFace: themeFont, fontSize: 11, color: colors.muted });

  slide.addText('코드 포인트:\n- app/store/user.ts: signUp\n- app/services/supabase.ts: signUp(emailRedirectTo)\n- app/components/EmailVerificationModal.vue', {
    x: 0.6,
    y: 6.85,
    w: 12.1,
    h: 0.6,
    fontFace: themeFont,
    fontSize: 12,
    color: colors.muted
  });
}

// Slide 5: Clicking the email link
{
  const slide = pptx.addSlide();
  addSectionHeader(slide, '플로우 2) 이메일 링크 클릭 → 인증 완료 페이지', '웹 접근 차단 정책과 충돌하기 쉬운 구간');

  panel(
    slide,
    0.6,
    1.55,
    6.2,
    5.2,
    '이메일 링크',
    [
      'Supabase가 생성한 링크(토큰/코드 포함)',
      '→ emailRedirectTo 로 리다이렉트',
      '예: https://<vercel>/auth/email-verified',
      '',
      '주의:',
      '- 링크 파라미터는 query 또는 hash로 올 수 있음',
      '- SPA 라우팅(rewrite) 필요'
    ].join('\n')
  );
  panel(
    slide,
    7.05,
    1.55,
    5.65,
    5.2,
    '웹에서 열릴 때 필수 조건',
    [
      '1) Vercel rewrite(모든 경로 → /index.html)',
      '2) router에서 /auth/email-verified route 존재',
      '3) “웹 차단” 로직에서 이 경로는 예외 처리',
      '',
      '현재 코드:',
      '- app/router/index.ts: meta.isPublic',
      '- app/utils/platformCheck.ts: alwaysAllowedPaths'
    ].join('\n'),
    { fill: colors.panel }
  );
}

// Slide 6: The clipping problem
{
  const slide = pptx.addSlide();
  addSectionHeader(slide, '문제: “인증 메일 발송 안내” 모달 우측 잘림', '증상 → 원인 후보 → 해결 전략');

  panel(
    slide,
    0.6,
    1.5,
    6.1,
    5.3,
    '대표 증상',
    [
      '- 모달 오른쪽이 화면 밖으로 나가서 잘려 보임',
      '- 특히 Android 기기/특정 WebView에서 재현',
      '- 스크롤/회전/주소창 상태에 따라 달라짐',
      '',
      '관찰 포인트:',
      '- “모달 전체가 가운데가 아닌 오른쪽으로 밀림”인지',
      '- “모달 폭 자체가 뷰포트보다 큼”인지'
    ].join('\n'),
    { fill: colors.panel }
  );

  panel(
    slide,
    6.95,
    1.5,
    5.75,
    5.3,
    '가능한 원인(우선순위)',
    [
      '1) 부모 컨테이너(#app/body) overflow/transform 영향',
      '2) 100vw vs visualViewport 불일치(모바일 주소창/줌/키보드)',
      '3) fixed 요소가 특정 WebView에서 “클리핑”되는 버그',
      '4) 내부 텍스트(이메일) 줄바꿈이 폭을 밀어냄',
      '',
      '우리가 한 대응:',
      '- 모달을 Teleport(to="body")로 렌더링',
      '- 내부 요소 word-break/overflow-wrap 적용',
      '- 디버그 오버레이로 rect 로그/빨간 outline'
    ].join('\n'),
    { fill: colors.panel }
  );
}

// Slide 7: Debugging checklist
{
  const slide = pptx.addSlide();
  addSectionHeader(slide, '디버깅 절차(재현/증명 중심)', '“지금 보고 있는 배포가 최신인가?”부터 확정한다');

  panel(
    slide,
    0.6,
    1.5,
    12.1,
    5.4,
    '체크리스트',
    [
      '1) Debug overlay ON 후, build stamp(sha/time) 확인',
      '   - 웹: URL에 ?debugOverlay=1',
      '   - 앱: 좌측 상단 7번 연타(토글) → reload',
      '',
      '2) 회원가입 → 모달 뜬 상태에서:',
      '   - 모달 빨간 outline이 “화면 밖으로 나가는지” 확인',
      '   - (가능하면) 콘솔/오버레이에서 modalRect.right 값 확인',
      '',
      '3) 재현 환경 기록:',
      '   - 기기/OS/브라우저(또는 WebView)/화면해상도',
      '   - 키보드가 올라와있는지 여부',
      '   - 화면 회전 여부',
      '',
      '4) 수정 방향 결정:',
      '   - rect가 뷰포트보다 크면: 폭 계산/타이포/패딩 최적화',
      '   - rect는 정상인데 잘려 보이면: 상위 컨테이너 클리핑/렌더링 버그',
      '',
      '관련 코드:',
      '- app/main.ts (debug overlay + in-app toggle)',
      '- app/components/EmailVerificationModal.vue (rect logging)'
    ].join('\n'),
    { fill: colors.panel }
  );
}

// Slide 8: SMTP basics
{
  const slide = pptx.addSlide();
  addSectionHeader(slide, '기술 설명: SMTP란 무엇인가', '“메일을 보내는 프로토콜”이고, Gmail SMTP는 한도가 빡빡하다');

  panel(
    slide,
    0.6,
    1.5,
    6.0,
    5.3,
    'SMTP 한 줄 요약',
    [
      'SMTP(Simple Mail Transfer Protocol)는',
      '“서버가 서버에게 이메일을 전달할 때” 쓰는 표준 규약이다.',
      '',
      '앱에서 메일을 보낼 때는 보통:',
      '- (A) 우리 서버 → SMTP로 메일 전송',
      '- (B) 트랜잭션 메일 서비스(API) 호출',
      '',
      '중요:',
      '프론트(앱)에서 SMTP 계정/비번을 들고 보내면 보안상 위험'
    ].join('\n')
  );

  panel(
    slide,
    6.85,
    1.5,
    5.85,
    5.3,
    'Gmail SMTP에서 흔히 생기는 문제',
    [
      '- 무료/개인 Gmail은 발송량 제한이 낮음',
      '- 단시간 대량 발송하면 “rate limit” 또는 차단',
      '- 인증/스팸 정책이 계속 강화됨',
      '',
      '권장 대안:',
      '- Google Workspace + SMTP relay',
      '- Resend/SendGrid/Mailgun/SES 같은 트랜잭션 메일',
      '',
      '기술 선택 기준:',
      '- 발송량(일/월), 도메인 인증(SPF/DKIM/DMARC)',
      '- 비용, 로그/재시도, 템플릿 관리'
    ].join('\n'),
    { fill: colors.panel }
  );
}

// Slide 9: Action items
{
  const slide = pptx.addSlide();
  addSectionHeader(slide, '다음 액션', '인지부채 줄이기: “문서/로그/체크리스트”를 루틴화');

  panel(
    slide,
    0.6,
    1.5,
    12.1,
    5.2,
    '추천 작업',
    [
      '1) 이메일 인증 UX를 2단계로 분리:',
      '   - 회원가입 직후: “메일 발송 안내”는 단순하고 반응형으로',
      '   - 인증 완료: /auth/email-verified 페이지는 웹에서도 안정적으로',
      '',
      '2) “모달 잘림”은 데이터로 잡기:',
      '   - 디버그 오버레이로 build stamp + rect 로그 확보',
      '   - 재현 기기 1~2개를 고정(테스트 기준점)',
      '',
      '3) 이메일 발송 인프라 정리:',
      '   - 어떤 주체(서버/서버리스/외부)가 SMTP를 쓰는지부터 정리',
      '   - 트랜잭션 메일 서비스로 전환 검토',
      '',
      '4) 문서 업데이트:',
      '   - docs/20260202 로직 로드맵 문서/가입시 이메일 인증 로드맵.md 참고'
    ].join('\n')
  );
}

await pptx.writeFile({ fileName: outPath });
console.log(`Wrote: ${outPath}`);

