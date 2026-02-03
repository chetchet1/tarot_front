import fs from 'node:fs';
import path from 'node:path';
import PptxGenJS from 'pptxgenjs';

const repoRoot = process.cwd();
const outDir = path.join(repoRoot, 'docs', '20260202 로직 로드맵 문서');
const outPath = path.join(outDir, '가입시 이메일 인증 로드맵 (코드레벨+설정).pptx');

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
    fontSize: 36,
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
      fontSize: 16,
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
    fontSize: 28,
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
      fontSize: 13.5,
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
    fontSize: 15.5,
    color: colors.fg,
    bold: true
  });
  slide.addText(Array.isArray(lines) ? lines.join('\n') : String(lines), {
    x: x + 0.25,
    y: y + 0.62,
    w: w - 0.5,
    h: h - 0.85,
    fontFace: themeFont,
    fontSize: 12.2,
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
    '가입 시 이메일 인증 로드맵 (코드레벨+설정)',
    '회원가입 → Supabase Auth → SMTP(Gmail) → 메일 클릭 → /auth/email-verified → 앱 딥링크'
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
  panel(slide, 0.6, 1.6, 6.0, 5.2, 'A. 회원가입 직후 (앱 내부)', [
    'Home 화면에서 LoginModal → 이메일 회원가입',
    '성공 시 EmailVerificationModal(인증 안내 모달) 표시',
    '사용자에게 “메일함 확인 → 링크 클릭 → 앱으로 돌아와 로그인” 안내',
    '',
    '관련 파일:',
    '- app/views/Home.vue',
    '- app/components/LoginModal.vue',
    '- app/store/user.ts',
    '- app/components/EmailVerificationModal.vue'
  ]);
  panel(slide, 6.85, 1.6, 5.85, 5.2, 'B. 이메일 링크 클릭 (웹/브라우저)', [
    'Supabase가 인증 처리 후 emailRedirectTo로 이동',
    '현재 프로젝트는 /auth/email-verified 로 이동하도록 설정',
    '해당 페이지는 웹에서도 열리도록 allowlist 처리 필요',
    '',
    '관련 파일:',
    '- app/services/supabase.ts (emailRedirectTo)',
    '- app/router/index.ts (/auth/email-verified)',
    '- app/utils/platformCheck.ts (웹 차단 allowlist)',
    '- app/views/EmailVerified.vue'
  ]);
}

// Slide 3: System overview
{
  const slide = pptx.addSlide();
  addSectionHeader(slide, '시스템 구성 요소', '핵심: 이메일 발송은 “Supabase Auth + SMTP Provider”가 담당');

  panel(slide, 0.6, 1.5, 3.9, 5.3, '모바일 앱 (Capacitor)', [
    '- Vue SPA + WebView',
    '- 회원가입/로그인 UI',
    '- 인증 메일 발송 안내 모달',
    '- 딥링크 처리(AppUrlOpen)',
    '',
    '주의: WebView는 뷰포트/안전영역 이슈가 잦음'
  ]);

  panel(slide, 4.75, 1.5, 3.9, 5.3, 'Supabase Auth', [
    '- signUp 시 확인 메일 발송',
    '- 메일 링크 클릭 시 verify 처리',
    '- emailRedirectTo로 리다이렉트',
    '',
    '중요: SMTP 설정이 깨지면 “메일 발송 자체가 실패”'
  ]);

  panel(slide, 8.9, 1.5, 3.8, 5.3, 'SMTP Provider (예: Gmail)', [
    '- 실제 이메일을 “보내는” 주체',
    '- quota(발송량 제한), 보안 차단, 인증 실패가 장애 포인트',
    '',
    '권장: 트랜잭션 메일 서비스(Resend/SendGrid/SES) 고려'
  ]);
}

// Slide 4: Email signup flow (sequence)
{
  const slide = pptx.addSlide();
  addSectionHeader(slide, '플로우 1) 이메일 회원가입 → 인증 메일 발송', '“어디서 메일이 ‘보내지게’ 되는가”');

  panel(slide, 0.6, 1.5, 4.0, 5.2, 'User', '앱에서 이메일/비번 입력\n회원가입 버튼 클릭');
  panel(slide, 4.8, 1.5, 4.0, 5.2, 'App (Vue/Store)', 'userStore.signUp()\nauthService.signUp()\nUI: EmailVerificationModal 표시');
  panel(slide, 9.0, 1.5, 3.7, 5.2, 'Supabase', 'auth.signUp()\nconfirm email 발송\nemailRedirectTo 포함');

  arrow(slide, 2.6, 3.0, 5.0, 3.0, colors.accent2);
  slide.addText('회원가입 요청', { x: 3.2, y: 2.7, w: 2.2, h: 0.3, fontFace: themeFont, fontSize: 11, color: colors.muted });

  arrow(slide, 6.8, 3.8, 9.2, 3.8, colors.accent2);
  slide.addText('signUp + emailRedirectTo', { x: 7.15, y: 3.5, w: 2.6, h: 0.3, fontFace: themeFont, fontSize: 11, color: colors.muted });

  arrow(slide, 9.2, 4.9, 6.8, 4.9, colors.ok);
  slide.addText('응답 + 메일 발송', { x: 7.3, y: 4.6, w: 2.4, h: 0.3, fontFace: themeFont, fontSize: 11, color: colors.muted });

  arrow(slide, 5.0, 5.9, 2.6, 5.9, colors.ok);
  slide.addText('“메일 확인 안내” 모달', { x: 3.05, y: 5.6, w: 2.8, h: 0.3, fontFace: themeFont, fontSize: 11, color: colors.muted });
}

// Slide 5: Code-level call stack (signup)
{
  const slide = pptx.addSlide();
  addSectionHeader(slide, '코드레벨: 가입 → 인증메일 발송 호출 스택', '프론트에서 “메일 발송”을 직접 하지 않는다. Supabase Auth가 한다.');

  panel(slide, 0.6, 1.55, 12.1, 5.25, 'Call Stack (핵심 경로)', [
    '1) app/components/LoginModal.vue',
    '   - 회원가입 버튼 클릭 → userStore.signUp(email, password, userData)',
    '',
    '2) app/store/user.ts',
    '   - await authService.signUp(email, password, userData)',
    '   - 자동 로그인 안 함(이메일 인증 대기 UX)',
    '',
    '3) app/services/supabase.ts (authService.signUp)',
    '   - baseUrl = VITE_APP_URL || window.location.origin',
    '   - redirectUrl = `${baseUrl}/auth/email-verified`',
    '   - supabase.auth.signUp({ ..., options: { emailRedirectTo: redirectUrl, data: userData } })',
    '',
    '4) Supabase Auth(서버)',
    '   - “Confirm signup” 이메일 발송(= SMTP Provider로 전송)'
  ], { fill: colors.panel });
}

// Slide 6: Clicking the email link
{
  const slide = pptx.addSlide();
  addSectionHeader(slide, '플로우 2) 메일에서 “인증하기” 클릭', '메일 클릭은 보통 브라우저에서 열린다 → emailRedirectTo로 이동');

  panel(slide, 0.6, 1.55, 6.2, 5.25, '메일 링크', [
    'Supabase 메일 링크는 토큰/코드로 인증 처리 후',
    'emailRedirectTo로 리다이렉트된다.',
    '',
    '현재 emailRedirectTo:',
    '  https://<도메인>/auth/email-verified',
    '',
    '필수:',
    '- Vercel SPA rewrite',
    '- router에 /auth/email-verified 라우트 존재',
    '- “웹 차단 정책”에서 allowlist'
  ]);

  panel(slide, 6.95, 1.55, 5.75, 5.25, '코드 근거', [
    '- app/services/supabase.ts:',
    '  emailRedirectTo = `${baseUrl}/auth/email-verified`',
    '',
    '- app/router/index.ts:',
    '  /auth/email-verified → EmailVerified (public)',
    '',
    '- app/utils/platformCheck.ts:',
    '  alwaysAllowedPaths에 /auth/email-verified 포함'
  ]);
}

// Slide 7: Web -> App callback (current + recommended)
{
  const slide = pptx.addSlide();
  addSectionHeader(slide, '웹 → 앱 콜백(딥링크) 현재 구현과 개선점', '현재는 “앱으로 열기 버튼”이 com.tarotgarden.app://auth/callback 로 보냄');

  panel(slide, 0.6, 1.55, 6.15, 5.25, '현재 구현(문제점 포함)', [
    'EmailVerified.vue:',
    "  window.location.href = 'com.tarotgarden.app://auth/callback'",
    '',
    'deepLinks.ts:',
    '- auth/callback + access_token/refresh_token 있을 때만 setSession',
    '',
    '⚠️ 이메일 인증 링크에는 토큰이 없어서',
    '   앱이 열려도 no_tokens 에러로 갈 수 있음'
  ]);

  panel(slide, 6.95, 1.55, 5.75, 5.25, '개선 추천(운영 안정성)', [
    '옵션 A(가장 간단/확실):',
    "- EmailVerified 버튼을 'com.tarotgarden.app://auth/email-verified'로 변경",
    '- deepLinks.ts에서 이 경로를 받으면:',
    '  → 홈으로 이동 + “인증 완료, 로그인하세요” 안내',
    '',
    '옵션 B(자동으로 앱 열리게):',
    '- Universal Links / App Links 설정',
    '- 작업량 큼(도메인 소유/설정/앱 설정 필요)'
  ]);
}

// Slide 8: Supabase settings checklist
{
  const slide = pptx.addSlide();
  addSectionHeader(slide, 'Supabase 설정 체크리스트(필수)', '메일 발송/리다이렉트/404/차단 문제는 대부분 여기서 난다');

  panel(slide, 0.6, 1.55, 12.1, 5.25, 'Supabase Auth', [
    'A) URL / Redirect allowlist',
    '- Site URL: 프로덕션 도메인',
    '- Additional Redirect URLs:',
    '  - https://<도메인>/auth/email-verified',
    '  - https://<도메인>/auth/reset-password',
    '  - https://<도메인>/auth/callback',
    '  - (프리뷰 도메인도 필요하면 추가)',
    '',
    'B) Email templates',
    '- Confirm signup 템플릿의 “Confirm URL” 동작 확인',
    '',
    'C) SMTP Provider',
    '- 기본 SMTP vs 커스텀 SMTP',
    '- 커스텀(예: Gmail)을 쓰면 해당 계정 쿼터/차단이 곧 장애가 됨'
  ]);
}

// Slide 9: Gmail SMTP setup & quota troubleshooting
{
  const slide = pptx.addSlide();
  addSectionHeader(slide, 'Gmail SMTP(자동 발신) 설정 + “무료 사용량 초과” 추적', '확정은 “SMTP 에러 메시지”로만 가능');

  panel(slide, 0.6, 1.55, 6.15, 5.25, 'Gmail SMTP 설정(일반적인 방법)', [
    '1) Gmail 계정에 2단계 인증(2FA) 활성화',
    '2) 앱 비밀번호(App Password) 생성',
    '3) Supabase SMTP에 입력:',
    '   - Host: smtp.gmail.com',
    '   - Port: 587(STARTTLS) 또는 465(SSL)',
    '   - Username: Gmail 주소',
    '   - Password: 앱 비밀번호',
    '   - From: Gmail 주소(또는 허용 발신자)',
    '',
    '주의: 개인 Gmail은 쿼터/차단이 잦음'
  ]);

  panel(slide, 6.95, 1.55, 5.75, 5.25, '장애 원인 확정 방법(추천 순서)', [
    '1) Supabase Dashboard 로그에서',
    '   SMTP 실패 메시지/응답코드를 확인',
    '2) SMTP “테스트 메일” 기능이 있으면 실행',
    '3) Gmail 보안 경고/차단(의심 로그인) 확인',
    '',
    '결론:',
    '“무료 사용량 초과”인지 추측만 하지 말고',
    'SMTP 응답(예: quota exceeded)을 확보해야 함'
  ]);
}

await pptx.writeFile({ fileName: outPath });
console.log(`Wrote: ${outPath}`);

