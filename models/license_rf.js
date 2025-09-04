const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const LicenseRF = sequelize.define('LicenseRF', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  item1: DataTypes.STRING,
  item2: DataTypes.STRING,
  item3: DataTypes.STRING,
}, {
  tableName: 'license_rf',
  timestamps: false,
});

module.exports = LicenseRF; 