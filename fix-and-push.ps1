# Скрипт для исправления проблемы с отправкой в GitHub
# Используйте этот скрипт, если получили ошибку "src refspec main does not match any"

$repoUrl = "https://github.com/gilani1234/healthytracker.git"

Write-Host "Проверка состояния репозитория..." -ForegroundColor Yellow

# Проверяем, инициализирован ли репозиторий
if (-not (Test-Path ".git")) {
    Write-Host "Инициализация git репозитория..." -ForegroundColor Green
    git init
} else {
    Write-Host "Репозиторий уже инициализирован" -ForegroundColor Green
}

# Проверяем, добавлен ли remote
$remoteExists = git remote | Select-String -Pattern "origin" -Quiet
if (-not $remoteExists) {
    Write-Host "Добавление remote репозитория..." -ForegroundColor Green
    git remote add origin $repoUrl
} else {
    Write-Host "Remote уже настроен" -ForegroundColor Green
    # Обновляем URL на случай, если он изменился
    git remote set-url origin $repoUrl
}

# Проверяем, есть ли изменения для добавления
Write-Host "Проверка изменений..." -ForegroundColor Yellow
git status --short | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка при проверке статуса" -ForegroundColor Red
    exit 1
}

# Добавляем все файлы (включая обновленный .gitignore)
Write-Host "Добавление всех файлов..." -ForegroundColor Green
git add .

# Проверяем, есть ли коммиты
$hasCommits = git rev-parse --verify HEAD 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Создание первого коммита..." -ForegroundColor Green
    git commit -m "Initial commit: Calories Counter App"
} else {
    Write-Host "Проверка, есть ли изменения для коммита..." -ForegroundColor Yellow
    $hasChanges = git diff --cached --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Создание коммита с изменениями..." -ForegroundColor Green
        git commit -m "Update: Add project files"
    } else {
        Write-Host "Нет изменений для коммита" -ForegroundColor Yellow
    }
}

# Создаем или переключаемся на ветку main
Write-Host "Настройка ветки main..." -ForegroundColor Green
$currentBranch = git branch --show-current 2>$null
if ([string]::IsNullOrEmpty($currentBranch)) {
    # Нет веток, создаем main
    Write-Host "Создание ветки main..." -ForegroundColor Green
    git checkout -b main 2>$null
    if ($LASTEXITCODE -ne 0) {
        # Если checkout не сработал, используем branch
        git branch -M main
    }
} else {
    if ($currentBranch -ne "main") {
        Write-Host "Переименование ветки в main..." -ForegroundColor Green
        git branch -M main
    }
}

# Проверяем, что ветка main существует
$mainBranchExists = git rev-parse --verify main 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ОШИБКА: Ветка main не существует. Создаю коммит..." -ForegroundColor Red
    # Принудительно создаем коммит
    git commit --allow-empty -m "Initial commit: Calories Counter App"
    git branch -M main
}

Write-Host "Отправка в GitHub..." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nГотово! Проект успешно отправлен в GitHub." -ForegroundColor Green
    Write-Host "Репозиторий: https://github.com/gilani1234/healthytracker" -ForegroundColor Cyan
} else {
    Write-Host "`nОшибка при отправке. Возможные причины:" -ForegroundColor Red
    Write-Host "1. Необходима аутентификация (создайте Personal Access Token)" -ForegroundColor Yellow
    Write-Host "2. Репозиторий на GitHub уже содержит коммиты" -ForegroundColor Yellow
    Write-Host "`nПопробуйте выполнить: git push -u origin main --force" -ForegroundColor Yellow
    Write-Host "(ВНИМАНИЕ: --force перезапишет историю на GitHub)" -ForegroundColor Red
}


