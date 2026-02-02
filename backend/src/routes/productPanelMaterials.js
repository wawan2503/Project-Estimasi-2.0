import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

const panelMaterialSchema = z.object({
  materialId: z.string().uuid().optional().nullable(),
  sortOrder: z.coerce.number().int().optional(),
  qty: z.coerce.number().positive().optional(),
  factor: z.coerce.number().positive().optional(),
  diskon: z.coerce.number().min(0).max(100).optional(),

  item: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  series: z.string().optional().nullable(),
  pole: z.string().optional().nullable(),
  ka: z.string().optional().nullable(),
  ampere: z.string().optional().nullable(),
  detail: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  internationalPrice: z.coerce.number().nonnegative().optional(),
  localPrice: z.coerce.number().nonnegative().optional(),
  currency: z.enum(['IDR', 'USD']).optional(),
  manHour: z.coerce.number().nonnegative().optional(),
  vendor: z.string().optional().nullable()
});

function toDb(input) {
  return {
    material_id: input.materialId ?? undefined,
    sort_order: input.sortOrder ?? undefined,
    qty: input.qty ?? undefined,
    factor: input.factor ?? undefined,
    discount: input.diskon ?? undefined,
    item: input.item ?? undefined,
    brand: input.brand ?? undefined,
    series: input.series ?? undefined,
    pole: input.pole ?? undefined,
    ka: input.ka ?? undefined,
    ampere: input.ampere ?? undefined,
    detail: input.detail ?? undefined,
    unit: input.unit ?? undefined,
    international_price: input.internationalPrice ?? undefined,
    local_price: input.localPrice ?? undefined,
    currency: input.currency ?? undefined,
    man_hour: input.manHour ?? undefined,
    vendor: input.vendor ?? undefined
  };
}

function fromDb(row) {
  return {
    id: row.id,
    panelId: row.panel_id,
    materialId: row.material_id,
    sortOrder: row.sort_order,
    qty: row.qty,
    factor: row.factor,
    diskon: row.discount,
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
    vendor: row.vendor
  };
}

router.patch(
  '/product-panel-materials/:id',
  asyncHandler(async (req, res) => {
    const input = panelMaterialSchema.parse(req.body);
    const { data, error } = await supabase
      .from('product_panel_materials')
      .update(toDb(input))
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json({ data: fromDb(data) });
  })
);

router.delete(
  '/product-panel-materials/:id',
  asyncHandler(async (req, res) => {
    const { error } = await supabase.from('product_panel_materials').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.status(204).send();
  })
);

export default router;

