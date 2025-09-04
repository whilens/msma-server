const pdf = require('html-pdf');
const path = require('path');
const fs = require('fs');

class PdfService {
    /**
     * Создает PDF файл из HTML шаблона
     * @param {string} html - HTML контент для генерации PDF
     * @param {string} filename - Имя файла (без расширения)
     * @param {Object} options - Опции для PDF (опционально)
     * @param {string} subfolder - Подпапка для сохранения (опционально, по умолчанию 'pdfs')
     * @returns {Promise<Object>} - Результат создания PDF
     */
    async createPdf(html, filename, options = {}, subfolder = 'pdfs') {
        try {
            // Настройки по умолчанию для PDF
            const defaultOptions = {
                format: 'A4',
                border: {
                    top: '0.5in',
                    right: '0.5in',
                    bottom: '0.5in',
                    left: '0.5in'
                },
                header: {
                    height: '20mm',
                },
                footer: {
                    height: '20mm',
                }
            };

            // Объединяем настройки
            const pdfOptions = { ...defaultOptions, ...options };

            // Создаем уникальное имя файла с timestamp
            const timestamp = Date.now();
            const fullFilename = `${filename}_${timestamp}.pdf`;
            const filepath = path.join(__dirname, '../uploads', subfolder, fullFilename);

            // Создаем папку если её нет
            const pdfDir = path.join(__dirname, '../uploads', subfolder);
            if (!fs.existsSync(pdfDir)) {
                fs.mkdirSync(pdfDir, { recursive: true });
            }

            console.log('Создаем PDF файл:', filepath);

            // Генерируем PDF
            return new Promise((resolve, reject) => {
                pdf.create(html, pdfOptions).toFile(filepath, (err, result) => {
                    if (err) {
                        console.error('Ошибка создания PDF:', err);
                        reject({
                            success: false,
                            message: 'Ошибка создания PDF файла',
                            error: err.message
                        });
                    } else {
                        console.log('PDF успешно создан:', result.filename);
                        resolve({
                            success: true,
                            message: 'PDF файл успешно создан',
                            filename: fullFilename,
                            filePath: `/uploads/${subfolder}/${fullFilename}`,
                            fullPath: result.filename,
                        });
                    }
                });
            });

        } catch (error) {
            console.error('Ошибка в createPdf:', error);
            throw {
                success: false,
                message: 'Внутренняя ошибка сервера',
                error: error.message
            };
        }
    }

    /**
     * Скачивает PDF файл
     * @param {string} filename - Имя файла
     * @param {string} subfolder - Подпапка (опционально, по умолчанию 'pdfs')
     * @returns {Object} - Результат операции
     */
    downloadPdf(filename, subfolder = 'contracts') {
        try {
            const filepath = path.join(__dirname, '../uploads', subfolder, filename);

            console.log('Запрос на скачивание PDF:', filepath);

            // Проверяем существование файла
            if (!fs.existsSync(filepath)) {
                return {
                    success: false,
                    message: 'PDF файл не найден',
                    statusCode: 404
                };
            }

            return {
                success: true,
                filepath: filepath,
                filename: filename
            };

        } catch (error) {
            console.error('Ошибка в downloadPdf:', error);
            return {
                success: false,
                message: 'Внутренняя ошибка сервера',
                error: error.message,
                statusCode: 500
            };
        }
    }

    /**
     * Получает список PDF файлов
     * @param {string} subfolder - Подпапка (опционально, по умолчанию 'pdfs')
     * @returns {Object} - Список файлов
     */
    getPdfFiles(subfolder = 'pdfs') {
        try {
            const pdfDir = path.join(__dirname, '../uploads', subfolder);
            
            if (!fs.existsSync(pdfDir)) {
                return {
                    success: true,
                    files: []
                };
            }

            const files = fs.readdirSync(pdfDir)
                .filter(file => file.endsWith('.pdf'))
                .map(file => {
                    const filepath = path.join(pdfDir, file);
                    const stats = fs.statSync(filepath);
                    
                    return {
                        filename: file,
                        filePath: `/uploads/${subfolder}/${file}`,
                        size: stats.size,
                        created: stats.birthtime,
                        modified: stats.mtime
                    };
                })
                .sort((a, b) => new Date(b.created) - new Date(a.created));

            return {
                success: true,
                files: files
            };

        } catch (error) {
            console.error('Ошибка в getPdfFiles:', error);
            return {
                success: false,
                message: 'Внутренняя ошибка сервера',
                error: error.message
            };
        }
    }

