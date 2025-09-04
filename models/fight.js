const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Fight = sequelize.define('Fight', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  promoter_id: DataTypes.INTEGER,
  fighter_red: DataTypes.INTEGER,
  fighter_blue: DataTypes.INTEGER,
  number: DataTypes.INTEGER,
  name: DataTypes.STRING,
  matchmaker_id: DataTypes.INTEGER,
  fight_date: DataTypes.DATE,
  location: DataTypes.STRING,
  weight_category_id: DataTypes.INTEGER,
  salary: DataTypes.INTEGER,
  rounds: DataTypes.INTEGER,
  martial_art_id: DataTypes.INTEGER,
  result: DataTypes.STRING,
  win_method: DataTypes.STRING,
  event_id: DataTypes.INTEGER,
  federation_id: DataTypes.INTEGER,
}, {
  tableName: 'fight',
  timestamps: false,
});

module.exports = Fight; 