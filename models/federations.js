const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Federations = sequelize.define('Federations', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  desc: DataTypes.TEXT,
  website_url: DataTypes.STRING,
  contact_email: DataTypes.STRING,
  contact_phone: DataTypes.STRING,
}, {
  tableName: 'federations',
  timestamps: false,
});

module.exports = Federations; 