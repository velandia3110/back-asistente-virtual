exports.up = async function (knex) {
  // ── pqrs: datos de contacto reales + observaciones ─────────────────────────
  await knex.schema.alterTable('pqrs', (t) => {
    t.string('nombre_contacto').nullable();
    t.string('telefono_contacto').nullable();
    t.string('email').nullable();
    t.text('observaciones').nullable();
    // Cambiamos el estado por defecto a 'pendiente' (más descriptivo)
    t.string('estado').defaultTo('pendiente').alter();
  });

  // ── quotes: coordenadas GPS ────────────────────────────────────────────────
  await knex.schema.alterTable('quotes', (t) => {
    t.decimal('latitud',  10, 7).nullable();
    t.decimal('longitud', 10, 7).nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('pqrs', (t) => {
    t.dropColumn('nombre_contacto');
    t.dropColumn('telefono_contacto');
    t.dropColumn('email');
    t.dropColumn('observaciones');
  });

  await knex.schema.alterTable('quotes', (t) => {
    t.dropColumn('latitud');
    t.dropColumn('longitud');
  });
};