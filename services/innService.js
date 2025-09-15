require("dotenv").config();
const axios = require('axios');
const Users = require('../models/users');


class INNService {
    async setInnType(inn, user_id) {
        try {
            const resTypeInn = await axios.post('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party', {
                query: inn,
                count: 1
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Token ${process.env.DADATA_API_KEY || '2a3086b3ca71352eb4644886e393cd351fae15e6'}`
                }
            });
            
            console.log('Ответ от DaData:', resTypeInn.data);
            
            let userTypeInn = 'FL_RESIDENT'; // По умолчанию, если ничего не найдено
            
            // Проверяем, есть ли данные в ответе
            if (resTypeInn.data.suggestions && resTypeInn.data.suggestions.length > 0) {
                const innType = resTypeInn.data.suggestions[0].data.type;
                console.log('Тип ИНН от DaData:', innType);
                
                // Определяем тип пользователя на основе типа ИНН
                if (innType === 'INDIVIDUAL') {
                    userTypeInn = 'IP_RESIDENT';
                } else {
                    userTypeInn = 'UL_RESIDENT';
                }
            } else {
                console.log('ИНН не найден в базе DaData');
            }
            
            // Обновляем тип ИНН пользователя в базе данных, если user_id передан
            if (user_id) {
                try {
                    await Users.update(
                        { type_inn: userTypeInn },
                        { where: { id: user_id } }
                    );
                    console.log(`Тип ИНН пользователя ${user_id} обновлен на: ${userTypeInn}`);
                } catch (dbError) {
                    console.error('Ошибка при обновлении типа ИНН в базе данных:', dbError);
                    throw new Error(`Ошибка при обновлении типа ИНН пользователя: ${dbError.message}`);
                }
            }
            
            return {
                success: true,
                message: 'Тип ИНН обработан успешно',
                data: {
                    inn: inn,
                    innTypeFromDaData: resTypeInn.data.suggestions && resTypeInn.data.suggestions.length > 0 
                        ? resTypeInn.data.suggestions[0].data.type 
                        : 'Не найден',
                    userTypeInn: userTypeInn,
                    user_id: user_id,
                    updated: !!user_id
                }
            };
            
        } catch (error) {
            console.error('Ошибка при получении типа ИНН:', error);
            throw new Error(`Ошибка при обращении к DaData API: ${error.message}`);
        }
    }

}

module.exports = new INNService();
