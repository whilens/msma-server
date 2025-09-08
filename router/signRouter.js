const Router = require('express');
const router = new Router();
const authMiddleware = require('../middleware/authMiddleware');
const signController = require('../controller/signController/signController')
const signCallback = require('../controller/signController/signCallback')

router.post('/post-contract', signController.postContract)
router.post('/sign-callback', signCallback.signCallback)

module.exports = router;
