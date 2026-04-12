const UserRepository = require('../repositories/UserRepository');

/**
 * AdminController — Admin-only endpoints for user management.
 */
class AdminController {
  async getAllUsers(req, res, next) {
    try {
      const users = await UserRepository.findAll();
      res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  }

  async getAgents(req, res, next) {
    try {
      const agents = await UserRepository.findByRole('SUPPORT');
      res.json({ success: true, data: agents });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
