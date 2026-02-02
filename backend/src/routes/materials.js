import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

const materialSchema = z.object({
  legacyId: z.string().optional(),
  item: z.string().min(1),
  brand: z.string().min(1),
  series: z.string().optional().nullable(),
  pole: z.string().optional().nullable(),
  ka: z.string().optional().nullable(),
  ampere: z.string().optional().nullable(),
  detail: z.string().optional().nullable(),
  unit: z.string().optional().default('UNIT'),
  internationalPrice: z.coerce.number().nonnegative().optional().default(0),
  localPrice: z.coerce.number().nonnegative().optional().default(0),
  currency: z.enum(['IDR', 'USD']).optional().default('IDR'),
  manHour: z.coerce.number().nonnegative().optional().default(0),
  vendor: z.string().optional().nullable()
});

function toDbMaterial(input) {
  return {
    legacy_id: input.legacyId ?? null,
    item: input.item,
    brand: input.brand,
    series: input.series ?? null,
    pole: input.pole ?? null,
    ka: input.ka ?? null,
    ampere: input.ampere ?? null,
    detail: input.detail ?? null,
    unit: input.unit ?? 'UNIT',
    international_price: input.internationalPrice ?? 0,
    local_price: input.localPrice ?? 0,
    currency: input.currency ?? 'IDR',
    man_hour: input.manHour ?? 0,
    vendor: input.vendor ?? null
  };
}

function fromDbMaterial(row) {
  return {
    id: row.id,
    legacyId: row.legacy_id,
    item: row.item,
    brand: row.brand,
    series: row.series,
    pole: row.pole,
    ka: row.ka,
    ampere: row.ampere,
    detail: row.detail,
    unit: row.unit,
    internationalPrice: row.international_price,
    localPrice: row.local_price,
    currency: row.currency,
    manHour: row.man_hour,
    vendor: row.vendor,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = (req.query.q ?? '').toString().trim();
    const limit = Math.min(parseInt(req.query.limit ?? '100', 10) || 100, 500);
    const offset = Math.max(parseInt(req.query.offset ?? '0', 10) || 0, 0);

    let query = supabase
      .from('materials')
      .select('*', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (q) {
      const like = `%${q.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`;
      query = query.or(
        [
          `item.ilike.${like}`,
          `brand.ilike.${like}`,
          `series.ilike.${like}`,
          `detail.ilike.${like}`,
          `vendor.ilike.${like}`
        ].join(',')
      );
    }

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });

    res.json({ data: (data ?? []).map(fromDbMaterial), count: count ?? 0, limit, offset });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase.from('materials').select('*').eq('id', req.params.id).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json({ data: fromDbMaterial(data) });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = materialSchema.parse(req.body);
    const { data, error } = await supabase.from('materials').insert(toDbMaterial(input)).select('*').single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ data: fromDbMaterial(data) });
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const input = materialSchema.partial().parse(req.body);
    const { data, error } = await supabase
      .from('materials')
      .update(toDbMaterial(input))
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json({ data: fromDbMaterial(data) });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { error } = await supabase.from('materials').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.status(204).send();
  })
);

export default router;

