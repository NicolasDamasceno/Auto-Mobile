import { Vehicle } from '../../domain/entities/Vehicle';
import { supabase } from './supabaseClient';

/** Linha de public.vehicles no Supabase (supabase/migrations/001_vehicles.sql). */
export interface VehicleCloudRow {
  id: string;
  nickname: string;
  type: string;
  fuel_type: string;
  combustion_fuel_type: string | null;
  has_gnv_kit: boolean;
  brand: string;
  model: string;
  year: number;
  plate: string | null;
  odometer_km: number;
  created_at: string;
}

function toCloudRow(vehicle: Vehicle): VehicleCloudRow {
  return {
    id: vehicle.id,
    nickname: vehicle.nickname,
    type: vehicle.type,
    fuel_type: vehicle.fuelType,
    combustion_fuel_type: vehicle.combustionFuelType ?? null,
    has_gnv_kit: vehicle.hasGnvKit,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    plate: vehicle.plate ?? null,
    odometer_km: vehicle.currentOdometerKm,
    created_at: vehicle.createdAt.toISOString(),
  };
}

/**
 * Envia uma cópia do veículo para a tabela vehicles do Supabase e devolve a
 * linha gravada. O SQLite continua sendo o banco principal; isto é só backup.
 *
 * Só insere: a chave anon não tem política de UPDATE, então enviar de novo um
 * veículo que já está na nuvem falha com chave duplicada (código 23505).
 */
export async function backupVehicle(vehicle: Vehicle): Promise<VehicleCloudRow> {
  const { data, error } = await supabase
    .from('vehicles')
    .insert(toCloudRow(vehicle))
    .select()
    .single();

  if (error) {
    throw new Error(`Falha ao enviar o veículo para o Supabase: ${error.message} (código ${error.code})`);
  }
  return data as VehicleCloudRow;
}
