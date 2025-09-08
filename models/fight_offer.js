const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const FightOffer = sequelize.define('FightOffer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    message_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        comment: 'ID сообщения с оффером'
    },
    fight_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID боя'
    },
    promoter_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID промоутера, отправившего оффер'
    },
    fighter_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID бойца, которому отправлен оффер'
    },
    
    // Детали оффера
    fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Гонорар за бой'
    },
    team_size: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Количество участников в команде'
    },
    corner_color: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Цвет угла (красный/синий)',
        validate: {
            isIn: [['red', 'blue', 'красный', 'синий']]
        }
    },
    weight_limit: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Весовой лимит в кг'
    },
    additional_conditions: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Дополнительные условия'
    },
    
    // Статус оффера
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Статус оффера: pending - ожидание, accepted - принят, rejected - отклонен, expired - истек',
        validate: {
            isIn: [['pending', 'accepted', 'rejected', 'expired']]
        }
    },
    response_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Время ответа на оффер'
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Время истечения оффера'
    },
    contract_pdf_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'URL контракта'
    }
}, {
    tableName: 'fight_offers',
    timestamps: true,
    indexes: [
        {
            fields: ['message_id']
        },
        {
            fields: ['fight_id']
        },
        {
            fields: ['promoter_id']
        },
        {
            fields: ['fighter_id']
        },
        {
            fields: ['status']
        }
    ]
});

module.exports = FightOffer;
