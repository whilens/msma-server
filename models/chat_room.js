const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const ChatRoom = sequelize.define('ChatRoom', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    gofight_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        comment: 'ID отклика на бой (связь с GoFight)'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Название чата'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Активен ли чат'
    },
    room_type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'fight_response',
        comment: 'Тип комнаты: fight_response - для отклика на бой, general - общая',
        validate: {
            isIn: [['fight_response', 'general']]
        }
    }
}, {
    tableName: 'chat_rooms',
    timestamps: true,
    indexes: [
        {
            fields: ['gofight_id']
        }
    ]
});

module.exports = ChatRoom;
