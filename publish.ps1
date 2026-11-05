# =====================================================
#  Корвилид — публикация сайта на GitHub Pages
#  Запуск: правой кнопкой по файлу -> «Выполнить с помощью PowerShell»
#  или в PowerShell:  powershell -ExecutionPolicy Bypass -File .\publish.ps1
#  Повторный запуск = обновить сайт на GitHub.
# =====================================================
$ErrorActionPreference = 'Continue'
$Repo = 'korvilid'
Set-Location $PSScriptRoot
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Need($cmd, $id) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    Write-Host "Устанавливаю $cmd ..." -ForegroundColor Yellow
    winget install --id $id -e --accept-source-agreements --accept-package-agreements
    $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
      Write-Host "Не удалось найти $cmd. Закройте PowerShell, откройте заново и запустите скрипт ещё раз." -ForegroundColor Red
      Read-Host 'Enter — выход'; exit 1
    }
  }
}
Need git 'Git.Git'
Need gh  'GitHub.cli'

# Вход в GitHub (один раз, откроется браузер)
gh auth status *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Сейчас откроется браузер для входа в GitHub. Скопируйте код из окна PowerShell.' -ForegroundColor Cyan
  gh auth login --hostname github.com --web --git-protocol https
}
$User = (gh api user --jq .login).Trim()
Write-Host "Аккаунт GitHub: $User" -ForegroundColor Green

# Git в этой папке
if (-not (Test-Path .git)) { git init -b main | Out-Null }
if (-not (git config user.email)) { git config user.email "$User@users.noreply.github.com"; git config user.name $User }
gh auth setup-git *> $null

git add -A
git commit -m ("Сайт Корвилид: обновление " + (Get-Date -Format 'yyyy-MM-dd HH:mm')) *> $null

# Репозиторий на GitHub (публичный — бесплатный GitHub Pages работает только с публичными)
gh repo view "$User/$Repo" *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Создаю репозиторий $User/$Repo ..." -ForegroundColor Yellow
  gh repo create $Repo --public --source . --remote origin --push
} else {
  if (-not (git remote 2>$null | Select-String -Quiet 'origin')) { git remote add origin "https://github.com/$User/$Repo.git" }
  git push -u origin main
}

# Включаем GitHub Pages (если уже включено — просто пропустится)
gh api -X POST "repos/$User/$Repo/pages" -f "source[branch]=main" -f "source[path]=/" *> $null

$Url = "https://$User.github.io/$Repo/"
Write-Host ''
Write-Host "Готово! Сайт будет доступен через 1-2 минуты:" -ForegroundColor Green
Write-Host $Url -ForegroundColor Cyan
Write-Host 'Форма заявки на GitHub Pages не отправляется (там нет PHP) — она заработает на korvilid.ru.' -ForegroundColor DarkGray
Start-Process $Url
Read-Host 'Enter — закрыть'
