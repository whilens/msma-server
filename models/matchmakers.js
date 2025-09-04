const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Matchmakers = sequelize.define('Matchmakers', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  desc: DataTypes.TEXT,
}, {
  tableName: 'matchmakers',
  timestamps: false,
});

module.exports = Matchmakers; 