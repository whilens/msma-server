# 🚀 MSMA Server - Backend API

Серверная часть платформы MSMA (Mixed Martial Arts) для управления боями, пользователями и чатами.

## 📋 Технологии

- **Node.js** + **Express.js** - веб-сервер и API
- **Sequelize ORM** - работа с базой данных
- **PostgreSQL** - основная база данных
- **WebSocket** - реальное время для чатов
- **JWT** - аутентификация и авторизация
- **PDFKit** - генерация PDF документов
- **Multer** - загрузка файлов
- **Joi** - валидация данных

## 📁 Структура проекта

```
server/
├── index.js                 # Точка входа сервера
├── websocket.js            # WebSocket сервер
├── models/                 # Модели Sequelize
│   ├── index.js           # Основные модели и ассоциации
│   ├── users.js           # Пользователи
│   ├── fighters.js        # Бойцы
│   ├── promoters.js       # Промоутеры
│   ├── fights.js          # Бои
│   ├── chatRoom.js        # Чат комнаты
│   ├── chatMessage.js     # Сообщения чата
│   ├── fightOffer.js      # Офферы на бои
│   ├── requisites_rf.js   # Реквизиты РФ
│   ├── requisites_in.js   # Реквизиты международные
│   ├── passport_rf.js     # Паспорт РФ
│   ├── passport_in.js     # Паспорт международный
│   └── ...                # Другие модели
├── controller/            # Контроллеры API
│   ├── userController.js  # Аутентификация и пользователи
│   ├── fighterController/ # Контроллеры бойцов
│   ├── promoterController/ # Контроллеры промоутеров
│   ├── fightController.js  # Управление боями
│   ├── chatController.js  # Чат функциональность
│   ├── fightResponseController.js # Отклики на бои
│   └── pdfController.js   # Генерация PDF
├── middleware/            # Middleware функции
│   ├── authMiddleware.js  # Проверка JWT токенов
│   ├── fighterMiddleware.js # Проверка роли бойца
│   ├── promoMiddleware.js  # Проверка роли промоутера
│   └── errorMiddleware.js  # Обработка ошибок
├── router/               # Маршруты API
│   ├── index.js          # Основной роутер
│   ├── userRouter.js     # Роуты пользователей
│   ├── fighterRouter.js  # Роуты бойцов
│   ├── promoterRouter.js # Роуты промоутеров
│   ├── fightRouter.js    # Роуты боев
│   ├── chatRouter.js     # Роуты чатов
│   └── pdfRouter.js      # Роуты PDF
├── services/             # Бизнес-логика
│   ├── tokenService.js   # Работа с JWT токенами
│   └── ...               # Другие сервисы
├── utils/                # Утилиты
│   ├── pdfGenerator.js   # Генератор PDF документов
│   └── ...               # Другие утилиты
└── uploads/              # Загруженные файлы
    ├── pdfs/             # PDF документы
    └── ...               # Другие файлы
```

## 🚀 Запуск сервера

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Настройка переменных окружения
cp ../env.example .env
# Отредактируйте .env файл

# Запуск в режиме разработки
npm run dev
# или
nodemon index.js
```

### Продакшн

```bash
# Запуск сервера
node index.js

# С переменными окружения
NODE_ENV=production node index.js
```

## 🔧 Конфигурация

### Переменные окружения (.env)

```env
# База данных
DB_HOST=localhost
DB_PORT=5432
DB_NAME=msma_db
DB_USER=your_username
DB_PASSWORD=your_password

# JWT секреты
ACCESS_SECRET=your_access_secret_key
REFRESH_SECRET=your_refresh_secret_key

# Сервер
PORT=5000
NODE_ENV=development

# Клиент
CLIENT_URL=http://localhost:3000

# Загрузки
UPLOAD_PATH=./uploads
```

## 📡 API Endpoints

### Аутентификация

```
POST /api/user/register/step1     # Регистрация шаг 1 (email, password)
POST /api/user/register/step2     # Регистрация шаг 2 (личные данные)
POST /api/user/register/step3     # Регистрация шаг 3 (роль)
POST /api/user/login             # Вход в систему
POST /api/user/logout            # Выход из системы
POST /api/user/refresh           # Обновление токена
GET  /api/user/check             # Проверка авторизации
```

### Пользователи

```
GET  /api/user/profile           # Получение профиля
PUT  /api/user/profile           # Обновление профиля
GET  /api/user/sessions          # Активные сессии
```

### Бойцы

```
GET  /api/fighter/profile/:id    # Профиль бойца
PUT  /api/fighter/profile/:id    # Обновление профиля
GET  /api/fighter/fights         # Бои бойца
POST /api/fighter/fight-response # Отклик на бой
PUT  /api/fighter/requisitesrf/:id # Реквизиты РФ
PUT  /api/fighter/requisitesin/:id # Реквизиты международные
PUT  /api/fighter/passportrf/:id   # Паспорт РФ
PUT  /api/fighter/passportin/:id   # Паспорт международный
```

### Промоутеры

```
GET  /api/promoter/profile       # Профиль промоутера
GET  /api/promoter/fights        # Бои промоутера
POST /api/promoter/fight         # Создание боя
PUT  /api/promoter/fight/:id     # Обновление боя
DELETE /api/promoter/fight/:id   # Удаление боя
GET  /api/promoter/fighters      # Поиск бойцов
POST /api/promoter/offer         # Отправка оффера
```

### Бои

```
GET  /api/fights                 # Список всех боев
GET  /api/fights/:id            # Детали боя
POST /api/fights                 # Создание боя
PUT  /api/fights/:id            # Обновление боя
DELETE /api/fights/:id          # Удаление боя
```

### Чаты

```
GET  /api/chat/rooms             # Список чат комнат
GET  /api/chat/room/:id         # Детали комнаты
POST /api/chat/message          # Отправка сообщения
GET  /api/chat/messages/:roomId # История сообщений
```

### PDF документы

```
POST /api/pdf/fighter-offer      # Генерация оффера бойца
POST /api/pdf/fight-contract     # Генерация контракта
POST /api/pdf/offer-acceptance   # Генерация принятия оффера
GET  /api/pdf/list              # Список PDF документов
DELETE /api/pdf/:id             # Удаление PDF
```

## 🔌 WebSocket API

### Типы сообщений

```javascript
// Авторизация
{
  "type": "auth",
  "userId": 123,
  "userType": "fighter" // или "promoter"
}

