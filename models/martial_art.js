const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const MartialArt = sequelize.define('MartialArt', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
}, {
  tableName: 'martial_art',
  timestamps: false,
});

module.exports = MartialArt; 