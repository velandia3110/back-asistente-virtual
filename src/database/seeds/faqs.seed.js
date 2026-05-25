exports.seed = async function (knex) {
  await knex('faqs').del();
  await knex('faqs').insert([
    { pregunta: '¿Qué tipos de grúas tienen disponibles?', respuesta: 'Contamos con grúas telescópicas de 30, 50, 80 y 120 toneladas para diferentes tipos de izaje industrial.', orden: 1, activo: true },
    { pregunta: '¿Cuál es el área de cobertura?', respuesta: 'Operamos en todo el territorio colombiano, con base principal en Sogamoso, Boyacá.', orden: 2, activo: true },
    { pregunta: '¿Cuánto tiempo tarda la cotización?', respuesta: 'Una vez recibida tu solicitud completa, nuestro equipo te contacta en máximo 2 horas hábiles.', orden: 3, activo: true },
    { pregunta: '¿Trabajan fines de semana?', respuesta: 'Sí, atendemos emergencias los 7 días de la semana. El bot está disponible las 24 horas.', orden: 4, activo: true },
    { pregunta: '¿Requieren visita técnica previa?', respuesta: 'Para izajes complejos o de gran envergadura, recomendamos una visita técnica previa sin costo.', orden: 5, activo: true },
  ]);
};