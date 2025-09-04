const sequelize = require('../db');
const { DataTypes } = require('sequelize');

// Импорт моделей
const MartialArt = require('./martial_art');
const WeightCategory = require('./weight_category');
const UserSports = require('./user_sports');
const Fighters = require('./fighters');
const Antrop = require('./antrop');
const RequisitesRF = require('./requisites_rf');
const FightContract = require('./fight_contract');
const Events = require('./events');
const Managers = require('./managers');
const Fight = require('./fight');
const Messages = require('./messages');
const GoFight = require('./gofight');
const Matchmakers = require('./matchmakers');
const Promoters = require('./promoters');
const Federations = require('./federations');
const Users = require('./users');
const Payments = require('./payments');
const UserRoleAssign = require('./user_role_assign');
const Roles = require('./roles');
const PassportRF = require('./passport_rf');
const RequisitesIn = require('./requisites_in');
const PassportIn = require('./passport_in');
const PromotersReqRF = require('./promoters_req_rf');
const PromotersReqIn = require('./promoters_req_in');
const LicenseRF = require('./license_rf');
const LicenseIn = require('./license_in');
const Token = require('./token');
const ChatRoom = require('./chat_room');
const ChatMessage = require('./chat_message');
const ChatRoomParticipant = require('./chat_room_participant');
const FightOffer = require('./fight_offer');


// Связи между моделями
// MartialArt 1:M WeightCategory
MartialArt.hasMany(WeightCategory, { foreignKey: 'martial_art_id' });
WeightCategory.belongsTo(MartialArt, { foreignKey: 'martial_art_id' });

// Fighters 1:1 Antrop
Fighters.hasOne(Antrop, { foreignKey: 'fighter_id' });
Antrop.belongsTo(Fighters, { foreignKey: 'fighter_id' });

// Fighters 1:M UserSports
Fighters.hasMany(UserSports, { foreignKey: 'fighter_id' });
UserSports.belongsTo(Fighters, { foreignKey: 'fighter_id' });

// MartialArt 1:M UserSports
MartialArt.hasMany(UserSports, { foreignKey: 'martial_art_id' });
UserSports.belongsTo(MartialArt, { foreignKey: 'martial_art_id' });

// WeightCategory 1:M UserSports
WeightCategory.hasMany(UserSports, { foreignKey: 'weight_category_id' });
UserSports.belongsTo(WeightCategory, { foreignKey: 'weight_category_id' });

// Users 1:1 Fighters
Users.hasOne(Fighters, { foreignKey: 'user_id' });
Fighters.belongsTo(Users, { foreignKey: 'user_id' });

// Managers 1:M Fighters
Managers.hasMany(Fighters, { foreignKey: 'manager_id' });
Fighters.belongsTo(Managers, { foreignKey: 'manager_id' });

// Promoters 1:M Events
Promoters.hasMany(Events, { foreignKey: 'promoter_id' });
Events.belongsTo(Promoters, { foreignKey: 'promoter_id' });

// Promoters 1:M Payments
Promoters.hasMany(Payments, { foreignKey: 'promoter_id' });
Payments.belongsTo(Promoters, { foreignKey: 'promoter_id' });

// Promoters 1:M Fight
Promoters.hasMany(Fight, { foreignKey: 'promoter_id', as: 'Fights' })
Fight.belongsTo(Promoters, { foreignKey: 'promoter_id', as: 'Promoter' })

// Users 1:M Payments (получатель)
Users.hasMany(Payments, { foreignKey: 'recipient_user_id' });
Payments.belongsTo(Users, { foreignKey: 'recipient_user_id' });

// Users 1:1 Managers
Users.hasOne(Managers, { foreignKey: 'user_id' });
Managers.belongsTo(Users, { foreignKey: 'user_id' });

// Users 1:1 Matchmakers
Users.hasOne(Matchmakers, { foreignKey: 'user_id' });
Matchmakers.belongsTo(Users, { foreignKey: 'user_id' });

// Users 1:1 Promoters
Users.hasOne(Promoters, { foreignKey: 'user_id', as: 'Promoter' });
Promoters.belongsTo(Users, { foreignKey: 'user_id', as: 'User' });

// Users 1:1 Federations
Users.hasOne(Federations, { foreignKey: 'user_id' });
Federations.belongsTo(Users, { foreignKey: 'user_id' });

// Users 1:M Token (refresh tokens)
Users.hasMany(Token, { foreignKey: 'user_id' });
Token.belongsTo(Users, { foreignKey: 'user_id' });

Events.hasMany(Fight, { foreignKey: 'event_id', as: 'Fights' })
Fight.belongsTo(Events, { foreignKey: 'event_id', as: 'Event' })

MartialArt.hasMany(Fight, {foreignKey: 'martial_art_id'})
Fight.belongsTo(MartialArt, {foreignKey: 'martial_art_id'})

WeightCategory.hasMany(Fight, {foreignKey: 'weight_category_id'})
Fight.belongsTo(WeightCategory, {foreignKey: 'weight_category_id'})

// Fight 1:M GoFight (один бой может иметь много откликов)
Fight.hasMany(GoFight, { foreignKey: 'fight_id', as: 'Responses' });
GoFight.belongsTo(Fight, { foreignKey: 'fight_id', as: 'Fight' });

