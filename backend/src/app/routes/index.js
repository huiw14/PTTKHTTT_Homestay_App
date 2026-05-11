import depositRoutes from './deposits.js';
import customerRoutes from './customers.js';
import memberRoutes from './members.js';
import requestRoutes from './requests.js';
import appointmentRoutes from './appointments.js';
import roomRoutes from './rooms.js';
import branchRoutes from './branches.js';
import employeeRoutes from './employees.js';
import servicesRoutes from './services.js';
import contractsRouter from '../../routes/contracts.routes.js';
import authRouter from '../../routes/auth.routes.js';
import catalogsRouter from '../../routes/catalogs.routes.js';

export default function routes(app) {
  app.use('/api/deposits', depositRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/members', memberRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/rooms', roomRoutes);
  app.use('/api/branches', branchRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/services', servicesRoutes);
  app.use('/api/contracts', contractsRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/catalog', catalogsRouter);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
  });
}
