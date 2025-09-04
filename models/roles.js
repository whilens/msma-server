const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Roles = sequelize.define('Roles', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
}, {
  tableName: 'roles',
  timestamps: false,
});

module.exports = Roles; 