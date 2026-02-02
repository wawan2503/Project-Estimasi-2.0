import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

const productPanelSchema = z.object({
  legacyId: z.string().optional(),
  name: z.string().min(1),
  price: z.coerce.number().nonnegative().optional().default(0)
});

const panelMaterialSchema = z.object({
  materialId: z.string().uuid().optional().nullable(),
  sortOrder: z.coerce.number().int().optional().default(0),
  qty: z.coerce.number().positive().optional().default(1),
  factor: z.coerce.number().positive().optional().default(1),
  diskon: z.coerce.number().min(0).max(100).optional().default(0),

  item: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  series: z.string().optional().nullable(),
  pole: z.string().optional().nullable(),
  ka: z.string().optional().nullable(),
  ampere: z.string().optional().nullable(),
  detail: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  internationalPrice: z.coerce.number().nonnegative().optional().default(0),
  localPrice: z.coerce.number().nonnegative().optional().default(0),
  currency: z.enum(['IDR', 'USD']).optional().default('IDR'),
  manHour: z.coerce.number().nonnegative().optional().default(0),
  vendor: z.string().optional().nullable()
});

function fromDbPanel(row) {
  return {
    id: row.id,
    legacyId: row.legacy_id,
    name: row.name,
    price: row.base_price,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toDbPanel(input) {
  return {
    legacy_id: input.legacyId ?? null,
    name: input.name,
    base_price: input.price ?? 0
  };
}

function fromDbPanelMaterial(row) {
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

function toDbPanelMaterial(input, panelId) {
  return {
    panel_id: panelId,
    material_id: input.materialId ?? null,
    sort_order: input.sortOrder ?? 0,
    qty: input.qty ?? 1,
    factor: input.factor ?? 1,
    discount: input.diskon ?? 0,
    item: input.item ?? null,
    brand: input.brand ?? null,
    series: input.series ?? null,
    pole: input.pole ?? null,
    ka: input.ka ?? null,
    ampere: input.ampere ?? null,
    detail: input.detail ?? null,
    unit: input.unit ?? null,
    international_price: input.internationalPrice ?? 0,
    local_price: input.localPrice ?? 0,
    currency: input.currency ?? 'IDR',
    man_hour: input.manHour ?? 0,
    vendor: input.vendor ?? null
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const includeMaterials = (req.query.includeMaterials ?? '0').toString() === '1';
    const q = (req.query.q ?? '').toString().trim();

    let select = '*';
    if (includeMaterials) select = '*, product_panel_materials(*)';

    let query = supabase.from('product_panels').select(select).order('updated_at', { ascending: false });
    if (q) {
      const like = `%${q.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`;
      query = query.ilike('name', like);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const panels = (data ?? []).map((row) => {
      const base = fromDbPanel(row);
      if (!includeMaterials) return base;
      return {
        ...base,
        defaultMaterials: (row.product_panel_materials ?? []).map(fromDbPanelMaterial).sort((a, b) => a.sortOrder - b.sortOrder)
      };
    });

    res.json({ data: panels });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('product_panels')
      .select('*, product_panel_materials(*)')
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Not found' });

    res.json({
      data: {
        ...fromDbPanel(data),
        defaultMaterials: (data.product_panel_materials ?? []).map(fromDbPanelMaterial).sort((a, b) => a.sortOrder - b.sortOrder)
      }
    });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = productPanelSchema.parse(req.body);
    const { data, error } = await supabase.from('product_panels').insert(toDbPanel(input)).select('*').single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ data: fromDbPanel(data) });
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const input = productPanelSchema.partial().parse(req.body);
    const { data, error } = await supabase
      .from('product_panels')
      .update(toDbPanel(input))
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json({ data: fromDbPanel(data) });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { error } = await supabase.from('product_panels').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.status(204).send();
  })
);

router.post(
  '/:id/materials',
  asyncHandler(async (req, res) => {
    const input = panelMaterialSchema.parse(req.body);
    const { data, error } = await supabase
      .from('product_panel_materials')
      .insert(toDbPanelMaterial(input, req.params.id))
      .select('*')
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ data: fromDbPanelMaterial(data) });
  })
);

export default router;

