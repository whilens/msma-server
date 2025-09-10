const { Promoters, Users, PromotersReqRF, PromotersReqIn } = require('../../models');

class PromoterProfile {
    // Получить профиль промоутера
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
                        attributes: ['id', 'firstname', 'lastname', 'middlename', 'avatar_url', 'phone_number', 'email', 'nationality', 'country'],
                        include: [
                            {
                                model: PromotersReqRF,
                                as: 'PromotersReqRF',
                            },
                            {
                                model: PromotersReqIn,
                                as: 'PromotersReqIn',
                            },
                        ]
                    },
                    {
                        model: PromotersReqRF,
                        as: 'PromotersReqRF',
                    }
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

    // Обновить реквизиты промоутера RF
    async updatePromoterRequisitesRF(req, res) {
        try {
            const user = req.user;
            const { promoterId } = req.params;
            const { inn, ogrn, legal_address, bic, bank_name, kpp, settlement_account } = req.body;  

            // Получаем промоутера по user_id
            const promoter = await Promoters.findOne({ where: { user_id: user.id } });
            if (!promoter) {
                return res.status(404).json({ message: "Промоутер не найден" });
            }

            const reqData = {
                user_id: user.id,
                promoter_id: promoter.id,
                inn,
                ogrn,
                legal_address,
                bic,
                bank_name,
                kpp,
                settlement_account
            }

            const [requisitesRF, created] = await PromotersReqRF.findOrCreate({ 
                where: { promoter_id: promoter.id },
                defaults: reqData
            });
            
            if (!created) {
                await PromotersReqRF.update(reqData, { where: { promoter_id: promoter.id } });
            }
            
            res.json({
                success: true,
                message: "Реквизиты РФ успешно обновлены",
                requisitesRF: requisitesRF
            });
        }
        catch (error) {
            console.error('Ошибка при обновлении реквизитов промоутера:', error);
            res.status(500).json({
                message: "Ошибка при обновлении реквизитов",
                error: error.message
            });
        }
    }

    // Обновить реквизиты промоутера IN
    async updatePromoterRequisitesIN(req, res) {
        try {
            const user = req.user;
            const { promoterId } = req.params;
            const { item1, item2, item3 } = req.body;  

            const reqData = {
                item1,
                item2,
                item3
            }

            const requisitesIN = await PromotersReqIn.findOrCreate({ where: { user_id: user.id } });
            if (!requisitesIN) {
                return res.status(404).json({ message: "PromotersReqIn не найден" });
            }
            await PromotersReqIn.update(reqData, { where: { user_id: user.id } });
            res.json({
                success: true,
                message: "PromotersReqIn успешно обновлен",
                requisitesIN: requisitesIN
            });
        }
        catch (error) {
            console.error('Ошибка при обновлении реквизитов промоутера:', error);
            res.status(500).json({
                message: "Ошибка при обновлении реквизитов",
                error: error.message
            });
        }
    }
}

module.exports = new PromoterProfile();
