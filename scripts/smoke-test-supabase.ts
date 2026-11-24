/**
 * Smoke test do backup em nuvem: cria um veículo pela entidade de domínio
 * (mesmas validações do app) e grava uma cópia na tabela vehicles do Supabase.
 *
 * Executar na raiz do projeto: npm run smoke:supabase
 * Requer o .env.local preenchido (modelo em .env.example).
 */
import { randomUUID } from 'node:crypto';
import { Vehicle } from '../src/domain/entities/Vehicle';
import { FuelType } from '../src/domain/enums/FuelType';
import { VehicleType } from '../src/domain/enums/VehicleType';
import { backupVehicle } from '../src/services/cloud/vehicleCloudBackup';

async function main(): Promise<void> {
  const vehicle = new Vehicle({
    id: randomUUID(),
    nickname: 'Teste de bancada IFPI',
    type: VehicleType.CAR,
    fuelType: FuelType.FLEX,
    brand: 'Fiat',
    model: 'Argo 1.3',
    year: 2021,
    plate: 'TST1A23',
    currentOdometerKm: 35120,
    createdAt: new Date(),
  });

  console.log('Enviando veículo para o Supabase...');
  const row = await backupVehicle(vehicle);
  console.log('[OK] Gravado na tabela vehicles:');
  console.log(row);
}

main().catch((error: unknown) => {
  console.error('[ERRO]', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
