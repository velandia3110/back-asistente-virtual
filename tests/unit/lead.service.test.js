jest.mock('../src/repositories/lead.repo');
jest.mock('../src/services/notification.service');

const leadService = require('../src/services/lead.service');
const leadRepo = require('../src/repositories/lead.repo');

const leadValido = {
  nombre: 'Juan Pérez', telefono: '3001234567',
  tipo_carga: 'industrial', peso_kg: 5000,
  altura_m: 20, radio_m: 15, ubicacion: 'Sogamoso', telegram_id: '123456',
};

beforeEach(() => jest.clearAllMocks());

test('crea un lead válido correctamente', async () => {
  leadRepo.buscarClientePorTelegram.mockResolvedValue(null);
  leadRepo.crearCliente.mockResolvedValue({ id_client: 'uuid-1', ...leadValido });
  leadRepo.crearCotizacion.mockResolvedValue({ id_quote: 'uuid-2' });

  const result = await leadService.crear(leadValido);
  expect(result.id_quote).toBe('uuid-2');
  expect(leadRepo.crearCliente).toHaveBeenCalledTimes(1);
});

test('lanza error si faltan campos obligatorios', async () => {
  await expect(leadService.crear({ nombre: 'Juan' })).rejects.toThrow('Datos de lead inválidos');
});