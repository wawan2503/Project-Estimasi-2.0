import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

const projectPanelSchema = z.object({
  masterPanelId: z.string().uuid().optional().nullable(),
  jenis: z.string().min(1).optional(),
  jumlah: z.coerce.number().int().positive().optional(),
  hargaSatuan: z.coerce.number().nonnegative().optional(),
  hargaAkhir: z.coerce.number().nonnegative().optional(),
  isCustom: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional()
});

function toDb(input) {
  return {
    master_panel_id: input.masterPanelId ?? undefined,
    panel_name: input.jenis ?? undefined,
    qty: input.jumlah ?? undefined,
    unit_price: input.hargaSatuan ?? undefined,
    final_price: input.hargaAkhir ?? undefined,
    is_custom: input.isCustom ?? undefined,
    sort_order: input.sortOrder ?? undefined
  };
}

function fromDb(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    masterPanelId: row.master_panel_id,
    jenis: row.panel_name,
    jumlah: row.qty,
    hargaSatuan: row.unit_price,
    hargaAkhir: row.final_price,
    isCustom: row.is_custom,
    sortOrder: row.sort_order
  };
}

router.patch(
  '/project-panels/:id',
  asyncHandler(async (req, res) => {
    const input = projectPanelSchema.parse(req.body);
    const { data, error } = await supabase
      .from('project_panels')
      .update(toDb(input))
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json({ data: fromDb(data) });
  })
);

router.get(
  '/project-panels/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('project_panels')
      .select('*, project_panel_materials(*)')
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Not found' });

    const panel = {
      id: data.id,
      projectId: data.project_id,
      masterPanelId: data.master_panel_id,
      jenis: data.panel_name,
      jumlah: data.qty,
      hargaSatuan: data.unit_price,
      hargaAkhir: data.final_price,
      isCustom: data.is_custom,
      sortOrder: data.sort_order,
      materials: (data.project_panel_materials ?? []).map((m) => ({
        id: m.id,
        projectPanelId: m.project_panel_id,
        materialId: m.material_id,
        sortOrder: m.sort_order,
        qty: m.qty,
        factor: m.factor,
        diskon: m.discount,
        item: m.item,
        brand: m.brand,
        series: m.series,
        pole: m.pole,
        ka: m.ka,
        ampere: m.ampere,
        detail: m.detail,
        unit: m.unit,
        internationalPrice: m.international_price,
        localPrice: m.local_price,
        currency: m.currency,
        manHour: m.man_hour,
        vendor: m.vendor
      }))
    };

    res.json({ data: panel });
  })
);

router.delete(
  '/project-panels/:id',
  asyncHandler(async (req, res) => {
    const { error } = await supabase.from('project_panels').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.status(204).send();
  })
);

export default router;
