const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const ChatMessage = sequelize.define('ChatMessage', {
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
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID отправителя'
    },
    sender_type: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Тип отправителя',
        validate: {
            isIn: [['fighter', 'promoter', 'admin', 'manager']]
        }
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Текст сообщения'
    },
    message_type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'text',
        comment: 'Тип сообщения',
        validate: {
            isIn: [['text', 'system', 'file', 'image', 'offer']]
        }
    },
    file_url: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'URL файла (если тип сообщения file или image)'
    },
    offer_data: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Данные оффера в формате JSON (для типа сообщения offer)'
    },
    is_edited: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Было ли сообщение отредактировано'
    },
    edited_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Время последнего редактирования'
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Прочитано ли сообщение'
    },
    read_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Время прочтения сообщения'
    },
    read_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID пользователя, который прочитал сообщение'
    },
    is_delivered: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Доставлено ли сообщение'
    },
    delivered_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Время доставки сообщения'
    }
}, {
    tableName: 'chat_messages',
    timestamps: true,
    indexes: [
        {
            fields: ['chat_room_id']
        },
        {
            fields: ['sender_id']
        }
    ]
});

module.exports = ChatMessage;
