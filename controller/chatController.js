const { ChatMessage, ChatRoom, ChatRoomParticipant, Users, GoFight, Fight, Fighters, Events, Promoters, PromotersReqRF, PassportRF, FightOffer, MartialArt, WeightCategory } = require('../models');
const pdfService = require('../services/pdfService');   

class ChatController {
    // Получить информацию о комнате чата
    async getRoomInfo(req, res) {
        try {
            const { roomId } = req.params;
            const userId = req.user.id;

            console.log(`Получение информации о комнате ${roomId} для пользователя ${userId}`);

            // Проверяем, является ли пользователь участником комнаты
            const participant = await ChatRoomParticipant.findOne({
                where: {
                    chat_room_id: roomId,
                    user_id: userId,
                    is_active: true
                }
            });

            if (!participant) {
                console.log(`Пользователь ${userId} не является участником комнаты ${roomId}`);
                return res.status(403).json({
                    message: 'У вас нет доступа к этой комнате'
                });
            }

            // Получаем информацию о комнате с связанными данными
            const room = await ChatRoom.findByPk(roomId, {
                include: [
                    {
                        model: GoFight,
                        as: 'GoFight',
                        include: [
                            {
                                model: Fight,
                                as: 'Fight',
                                include: [
                                    { model: Events, as: 'Event', include: [
                                        { model: Promoters, as: 'Promoter', include: [
                                            { model: Users, as: 'User' }
                                        ]  },
                                        
                                    ] }, 
                                    { model: MartialArt, as: 'MartialArt' },
                                        { model: WeightCategory, as: 'WeightCategory' }
                                ]
                            },
                            {
                                model: Fighters,
                                as: 'Fighter',
                                include: [
                                    { model: Users, as: 'User' }
                                ]
                            }
                        ]
                    }
                ]
            });

            if (!room) {
                return res.status(404).json({
                    message: 'Комната не найдена'
                });
            }

            res.json({
                success: true,
                room: room
            });

        } catch (error) {
            console.error('Ошибка получения информации о комнате:', error);
            res.status(500).json({
                message: 'Ошибка получения информации о комнате',
                error: error.message
            });
        }
    }

    // Удаление чата (деактивация для пользователя)
    async deleteChat(req, res) {
        try {
            const { roomId } = req.params;
            const userId = req.user.id;

            console.log(`Удаление чата ${roomId} для пользователя ${userId}`);

            // Проверяем, является ли пользователь участником комнаты
            const participant = await ChatRoomParticipant.findOne({
                where: {
                    chat_room_id: roomId,
                    user_id: userId,
                    is_active: true
                }
            });

            if (!participant) {
                return res.status(404).json({
                    message: 'Чат не найден или у вас нет к нему доступа'
                });
            }

            // Деактивируем участие пользователя в чате
            await participant.update({
                is_active: false,
                left_at: new Date()
            });

            // Отправляем уведомление через WebSocket
            const wss = req.app.get('webSocketServer');
            if (wss) {
                wss.clients.forEach(client => {
                    if (client.userId === userId) {
                        client.send(JSON.stringify({
                            type: 'chat_deleted',
                            roomId: parseInt(roomId)
                        }));
                    }
                });
            }

            res.json({
                success: true,
                message: 'Чат успешно удален'
            });

        } catch (error) {
            console.error('Ошибка удаления чата:', error);
            res.status(500).json({
                message: 'Ошибка удаления чата',
                error: error.message
            });
        }
    }

