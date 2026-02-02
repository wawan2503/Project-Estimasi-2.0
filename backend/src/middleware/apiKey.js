import { env } from '../config.js';

export function requireApiKey(req, res, next) {
  if (!env.API_KEY) return next();

  const key = req.header('x-api-key');
  if (key && key === env.API_KEY) return next();

  return res.status(401).json({ error: 'Unauthorized' });
}

