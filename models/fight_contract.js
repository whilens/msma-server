const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const FightContract = sequelize.define('FightContract', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fight_id: { type: DataTypes.INTEGER, allowNull: false },
  fighter_id: { type: DataTypes.INTEGER, allowNull: false },
  manager_id: { type: DataTypes.INTEGER, allowNull: false },
  contract_details: DataTypes.TEXT,
  signed_at: DataTypes.DATE,
  status: DataTypes.STRING,
}, {
  tableName: 'fight_contract',
  timestamps: false,
});

module.exports = FightContract; 