# Plan de desarrollo — Gruizajes Dashboard

Panel administrativo web para gestionar los datos generados por el bot de Telegram de Gruizajes. Construido en **Angular 18** con **Tailwind CSS v3**.

---

## Resumen

Se construirá un SPA (Single Page Application) en Angular 18 que consume la API REST del backend existente. El panel permitirá al administrador iniciar sesión, visualizar métricas clave, y gestionar los registros de leads (cotizaciones), PQRS y FAQs: listando, filtrando, editando estados y eliminando registros. El acceso estará protegido por el sistema JWT ya implementado en el backend.

---

## Stack tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Framework | Angular 18 (standalone components + signals) | Última versión estable, sin módulos NgModule, tipado fuerte |
| Estilos | Tailwind CSS v3 | Utility-first, CSS propio mínimo |
| HTTP | `HttpClient` (Angular) + interceptores | Nativo, sin dependencias extras |
| Formularios | Reactive Forms | Validación robusta para filtros y edición |
| Routing | Angular Router con lazy loading | Carga diferida por feature |
| Estado local | Signals (`signal`, `computed`, `effect`) | Sin NgRx para este alcance |
| Notificaciones | Toast personalizado (shared component) | Ligero, sin librerías externas |
| Build | Angular CLI + Vite (ng 18 default) | Compilación rápida |

---

## Estructura del proyecto

```
gruizajes-dashboard/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── jwt.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   ├── models/
│   │   │   │   ├── lead.model.ts
│   │   │   │   ├── pqrs.model.ts
│   │   │   │   ├── faq.model.ts
│   │   │   │   ├── client.model.ts
│   │   │   │   └── stats.model.ts
│   │   │   └── services/
│   │   │       ├── auth.service.ts
│   │   │       ├── lead.service.ts
│   │   │       ├── pqrs.service.ts
│   │   │       ├── faq.service.ts
│   │   │       └── stats.service.ts
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   └── login/
│   │   │   │       ├── login.component.ts
│   │   │   │       └── login.component.html
│   │   │   └── dashboard/
│   │   │       ├── layout/
│   │   │       │   ├── dashboard-layout.component.ts
│   │   │       │   └── dashboard-layout.component.html
│   │   │       ├── home/
│   │   │       │   ├── home.component.ts
│   │   │       │   └── home.component.html
│   │   │       ├── leads/
│   │   │       │   ├── leads.component.ts
│   │   │       │   └── leads.component.html
│   │   │       ├── pqrs/
│   │   │       │   ├── pqrs.component.ts
│   │   │       │   └── pqrs.component.html
│   │   │       └── faqs/
│   │   │           ├── faqs.component.ts
│   │   │           └── faqs.component.html
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── sidebar/
│   │   │   │   │   ├── sidebar.component.ts
│   │   │   │   │   └── sidebar.component.html
│   │   │   │   ├── topbar/
│   │   │   │   │   ├── topbar.component.ts
│   │   │   │   │   └── topbar.component.html
│   │   │   │   ├── stat-card/
│   │   │   │   │   ├── stat-card.component.ts
│   │   │   │   │   └── stat-card.component.html
│   │   │   │   ├── badge/
│   │   │   │   │   └── badge.component.ts
│   │   │   │   ├── modal/
│   │   │   │   │   ├── modal.component.ts
│   │   │   │   │   └── modal.component.html
│   │   │   │   ├── confirm-dialog/
│   │   │   │   │   ├── confirm-dialog.component.ts
│   │   │   │   │   └── confirm-dialog.component.html
│   │   │   │   └── toast/
│   │   │   │       ├── toast.component.ts
│   │   │   │       └── toast.service.ts
│   │   │   └── pipes/
│   │   │       └── estado-label.pipe.ts
│   │   ├── app.routes.ts
│   │   ├── app.component.ts
│   │   └── app.config.ts
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── styles.css
├── tailwind.config.js
├── angular.json
├── package.json
└── README.md
```

---

## Rutas de la aplicación

