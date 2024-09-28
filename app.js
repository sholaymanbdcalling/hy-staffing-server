import express from 'express';
const app = new express();
import mongoose from 'mongoose';
import router from './src/router/api.js';

//middlewares
import cors from 'cors';
import hpp from 'hpp';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(hpp());
app.use(helmet());
app.use(mongoSanitize());
app.use(limiter);

//route connect
app.use('/api/v1', router);

//404 route
app.all('*', (req, res) => {
  res.status(404).json({ status: '404 error', message: 'not found' });
});

export default app;
