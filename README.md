# Приложение для управления прайс-листами

## Обзор
Приложение позволяет создавать товары, формировать прайс-листы и делиться ими с клиентами через публичную ссылку. Клиенты могут просматривать прайс-листы и оформлять заказы.

## Технологии
- Frontend: HTML, CSS, JavaScript, Vue.js (CDN)
- Backend: Supabase (БД и аутентификация)
- Хостинг: Netlify

## Настройка проекта для деплоя

### 1. Настройка Supabase

1. Создайте новый проект в [Supabase](https://supabase.com/)
2. В разделе SQL Editor выполните SQL код из файла `schema.sql` для создания таблиц и настройки правил RLS
3. Скопируйте URL проекта и публичный API ключ (anon key) из раздела Project Settings > API

### 2. Настройка конфигурации

1. Отредактируйте файл `config.js`, указав URL и ключ Supabase:
```javascript
const SUPABASE_CONFIG = {
    SUPABASE_URL: 'https://your-project-id.supabase.co',
    SUPABASE_KEY: 'your-anon-key'
};
```

### 3. Деплой на Netlify

#### Вариант 1: Деплой через Git

1. Загрузите проект в Git-репозиторий (GitHub, GitLab, Bitbucket)
2. Войдите в [Netlify](https://www.netlify.com/)
3. Нажмите "New site from Git" и выберите свой репозиторий
4. Оставьте поле Build command пустым и укажите Publish directory: `/`
5. Нажмите "Deploy site"

#### Вариант 2: Ручной деплой

1. Запакуйте все файлы проекта в zip-архив
2. Войдите в [Netlify](https://www.netlify.com/)
3. Перейдите в раздел "Sites" и перетащите zip-архив в зону загрузки
4. Дождитесь завершения деплоя

### 4. Настройка поведения SPA на Netlify

Файл `netlify.toml` уже содержит необходимые настройки для перенаправления, которые позволят приложению работать как SPA.

## Локальная разработка

Для локального запуска приложения вы можете использовать:

```bash
# С помощью Python
python -m http.server

# С помощью Node.js
npx http-server
```

## Структура проекта

- `index.html` - основная страница приложения
- `app.js` - основной файл JavaScript
- `components/` - компоненты Vue
- `share.html` и `share.js` - страница публичного просмотра прайс-листов
- `styles.css`, `share-styles.css` - стили приложения
- `config.js` - конфигурация Supabase
- `schema.sql` - SQL код для создания таблиц в Supabase 