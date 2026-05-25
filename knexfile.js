// knexfile.js
require('dotenv').config();

module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: './src/database/migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: './src/database/seeds'
  }
};