const WebSocket = require('ws');
const { ChatMessage, ChatRoom, ChatRoomParticipant, Users, GoFight, Fight, Fighters, FightOffer, Events, Promoters, MartialArt, WeightCategory } = require('./models');

class WebSocketServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map(); // Map для хранения подключений пользователей
        this.rooms = new Map(); // Map для хранения комнат чата
        
        this.init();
    }

    init() {
        this.wss.on('connection', (ws, req) => {
            console.log('Новое WebSocket подключение');
            
            ws.on('message', async (data) => {
                try {
                    const message = JSON.parse(data);
                    await this.handleMessage(ws, message);
                } catch (error) {
                    console.error('Ошибка обработки сообщения:', error);
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Ошибка обработки сообщения'
                    }));
                }
            });

            ws.on('close', () => {
                this.handleDisconnect(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket ошибка:', error);
                this.handleDisconnect(ws);
            });
        });
    }

    async handleMessage(ws, message) {
        switch (message.type) {
            case 'auth':
                await this.handleAuth(ws, message);
                break;
            case 'join_room':
                await this.handleJoinRoom(ws, message);
                break;
            case 'leave_room':
                await this.handleLeaveRoom(ws, message);
                break;
            case 'chat_message':
                await this.handleChatMessage(ws, message);
                break;
            case 'typing':
                await this.handleTyping(ws, message);
                break;
            default:
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Неизвестный тип сообщения'
                }));
        }
    }

    async handleAuth(ws, message) {
        const { userId, userType } = message;
        
        if (!userId || !userType) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Необходимы userId и userType'
            }));
            return;
        }

        // Сохраняем информацию о пользователе
        this.clients.set(ws, {
            userId: parseInt(userId),
            userType,
            rooms: new Set()
        });

        // Обновляем статус пользователя на "онлайн"
        try {
            await Users.update({
                is_online: true,
                last_seen_at: new Date()
            }, {
                where: { id: parseInt(userId) }
            });
            console.log(`Статус пользователя ${userId} обновлен на "онлайн"`);
        } catch (error) {
            console.error('Ошибка обновления статуса пользователя:', error);
        }

        ws.send(JSON.stringify({
            type: 'auth_success',
            userId,
            userType
        }));

        console.log(`Пользователь ${userId} (${userType}) авторизован`);
    }

    async handleJoinRoom(ws, message) {
        const client = this.clients.get(ws);
        if (!client) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Необходима авторизация'
            }));
            return;
        }

        const { roomId: chatRoomId } = message;
        
        if (!chatRoomId) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Необходим roomId'
            }));
            return;
        }

        try {
            console.log(`Попытка присоединения к комнате: roomId=${chatRoomId}, userId=${client.userId}`);
            
            // Проверяем, что пользователь является участником комнаты
            const participant = await ChatRoomParticipant.findOne({
                where: {
                    chat_room_id: chatRoomId,
                    user_id: client.userId,
                    is_active: true
                }
            });

            console.log(`Участник найден:`, participant ? 'да' : 'нет');

            if (!participant) {
                // Дополнительная проверка - может пользователь есть, но неактивный
                const anyParticipant = await ChatRoomParticipant.findOne({
                    where: {
                        chat_room_id: chatRoomId,
                        user_id: client.userId
                    }
                });
                
                console.log(`Любой участник найден:`, anyParticipant ? anyParticipant : 'нет');
                
                // Попробуем найти комнату и проверить права доступа
                const chatRoom = await ChatRoom.findByPk(chatRoomId, {
                    include: [
                        {
                            model: GoFight,
                            as: 'GoFight',
                            include: [
                                {
                                    model: Fight,
                                    as: 'Fight'
                                },
                                {
                                    model: Fighters,
                                    as: 'Fighter',
                                    where: { user_id: client.userId },
                                    required: false
                                }
                            ]
                        }
                    ]
                });
                
                console.log('Найдена комната:', chatRoom ? chatRoom.id : 'нет');
                
                // Если комната не найдена, проверим все комнаты
                if (!chatRoom) {
                    const allRooms = await ChatRoom.findAll({
                        attributes: ['id', 'gofight_id', 'name']
                    });
                    console.log('Все комнаты в базе:', allRooms.map(r => ({id: r.id, gofight_id: r.gofight_id, name: r.name})));
                }
                
                console.log('GoFight:', chatRoom?.GoFight ? chatRoom.GoFight.id : 'нет');
                console.log('Fighter:', chatRoom?.GoFight?.Fighter ? chatRoom.GoFight.Fighter.id : 'нет');
                console.log('Fighter user_id:', chatRoom?.GoFight?.Fighter?.user_id);
                console.log('Client userId:', client.userId);
                
                // Если это боец и это его отклик - создаем участника автоматически
                if (chatRoom && chatRoom.GoFight && chatRoom.GoFight.Fighter && chatRoom.GoFight.Fighter.user_id === client.userId) {
                    console.log('Создаем участника автоматически для бойца');
                    const newParticipant = await ChatRoomParticipant.create({
                        chat_room_id: chatRoomId,
                        user_id: client.userId,
                        role: 'fighter'
                    });
                    console.log('Участник создан:', newParticipant.id);
                } else {
                    console.log('Условие не выполнено, отказываем в доступе');
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Доступ к комнате запрещен'
                    }));
                    return;
                }
            }

            const roomKey = `room_${chatRoomId}`;

            // Добавляем пользователя в комнату WebSocket
            if (!this.rooms.has(roomKey)) {
                this.rooms.set(roomKey, new Set());
            }
            
            this.rooms.get(roomKey).add(ws);
            client.rooms.add(roomKey);
            client.currentRoomId = chatRoomId;

            // Отправляем историю сообщений
            const messages = await ChatMessage.findAll({
                where: { chat_room_id: chatRoomId },
                include: [
                    {
                        model: Users,
                        as: 'Sender',
                        attributes: ['id', 'firstname', 'lastname', 'avatar_url']
                    },
                    {
                        model: FightOffer,
                        as: 'Offer',
                        required: false,
                        include: [
                            {
                                model: Fight,
                                as: 'Fight',
                                attributes: ['id', 'name', 'salary', 'fight_date', 'location', 'rounds', 'weight_category_id', 'martial_art_id', 'event_id', 'number'],
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
                ],
                order: [['createdAt', 'ASC']],
                limit: 50
            });

            ws.send(JSON.stringify({
                type: 'room_joined',
                roomId: chatRoomId,
                messages: messages.map(msg => ({
                    id: msg.id,
                    text: msg.text,
                    sender_id: msg.sender_id, // Используем sender_id для единообразия
                    senderId: msg.sender_id, // Оставляем для обратной совместимости
                    senderType: msg.sender_type,
                    messageType: msg.message_type,
                    message_type: msg.message_type, // Добавляем для совместимости
                    fileUrl: msg.file_url,
                    createdAt: msg.createdAt,
                    is_read: msg.is_read,
                    is_delivered: msg.is_delivered,
                    read_at: msg.read_at,
                    delivered_at: msg.delivered_at,
                    offer_data: msg.offer_data, // Добавляем данные оффера
                    Offer: msg.Offer, // Добавляем ассоциацию Offer
                    sender: {
                        id: msg.Sender.id,
                        firstname: msg.Sender.firstname,
                        lastname: msg.Sender.lastname,
                        avatarUrl: msg.Sender.avatar_url
                    }
                }))
            }));

            // Обновляем время последнего прочтения
            await participant.update({ last_read_at: new Date() });

            // Отмечаем непрочитанные сообщения как доставленные для онлайн пользователя
            const undeliveredMessages = await ChatMessage.findAll({
                where: {
                    chat_room_id: chatRoomId,
                    sender_id: { [require('sequelize').Op.ne]: client.userId },
                    is_delivered: false
                },
                attributes: ['id', 'sender_id']
            });

            if (undeliveredMessages.length > 0) {
                await ChatMessage.update({
                    is_delivered: true,
                    delivered_at: new Date()
                }, {
                    where: {
                        id: { [require('sequelize').Op.in]: undeliveredMessages.map(msg => msg.id) }
                    }
                });

                // Уведомляем отправителей о доставке
                undeliveredMessages.forEach(msg => {
                    this.sendToUser(msg.sender_id, {
                        type: 'message_delivered',
                        messageId: msg.id,
                        deliveredAt: new Date()
                    });
                });

                console.log(`Отмечено ${undeliveredMessages.length} сообщений как доставленные при входе пользователя ${client.userId}`);
            }

            // Уведомляем других участников о входе
            this.broadcastToRoom(roomKey, ws, {
                type: 'user_joined',
                userId: client.userId,
                userType: client.userType,
                roomId: chatRoomId
            });

            console.log(`Пользователь ${client.userId} присоединился к комнате ${roomKey}`);

        } catch (error) {
            console.error('Ошибка при присоединении к комнате:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Ошибка при присоединении к комнате'
            }));
        }
    }

    async handleLeaveRoom(ws, message) {
        const client = this.clients.get(ws);
        if (!client) return;

        const { roomId: chatRoomId } = message;
        const roomKey = `room_${chatRoomId}`;

        if (this.rooms.has(roomKey)) {
            this.rooms.get(roomKey).delete(ws);
            client.rooms.delete(roomKey);
            client.currentRoomId = null;

            // Уведомляем других участников о выходе
            this.broadcastToRoom(roomKey, ws, {
                type: 'user_left',
                userId: client.userId,
                userType: client.userType,
                roomId: chatRoomId
            });

            console.log(`Пользователь ${client.userId} покинул комнату ${roomKey}`);
        }
    }

    async handleChatMessage(ws, message) {
        const client = this.clients.get(ws);
        if (!client) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Необходима авторизация'
            }));
            return;
        }

        const { roomId: chatRoomId, text, messageType = 'text', fileUrl } = message;
        
        if (!chatRoomId || !text) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Необходимы roomId и text'
            }));
            return;
        }

        try {
            // Проверяем, что пользователь является участником комнаты
            const participant = await ChatRoomParticipant.findOne({
                where: {
                    chat_room_id: chatRoomId,
                    user_id: client.userId,
                    is_active: true
                }
            });

            if (!participant) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Доступ к комнате запрещен'
                }));
                return;
            }

            // Сохраняем сообщение в БД
            const chatMessage = await ChatMessage.create({
                chat_room_id: chatRoomId,
                sender_id: client.userId,
                sender_type: participant.role,
                text: text.trim(),
                message_type: messageType,
                file_url: fileUrl || null
            });

            // Загружаем полную информацию о сообщении
            const fullMessage = await ChatMessage.findByPk(chatMessage.id, {
                include: [
                    {
                        model: Users,
                        as: 'Sender',
                        attributes: ['id', 'firstname', 'lastname', 'avatar_url']
                    }
                ]
            });

            const messageData = {
                type: 'new_message',
                roomId: chatRoomId,
                message: {
                    id: fullMessage.id,
                    text: fullMessage.text,
                    sender_id: fullMessage.sender_id, // Используем sender_id для единообразия
                    senderId: fullMessage.sender_id, // Оставляем для обратной совместимости
                    senderType: fullMessage.sender_type,
                    messageType: fullMessage.message_type,
                    message_type: fullMessage.message_type, // Добавляем для совместимости
                    fileUrl: fullMessage.file_url,
                    createdAt: fullMessage.createdAt,
                    is_read: fullMessage.is_read,
                    is_delivered: fullMessage.is_delivered,
                    read_at: fullMessage.read_at,
                    delivered_at: fullMessage.delivered_at,
                    offer_data: fullMessage.offer_data, // Добавляем данные оффера
                    Offer: fullMessage.Offer, // Добавляем ассоциацию Offer
                    sender: {
                        id: fullMessage.Sender.id,
                        firstname: fullMessage.Sender.firstname,
                        lastname: fullMessage.Sender.lastname,
                        avatarUrl: fullMessage.Sender.avatar_url
                    }
                }
            };

            // Отправляем сообщение всем участникам комнаты
            const roomKey = `room_${chatRoomId}`;
            
            // Проверяем, кто онлайн в комнате для отметки доставки
            const roomClients = this.rooms.get(roomKey) || new Set();
            let deliveredToOnlineUsers = false;
            
            roomClients.forEach(clientWs => {
                const clientInfo = this.clients.get(clientWs);
                if (clientInfo && clientInfo.userId !== client.userId && clientWs.readyState === WebSocket.OPEN) {
                    deliveredToOnlineUsers = true;
                }
            });

            // Если есть онлайн пользователи, отмечаем сообщение как доставленное
            if (deliveredToOnlineUsers) {
                await ChatMessage.update({
                    is_delivered: true,
                    delivered_at: new Date()
                }, {
                    where: { id: chatMessage.id }
                });
                
                // Обновляем данные сообщения
                messageData.message.is_delivered = true;
                messageData.message.delivered_at = new Date();
                
                // Отправляем отдельное уведомление отправителю о доставке
                setTimeout(() => {
                    this.sendToUser(client.userId, {
                        type: 'message_delivered',
                        messageId: chatMessage.id,
                        deliveredAt: new Date()
                    });
                }, 100); // Небольшая задержка чтобы сообщение успело дойти до получателя
            }

            this.broadcastToRoom(roomKey, null, messageData);

            // Уведомляем всех участников чата о новом сообщении для обновления списка чатов
            this.notifyNewMessage(message.roomId, {
                messageId: chatMessage.id,
                senderId: client.userId,
                roomId: message.roomId,
                text: message.text,
                timestamp: new Date()
            });

            console.log(`Сообщение отправлено в комнату ${roomKey}`);
        } catch (error) {
            console.error('Ошибка сохранения сообщения:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Ошибка отправки сообщения'
            }));
        }
    }

    async handleTyping(ws, message) {
        const client = this.clients.get(ws);
        if (!client) return;

        const { roomId: chatRoomId, isTyping } = message;
        const roomKey = `room_${chatRoomId}`;

        // Отправляем индикатор печати другим участникам
        this.broadcastToRoom(roomKey, ws, {
            type: 'typing',
            roomId: chatRoomId,
            userId: client.userId,
            userType: client.userType,
            isTyping
        });
    }

    broadcastToRoom(roomId, excludeWs, message) {
        if (!this.rooms.has(roomId)) return;

        this.rooms.get(roomId).forEach(client => {
            if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }

    async handleDisconnect(ws) {
        const client = this.clients.get(ws);
        if (!client) return;

        // Обновляем статус пользователя на "оффлайн"
        try {
            await Users.update({
                is_online: false,
                last_seen_at: new Date()
            }, {
                where: { id: client.userId }
            });
            console.log(`Статус пользователя ${client.userId} обновлен на "оффлайн"`);
        } catch (error) {
            console.error('Ошибка обновления статуса пользователя при отключении:', error);
        }

        // Удаляем пользователя из всех комнат
        client.rooms.forEach(roomId => {
            if (this.rooms.has(roomId)) {
                this.rooms.get(roomId).delete(ws);
                
                // Уведомляем других участников о выходе
                this.broadcastToRoom(roomId, null, {
                    type: 'user_left',
                    userId: client.userId,
                    userType: client.userType
                });
            }
        });

        this.clients.delete(ws);
        console.log(`Пользователь ${client.userId} отключился`);
    }

    // Метод для отправки системных сообщений
    sendToUser(userId, message) {
        for (const [ws, client] of this.clients) {
            if (client.userId === userId && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
            }
        }
    }

    // Уведомить о новом отклике (для промоутера)
    notifyNewResponse(promoterUserId, responseData) {
        this.sendToUser(promoterUserId, {
            type: 'new_fight_response',
            data: responseData
        });
    }

    // Уведомить об изменении статуса отклика (для бойца)
    notifyResponseStatusChange(fighterUserId, responseData) {
        this.sendToUser(fighterUserId, {
            type: 'response_status_changed',
            data: responseData
        });
    }

    // Уведомить о создании новой комнаты чата
    notifyNewChatRoom(userId, roomData) {
        this.sendToUser(userId, {
            type: 'new_chat_room',
            data: roomData
        });
    }

    // Уведомить о прочтении сообщений
    notifyMessagesRead(roomId, readData) {
        const roomKey = `room_${roomId}`;
        console.log(`Отправляем уведомление о прочтении в комнату ${roomKey}:`, readData);
        
        this.broadcastToRoom(roomKey, null, {
            type: 'messages_read',
            roomId: roomId,
            data: readData
        });
    }

    // Уведомить о новом сообщении для обновления списка чатов
    async notifyNewMessage(roomId, messageData) {
        try {
            // Получаем всех участников комнаты
            const participants = await ChatRoomParticipant.findAll({
                where: { chat_room_id: roomId },
                include: [{
                    model: Users,
                    as: 'User',
                    attributes: ['id']
                }]
            });

            // Уведомляем каждого участника о новом сообщении
            participants.forEach(participant => {
                if (participant.User) {
                    this.sendToUser(participant.User.id, {
                        type: 'new_message',
                        roomId: roomId,
                        messageData: messageData
                    });
                }
            });

            console.log(`Уведомления о новом сообщении отправлены участникам комнаты ${roomId}`);
        } catch (error) {
            console.error('Ошибка уведомления о новом сообщении:', error);
        }
    }
}

module.exports = WebSocketServer;



