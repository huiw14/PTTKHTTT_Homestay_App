import depositRoutes from './deposits.js';
import customerRoutes from './customers.js';
import requestRoutes from './requests.js';
import appointmentRoutes from './appointments.js';
import roomRoutes from './rooms.js';

export default function routes(app) {
  app.use('/api/deposits', depositRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/rooms', roomRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
  });
}
