import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './authRoutes.js';
import eventRoutes from './eventRoutes.js';
import matchRoutes from './matchRoutes.js';
import uploadRoutes from './uploadRoutes.js';

dotenv.config();

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Use routes
app.use('/', authRoutes);
app.use('/', eventRoutes);
app.use('/', matchRoutes);
app.use('/',uploadRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
