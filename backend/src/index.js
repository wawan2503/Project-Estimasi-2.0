import cors from 'cors';
import express from 'express';
import { env, getCorsOrigins } from './config.js';
import { requireApiKey } from './middleware/apiKey.js';

import materialsRouter from './routes/materials.js';
import customersRouter from './routes/customers.js';
import productPanelsRouter from './routes/productPanels.js';
import productPanelMaterialsRouter from './routes/productPanelMaterials.js';
import projectsRouter from './routes/projects.js';
import projectPanelsRouter from './routes/projectPanels.js';
import projectPanelMaterialsRouter from './routes/projectPanelMaterials.js';
import dbHealthRouter from './routes/dbHealth.js';

const app = express();

app.use(express.json({ limit: '2mb' }));

const origins = getCorsOrigins();
app.use(
  cors({
    origin: origins === '*' ? true : origins,
    credentials: true
  })
);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api', requireApiKey);
app.use('/api/materials', materialsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/product-panels', productPanelsRouter);
app.use('/api', productPanelMaterialsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api', projectPanelsRouter);
app.use('/api', projectPanelMaterialsRouter);
app.use('/api/db', dbHealthRouter);

app.use((err, _req, res, _next) => {
  if (err?.name === 'ZodError') {
    return res.status(400).json({ error: 'Validation error', details: err.issues });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
});

app.listen(env.PORT, () => {
  console.log(`[backend] listening on http://localhost:${env.PORT}`);
});
