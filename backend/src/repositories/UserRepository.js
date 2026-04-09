const { User } = require('../models');

/**
 * UserRepository — Data access layer for User entities.
 * Follows the Repository Pattern to abstract Sequelize from the service layer.
 */
class UserRepository {
  async findById(id) {
    return User.findByPk(id);
  }

  async findByEmail(email) {
    return User.findOne({ where: { email } });
  }

  async findAll() {
    return User.findAll({ attributes: { exclude: ['passwordHash'] } });
  }

  async findByRole(role) {
    return User.findAll({
      where: { role },
      attributes: { exclude: ['passwordHash'] },
    });
  }

  async save(userData) {
    return User.create(userData);
  }

  async update(id, data) {
    await User.update(data, { where: { id } });
    return this.findById(id);
  }
}

module.exports = new UserRepository();
