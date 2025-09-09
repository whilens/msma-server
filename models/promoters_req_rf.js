const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const PromotersReqRF = sequelize.define('PromotersReqRF', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  promoter_id: { type: DataTypes.INTEGER},
  inn: DataTypes.STRING,
  ogrn: DataTypes.STRING,
  legal_address: DataTypes.TEXT,
  bic: DataTypes.STRING,
  bank_name: DataTypes.STRING,
  correspondent_account: DataTypes.STRING,
  settlement_account: DataTypes.STRING,
  kpp: DataTypes.STRING,
  residential: DataTypes.STRING,
  dateofissue: DataTypes.DATE,
  directname: DataTypes.STRING,
}, {
  tableName: 'promoters_req_rf',
  timestamps: true,
});

module.exports = PromotersReqRF; 