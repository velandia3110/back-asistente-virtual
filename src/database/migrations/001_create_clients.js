exports.up = function (knex) {
  return knex.schema.createTable('clients', (t) => {
    t.uuid('id_client').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('nombre').notNullable();
    t.string('telefono').notNullable();
    t.string('telegram_id').unique();
    t.string('cedula_nit');
    t.timestamp('creado_en').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('clients');
};