const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const PromotersReqRF = sequelize.define('PromotersReqRF', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  kpp: DataTypes.STRING,
  inn: DataTypes.STRING,
  ogrn: DataTypes.STRING,
  residential: DataTypes.STRING,
  dateofissue: DataTypes.DATE,
  nalogsystem: DataTypes.STRING,
  directname: DataTypes.STRING,
}, {
  tableName: 'promoters_req_rf',
  timestamps: false,
});

module.exports = PromotersReqRF; 