const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const PromotersReqIn = sequelize.define('PromotersReqIn', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  item1: DataTypes.STRING,
  item2: DataTypes.STRING,
  item3: DataTypes.STRING,
}, {
  tableName: 'promoters_req_in',
  timestamps: false,
});

module.exports = PromotersReqIn; 