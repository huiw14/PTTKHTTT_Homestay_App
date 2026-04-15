import express from 'express';
import route from '../routes/index.js';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from "cors";
//import notFound from './middlewares/notFound.js';
//import errorHandler from './middlewares/errorHandler.js';

const app = express();

// CORS
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true, // nếu bạn có cookie / auth
}));

// Morgan
app.use(morgan('dev'));

// Parser JSON
app.use(bodyParser.json());

route(app);

// Error handling
//app.use(notFound);
//app.use(errorHandler);

export default app;
