require("dotenv").config();
const axios = require('axios');
// const { VerificationCode } = require('../models'); // Импортируем модель для сохранения кода

class smsController {
    async sendSms(req, res) {
        const { phone } = req.body;

        // Валидация номера телефона
        if (!phone || !/^\+?\d{10,15}$/.test(phone)) {
            return res.status(400).json({ error: "Неверный формат телефона" });
        }

        try {
            const code = Math.floor(1000 + Math.random() * 9000).toString();

            // Сохраняем код в базу данных
            // await VerificationCode.create({
            //     phone,
            //     code,
            //     expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 минут
            // });

            // Отправляем SMS через GET-запрос
            const response = await axios.post(process.env.SMS_API_URL, {
                params: {
                    login: process.env.SMS_API_LOGIN,
                    password: process.env.SMS_API_PASSWORD,
                    sender: 'terasms.ru',
                    target: phone,
                    text: `Ваш код подтверждения: ${code}`
                }
            });

            // Проверяем ответ от Terasms API
            if (response.data && response.data.status === 'success') {
                return res.json({ success: true });
            } else {
                throw new Error(response.data);
            }
        } catch (error) {
            console.error('Ошибка отправки SMS:', error);
            return res.status(500).json({ 
                error: "Не удалось отправить SMS",
                details: error.message 
            });
        }
    }
}

module.exports = new smsController();