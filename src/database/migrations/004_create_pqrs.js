exports.up = function (knex) {
  return knex.schema
    .createTable('pqrs', (t) => {
      t.uuid('id_pqrs').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.uuid('client_id').references('id_client').inTable('clients').onDelete('CASCADE');
      t.enum('tipo', ['peticion', 'queja', 'reclamo', 'sugerencia']).notNullable();
      t.text('descripcion').notNullable();
      t.string('radicado').unique().notNullable();
      t.string('estado').defaultTo('abierto');
      t.timestamp('creado_en').defaultTo(knex.fn.now());
    })
    .createTable('faqs', (t) => {
      t.uuid('id_faq').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.string('pregunta').notNullable();
      t.text('respuesta').notNullable();
      t.integer('orden').defaultTo(0);
      t.boolean('activo').defaultTo(true);
    })
    .createTable('admins', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.string('email').unique().notNullable();
      t.string('password_hash').notNullable();
      t.string('rol').defaultTo('admin');
      t.timestamp('creado_en').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable('admins').dropTable('faqs').dropTable('pqrs');
};