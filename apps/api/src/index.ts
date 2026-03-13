import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requireEnv } from '@guardiboard/config';

import authRouter from './routes/auth';
import tenantsRouter from './routes/tenants';
import connectorsRouter from './routes/connectors';
import findingsRouter from './routes/findings';
import dashboardsRouter from './routes/dashboards';
import postureRouter from './routes/posture';
import assetsRouter from './routes/assets';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Guardiboard API', version: '1.0.0' });
});

app.use('/api/auth', authRouter);
app.use('/api/tenants', tenantsRouter);
app.use('/api/connectors', connectorsRouter);
app.use('/api/findings', findingsRouter);
app.use('/api/dashboards', dashboardsRouter);
app.use('/api/posture', postureRouter);
app.use('/api/assets', assetsRouter);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = requireEnv('PORT');

app.listen(PORT, () => {
  console.log(`🚀 Guardiboard API running on port ${PORT}`);
});

export default app;