    // Получение истории сообщений по комнате
    async getChatHistory(req, res) {
        try {
            const user = req.user;
            const { roomId } = req.params;
            const { page = 1, limit = 50 } = req.query;

            if (!user) {
                return res.status(401).json({
                    message: "Пользователь не авторизован"
                });
            }

            // Проверяем, что пользователь является участником комнаты
            const participant = await ChatRoomParticipant.findOne({
                where: {
                    chat_room_id: roomId,
                    user_id: user.id,
                    is_active: true
                }
            });

            if (!participant) {
                return res.status(403).json({
                    message: "Доступ к комнате запрещен"
                });
            }

            const offset = (page - 1) * limit;
            
            const messages = await ChatMessage.findAll({
                where: { chat_room_id: roomId },
                include: [
                    {
                        model: Users,
                        as: 'Sender',
                        attributes: ['id', 'firstname', 'lastname', 'avatar_url']
                    },
                    {
                        model: Users,
                        as: 'ReadBy',
                        attributes: ['id', 'firstname', 'lastname'],
                        required: false
                    },
                    {
                        model: FightOffer,
                        as: 'Offer',
                        required: false,
                        include: [
                            {
                                model: Fight,
                                as: 'Fight',
                                attributes: ['id', 'name', 'salary', 'fight_date', 'location', 'rounds', 'weight_category_id', 'martial_art_id', 'event_id'],
                                include: [
                                    {
                                        model: Events,
                                        as: 'Event',
                                        attributes: ['id', 'event_name', 'start_date', 'end_date', 'location', 'arena', 'description'],
                                        include: [
                                            {
                                                model: Promoters,
                                                as: 'Promoter',
                                                attributes: ['id', 'org_name', 'company_name'],
                                                include: [
                                                    {
                                                        model: Users,
                                                        as: 'User',
                                                        attributes: ['id', 'firstname', 'lastname', 'avatar_url', 'email']
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        model: MartialArt,
                                        as: 'MartialArt',
                                        attributes: ['id', 'name', 'description']
                                    },
                                    {
                                        model: WeightCategory,
                                        as: 'WeightCategory',
                                        attributes: ['id', 'name', 'min_weight', 'max_weight']
                                    }
                                ]
                            },
                            {
                                model: Promoters,
                                as: 'Promoter',
                                attributes: ['id', 'org_name', 'company_name'],
                                include: [
                                    {
                                        model: Users,
                                        as: 'User',
                                        attributes: ['id', 'firstname', 'lastname', 'avatar_url']
                                    }
                                ]
                            },
                            {
                                model: Fighters,
                                as: 'Fighter',
                                attributes: ['id'],
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
                ],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: offset
            });

            // Обновляем время последнего прочтения
            await participant.update({ last_read_at: new Date() });

            res.json({
                success: true,
                messages: messages.reverse(), // возвращаем в хронологическом порядке
                pagination: {
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            });

        } catch (error) {
            console.error('Ошибка получения истории чата:', error);
            res.status(500).json({
                message: "Ошибка получения истории чата",
                error: error.message
            });
        }
    }

    // Отправка сообщения
    async sendMessage(req, res) {
        try {
            const user = req.user;
            const { roomId } = req.params;
            const { text, messageType = 'text', fileUrl } = req.body;

            if (!user) {
                return res.status(401).json({
                    message: "Пользователь не авторизован"
                });
            }

            if (!text || text.trim() === '') {
                return res.status(400).json({
                    message: "Текст сообщения не может быть пустым"
                });
            }

            // Проверяем, что пользователь является участником комнаты
            const participant = await ChatRoomParticipant.findOne({
                where: {
                    chat_room_id: roomId,
                    user_id: user.id,
                    is_active: true
                }
            });

            if (!participant) {
                return res.status(403).json({
                    message: "Доступ к комнате запрещен"
                });
            }

            // Проверяем, что комната активна
            const chatRoom = await ChatRoom.findByPk(roomId);
            if (!chatRoom || !chatRoom.isActive) {
                return res.status(400).json({
                    message: "Комната неактивна"
                });
            }

            const message = await ChatMessage.create({
                chat_room_id: roomId,
                sender_id: user.id,
                sender_type: participant.role,
                text: text.trim(),
                message_type: messageType,
                file_url: fileUrl || null
            });

            // Загружаем полную информацию о сообщении для ответа
            const fullMessage = await ChatMessage.findByPk(message.id, {
                include: [
                    {
                        model: Users,
                        as: 'Sender',
                        attributes: ['id', 'firstname', 'lastname', 'avatar_url']
                    }
                ]
            });

            res.json({
                success: true,
                message: fullMessage
            });

        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
            res.status(500).json({
                message: "Ошибка отправки сообщения",
                error: error.message
            });
        }
    }

    // Получить список комнат пользователя
    async getUserRooms(req, res) {
        try {
            const user = req.user;

            if (!user) {
                return res.status(401).json({
                    message: "Пользователь не авторизован"
                });
            }

            const rooms = await ChatRoomParticipant.findAll({
                where: {
                    user_id: user.id,
                    is_active: true
                },
                include: [
                    {
                        model: ChatRoom,
                        as: 'ChatRoom',
                        where: { isActive: true },
                        include: [
                            {
                                model: GoFight,
                                as: 'GoFight',
                                include: [
                                    {
                                        model: Fight,
                                        as: 'Fight',
                                        attributes: ['id', 'name', 'salary'],
                                        include: [
                                            { model: MartialArt, as: 'MartialArt' },
                                            { model: WeightCategory, as: 'WeightCategory' }
                                        ]
                                    }
                                ]
                            },
                            {
                                model: ChatMessage,
                                as: 'Messages',
                                limit: 1,
                                order: [['createdAt', 'DESC']],
                                include: [
                                    {
                                        model: Users,
                                        as: 'Sender',
                                        attributes: ['firstname', 'lastname']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            res.json({
                success: true,
                rooms: rooms
            });

        } catch (error) {
            console.error('Ошибка получения комнат пользователя:', error);
            res.status(500).json({
                message: "Ошибка получения комнат пользователя",
                error: error.message
            });
        }
    }

    async cancelOffer(req, res) {
        try {
            const { offerId } = req.params;
            const userId = req.user.id;

            // Находим оффер
            const offer = await FightOffer.findByPk(offerId, {
                include: [
                    {
                        model: ChatMessage,
                        as: 'Message',
                        include: [{ model: ChatRoom, as: 'ChatRoom' }]
                    },
                    { model: Promoters, as: 'Promoter' }
                ]
            });

            if (!offer) {
                return res.status(404).json({ message: 'Оффер не найден' });
            }

            // Проверяем, что пользователь - владелец оффера
            if (offer.Promoter.user_id !== userId) {
                return res.status(403).json({ message: 'Только автор оффера может его отменить' });
            }

            // Проверяем, что оффер еще не принят
            if (offer.status === 'accepted') {
                return res.status(400).json({ message: 'Нельзя отменить уже принятый оффер' });
            }

            if (offer.status === 'rejected') {
                return res.status(400).json({ message: 'Оффер уже отклонен' });
            }

            // Удаляем оффер и его сообщение (сначала оффер, потом сообщение из-за FK)
            const roomId = offer.Message.chat_room_id;
            const messageId = offer.Message.id;
            
            await FightOffer.destroy({ where: { id: offer.id } });
            await ChatMessage.destroy({ where: { id: messageId } });

            // Отправляем WebSocket уведомление об удалении сообщения
            const webSocketServer = req.app.get('webSocketServer');
            if (webSocketServer) {
                webSocketServer.broadcastToRoom(`room_${roomId}`, null, {
                    type: 'message_deleted',
                    messageId: messageId,
                    roomId: roomId
                });
            }

            res.json({ 
                success: true, 
                message: 'Оффер отменен и удален',
                deletedMessageId: messageId
            });

        } catch (error) {
            console.error('Ошибка при отмене оффера:', error);
            res.status(500).json({ message: 'Внутренняя ошибка сервера' });
        } finally {
            // Убеждаемся, что состояние сброшено
        }
    }

    // Отметить сообщения как прочитанные
    async markMessagesAsRead(req, res) {
        try {
            const { roomId } = req.params;
            const userId = req.user.id;

            console.log(`Отмечаем сообщения как прочитанные в комнате ${roomId} для пользователя ${userId}`);

            // Проверяем, является ли пользователь участником комнаты
            const participant = await ChatRoomParticipant.findOne({
                where: {
                    chat_room_id: roomId,
                    user_id: userId,
                    is_active: true
                }
            });

            if (!participant) {
                return res.status(403).json({
                    message: 'У вас нет доступа к этой комнате'
                });
            }

            // Отмечаем все непрочитанные сообщения как прочитанные
            const { Op } = require('sequelize');
            const [updatedCount] = await ChatMessage.update({
                is_read: true,
                read_at: new Date(),
                read_by: userId
            }, {
                where: {
                    chat_room_id: roomId,
                    sender_id: { [Op.ne]: userId }, // Не отмечаем свои сообщения
                    is_read: false
                }
            });

            // Обновляем время последнего прочтения участника
            await participant.update({ last_read_at: new Date() });

            console.log(`Отмечено ${updatedCount} сообщений как прочитанные`);

            // Если есть обновленные сообщения, уведомляем через WebSocket
            if (updatedCount > 0) {
                // Получаем обновленные сообщения
                const updatedMessages = await ChatMessage.findAll({
                    where: {
                        chat_room_id: roomId,
                        read_by: userId,
                        is_read: true
                    },
                    attributes: ['id', 'sender_id', 'is_read', 'read_at'],
                    order: [['createdAt', 'DESC']],
                    limit: updatedCount
                });

                // Отправляем WebSocket уведомление о прочтении
                const webSocketServer = req.app.get('webSocketServer');
                if (webSocketServer) {
                    webSocketServer.notifyMessagesRead(roomId, {
                        readBy: userId,
                        messageIds: updatedMessages.map(msg => msg.id),
                        readAt: new Date()
                    });
                }
            }

            res.json({
                success: true,
                message: `Отмечено ${updatedCount} сообщений как прочитанные`
            });

        } catch (error) {
            console.error('Ошибка отметки сообщений как прочитанные:', error);
            res.status(500).json({
                message: 'Ошибка отметки сообщений как прочитанные',
                error: error.message
            });
        }
    }

    // Обновить статус пользователя онлайн
    async updateUserOnlineStatus(req, res) {
        try {
            const userId = req.user.id;
            const { isOnline } = req.body;

            console.log(`Обновляем статус онлайн для пользователя ${userId}: ${isOnline}`);

            await Users.update({
                is_online: isOnline,
                last_seen_at: new Date()
            }, {
                where: { id: userId }
            });

            res.json({
                success: true,
                message: 'Статус обновлен'
            });

        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
            res.status(500).json({
                message: 'Ошибка обновления статуса',
                error: error.message
            });
        }
    }

    // Получить статус участников комнаты
    async getRoomParticipantsStatus(req, res) {
        try {
            const { roomId } = req.params;
            const userId = req.user.id;

            // Проверяем доступ к комнате
            const participant = await ChatRoomParticipant.findOne({
                where: {
                    chat_room_id: roomId,
                    user_id: userId,
                    is_active: true
                }
            });

            if (!participant) {
                return res.status(403).json({
                    message: 'У вас нет доступа к этой комнате'
                });
            }

            // Получаем всех участников комнаты
            const participants = await ChatRoomParticipant.findAll({
                where: {
                    chat_room_id: roomId,
                    is_active: true
                },
                include: [
                    {
                        model: Users,
                        as: 'User',
                        attributes: ['id', 'firstname', 'lastname', 'avatar_url', 'is_online', 'last_seen_at']
                    }
                ]
            });

            res.json({
                success: true,
                participants: participants.map(p => ({
                    id: p.User.id,
                    name: `${p.User.firstname} ${p.User.lastname}`,
                    avatar: p.User.avatar_url,
                    isOnline: p.User.is_online,
                    lastSeen: p.User.last_seen_at,
                    lastRead: p.last_read_at,
                    role: p.role
                }))
            });

        } catch (error) {
            console.error('Ошибка получения статуса участников:', error);
            res.status(500).json({
                message: 'Ошибка получения статуса участников',
                error: error.message
            });
        }
    }

    // Добавить участника в комнату (для админов и менеджеров)
    async addParticipant(req, res) {
        try {
            const user = req.user;
            const { roomId } = req.params;
            const { userId, role } = req.body;

            // Проверяем права доступа (только админы могут добавлять участников)
            if (!user || user.role !== 3) { // предполагается что 3 - это админ
                return res.status(403).json({
                    message: "Доступ запрещен. Требуются права администратора."
                });
            }

            // Проверяем валидность роли
            const validRoles = ['manager', 'admin'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    message: "Неверная роль. Допустимые значения: manager, admin"
                });
            }

            // Проверяем существование комнаты
            const chatRoom = await ChatRoom.findByPk(roomId);
            if (!chatRoom) {
                return res.status(404).json({
                    message: "Комната не найдена"
                });
            }

            // Проверяем, что пользователь не является уже участником
            const existingParticipant = await ChatRoomParticipant.findOne({
                where: {
                    chat_room_id: roomId,
                    user_id: userId
                }
            });

            if (existingParticipant) {
                if (existingParticipant.is_active) {
                    return res.status(400).json({
                        message: "Пользователь уже является участником комнаты"
                    });
                } else {
                    // Реактивируем участника
                    await existingParticipant.update({ is_active: true, role });
                }
            } else {
                // Добавляем нового участника
                await ChatRoomParticipant.create({
                    chat_room_id: roomId,
                    user_id: userId,
                    role: role
                });
            }

            res.json({
                success: true,
                message: "Участник добавлен в комнату"
            });

        } catch (error) {
            console.error('Ошибка добавления участника:', error);
            res.status(500).json({
                message: "Ошибка добавления участника",
                error: error.message
            });
        }
    }

    // Создать и отправить оффер
    async sendOffer(req, res) {
        try {
            const { roomId } = req.params;
            const userId = req.user.id;
            const { fightId, fighterId, fee, teamSize, cornerColor, weightLimit, additionalConditions, expiresIn } = req.body;

            // Проверяем, что пользователь - промоутер
            const promoter = await Promoters.findOne({
                where: { user_id: userId }
            });

            if (!promoter) {
                return res.status(403).json({
                    message: 'Только промоутеры могут отправлять офферы'
                });
            }

            // Проверяем, что бой существует
            const fight = await Fight.findByPk(fightId);
            if (!fight) {
                return res.status(404).json({
                    message: 'Бой не найден'
                });
            }

            // Проверяем, что боец существует
            const fighter = await Fighters.findByPk(fighterId);
            if (!fighter) {
                return res.status(404).json({
                    message: 'Боец не найден'
                });
            }

            // 1. Проверяем, что угол не занят в таблице Fight
            const cornerField = cornerColor === 'red' ? 'fighter_red' : 'fighter_blue';
            if (fight[cornerField]) {
                // Получаем информацию о бойце, который уже занимает угол
                const occupyingFighter = await Fighters.findByPk(fight[cornerField], {
                    include: [{ model: Users, as: 'User' }]
                });
                
                const occupyingFighterName = occupyingFighter && occupyingFighter.User 
                    ? `${occupyingFighter.User.firstname} ${occupyingFighter.User.lastname}`
                    : `ID ${fight[cornerField]}`;

                return res.status(400).json({ 
                    message: `${cornerColor === 'red' ? 'Красный' : 'Синий'} угол уже занят бойцом ${occupyingFighterName}` 
                });
            }

            // 2. Проверяем активные офферы и удаляем отклоненные
            const existingOffers = await FightOffer.findAll({
                where: {
                    fight_id: fightId,
                    fighter_id: fighterId
                },
                include: [{
                    model: ChatMessage,
                    as: 'Message'
                }]
            });

            const deletedMessageIds = []; // Для отслеживания удаленных сообщений

            for (const offer of existingOffers) {
                if (offer.status === 'rejected') {
                    // Удаляем отклоненный оффер и его сообщение (сначала оффер, потом сообщение из-за FK)
                    await FightOffer.destroy({ where: { id: offer.id } });
                    if (offer.Message) {
                        deletedMessageIds.push(offer.Message.id);
                        await ChatMessage.destroy({ where: { id: offer.Message.id } });
                    }
                    console.log(`Удален отклоненный оффер ${offer.id} для бойца ${fighterId}`);
                } else if (offer.status === 'pending' || offer.status === 'accepted') {
                    return res.status(400).json({ 
                        message: `Бойцу уже отправлен активный оффер на этот бой (статус: ${offer.status})` 
                    });
                }
            }

            // Создаем сообщение-оффер
            const offerData = {
                fightId,
                fighterId,
                fee,
                teamSize: teamSize || 1,
                cornerColor,
                weightLimit,
                additionalConditions,
                fightName: fight.name,
                fighterName: fighter.User ? `${fighter.User.firstname} ${fighter.User.lastname}` : 'Боец'
            };

            const message = await ChatMessage.create({
                chat_room_id: roomId,
                sender_id: userId,
                sender_type: 'promoter',
                text: `Предложение участия в бою "${fight.name}"`,
                message_type: 'offer',
                offer_data: offerData
            });

            // Создаем запись оффера
            const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000) : null; // дни в миллисекунды
            
            const fightOffer = await FightOffer.create({
                message_id: message.id,
                fight_id: fightId,
                promoter_id: promoter.id,
                fighter_id: fighterId,
                fee,
                team_size: teamSize || 1,
                corner_color: cornerColor,
                weight_limit: weightLimit,
                additional_conditions: additionalConditions,
                expires_at: expiresAt
            });

            // Загружаем полное сообщение с ассоциациями
            const fullMessage = await ChatMessage.findByPk(message.id, {
                include: [
                    {
                        model: Users,
                        as: 'Sender',
                        attributes: ['id', 'firstname', 'lastname', 'avatar_url']
                    },
                    {
                        model: FightOffer,
                        as: 'Offer',
                        include: [
                            {
                                model: Fight,
                                as: 'Fight',
                                attributes: ['id', 'name', 'salary', 'fight_date', 'location', 'rounds', 'weight_category_id', 'martial_art_id', 'event_id'],
                                include: [
                                    {
                                        model: Events,
                                        as: 'Event',
                                        attributes: ['id', 'event_name', 'start_date', 'end_date', 'location', 'arena'],
                                        include: [
                                            {
                                                model: Promoters,
                                                as: 'Promoter',
                                                attributes: ['id', 'org_name'],
                                                include: [
                                                    {
                                                        model: Users,
                                                        as: 'User',
                                                        attributes: ['id', 'firstname', 'lastname', 'avatar_url', 'email']
                                                    }
                                                ]
                                            }
                                        ]
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
                                ]
                            },
                            {
                                model: Promoters,
                                as: 'Promoter',
                                attributes: ['id', 'org_name'],
                                include: [
                                    {
                                        model: Users,
                                        as: 'User',
                                        attributes: ['id', 'firstname', 'lastname', 'avatar_url']
                                    }
                                ]
                            },
                            {
                                model: Fighters,
                                as: 'Fighter',
                                attributes: ['id'],
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
            });

            // Отправляем WebSocket уведомления
            const webSocketServer = req.app.get('webSocketServer');
            if (webSocketServer) {
                // Сначала уведомляем об удаленных сообщениях
                for (const messageId of deletedMessageIds) {
                    webSocketServer.broadcastToRoom(`room_${roomId}`, null, {
                        type: 'message_deleted',
                        messageId: messageId,
                        roomId: roomId
                    });
                }

                // Затем отправляем новое сообщение
                webSocketServer.broadcastToRoom(`room_${roomId}`, null, {
                    type: 'new_message',
                    message: fullMessage
                });
            }

            res.json({
                success: true,
                message: 'Оффер успешно отправлен',
                messageId: message.id,
                offerId: fightOffer.id
            });

        } catch (error) {
            console.error('Ошибка отправки оффера:', error);
            res.status(500).json({
                message: 'Ошибка отправки оффера',
                error: error.message
            });
        }
    }

    // Ответить на оффер (принять/отклонить)
    async respondToOffer(req, res) {
        try {
            const { offerId } = req.params;
            const userId = req.user.id;
            const { action, response } = req.body; // action: 'accept' или 'reject'

            // Найдем оффер
            const offer = await FightOffer.findByPk(offerId, {
                include: [
                    {
                        model: ChatMessage,
                        as: 'Message'
                    },
                    {
                        model: Fight,
                        as: 'Fight'
                    },
                    {
                        model: Fighters,
                        as: 'Fighter',
                        include: [{
                            model: Users,
                            as: 'User'
                        }]
                    }
                ]
            });

            if (!offer) {
                return res.status(404).json({
                    message: 'Оффер не найден'
                });
            }

            // Проверяем, что пользователь - тот самый боец
            if (offer.Fighter.User.id !== userId) {
                return res.status(403).json({
                    message: 'Вы не можете отвечать на этот оффер'
                });
            }

            // Проверяем статус оффера
            if (offer.status !== 'pending') {
                return res.status(400).json({
                    message: 'На этот оффер уже был дан ответ'
                });
            }

            // Обновляем статус оффера
            const newStatus = action === 'accept' ? 'accepted' : 'rejected';
            await offer.update({
                status: newStatus,
                response_at: new Date(),
                fighter_response: response
            });

            // Системное сообщение больше не создаем - достаточно обновленного статуса оффера

            // Если принят, обновляем статус GoFight и записываем бойца в угол
            if (action === 'accept') {
                // Найдем соответствующий GoFight
                const goFight = await GoFight.findOne({
                    where: {
                        fight_id: offer.fight_id,
                        fighter_id: offer.fighter_id
                    }
                });

                if (goFight) {
                    await goFight.update({
                        status: 'accepted'
                    });
                }

                // Записываем бойца в соответствующий угол в таблице Fight
                const cornerField = offer.corner_color === 'red' ? 'fighter_red' : 'fighter_blue';
                
                // Сначала проверим, не занят ли уже этот угол
                const fight = await Fight.findByPk(offer.fight_id);
                if (fight && fight[cornerField] && fight[cornerField] !== offer.fighter_id) {
                    console.warn(`Угол ${cornerField} уже занят бойцом ${fight[cornerField]}, но перезаписываем на ${offer.fighter_id}`);
                }
                
                await Fight.update(
                    { [cornerField]: offer.fighter_id },
                    { where: { id: offer.fight_id } }
                );

                const contractData = {  
                    offer: offer,
                    goFight: goFight,
                    fight: await Fight.findByPk(offer.fight_id, {
                        include: [{
                            model: Events,
                            as: 'Event'
                        }]
                    }),
                    promoter: await Promoters.findByPk(offer.promoter_id, {
                        include: [{
                            model: Users,
                            as: 'User',
                            attributes: ['firstname', 'lastname', 'middlename', 'email', 'phone_number']
                        },
                        {
                            model: PromotersReqRF,
                            as: 'PromotersReqRF',
                            attributes: ['inn', 'ogrn', 'legal_address', 'bic', 'bank_name', 'kpp', 'settlement_account']
                        }
                    ]
                    }),
                    fighter: await Fighters.findByPk(offer.fighter_id, {
                        include: [{
                            model: Users,
                            as: 'User',
                            attributes: ['firstname', 'lastname', 'middlename', 'email', 'phone_number']
                        }]
                    })
                }

                // Логируем структуру данных для отладки
                // console.log('=== СТРУКТУРА ДАННЫХ КОНТРАКТА ===');
                // console.log('offer:', JSON.stringify(offer, null, 2));
                // console.log('goFight:', JSON.stringify(goFight, null, 2));
                // console.log('fight:', JSON.stringify(fight, null, 2));
                // console.log('contractData:', JSON.stringify(contractData, null, 2));
                // console.log('=====================================');

                const resultPdf = await pdfService.createContractPdf(
                    contractData
                );
    
                if (resultPdf.success) {
                    console.log('успешно создан pdf контракт');
                    
                    // Сохраняем URL PDF в таблице fight_offer
                    const pdfUrl = `/uploads/contracts/${resultPdf.filename}`;
                    await offer.update({
                        contract_pdf_url: pdfUrl
                    });
                    
                    // Создаем запись в таблице fight_contract
                    const FightContract = require('../models').FightContract;
                    const contract = await FightContract.create({
                        fight_id: offer.fight_id,
                        fighter_id: offer.fighter_id,
                        promoter_id: offer.promoter_id,
                        offer_id: offer.id,
                        contract_pdf_url: pdfUrl,
                        status: 'created'
                    });
                    
                    console.log(`PDF URL сохранен в fight_offer: ${pdfUrl}`);
                    console.log(`Контракт создан в fight_contract с ID: ${contract.id}`);
                } else {
                    console.log('ошибка создания pdf контракта', resultPdf);
                }

                console.log(`Боец ${offer.fighter_id} записан в ${cornerField} для боя ${offer.fight_id}`);
            } else if (action === 'reject') {
                // При отклонении оффера также проверим, занимал ли боец угол для этого боя
                const fight = await Fight.findByPk(offer.fight_id);
                if (fight) {
                    // Проверяем оба угла и освобождаем, если боец там записан
                    const updates = {};
                    if (fight.fighter_red === offer.fighter_id) {
                        updates.fighter_red = null;
                        console.log(`Освобожден красный угол для бойца ${offer.fighter_id} в бою ${offer.fight_id}`);
                    }
                    if (fight.fighter_blue === offer.fighter_id) {
                        updates.fighter_blue = null;
                        console.log(`Освобожден синий угол для бойца ${offer.fighter_id} в бою ${offer.fight_id}`);
                    }
                    
                    if (Object.keys(updates).length > 0) {
                        await Fight.update(updates, { where: { id: offer.fight_id } });
                    }
                }
            }

            // Отправляем WebSocket уведомление
            const webSocketServer = req.app.get('webSocketServer');
            if (webSocketServer) {
                webSocketServer.broadcastToRoom(`room_${offer.Message.chat_room_id}`, null, {
                    type: 'offer_response',
                    offerId: offer.id,
                    action: action,
                    offer: offer
                });
            }


            res.json({
                success: true,
                message: `Оффер ${action === 'accept' ? 'принят' : 'отклонен'}`,
                offer: offer,
            });

        } catch (error) {
            console.error('Ошибка ответа на оффер:', error);
            res.status(500).json({
                message: 'Ошибка ответа на оффер',
                error: error.message
            });
        }
    }
}

module.exports = new ChatController();
