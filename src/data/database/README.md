# data/database

- `schema.ts` — DDL das 5 tabelas (`drivers`, `auth_sessions`,
  `vehicles`, `expenses`, `maintenance_reminders`). Ids são `TEXT`
  (UUID gerado antes do save pelas use cases), enums/datas/dinheiro
  viram `INTEGER`, `expenses` usa herança em tabela única.
- `connection.ts` — abre a conexão (`expo-sqlite`, `openDatabaseAsync`)
  e roda as migrations via `PRAGMA user_version`, seguindo o padrão
  documentado pelo próprio `expo-sqlite`. Nova migração = incrementar
  `DATABASE_VERSION` e adicionar um novo `if (currentVersion < N)`
  dentro de `runMigrations` — nunca editar o SQL de uma versão já
  publicada.
- `enumCodecs.ts` — mapeamento (bidirecional) dos enums de domínio para
  os códigos `INTEGER` gravados no banco. A ordem de cada lista É o
  código; só pode crescer no final.
- `mappers.ts` — conversões domínio ↔ armazenamento: `Date` ↔ epoch
  (segundos), reais ↔ centavos, litros/kWh ↔ centésimos, `boolean` ↔
  `0`/`1`.
