const innService = require('../../services/innService');
const Users = require('../../models/users');

class TestController {
    // Тест для проверки работы сервиса innService
    async testInnService(req, res) {
        try {
            const { inn, user_id } = req.body;
            console.log('Полученные данные:', req.body);


            const user = await Users.findByPk(user_id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Пользователь не найден'
                });
            }
            // Проверяем наличие обязательных параметров
            if (!inn) {
                return res.status(400).json({
                    success: false,
                    message: 'ИНН обязателен для тестирования'
                });
            }

            console.log(`Тестирование сервиса innService с ИНН: ${inn}, user_id: ${user_id || 'не указан'}`);
            
            // Вызываем метод сервиса
            const result = await innService.setInnType(inn, user_id);
            
            res.status(200).json({
                success: true,
                message: 'Сервис innService успешно протестирован',
                data: {
                    inn: inn,
                    user_id: user_id,
                    timestamp: new Date().toISOString(),
                    serviceResult: result
                }
            });
            
        } catch (error) {
            console.error('Ошибка при тестировании innService:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при тестировании сервиса innService',
                error: error.message
            });
        }
    }


    // Тест для проверки различных ИНН
}

module.exports = new TestController();
