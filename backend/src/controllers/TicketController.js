const TicketService = require('../services/TicketService');

/**
 * TicketController — Handles all ticket endpoints.
 * Enforces RBAC at the route level; delegates logic to TicketService.
 */
class TicketController {
  async createTicket(req, res, next) {
    try {
      const { title, description, category, impact } = req.body;
      if (!title || !description || !category || !impact) {
        return res.status(400).json({
          success: false,
          message: 'title, description, category, and impact are required',
        });
      }
      const ticket = await TicketService.createTicket(
        { title, description, category, impact },
        req.user.id
      );
      res.status(201).json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  }

  async getTickets(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
      };
      const tickets = await TicketService.getTickets(req.user, filters);
      res.json({ success: true, data: tickets, count: tickets.length });
    } catch (err) {
      next(err);
    }
  }

  async getTicketById(req, res, next) {
    try {
      const ticket = await TicketService.getTicketById(req.params.id);
      // Users can only see their own tickets
      if (req.user.role === 'USER' && ticket.createdBy !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      res.json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: 'status is required' });
      }
      const ticket = await TicketService.updateStatus(req.params.id, status, req.user);
      res.json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  }

  async assignTicket(req, res, next) {
    try {
      const { agentId } = req.body;
      if (!agentId) {
        return res.status(400).json({ success: false, message: 'agentId is required' });
      }
      const ticket = await TicketService.assignTicket(req.params.id, agentId);
      res.json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  }

  async getMetrics(req, res, next) {
    try {
      const metrics = await TicketService.getMetrics();
      res.json({ success: true, data: metrics });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TicketController();
