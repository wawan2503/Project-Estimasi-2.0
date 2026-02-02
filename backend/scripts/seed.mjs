import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in backend/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedFile = process.env.SEED_FILE || path.join(__dirname, 'seedData.json');

async function upsertMany(table, rows, conflictTarget) {
  if (!rows.length) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict: conflictTarget });
  if (error) throw new Error(`${table}: ${error.message}`);
}

async function run() {
  let raw;
  try {
    raw = await fs.readFile(seedFile, 'utf8');
  } catch {
    console.error(`Seed file not found: ${seedFile}`);
    console.error('Copy `backend/scripts/seedData.example.json` to `backend/scripts/seedData.json` (or set SEED_FILE).');
    process.exit(1);
  }

  const seed = JSON.parse(raw);

  const materials = seed.materials || [];
  const productPanels = seed.productPanels || [];
  const customers = seed.customers || [];
  const projects = seed.projects || [];

  console.log('[seed] customers...');
  if (customers.length) {
    const { error } = await supabase.from('customers').insert(customers);
    if (error) console.warn('[seed] customers insert warning:', error.message);
  }

  console.log('[seed] materials...');
  await upsertMany(
    'materials',
    materials.map((m) => ({
      legacy_id: m.legacyId ?? m.id ?? null,
      item: m.item,
      brand: m.brand,
      series: m.series ?? null,
      pole: m.pole ?? null,
      ka: m.ka ?? null,
      ampere: m.ampere ?? null,
      detail: m.detail ?? null,
      unit: m.unit ?? 'UNIT',
      international_price: m.internationalPrice ?? 0,
      local_price: m.localPrice ?? 0,
      currency: m.currency ?? 'IDR',
      man_hour: m.manHour ?? 0,
      vendor: m.vendor ?? null
    })),
    'legacy_id'
  );

  console.log('[seed] product panels...');
  await upsertMany(
    'product_panels',
    productPanels.map((p) => ({
      legacy_id: p.legacyId ?? p.id ?? null,
      name: p.name,
      base_price: p.price ?? 0
    })),
    'legacy_id'
  );

  const { data: dbPanels, error: panelsErr } = await supabase.from('product_panels').select('id, legacy_id');
  if (panelsErr) throw new Error(panelsErr.message);
  const panelIdByLegacy = new Map((dbPanels ?? []).map((p) => [p.legacy_id, p.id]));

  console.log('[seed] product panel materials...');
  const ppmRows = [];
  for (const p of productPanels) {
    const panelId = panelIdByLegacy.get(p.legacyId ?? p.id ?? null);
    if (!panelId) continue;
    (p.defaultMaterials ?? []).forEach((mat, idx) => {
      ppmRows.push({
        panel_id: panelId,
        sort_order: idx,
        qty: mat.qty ?? 1,
        factor: mat.factor ?? 1,
        discount: mat.diskon ?? 0,
        item: mat.item ?? null,
        brand: mat.brand ?? null,
        series: mat.series ?? null,
        pole: mat.pole ?? null,
        ka: mat.ka ?? null,
        ampere: mat.ampere ?? null,
        detail: mat.detail ?? null,
        unit: mat.unit ?? null,
        international_price: mat.internationalPrice ?? 0,
        local_price: mat.localPrice ?? 0,
        currency: mat.currency ?? 'IDR',
        man_hour: mat.manHour ?? 0,
        vendor: mat.vendor ?? null
      });
    });
  }
  if (ppmRows.length) {
    const { error } = await supabase.from('product_panel_materials').insert(ppmRows);
    if (error) console.warn('[seed] product_panel_materials insert warning:', error.message);
  }

  console.log('[seed] projects...');
  for (const pj of projects) {
    const { data: projectRow, error: projectErr } = await supabase
      .from('projects')
      .upsert(
        {
          job_no: pj.jobNo,
          name: pj.namaProject,
          customer_name: pj.customer ?? null,
          creator: pj.pembuat ?? null,
          additional_costs: pj.additionalCosts ?? {},
          last_edit_at: new Date().toISOString()
        },
        { onConflict: 'job_no' }
      )
      .select('*')
      .single();
    if (projectErr) throw new Error(projectErr.message);

    for (const [panelIdx, panel] of (pj.details ?? []).entries()) {
      const { data: panelRow, error: panelErr } = await supabase
        .from('project_panels')
        .insert({
          project_id: projectRow.id,
          sort_order: panelIdx,
          panel_name: panel.jenis,
          qty: panel.jumlah ?? 1,
          unit_price: panel.hargaSatuan ?? 0,
          final_price: panel.hargaAkhir ?? 0,
          is_custom: !!panel.isCustom
        })
        .select('*')
        .single();
      if (panelErr) throw new Error(panelErr.message);

      const matRows = (panel.materials ?? []).map((m, idx) => ({
        project_panel_id: panelRow.id,
        sort_order: idx,
        qty: m.qty ?? 1,
        factor: m.factor ?? 1,
        discount: m.diskon ?? 0,
        item: m.item ?? null,
        brand: m.brand ?? null,
        series: m.series ?? null,
        pole: m.pole ?? null,
        ka: m.ka ?? null,
        ampere: m.ampere ?? null,
        detail: m.detail ?? null,
        unit: m.unit ?? null,
        international_price: m.internationalPrice ?? 0,
        local_price: m.localPrice ?? 0,
        currency: m.currency ?? 'IDR',
        man_hour: m.manHour ?? 0,
        vendor: m.vendor ?? null
      }));
      if (matRows.length) {
        const { error: matsErr } = await supabase.from('project_panel_materials').insert(matRows);
        if (matsErr) throw new Error(matsErr.message);
      }
    }
  }

  console.log('[seed] done');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