```
/login                      → LoginComponent       (redirige al dashboard si hay sesión)
/dashboard                  → DashboardLayout      (guard: requiere JWT válido)
  /dashboard/home           → HomeComponent        (KPIs y resumen)
  /dashboard/leads          → LeadsComponent       (tabla de cotizaciones)
  /dashboard/pqrs           → PqrsComponent        (tabla de PQRS)
  /dashboard/faqs           → FaqsComponent        (tabla de FAQs)
  /dashboard                → redirect → home
```

---

## Modelos de datos (TypeScript)

```typescript
// client.model.ts
export interface Client {
  id_client: string;
  nombre: string;
  telefono: string;
  telegram_id: string | null;
  cedula_nit: string | null;
  creado_en: string;
}

// lead.model.ts
export type EstadoComercial = 'nuevo' | 'contactado' | 'cotizado' | 'cerrado' | 'perdido';

export interface Lead {
  id_quote: string;
  client_id: string;
  tipo_carga: string;
  peso_kg: number;
  altura_m: number;
  radio_m: number;
  ubicacion: string;
  responsable: string | null;
  estado_comercial: EstadoComercial;
  creado_en: string;
  cliente?: Client;
}

// pqrs.model.ts
export type TipoPqrs = 'peticion' | 'queja' | 'reclamo' | 'sugerencia';
export type EstadoPqrs = 'abierto' | 'en_proceso' | 'cerrado';

export interface Pqrs {
  id_pqrs: string;
  client_id: string;
  tipo: TipoPqrs;
  descripcion: string;
  radicado: string;
  estado: EstadoPqrs;
  creado_en: string;
  cliente?: Client;
}

// faq.model.ts
export interface Faq {
  id_faq: string;
  pregunta: string;
  respuesta: string;
  orden: number;
  activo: boolean;
}

// stats.model.ts
export interface Stats {
  total_leads: number;
  total_pqrs: number;
  total_clientes: number;
  leads_hoy: number;
}
```

---

## Endpoints del backend consumidos

| Método | Endpoint | Usado en |
|---|---|---|
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/stats/resumen` | Home |
| `GET` | `/api/leads` | Leads — listado |
| `PATCH` | `/api/leads/:id/estado` | Leads — cambio de estado |
| `DELETE` | `/api/leads/:id` | Leads — eliminar ⚠️ |
| `GET` | `/api/pqrs` | PQRS — listado |
| `PATCH` | `/api/pqrs/:id/estado` | PQRS — cambio de estado |
| `DELETE` | `/api/pqrs/:id` | PQRS — eliminar ⚠️ |
| `GET` | `/api/faqs` | FAQs — listado ⚠️ |
| `PATCH` | `/api/faqs/:id` | FAQs — editar ⚠️ |
| `PATCH` | `/api/faqs/:id/activo` | FAQs — activar/desactivar ⚠️ |

> **⚠️ Endpoints pendientes en el backend:** Los marcados no existen aún. Antes de implementar esas secciones del dashboard, el backend debe exponerlos. Son cambios menores (DELETE y 3 rutas de FAQs).

---

## Diseño y sistema de estilos

### Paleta de colores

```js
// tailwind.config.js
colors: {
  brand: {
    50:  '#fff7ed',
    100: '#ffedd5',
    500: '#f97316',   // naranja principal — color corporativo grúas
    600: '#ea6c10',
    700: '#c2570c',
    900: '#7c2d12',
  },
  surface: {
    DEFAULT: '#f8fafc',   // fondo general
    card:    '#ffffff',   // tarjetas
    sidebar: '#0f172a',   // sidebar oscuro (slate-900)
  }
}
```

### Sistema de badges por estado

| Estado | Color Tailwind |
|---|---|
| `nuevo` | `bg-sky-100 text-sky-700` |
| `contactado` | `bg-amber-100 text-amber-700` |
| `cotizado` | `bg-violet-100 text-violet-700` |
| `cerrado` | `bg-emerald-100 text-emerald-700` |
| `perdido` | `bg-red-100 text-red-700` |
| `abierto` | `bg-sky-100 text-sky-700` |
| `en_proceso` | `bg-amber-100 text-amber-700` |
| PQRS `cerrado` | `bg-emerald-100 text-emerald-700` |
| FAQ activo | `bg-emerald-100 text-emerald-700` |
| FAQ inactivo | `bg-slate-100 text-slate-500` |

### Layout general

```
┌──────────────────────────────────────────────────────────┐
│  Sidebar (slate-900, 240px)  │  Main area                │
│  ─────────────────────────── │  ─────────────────────── │
│  🔶 GRUIZAJES                │  Topbar (blanco, sombra) │
│                              │  ─────────────────────── │
│  ● Inicio                    │                           │
│  ● Cotizaciones              │  <router-outlet>          │
│  ● PQRS                      │                           │
│  ● FAQs                      │                           │
│                              │                           │
│  ─────────────────────────── │                           │
│  [Avatar] Admin  [Logout]    │                           │
└──────────────────────────────────────────────────────────┘
```

### Login

```
┌──────────────────────────────────────┐
│           (fondo degradado brand)    │
│  ┌──────────────────────────────┐   │
│  │  🔶 Gruizajes Admin          │   │
│  │                              │   │
│  │  Correo electrónico          │   │
│  │  ┌────────────────────────┐ │   │
│  │  │                        │ │   │
│  │  └────────────────────────┘ │   │
│  │  Contraseña                  │   │
│  │  ┌────────────────────────┐ │   │
│  │  │                    👁  │ │   │
│  │  └────────────────────────┘ │   │
│  │                              │   │
│  │  [ Iniciar sesión ]          │   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

