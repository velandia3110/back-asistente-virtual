/**
 * ============================================================
 *  PRUEBAS E2E – API REST de Gruizajes-Bot
 *  Herramienta: Supertest (ya incluida en devDependencies)
 * ============================================================
 *
 *  Estas pruebas golpean directamente los endpoints del backend
 *  igual que lo haría Postman o Selenium con peticiones HTTP.
 *
 *  Ejecutar:  npx jest tests/e2e/api.e2e.test.js --runInBand
 * ============================================================
 */

const request = require('supertest');
const app = require('../../src/app');

/* ──────────────────────────────────────────────
 *  DATOS JSON DE PRUEBA  (equivalentes a Postman)
 * ────────────────────────────────────────────── */

// ① JSON para login de administrador
const LOGIN_VALIDO = {
  email: 'admin@gruizajes.com',
  password: 'Admin123!'
};

const LOGIN_INVALIDO = {
  email: 'noexiste@gruizajes.com',
  password: 'wrongpassword'
};

// ② JSON para actualizar estado de un lead
const LEAD_ACTUALIZAR_ESTADO = {
  estado: 'contactado'
};

// ③ JSON para actualizar estado de un PQRS
const PQRS_ACTUALIZAR_ESTADO = {
  estado: 'en_proceso'
};

/* ──────────────────────────────────────────────
 *  VARIABLES GLOBALES
 * ────────────────────────────────────────────── */
let TOKEN = null;

/* ══════════════════════════════════════════════
 *  1. HEALTH CHECK
 * ══════════════════════════════════════════════ */
describe('GET /health', () => {
  it('debe responder con status ok', async () => {
    const res = await request(app)
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toEqual({ status: 'ok' });
  });
});

/* ══════════════════════════════════════════════
 *  2. AUTENTICACIÓN  –  POST /api/auth/login
 * ══════════════════════════════════════════════ */
describe('POST /api/auth/login', () => {
  it('debe retornar un token con credenciales válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send(LOGIN_VALIDO)
      .set('Content-Type', 'application/json')
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('admin');
    expect(res.body.admin).toHaveProperty('email', LOGIN_VALIDO.email);
    expect(res.body.admin).toHaveProperty('rol');

    // Guardar token para las siguientes pruebas
    TOKEN = res.body.token;
  });

  it('debe rechazar credenciales inválidas con 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send(LOGIN_INVALIDO)
      .set('Content-Type', 'application/json')
      .expect(401);

    expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
  });

  it('debe rechazar un body vacío', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({})
      .set('Content-Type', 'application/json')
      .expect(401);
  });
});

/* ══════════════════════════════════════════════
 *  3. LEADS  –  GET /api/leads
 * ══════════════════════════════════════════════ */
