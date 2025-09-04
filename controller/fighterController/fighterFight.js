const { Fighters, Users, Events, Promoters, MartialArt, WeightCategory, Fight, UserSports, Antrop, RequisitesRF, RequisitesIn, PassportRF, PassportIn } = require('../../models');
const { Op } = require('sequelize');

class FighterFight {
    // Получить все бои для бойца
    async getAllFights(req, res) {
        try {
            const user = req.user;
            
            // Проверяем, что пользователь является бойцом
            if (!user || user.role !== 2) {
                return res.status(403).json({
                    message: "Доступ запрещен. Требуются права бойца."
                });
            }

            

            const allFights = await Fight.findAll({
                include: [
                    {
                        model: Events,
                        as: 'Event',
                        attributes: ['id', 'event_name', 'start_date', 'location', 'arena'],
                        include: [
                            {
                                model: Promoters,
                                as: 'Promoter',
                                attributes: ['id', 'org_name'],
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
                    },
                    {
                        model: Fighters,
                        as: 'FighterRed',
                        required: false,
                        attributes: ['id', 'win', 'loss', 'draw'],
                        include: [
                            {
                                model: Users,
                                as: 'User',
                                attributes: ['id', 'firstname', 'lastname', 'nationality', 'avatar_url', 'country']
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
                                attributes: ['id', 'firstname', 'lastname', 'nationality', 'avatar_url', 'country']
                            }
                        ]
                    }
                ],
                where: {
                    // Можно добавить фильтры по статусу боя, дате и т.д.
                },
            });

            res.json({
                fights: allFights
            });

        } catch (error) {
            console.error('Ошибка при получении списка боёв:', error);
            res.status(500).json({
                message: "Ошибка при получении списка боёв",
                error: error.message
            });
        }
    }

    // Получить бои конкретного бойца
    async getFighterFights(req, res) {
        try {
            const user = req.user;
            const { fighterId } = req.params;

            // Проверяем права доступа
            if (!user || (user.role !== 2 && user.role !== 1)) {
                return res.status(403).json({
                    message: "Доступ запрещен. Требуются права бойца или промоутера."
                });
            }

            // Если это боец, проверяем что он запрашивает свои бои
            if (user.role === 2 && user.id !== parseInt(fighterId)) {
                return res.status(403).json({
                    message: "Вы можете просматривать только свои бои."
                });
            }

            const fighterFights = await Fight.findAll({
                include: [
                    {
                        model: Events,
                        as: 'Event',
                        attributes: ['id', 'event_name', 'event_date', 'location', 'status'],
                        include: [
                            {
                                model: Promoters,
                                as: 'Promoter',
                                attributes: ['id', 'company_name'],
                                include: [
                                    {
                                        model: Users,
                                        as: 'User',
                                        attributes: ['id', 'firstname', 'lastname', 'avatar_url']
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
                        attributes: ['id', 'name', 'weight']
                    }
                ],
                where: {
                    fighter_id: fighterId
                },
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                fights: fighterFights
            });

        } catch (error) {
            console.error('Ошибка при получении боёв бойца:', error);
            res.status(500).json({
                message: "Ошибка при получении боёв бойца",
                error: error.message
            });
        }
    }

    // Получить детали конкретного боя
    async getFightDetails(req, res) {
        try {
            const user = req.user;
            const { fightId } = req.params;

            if (!user) {
                return res.status(401).json({
                    message: "Пользователь не авторизован"
                });
            }

            const fight = await Fight.findOne({
                where: { id: fightId },
                include: [
                    {
                        model: Events,
                        as: 'Event',
                        attributes: ['id', 'event_name', 'start_date', 'location', 'arena'],
                        include: [
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
            });

            if (!fight) {
                return res.status(404).json({
                    message: "Бой не найден"
                });
            }

            res.json({
                success: true,
                fight: fight
            });

        } catch (error) {
            console.error('Ошибка при получении деталей боя:', error);
            res.status(500).json({
                message: "Ошибка при получении деталей боя",
                error: error.message
            });
        }
    }

    // Получить статистику боёв бойца
    async getFighterStats(req, res) {
        try {
            const user = req.user;
            const { fighterId } = req.params;

            if (!user || (user.role !== 2 && user.role !== 1)) {
                return res.status(403).json({
                    message: "Доступ запрещен. Требуются права бойца или промоутера."
                });
            }

            // Если это боец, проверяем что он запрашивает свою статистику
            if (user.role === 2 && user.id !== parseInt(fighterId)) {
                return res.status(403).json({
                    message: "Вы можете просматривать только свою статистику."
                });
            }

            const totalFights = await Fight.count({
                where: { fighter_id: fighterId }
            });

            const wins = await Fight.count({
                where: { 
                    fighter_id: fighterId,
                    result: 'win'
                }
            });

            const losses = await Fight.count({
                where: { 
                    fighter_id: fighterId,
                    result: 'loss'
                }
            });

            const draws = await Fight.count({
                where: { 
                    fighter_id: fighterId,
                    result: 'draw'
                }
            });

            const upcomingFights = await Fight.count({
                where: { 
                    fighter_id: fighterId,
                    status: 'scheduled'
                }
            });

            res.json({
                success: true,
                stats: {
                    totalFights,
                    wins,
                    losses,
                    draws,
                    upcomingFights,
                    winRate: totalFights > 0 ? ((wins / totalFights) * 100).toFixed(1) : 0
                }
            });

        } catch (error) {
            console.error('Ошибка при получении статистики бойца:', error);
            res.status(500).json({
                message: "Ошибка при получении статистики бойца",
                error: error.message
            });
        }
    }

    // Получить предстоящие бои бойца
    async getUpcomingFights(req, res) {
        try {
            const user = req.user;
            const { fighterId } = req.params;

            if (!user || (user.role !== 2 && user.role !== 1)) {
                return res.status(403).json({
                    message: "Доступ запрещен. Требуются права бойца или промоутера."
                });
            }

            // Если это боец, проверяем что он запрашивает свои бои
            if (user.role === 2 && user.id !== parseInt(fighterId)) {
                return res.status(403).json({
                    message: "Вы можете просматривать только свои бои."
                });
            }

            const upcomingFights = await Fight.findAll({
                include: [
                    {
                        model: Events,
                        as: 'Event',
                        attributes: ['id', 'event_name', 'event_date', 'location', 'status'],
                        include: [
                            {
                                model: Promoters,
                                as: 'Promoter',
                                attributes: ['id', 'company_name'],
                                include: [
                                    {
                                        model: Users,
                                        as: 'User',
                                        attributes: ['id', 'firstname', 'lastname', 'avatar_url']
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
                        attributes: ['id', 'name', 'weight']
                    }
                ],
                where: {
                    fighter_id: fighterId,
                    status: 'scheduled'
                },
                order: [['$Event.event_date$', 'ASC']]
            });

            res.json({
                success: true,
                upcomingFights
            });

        } catch (error) {
            console.error('Ошибка при получении предстоящих боёв:', error);
            res.status(500).json({
                message: "Ошибка при получении предстоящих боёв",
                error: error.message
            });
        }
    }

    // Получить историю боёв бойца
    async getFightHistory(req, res) {
        try {
            const user = req.user;
            const { fighterId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            if (!user || (user.role !== 2 && user.role !== 1)) {
                return res.status(403).json({
                    message: "Доступ запрещен. Требуются права бойца или промоутера."
                });
            }

            // Если это боец, проверяем что он запрашивает свои бои
            if (user.role === 2 && user.id !== parseInt(fighterId)) {
                return res.status(403).json({
                    message: "Вы можете просматривать только свои бои."
                });
            }

            const offset = (page - 1) * limit;

            const { count, rows: fights } = await Fight.findAndCountAll({
                include: [
                    {
                        model: Events,
                        as: 'Event',
                        attributes: ['id', 'event_name', 'event_date', 'location'],
                        include: [
                            {
                                model: Promoters,
                                as: 'Promoter',
                                attributes: ['id', 'company_name'],
                                include: [
                                    {
                                        model: Users,
                                        as: 'User',
                                        attributes: ['id', 'firstname', 'lastname', 'avatar_url']
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
                        attributes: ['id', 'name', 'weight']
                    }
                ],
                where: {
                    fighter_id: fighterId,
                    status: 'completed'
                },
                order: [['event_date', 'DESC']],
                limit: parseInt(limit),
                offset: offset
            });

            res.json({
                success: true,
                fights,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalFights: count,
                    fightsPerPage: parseInt(limit)
                }
            });

        } catch (error) {
            console.error('Ошибка при получении истории боёв:', error);
            res.status(500).json({
                message: "Ошибка при получении истории боёв",
                error: error.message
            });
        }
    }

    // Поиск боёв с фильтрами
    async searchFights(req, res) {
        try {
            const user = req.user;
            const { 
                martialArtId, 
                weightCategoryId, 
                status, 
                dateFrom, 
                dateTo,
                page = 1, 
                limit = 20 
            } = req.query;

            if (!user || (user.role !== 2 && user.role !== 1)) {
                return res.status(403).json({
                    message: "Доступ запрещен. Требуются права бойца или промоутера."
                });
            }

            const offset = (page - 1) * limit;
            let whereConditions = {};

            // Фильтр по виду спорта
            if (martialArtId) {
                whereConditions['$MartialArt.id$'] = martialArtId;
            }

            // Фильтр по весовой категории
            if (weightCategoryId) {
                whereConditions['$WeightCategory.id$'] = weightCategoryId;
            }

            // Фильтр по статусу
            if (status) {
                whereConditions.status = status;
            }

            // Фильтр по дате
            if (dateFrom || dateTo) {
                whereConditions['$Event.event_date$'] = {};
                if (dateFrom) {
                    whereConditions['$Event.event_date$'][Op.gte] = new Date(dateFrom);
                }
                if (dateTo) {
                    whereConditions['$Event.event_date$'][Op.lte] = new Date(dateTo);
                }
            }

            const { count, rows: fights } = await Fight.findAndCountAll({
                include: [
                    {
                        model: Events,
                        as: 'Event',
                        attributes: ['id', 'event_name', 'event_date', 'location', 'status'],
                        include: [
                            {
                                model: Promoters,
                                as: 'Promoter',
                                attributes: ['id', 'company_name'],
                                include: [
                                    {
                                        model: Users,
                                        as: 'User',
                                        attributes: ['id', 'firstname', 'lastname', 'avatar_url']
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
                        attributes: ['id', 'name', 'weight']
                    }
                ],
                where: whereConditions,
                order: [['event_date', 'DESC']],
                limit: parseInt(limit),
                offset: offset
            });

            res.json({
                success: true,
                fights,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalFights: count,
                    fightsPerPage: parseInt(limit)
                }
            });

        } catch (error) {
            console.error('Ошибка при поиске боёв:', error);
            res.status(500).json({
                message: "Ошибка при поиске боёв",
                error: error.message
            });
        }
    }

    // Получить ближайшие бои (для всех пользователей)
    async getUpcomingFightsPublic(req, res) {
        try {
            const { 
                martialArtId, 
                weightCategoryId, 
                location,
                page = 1, 
                limit = 20 
            } = req.query;

            const offset = (page - 1) * limit;
            let whereConditions = {
                status: 'scheduled'
            };

            // Фильтр по виду спорта
            if (martialArtId) {
                whereConditions['$MartialArt.id$'] = martialArtId;
            }

            // Фильтр по весовой категории
            if (weightCategoryId) {
                whereConditions['$WeightCategory.id$'] = weightCategoryId;
            }

            // Фильтр по локации
            if (location) {
                whereConditions['$Event.location$'] = { [Op.iLike]: `%${location}%` };
            }

            const { count, rows: fights } = await Fight.findAndCountAll({
                include: [
                    {
                        model: Events,
                        as: 'Event',
                        attributes: ['id', 'event_name', 'event_date', 'location', 'status'],
                        include: [
                            {
                                model: Promoters,
                                as: 'Promoter',
                                attributes: ['id', 'company_name'],
                                include: [
                                    {
                                        model: Users,
                                        as: 'User',
                                        attributes: ['id', 'firstname', 'lastname', 'avatar_url']
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
                        attributes: ['id', 'name', 'weight']
                    }
                ],
                where: whereConditions,
                order: [['$Event.event_date$', 'ASC']],
                limit: parseInt(limit),
                offset: offset
            });

            res.json({
                success: true,
                fights,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalFights: count,
                    fightsPerPage: parseInt(limit)
                }
            });

        } catch (error) {
            console.error('Ошибка при получении ближайших боёв:', error);
            res.status(500).json({
                message: "Ошибка при получении ближайших боёв",
                error: error.message
            });
        }
    }

    // Обновить профиль бойца
    async updateFighterProfile(req, res) {
        try {
            const user = req.user;
            const { fighterId } = req.params;

            // Проверяем права доступа
            if (!user || user.role !== 2) {
                return res.status(403).json({
                    message: "Доступ запрещен. Требуются права бойца."
                });
            }

            const fighterCandidate = await Fighters.findOrCreate({
                where: { user_id: user.id }
            });

            // Если это боец, проверяем что он обновляет свой профиль
            if (!fighterCandidate) {
                return res.status(403).json({
                    message: "Вы можете обновлять только свой профиль."
                });
            }

            const {
                fio,
                phone,
                email,
                nationality,
                martial_art_id,
                weight_category_id,
                boxrec,
                nickname,
                height,
                salary,
                win,
                loss,
                draw,
                status,
                stand,
                videos_url,
                about,
                push_notifications
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
                email,
                nationality
            }, {
                where: { id: user.id }
            });

            // Обновляем или создаем профиль бойца
            const [fighter, created] = await Fighters.findOrCreate({
                where: { user_id: user.id },
                defaults: {
                    user_id: user.id,
                    nickname,
                    win: win || 0,
                    loss: loss || 0,
                    draw: draw || 0,
                    is_active: true,
                    salary: salary || 0,
                    boxrec: boxrec || '',
                    about: about || '',
                    push_notifications: push_notifications || true,
                    status: status || 0,
                    stand: stand || 0,
                    videos_url: videos_url || ''
                }
            });

            if (!created) {
                await fighter.update({
                    nickname,
                    win: win || 0,
                    loss: loss || 0,
                    draw: draw || 0,
                    is_active: true,
                    salary: salary || 0,
                    boxrec: boxrec || '',
                    about: about || '',
                    push_notifications: push_notifications || true,
                    status: status || 0,
                    stand: stand || 0,
                    videos_url: videos_url || ''
                });
            }

            // Обновляем или создаем связи с видами спорта
            if (martial_art_id && weight_category_id) {
                const [userSport, created] = await UserSports.findOrCreate({
                    where: { fighter_id: fighter.id },
                    defaults: {
                        fighter_id: fighter.id,
                        martial_art_id,
                        weight_category_id
                    }
                });

                if (!created) {
                    await userSport.update({
                        martial_art_id,
                        weight_category_id
                    });
                }
            }

            // Обновляем антропометрические данные
            if (height) {
            const [antrop, antropCreated] = await Antrop.findOrCreate({
                where: { fighter_id: fighter.id },
                defaults: {
                    fighter_id: fighter.id,
                    height,
                }
            });

            if (!antropCreated) {
                await antrop.update({
                    height,
                    });
                }
            }

            res.json({
                success: true,
                message: "Профиль успешно обновлен",
                fighter: {
                    id: fighter.id,
                    nickname: fighter.nickname,
                    win: fighter.win,
                    loss: fighter.loss,
                    status,
                    stand,
                    boxrec,
                    videos_url,
                    about,
                    push_notifications
                }
            });

        } catch (error) {
            console.error('Ошибка при обновлении профиля бойца:', error);
            res.status(500).json({
                message: "Ошибка при обновлении профиля",
                error: error.message
            });
        }
    }
    async getFighterProfile(req, res) {
        try {
            const user = req.user;
            const { fighterId } = req.params;

            console.log("getFighterProfile вызван для пользователя:", user.id);
            console.log("user", user)

            const fighter = await Fighters.findOne({
                where: { user_id: user.id },
                include: [
                    {
                        model: UserSports,
                        as: 'UserSports',
                        include: [{ model: MartialArt, as: 'MartialArt' }, { model: WeightCategory, as: 'WeightCategory' }]
                    },
                    {
                        model: Antrop,
                        as: 'Antrop',
                    },
                    {
                        model: Users,
                        as: 'User',
                        attributes: ['id', 'firstname', 'lastname', 'middlename', 'avatar_url', 'phone_number', 'email', 'nationality', 'country'],
                        include: [
                            {
                                model: RequisitesRF,
                                as: 'RequisitesRF',
                            },
                            {
                                model: RequisitesIn,
                                as: 'RequisitesIn',
                            },
                            {
                                model: PassportRF,
                                as: 'PassportRF',
                            },
                            {
                                model: PassportIn,
                                as: 'PassportIn',
                            },
                        ]
                    },
                    

                ]
            });

            console.log("Отправляем профиль бойца, avatar_url:", fighter?.User?.avatar_url);
            
            res.json({
                success: true,
                fighter: fighter
            });
        }
        catch (error) {
            console.error('Ошибка при получении профиля бойца:', error);
            res.status(500).json({
                message: "Ошибка при получении профиля бойца",
                error: error.message
            });
        }
    }
    async updateFighterRequisitesRF(req, res) {
        try {
            const user = req.user;
            const { fighterId } = req.params;
            const { inn, req_bik, req_bank, req_ks, req_rs} = req.body;  
            if (!inn || !req_bik || !req_bank || !req_ks || !req_rs) {
                return res.status(400).json({ message: "Не все поля заполнены" });
            }

            const reqData = {
                inn: inn,
                bik: req_bik,
                bank: req_bank,
                kpp: req_ks,
                rss: req_rs,
            }

            const requisitesRF = await RequisitesRF.findOrCreate({ where: { user_id: user.id } });
            if (!requisitesRF) {
                return res.status(404).json({ message: "RequisitesRF не найден" });
            }
            await RequisitesRF.update(reqData, { where: { user_id: user.id } });
            res.json({
                success: true,
                message: "RequisitesRF успешно обновлен",
                requisitesRF: requisitesRF
            });
        }
        catch (error) {
            console.error('Ошибка при обновлении профиля бойца:', error);
            res.status(500).json({
                message: "Ошибка при обновлении профиля",
                error: error.message
            });
        }
    }
    async updateFighterRequisitesIN(req, res) {
        try {
            const user = req.user;
            const { fighterId } = req.params;
            const { beneficary_name, beneficary_address, acc_number, swift_bic, beneficary_bank_name, beneficary_bank_address, currency, payment_details, sender_name, sender_address} = req.body;  
            if (!beneficary_name) {
                return res.status(400).json({ message: "Заполните обязательное поле" });
            }

            const reqData = {
                beneficary_name, 
                beneficary_address, 
                acc_number, 
                swift_bic,
                beneficary_bank_name,
                beneficary_bank_address,
                currency, payment_details,
                sender_name,
                sender_address
            }

            const requisitesIN = await RequisitesIn.findOrCreate({ where: { user_id: user.id } });
            if (!requisitesIN) {
                return res.status(404).json({ message: "RequisitesIN не найден" });
            }
            await RequisitesIn.update(reqData, { where: { user_id: user.id } });
            res.json({
                success: true,
                message: "RequisitesIN успешно обновлен",
                requisitesIN: requisitesIN
            });
        }
        catch (error) {
            console.error('Ошибка при обновлении профиля бойца:', error);
            res.status(500).json({
                message: "Ошибка при обновлении профиля",
                error: error.message
            });
        }
    }
    
    async updateFighterPassportRF(req, res) {
        try {
            const user = req.user;
            const { fighterId } = req.params;
            const { numbers, birthdate, gender, date_expiry, issued, code_of, address, nationality } = req.body;  
            
            const passportData = {
                numbers,
                birthdate,
                gender,
                date_expiry,
                issued,
                code_of,
                address,
                nationality
            }

            const passportRF = await PassportRF.findOrCreate({ where: { user_id: user.id } });
            if (!passportRF) {
                return res.status(404).json({ message: "PassportRF не найден" });
            }
            await PassportRF.update(passportData, { where: { user_id: user.id } });
            res.json({
                success: true,
                message: "PassportRF успешно обновлен",
                passportRF: passportRF
            });
        }
        catch (error) {
            console.error('Ошибка при обновлении паспортных данных:', error);
            res.status(500).json({
                message: "Ошибка при обновлении паспортных данных",
                error: error.message
            });
        }
    }
    
    async updateFighterPassportIN(req, res) {
        try {
            const user = req.user;
            const { fighterId } = req.params;
            const { 
                passport_numbers, 
                gender, 
                birthdate, 
                place_of_birth, 
                date_of_expiry, 
                issuing_authority, 
                nationality, 
                resident_address, 
                date_of_issue 
            } = req.body;  

            const passportData = {
                passport_numbers,
                gender,
                birthdate,
                place_of_birth,
                date_of_expiry,
                issuing_authority,
                nationality,
                resident_address,
                date_of_issue
            }

            const passportIN = await PassportIn.findOrCreate({ where: { user_id: user.id } });
            if (!passportIN) {
                return res.status(404).json({ message: "PassportIN не найден" });
            }
            await PassportIn.update(passportData, { where: { user_id: user.id } });
            res.json({
                success: true,
                message: "PassportIN успешно обновлен",
                passportIN: passportIN
            });
        }
        catch (error) {
            console.error('Ошибка при обновлении паспортных данных:', error);
            res.status(500).json({
                message: "Ошибка при обновлении паспортных данных",
                error: error.message
            });
        }
    }
}

module.exports = new FighterFight();