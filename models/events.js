const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Events = sequelize.define('Events', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  promoter_id: { type: DataTypes.INTEGER, allowNull: false },
  event_name: DataTypes.STRING,
  event_desc: {type: DataTypes.TEXT, allowNull: true},
  start_date: DataTypes.DATE,
  end_date: DataTypes.DATE,
  location: DataTypes.STRING,
  arena: DataTypes.STRING,
  photo_url: {type: DataTypes.STRING, allowNull: true},
  is_public: DataTypes.BOOLEAN,
}, {
  tableName: 'events',
  timestamps: false,
});

module.exports = Events; 