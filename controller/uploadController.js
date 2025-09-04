const { uploadAvatar, uploadProfilePhoto, uploadFightPhoto, uploadDocument } = require('../middleware/uploadMiddleware');
const { Users, Fighters, Promoters, Fights } = require('../models');
const path = require('path');
const fs = require('fs');

class UploadController {
    // Загрузка аватара пользователя
    async uploadAvatar(req, res) {
        try {
            console.log('uploadAvatar контроллер вызван');
            console.log('req.user:', req.user);
            console.log('req.file:', req.file);
            
            if (!req.file) {
                console.log('Файл не был загружен!');
                return res.status(400).json({
                    message: 'Файл не был загружен'
                });
            }
            console.log('Файл успешно загружен:', req.file);

            const userId = req.user.id;
            const filePath = `/uploads/images/${req.file.filename}`;
            console.log('Созданный путь к файлу:', filePath);

            // Обновляем аватар пользователя
            console.log('Обновляем аватар для пользователя:', userId, 'путь:', filePath);
            const result = await Users.update(
                { avatar_url: filePath },
                { where: { id: userId } }
            );
            console.log('Результат обновления:', result);
            
            // Проверяем, что данные действительно обновились
            const updatedUser = await Users.findByPk(userId);
            console.log('Проверка обновления - новый avatar_url:', updatedUser?.avatar_url);

            res.json({
                success: true,
                message: 'Аватар успешно загружен',
                filePath: filePath,
                filename: req.file.filename
            });
        } catch (error) {
            console.error('Ошибка загрузки аватара:', error);
            res.status(500).json({
                message: 'Ошибка загрузки аватара',
                error: error.message
            });
        }
    }

    // Загрузка фото профиля бойца
    async uploadFighterPhoto(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: 'Файл не был загружен'
                });
            }

            const userId = req.user.id;
            const filePath = `/uploads/images/${req.file.filename}`;

            // Обновляем фото профиля бойца
            await Fighters.update(
                { profile_photo: filePath },
                { where: { user_id: userId } }
            );

            res.json({
                success: true,
                message: 'Фото профиля успешно загружено',
                filePath: filePath,
                filename: req.file.filename
            });
        } catch (error) {
            console.error('Ошибка загрузки фото профиля:', error);
            res.status(500).json({
                message: 'Ошибка загрузки фото профиля',
                error: error.message
            });
        }
    }

    // Загрузка фото боя
    async uploadFightPhoto(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: 'Файл не был загружен'
                });
            }

            const { fightId } = req.params;
            const filePath = `/uploads/images/${req.file.filename}`;

            // Обновляем фото боя
            await Fights.update(
                { photo: filePath },
                { where: { id: fightId } }
            );

            res.json({
                success: true,
                message: 'Фото боя успешно загружено',
                filePath: filePath,
                filename: req.file.filename
            });
        } catch (error) {
            console.error('Ошибка загрузки фото боя:', error);
            res.status(500).json({
                message: 'Ошибка загрузки фото боя',
                error: error.message
            });
        }
    }

    // Удаление файла
    async deleteFile(req, res) {
        try {
            const { filename } = req.params;
            const filePath = path.join('./uploads/images', filename);

            // Проверяем существование файла
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    message: 'Файл не найден'
                });
            }

            // Удаляем файл
            fs.unlinkSync(filePath);

            res.json({
                success: true,
                message: 'Файл успешно удален'
            });
        } catch (error) {
            console.error('Ошибка удаления файла:', error);
            res.status(500).json({
                message: 'Ошибка удаления файла',
                error: error.message
            });
        }
    }

    // Получение списка файлов пользователя
    async getUserFiles(req, res) {
        try {
            const userId = req.user.id;
            const uploadDir = './uploads/images';
            
            if (!fs.existsSync(uploadDir)) {
                return res.json({
                    success: true,
                    files: []
                });
            }

            const files = fs.readdirSync(uploadDir)
                .filter(file => file.includes(`user-${userId}`))
                .map(file => ({
                    filename: file,
                    path: `/uploads/images/${file}`,
                    size: fs.statSync(path.join(uploadDir, file)).size,
                    uploadedAt: fs.statSync(path.join(uploadDir, file)).mtime
                }));

            res.json({
                success: true,
                files: files
            });
        } catch (error) {
            console.error('Ошибка получения файлов:', error);
            res.status(500).json({
                message: 'Ошибка получения файлов',
                error: error.message
            });
        }
    }
}

module.exports = new UploadController();
