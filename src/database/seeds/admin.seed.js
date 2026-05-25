const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  await knex('admins').del();
  const hash = await bcrypt.hash('Admin123!', 10);
  await knex('admins').insert([
    { email: 'admin@gruizajes.com', password_hash: hash, rol: 'admin' },
  ]);
};