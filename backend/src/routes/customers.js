import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

const customerSchema = z.object({
  name: z.string().min(1),
  contact: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  type: z.string().optional().default('Corporate')
});

function toDbCustomer(input) {
  return {
    name: input.name,
    contact: input.contact ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    address: input.address ?? null,
    type: input.type ?? 'Corporate'
  };
}

function fromDbCustomer(row) {
  return {
    id: row.id,
    name: row.name,
    contact: row.contact,
    phone: row.phone,
    email: row.email,
    address: row.address,
    type: row.type,
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
      .from('customers')
      .select('*', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (q) {
      const like = `%${q.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`;
      query = query.or(
        [
          `name.ilike.${like}`,
          `contact.ilike.${like}`,
          `email.ilike.${like}`,
          `address.ilike.${like}`,
          `phone.ilike.${like}`
        ].join(',')
      );
    }

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json({ data: (data ?? []).map(fromDbCustomer), count: count ?? 0, limit, offset });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase.from('customers').select('*').eq('id', req.params.id).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json({ data: fromDbCustomer(data) });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = customerSchema.parse(req.body);
    const { data, error } = await supabase.from('customers').insert(toDbCustomer(input)).select('*').single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ data: fromDbCustomer(data) });
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const input = customerSchema.partial().parse(req.body);
    const { data, error } = await supabase
      .from('customers')
      .update(toDbCustomer(input))
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json({ data: fromDbCustomer(data) });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { error } = await supabase.from('customers').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.status(204).send();
  })
);

export default router;

