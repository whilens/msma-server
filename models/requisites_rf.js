const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const RequisitesRF = sequelize.define('RequisitesRF', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  inn: DataTypes.STRING,
  bik: DataTypes.STRING,
  bank: DataTypes.STRING,
  kpp: DataTypes.STRING,
  rss: DataTypes.STRING,
  amount: DataTypes.DECIMAL,
}, {
  tableName: 'requisites_rf',
  timestamps: false,
});

module.exports = RequisitesRF; 