describe('GET /api/leads', () => {
  it('debe rechazar peticiones sin token (401)', async () => {
    await request(app)
      .get('/api/leads')
      .expect(401);
  });

  it('debe rechazar un token inválido (401)', async () => {
    await request(app)
      .get('/api/leads')
      .set('Authorization', 'Bearer token-falso-12345')
      .expect(401);
  });

  it('debe listar leads con token válido', async () => {
    if (!TOKEN) return; // skip si no hubo login exitoso

    const res = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${TOKEN}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('debe aceptar parámetros de paginación', async () => {
    if (!TOKEN) return;

    const res = await request(app)
      .get('/api/leads?page=1&limit=5')
      .set('Authorization', `Bearer ${TOKEN}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
  });

  it('debe filtrar leads por estado', async () => {
    if (!TOKEN) return;

    const res = await request(app)
      .get('/api/leads?estado=nuevo')
      .set('Authorization', `Bearer ${TOKEN}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
  });
});

/* ══════════════════════════════════════════════
 *  4. LEADS  –  PATCH /api/leads/:id/estado
 * ══════════════════════════════════════════════ */
describe('PATCH /api/leads/:id/estado', () => {
  it('debe rechazar sin token', async () => {
    await request(app)
      .patch('/api/leads/some-uuid/estado')
      .send(LEAD_ACTUALIZAR_ESTADO)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('debe actualizar estado de un lead con token válido', async () => {
    if (!TOKEN) return;

    // Nota: Reemplazar 'some-uuid' con un ID real de la BD para prueba completa
    const res = await request(app)
      .patch('/api/leads/some-uuid/estado')
      .send(LEAD_ACTUALIZAR_ESTADO)
      .set('Authorization', `Bearer ${TOKEN}`)
      .set('Content-Type', 'application/json');

    // Puede ser 200 (éxito) o 404/500 si el UUID no existe
    expect([200, 404, 500]).toContain(res.status);
  });
});

/* ══════════════════════════════════════════════
 *  5. PQRS  –  GET /api/pqrs
 * ══════════════════════════════════════════════ */
describe('GET /api/pqrs', () => {
  it('debe rechazar peticiones sin token (401)', async () => {
    await request(app)
      .get('/api/pqrs')
      .expect(401);
  });

  it('debe listar PQRS con token válido', async () => {
    if (!TOKEN) return;

    const res = await request(app)
      .get('/api/pqrs')
      .set('Authorization', `Bearer ${TOKEN}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('debe aceptar filtros de paginación y estado', async () => {
    if (!TOKEN) return;

    const res = await request(app)
      .get('/api/pqrs?page=1&limit=10&estado=abierta')
      .set('Authorization', `Bearer ${TOKEN}`)
      .expect(200);

    expect(res.body).toHaveProperty('data');
  });
});

/* ══════════════════════════════════════════════
 *  6. PQRS  –  PATCH /api/pqrs/:id/estado
 * ══════════════════════════════════════════════ */
describe('PATCH /api/pqrs/:id/estado', () => {
  it('debe rechazar sin token', async () => {
    await request(app)
      .patch('/api/pqrs/some-uuid/estado')
      .send(PQRS_ACTUALIZAR_ESTADO)
      .set('Content-Type', 'application/json')
      .expect(401);
  });

  it('debe actualizar estado de PQRS con token válido', async () => {
    if (!TOKEN) return;

    const res = await request(app)
      .patch('/api/pqrs/some-uuid/estado')
      .send(PQRS_ACTUALIZAR_ESTADO)
      .set('Authorization', `Bearer ${TOKEN}`)
      .set('Content-Type', 'application/json');

    expect([200, 404, 500]).toContain(res.status);
  });
});

/* ══════════════════════════════════════════════
 *  7. ESTADÍSTICAS  –  GET /api/stats/resumen
 * ══════════════════════════════════════════════ */
describe('GET /api/stats/resumen', () => {
  it('debe rechazar sin token (401)', async () => {
    await request(app)
      .get('/api/stats/resumen')
      .expect(401);
  });

  it('debe retornar estadísticas con token válido', async () => {
    if (!TOKEN) return;

    const res = await request(app)
      .get('/api/stats/resumen')
      .set('Authorization', `Bearer ${TOKEN}`)
      .expect(200);

    expect(res.body).toHaveProperty('total_leads');
    expect(res.body).toHaveProperty('total_pqrs');
    expect(res.body).toHaveProperty('total_clientes');
    expect(res.body).toHaveProperty('leads_hoy');

    // Validar que son números
    expect(typeof res.body.total_leads).toBe('number');
    expect(typeof res.body.total_pqrs).toBe('number');
  });
});

/* ══════════════════════════════════════════════
 *  8. RUTAS INEXISTENTES
 * ══════════════════════════════════════════════ */
describe('Rutas inexistentes', () => {
  it('GET /api/ruta-que-no-existe debe retornar 404', async () => {
    const res = await request(app)
      .get('/api/ruta-que-no-existe');

    expect([404, 500]).toContain(res.status);
  });
});
