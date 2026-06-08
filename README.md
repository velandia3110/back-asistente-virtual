# Gruizajes Bot

Asistente virtual para Gruizajes vía Telegram. Permite capturar y calificar solicitudes de cotización de izaje, gestionar PQRS y responder preguntas frecuentes, con una API REST para el equipo comercial.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Bot | [Grammy.js](https://grammy.dev/) + `@grammyjs/conversations` |
| API REST | Express 4 |
| Base de datos | PostgreSQL 16 (Docker) + Knex.js |
| Autenticación | JWT + bcryptjs |
| Validación | Zod |
| Logging | Winston |
| Email | Nodemailer |
| Package manager | pnpm |

## Estructura del proyecto

```
src/
├── api/
│   ├── controllers/      # auth, leads, pqrs
│   ├── middlewares/      # auth JWT, validación, error handler
│   └── routes/           # auth, leads, pqrs, stats
├── bot/
│   ├── handlers/         # start, faq, lead, pqrs
│   ├── keyboards/        # main, lead, pqrs
│   ├── middlewares/      # logger, session
│   └── scenes/           # lead, pqrs, pqrs_consulta, asesor
├── config/
│   ├── database.js       # conexión Knex + PostgreSQL
│   ├── env.js            # validación de variables de entorno (Zod)
│   └── telegram.js       # configuración del bot y registro de escenas
├── database/
│   ├── migrations/       # 001–005 esquema completo
│   └── seeds/            # admin y FAQs iniciales
├── repositories/         # acceso a datos (conversation, lead, pqrs, faq)
├── services/             # lógica de negocio (conversation, lead, pqrs, notification)
└── utils/                # logger, formatters, validators
tests/
├── unit/                 # pruebas unitarias de servicios
├── integration/          # pruebas de rutas con supertest
└── e2e/                  # pruebas E2E (API + Selenium)
```

## Flujos del bot

| Opción del menú | Descripción |
|---|---|
| Solicitar cotización | Conversación guiada: nombre, teléfono, tipo de carga, peso (kg), altura (m), radio (m), ubicación GPS o texto |
| PQRS | Registrar petición, queja, reclamo o sugerencia con número de radicado |
| Consultar PQRS | Consultar estado de un radicado existente |
| Preguntas frecuentes | Lista de FAQs cargadas desde base de datos |
| Hablar con asesor | Conversación guiada para contacto con asesor comercial |

## API REST

Todos los endpoints protegidos requieren `Authorization: Bearer <token>`.

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/health` | No | Estado del servidor |
| `POST` | `/api/auth/login` | No | Obtener token JWT |
| `GET` | `/api/leads` | Si | Listar solicitudes de cotización |
| `PATCH` | `/api/leads/:id/estado` | Si | Actualizar estado comercial de un lead |
| `GET` | `/api/pqrs` | Si | Listar PQRS |
| `PATCH` | `/api/pqrs/:id/estado` | Si | Actualizar estado de una PQRS |
| `GET` | `/api/stats/resumen` | Si | Totales: leads, pqrs, clientes, leads del día |

## Esquema de base de datos

```
clients          — datos del cliente (nombre, teléfono, telegram_id, cedula_nit)
conversations    — sesiones de conversación por canal
messages         — mensajes de cada conversación
quotes           — solicitudes de cotización (tipo_carga, peso_kg, altura_m, radio_m, ubicacion)
crm_links        — integración con sistemas CRM externos
pqrs             — peticiones, quejas, reclamos y sugerencias
faqs             — preguntas frecuentes gestionables
admins           — usuarios del panel administrativo
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Telegram
TELEGRAM_BOT_TOKEN=          # obligatorio
WEBHOOK_URL=                  # opcional en dev (polling), obligatorio en producción

# Base de datos
DATABASE_URL=postgresql://postgres:devpassword123@localhost:5432/gruizajes

# Autenticación
JWT_SECRET=                   # obligatorio
JWT_EXPIRES_IN=7d

# Email (opcional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_COMERCIAL=
```

## Instalación y ejecución

### Requisitos previos

- Node.js >= 18
- pnpm
- Docker y Docker Compose

### Pasos

```bash
# 1. Clonar el repositorio e instalar dependencias
pnpm install

# 2. Levantar la base de datos
docker-compose up -d

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores reales

# 4. Ejecutar migraciones y seeds
pnpm migrate
pnpm seed

# 5. Iniciar en desarrollo
pnpm dev

# 6. Iniciar en producción
pnpm start
```

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor con hot-reload (nodemon) |
| `pnpm start` | Servidor en producción |
| `pnpm migrate` | Ejecutar migraciones pendientes |
| `pnpm seed` | Poblar datos iniciales (admin + FAQs) |
| `pnpm test` | Todas las pruebas |
| `pnpm test:e2e` | Pruebas E2E de la API |
| `pnpm test:selenium` | Pruebas E2E con Selenium |
| `pnpm test:coverage` | Reporte de cobertura |

## Docker

El archivo `docker-compose.yml` levanta PostgreSQL 16:

```bash
docker-compose up -d     # iniciar
docker-compose down      # detener
docker-compose down -v   # detener y eliminar volúmenes
```

Credenciales por defecto para desarrollo:

| Campo | Valor |
|---|---|
| Host | `localhost:5432` |
| Base de datos | `gruizajes` |
| Usuario | `postgres` |
| Contraseña | `devpassword123` |
