require("dotenv").config();
const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
const cookieParser = require('cookie-parser');
const router = require('./router/index')
const cors = require('cors');
const WebSocketServer = require('./websocket');

// Важно: импортируем sequelize из models.js, а не из db.js
const { sequelize } = require('./models');

// Создаем HTTP сервер для WebSocket
const server = http.createServer(app);

// Инициализация WebSocket сервера
const wss = new WebSocketServer(server);

// Сохраняем WebSocket сервер в app для доступа из контроллеров
app.set('webSocketServer', wss);

// Устанавливаем глобальный экземпляр WebSocket для доступа из контроллеров
const { setWebSocketInstance } = require('./websocket-instance');
setWebSocketInstance(wss);

// Подключаем WebSocket к контроллерам для уведомлений
const fightResponseController = require('./controller/fightResponseController');
const signCallback = require('./controller/signController/signCallback');

fightResponseController.setWebSocketServer(wss);
signCallback.setWebSocketServer(wss);

app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL || 'https://wayces.ru'
    : 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());

app.use('/api', router)

// Обслуживание статических файлов (изображения, документы)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Обслуживание статических файлов React в продакшене
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, `${process.env.NODE_ENV === 'production' ? 'msma-client/build' : '../msma-new/build'}`)));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, `${process.env.NODE_ENV === 'production' ? 'msma-client/build/index.html' : '../msma-new/build/index.html'}`));
  });
}

const PORT = process.env.PORT || 5000;

// Добавьте обработку ошибок синхронизации
const syncOptions = process.env.NODE_ENV === 'production' 
  ? { alter: false } // В продакшене не изменяем структуру БД
  : { alter: true };  // В разработке разрешаем изменения

sequelize.sync(syncOptions)
  .then(() => {
    console.log('Database synchronized');
    server.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
      console.log('WebSocket server active');
      console.log('Client URL:', process.env.CLIENT_URL);
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('PORT:', process.env.PORT);
  
    });
  })
  .catch(error => {
    console.error('Database sync error:', error);
  });