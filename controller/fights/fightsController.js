const { Fight, Events, Promoters, MartialArt, WeightCategory, Fighters, Users } = require('../../models')

class FightsController {
    async getAllFights(req, res) {
        try {
            const user = req.user;
        
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
                                attributes: ['id', 'firstname', 'lastname', 'city', 'avatar_url', 'country']
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
                                attributes: ['id', 'firstname', 'lastname', 'city', 'avatar_url', 'country']
                            }
                        ]
                    }
                ],
                where: {
                    
                    // Можно добавить фильтры по статусу боя, дате и т.д.
                },
                limit: 10,
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
}

module.exports = new FightsController()