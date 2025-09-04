const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const WeightCategory = sequelize.define('WeightCategory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  martial_art_id: { type: DataTypes.INTEGER, allowNull: false },
  name: DataTypes.STRING,
  kg: DataTypes.STRING,
}, {
  tableName: 'weight_category',
  timestamps: false,
});

module.exports = WeightCategory; 