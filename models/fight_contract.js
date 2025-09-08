const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const FightContract = sequelize.define('FightContract', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fight_id: { type: DataTypes.INTEGER, allowNull: false },
  fighter_id: { type: DataTypes.INTEGER, allowNull: false },
  promoter_id: { type: DataTypes.INTEGER, allowNull: false },
  manager_id: { type: DataTypes.INTEGER, allowNull: true },
  offer_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    comment: 'ID оффера, на основе которого создан контракт'
  },
  contract_pdf_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'URL PDF контракта'
  },
  contract_details: DataTypes.TEXT,
  signed_at: DataTypes.DATE,
  status: {
    type: DataTypes.STRING,
    defaultValue: 'created',
    comment: 'Статус контракта: created - создан, sent_for_signature - отправлен на подписание, signed - подписан'
  },
  okidoki_contract_id: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'ID контракта в системе OkiDoki'
  },
  okidoki_signature_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'URL для подписания в OkiDoki'
  }
}, {
  tableName: 'fight_contract',
  timestamps: true,
  indexes: [
    {
      fields: ['fight_id']
    },
    {
      fields: ['fighter_id']
    },
    {
      fields: ['promoter_id']
    },
    {
      fields: ['offer_id']
    },
    {
      unique: true,
      fields: ['fight_id', 'fighter_id', 'promoter_id'],
      name: 'unique_fight_fighter_promoter'
    }
  ]
});

module.exports = FightContract; 