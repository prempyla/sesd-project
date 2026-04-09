const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Escalation = sequelize.define('Escalation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ticketId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'tickets', key: 'id' },
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  escalatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'escalations',
  timestamps: false,
});

module.exports = Escalation;