    /**
     * Удаляет PDF файл
     * @param {string} filename - Имя файла
     * @param {string} subfolder - Подпапка (опционально, по умолчанию 'pdfs')
     * @returns {Object} - Результат операции
     */
    deletePdf(filename, subfolder = 'pdfs') {
        try {
            const filepath = path.join(__dirname, '../uploads', subfolder, filename);

            console.log('Запрос на удаление PDF:', filepath);

            // Проверяем существование файла
            if (!fs.existsSync(filepath)) {
                return {
                    success: false,
                    message: 'PDF файл не найден',
                    statusCode: 404
                };
            }

            // Удаляем файл
            fs.unlinkSync(filepath);

            return {
                success: true,
                message: 'PDF файл успешно удален'
            };

        } catch (error) {
            console.error('Ошибка в deletePdf:', error);
            return {
                success: false,
                message: 'Внутренняя ошибка сервера',
                error: error.message,
                statusCode: 500
            };
        }
    }

    /**
     * Создает PDF оффер для бойца (специализированный метод)
     * @param {Object} fighterData - Данные бойца
     * @param {Object} promoterData - Данные промоутера
     * @param {Object} fightDetails - Детали боя
     * @param {Object} financialTerms - Финансовые условия
     * @returns {Promise<Object>} - Результат создания PDF
     */
    async createFighterOfferPdf(fighterData, promoterData, fightDetails, financialTerms) {
        try {
            const { fighterOfferTemplate } = require('../template/fighterOffer');

            // Подготавливаем данные для шаблона
            const templateData = {
                fighter: fighterData,
                promoter: promoterData || {
                    name: 'Промоутер',
                    contactPerson: 'Контактное лицо',
                    phone: '+7 (000) 000-00-00',
                    email: 'promoter@example.com'
                },
                fightDetails: fightDetails || {
                    date: 'Не указана',
                    location: 'Не указано'
                },
                financialTerms: financialTerms || {
                    fightFee: 0,
                    winBonus: 0,
                    knockoutBonus: 0,
                    expenses: 0
                },
                date: fightDetails?.date || new Date().toLocaleDateString('ru-RU'),
                location: fightDetails?.location || 'Не указано'
            };

            // Генерируем HTML из шаблона
            const html = fighterOfferTemplate(templateData);

            // Специальные настройки для оффера
            const options = {
                header: {
                    height: '20mm',
                    contents: '<div style="text-align: center; font-size: 10px; color: #666;">Оффер бойцу - MSMA</div>'
                }
            };

            const filename = `fighter_offer_${fighterData.id}`;
            return await this.createPdf(html, filename, options, 'pdfs');

        } catch (error) {
            console.error('Ошибка в createFighterOfferPdf:', error);
            throw {
                success: false,
                message: 'Ошибка создания оффера бойца',
                error: error.message
            };
        }
    }

    /**
     * Создает PDF контракт (специализированный метод)
     * @param {Object} contractData - Данные контракта
     * @returns {Promise<Object>} - Результат создания PDF
     */
    async createContractPdf(contractData) {
        try {
            const { contractTemplate } = require('../template/contract');

           

            const filterContractData = {    
                fighterId: contractData.offer.fighter_id,
                nationality: contractData.offer.Fighter.nationality,
                birthdate: contractData.offer.Fighter.birthdate,
                citizenship: contractData.offer.Fighter.User.citizenship,
                email: contractData.offer.Fighter.User.email,
                country: contractData.offer.Fighter.User.country,
                phone_number: contractData.offer.Fighter.User.phone_number,
                fullname: contractData.offer.Fighter.User.firstname + ' ' + contractData.offer.Fighter.User.lastname + ' ' + contractData.offer.Fighter.User.middlename,
            }


            const html = contractTemplate(filterContractData);


            const filename = `contract_${contractData.id || Date.now()}`;
            return await this.createPdf(html, filename, {}, 'contracts');

        } catch (error) {
            console.error('Ошибка в createContractPdf:', error);
            throw {
                success: false,
                message: 'Ошибка создания контракта',
                error: error.message
            };
        }
    }
}

module.exports = new PdfService();
