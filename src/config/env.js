const { z } = require('zod');
require('dotenv').config();

const envSchema = z.object({
  PORT:               z.string().default('3000'),
  NODE_ENV:           z.enum(['development', 'production', 'test']).default('development'),
  TELEGRAM_BOT_TOKEN: z.string({ required_error: 'TELEGRAM_BOT_TOKEN es obligatorio' }),
  // Opcional en desarrollo (polling), obligatorio en producción (webhook)
  WEBHOOK_URL:        z.string().optional(),
  DATABASE_URL:       z.string({ required_error: 'DATABASE_URL es obligatorio' }),
  JWT_SECRET:         z.string({ required_error: 'JWT_SECRET es obligatorio' }),
  JWT_EXPIRES_IN:     z.string().default('7d'),
  SMTP_HOST:          z.string().optional(),
  SMTP_PORT:          z.string().default('587'),
  SMTP_USER:          z.string().optional(),
  SMTP_PASS:          z.string().optional(),
  EMAIL_COMERCIAL:    z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas:');
  parsed.error.errors.forEach(e => console.error(` - ${e.path[0]}: ${e.message}`));
  process.exit(1);
}

module.exports = parsed.data;