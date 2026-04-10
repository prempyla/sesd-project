const { Op } = require('sequelize');
const { Ticket, User, Escalation } = require('../models');

/**
 * TicketRepository — Data access layer for Ticket entities.
 * Abstracts all persistence operations, enabling clean service-layer testing.
 */
class TicketRepository {
  async save(ticketData) {
    return Ticket.create(ticketData);
  }

  async findById(id) {
    return Ticket.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'role'] },
        { model: Escalation, as: 'escalations', order: [['escalatedAt', 'DESC']] },
      ],
    });
  }

  async findAll(filters = {}) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.createdBy) where.createdBy = filters.createdBy;
    if (filters.assignedTo) where.assignedTo = filters.assignedTo;

    return Ticket.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async findByUser(userId) {
    return this.findAll({ createdBy: userId });
  }

  /**
   * findBreached — Core query for the SLA escalation engine.
   * Returns all open tickets where SLA deadline has passed.
   */
  async findBreached() {
    return Ticket.findAll({
      where: {
        slaDeadline: { [Op.lt]: new Date() },
        status: { [Op.notIn]: ['RESOLVED', 'CLOSED'] },
        escalationLevel: { [Op.lt]: 3 },
      },
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
    });
  }

  async update(id, data) {
    await Ticket.update(data, { where: { id } });
    return this.findById(id);
  }

  async getMetrics() {
    const { Ticket } = require('../models');
    const { fn, col, literal } = require('sequelize');

    const byStatus = await Ticket.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    const byPriority = await Ticket.findAll({
      attributes: ['priority', [fn('COUNT', col('id')), 'count']],
      group: ['priority'],
      raw: true,
    });

    const breached = await Ticket.count({
      where: {
        slaDeadline: { [Op.lt]: new Date() },
        status: { [Op.notIn]: ['RESOLVED', 'CLOSED'] },
      },
    });

    const total = await Ticket.count();

    return { byStatus, byPriority, breached, total };
  }
}

module.exports = new TicketRepository();
