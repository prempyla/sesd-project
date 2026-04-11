const NotificationRepository = require('../repositories/NotificationRepository');

/**
 * NotificationService — Observer Pattern implementation.
 * Triggered by state changes in TicketService and EscalationEngine.
 * Persists in-app notifications and simulates email alerts.
 */
class NotificationService {
  /**
   * Notify when a ticket is created.
   */
  async notifyTicketCreated(ticket, userId) {
    await NotificationRepository.save({
      userId,
      message: `✅ Ticket #${ticket.id} "${ticket.title}" created with priority ${ticket.priority}. SLA deadline: ${new Date(ticket.slaDeadline).toLocaleString()}.`,
      type: 'GENERAL',
      ticketId: ticket.id,
    });
    this._simulateEmail(userId, `Ticket #${ticket.id} Created`, `Your ticket has been submitted with ${ticket.priority} priority.`);
  }

  /**
   * Notify when a ticket is assigned.
   */
  async notifyAssigned(ticket, agentId) {
    if (!agentId) return;
    await NotificationRepository.save({
      userId: agentId,
      message: `📋 Ticket #${ticket.id} "${ticket.title}" has been assigned to you.`,
      type: 'ASSIGNED',
      ticketId: ticket.id,
    });

    // Also notify the creator
    await NotificationRepository.save({
      userId: ticket.createdBy,
      message: `🔔 Ticket #${ticket.id} has been assigned to a support agent.`,
      type: 'ASSIGNED',
      ticketId: ticket.id,
    });

    this._simulateEmail(agentId, `Ticket #${ticket.id} Assigned`, `You have been assigned ticket: ${ticket.title}`);
  }

  /**
   * Notify when status changes.
   */
  async notifyStatusChange(ticket, newStatus) {
    // Notify creator
    await NotificationRepository.save({
      userId: ticket.createdBy,
      message: `🔄 Ticket #${ticket.id} status changed to ${newStatus}.`,
      type: 'STATUS_CHANGE',
      ticketId: ticket.id,
    });

    if (newStatus === 'RESOLVED' || newStatus === 'CLOSED') {
      await NotificationRepository.save({
        userId: ticket.createdBy,
        message: `✅ Ticket #${ticket.id} "${ticket.title}" has been ${newStatus.toLowerCase()}. Thank you for your patience!`,
        type: 'RESOLVED',
        ticketId: ticket.id,
      });
    }
  }

  /**
   * Notify when a ticket is escalated (SLA breach).
   */
  async notifyEscalation(ticket, level) {
    const targets = [];
    if (ticket.assignedTo) targets.push(ticket.assignedTo);
    if (ticket.createdBy) targets.push(ticket.createdBy);

    const message = `🚨 ESCALATION L${level}: Ticket #${ticket.id} "${ticket.title}" has breached its SLA and escalated to Level ${level}.`;

    for (const userId of targets) {
      await NotificationRepository.save({
        userId,
        message,
        type: 'ESCALATED',
        ticketId: ticket.id,
      });
      this._simulateEmail(userId, `⚠️ SLA Breach — Ticket #${ticket.id}`, message);
    }
  }

  /**
   * Simulates email dispatch (logs to console in this implementation).
   */
  _simulateEmail(userId, subject, body) {
    console.log(`[EMAIL SIM] → User #${userId} | Subject: ${subject} | ${body}`);
  }
}

module.exports = new NotificationService();
