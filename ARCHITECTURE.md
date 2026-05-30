# Architecture

## Stack
Next.js 16 (App Router) + TypeScript + Supabase + Tailwind CSS v4 + Vercel + Twilio

## Project Structure

```
gr-car-detailing/
├── app/
│   ├── (dashboard)/
│   │   ├── agenda/page.tsx      # Weekly calendar
│   │   ├── clientes/page.tsx   # Client list
│   │   ├── servicios/page.tsx   # Service catalog
│   │   └── layout.tsx           # Sidebar + main
│   ├── api/recordatorios/      # Vercel cron endpoint
│   ├── globals.css              # Tailwind v4 + --red theme
│   ├── layout.tsx               # Root layout (fonts, PWA)
│   └── page.tsx                 # Redirects / → /agenda
├── components/
│   ├── agenda/
│   │   ├── AgendaView.tsx       # Weekly calendar (client)
│   │   ├── TurnoModal.tsx       # New appointment form
│   │   └── TurnoDetalle.tsx     # View/update appointment
│   ├── layout/Sidebar.tsx       # Navigation
│   └── ui/                      # Avatar, Badge, Button
├── lib/
│   ├── actions/
│   │   ├── clientes.ts          # getClientes, buscarOCrearCliente, getClienteConHistorial
│   │   ├── servicios.ts          # getServicios, actualizarServicio
│   │   └── turnos.ts             # getTurnos, crearTurno, actualizarEstado, eliminarTurno
│   ├── database.types.ts         # Supabase types + aliases
│   ├── supabase.ts               # Anon + service role clients
│   ├── whatsapp.ts               # Twilio reminder sender
│   ├── constants.ts              # Default services, TAMAÑOS_AUTO, ESTADOS_TURNO
│   └── utils.ts                  # Date helpers, cn(), formatters
├── supabase/schema.sql           # PostgreSQL schema + seed
└── vercel.json                   # Cron config
```

## Routes

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Page | Redirects to `/agenda` |
| `/agenda` | Dynamic | Weekly appointment calendar |
| `/clientes` | Dynamic | Client list with visit stats |
| `/servicios` | Dynamic | Service catalog with prices |
| `/api/recordatorios` | API Route | Vercel cron: sends WhatsApp reminders |

## Components

| Component | Type | Purpose |
|-----------|------|---------|
| `AgendaView` | Client | Weekly calendar grid, manages modals |
| `TurnoModal` | Client | Create new appointment |
| `TurnoDetalle` | Client | View details, change state |
| `Sidebar` | Client | Navigation with active state |
| `Avatar` | Pure | Initials-based avatar |
| `Badge` | Pure | EstadoBadge (colored state pill) |
| `Button` | Pure | Variants: primary (red), ghost, danger |

## Server Actions

| Action | Purpose |
|--------|---------|
| `getClientes()` | List all clients |
| `buscarOCrearCliente(nombre, telefono, email?)` | Find by phone or create |
| `getClienteConHistorial(clienteId)` | Client + appointment history |
| `getServicios()` | List active services |
| `actualizarServicio(id, updates)` | Update service price/duration |
| `getTurnos(fechaDesde?, fechaHasta?)` | List appointments with relations |
| `crearTurno(payload)` | Create appointment |
| `actualizarEstado(turnoId, estado)` | Change state |
| `eliminarTurno(turnoId)` | Delete appointment |

## Database Schema

**Tables:**
- `clientes`: `id, created_at, nombre, telefono, email, notas`
- `servicios`: `id, created_at, nombre, duracion_minutos, precio_base, descripcion, activo`
- `turnos`: `id, created_at, cliente_id, servicio_id, fecha, hora, estado, auto_modelo, auto_tamaño, notas, recordatorio_enviado`

**Enums:** `estado_turno` (pendiente/confirmado/cancelado/completado), `tamaño_auto` (Chico/Mediano/Grande/SUV/Camioneta)

**Indexes:** `turnos(fecha)`, `turnos(cliente_id)`, `turnos(estado)`

**RLS:** Disabled (MVP — service role only)

## Types

```typescript
EstadoTurno = 'pendiente' | 'confirmado' | 'cancelado' | 'completado'
TamañoAuto  = 'Chico' | 'Mediano' | 'Grande' | 'SUV / Camioneta'

Cliente            = Database['public']['Tables']['clientes']['Row']
Servicio           = Database['public']['Tables']['servicios']['Row']
Turno              = Database['public']['Tables']['turnos']['Row']
TurnoConRelaciones = Turno & { clientes: Cliente; servicios: Servicio }
```

## Current Issues

| Severity | Issue |
|----------|-------|
| **High** | No auth — all routes public |
| **High** | RLS disabled — when auth added, must enable |
| **Medium** | No loading states (no Suspense boundaries) |
| **Medium** | No error boundaries |
| **Medium** | No input validation in buscarOCrearCliente |
| **Low** | `CRON_SECRET` missing from `.env.example` |
| **Low** | No index on `turnos(fecha, estado)` for cron query |

## Things to Note

- Turnos `fecha` stored as `YYYY-MM-DD` string. `formatFecha` displays `DD/MM/YYYY`.
- `getWeekDays` starts week on Monday. `DIAS_LABORALES` starts with Sunday — potential mismatch.
- `whatsapp.ts` graceful no-op if Twilio unconfigured. No retry on failure.
- Vercel cron at 13:00 UTC sends reminders for confirmed appointments tomorrow.
- No custom middleware (auth not implemented yet).
- Tailwind v4 (no tailwind.config — uses `@tailwindcss/postcss`).

---

# Roadmap

- [x] Fase 1: Agenda de turnos
- [ ] Fase 2: Generador de presupuestos
- [ ] Fase 3: CRM y seguimiento de clientes
- [ ] Auth: Login con Supabase Auth