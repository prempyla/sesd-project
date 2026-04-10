const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');

/**
 * AuthService — JWT-based stateless authentication.
 * Handles registration, login, and token generation.
 */
class AuthService {
  async register(name, email, password, role = 'USER') {
    const existing = await UserRepository.findByEmail(email);
    if (existing) throw { status: 409, message: 'Email already registered' };

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserRepository.save({ name, email, passwordHash, role });

    return this._sanitize(user);
  }

  async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw { status: 401, message: 'Invalid credentials' };

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw { status: 401, message: 'Invalid credentials' };

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
      token,
      user: this._sanitize(user),
    };
  }

  _sanitize(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}

module.exports = new AuthService();
