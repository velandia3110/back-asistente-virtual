const { z } = require('zod');

const leadSchema = z.object({
  nombre: z.string().min(2, 'El nombre es muy corto'),
  telefono: z.string().min(7, 'Teléfono inválido'),
  tipo_carga: z.enum(['industrial', 'comercial', 'residencial', 'otro']),
  peso_kg: z.number().positive('El peso debe ser mayor a 0'),
  altura_m: z.number().positive('La altura debe ser mayor a 0'),
  radio_m: z.number().positive('El radio debe ser mayor a 0'),
  ubicacion: z.string().min(5, 'La ubicación es muy corta'),
});

const pqrsSchema = z.object({
  tipo: z.enum(['peticion', 'queja', 'reclamo', 'sugerencia']),
  descripcion: z.string().min(10, 'La descripción es muy corta'),
  client_id: z.string().uuid(),
});

function validateLead(data) {
  return leadSchema.safeParse(data);
}

function validatePqrs(data) {
  return pqrsSchema.safeParse(data);
}

module.exports = { validateLead, validatePqrs };