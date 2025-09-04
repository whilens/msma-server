const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const UserRoleAssign = sequelize.define('UserRoleAssign', {
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  role_id: { type: DataTypes.INTEGER, allowNull: false },
  created_at: DataTypes.DATE,
  verified_at: DataTypes.DATE,
}, {
  tableName: 'user_role_assign',
  timestamps: false,
});

module.exports = UserRoleAssign; 