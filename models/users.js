const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Users = sequelize.define('Users', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  auth_provider: DataTypes.STRING,
  email: DataTypes.STRING,
  country: DataTypes.STRING,
  city: DataTypes.STRING,
  phone_number: DataTypes.STRING,
  nationality: DataTypes.STRING,
  password_hash: DataTypes.STRING,
  firstname: DataTypes.STRING,
  lastname: DataTypes.STRING,
  middlename: DataTypes.STRING,
  avatar_url: DataTypes.STRING,
  is_verified: DataTypes.BOOLEAN,
  crypto_address: DataTypes.STRING,
  type_inn: DataTypes.STRING,
  is_visible4dev: DataTypes.BOOLEAN,
  rating: DataTypes.INTEGER,
  last_seen_at: {
    type: DataTypes.DATE,
    comment: 'Время последнего захода пользователя'
  },
  is_online: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Статус онлайн пользователя'
  },
}, {
  tableName: 'users',
  timestamps: false,
});


module.exports = Users; 