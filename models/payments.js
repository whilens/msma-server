const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Payments = sequelize.define('Payments', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  promoter_id: DataTypes.INTEGER,
  recipient_user_id: DataTypes.INTEGER,
  amount: DataTypes.DECIMAL,
  currency: DataTypes.STRING,
  payment_method: DataTypes.STRING,
  payment_details: DataTypes.TEXT,
  payment_date: DataTypes.DATE,
  status: DataTypes.STRING,
  contact_id: DataTypes.INTEGER,
}, {
  tableName: 'payments',
  timestamps: false,
});

module.exports = Payments; 