const Router = require('express');
const router = new Router();
const authMiddleware = require('../middleware/authMiddleware');
const smsController = require('../controller/smsController')

router.post('/sms-send', smsController.sendSms)

module.exports = router;
