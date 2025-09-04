const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const RequisitesIn = sequelize.define('RequisitesIn', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  beneficary_name: DataTypes.STRING,
  beneficary_address: DataTypes.STRING,
  acc_number: DataTypes.INTEGER,
  swift_bic: DataTypes.STRING,
  beneficary_bank_name: DataTypes.STRING,
  beneficary_bank_address: DataTypes.STRING,
  currency: DataTypes.STRING,
  payment_details: DataTypes.STRING,
  sender_name: DataTypes.STRING,
  sender_address: DataTypes.STRING,
}, {
  tableName: 'requisites_in',
  timestamps: false,
});

module.exports = RequisitesIn; 