---

## Requisitos funcionales

| ID | Requisito |
|---|---|
| RF-001 | El sistema muestra un formulario de login con campos email y contraseña |
| RF-002 | Al autenticarse correctamente, el token JWT se persiste en `localStorage` y el usuario es redirigido a `/dashboard/home` |
| RF-003 | Si el token ya existe y es válido al ingresar a `/login`, se redirige automáticamente al dashboard |
| RF-004 | El botón de logout elimina el token y redirige a `/login` |
| RF-005 | El dashboard home muestra 4 tarjetas KPI: total leads, total PQRS, total clientes, leads de hoy |
| RF-006 | La tabla de leads muestra: cliente, tipo de carga, peso (kg), altura (m), radio (m), ubicación, estado y fecha |
| RF-007 | La tabla de leads se puede filtrar por `estado_comercial` mediante un selector |
| RF-008 | La tabla de leads tiene búsqueda por nombre de cliente (filtro local o query param) |
| RF-009 | El administrador puede cambiar el `estado_comercial` de un lead desde un selector en la tabla |
| RF-010 | El administrador puede eliminar un lead; el sistema muestra un diálogo de confirmación antes de proceder |
| RF-011 | La tabla de PQRS muestra: radicado, cliente, tipo, descripción (truncada), estado y fecha |
| RF-012 | La tabla de PQRS se puede filtrar por `tipo` y por `estado` |
| RF-013 | La tabla de PQRS tiene búsqueda por radicado o nombre de cliente |
| RF-014 | El administrador puede cambiar el `estado` de una PQRS |
| RF-015 | El administrador puede eliminar una PQRS con confirmación previa |
| RF-016 | La tabla de FAQs muestra: pregunta, respuesta (truncada a 80 chars), orden y estado activo/inactivo |
| RF-017 | El administrador puede editar la pregunta y respuesta de una FAQ mediante un modal |
| RF-018 | El administrador puede activar o desactivar una FAQ con un toggle |
| RF-019 | Todas las peticiones autenticadas incluyen automáticamente el header `Authorization: Bearer <token>` vía interceptor |
| RF-020 | Si el backend devuelve `401`, el interceptor limpia la sesión y redirige a `/login` |
| RF-021 | Las acciones exitosas (cambio de estado, edición, eliminación) muestran una notificación toast verde |
| RF-022 | Los errores de API muestran una notificación toast roja con el mensaje del servidor |
| RF-023 | Las tablas muestran un estado vacío ilustrado cuando no hay registros |
| RF-024 | Las tablas muestran un skeleton de carga mientras se espera la respuesta del servidor |

