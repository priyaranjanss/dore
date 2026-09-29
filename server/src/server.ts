import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chats';

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') });

const app = express();

connectDB();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
