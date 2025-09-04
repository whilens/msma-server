const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Fighters = sequelize.define('Fighters', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  nickname: DataTypes.STRING,
  nationality: DataTypes.STRING,
  birthdate: DataTypes.DATE,
  win: DataTypes.INTEGER,
  loss: DataTypes.INTEGER,
  draw: DataTypes.INTEGER,
  is_active: DataTypes.BOOLEAN,
  boxrec: DataTypes.STRING,
  manager_id: DataTypes.INTEGER,
  videos_url: DataTypes.JSON,
  salary: DataTypes.INTEGER,
  status: DataTypes.INTEGER,
  stand: DataTypes.INTEGER,
  about: DataTypes.TEXT,
  push_notifications: DataTypes.BOOLEAN,
}, {
  tableName: 'fighters',
  timestamps: false,
});

module.exports = Fighters; 