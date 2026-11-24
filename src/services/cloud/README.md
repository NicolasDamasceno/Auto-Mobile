# services/cloud

Backup em nuvem no Supabase (PostgreSQL gerenciado). O app continua
**offline-first**: o SQLite do aparelho é o banco principal, e a nuvem
recebe uma cópia dos dados quando o motorista faz backup.

- **`supabaseClient.ts`**: cliente único do `@supabase/supabase-js`. Lê
  `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` do
  `.env.local` (fora do Git; modelo em `.env.example`). Só usa a chave
  anon, limitada pelo RLS.
- **`vehicleCloudBackup.ts`**: `backupVehicle(vehicle)` converte a
  entidade `Vehicle` para a linha de `public.vehicles` e insere.
  Por enquanto só insere: sem login na nuvem, a chave anon não tem
  política de UPDATE/DELETE.

O schema da tabela está em `supabase/migrations/001_vehicles.sql`, e o
contrato REST em `docs/API_CONTRACT.md`.

Teste rápido pelo terminal (grava um veículo de teste na nuvem):

```bash
npm run smoke:supabase
```
