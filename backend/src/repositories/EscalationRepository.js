const { Escalation } = require('../models');

/**
 * EscalationRepository — Persists audit log of escalation events.
 */
class EscalationRepository {
  async save(data) {
    return Escalation.create(data);
  }

  async findByTicket(ticketId) {
    return Escalation.findAll({
      where: { ticketId },
      order: [['escalatedAt', 'DESC']],
    });
  }
}

module.exports = new EscalationRepository();
