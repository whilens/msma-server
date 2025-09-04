const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Antrop = sequelize.define('Antrop', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fighter_id: { type: DataTypes.INTEGER, allowNull: false },
  height: DataTypes.INTEGER,
  reach: DataTypes.INTEGER,
  arm_span: DataTypes.INTEGER,
  styles: DataTypes.STRING,
  old: DataTypes.INTEGER,
}, {
  tableName: 'antrop',
  timestamps: false,
});

module.exports = Antrop; 