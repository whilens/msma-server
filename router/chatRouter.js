const express = require('express');
const router = express.Router();
const chatController = require('../controller/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// Получить информацию о комнате
router.get('/room/:roomId/info', authMiddleware, chatController.getRoomInfo);

// Получить историю сообщений комнаты
router.get('/room/:roomId/messages', authMiddleware, chatController.getChatHistory);

// Отправить сообщение в комнату
router.post('/room/:roomId/messages', authMiddleware, chatController.sendMessage);

// Получить список комнат пользователя
router.get('/rooms', authMiddleware, chatController.getUserRooms);

// Добавить участника в комнату (только админы)
router.post('/room/:roomId/participants', authMiddleware, chatController.addParticipant);

// Отметить сообщения как прочитанные
router.put('/room/:roomId/read', authMiddleware, chatController.markMessagesAsRead);

// Обновить статус пользователя онлайн
router.put('/user/online-status', authMiddleware, chatController.updateUserOnlineStatus);

// Получить статус участников комнаты
router.get('/room/:roomId/participants/status', authMiddleware, chatController.getRoomParticipantsStatus);

// Роуты для офферов
router.post('/room/:roomId/offer', authMiddleware, chatController.sendOffer);
router.post('/offer/:offerId/respond', authMiddleware, chatController.respondToOffer);
router.delete('/offer/:offerId', authMiddleware, chatController.cancelOffer);

// Удаление чата
router.delete('/room/:roomId', authMiddleware, chatController.deleteChat);

module.exports = router;