// Присоединение к комнате
{
  "type": "join_room",
  "roomId": 456
}

// Отправка сообщения
{
  "type": "chat_message",
  "roomId": 456,
  "text": "Привет!",
  "messageType": "text"
}

// Индикатор печати
{
  "type": "typing",
  "roomId": 456,
  "isTyping": true
}

// Выход из комнаты
{
  "type": "leave_room",
  "roomId": 456
}
```

### Ответы сервера

```javascript
// История чата
{
  "type": "chat_history",
  "roomId": 456,
  "messages": [...]
}

// Новое сообщение
{
  "type": "new_message",
  "roomId": 456,
  "message": {...}
}

// Статус прочтения
{
  "type": "messages_read",
  "data": {
    "messageIds": [1, 2, 3],
    "readAt": "2024-01-01T12:00:00Z",
    "readBy": 123
  }
}
```

## 🗄️ База данных

### Основные таблицы

- **users** - пользователи системы
- **fighters** - бойцы
- **promoters** - промоутеры
- **fights** - бои
- **chat_rooms** - чат комнаты
- **chat_messages** - сообщения
- **fight_offers** - офферы на бои
- **requisites_rf** - реквизиты РФ
- **requisites_in** - реквизиты международные
- **passport_rf** - паспорт РФ
- **passport_in** - паспорт международный

### Миграции

```bash
# Синхронизация моделей с БД
npx sequelize-cli db:migrate

# Откат миграций
npx sequelize-cli db:migrate:undo
```

## 🔐 Аутентификация

### JWT токены

- **Access Token** - для доступа к API (короткий срок)
- **Refresh Token** - для обновления access token (долгий срок)

### Middleware

- `authMiddleware` - проверка access token
- `fighterMiddleware` - проверка роли бойца
- `promoMiddleware` - проверка роли промоутера

## 📄 Генерация PDF

### Поддерживаемые документы

- Офферы для бойцов
- Контракты на бои
- Документы о принятии офферов

### Использование

```javascript
const pdfGenerator = require('./utils/pdfGenerator');

// Генерация оффера
const result = await pdfGenerator.generateFighterOfferPDF(fighterData, offerData);
```

## 🚨 Обработка ошибок

### Стандартные HTTP коды

- `200` - Успешный запрос
- `201` - Ресурс создан
- `400` - Неверный запрос
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Не найдено
- `500` - Внутренняя ошибка сервера

### Формат ошибки

```json
{
  "message": "Описание ошибки",
  "code": "ERROR_CODE",
  "details": {}
}
```

## 📊 Логирование

### Уровни логов

- `error` - Критические ошибки
- `warn` - Предупреждения
- `info` - Информационные сообщения
- `debug` - Отладочная информация

### Настройка логов

```javascript
// В index.js
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🔧 Разработка

### Добавление нового API endpoint

1. Создайте контроллер в `controller/`
2. Добавьте роут в `router/`
3. Подключите роут в `router/index.js`
4. Добавьте валидацию с Joi
5. Напишите тесты

### Добавление новой модели

1. Создайте модель в `models/`
2. Добавьте ассоциации в `models/index.js`
3. Создайте миграцию
4. Добавьте контроллеры и роуты

### Структура контроллера

```javascript
class ExampleController {
  async methodName(req, res) {
    try {
      // Валидация
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      // Бизнес-логика
      const result = await someService(req.body);

      // Ответ
      res.json(result);
    } catch (err) {
      console.error('Ошибка:', err);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
}
```

## 🧪 Тестирование

### Запуск тестов

```bash
# Все тесты
npm test

# Конкретный тест
npm test -- --grep "test name"

# Покрытие кода
npm run test:coverage
```

### Структура тестов

```
tests/
├── unit/           # Модульные тесты
├── integration/    # Интеграционные тесты
└── fixtures/       # Тестовые данные
```

## 📈 Мониторинг

### Метрики

- Время ответа API
- Количество запросов
- Использование памяти
- Количество WebSocket соединений

### Health check

```
GET /api/health
```

Ответ:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00Z",
  "uptime": 3600,
  "database": "connected",
  "websocket": "active"
}
```

## 🔒 Безопасность

### Меры безопасности

- Валидация всех входных данных
- Защита от SQL инъекций (Sequelize)
- Rate limiting
- CORS настройки
- HTTPS в продакшене
- Безопасные заголовки

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100 // максимум 100 запросов с одного IP
});

app.use('/api/', limiter);
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи сервера
2. Убедитесь, что база данных доступна
3. Проверьте переменные окружения
4. Убедитесь, что все зависимости установлены

### Полезные команды

```bash
# Просмотр логов
tail -f logs/app.log

# Проверка статуса БД
psql -h localhost -U msma_user -d msma_db -c "\dt"

# Проверка портов
netstat -tlnp | grep :5000

# Мониторинг процессов
htop
```

## 📝 Лицензия

MIT License
