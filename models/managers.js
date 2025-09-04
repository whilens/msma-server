const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Managers = sequelize.define('Managers', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  agency_name: DataTypes.STRING,
  contract_info: DataTypes.TEXT,
}, {
  tableName: 'managers',
  timestamps: false,
});

module.exports = Managers; 