const Sequelize = require('sequelize');
const sequelize = require('../db'); // Импортируем из db.js

// Импорт функций создания моделей
const Users = require('./users');
const Roles = require('./roles');
const UserRoleAssign = require('./user_role_assign');
const Events = require('./events');
const Promoters = require('./promoters');
const Fighters = require('./fighters')
const Managers = require('./managers')

// Создание моделей
// const Users = UserModel(sequelize, Sequelize.DataTypes);
// const Events = EventsModel(sequelize, Sequelize.DataTypes);
// const Roles = RoleModel(sequelize, Sequelize.DataTypes);
// const UserRoleAssign = UserRoleAssignModel(sequelize, Sequelize.DataTypes);
// const Promoters = PromotersModel(sequelize, Sequelize.DataTypes);
// const Fighters = FightersModel(sequelize, Sequelize.DataTypes);
// const Managers = ManagersModel(sequelize, Sequelize.DataTypes);

Users.hasOne(Promoters);
Promoters.belongsTo(Users)

Users.hasOne(Fighters)
Promoters.belongsTo(Users)

Users.hasOne(Managers)
Managers.belongsTo(Users)

Promoters.hasMany(Events)
Events.belongsTo(Promoters)


// Установка связей
Users.belongsToMany(Roles, {
  through: UserRoleAssign,
  foreignKey: 'user_id',
  otherKey: 'role_id',
});

Roles.belongsToMany(Users, {
  through: UserRoleAssign,
  foreignKey: 'role_id',
  otherKey: 'user_id',
});

module.exports = {
  sequelize,
  Users,
  Events,
  Roles,
  UserRoleAssign,
  Promoters,
  Fighters,
  Managers
};