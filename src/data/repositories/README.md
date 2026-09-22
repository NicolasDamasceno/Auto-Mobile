# data/repositories

Implementações SQLite das interfaces de `src/domain/repositories`:
`SQLiteDriverRepository`, `SQLiteAuthSessionRepository`,
`SQLiteVehicleRepository`, `SQLiteExpenseRepository` e
`SQLiteMaintenanceReminderRepository`. Cada uma converte entre a linha
do banco (tipos compactos — ver `data/database/enumCodecs.ts` e
`mappers.ts`) e a entidade de domínio correspondente, e usa
`INSERT ... ON CONFLICT(id) DO UPDATE` como upsert (`save()` cobre
criar e editar).

Nada em `src/domain` deve importar diretamente desta pasta — a
dependência é sempre domain -> interface, data -> implementa a
interface.
