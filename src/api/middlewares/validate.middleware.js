function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Datos inválidos',
        detalles: result.error.errors.map(e => ({ campo: e.path[0], mensaje: e.message })),
      });
    }
    req.body = result.data;
    next();
  };
}

module.exports = validate;