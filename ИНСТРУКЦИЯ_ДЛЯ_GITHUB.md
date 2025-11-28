# Инструкция по отправке проекта в GitHub

## Шаг 1: Установка Git (если еще не установлен)

Если Git не установлен на вашем компьютере:
1. Скачайте Git с официального сайта: https://git-scm.com/download/win
2. Установите Git, используя установщик
3. Перезапустите PowerShell/Terminal

## Шаг 2: Настройка Git (первый раз)

Выполните следующие команды для настройки Git (если еще не настроен):
```powershell
git config --global user.name "Ваше Имя"
git config --global user.email "ваш_email@example.com"
```

## Шаг 3: Отправка проекта в GitHub

Выполните скрипт `push-to-github.ps1` или выполните следующие команды вручную:

### Вариант 1: Использование готового скрипта
```powershell
.\push-to-github.ps1
```

### Вариант 2: Выполнение команд вручную
```powershell
# Инициализация git репозитория
git init

# Добавление remote репозитория
git remote add origin https://github.com/gilani1234/healthytracker.git

# Добавление всех файлов
git add .

# Создание коммита
git commit -m "Initial commit: Calories Counter App"

# Отправка в GitHub
git branch -M main
git push -u origin main
```

## Шаг 4: Аутентификация

При первой отправке GitHub попросит вас авторизоваться:
- Если используете HTTPS: вам нужно будет ввести ваш GitHub username и Personal Access Token (не пароль)
- Чтобы создать Personal Access Token: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token

## Примечания

- Файл `.gitignore` уже создан и настроен для Vue.js проекта
- Не забудьте создать Personal Access Token на GitHub, если используете HTTPS
- Альтернативно, можете использовать SSH ключи для более безопасной аутентификации

