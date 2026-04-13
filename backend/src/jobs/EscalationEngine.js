const TicketRepository = require('../repositories/TicketRepository');
const EscalationRepository = require('../repositories/EscalationRepository');
const NotificationService = require('../services/NotificationService');

/**
 * EscalationEngine — Core background processor for SLA monitoring.
 * Implements the background engine described in the sequence diagram.
 * Checks all active tickets for SLA breaches and escalates accordingly.
 */
class EscalationEngine {
  /**
   * Main escalation check — called by the scheduler every 5 minutes.
   * Finds all breached tickets and escalates them level by level.
   */
  async runEscalationCheck() {
    console.log(`[ESCALATION ENGINE] Running check at ${new Date().toISOString()}`);

    try {
      const breachedTickets = await TicketRepository.findBreached();

      if (breachedTickets.length === 0) {
        console.log('[ESCALATION ENGINE] No breached tickets found.');
        return;
      }

      console.log(`[ESCALATION ENGINE] Found ${breachedTickets.length} breached ticket(s).`);

      for (const ticket of breachedTickets) {
        await this._escalate(ticket);
      }
    } catch (err) {
      console.error('[ESCALATION ENGINE] Error:', err.message);
    }
  }

  /**
   * Escalates a single ticket to the next level (max Level 3).
   * @param {Ticket} ticket
   */
  async _escalate(ticket) {
    const newLevel = ticket.escalationLevel + 1;

    const reasons = {
      1: 'SLA breached — escalated to Senior Agent (Level 1)',
      2: 'Level 1 breach — escalated to Team Lead (Level 2)',
      3: 'Level 2 breach — escalated to Admin (Level 3 — Critical)',
    };

    const reason = reasons[newLevel] || `Escalated to Level ${newLevel}`;

    // Persist audit record
    await EscalationRepository.save({
      ticketId: ticket.id,
      level: newLevel,
      reason,
    });

    // Update ticket escalation level
    await TicketRepository.update(ticket.id, {
      escalationLevel: newLevel,
    });

    // Observer: trigger notifications
    await NotificationService.notifyEscalation(ticket, newLevel);

    console.log(`[ESCALATION ENGINE] Ticket #${ticket.id} escalated to Level ${newLevel}: ${reason}`);
  }
}

module.exports = new EscalationEngine();
