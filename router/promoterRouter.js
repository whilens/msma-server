const Router = require('express');
const router = new Router();
const promoterProfile = require('../controller/promoterController/promoterProfile');
const authMiddleware = require('../middleware/authMiddleware');

// Получить профиль промоутера
router.get('/profile/:promoterId', authMiddleware, promoterProfile.getPromoterProfile);

// Обновить реквизиты промоутера RF
router.put('/profile/requisitesrf/:promoterId', authMiddleware, promoterProfile.updatePromoterRequisitesRF);

// Обновить реквизиты промоутера IN
router.put('/profile/requisitesin/:promoterId', authMiddleware, promoterProfile.updatePromoterRequisitesIN);

module.exports = router;
