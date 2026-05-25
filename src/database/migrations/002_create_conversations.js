exports.up = function (knex) {
  return knex.schema
    .createTable('conversations', (t) => {
      t.uuid('id_conversations').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.uuid('client_id').references('id_client').inTable('clients').onDelete('CASCADE');
      t.string('origen_id');
      t.string('canal').defaultTo('telegram');
      t.string('estado').defaultTo('activa');
      t.timestamp('iniciado_en').defaultTo(knex.fn.now());
      t.timestamp('finalizado_en').nullable();
    })
    .createTable('messages', (t) => {
      t.uuid('id_message').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.uuid('conversation_id').references('id_conversations').inTable('conversations').onDelete('CASCADE');
      t.string('origen').notNullable();
      t.text('texto').notNullable();
      t.timestamp('creado_en').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable('messages').dropTable('conversations');
};