---

## Requisitos no funcionales

| ID | Requisito |
|---|---|
| RNF-001 | La aplicación usa Angular 18 con standalone components; no se usan NgModules |
| RNF-002 | Todo el estilo se implementa con clases de Tailwind CSS; el archivo `styles.css` solo contiene las directivas `@tailwind` y tokens custom mínimos |
| RNF-003 | Las features cargan de forma lazy (`loadComponent` / `loadChildren`) para optimizar el bundle inicial |
| RNF-004 | El diseño es responsive para resoluciones de escritorio y tablet (≥ 1024px); en móvil el sidebar colapsa |
| RNF-005 | La URL base de la API se configura en `environment.ts` y `environment.prod.ts`, no está hardcodeada |
| RNF-006 | El token JWT nunca se expone en los logs del cliente ni en la URL |
| RNF-007 | El tiempo de carga inicial del dashboard (Lighthouse) debe ser < 3 segundos en red normal |

---

## Fuera de alcance (v1)

- Creación de nuevos registros de leads, PQRS o FAQs desde el dashboard
- Gestión de usuarios administradores (crear, cambiar contraseña)
- Visualización de conversaciones o mensajes del bot
- Integración con sistemas CRM externos
- Notificaciones en tiempo real (WebSockets / SSE)
- Modo oscuro
- Exportación de datos a PDF o Excel
- Paginación server-side (se asume que el backend devuelve todos los registros por ahora)
- Internacionalización (i18n)

---

## Desglose de tareas

Las tareas están ordenadas por dependencia técnica. Cada fase puede ejecutarse como un commit o PR.

### Fase 1 — Setup del proyecto

- [ ] 1.1 Crear proyecto Angular 18: `ng new gruizajes-dashboard --routing --style=css --standalone`
- [ ] 1.2 Instalar y configurar Tailwind CSS v3
- [ ] 1.3 Configurar `tailwind.config.js` con la paleta de colores de Gruizajes
- [ ] 1.4 Crear `environment.ts` y `environment.prod.ts` con `apiUrl`
- [ ] 1.5 Crear estructura de carpetas `core/`, `features/`, `shared/`
- [ ] 1.6 Configurar `app.config.ts` con `provideRouter`, `provideHttpClient(withInterceptors([...]))`

### Fase 2 — Core: auth y seguridad

- [ ] 2.1 Definir interfaces TypeScript en `core/models/`
- [ ] 2.2 Implementar `AuthService` (login, logout, `isAuthenticated()`, manejo del token)
- [ ] 2.3 Implementar `jwt.interceptor.ts` (adjuntar `Authorization: Bearer`)
- [ ] 2.4 Implementar `error.interceptor.ts` (capturar 401 → logout, resto → toast)
- [ ] 2.5 Implementar `auth.guard.ts` (redirigir a `/login` si sin token)

### Fase 3 — Login

- [ ] 3.1 `LoginComponent` con Reactive Form (email + password con toggle de visibilidad)
- [ ] 3.2 Validaciones: required, email format, minLength contraseña
- [ ] 3.3 Estado de carga en el botón (spinner mientras llama a la API)
- [ ] 3.4 Diseño: card centrado sobre fondo con degradado brand, logo y copy

### Fase 4 — Layout del dashboard

- [ ] 4.1 `DashboardLayoutComponent` con sidebar + topbar + `<router-outlet>`
- [ ] 4.2 `SidebarComponent`: logo, nav links con íconos, indicador de ruta activa, botón logout
- [ ] 4.3 `TopbarComponent`: título de la sección actual, avatar/nombre del admin

### Fase 5 — Shared components

