-- Backup em nuvem da tabela de veículos (Aula 09 - TEC.1053).
--
-- O app continua offline-first: o SQLite do aparelho é o banco principal
-- (src/data/database/schema.ts). Esta tabela recebe uma cópia dos veículos
-- quando o motorista faz backup. Por isso o id vem do app (UUID gerado no
-- aparelho) e o default gen_random_uuid() só vale para inserções manuais.
--
-- Diferente do SQLite, aqui os enums ficam como TEXT legível e o banco valida
-- os valores com CHECK: se o app (ou uma IA) mandar um valor fora da lista,
-- o PostgreSQL recusa a linha. As regras abaixo espelham o construtor de
-- src/domain/entities/Vehicle.ts e o docs/DOMAIN_MODEL.md.
--
-- Script idempotente: pode rodar de novo no SQL Editor sem erro.

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  nickname varchar(60) not null check (length(trim(nickname)) > 0),
  type varchar(20) not null
    check (type in ('CAR', 'MOTORCYCLE', 'PICKUP_TRUCK', 'SUV', 'VAN', 'OTHER')),
  -- ARLA_32 não é combustível de veículo, só de abastecimento (regra 8).
  fuel_type varchar(20) not null
    check (fuel_type in ('GASOLINE', 'ETHANOL', 'FLEX', 'DIESEL', 'GNV', 'ELECTRIC', 'HYBRID')),
  combustion_fuel_type varchar(20)
    check (combustion_fuel_type in ('GASOLINE', 'ETHANOL', 'FLEX')),
  has_gnv_kit boolean not null default false,
  brand varchar(60) not null,
  model varchar(60) not null,
  year integer not null check (year between 1900 and 2100),
  plate varchar(10),
  odometer_km integer not null default 0 check (odometer_km >= 0),
  created_at timestamptz not null default now(),

  -- Regra 9: kit GNV só sobre GASOLINE, ETHANOL ou FLEX.
  constraint vehicles_gnv_kit_compativel
    check (not has_gnv_kit or fuel_type in ('GASOLINE', 'ETHANOL', 'FLEX')),
  -- Regra 2: HYBRID exige o combustível do motor térmico; os demais não têm.
  constraint vehicles_hibrido_combustivel
    check ((fuel_type = 'HYBRID') = (combustion_fuel_type is not null))
);

alter table public.vehicles enable row level security;

-- MVP sem login na nuvem: leitura e inserção públicas pela chave anon.
-- Projetos novos do Supabase não dão acesso automático ao papel anon em
-- tabelas novas; o GRANT libera só SELECT e INSERT, e o RLS filtra as linhas.
-- Sem UPDATE/DELETE, a chave anon não altera nem apaga nada.
grant select, insert on public.vehicles to anon;

drop policy if exists "Permitir insercao publica anonima" on public.vehicles;
create policy "Permitir insercao publica anonima" on public.vehicles
  for insert to anon with check (true);

drop policy if exists "Permitir leitura publica" on public.vehicles;
create policy "Permitir leitura publica" on public.vehicles
  for select to anon using (true);

-- Seed: dois veículos de demonstração (ids fixos para o script ser idempotente).
insert into public.vehicles
  (id, nickname, type, fuel_type, combustion_fuel_type, has_gnv_kit, brand, model, year, plate, odometer_km)
values
  ('00000000-0000-4000-8000-000000000001', 'Onix do trabalho', 'CAR', 'FLEX', null, true,
   'Chevrolet', 'Onix 1.0', 2020, 'PIA1B23', 48250),
  ('00000000-0000-4000-8000-000000000002', 'Moto da entrega', 'MOTORCYCLE', 'GASOLINE', null, false,
   'Honda', 'CG 160 Fan', 2022, 'QRS4D56', 21300)
on conflict (id) do nothing;
