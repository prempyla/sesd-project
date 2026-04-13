const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/users', AdminController.getAllUsers.bind(AdminController));
router.get('/agents', AdminController.getAgents.bind(AdminController));

module.exports = router;
