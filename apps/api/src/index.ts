import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { getEnv, requireEnv } from '@guardiboard/config';

const app = express();
const env = getEnv();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Guardiboard API', version: '1.0.0' });
});

const PORT = requireEnv('PORT');

app.listen(PORT, () => {
  console.log(`🚀 Guardiboard API running on port ${PORT}`);
});

export default app;
