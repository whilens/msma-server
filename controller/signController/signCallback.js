const { FightContract, ChatRoom, ChatRoomParticipant, Users, GoFight, Fight, Fighters, Events, Promoters, FightOffer } = require('../../models');
const { getWebSocketInstance } = require('../../websocket-instance');

class SignCallback {
    constructor() {
        this.webSocketServer = null;
    }

    setWebSocketServer(wss) {
        this.webSocketServer = wss;
    }

    async signCallback(req, res) {
        try {
            console.log('📝 Получен коллбэк подписания контракта:', req.body);
            
            const callbackData = req.body;
            const { _id, status, entities, system_entities, verifications, message } = callbackData;
            
            // Проверяем, что контракт подписан
            if (!status || status.internal_id !== 2 || status.name !== 'Подписан') {
                console.log('⚠️ Контракт не подписан, статус:', status);
                return res.json({ 
                    success: false, 
                    message: 'Контракт не подписан' 
                });
            }

            // Находим контракт по okidoki_contract_id
            const contract = await FightContract.findOne({
                where: { okidoki_contract_id: _id },
                include: [
                    {
                        model: Fight,
                        as: 'Fight',
                        include: [
                            {
                                model: GoFight,
                                as: 'Responses',
                                include: [
                                    {
                                        model: ChatRoom,
                                        as: 'ChatRoom',
                                        include: [
                                            {
                                                model: ChatRoomParticipant,
                                                as: 'Participants',
                                                include: [
                                                    {
                                                        model: Users,
                                                        as: 'User'
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            if (!contract) {
                console.log('❌ Контракт не найден в БД с okidoki_contract_id:', _id);
                return res.json({ 
                    success: false, 
                    message: 'Контракт не найден' 
                });
            }

            console.log('✅ Найден контракт:', contract.id);

            // Обновляем статус контракта
            await contract.update({
                status: 'signed',
                signed_at: new Date(),
                // Сохраняем дополнительные данные из OkiDoki
                contract_details: JSON.stringify({
                    okidoki_data: callbackData,
                    entities: entities || [],
                    system_entities: system_entities || [],
                    verifications: verifications || {}
                })
            });

            console.log('✅ Статус контракта обновлен на "signed"');

            // Находим чат для отправки уведомления
            // Получаем первый доступный чат из связанных GoFight
            const chatRoom = contract.Fight?.Responses?.[0]?.ChatRoom;
            
            if (!chatRoom) {
                console.log('❌ Чат не найден для контракта');
                return res.json({ 
                    success: false, 
                    message: 'Чат не найден' 
                });
            }

            // Загружаем полную информацию о чате
            const fullChatRoom = await ChatRoom.findByPk(chatRoom.id, {
                include: [
                    {
                        model: ChatRoomParticipant,
                        as: 'Participants',
                        include: [
                            {
                                model: Users,
                                as: 'User'
                            }
                        ]
                    },
                    {
                        model: GoFight,
                        as: 'GoFight',
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
                                                    { model: Users, as: 'User' }
                                                ]
                                            }
                                        ]
                                    }
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

            // Проверяем наличие чата (WebSocket уведомления пока отключены)
            if (fullChatRoom) {
                // Отправляем уведомление в чат
                const notificationData = {
                    type: 'contract_signed',
                    message: 'Контракт успешно подписан! 🎉',
                    contractId: contract.id,
                    signedAt: new Date().toISOString(),
                    details: {
                        contractNumber: system_entities?.find(e => e.keyword === 'Номер договора')?.value || 'N/A',
                        signer: 'Подписант',
                        status: 'signed'
                    }
                };

                console.log('📢 Контракт подписан для чата:', fullChatRoom.id);
                console.log('📊 Данные уведомления:', notificationData);

                // TODO: Добавить WebSocket уведомления после исправления
                // webSocketServer.broadcastToRoom(`room_${fullChatRoom.id}`, null, notificationData);
            }

            // Обновляем статус оффера если нужно
            if (contract.offer_id) {
                const offer = await FightOffer.findByPk(contract.offer_id);
                if (offer) {
                    await offer.update({
                        status: 'contract_signed'
                    });
                    console.log('✅ Статус оффера обновлен на "contract_signed"');
                }
            }

            console.log('🎉 Обработка коллбека завершена успешно');

            res.json({ 
                success: true, 
                message: 'Контракт успешно обработан',
                contractId: contract.id,
                status: 'signed'
            });

        } catch (error) {
            console.error('💥 Ошибка в signCallback:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Ошибка обработки коллбека',
                error: error.message 
            });
        }
    }
}

module.exports = new SignCallback();