const Router = require('express');
const router = new Router();
const fighterFight = require('../controller/fighterController/fighterFight');
const authMiddleware = require('../middleware/authMiddleware');
const fighterCareer = require('../controller/fighterController/fighterCareer');

// Получить все бои (только для бойцов)
router.get('/fights', authMiddleware, fighterFight.getAllFights);

// Получить бои конкретного бойца
router.get('/fights/:fighterId', authMiddleware, fighterFight.getFighterFights);

// Получить детали конкретного боя
router.get('/fight/:fightId', authMiddleware, fighterFight.getFightDetails);

// Получить статистику бойца
router.get('/stats/:fighterId', authMiddleware, fighterFight.getFighterStats);

// Получить предстоящие бои бойца
router.get('/upcoming/:fighterId', authMiddleware, fighterFight.getUpcomingFights);

// Получить историю боёв бойца с пагинацией
router.get('/history/:fighterId', authMiddleware, fighterFight.getFightHistory);

// Поиск боёв с фильтрами
router.get('/search', authMiddleware, fighterFight.searchFights);

// Получить ближайшие бои (публичный доступ)
router.get('/upcoming-public', fighterFight.getUpcomingFightsPublic);

// Обновить профиль бойца
router.put('/profile/:fighterId', authMiddleware, fighterFight.updateFighterProfile);

// Обновить профиль бойца RF
router.put('/profile/requisitesrf/:fighterId', authMiddleware, fighterFight.updateFighterRequisitesRF);

// Обновить профиль бойца IN
router.put('/profile/requisitesin/:fighterId', authMiddleware, fighterFight.updateFighterRequisitesIN);

// Обновить паспортные данные бойца RF
router.put('/profile/passportrf/:fighterId', authMiddleware, fighterFight.updateFighterPassportRF);

// Обновить паспортные данные бойца IN
router.put('/profile/passportin/:fighterId', authMiddleware, fighterFight.updateFighterPassportIN);

// Получить профиль бойца
router.get('/profile/:fighterId', authMiddleware, fighterFight.getFighterProfile);

// Получить карьеру бойца
router.get('/career/:userId', authMiddleware, fighterCareer.getFighterCareer);

module.exports = router;
