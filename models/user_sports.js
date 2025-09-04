const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const UserSports = sequelize.define('UserSports', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fighter_id: { type: DataTypes.INTEGER, allowNull: false },
  martial_art_id: { type: DataTypes.INTEGER, allowNull: false },
  weight_category_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'user_sports',
  timestamps: false,
});

module.exports = UserSports; 