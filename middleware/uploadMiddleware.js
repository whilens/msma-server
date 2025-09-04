const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Создаем папку для загрузок если её нет
const uploadDir = path.join(__dirname, '../uploads/images');
// console.log('Проверяем папку uploads:', uploadDir);
if (!fs.existsSync(uploadDir)) {
    // console.log('Создаем папку uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
} else {
    // console.log('Папка uploads уже существует');
}

// Настройка хранилища
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // console.log('multer destination вызван для файла:', file.originalname);
        // console.log('Папка назначения:', uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Генерируем уникальное имя файла
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'avatar-' + uniqueSuffix + path.extname(file.originalname);
        // console.log('multer filename вызван, новое имя файла:', filename);
        // console.log('fieldname:', file.fieldname, 'originalname:', file.originalname);
        cb(null, filename);
    }
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
    // console.log('fileFilter вызван для файла:', file.originalname, 'тип:', file.mimetype);
    // Разрешенные типы файлов
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        // console.log('Файл прошел фильтр:', file.originalname);
        cb(null, true);
    } else {
        // console.log('Файл не прошел фильтр:', file.originalname, 'тип:', file.mimetype);
        cb(new Error('Неподдерживаемый тип файла. Разрешены только: jpg, jpeg, png, gif, webp'), false);
    }
};

// Настройка multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB максимум
        files: 1 // Один файл за раз
    }
});

// console.log('multer настроен с параметрами:', {
//     storage: 'diskStorage',
//     fileFilter: 'custom',
//     limits: {
//         fileSize: '10MB',
//         files: 1
//     }
// });

// Middleware для загрузки аватара
const uploadAvatar = upload.single('avatar');
// console.log('uploadAvatar middleware создан');

// Middleware для загрузки фото профиля
const uploadProfilePhoto = upload.single('profilePhoto');

// Middleware для загрузки фото боя
const uploadFightPhoto = upload.single('fightPhoto');

// Middleware для загрузки документов
const uploadDocument = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './uploads/documents');
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    }),
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Неподдерживаемый тип файла. Разрешены только: pdf, jpg, jpeg, png'), false);
        }
    },
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB максимум
        files: 1
    }
}).single('document');

module.exports = {
    uploadAvatar,
    uploadProfilePhoto,
    uploadFightPhoto,
    uploadDocument
};
