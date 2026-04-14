const { Sequelize } = require('sequelize');
const path = require('path');

require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  // Use Postgres when on Render (or if DATABASE_URL is provided locally)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
} else {
  // Fallback to SQLite for strict local dev
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../data/sets.db'),
    logging: false,
  });
}

module.exports = sequelize;
