const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const PassportRF = sequelize.define('PassportRF', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  nationality: DataTypes.STRING,
  birthplace: DataTypes.STRING,
  numbers: DataTypes.STRING,
  birthdate: DataTypes.DATE,
  address: DataTypes.STRING,
  date_expiry: DataTypes.DATE,
  gender: DataTypes.STRING,
  issued: DataTypes.STRING,
  code_of: DataTypes.STRING,
}, {
  tableName: 'passport_rf',
  timestamps: false,
});

module.exports = PassportRF; 