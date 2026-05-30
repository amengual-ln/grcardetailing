# 🚗 GR Car Detailing — Panel Admin

Panel de gestión de turnos para GR Car Detailing.

## Stack
- **Next.js 15** (App Router) + TypeScript
- **Supabase** (PostgreSQL + Auth)
- **Tailwind CSS**
- **Vercel** (deploy + cron jobs)
- **Twilio** (WhatsApp, próximamente)

---

## Setup inicial

### 1. Clonar y configurar

```bash
git clone https://github.com/tu-usuario/gr-car-detailing
cd gr-car-detailing
npm install
cp .env.example .env.local
```

### 2. Crear proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) → New project
2. Copiá los valores de **Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Pegalos en `.env.local`
4. Abrí **SQL Editor** en Supabase y ejecutá el contenido de `supabase/schema.sql`
   → Esto crea las tablas y carga los servicios iniciales

### 3. Correr local

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

---

## Deploy en Vercel

1. Push a GitHub
2. Importá el repo en [vercel.com](https://vercel.com)
3. Agregá las variables de entorno en **Settings → Environment Variables**
4. Deploy 🚀

El cron de recordatorios corre automáticamente a las 10am (UTC-3) via `vercel.json`.

---

## Documentación

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Arquitectura, issues, roadmap completo