// Fighters 1:M GoFight (один боец может откликнуться на много боев)
Fighters.hasMany(GoFight, { foreignKey: 'fighter_id', as: 'FightResponses' });
GoFight.belongsTo(Fighters, { foreignKey: 'fighter_id', as: 'Fighter' });

// Fight связи с бойцами в углах
Fight.belongsTo(Fighters, { foreignKey: 'fighter_red', as: 'FighterRed' });
Fight.belongsTo(Fighters, { foreignKey: 'fighter_blue', as: 'FighterBlue' });
Fighters.hasMany(Fight, { foreignKey: 'fighter_red', as: 'RedCornerFights' });
Fighters.hasMany(Fight, { foreignKey: 'fighter_blue', as: 'BlueCornerFights' });

// GoFight 1:1 ChatRoom (каждый отклик создает свою комнату)
GoFight.hasOne(ChatRoom, { foreignKey: 'gofight_id', as: 'ChatRoom' });
ChatRoom.belongsTo(GoFight, { foreignKey: 'gofight_id', as: 'GoFight' });

// ChatRoom 1:M ChatMessage (комната может иметь много сообщений)
ChatRoom.hasMany(ChatMessage, { foreignKey: 'chat_room_id', as: 'Messages' });
ChatMessage.belongsTo(ChatRoom, { foreignKey: 'chat_room_id', as: 'ChatRoom' });

// ChatRoom 1:M ChatRoomParticipant (комната может иметь много участников)
ChatRoom.hasMany(ChatRoomParticipant, { foreignKey: 'chat_room_id', as: 'Participants' });
ChatRoomParticipant.belongsTo(ChatRoom, { foreignKey: 'chat_room_id', as: 'ChatRoom' });

// Users 1:M ChatMessage (пользователь может отправлять много сообщений)
Users.hasMany(ChatMessage, { foreignKey: 'sender_id', as: 'SentMessages' });
ChatMessage.belongsTo(Users, { foreignKey: 'sender_id', as: 'Sender' });

// Users 1:M ChatRoomParticipant (пользователь может участвовать в многих комнатах)
Users.hasMany(ChatRoomParticipant, { foreignKey: 'user_id', as: 'ChatParticipations' });
ChatRoomParticipant.belongsTo(Users, { foreignKey: 'user_id', as: 'User' });

// Связь для отслеживания прочтения сообщений
ChatMessage.belongsTo(Users, { foreignKey: 'read_by', as: 'ReadBy' });

// Связи для FightOffer
FightOffer.belongsTo(ChatMessage, { foreignKey: 'message_id', as: 'Message' });
FightOffer.belongsTo(Fight, { foreignKey: 'fight_id', as: 'Fight' });
FightOffer.belongsTo(Promoters, { foreignKey: 'promoter_id', as: 'Promoter' });
FightOffer.belongsTo(Fighters, { foreignKey: 'fighter_id', as: 'Fighter' });

ChatMessage.hasOne(FightOffer, { foreignKey: 'message_id', as: 'Offer' });
Fight.hasMany(FightOffer, { foreignKey: 'fight_id', as: 'Offers' });
Promoters.hasMany(FightOffer, { foreignKey: 'promoter_id', as: 'SentOffers' });
Fighters.hasMany(FightOffer, { foreignKey: 'fighter_id', as: 'ReceivedOffers' });



// // Users 1:1 RequisitesRF
Users.hasOne(RequisitesRF, { foreignKey: 'user_id' });
RequisitesRF.belongsTo(Users, { foreignKey: 'user_id' });

// // Users 1:1 PassportRF
Users.hasOne(PassportRF, { foreignKey: 'user_id' });
PassportRF.belongsTo(Users, { foreignKey: 'user_id' });

// // Users 1:1 RequisitesIn
Users.hasOne(RequisitesIn, { foreignKey: 'user_id' });
RequisitesIn.belongsTo(Users, { foreignKey: 'user_id' });

// // Users 1:1 PassportIn
Users.hasOne(PassportIn, { foreignKey: 'user_id' });
PassportIn.belongsTo(Users, { foreignKey: 'user_id' });

// Users 1:1 PromotersReqRF
Users.hasOne(PromotersReqRF, { foreignKey: 'user_id' });
PromotersReqRF.belongsTo(Users, { foreignKey: 'user_id' });

// Users 1:1 PromotersReqIn
Users.hasOne(PromotersReqIn, { foreignKey: 'user_id' });
PromotersReqIn.belongsTo(Users, { foreignKey: 'user_id' });

// UserRoleAssign M:N Users <-> Roles
Users.belongsToMany(Roles, { through: UserRoleAssign, foreignKey: 'user_id', otherKey: 'role_id' });
Roles.belongsToMany(Users, { through: UserRoleAssign, foreignKey: 'role_id', otherKey: 'user_id' });

// Экспорт всех моделей
module.exports = {
  sequelize,
  MartialArt,
  WeightCategory,
  UserSports,
  Fighters,
  Antrop,
  RequisitesRF,
  FightContract,
  Events,
  Managers,
  Fight,
  Messages,
  GoFight,
  Matchmakers,
  Promoters,
  Federations,
  Users,
  Payments,
  UserRoleAssign,
  Roles,
  PassportRF,
  RequisitesIn,
  PassportIn,
  PromotersReqRF,
  PromotersReqIn,
  LicenseRF,
  LicenseIn,
  Token,
  ChatRoom,
  ChatMessage,
  ChatRoomParticipant,
  FightOffer,
}; 