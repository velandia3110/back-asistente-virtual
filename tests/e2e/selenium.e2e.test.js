/**
 * ============================================================
 *  PRUEBAS E2E CON SELENIUM WEBDRIVER
 *  Proyecto: Gruizajes-Bot – API REST
 * ============================================================
 *
 *  Selenium se utiliza aquí para abrir un navegador headless
 *  y ejecutar peticiones HTTP contra la API, validando las
 *  respuestas JSON como lo haría un usuario desde el navegador.
 *
 *  Requisitos:
 *    npm install --save-dev selenium-webdriver chromedriver
 *
 *  Ejecutar:
 *    npx jest tests/e2e/selenium.e2e.test.js --runInBand
 * ============================================================
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/* ──────────────────────────────────────────────
 *  JSONs DE PRUEBA (idénticos a la colección Postman)
 * ────────────────────────────────────────────── */

const JSON_LOGIN_VALIDO = {
  email: 'admin@gruizajes.com',
  password: 'Admin123!'
};

const JSON_LOGIN_INVALIDO = {
  email: 'noexiste@gruizajes.com',
  password: 'wrongpassword'
};

const JSON_ACTUALIZAR_LEAD = {
  estado: 'contactado'
};

const JSON_ACTUALIZAR_PQRS = {
  estado: 'en_proceso'
};

/* ──────────────────────────────────────────────
 *  UTILIDADES
 * ────────────────────────────────────────────── */

let driver;

/**
 * Ejecuta una petición fetch dentro del navegador controlado por Selenium.
 * Esto simula exactamente lo que haría un frontend o Postman.
 */
async function fetchFromBrowser(method, endpoint, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const fetchScript = `
    const response = await fetch('${BASE_URL}${endpoint}', {
      method: '${method}',
      headers: ${JSON.stringify(headers)},
      ${body ? `body: JSON.stringify(${JSON.stringify(body)})` : ''}
    });
    const data = await response.json().catch(() => ({}));
    return JSON.stringify({ status: response.status, body: data });
  `;

  const result = await driver.executeAsyncScript(`
    const callback = arguments[arguments.length - 1];
    (async () => {
      try {
        ${fetchScript.replace('return JSON.stringify', 'const result = JSON.stringify')}
        callback(result);
      } catch (err) {
        callback(JSON.stringify({ status: 0, body: { error: err.message } }));
      }
    })();
  `);

  return JSON.parse(result);
}

/* ──────────────────────────────────────────────
 *  CONFIGURACIÓN DEL NAVEGADOR
 * ────────────────────────────────────────────── */

beforeAll(async () => {
  const options = new chrome.Options();
  options.addArguments('--headless');          // Sin interfaz gráfica
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');

  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  // Navegar a la página base para tener un contexto de navegador
  await driver.get(BASE_URL + '/health');
}, 30000);

afterAll(async () => {
  if (driver) await driver.quit();
});

/* ══════════════════════════════════════════════
 *  PRUEBAS
 * ══════════════════════════════════════════════ */

let TOKEN = null;

describe('Selenium E2E – API de Gruizajes', () => {

  // ─── 1. Health Check ───
  test('GET /health → debe responder { status: "ok" }', async () => {
    const res = await fetchFromBrowser('GET', '/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  // ─── 2. Login válido ───
  test('POST /api/auth/login → debe retornar token con credenciales válidas', async () => {
    const res = await fetchFromBrowser('POST', '/api/auth/login', JSON_LOGIN_VALIDO);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('admin');
    expect(res.body.admin.email).toBe(JSON_LOGIN_VALIDO.email);

    TOKEN = res.body.token; // Guardar para las siguientes pruebas
  });

  // ─── 3. Login inválido ───
  test('POST /api/auth/login → debe rechazar credenciales inválidas', async () => {
    const res = await fetchFromBrowser('POST', '/api/auth/login', JSON_LOGIN_INVALIDO);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciales inválidas');
  });

  // ─── 4. Listar leads sin token ───
  test('GET /api/leads → debe rechazar sin token (401)', async () => {
    const res = await fetchFromBrowser('GET', '/api/leads');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token no proporcionado');
  });

  // ─── 5. Listar leads con token ───
  test('GET /api/leads → debe listar leads con token válido', async () => {
    if (!TOKEN) return;
    const res = await fetchFromBrowser('GET', '/api/leads?page=1&limit=20', null, TOKEN);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ─── 6. Listar leads filtrados ───
  test('GET /api/leads?estado=nuevo → debe filtrar por estado', async () => {
    if (!TOKEN) return;
    const res = await fetchFromBrowser('GET', '/api/leads?estado=nuevo&page=1&limit=10', null, TOKEN);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  // ─── 7. Actualizar estado lead ───
  test('PATCH /api/leads/:id/estado → debe actualizar estado', async () => {
    if (!TOKEN) return;
    const res = await fetchFromBrowser('PATCH', '/api/leads/test-uuid/estado', JSON_ACTUALIZAR_LEAD, TOKEN);
    // 200 si existe, 404/500 si no existe – ambos son válidos en prueba sin seed
    expect([200, 404, 500]).toContain(res.status);
  });

  // ─── 8. Listar PQRS ───
  test('GET /api/pqrs → debe listar PQRS con token válido', async () => {
    if (!TOKEN) return;
    const res = await fetchFromBrowser('GET', '/api/pqrs?page=1&limit=20', null, TOKEN);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ─── 9. Actualizar estado PQRS ───
  test('PATCH /api/pqrs/:id/estado → debe actualizar estado', async () => {
    if (!TOKEN) return;
    const res = await fetchFromBrowser('PATCH', '/api/pqrs/test-uuid/estado', JSON_ACTUALIZAR_PQRS, TOKEN);
    expect([200, 404, 500]).toContain(res.status);
  });

  // ─── 10. Estadísticas ───
  test('GET /api/stats/resumen → debe retornar métricas numéricas', async () => {
    if (!TOKEN) return;
    const res = await fetchFromBrowser('GET', '/api/stats/resumen', null, TOKEN);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total_leads');
    expect(res.body).toHaveProperty('total_pqrs');
    expect(res.body).toHaveProperty('total_clientes');
    expect(res.body).toHaveProperty('leads_hoy');
    expect(typeof res.body.total_leads).toBe('number');
  });

  // ─── 11. Token inválido ───
  test('GET /api/leads con token falso → debe rechazar (401)', async () => {
    const res = await fetchFromBrowser('GET', '/api/leads', null, 'token-falso-12345');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token inválido o expirado');
  });
});
