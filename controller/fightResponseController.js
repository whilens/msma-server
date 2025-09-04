const { GoFight, Fight, Fighters, ChatRoom, ChatRoomParticipant, Users, Promoters, Events, MartialArt, WeightCategory } = require('../models');
const { Op } = require('sequelize');
// Импортируем WebSocket сервер для уведомлений
let webSocketServer = null;
const setWebSocketServer = (wss) => {
    webSocketServer = wss;
};

class FightResponseController {
    // Создать отклик на бой (боец откликается на бой)
    async createResponse(req, res) {
        try {
            const user = req.user;
            
            // Проверяем, что пользователь является бойцом
            if (!user || user.role !== 2) {
                return res.status(403).json({
                    message: "Доступ запрещен. Требуются права бойца."
                });
            }

            const { fightId, message, music, sizeCloth, sizeShoes, photoUrl } = req.body;

            // Проверяем существование боя
            const fight = await Fight.findByPk(fightId, {
                include: [
                    {
                        model: Events,
                        as: 'Event'
                    },
                    {
                        model: Promoters,
                        as: 'Promoter',
                        include: [
                            {
                                model: Users,
                                as: 'User'
                            }
                        ]
                    }
                ]
            });

            if (!fight) {
                return res.status(404).json({
                    message: "Бой не найден"
                });
            }

            // Находим бойца
            const fighter = await Fighters.findOne({ 
                where: { user_id: user.id },
                include: [
                    {
                        model: Users,
                        as: 'User'
                    }
                ]
            });

            console.log('Найденный боец:', fighter ? fighter.id : 'не найден');
            console.log('Найденный бой:', fight ? fight.id : 'не найден');
            console.log('Промоутер боя:', fight?.Promoter?.User?.id || 'не найден');

            if (!fighter) {
                return res.status(400).json({
                    message: "Профиль бойца не найден"
                });
            }

            // Проверяем, что боец еще не откликался на этот бой
            const existingResponse = await GoFight.findOne({
                where: {
                    fight_id: fightId,
                    fighter_id: fighter.id
                }
            });

            if (existingResponse) {
                return res.status(400).json({
                    message: "Вы уже откликнулись на этот бой"
                });
            }

            // Создаем отклик
            const response = await GoFight.create({
                fight_id: fightId,
                fighter_id: fighter.id,
                status: 'pending',
                message: message || '',
                music: music || '',
                size_cloth: sizeCloth || '',
                size_shoes: sizeShoes || '',
                photo_url: photoUrl || ''
            });

            console.log('✅ Создан отклик:');
            console.log('   - ID отклика:', response.id);
            console.log('   - Fight ID:', fightId);
            console.log('   - Fighter ID:', fighter.id);
            console.log('   - Название боя:', fight.name);

            console.log('Создаем комнату чата для отклика:', response.id);
            
            // Создаем комнату чата для этого отклика
            const chatRoom = await ChatRoom.create({
                gofight_id: response.id,
                name: `Бой: ${fight.name} - ${fighter.User.firstname} ${fighter.User.lastname}`,
                isActive: true,
                room_type: 'fight_response'
            });
            
            console.log('Комната создана с ID:', chatRoom.id);

            // Добавляем участников в комнату
            const participants = [];
            
            // Добавляем промоутера
            if (fight.Promoter && fight.Promoter.User) {
                participants.push({
                    chat_room_id: chatRoom.id,
                    user_id: fight.Promoter.User.id,
                    role: 'promoter',
                    is_active: true,
                    joined_at: new Date()
                });
            }

            // Добавляем бойца
            participants.push({
                chat_room_id: chatRoom.id,
                user_id: user.id,
                role: 'fighter',
                is_active: true,
                joined_at: new Date()
            });

            console.log('Создаем участников комнаты:', participants);
            
            if (participants.length > 0) {
                await ChatRoomParticipant.bulkCreate(participants);
                console.log('Участники созданы успешно');
            } else {
                console.log('Нет участников для создания');
            }

            // Отправляем автоматическое приветственное сообщение от бойца
            const { ChatMessage } = require('../models');
            await ChatMessage.create({
                chat_room_id: chatRoom.id,
                sender_id: user.id, // боец отправляет сообщение
                sender_type: 'fighter', // тип отправителя
                message_type: 'text',
                text: `Хочу участвовать в бою "${fight.name}". ${response.message ? 'Мое сообщение: ' + response.message : 'Жду ваших условий!'}`,
                created_at: new Date()
            });

            // Уведомляем промоутера о новом отклике через WebSocket
            if (webSocketServer && fight.Promoter && fight.Promoter.User) {
                webSocketServer.notifyNewResponse(fight.Promoter.User.id, {
                    responseId: response.id,
                    fightId: fight.id,
                    fightName: fight.name,
                    fighterName: `${fighter.User.firstname} ${fighter.User.lastname}`,
                    chatRoomId: chatRoom.id,
                    message: response.message
                });
            }

            res.json({
                success: true,
                message: "Отклик успешно создан",
                response: {
                    id: response.id,
                    status: response.status,
                    chatRoomId: chatRoom.id
                }
            });

        } catch (error) {
            console.error('Ошибка при создании отклика:', error);
            res.status(500).json({
                message: "Ошибка при создании отклика",
                error: error.message
            });
        }
    }