- [ ] 5.1 `StatCardComponent` (inputs: `label`, `value`, `icon`, `color`)
- [ ] 5.2 `BadgeComponent` (input: `estado` → color automático por mapping)
- [ ] 5.3 `ModalComponent` (overlay con `ng-content`, título, botones acción/cancelar)
- [ ] 5.4 `ConfirmDialogComponent` (mensaje configurable, botones confirmar/cancelar)
- [ ] 5.5 `ToastService` + `ToastComponent` (cola de notificaciones, auto-dismiss 4s)
- [ ] 5.6 `EstadoLabelPipe` (transforma `'en_proceso'` → `'En proceso'`)

### Fase 6 — Home (KPIs)

- [ ] 6.1 `StatsService.getResumen()` → `GET /api/stats/resumen`
- [ ] 6.2 `HomeComponent` con 4 `StatCard` en grid 2×2
- [ ] 6.3 Skeleton de carga mientras llegan los datos

### Fase 7 — Leads

- [ ] 7.1 `LeadService.listar()`, `cambiarEstado()`, `eliminar()`
- [ ] 7.2 `LeadsComponent` con tabla: columnas, filtro de estado, buscador
- [ ] 7.3 Selector inline de `estado_comercial` por fila
- [ ] 7.4 Botón eliminar → `ConfirmDialog` → llamada DELETE
- [ ] 7.5 Badge de estado con colores por valor
- [ ] 7.6 Empty state cuando no hay leads

### Fase 8 — PQRS

- [ ] 8.1 `PqrsService.listar()`, `cambiarEstado()`, `eliminar()`
- [ ] 8.2 `PqrsComponent` con tabla: columnas, filtros tipo + estado, buscador
- [ ] 8.3 Selector inline de `estado` por fila
- [ ] 8.4 Expansión de descripción (truncada por defecto, expandible al click)
- [ ] 8.5 Botón eliminar → `ConfirmDialog`
- [ ] 8.6 Empty state cuando no hay PQRS

### Fase 9 — FAQs

- [ ] 9.1 `FaqService.listar()`, `editar()`, `toggleActivo()`
- [ ] 9.2 `FaqsComponent` con tabla: pregunta, respuesta truncada, orden, toggle activo
- [ ] 9.3 Toggle activo/inactivo por fila (llamada inmediata al backend)
- [ ] 9.4 Botón editar → `Modal` con form (pregunta + respuesta en textarea)
- [ ] 9.5 Empty state cuando no hay FAQs

### Fase 10 — Pulido final

- [ ] 10.1 Animaciones de entrada suaves en tablas y cards (`transition`, `animate`)
- [ ] 10.2 Skeleton loaders en todas las tablas
- [ ] 10.3 Sidebar colapsable en tablet (≥1024px menú completo, <1024px íconos o drawer)
- [ ] 10.4 Revisión de accesibilidad: `aria-label`, foco visible, contraste WCAG AA
- [ ] 10.5 Configurar `environment.prod.ts` y build de producción `ng build`

---

## Dependencias del backend que deben existir antes de implementar

Estas rutas no existen aún en el backend y son necesarias para el dashboard:

| Endpoint | Prioridad | Tarea backend estimada |
|---|---|---|
| `DELETE /api/leads/:id` | Alta | Agregar route + controller (< 30 min) |
| `DELETE /api/pqrs/:id` | Alta | Agregar route + controller (< 30 min) |
| `GET /api/faqs` | Alta | Agregar route + controller + repo (< 1 h) |
| `PATCH /api/faqs/:id` | Media | Agregar route + controller (< 30 min) |
| `PATCH /api/faqs/:id/activo` | Media | Agregar route + controller (< 30 min) |

---

## Convenciones del proyecto

- Archivos en **kebab-case**: `lead.service.ts`, `stat-card.component.ts`
- Clases en **PascalCase**: `LeadService`, `StatCardComponent`
- Sin comentarios en el código salvo que el WHY no sea obvio
- Un componente = un archivo `.ts` + un archivo `.html` (sin `.css`)
- Signals para estado local; `computed()` para valores derivados
- `inject()` para inyección de dependencias (no constructor injection)
- Sin `any` en TypeScript; tipado estricto activado (`"strict": true`)
