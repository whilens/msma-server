const pdfService = require('../services/pdfService');
const { Fighters, Users, MartialArt, WeightCategory, UserSports } = require('../models');

class PdfController {
    // Создание PDF оффера для бойца
    async createFighterOffer(req, res) {
        try {
            console.log('Создание PDF оффера для бойца');
            console.log('Данные запроса:', req.body);

            const { fighterId, promoterData, fightDetails, financialTerms } = req.body;

            if (!fighterId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID бойца обязателен'
                });
            }

            // Получаем данные бойца из базы
            const fighter = await Fighters.findOne({
                where: { id: fighterId },
                include: [
                    {
                        model: Users,
                        as: 'User',
                        attributes: ['id', 'firstname', 'lastname', 'middlename', 'phone_number', 'email']
                    },
                    {
                        model: UserSports,
                        as: 'UserSports',
                        include: [
                            {
                                model: MartialArt,
                                as: 'MartialArt',
                                attributes: ['id', 'name']
                            },
                            {
                                model: WeightCategory,
                                as: 'WeightCategory',
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ]
            });

            if (!fighter) {
                return res.status(404).json({
                    success: false,
                    message: 'Боец не найден'
                });
            }

            console.log('Найденный боец:', fighter);

            // Используем сервис для создания PDF
            const result = await pdfService.createFighterOfferPdf(
                fighter,
                promoterData,
                fightDetails,
                financialTerms
            );

            if (result.success) {
                res.json(result);
            } else {
                res.status(500).json(result);
            }

        } catch (error) {
            console.error('Ошибка в createFighterOffer:', error);
            res.status(500).json({
                success: false,
                message: 'Внутренняя ошибка сервера',
                error: error.message
            });
        }
    }

    // Скачивание PDF файла
    async downloadPdf(req, res) {
        try {
            const { filename } = req.params;
            const { subfolder } = req.query;

            // Используем сервис для скачивания PDF
            const result = pdfService.downloadPdf(filename, subfolder);

            if (result.success) {
                res.download(result.filepath, result.filename, (err) => {
                    if (err) {
                        console.error('Ошибка скачивания PDF:', err);
                        res.status(500).json({
                            success: false,
                            message: 'Ошибка скачивания файла'
                        });
                    }
                });
            } else {
                res.status(result.statusCode || 500).json(result);
            }

        } catch (error) {
            console.error('Ошибка в downloadPdf:', error);
            res.status(500).json({
                success: false,
                message: 'Внутренняя ошибка сервера',
                error: error.message
            });
        }
    }

    // Получение списка PDF файлов пользователя
    async getUserPdfs(req, res) {
        try {
            const { subfolder } = req.query;

            // Используем сервис для получения списка PDF
            const result = pdfService.getPdfFiles(subfolder);

            if (result.success) {
                res.json(result);
            } else {
                res.status(500).json(result);
            }

        } catch (error) {
            console.error('Ошибка в getUserPdfs:', error);
            res.status(500).json({
                success: false,
                message: 'Внутренняя ошибка сервера',
                error: error.message
            });
        }
    }

    // Удаление PDF файла
    async deletePdf(req, res) {
        try {
            const { filename } = req.params;
            const { subfolder } = req.query;

            // Используем сервис для удаления PDF
            const result = pdfService.deletePdf(filename, subfolder);

            if (result.success) {
                res.json(result);
            } else {
                res.status(result.statusCode || 500).json(result);
            }

        } catch (error) {
            console.error('Ошибка в deletePdf:', error);
            res.status(500).json({
                success: false,
                message: 'Внутренняя ошибка сервера',
                error: error.message
            });
        }
    }
}

module.exports = new PdfController();