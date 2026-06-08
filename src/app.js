const express = require('express');
const cors = require('cors');
const leadsRoutes = require('./api/routes/leads.routes');
const pqrsRoutes = require('./api/routes/pqrs.routes');
const authRoutes = require('./api/routes/auth.routes');
const statsRoutes = require('./api/routes/stats.routes');
const faqsRoutes = require('./api/routes/faqs.routes');
const clientsRoutes = require('./api/routes/clients.routes');
const errorHandler = require('./api/middlewares/errorHandler.middleware');

const app = express();

app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/pqrs', pqrsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/faqs', faqsRoutes);
app.use('/api/clients', clientsRoutes);

app.use(errorHandler);

module.exports = app;