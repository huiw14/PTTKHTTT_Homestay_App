import depositRoutes from './deposits.js';
import customerRoutes from './customers.js';

export default function routes(app) {
  app.use('/api/deposits', depositRoutes);
  app.use('/api/customers', customerRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
  });
}
