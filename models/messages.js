const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Messages = sequelize.define('Messages', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fight_id: DataTypes.INTEGER,
  sender_user_id: DataTypes.INTEGER,
  recipient_user_id: DataTypes.INTEGER,
  text: DataTypes.TEXT,
  created_at: DataTypes.DATE,
}, {
  tableName: 'messages',
  timestamps: false,
});

module.exports = Messages; 