    // Создать приглашение на бой (промоутер приглашает бойца)
    async createPromoterInvite(req, res) {
        try {
            const user = req.user;
            
            // Проверяем, что пользователь является промоутером
            if (!user || user.role !== 1) {
                return res.status(403).json({
                    message: "Доступ запрещен. Требуются права промоутера."
                });
            }

            const { fightId, fighterId, message } = req.body;

            console.log(`Промоутер ${user.id} приглашает бойца ${fighterId} на бой ${fightId}`);

            // Проверяем существование боя
            const fight = await Fight.findByPk(fightId, {
                include: [
                    {
                        model: Events,
                        as: 'Event'
                    },
                    {
                        model: Promoters,
                        as: 'Promoter',
                        include: [
                            {
                                model: Users,
                                as: 'User'
                            }
                        ]
                    }
                ]
            });

            if (!fight) {
                return res.status(404).json({
                    message: "Бой не найден"
                });
            }

            // Проверяем, что промоутер является владельцем боя
            if (fight.Promoter.user_id !== user.id) {
                return res.status(403).json({
                    message: "Вы не можете приглашать на чужие бои"
                });
            }

            // Находим бойца
            const fighter = await Fighters.findByPk(fighterId, {
                include: [
                    {
                        model: Users,
                        as: 'User'
                    }
                ]
            });

            if (!fighter) {
                return res.status(404).json({
                    message: "Боец не найден"
                });
            }

            // Проверяем, нет ли уже приглашения этому бойцу на этот бой
            const existingInvitation = await GoFight.findOne({
                where: {
                    fight_id: fightId,
                    fighter_id: fighterId
                }
            });

            if (existingInvitation) {
                return res.status(400).json({
                    message: "Приглашение этому бойцу уже отправлено"
                });
            }

            // Создаем приглашение (запись GoFight)
            const invitation = await GoFight.create({
                fight_id: fightId,
                fighter_id: fighterId,
                status: 'pending',
                message: message || `Приглашение на участие в бое от промоутера ${fight.Promoter.User.firstname} ${fight.Promoter.User.lastname}`
            });

            console.log(`Создано приглашение: ID ${invitation.id}`);

            // Создаем комнату чата для общения
            const roomName = `Приглашение: ${fight.Event.event_name} - Бой №${fight.number || fight.name}`;
            
            const chatRoom = await ChatRoom.create({
                gofight_id: invitation.id,
                name: roomName,
                isActive: true,
                room_type: 'fight_response'
            });

            console.log(`Создана комната чата: ID ${chatRoom.id}`);

            // Добавляем участников в комнату
            await ChatRoomParticipant.bulkCreate([
                {
                    chat_room_id: chatRoom.id,
                    user_id: user.id, // промоутер
                    role: 'promoter',
                    is_active: true,
                    joined_at: new Date()
                },
                {
                    chat_room_id: chatRoom.id,
                    user_id: fighter.user_id, // боец
                    role: 'fighter',
                    is_active: true,
                    joined_at: new Date()
                }
            ]);

            console.log(`Добавлены участники в комнату ${chatRoom.id}: промоутер ${user.id}, боец ${fighter.user_id}`);

            // Отправляем автоматическое приветственное сообщение от промоутера
            const { ChatMessage } = require('../models');
            await ChatMessage.create({
                chat_room_id: chatRoom.id,
                sender_id: user.id, // промоутер отправляет сообщение
                sender_type: 'promoter', // тип отправителя
                message_type: 'text',
                text: `Приглашаю тебя на бой "${fight.Event.event_name}" - Бой №${fight.number || fight.name}. Давайте обсудим детали!`,
                created_at: new Date()
            });

            // Уведомляем бойца о приглашении через WebSocket
            if (webSocketServer) {
                try {
                    const notificationData = {
                        type: 'new_invitation',
                        invitation_id: invitation.id,
                        fight_id: fightId,
                        promoter: {
                            id: user.id,
                            name: `${fight.Promoter.User.firstname} ${fight.Promoter.User.lastname}`
                        },
                        fight: {
                            event_name: fight.Event.event_name,
                            fight_number: fight.number
                        },
                        chat_room_id: chatRoom.id
                    };

                    webSocketServer.notifyUser(fighter.user_id, 'new_invitation', notificationData);
                    console.log(`WebSocket уведомление отправлено бойцу ${fighter.user_id}`);
                } catch (wsError) {
                    console.error('Ошибка отправки WebSocket уведомления:', wsError);
                }
            }

            res.status(201).json({
                message: 'Приглашение успешно отправлено',
                invitation: {
                    id: invitation.id,
                    fight_id: fightId,
                    fighter_id: fighterId,
                    status: invitation.status,
                    chat_room_id: chatRoom.id
                },
                chatRoom: {
                    id: chatRoom.id,
                    name: chatRoom.name
                }
            });

        } catch (error) {
            console.error('Ошибка создания приглашения:', error);
            res.status(500).json({
                message: 'Ошибка создания приглашения',
                error: error.message
            });
        }
    }

