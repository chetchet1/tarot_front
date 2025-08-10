# Vercel 배포 스크립트 (PowerShell)

Write-Host "🚀 타로 앱 Vercel 배포 시작..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 현재 위치 확인
$currentPath = Get-Location
Write-Host "현재 위치: $currentPath" -ForegroundColor Yellow

# frontend 폴더인지 확인
if ($currentPath -notmatch "frontend$") {
    Write-Host "⚠️  frontend 폴더가 아닙니다. frontend 폴더로 이동합니다..." -ForegroundColor Yellow
    Set-Location "E:\tarot-app\frontend"
}

# 프로덕션 빌드
Write-Host ""
Write-Host "📦 프로덕션 빌드 중..." -ForegroundColor Green
npm run build

# Vercel 배포
Write-Host ""
Write-Host "☁️  Vercel에 배포 중..." -ForegroundColor Green
npx vercel --prod

Write-Host ""
Write-Host "✅ 배포 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "다음 단계:" -ForegroundColor Yellow
Write-Host "1. 생성된 URL을 복사 (예: https://tarot-app-xxxxx.vercel.app)" -ForegroundColor White
Write-Host "2. ShareService.ts의 PRODUCTION_URL 수정" -ForegroundColor White
Write-Host "3. APK 재빌드: npm run build:android" -ForegroundColor White
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
