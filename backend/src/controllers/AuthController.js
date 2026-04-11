const AuthService = require('../services/AuthService');

/**
 * AuthController — Handles authentication endpoints.
 * Delegates all business logic to AuthService.
 */
class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'name, email, and password are required' });
      }
      const user = await AuthService.register(name, email, password, role);
      res.status(201).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'email and password are required' });
      }
      const result = await AuthService.login(email, password);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async me(req, res) {
    res.json({ success: true, data: req.user });
  }
}

module.exports = new AuthController();
