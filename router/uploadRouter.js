const express = require('express');
const router = express.Router();
const uploadController = require('../controller/uploadController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadAvatar, uploadProfilePhoto, uploadFightPhoto } = require('../middleware/uploadMiddleware');

// Загрузка аватара пользователя
router.post('/avatar', authMiddleware, uploadAvatar, uploadController.uploadAvatar);

// Загрузка фото профиля бойца
router.post('/fighter-photo', authMiddleware, uploadProfilePhoto, uploadController.uploadFighterPhoto);

// Загрузка фото боя
router.post('/fight-photo/:fightId', authMiddleware, uploadFightPhoto, uploadController.uploadFightPhoto);

// Удаление файла
router.delete('/file/:filename', authMiddleware, uploadController.deleteFile);

// Получение списка файлов пользователя
router.get('/files', authMiddleware, uploadController.getUserFiles);

// // Тест загрузки файла
// router.post('/test', authMiddleware, uploadAvatar, uploadController.testUpload);

module.exports = router;
