const Router = require('express');
const router = new Router();
const testController = require('../controller/testController/test');

// Маршрут для тестирования сервиса innService
router.post('/inn-service', testController.testInnService);

module.exports = router;
