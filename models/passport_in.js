const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const PassportIn = sequelize.define('PassportIn', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  passport_numbers: DataTypes.STRING,
  gender: DataTypes.STRING,
  birthdate: DataTypes.STRING,
  place_of_birth: DataTypes.STRING,
  date_of_expiry: DataTypes.STRING,
  issuing_authority: DataTypes.STRING,
  nationality: DataTypes.STRING,
  resident_address: DataTypes.STRING,
  date_of_issue: DataTypes.STRING,
}, {
  tableName: 'passport_in',
  timestamps: false,
});

module.exports = PassportIn; 