    // Получить все отклики на бой (для промоутера)
    async getFightResponses(req, res) {
        try {
            const user = req.user;
            const { fightId } = req.params;

            // Проверяем права доступа
            if (!user || user.role !== 1) {
                return res.status(403).json({
                    message: "Доступ запрещен. Требуются права промоутера."
                });
            }

            // Проверяем, что бой принадлежит промоутеру
            const fight = await Fight.findOne({
                where: { id: fightId },
                include: [
                    {
                        model: Events,
                        as: 'Event',
                        include: [
                            {
                                model: Promoters,
                                as: 'Promoter',
                                where: { user_id: user.id }
                            }
                        ]
                    }
                ]
            });

            if (!fight) {
                return res.status(404).json({
                    message: "Бой не найден или не принадлежит вам"
                });
            }

            // Получаем все отклики на этот бой
            const responses = await GoFight.findAll({
                where: { fight_id: fightId },
                include: [
                    {
                        model: Fighters,
                        as: 'Fighter',
                        include: [
                            {
                                model: Users,
                                as: 'User',
                                attributes: ['id', 'firstname', 'lastname', 'avatar_url']
                            }
                        ]
                    },
                    {
                        model: ChatRoom,
                        as: 'ChatRoom',
                        attributes: ['id', 'name', 'isActive']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                responses: responses
            });

        } catch (error) {
            console.error('Ошибка при получении откликов:', error);
            res.status(500).json({
                message: "Ошибка при получении откликов",
                error: error.message
            });
        }
    }

    // Обновить статус отклика (принять/отклонить)
    async updateResponseStatus(req, res) {
        try {
            const user = req.user;
            const { responseId } = req.params;
            const { status } = req.body;

            // Проверяем права доступа
            if (!user || user.role !== 1) {
                return res.status(403).json({
                    message: "Доступ запрещен. Требуются права промоутера."
                });
            }

            // Проверяем валидность статуса
            const validStatuses = ['accepted', 'rejected'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    message: "Неверный статус. Допустимые значения: accepted, rejected"
                });
            }

            // Находим отклик
            const response = await GoFight.findByPk(responseId, {
                include: [
                    {
                        model: Fight,
                        as: 'Fight',
                        include: [
                            {
                                model: Events,
                                as: 'Event',
                                include: [
                                    {
                                        model: Promoters,
                                        as: 'Promoter',
                                        where: { user_id: user.id }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            if (!response) {
                return res.status(404).json({
                    message: "Отклик не найден или не принадлежит вам"
                });
            }

            // Обновляем статус
            await response.update({ status });

            res.json({
                success: true,
                message: `Отклик ${status === 'accepted' ? 'принят' : 'отклонен'}`,
                response: {
                    id: response.id,
                    status: response.status
                }
            });

        } catch (error) {
            console.error('Ошибка при обновлении статуса отклика:', error);
            res.status(500).json({
                message: "Ошибка при обновлении статуса отклика",
                error: error.message
            });
        }
    }

    // Получить отклики бойца
    async getFighterResponses(req, res) {
        try {
            const user = req.user;

            // Проверяем права доступа
            if (!user || user.role != 2) {
                return res.status(403).json({
                    message: "Доступ запрещен. Требуются права бойца. " + user.role
                });
            }

            // Находим бойца
            const fighter = await Fighters.findOne({ where: { user_id: user.id } });

            if (!fighter) {
                return res.status(400).json({
                    message: "Профиль бойца не найден"
                });
            }

            // Получаем все отклики бойца
            const responses = await GoFight.findAll({
                where: { fighter_id: fighter.id },
                include: [
                    {
                        model: Fight,
                        as: 'Fight',
                        include: [
                            {
                                model: Events,
                                as: 'Event',
                                include: [
                                    {
                                        model: Promoters,
                                        as: 'Promoter',
                                        include: [
                                            {
                                                model: Users,
                                                as: 'User',
                                                attributes: ['id', 'firstname', 'lastname', 'avatar_url']
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: ChatRoom,
                        as: 'ChatRoom',
                        attributes: ['id', 'name', 'isActive']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                responses: responses
            });

        } catch (error) {
            console.error('Ошибка при получении откликов бойца:', error);
            res.status(500).json({
                message: "Ошибка при получении откликов бойца",
                error: error.message
            });
        }
    }

    // Отменить отклик (боец может отменить свой отклик)
    async cancelResponse(req, res) {
        try {
            const user = req.user;
            const { responseId } = req.params;

            // Проверяем права доступа
            if (!user || user.role !== 2) {
                return res.status(403).json({
                    message: "Доступ запрещен. Требуются права бойца."
                });
            }

            // Находим бойца
            const fighter = await Fighters.findOne({ where: { user_id: user.id } });

            if (!fighter) {
                return res.status(400).json({
                    message: "Профиль бойца не найден"
                });
            }

            // Находим отклик
            const response = await GoFight.findOne({
                where: {
                    id: responseId,
                    fighter_id: fighter.id,
                    status: 'pending' // можно отменить только ожидающие отклики
                }
            });

            if (!response) {
                return res.status(404).json({
                    message: "Отклик не найден или уже обработан"
                });
            }

            // Обновляем статус на отмененный
            await response.update({ status: 'cancelled' });

            // Деактивируем комнату чата
            const chatRoom = await ChatRoom.findOne({ where: { gofight_id: response.id } });
            if (chatRoom) {
                await chatRoom.update({ isActive: false });
            }

            res.json({
                success: true,
                message: "Отклик отменен"
            });

        } catch (error) {
            console.error('Ошибка при отмене отклика:', error);
            res.status(500).json({
                message: "Ошибка при отмене отклика",
                error: error.message
            });
        }
    }

    // Получить все бои промоутера (для модального окна оффера)
    async getPromoterFights(req, res) {
        try {
            const user = req.user;

            // Проверяем права доступа
            if (!user || user.role !== 1) {
                return res.status(403).json({
                    message: "Доступ запрещен. Требуются права промоутера."
                });
            }

            // Находим промоутера
            const promoter = await Promoters.findOne({
                where: { user_id: user.id }
            });

            if (!promoter) {
                return res.status(404).json({
                    message: "Промоутер не найден"
                });
            }

            // Получаем все бои промоутера
            const fights = await Fight.findAll({
                include: [
                    {
                        model: Events,
                        as: 'Event',
                        where: { promoter_id: promoter.id },
                        attributes: ['id', 'event_name', 'start_date', 'location']
                    },
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
                ],
                attributes: ['id', 'name', 'salary', 'rounds', 'fight_date'],
                order: [['Event', 'start_date', 'ASC']]
            });

            res.json({
                success: true,
                fights: fights
            });

        } catch (error) {
            console.error('Ошибка получения боев промоутера:', error);
            res.status(500).json({
                message: "Ошибка получения боев",
                error: error.message
            });
        }
    }
}

const controller = new FightResponseController();
controller.setWebSocketServer = setWebSocketServer;

module.exports = controller;
