const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../../config/env');
const db = require('../../config/database');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const admin = await db('admins').where({ email }).first();

    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, rol: admin.rol },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    res.json({ token, admin: { id: admin.id, email: admin.email, rol: admin.rol } });
  } catch (err) { next(err); }
}

module.exports = { login };