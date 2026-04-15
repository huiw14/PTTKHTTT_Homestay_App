import depositRoutes from './deposits.js';

export default function routes(app) {
  app.use('/api/deposits', depositRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
  });
}
