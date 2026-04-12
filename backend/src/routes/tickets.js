const express = require('express');
const router = express.Router();
const TicketController = require('../controllers/TicketController');
const { authenticate, authorize } = require('../middlewares/auth');

// All ticket routes require authentication
router.use(authenticate);

// Create a new ticket (any authenticated user)
router.post('/', TicketController.createTicket.bind(TicketController));

// Get tickets (filtered by role in service layer)
router.get('/', TicketController.getTickets.bind(TicketController));

// Get single ticket
router.get('/:id', TicketController.getTicketById.bind(TicketController));

// Update status (SUPPORT + ADMIN)
router.put('/:id/status', authorize('SUPPORT', 'ADMIN'), TicketController.updateStatus.bind(TicketController));

// Assign ticket to agent (ADMIN only)
router.put('/:id/assign', authorize('ADMIN'), TicketController.assignTicket.bind(TicketController));

// Get metrics (ADMIN only)
router.get('/admin/metrics', authorize('ADMIN'), TicketController.getMetrics.bind(TicketController));

module.exports = router;
