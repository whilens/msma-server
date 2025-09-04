const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Token = sequelize.define('Token', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  refresh_token: { type: DataTypes.STRING, allowNull: false },
  user_agent: DataTypes.STRING,
  ip: DataTypes.STRING,
  expires_at: { type: DataTypes.DATE, allowNull: false },
  is_revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
  createdAt: { 
    type: DataTypes.DATE, 
    allowNull: false, 
    defaultValue: DataTypes.NOW,
    field: 'createdAt'
  },
  updatedAt: { 
    type: DataTypes.DATE, 
    allowNull: false, 
    defaultValue: DataTypes.NOW,
    field: 'updatedAt'
  }
}, {
  tableName: 'tokens',
  timestamps: false, // Отключаем автоматические timestamps
  freezeTableName: true,
  underscored: false
});

module.exports = Token;