const TicketRepository = require('../repositories/TicketRepository');
const SlaProvider = require('./SlaProvider');
const NotificationService = require('./NotificationService');

/**
 * TicketService — Core business logic for ticket lifecycle management.
 * Implements Factory Pattern for ticket creation and orchestrates
 * SLA calculation, status transitions, and notification triggers.
 */
class TicketService {
  /**
   * Creates a ticket using the Factory Pattern.
   * Auto-assigns priority and calculates SLA deadline.
   */
  async createTicket(dto, createdBy) {
    // Factory: auto-assign priority based on category + impact
    const priority = SlaProvider.calculatePriority(dto.category, dto.impact);
    const slaDeadline = SlaProvider.getDeadline(priority);

    const ticketData = {
      title: dto.title,
      description: dto.description,
      category: dto.category,
      impact: dto.impact,
      priority,
      slaDeadline,
      createdBy,
      status: 'OPEN',
      escalationLevel: 0,
    };

    const ticket = await TicketRepository.save(ticketData);

    // Observer: notify creator
    await NotificationService.notifyTicketCreated(ticket, createdBy);

    return ticket;
  }

  /**
   * Retrieves all tickets (admin/support) or user's own tickets.
   */
  async getTickets(user, filters = {}) {
    if (user.role === 'USER') {
      return TicketRepository.findByUser(user.id);
    }
    return TicketRepository.findAll(filters);
  }

  async getTicketById(id) {
    const ticket = await TicketRepository.findById(id);
    if (!ticket) throw { status: 404, message: 'Ticket not found' };
    return ticket;
  }

  /**
   * Updates ticket status with state-machine validation.
   * Triggers Observer notifications on transition.
   */
  async updateStatus(id, newStatus, user) {
    const ticket = await this.getTicketById(id);

    // State machine: validate transition
    const validTransitions = {
      OPEN: ['ASSIGNED', 'IN_PROGRESS'],
      ASSIGNED: ['IN_PROGRESS'],
      IN_PROGRESS: ['RESOLVED'],
      RESOLVED: ['CLOSED'],
      CLOSED: [],
    };

    const allowed = validTransitions[ticket.status] || [];
    if (!allowed.includes(newStatus)) {
      throw { status: 400, message: `Cannot transition from ${ticket.status} to ${newStatus}` };
    }

    const updated = await TicketRepository.update(id, { status: newStatus });

    // Observer: notify on status change
    await NotificationService.notifyStatusChange(ticket, newStatus);

    return updated;
  }

  /**
   * Assigns a ticket to a support agent (admin only).
   */
  async assignTicket(ticketId, agentId) {
    const ticket = await this.getTicketById(ticketId);
    const updated = await TicketRepository.update(ticketId, {
      assignedTo: agentId,
      status: ticket.status === 'OPEN' ? 'ASSIGNED' : ticket.status,
    });

    // Observer: notify agent
    await NotificationService.notifyAssigned(ticket, agentId);

    return updated;
  }

  /**
   * Returns admin metrics dashboard data.
   */
  async getMetrics() {
    return TicketRepository.getMetrics();
  }
}

module.exports = new TicketService();
