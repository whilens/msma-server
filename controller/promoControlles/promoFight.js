const { Promoters, Events, Fight } = require("../../models");
const { sequelize } = require("../../models");
const { Op } = require("sequelize");
const Joi = require("joi");

class PromoFights {
  async createFight(req, res) {
    try {
      const user = req.user;
      const promoter = await Promoters.findOne({ where: { user_id: user.id } });
      if (!promoter) {
        return res
          .status(400)
          .json({ message: "Пользователь не является промоутером" });
      }
      const schema = Joi.object({
        fightName: Joi.string()
          .required()
          .messages({
            "any.required": "Название боя обязательно для заполнения",
          }),
        fightMartialArt: Joi.number()
          .required()
          .messages({
            "any.required": "Вид спорта обязателен для заполнения",
          }),
        fightSalary: Joi.number()
          .integer()
          .required()
          .messages({
            "any.required": "Призовой фонд обязателен для заполнения",
          }),
        fightRounds: Joi.number()
          .integer()
          .required()
          .messages({ "any.required": "Количество раундов обязательно для заполнения" }),
        fightWeight: Joi.number()
          .required()
          .messages({ "any.required": "Весовая категория обязательна для заполнения" }),
        eventId: Joi.number()
          .required()
          .messages({ "any.required": "ID мероприятия обязателен для заполнения" }),
      });

      const { error, value } = schema.validate(req.body); // Добавлена переменная value

      if (error) {
        return res
          .status(400)
          .json({ message: "ошибка" + error.details[0].message });
      }

      const {
        fightName,
        fightMartialArt,
        fightSalary,
        fightRounds,
        fightWeight,
        eventId,
      } = value; // Используем value

      const Event = await Events.findByPk(eventId);

      if (!Event) {
        return res.status(400).json({ message: "Мероприятие не найдено" });
      }

      // Получаем максимальный номер боя для данного мероприятия
      const maxFightNumber = await Fight.max('number', {
        where: { event_id: eventId }
      });

      // Генерируем следующий номер боя
      const nextFightNumber = (maxFightNumber || 0) + 1;

      await Fight.create({
        promoter_id: promoter.id,
        event_id: eventId,
        number: nextFightNumber,
        name: fightName,
        weight_category_id: fightWeight,
        martial_art_id: fightMartialArt,
        salary: fightSalary,
        rounds: fightRounds,
      });

      res.json({ 
        success: true, 
        fightNumber: nextFightNumber,
        message: `Бой №${nextFightNumber} успешно создан`
      });
    } catch (dbError) {
      console.error("Ошибка при создании события в базе данных:", dbError);
      res
        .status(500)
        .json({
          message: "Ошибка при создании события",
          error: dbError.message,
        }); // Добавлена подробная информация об ошибке
    }
  }
  async getAllFights(req, res) {
    try {
      const user = req.user;
      const promoter = await Promoters.findOne({ where: { user_id: user.id } });
      if (!promoter) {
        return res
          .status(400)
          .json({ message: "Пользователь не является промоутером" });
      }
      const allFights = await Fight.findAll({
        where: { promoter_id: promoter.id },
      });
      res.json(allFights);
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .json({
          message: "Ошибка при получении пользователей",
          error: e.message,
        });
    }
  }
  async getOneFight(req, res) {
    try {
      const user = req.user;
      const oneEvent = await Events.findOne({
        where: { promoter_id: user.id, id: req.params.event_id },
      });

      if (!oneEvent) {
        res.status(400).json({ message: "Такого боя не существует" });
      }
      res.json(oneEvent);
    } catch (e) {}
  }
  async deleteOneFight(req, res) {
    try {
      const user = req.user;
      const promoter = await Promoters.findOne({ where: { user_id: user.id } });
      if (!promoter) {
        return res
          .status(400)
          .json({ message: "Пользователь не является промоутером" });
      }
      
      const oneFight = await Fight.findOne({
        where: { promoter_id: promoter.id, id: req.params.fight_id },
      });

      if (!oneFight) {
        return res.status(400).json({ message: "Такого боя не существует" });
      }

      const deletedFightNumber = oneFight.number;
      const eventId = oneFight.event_id;

      // Удаляем бой
      await oneFight.destroy();

      // Перенумеровываем оставшиеся бои с большими номерами
      await Fight.update(
        { number: sequelize.literal('number - 1') },
        { 
          where: { 
            event_id: eventId,
            number: { [Op.gt]: deletedFightNumber }
          }
        }
      );

      res.json({ 
        message: "Удаление прошло успешно",
        renumbered: true
      });
    } catch (error) {
      console.error("Ошибка при удалении боя:", error);
      res.status(500).json({ 
        message: "Ошибка сервера при удалении", 
        error: error.message 
      });
    }
  }

  // Метод для получения следующего номера боя для мероприятия
  async getNextFightNumber(req, res) {
    try {
      const user = req.user;
      const promoter = await Promoters.findOne({ where: { user_id: user.id } });
      
      if (!promoter) {
        return res.status(400).json({ message: "Пользователь не является промоутером" });
      }

      const { eventId } = req.params;

      // Проверяем, что мероприятие принадлежит промоутеру
      const event = await Events.findOne({
        where: { 
          id: eventId,
          promoter_id: promoter.id 
        }
      });

      if (!event) {
        return res.status(404).json({ message: "Мероприятие не найдено" });
      }

      // Получаем максимальный номер боя для данного мероприятия
      const maxFightNumber = await Fight.max('number', {
        where: { event_id: eventId }
      });

      // Генерируем следующий номер боя
      const nextFightNumber = (maxFightNumber || 0) + 1;

      res.json({ 
        nextFightNumber,
        currentFightsCount: maxFightNumber || 0
      });

    } catch (error) {
      console.error("Ошибка при получении следующего номера боя:", error);
      res.status(500).json({ 
        message: "Ошибка сервера", 
        error: error.message 
      });
    }
  }
  async updateOneFight(req, res) {
    const user = req.user;
    const eventId = req.params;
    const schema = Joi.object({
      photoUrl: Joi.string().allow("", null),
      eventName: Joi.string()
        .required()
        .messages({
          "any.required": "Название мероприятия обязательно для заполнения",
        }),
      arena: Joi.string()
        .required()
        .messages({
          "any.required": "Название арены обязательно для заполнения",
        }),
      date: Joi.date().iso().required().messages({
        "date.iso": "Неверный формат даты", // Исправлено: date.iso
        "any.required": "Дата обязательна для заполнения",
      }),
      eventDesc: Joi.string().optional(),
      location: Joi.string()
        .required()
        .messages({ "any.required": "Локация обязательна для заполнения" }),
    });

    const { error, value } = schema.validate(req.body); // Добавлена переменная value

    if (error) {
      return res
        .status(400)
        .json({ message: "ошибка" + error.details[0].message });
    }

    const { photoUrl, eventName, arena, date, eventDesc, location } = value;

    const oneEvent = await Events.findOne({
      where: { promoter_id: user.id, id: req.params.event_id },
    });

    if (!oneEvent) {
      res.status(400).json({ message: "Такого боя не существует" });
    }

    await Events.update({
      where: { promoter_id: user.id, id: eventId },
      photo_url: photoUrl,
      event_name: eventName,
      event_desc: eventDesc,
      start_date: date,
      location: location,
      arena: arena,
    });

    res.json({ message: "Обновление прошло успешно" });
  }
}

module.exports = new PromoFights();
