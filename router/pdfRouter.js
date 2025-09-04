const express = require('express');
const router = express.Router();
const pdfController = require('../controller/pdfController');
const authMiddleware = require('../middleware/authMiddleware');

// Создание PDF оффера для бойца
router.post('/create-fighter-offer', authMiddleware, pdfController.createFighterOffer);

// Скачивание PDF файла
router.get('/download/:filename', authMiddleware, pdfController.downloadPdf);

// Получение списка PDF файлов пользователя
router.get('/user-pdfs', authMiddleware, pdfController.getUserPdfs);

// Удаление PDF файла
router.delete('/delete/:filename', authMiddleware, pdfController.deletePdf);

module.exports = router;
