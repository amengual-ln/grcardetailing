-- ============================================
-- GR Car Detailing — Schema inicial
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Clientes
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  nombre text not null,
  telefono text not null,
  email text,
  notas text
);

-- Servicios
create table if not exists servicios (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  nombre text not null,
  duracion_minutos integer not null default 60,
  precio_base numeric(10,2) not null default 0,
  descripcion text,
  activo boolean not null default true
);

-- Turnos
create type estado_turno as enum ('pendiente', 'confirmado', 'cancelado', 'completado');
create type tamaño_auto as enum ('Chico', 'Mediano', 'Grande', 'SUV / Camioneta');

create table if not exists turnos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  servicio_id uuid not null references servicios(id),
  fecha date not null,
  hora time not null,
  estado estado_turno not null default 'pendiente',
  auto_modelo text not null,
  auto_tamaño tamaño_auto not null default 'Mediano',
  notas text,
  recordatorio_enviado boolean not null default false
);

-- Índices
create index if not exists turnos_fecha_idx on turnos(fecha);
create index if not exists turnos_cliente_idx on turnos(cliente_id);
create index if not exists turnos_estado_idx on turnos(estado);

-- RLS: deshabilitar para MVP (acceso solo con service role)
alter table clientes disable row level security;
alter table servicios disable row level security;
alter table turnos disable row level security;
alter table autos disable row level security;

-- ============================================
-- Seed: Servicios iniciales
-- ============================================
insert into servicios (nombre, duracion_minutos, precio_base, descripcion) values
  ('Lavado clásico',          60,  5000,  'Lavado exterior completo'),
  ('Lavado premium',          90,  9000,  'Lavado exterior + secado y brillo'),
  ('Limpieza interior',      120, 12000,  'Aspirado, tapizados y tablero'),
  ('Abrillantado',           150, 18000,  'Pulido y abrillantado de carrocería'),
  ('Detallado de motor',     120, 15000,  'Limpieza profunda del compartimento'),
  ('Tratamiento acrílico',   240, 35000,  'Sellado acrílico de larga duración'),
  ('Tratamiento cerámico',   480, 80000,  'Recubrimiento cerámico profesional'),
  ('Restauración de óptica',  90, 10000,  'Pulido y restauración de faros')
on conflict do nothing;
