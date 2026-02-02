# Backend (Node.js + Supabase Postgres)

Backend REST API untuk data **Materials**, **Product Panels**, **Projects**, dan **Customers**. Storage pakai **Supabase (Postgres)**.

## 1) Setup Supabase

1. Buat project di Supabase.
2. Buka **SQL Editor** → jalankan file: `backend/supabase/schema.sql`.

## 2) Setup environment

1. Copy `backend/.env.example` → `backend/.env`
2. Isi:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only, jangan taruh di frontend)

## 3) Run server

```bash
cd backend
npm install
npm run dev
```

Server jalan di `http://localhost:3001`.

## 4) (Opsional) Seed dari mock data frontend

```bash
cd backend
npm run seed
```

Seed membaca file `backend/scripts/seedData.json` (buat dari `backend/scripts/seedData.example.json`), atau set `SEED_FILE` untuk path custom.

## 5) Endpoint ringkas

- `GET /health`
- `GET/POST/PATCH/DELETE /api/materials`
- `GET/POST/PATCH/DELETE /api/customers`
- `GET/POST/PATCH/DELETE /api/product-panels`
- `POST /api/product-panels/:id/materials`
- `PATCH/DELETE /api/product-panel-materials/:id`
- `GET/POST/PATCH/DELETE /api/projects`
- `POST /api/projects/:id/panels`
- `PATCH/DELETE /api/project-panels/:id`
- `POST /api/project-panels/:id/materials`
- `PATCH/DELETE /api/project-panel-materials/:id`
