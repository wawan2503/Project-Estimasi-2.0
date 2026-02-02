import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

const projectSchema = z.object({
  legacyId: z.string().optional(),
  jobNo: z.string().min(1),
  namaProject: z.string().min(1),
  customer: z.string().optional().nullable(),
  customerId: z.string().uuid().optional().nullable(),
  pembuat: z.string().optional().nullable(),
  additionalCosts: z.record(z.string(), z.union([z.number(), z.string()])).optional()
});

const projectPanelSchema = z.object({
  masterPanelId: z.string().uuid().optional().nullable(),
  jenis: z.string().min(1),
  jumlah: z.coerce.number().int().positive().optional().default(1),
  hargaSatuan: z.coerce.number().nonnegative().optional().default(0),
  hargaAkhir: z.coerce.number().nonnegative().optional().default(0),
  isCustom: z.boolean().optional().default(false),
  sortOrder: z.coerce.number().int().optional().default(0)
});

function toDbProject(input) {
  return {
    legacy_id: input.legacyId ?? null,
    job_no: input.jobNo,
    name: input.namaProject,
    customer_id: input.customerId ?? null,
    customer_name: input.customer ?? null,
    creator: input.pembuat ?? null,
    additional_costs: input.additionalCosts ?? undefined,
    last_edit_at: new Date().toISOString()
  };
}

function fromDbProject(row) {
  return {
    id: row.id,
    legacyId: row.legacy_id,
    jobNo: row.job_no,
    namaProject: row.name,
    customer: row.customer_name,
    customerId: row.customer_id,
    pembuat: row.creator,
    additionalCosts: row.additional_costs ?? {},
    lastEditAt: row.last_edit_at ?? row.updated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toDbProjectPanel(input, projectId) {
  return {
    project_id: projectId,
    master_panel_id: input.masterPanelId ?? null,
    sort_order: input.sortOrder ?? 0,
    panel_name: input.jenis,
    qty: input.jumlah ?? 1,
    unit_price: input.hargaSatuan ?? 0,
    final_price: input.hargaAkhir ?? 0,
    is_custom: input.isCustom ?? false
  };
}

function fromDbProjectPanel(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    masterPanelId: row.master_panel_id,
    jenis: row.panel_name,
    jumlah: row.qty,
    hargaSatuan: row.unit_price,
    hargaAkhir: row.final_price,
    isCustom: row.is_custom,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function fromDbProjectPanelMaterial(row) {
  return {
    id: row.id,
    projectPanelId: row.project_panel_id,
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

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = (req.query.q ?? '').toString().trim();
    const includeDetails = (req.query.includeDetails ?? '0').toString() === '1';
    const select = includeDetails ? '*, project_panels(*, project_panel_materials(*))' : '*';
    let query = supabase.from('projects').select(select).order('updated_at', { ascending: false });
    if (q) {
      const like = `%${q.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`;
      query = query.or([`job_no.ilike.${like}`, `name.ilike.${like}`, `customer_name.ilike.${like}`].join(','));
    }
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    if (!includeDetails) return res.json({ data: (data ?? []).map(fromDbProject) });

    const projects = (data ?? []).map((p) => {
      const panels = (p.project_panels ?? [])
        .map((row) => ({
          ...fromDbProjectPanel(row),
          materials: (row.project_panel_materials ?? []).map(fromDbProjectPanelMaterial).sort((a, b) => a.sortOrder - b.sortOrder)
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder);
      return { ...fromDbProject(p), details: panels };
    });

    return res.json({ data: projects });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*, project_panels(*, project_panel_materials(*))')
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Not found' });

    const panels = (data.project_panels ?? [])
      .map((p) => {
        const base = fromDbProjectPanel(p);
        return {
          ...base,
          materials: (p.project_panel_materials ?? []).map(fromDbProjectPanelMaterial).sort((a, b) => a.sortOrder - b.sortOrder)
        };
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);

    res.json({
      data: {
        ...fromDbProject(data),
        details: panels
      }
    });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = projectSchema.parse(req.body);
    const { data, error } = await supabase.from('projects').insert(toDbProject(input)).select('*').single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ data: fromDbProject(data) });
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const input = projectSchema.partial().parse(req.body);
    const { data, error } = await supabase
      .from('projects')
      .update(toDbProject(input))
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json({ data: fromDbProject(data) });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { error } = await supabase.from('projects').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.status(204).send();
  })
);

router.post(
  '/:id/panels',
  asyncHandler(async (req, res) => {
    const input = projectPanelSchema.parse(req.body);
    const { data, error } = await supabase
      .from('project_panels')
      .insert(toDbProjectPanel(input, req.params.id))
      .select('*')
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ data: fromDbProjectPanel(data) });
  })
);

export default router;
