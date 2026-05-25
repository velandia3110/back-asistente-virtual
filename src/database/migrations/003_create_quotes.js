exports.up = function (knex) {
  return knex.schema
    .createTable('quotes', (t) => {
      t.uuid('id_quote').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.uuid('client_id').references('id_client').inTable('clients').onDelete('CASCADE');
      t.string('tipo_carga').notNullable();
      t.float('peso_kg').notNullable();
      t.float('altura_m').notNullable();
      t.float('radio_m').notNullable();
      t.string('ubicacion').notNullable();
      t.string('responsable').nullable();
      t.string('estado_comercial').defaultTo('nuevo');
      t.timestamp('creado_en').defaultTo(knex.fn.now());
    })
    .createTable('crm_links', (t) => {
      t.uuid('id_crm_links').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.uuid('quote_id').references('id_quote').inTable('quotes').onDelete('CASCADE');
      t.string('crm_system').notNullable();
      t.string('external_id').notNullable();
      t.timestamp('sincronizado_en').defaultTo(knex.fn.now());
      t.string('status').defaultTo('activo');
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable('crm_links').dropTable('quotes');
};