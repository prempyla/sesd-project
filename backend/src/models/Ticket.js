const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('Payment', 'Technical', 'Account', 'General'),
    allowNull: false,
  },
  impact: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('P1', 'P2', 'P3', 'P4'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'),
    defaultValue: 'OPEN',
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
  slaDeadline: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  escalationLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'tickets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Ticket;
