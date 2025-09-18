const { Promoters, Fighters, Managers, UserRoleAssign, Users, Roles } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const Token = require('../models/token');
const {
  generateTokens,
  saveRefreshToken,
  removeRefreshToken,
  findRefreshToken,
  revokeAllUserTokens
} = require('../services/tokenService');


class UserController {
    async registerStep1(req, res) {
        const schema = Joi.object({
            email: Joi.string().email().required().messages({
                'string.email': 'Некорректный email',
                'string.empty': 'Email обязателен',
                'any.required': 'Email обязателен'
            }),
            password: Joi.string().min(6).required().messages({
                'string.min': 'Пароль должен быть не менее 6 символов',
                'string.empty': 'Пароль обязателен',
                'any.required': 'Пароль обязателен'
            }),
            rel_password: Joi.string().min(6).required().messages({
                'string.min': 'Повтор пароля должен быть не менее 6 символов',
                'string.empty': 'Повтор пароля обязателен',
                'any.required': 'Повтор пароля обязателен'
            })
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { email, password, rel_password } = req.body;
        if (password !== rel_password) {
            return res.status(400).json({ message: 'Пароли не совпадают' });
        }
        try {
            const candidate = await Users.findOne({ where: { email } });
            if (candidate) {
                return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }
            const hashPassword = await bcrypt.hash(password, 10);
            const user = await Users.create({ email, password_hash: hashPassword });
            const payload = { id: user.id, email: user.email };
            const { accessToken, refreshToken } = generateTokens(payload);
            await saveRefreshToken(user.id, refreshToken, req.headers['user-agent'], req.ip);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                maxAge: 30 * 24 * 60 * 60 * 1000
            });
            return res.json({ accessToken, user: { id: user.id, email: user.email} });
        } catch (err) {
            console.error('Ошибка регистрации:', err);
            return res.status(500).json({ message: 'Ошибка сервера при регистрации' });
        }
    }

    async registerStep3(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Неавторизован' });
        }

