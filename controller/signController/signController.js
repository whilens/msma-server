const axios = require('axios');
const { ChatRoom, ChatRoomParticipant, Users, GoFight, Fight, Fighters, Events, Promoters, FightOffer, MartialArt, WeightCategory, FightContract } = require('../../models');



class SignController {
    async postContract(req, res) {
        try {
            console.log('postContract', req.body);
            const { roomId } = req.body;
            
            // Получаем информацию о комнате и связанных данных
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

            if (!room || !room.GoFight) {
                return res.status(404).json({ error: 'Комната или данные о бое не найдены' });
            }

            // Ищем принятый оффер для этого бойца и промоутера
            const acceptedOffer = await FightOffer.findOne({
                where: {
                    fighter_id: room.GoFight.fighter_id,
                    promoter_id: room.GoFight.Fight.Event.Promoter.id,
                    status: 'accepted'
                },
                order: [['createdAt', 'DESC']]
            });

            if (!acceptedOffer) {
                return res.status(404).json({ 
                    error: 'Принятый оффер не найден' 
                });
            }

            // Проверяем, существует ли уже контракт для этого оффера
            let contract = await FightContract.findOne({
                where: {
                    offer_id: acceptedOffer.id,
                    fight_id: acceptedOffer.fight_id,
                    fighter_id: acceptedOffer.fighter_id,
                    promoter_id: acceptedOffer.promoter_id
                }
            });

            // Если контракт уже существует и уже отправлен на подписание
            if (contract && contract.okidoki_signature_url) {
                console.log('Контракт уже существует, перенаправляем на существующий:', contract.okidoki_signature_url);
                return res.json({
                    success: true,
                    message: 'Контракт уже создан',
                    data: {
                        link: contract.okidoki_signature_url,
                        contractId: contract.okidoki_contract_id,
                        status: contract.status
                    }
                });
            }

            // Если контракт существует, но не отправлен на подписание, или не существует - создаем/обновляем
            const pdfUrl = `${process.env.NODE_ENV === 'production' ? process.env.REACT_APP_API_URL_PROD + acceptedOffer.contract_pdf_url : 'https://wayces.ru/uploads/contracts/contract_1757416440814_1757416440814.pdf'}`;
            const redirectUrl = `${process.env.NODE_ENV === 'production' ? process.env.REACT_APP_API_URL_PROD + '/chat/' + roomId : 'http://localhost:3000/chat/' + roomId}`;
            const callbackUrl = `${process.env.NODE_ENV === 'production' ? process.env.REACT_APP_API_URL_PROD + '/api/sign/sign-callback' : ''}`;
            console.log('Отправляем контракт в OkiDoki API:', pdfUrl);

            const postContract = await axios.post('https://api.doki.online/external/new-pdf-contract', {
                api_key: "YGCszoU1Yi_Ao9cK9pLZJCsmWRHWwJMC",
                url: pdfUrl, // Добавлено .pdf
                system_entities: [
                    {	
                        "value": "",
                        "keyword": ""
                    }
                ],
                callback_url: callbackUrl,  // на этот url наш сервис будет отправлять уведомления 
                redirect_url: redirectUrl,
                actual_user_card_id: "" // карточка подписанта. Если это поле не передать - договор подпишется от имени профиля
            });

            console.log('postContract response:', postContract.data);

            // Обновляем или создаем запись контракта
            if (contract) {
                // Обновляем существующий контракт
                await contract.update({
                    okidoki_contract_id: postContract.data.contract_id || postContract.data.id,
                    okidoki_signature_url: postContract.data.signature_url || postContract.data.link,
                    status: 'sent_for_signature'
                });
                console.log('Обновлен существующий контракт:', contract.id);
            } else {
                // Создаем новый контракт
                contract = await FightContract.create({
                    fight_id: acceptedOffer.fight_id,
                    fighter_id: acceptedOffer.fighter_id,
                    promoter_id: acceptedOffer.promoter_id,
                    offer_id: acceptedOffer.id,
                    contract_pdf_url: acceptedOffer.contract_pdf_url,
                    okidoki_contract_id: postContract.data.contract_id || postContract.data.id,
                    okidoki_signature_url: postContract.data.signature_url || postContract.data.link,
                    status: 'sent_for_signature'
                });
                console.log('Создан новый контракт:', contract.id);
            }

            res.json({
                success: true,
                message: 'Контракт отправлен на подписание',
                data: {
                    link: contract.okidoki_signature_url,
                    contractId: contract.okidoki_contract_id,
                    status: contract.status
                }
            });

        } catch (error) {
            console.error('Ошибка при отправке в OkiDoki API:', error.response?.data || error.message);
            res.status(500).json({
                success: false,
                error: 'Ошибка при отправке контракта на подписание',
                details: error.response?.data || error.message
            });
        }
    }
}

module.exports = new SignController();