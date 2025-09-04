const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const ChatRoomParticipant = sequelize.define('ChatRoomParticipant', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    chat_room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID комнаты чата'
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID пользователя'
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Роль участника в комнате',
        validate: {
            isIn: [['promoter', 'fighter', 'manager', 'admin']]
        }
    },
    joined_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Дата присоединения к комнате'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Активен ли участник в комнате'
    },
    last_read_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Время последнего прочтения сообщений'
    }
}, {
    tableName: 'chat_room_participants',
    timestamps: true,
    indexes: [
        {
            fields: ['chat_room_id']
        },
        {
            fields: ['user_id']
        },
        {
            unique: true,
            fields: ['chat_room_id', 'user_id'],
            name: 'unique_room_user'
        }
    ]
});

module.exports = ChatRoomParticipant;
