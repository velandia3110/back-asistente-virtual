const { z } = require('zod');

// ── Helpers reutilizables ────────────────────────────────────────────────────

/**
 * Limpia y parsea un número positivo.
 * Acepta coma o punto como separador decimal.
 * Retorna el número o null si es inválido.
 */
function parsePositiveNumber(input) {
  if (!input || typeof input !== 'string') return null;
  const clean = input.trim().replace(',', '.');
  const num = parseFloat(clean);
  if (isNaN(num) || num <= 0) return null;
  return num;
}

/**
 * Valida teléfono colombiano.
 * Acepta: 3001234567 o +573001234567 o 573001234567
 * Retorna los 10 dígitos limpios o null.
 */
function parsePhone(input) {
  if (!input || typeof input !== 'string') return null;
  const digits = input.trim().replace(/[\s\-\(\)\.]/g, '');
  const match = digits.match(/^(?:\+?57)?([3]\d{9})$/);
  return match ? match[1] : null;
}

/**
 * Valida email básico. Retorna email en minúsculas o null.
 */
function parseEmail(input) {
  if (!input || typeof input !== 'string') return null;
  const email = input.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

/**
 * Valida texto libre con longitud mínima y máxima.
 * Retorna el texto limpio o null.
 */
function parseText(input, min = 2, max = 500) {
  if (!input || typeof input !== 'string') return null;
  const text = input.trim();
  if (text.length < min || text.length > max) return null;
  return text;
}

// ── Esquemas Zod (para validación de objetos completos antes de guardar) ─────

const leadSchema = z.object({
  nombre:     z.string().min(2,  'El nombre es muy corto'),
  telefono:   z.string().length(10, 'Teléfono inválido'),
  tipo_carga: z.enum(['industrial', 'comercial', 'residencial', 'otro']),
  peso_kg:    z.number().positive('El peso debe ser mayor a 0'),
  altura_m:   z.number().positive('La altura debe ser mayor a 0'),
  radio_m:    z.number().positive('El radio debe ser mayor a 0'),
  ubicacion:  z.string().min(5,  'La ubicación es muy corta'),
});

const pqrsSchema = z.object({
  tipo:        z.enum(['peticion', 'queja', 'reclamo', 'sugerencia']),
  descripcion: z.string().min(10, 'La descripción es muy corta'),
  nombre:      z.string().min(2,  'El nombre es muy corto'),
  telefono:    z.string().length(10, 'Teléfono inválido'),
  email:       z.string().email().optional(),
});

function validateLead(data) {
  return leadSchema.safeParse(data);
}

function validatePqrs(data) {
  return pqrsSchema.safeParse(data);
}

module.exports = {
  parsePositiveNumber,
  parsePhone,
  parseEmail,
  parseText,
  validateLead,
  validatePqrs,
};