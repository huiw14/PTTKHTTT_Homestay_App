import express from 'express';
import route from './routes/index.js';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import { startDepositAutoCancelCron } from './services/depositAutoCancelCron.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS
// During local development allow all origins so Vite HMR and different dev hosts work.
app.use(cors({ origin: true, credentials: true }));

// Morgan
app.use(morgan('dev'));

// Parser JSON
app.use(bodyParser.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

route(app);

// Initialize deposit auto-cancel cron job (runs every 5 minutes)
// Disabled temporarily due to Supabase connection issue
// startDepositAutoCancelCron();

// Error handling
//app.use(notFound);
//app.use(errorHandler);

export default app;
