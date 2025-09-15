const { FightContract, GoFight, Fighters, Fight, Events, Promoters, MartialArt, WeightCategory } = require('../../models');

class FighterCareer{
    async getFighterCareer(req, res) {
        const { userId } = req.params;
        const fighter = await Fighters.findOne({ where: { user_id: userId } });
        if (!fighter) {
            return res.status(404).json({ message: "Такого бойца не существует" });
        }
        // const fighterCareer = await FightContract.findAll({ where: { fighter_id: userId } });
        // Получаем приглашения (GoFight)
        const invites = await GoFight.findAll({
            where: { 
                fighter_id: fighter.id,
                status: 'pending'
             },
            include: [
                {
                    model: Fight,
                    as: 'Fight',
                    attributes: ['id', 'name', 'number', 'salary', 'rounds', 'weight_category_id', 'martial_art_id', 'event_id'],
                    include: [
                        {
                            model: Events,
                            as: 'Event',
                            attributes: ['id', 'event_name', 'start_date', 'location'],
                            include: [
                                {
                                    model: Promoters,
                                    as: 'Promoter',
                                    attributes: ['id', 'org_name', 'org_fio']
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
                }
            ]
        });

        // Получаем контракты (FightContract с signed = true)
        const contracts = await FightContract.findAll({
            where: { 
                fighter_id: fighter.id,
                status: 'signed' 
            },
            include: [
                {
                    model: Fight,
                    as: 'Fight',
                    attributes: ['id', 'name', 'number', 'salary', 'rounds', 'weight_category_id', 'martial_art_id', 'event_id'],
                    include: [
                        {
                            model: Events,
                            as: 'Event',
                            attributes: ['id', 'event_name', 'start_date', 'location'],
                            include: [
                                {
                                    model: Promoters,
                                    as: 'Promoter',
                                    attributes: ['id', 'org_name', 'org_fio']
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
                }
            ]
        });

        // Форматируем данные в нужный формат
        const formattedInvites = invites.map(invite => ({
            id: invite.Fight.id.toString(),
            promoter: {
                name: invite.Fight.Event.Promoter.org_fio,
                company: invite.Fight.Event.Promoter.org_name,
                city: invite.Fight.Event.location
            },
            event: {
                club: invite.Fight.Event.event_name,
                date: new Date(invite.Fight.Event.start_date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    weekday: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                address: invite.Fight.Event.location
            },
            fight: {
                number: `№ ${invite.Fight.number}`,
                type: "Рейтинговый",
                weight: `${invite.Fight.WeightCategory.name} / ${invite.Fight.weight_category_id}lb / ${(invite.Fight.weight_category_id * 0.453592).toFixed(2)}kg`,
                rounds: invite.Fight.rounds.toString(),
                angle: "Синий",
                angleColor: "blue"
            },
            price: {
                fee: invite.Fight.salary.toString(),
                bonus: "5 000 000$",
                bonusVisible: false
            },
            link: `/career/invite/${invite.Fight.id}/`
        }));

        const formattedContracts = contracts.map(contract => ({
            id: `contract-${contract.Fight.id}`,
            promoter: {
                name: contract.Fight.Event.Promoter.org_fio,
                company: contract.Fight.Event.Promoter.org_name,
                city: contract.Fight.Event.location
            },
            event: {
                club: contract.Fight.Event.event_name,
                date: new Date(contract.Fight.Event.start_date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    weekday: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                address: contract.Fight.Event.location
            },
            fight: {
                number: `№ ${contract.Fight.number}`,
                type: "Чемпионский",
                weight: `${contract.Fight.WeightCategory.name} / ${contract.Fight.weight_category_id}lb / ${(contract.Fight.weight_category_id * 0.453592).toFixed(2)}kg`,
                rounds: contract.Fight.rounds.toString(),
                angle: "Красный",
                angleColor: "red"
            },
            price: {
                fee: `${contract.Fight.salary}₽`,
                bonus: `${Math.floor(contract.Fight.salary * 0.5)}₽`,
                bonusVisible: true
            },
            link: `/career/contract/${contract.Fight.id}/`
        }));

        // Возвращаем данные в формате как в career.js
        const tabs = [
            {
                id: 'invite',
                label: 'Приглашения',
                value: 1,
                data: formattedInvites
            },
            {
                id: 'contract',
                label: 'Контракты',
                value: 2,
                data: formattedContracts
            }
        ];
        
        res.json({ tabs });
    }
}

module.exports = new FighterCareer();