const { Promoters, Events, Fight, Fighters, Users } = require('../../models')
const Joi = require('joi');

class PromoEvent {
    async createEvent(req, res) {
        const user = req.user;
        const promoter = await Promoters.findOne({ where: { user_id: user.id } });
        if (!promoter) {
        return res.status(400).json({ message: "Пользователь не является промоутером" });
        }
        const schema = Joi.object({
            photoUrl: Joi.string().allow('', null),
            eventName: Joi.string().required().messages({ 'any.required': 'Название мероприятия обязательно для заполнения' }),
            arena: Joi.string().required().messages({ 'any.required': 'Название арены обязательно для заполнения' }),
            date: Joi.date().iso().required().messages({
                'date.iso': 'Неверный формат даты', // Исправлено: date.iso
                'any.required': 'Дата обязательна для заполнения'
            }),
            eventDesc: Joi.string().optional(),
            location: Joi.string().required().messages({ 'any.required': 'Локация обязательна для заполнения' })
        });

        const { error, value } = schema.validate(req.body); // Добавлена переменная value

        if (error) {
            return res.status(400).json({ message: "ошибка" + error.details[0].message });
        }

        const { photoUrl, eventName, arena, date, eventDesc, location } = value; // Используем value

        try {
            const event = await Events.create({
                promoter_id: promoter.id,
                photo_url: photoUrl,
                event_name: eventName,
                event_desc: eventDesc,
                start_date: date,
                location: location,
                arena: arena
            });

            res.json({ success: true, eventId: event.id });
        } catch (dbError) {
            console.error("Ошибка при создании события в базе данных:", dbError);
            res.status(500).json({ message: "Ошибка при создании события", error: dbError.message }); // Добавлена подробная информация об ошибке
        }
    }
    async getAllEvents(req, res) {
        try {
            const user = req.user
            const promoter = await Promoters.findOne({ where: { user_id: user.id } });
            if (!promoter) {
            return res.status(400).json({ message: "Пользователь не является промоутером" });
            }

            const allEvents = await Events.findAll({ 
            where: { promoter_id: promoter.id }});
            res.json(allEvents)
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'Ошибка при получении пользователей', error: e.message });
        }
    }
    async getOneEvent(req, res) {
        try {
            const user = req.user
            const promoter = await Promoters.findOne({ where: { user_id: user.id } });
            if (!promoter) {
            return res.status(400).json({ message: "Пользователь не является промоутером" });
            }
            
            const oneEvent = await Events.findOne({where: {promoter_id: promoter.id, id: req.params.event_id}})

            if (!oneEvent) {
                return res.status(400).json({message: 'Такого мероприятия не существует'})
            }

            // Получаем все бои, связанные с этим мероприятием
            const fights = await Fight.findAll({
                include: [
                    {
                        model: Fighters,
                        as: 'FighterRed',
                        required: false,
                        attributes: ['id', 'win', 'loss', 'draw'],
                        include: [
                            {
                                model: Users,
                                as: 'User',
                                attributes: ['id', 'firstname', 'lastname', 'nationality', 'avatar_url']
                            }
                        ]
                    },
                    {
                        model: Fighters,
                        as: 'FighterBlue',
                        required: false,
                        attributes: ['id', 'win', 'loss', 'draw'],
                        include: [
                            {
                                model: Users,
                                as: 'User',
                                attributes: ['id', 'firstname', 'lastname', 'nationality', 'avatar_url']
                            }
                        ]
                    }
                ],
                where: { event_id: req.params.event_id },
                order: [['number', 'ASC']] // Сортируем по номеру боя
                
            });

            res.json({
                event: oneEvent,
                fights: fights
            })
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'Ошибка при получении мероприятия', error: e.message });
        }
    }
    async deleteOneEvent(req, res) {
        const user = req.user
        const promoter = await Promoters.findOne({ where: { user_id: user.id } });
        if (!promoter) {
            return res.status(400).json({ message: "Пользователь не является промоутером" });
        }
        const oneEvent = await Events.findOne({where: {promoter_id: promoter.id, id: req.params.event_id}})

        if (!oneEvent) {
            res.status(400).json({message: 'Такого боя не существует'})
        }

        await oneEvent.destroy();

        res.json({message: "Удаление прошло успешно"})
    }
    async updateOneEvent(req, res) {
        const user = req.user;
        const eventId = req.params.event_id; // Исправлено: получение ID из параметров
        const promoter = await Promoters.findOne({ where: { user_id: user.id } });
        if (!promoter) {
            return res.status(400).json({ message: "Пользователь не является промоутером" });
        }
        const schema = Joi.object({
            photoUrl: Joi.string().allow('', null),
            eventName: Joi.string().required().messages({ 'any.required': 'Название мероприятия обязательно для заполнения' }),
            arena: Joi.string().required().messages({ 'any.required': 'Название арены обязательно для заполнения' }),
            date: Joi.date().iso().required().messages({
                'date.iso': 'Неверный формат даты',
                'any.required': 'Дата обязательна для заполнения'
            }),
            eventDesc: Joi.string().optional(),
            location: Joi.string().required().messages({ 'any.required': 'Локация обязательна для заполнения' })
        });
    
        const { error, value } = schema.validate(req.body);
    
        if (error) {
            return res.status(400).json({ message: "Ошибка: " + error.details[0].message });
        }
    
        const { photoUrl, eventName, arena, date, eventDesc, location } = value;
    
        try {
            // Проверяем существование мероприятия
            const event = await Events.findOne({
                where: {
                    id: eventId,
                    promoter_id: promoter.id
                }
            });
    
            if (!event) {
                return res.status(404).json({ message: 'Мероприятие не найдено' });
            }
    
            // Обновляем запись
            const [affectedRows] = await Events.update(
                {
                    photo_url: photoUrl,
                    event_name: eventName,
                    arena: arena,
                    start_date: date,
                    event_desc: eventDesc,
                    location: location
                },
                {
                    where: {
                        id: eventId,
                        promoter_id: user.id
                    }
                }
            );
    
            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Мероприятие не найдено или не было обновлено' });
            }
    
            res.json({ success: true, message: "Обновление прошло успешно" });
        } catch (e) {
            console.error("Ошибка при обновлении мероприятия:", e);
            res.status(500).json({ message: 'Ошибка сервера при обновлении', error: e.message });
        }
    }
    async updatePromoterProfile(req, res) {
        try {
            const user = req.user;
            const { promoterId } = req.params;

            // Проверяем права доступа
            if (!user || user.role !== 1) {
                return res.status(403).json({
                    message: "Доступ запрещен. Требуются права промоутера."
                });
            }

            const promoterCandidate = await Promoters.findOrCreate({
                where: { user_id: user.id }
            });

            // Если это боец, проверяем что он обновляет свой профиль
            if (!promoterCandidate) {
                return res.status(403).json({
                    message: "Вы можете обновлять только свой профиль."
                });
            }

            const {
                fio,
                phone,
                email,
                org_name,
                org_fio,
                org_desc,
                contact_phone,
                contact_email,
                website_url,
                is_verified,
            } = req.body;

            const fioParts = fio.trim().split(' ').filter(part => part.length > 0);
            
            // Берем только первые три части для ФИО
            const firstname = fioParts[0] || '';
            const lastname = fioParts[1] || '';
            const middlename = fioParts[2] || '';

            // Обновляем данные пользователя
            await Users.update({
                firstname,
                lastname,
                middlename,
                phone_number: phone,
                email
            }, {
                where: { id: user.id }
            });

            // Обновляем или создаем профиль бойца
            const [promoter, created] = await Promoters.findOrCreate({
                where: { user_id: user.id },
                defaults: {
                    user_id: user.id,
                    org_name,
                    org_fio,
                    org_desc,
                    contact_phone,
                    contact_email,
                    website_url,
                    is_verified
                }
            });

            if (!created) {
                await promoter.update({
                    org_name,
                    org_fio,
                    org_desc,
                    contact_phone,
                    contact_email,
                    website_url,
                    is_verified
                });
            }

            // Обновляем или создаем связи с видами спорта
          

            res.json({
                success: true,
                message: "Профиль успешно обновлен",
                promoter: {
                    id: promoter.id,
                    org_name: promoter.org_name,
                    org_fio: promoter.org_fio,
                    org_desc: promoter.org_desc,
                    contact_phone: promoter.contact_phone,
                    contact_email: promoter.contact_email,
                    website_url: promoter.website_url,
                    is_verified: promoter.is_verified
                }
            });

        } catch (error) {
            console.error('Ошибка при обновлении профиля промоутера:', error);
            res.status(500).json({
                message: "Ошибка при обновлении профиля",
                error: error.message
            });
        }
    }
    async getPromoterProfile(req, res) {
        try {
            const user = req.user;
            const { promoterId } = req.params;

            const promoter = await Promoters.findOne({
                where: { user_id: user.id },
                include: [
                    
                    {
                        model: Users,
                        as: 'User',
                        attributes: ['id', 'firstname', 'lastname', 'middlename', 'avatar_url', 'phone_number', 'email', 'nationality']
                    },
                    

                ]
            });

            res.json({
                success: true,
                promoter: promoter
            });
        }
        catch (error) {
            console.error('Ошибка при получении профиля промоутера:', error);
            res.status(500).json({
                message: "Ошибка при получении профиля промоутера",
                error: error.message
            });
        }
    }
}

module.exports = new PromoEvent();