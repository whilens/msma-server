const fighterOfferTemplate = (data) => {
  const {
    fighter,
    promoter,
    fightDetails,
    financialTerms,
    date,
    location
  } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Оффер бойцу</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #007bff;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #007bff;
                margin: 0;
                font-size: 28px;
            }
            .header p {
                color: #666;
                margin: 5px 0;
                font-size: 16px;
            }
            .section {
                margin-bottom: 25px;
            }
            .section h2 {
                color: #333;
                border-left: 4px solid #007bff;
                padding-left: 15px;
                margin-bottom: 15px;
                font-size: 20px;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            .info-item {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                border-left: 3px solid #007bff;
            }
            .info-item strong {
                color: #007bff;
                display: block;
                margin-bottom: 5px;
            }
            .financial-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }
            .financial-table th,
            .financial-table td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }
            .financial-table th {
                background-color: #007bff;
                color: white;
                font-weight: bold;
            }
            .financial-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .total-row {
                background-color: #e3f2fd !important;
                font-weight: bold;
            }
            .signature-section {
                margin-top: 40px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
            }
            .signature-box {
                text-align: center;
                border-top: 1px solid #ddd;
                padding-top: 20px;
            }
            .signature-box p {
                margin: 5px 0;
                color: #666;
            }
            .date-location {
                background-color: #e3f2fd;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
            }
            .terms {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 15px;
                border-radius: 5px;
                margin-top: 20px;
            }
            .terms h3 {
                color: #856404;
                margin-top: 0;
            }
            .terms ul {
                margin: 10px 0;
                padding-left: 20px;
            }
            .terms li {
                margin-bottom: 5px;
                color: #856404;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>ОФФЕР БОЙЦУ</h1>
                <p>Официальное предложение о проведении боя</p>
                <p>Дата создания: ${new Date().toLocaleDateString('ru-RU')}</p>
            </div>

            <div class="section">
                <h2>Информация о бойце</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>ФИО:</strong>
                        ${fighter.User.firstname} ${fighter.User.lastname} ${fighter.User.middlename || ''}
                    </div>
                    <div class="info-item">
                        <strong>Псевдоним:</strong>
                        ${fighter.nickname || 'Не указан'}
                    </div>
                    <div class="info-item">
                        <strong>Вид спорта:</strong>
                        ${fighter.UserSports?.[0]?.MartialArt?.name || 'Не указан'}
                    </div>
                    <div class="info-item">
                        <strong>Весовая категория:</strong>
                        ${fighter.UserSports?.[0]?.WeightCategory?.name || 'Не указана'}
                    </div>
                    <div class="info-item">
                        <strong>Статистика:</strong>
                        ${fighter.win || 0}W - ${fighter.loss || 0}L - ${fighter.draw || 0}D
                    </div>
                    <div class="info-item">
                        <strong>Статус:</strong>
                        ${fighter.status === 1 ? 'Готов' : fighter.status === 2 ? 'Занят' : fighter.status === 3 ? 'Травмирован' : 'Не указан'}
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>Детали боя</h2>
                <div class="date-location">
                    <div class="info-grid">
                        <div class="info-item">
                            <strong>Дата боя:</strong>
                            ${date || 'Не указана'}
                        </div>
                        <div class="info-item">
                            <strong>Место проведения:</strong>
                            ${location || 'Не указано'}
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>Финансовые условия</h2>
                <table class="financial-table">
                    <thead>
                        <tr>
                            <th>Позиция</th>
                            <th>Сумма ($)</th>
                            <th>Примечание</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Гонорар за бой</td>
                            <td>${financialTerms.fightFee || 0}</td>
                            <td>Основной гонорар</td>
                        </tr>
                        <tr>
                            <td>Бонус за победу</td>
                            <td>${financialTerms.winBonus || 0}</td>
                            <td>Дополнительно при победе</td>
                        </tr>
                        <tr>
                            <td>Бонус за нокаут</td>
                            <td>${financialTerms.knockoutBonus || 0}</td>
                            <td>Дополнительно при нокауте</td>
                        </tr>
                        <tr>
                            <td>Компенсация расходов</td>
                            <td>${financialTerms.expenses || 0}</td>
                            <td>Транспорт, проживание</td>
                        </tr>
                        <tr class="total-row">
                            <td><strong>ИТОГО (при победе)</strong></td>
                            <td><strong>${(financialTerms.fightFee || 0) + (financialTerms.winBonus || 0) + (financialTerms.knockoutBonus || 0) + (financialTerms.expenses || 0)}</strong></td>
                            <td><strong>Максимальная сумма</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="section">
                <h2>Информация о промоутере</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Промоутер:</strong>
                        ${promoter.name || 'Не указан'}
                    </div>
                    <div class="info-item">
                        <strong>Контактное лицо:</strong>
                        ${promoter.contactPerson || 'Не указано'}
                    </div>
                    <div class="info-item">
                        <strong>Телефон:</strong>
                        ${promoter.phone || 'Не указан'}
                    </div>
                    <div class="info-item">
                        <strong>Email:</strong>
                        ${promoter.email || 'Не указан'}
                    </div>
                </div>
            </div>

            <div class="terms">
                <h3>Условия оффера</h3>
                <ul>
                    <li>Данный оффер действителен в течение 7 дней с момента создания</li>
                    <li>Боец должен подтвердить принятие оффера в письменном виде</li>
                    <li>Все финансовые обязательства выполняются в течение 30 дней после боя</li>
                    <li>В случае отмены боя менее чем за 14 дней, боец получает 50% от гонорара</li>
                    <li>Медицинское обследование обязательно перед боем</li>
                    <li>Соблюдение правил и регламента организации обязательно</li>
                </ul>
            </div>

            <div class="signature-section">
                <div class="signature-box">
                    <p>_________________________</p>
                    <p><strong>Подпись бойца</strong></p>
                    <p>${fighter.User.firstname} ${fighter.User.lastname}</p>
                    <p>Дата: _______________</p>
                </div>
                <div class="signature-box">
                    <p>_________________________</p>
                    <p><strong>Подпись промоутера</strong></p>
                    <p>${promoter.name || 'Промоутер'}</p>
                    <p>Дата: _______________</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

module.exports = { fighterOfferTemplate };
