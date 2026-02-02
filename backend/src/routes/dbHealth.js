import { Router } from 'express';
import { env } from '../config.js';
import { supabase } from '../supabase.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

router.get(
  '/health',
  asyncHandler(async (_req, res) => {
    const result = {
      ok: false,
      supabaseUrl: env.SUPABASE_URL,
      schemaOk: false
    };

    const { error } = await supabase.from('materials').select('id').limit(1);
    if (!error) {
      result.ok = true;
      result.schemaOk = true;
      return res.json(result);
    }

    // Connected to Supabase, but schema/table might not exist yet.
    result.ok = true;
    result.schemaOk = false;
    return res.status(200).json({ ...result, error: error.message });
  })
);

export default router;

