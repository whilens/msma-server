const Router = require('express');
const router = new Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register/step1', userController.registerStep1);
router.post('/register/step3', authMiddleware, userController.registerStep3);
// router.post('/register/step3', userController.registerStep3);
router.post('/login', userController.loginUser);
router.post('/refresh', userController.refreshToken);
router.post('/logout', userController.logout);
router.get('/sessions', authMiddleware, userController.getSessions);
router.get('/check', authMiddleware, userController.checkAuth);

module.exports = router;
