# Скрипт для отправки проекта в GitHub репозиторий
# Убедитесь, что Git установлен перед выполнением этого скрипта

$repoUrl = "https://github.com/gilani1234/healthytracker.git"

Write-Host "Инициализация git репозитория..." -ForegroundColor Green
git init

Write-Host "Добавление remote репозитория..." -ForegroundColor Green
git remote add origin $repoUrl

Write-Host "Добавление всех файлов..." -ForegroundColor Green
git add .

Write-Host "Создание коммита..." -ForegroundColor Green
git commit -m "Initial commit: Calories Counter App"

Write-Host "Отправка в GitHub..." -ForegroundColor Green
git branch -M main
git push -u origin main

Write-Host "Готово! Проект отправлен в GitHub." -ForegroundColor Green


