const User = require('./User');
const Ticket = require('./Ticket');
const Escalation = require('./Escalation');
const Notification = require('./Notification');

// Associations
User.hasMany(Ticket, { foreignKey: 'createdBy', as: 'submittedTickets' });
User.hasMany(Ticket, { foreignKey: 'assignedTo', as: 'assignedTickets' });
Ticket.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Ticket.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

Ticket.hasMany(Escalation, { foreignKey: 'ticketId', as: 'escalations' });
Escalation.belongsTo(Ticket, { foreignKey: 'ticketId' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId' });

module.exports = { User, Ticket, Escalation, Notification };
