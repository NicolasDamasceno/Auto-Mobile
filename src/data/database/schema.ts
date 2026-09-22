/**
 * DDL do banco local (SQLite). Ids são TEXT (UUID gerado fora do banco,
 * antes do save — ver domain/usecases) em vez de INTEGER PRIMARY KEY: as
 * entidades de domínio já nascem com id pronto, então não dá pra depender
 * do autoincremento do SQLite. Enums, datas, dinheiro e quantidade viram
 * INTEGER (ver src/data/database/enumCodecs.ts e mappers.ts) pra economizar
 * espaço. `expenses` usa herança em tabela única: colunas específicas de
 * FUEL/MAINTENANCE/OTHER ficam nulas fora da categoria da linha.
 */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS drivers (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  driver_id TEXT NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_driver ON auth_sessions(driver_id);

CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY NOT NULL,
  nickname TEXT NOT NULL,
  type INTEGER NOT NULL,
  fuel_type INTEGER NOT NULL,
  has_gnv_kit INTEGER NOT NULL DEFAULT 0,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  plate TEXT,
  odometer_km INTEGER NOT NULL DEFAULT 0,
  photo_uri TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY NOT NULL,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  category INTEGER NOT NULL,
  date INTEGER NOT NULL,
  odometer_km INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  notes TEXT,
  attachment_uri TEXT,
  created_at INTEGER NOT NULL,
  -- FUEL (inclui recarga elétrica e Arla 32)
  fuel_type INTEGER,
  diesel_grade INTEGER,
  quantity_hundredths INTEGER,
  unit_price_cents INTEGER,
  full_tank INTEGER,
  station_name TEXT,
  -- MAINTENANCE
  maintenance_type INTEGER,
  service_description TEXT,
  workshop_name TEXT,
  parts_replaced TEXT,
  next_due_odometer_km INTEGER,
  next_due_date INTEGER,
  -- OTHER
  other_category INTEGER,
  description TEXT
);
CREATE INDEX IF NOT EXISTS idx_expenses_vehicle_date ON expenses(vehicle_id, date);

CREATE TABLE IF NOT EXISTS maintenance_reminders (
  id TEXT PRIMARY KEY NOT NULL,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_type INTEGER NOT NULL,
  due_date INTEGER,
  due_odometer_km INTEGER,
  is_recurring INTEGER NOT NULL DEFAULT 0,
  recurrence_interval_days INTEGER,
  recurrence_interval_km INTEGER,
  status INTEGER NOT NULL DEFAULT 0,
  linked_expense_id TEXT REFERENCES expenses(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reminders_vehicle_status ON maintenance_reminders(vehicle_id, status);
`;
