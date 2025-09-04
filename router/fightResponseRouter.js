const Router = require('express');
const router = new Router();
const fightResponseController = require('../controller/fightResponseController');
const authMiddleware = require('../middleware/authMiddleware');

// Создать отклик на бой (боец)
router.post('/create', authMiddleware, fightResponseController.createResponse);

// Создать приглашение на бой (промоутер)
router.post('/promoter/create', authMiddleware, fightResponseController.createPromoterInvite);

// Получить все отклики на бой (промоутер)
router.get('/fight/:fightId', authMiddleware, fightResponseController.getFightResponses);

// Обновить статус отклика (промоутер)
router.put('/:responseId/status', authMiddleware, fightResponseController.updateResponseStatus);

// Получить отклики бойца (боец)
router.get('/fighter/my', authMiddleware, fightResponseController.getFighterResponses);

// Отменить отклик (боец)
router.put('/:responseId/cancel', authMiddleware, fightResponseController.cancelResponse);

// Роут для получения боев промоутера
router.get('/promoter/fights', authMiddleware, fightResponseController.getPromoterFights);

module.exports = router;
