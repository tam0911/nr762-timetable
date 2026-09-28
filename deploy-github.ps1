# 豫豐花園巴士時刻表 — 部署到 GitHub Pages
# 用法：在 PowerShell 執行 .\deploy-github.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$repoName = "nr762-timetable"

Write-Host "檢查 GitHub 登入狀態..."
gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "請先登入 GitHub（會開啟瀏覽器）..."
  gh auth login --hostname github.com --git-protocol https --web
}

Write-Host "建立 GitHub repository 並推送..."
$remote = git remote get-url origin 2>$null
if (-not $remote) {
  gh repo create $repoName --public --source=. --remote=origin --push --description "豫豐花園 NR762/NR762A 居民巴士時刻表"
} else {
  Write-Host "Remote 已存在：$remote"
  git push -u origin main
}

Write-Host "啟用 GitHub Pages（GitHub Actions）..."
$owner = gh api user -q .login
gh api "repos/$owner/$repoName/pages" -X POST -f "build_type=workflow" 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Pages 可能已啟用，或請到 Settings → Pages 手動選 GitHub Actions"
}

Write-Host ""
Write-Host "完成！網站網址（部署需 1-2 分鐘）："
Write-Host "https://$owner.github.io/$repoName/" -ForegroundColor Green
