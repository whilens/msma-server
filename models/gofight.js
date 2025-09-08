const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const GoFight = sequelize.define('GoFight', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fight_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID боя на который откликается боец'
  },
  fighter_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID бойца который откликнулся'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Статус отклика: pending - ожидает, accepted - принят, rejected - отклонен, cancelled - отменен',
    validate: {
      isIn: [['pending', 'accepted', 'rejected', 'cancelled']]
    }
  },
  music: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Музыка для выхода'
  },
  size_cloth: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Размер одежды'
  },
  size_shoes: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Размер обуви'
  },
  photo_url: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL фото бойца'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Сообщение от бойца при отклике'
  },
  contract_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID контракта'
  }

}, {
  tableName: 'gofight',
  timestamps: true,
  indexes: [
    {
      fields: ['fight_id']
    },
    {
      fields: ['fighter_id']
    },
    {
      unique: true,
      fields: ['fight_id', 'fighter_id'],
      name: 'unique_fight_fighter'
    }
  ]
});

module.exports = GoFight; 