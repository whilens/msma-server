const { Fighters, Users, UserSports, WeightCategory, MartialArt, Promoters } = require('../../models');
const { Op } = require('sequelize');

class PromoFighterSearch {
  async searchFighters(req, res) {
    try {
      const user = req.user;
      const promoter = await Promoters.findOne({ where: { user_id: user.id } });
      
      if (!promoter) {
        return res.status(400).json({ message: "Пользователь не является промоутером" });
      }

      const {
        martialArtId,
        weightCategoryId,
        location,
        stand,
        minHeight,
        maxHeight,
        minFights,
        maxFights,
        rating,
        includeOtherSports = false,
        includeOtherWeights = false
      } = req.body;

      // Базовые условия поиска
      let whereConditions = {
        is_active: true
      };

      // Фильтр по виду спорта
      // if (martialArtId && !includeOtherSports) {
      //   whereConditions['$UserSports.martial_art_id$'] = martialArtId;
      // }

      // // Фильтр по весовой категории
      // if (weightCategoryId && !includeOtherWeights) {
      //   whereConditions['$UserSports.WeightCategory.id$'] = weightCategoryId;
      // }

      // // Фильтр по локации
      // if (location) {
      //   whereConditions['$User.city$'] = { [Op.iLike]: `%${location}%` };
      // }

      // // Фильтр по стойке
      // if (stand) {
      //   whereConditions['$User.stand$'] = stand;
      // }

      // // Фильтр по росту
      // if (minHeight || maxHeight) {
      //   whereConditions['$User.height$'] = {};
      //   if (minHeight) whereConditions['$user.height$'][Op.gte] = minHeight;
      //   if (maxHeight) whereConditions['$user.height$'][Op.lte] = maxHeight;
      // }

      // Фильтр по количеству боев
      // if (minFights || maxFights) {
      //   whereConditions['$Fighters.win$'] = {};
      //   whereConditions['$Fighters.loss$'] = {};
      //   if (minFights) {
      //     whereConditions['$Fighters.win$'][Op.gte] = minFights;
      //     whereConditions['$Fighters.loss$'][Op.gte] = minFights;
      //   }
      //   if (maxFights) {
      //     whereConditions['$Fighters.win$'][Op.lte] = maxFights;
      //     whereConditions['$Fighters.loss$'][Op.lte] = maxFights;
      //   }
      // }

      // // Фильтр по рейтингу
      // if (rating) {
      //   whereConditions['$user.rating$'] = { [Op.gte]: rating };
      // }

      const fighters = await Fighters.findAll({
        where: whereConditions,
        include: [
          {
            model: Users,
            as: 'User',
            attributes: ['id', 'firstname', 'lastname', 'avatar_url', 'nationality']
          },
          // {
          //   model: UserSports,
          //   as: 'UserSports',
          //   include: [
          //     {
          //       model: MartialArt,
          //       as: 'MartialArt',
          //       attributes: ['id', 'name']
          //     },
          //     {
          //       model: WeightCategory,
          //       as: 'WeightCategory',
          //       attributes: ['id', 'name']
          //     }
          //   ]
          // }
        ],
        // order: [['win', 'DESC'], ['loss', 'ASC']]
      });

      res.json({
        success: true,
        // fighters: fighters.map(fighter => ({
        //   id: fighter.id,
        //   nickname: fighter.nickname,
        //   win: fighter.win || 0,
        //   loss: fighter.loss || 0,
        //   user: fighter.User,
        //   sports: fighter.UserSports.map(sport => ({
        //     martialArt: sport.MartialArt,
        //     weightCategory: sport.WeightCategory
        //   }))
        // }))
        fighters: fighters
      });

    } catch (error) {
      console.error("Ошибка при поиске бойцов:", error);
      res.status(500).json({ 
        message: "Ошибка сервера при поиске", 
        error: error.message 
      });
    }
  }

  async getFighterById(req, res) {
    try {
      const user = req.user;
      const promoter = await Promoters.findOne({ where: { user_id: user.id } });
      
      if (!promoter) {
        return res.status(400).json({ message: "Пользователь не является промоутером" });
      }

      const { fighterId } = req.params;

      const fighter = await Fighters.findOne({
        where: { id: fighterId },
        include: [
          {
            model: Users,
            as: 'User',
            attributes: ['id', 'firstname', 'lastname', 'avatar_url']
          },
          {
            model: UserSports,
            as: 'UserSports',
            include: [
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
            ]
          }
        ]
      });

      if (!fighter) {
        return res.status(404).json({ message: "Боец не найден" });
      }

      res.json({
        success: true,
        fighter: {
          id: fighter.id,
          nickname: fighter.nickname,
          win: fighter.win || 0,
          loss: fighter.loss || 0,
          user: fighter.User,
          sports: fighter.userSports.map(sport => ({
            martialArt: sport.MartialArt,
            weightCategory: sport.WeightCategory
          }))
        }
      });

    } catch (error) {
      console.error("Ошибка при получении бойца:", error);
      res.status(500).json({ 
        message: "Ошибка сервера", 
        error: error.message 
      });
    }
  }
}

module.exports = new PromoFighterSearch(); 