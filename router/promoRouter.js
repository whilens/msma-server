const Router = require('express');
const router = new Router();
// const promoController = require('../controller/promoControlles/promoController');
const promoEvent = require('../controller/promoControlles/promoEvent')
const promoFight = require('../controller/promoControlles/promoFight')
const promoFighterSearch = require('../controller/promoControlles/promoFighterSearch')

// Events
router.get('/events', promoEvent.getAllEvents);
router.post('/create/event', promoEvent.createEvent)
router.get('/event/:event_id', promoEvent.getOneEvent)
router.delete('/delete/event/:event_id', promoEvent.deleteOneEvent)
router.put('/update/event/:event_id', promoEvent.updateOneEvent)

// Fight
router.post('/create/fight', promoFight.createFight)
router.get('/fights', promoFight.getAllFights)
router.delete('/delete/fight/:fight_id', promoFight.deleteOneFight)

// Fighter Search
router.post('/search/fighters', promoFighterSearch.searchFighters)
router.get('/fighter/:fighterId', promoFighterSearch.getFighterById)

// Обновить профиль промоутера
router.put('/profile/:promoterId', promoEvent.updatePromoterProfile);

// Получить профиль промоутера
router.get('/profile/:promoterId', promoEvent.getPromoterProfile);

module.exports = router;
