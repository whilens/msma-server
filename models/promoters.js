const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Promoters = sequelize.define('Promoters', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  org_name: DataTypes.STRING,
  org_desc: DataTypes.TEXT,
  org_fio: DataTypes.STRING,
  contact_phone: DataTypes.STRING,
  contact_email: DataTypes.STRING,
  website_url: DataTypes.STRING,
  is_verified: DataTypes.BOOLEAN,
}, {
  tableName: 'promoters',
  timestamps: false,
});

module.exports = Promoters; 