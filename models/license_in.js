const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const LicenseIn = sequelize.define('LicenseIn', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  item1: DataTypes.STRING,
  item2: DataTypes.STRING,
  item3: DataTypes.STRING,
}, {
  tableName: 'license_in',
  timestamps: false,
});

module.exports = LicenseIn; 