        const schema = Joi.object({
            fio: Joi.string().required().messages({
                'string.empty': 'ФИО обязательно',
                'any.required': 'ФИО обязательно'
            }),
            phone: Joi.string().required().messages({
                'string.empty': 'Телефон обязателен',
                'any.required': 'Телефон обязателен'
            }),
            country: Joi.string().required().messages({
                'string.empty': 'Гражданство обязательно',
                'any.required': 'Гражданство обязательно'
            }),
            city: Joi.string().required().messages({
                'string.empty': 'Город обязателен',
                'any.required': 'Город обязателен'
            }),
            role: Joi.number().integer().valid(1, 2, 3).required().messages({
                'number.base': 'Роль должна быть числом',
                'number.integer': 'Роль должна быть целым числом',
                'any.required': 'Роль обязательна',
                'any.only': 'Недопустимая роль' // Валидация ролей
            }),
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Разбиваем ФИО
        const fioParts = req.body.fio.trim().split(' ');
        const firstname = fioParts[0] || '';
        const lastname = fioParts[1] || '';
        const middlename = fioParts[2] || '';

        // Проверка: имя и фамилия обязательны
        if (!firstname || !lastname) {
            return res.status(400).json({ message: 'Укажите имя и фамилию полностью' });
        } 

        const { role } = req.body;

        try {
            // Обновляем информацию о пользователе
            const updateData = {
                firstname: firstname,
                lastname: lastname,
                middlename: middlename,
                phone_number: req.body.phone, // Исправлено: phone -> phone_number
                country: req.body.country,
                city: req.body.city,
            };
            if (middlename) {
                updateData.middlename = middlename;
            }
            await Users.update(updateData, { where: { id: userId } });

            // Находим роль по id
            let roleRecord = await Roles.findOne({ where: { id: role } });
            if (!roleRecord) {
                // Если роль не найдена
                return res.status(400).json({message: "Такой роли не существует"});
            }

            // Присваиваем роль пользователю
            await UserRoleAssign.create({
                user_id: userId,
                role_id: roleRecord.id,
                created_at: new Date(),
            });

            // Создаем запись в соответствующей таблице в зависимости от роли
            if (role === 1) {
                await Promoters.findOrCreate({
                    where: { user_id: userId },
                    defaults: { user_id: userId }
                });
            } else if (role === 2) {
                await Fighters.findOrCreate({
                    where: { user_id: userId },
                    defaults: { user_id: userId }
                });
            } else if (role === 3) {
                await Managers.findOrCreate({
                    where: { user_id: userId },
                    defaults: { user_id: userId }
                });
            }

            // Создаем новый токен с ролью
            const payload = { id: userId, email: req.user.email, role: role };
            const { accessToken, refreshToken } = generateTokens(payload);
            
            // Обновляем refresh токен
            await removeRefreshToken(req.cookies.refreshToken);
            await saveRefreshToken(userId, refreshToken, req.headers['user-agent'], req.ip);
            
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                maxAge: 30 * 24 * 60 * 60 * 1000
            });

            // Получаем обновленные данные пользователя
            const updatedUser = await Users.findOne({ 
                where: { id: userId },
                include: [{
                    model: Roles,
                    as: 'Roles',
                    attributes: ['name']
                }]
            });

            res.json({ 
                accessToken, 
                role: role,
                user: { 
                    id: userId, 
                    email: updatedUser.email,
                    firstname: updatedUser.firstname,
                    lastname: updatedUser.lastname,
                    middlename: updatedUser.middlename,
                    phone_number: updatedUser.phone_number,
                    country: updatedUser.country,
                    city: updatedUser.city,
                    avatar_url: updatedUser.avatar_url,
                    role: role 
                }
            });
        } catch (err) {
            console.error('Ошибка сохранения данных или присвоения роли:', err);
            res.status(500).json({ message: 'Ошибка сервера при сохранении данных или присвоении роли' });
        }
    }

    async loginUser(req, res) {
        const schema = Joi.object({
            email: Joi.string().email().required().messages({
                'string.email': 'Некорректный email',
                'string.empty': 'Email обязателен',
                'any.required': 'Email обязателен'
            }),
            password: Joi.string().min(6).required().messages({
                'string.min': 'Пароль должен быть не менее 6 символов',
                'string.empty': 'Пароль обязателен',
                'any.required': 'Пароль обязателен'
            })
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { email, password } = req.body;
        try {
            const user = await Users.findOne({
            where: { email },
            include: [{
                model: Roles,
                as: 'Roles',
                attributes: ['name']
                // Должно соответствовать алиасу в ассоциации
            }]
            });

            if (!user) {
                return res.status(400).json({ message: 'Пользователь не найден' });
            }
            const isPassValid = await bcrypt.compare(password, user.password_hash);
            if (!isPassValid) {
                return res.status(400).json({ message: 'Неверный пароль' });
            }

            const userRoles = user?.Roles[0]?.UserRoleAssign?.role_id ?? []

            if (userRoles === 1) {
                await Promoters.findOrCreate({
                    where: { user_id: user.id },
                    defaults: { user_id: user.id }
                });
            } 
            else if (userRoles === 2) {
                await Fighters.findOrCreate({
                    where: { user_id: user.id },
                    defaults: { user_id: user.id }
                });
            } 
            else if (userRoles === 3) {
                await Managers.findOrCreate({
                    where: { user_id: user.id },
                    defaults: { user_id: user.id }
                });
            }

            const payload = { id: user.id, email: user.email, role: userRoles }; // Включаем роли в payload
            const { accessToken, refreshToken } = generateTokens(payload);
            await saveRefreshToken(user.id, refreshToken, req.headers['user-agent'], req.ip);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                maxAge: 30 * 24 * 60 * 60 * 1000
            });
            //  // Проверяем, что user.roles не undefined
            return res.json({ 
                accessToken, 
                user: { 
                    id: user.id, 
                    email: user.email, 
                    phone: user.phone_number, 
                    role: userRoles,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    middlename: user.middlename,
                    avatar_url: user.avatar_url,
                    country: user.country,
                    city: user.city
                } 
            });
             // Добавляем роли в ответ
        } catch (err) {
            console.error('Ошибка входа:', err);
            return res.status(500).json({ message: 'Ошибка сервера при входе' });
        }
    }

    async refreshToken(req, res) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ message: 'Нет refresh токена' });
        try {
            const tokenRecord = await findRefreshToken(refreshToken);
            if (!tokenRecord) return res.status(401).json({ message: 'Refresh токен не найден или отозван' });
            const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET || 'refresh_secret');
            await removeRefreshToken(refreshToken);
            const { accessToken, refreshToken: newRefreshToken } = generateTokens({ id: payload.id, email: payload.email, role: payload.role }); // Передаем роли
            await saveRefreshToken(payload.id, newRefreshToken, req.headers['user-agent'], req.ip);
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: false,
                maxAge: 30 * 24 * 60 * 60 * 1000
            });
            return res.json({ accessToken });
        } catch (err) {
            return res.status(401).json({ message: 'Невалидный refresh токен' });
        }
    }

    async logout(req, res) {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await removeRefreshToken(refreshToken);
            res.clearCookie('refreshToken');
        }
        res.json({ message: 'Выход выполнен' });
    }

    async getSessions(req, res) {
        const userId = req.user.id;
        const sessions = await Token.findAll({ where: { user_id: userId, is_revoked: false } });
        res.json(sessions);
    }

    async checkAuth(req, res) {
        try {
            const user = await Users.findOne({ where: { id: req.user.id }, include: {
                model: Roles,
                as: 'Roles',
                attributes: ['name']
            } });
            if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
            const userRoles = user?.Roles[0]?.UserRoleAssign?.role_id ?? []
            res.json({ 
                id: user.id, 
                email: user.email, 
                phone: user.phone_number, 
                role: userRoles,
                firstname: user.firstname,
                lastname: user.lastname,
                middlename: user.middlename,
                avatar_url: user.avatar_url,
                country: user.country,
                city: user.city
            });
        } catch (err) {
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

}

module.exports = new UserController();