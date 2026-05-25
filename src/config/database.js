const knex = require('knex');
const env = require('./env');

const db = knex({
  client: 'pg',
  connection: env.DATABASE_URL,
  pool: { min: 2, max: 10 },
  migrations: { directory: './src/database/migrations' },
  seeds: { directory: './src/database/seeds' },
});

module.exports = db;