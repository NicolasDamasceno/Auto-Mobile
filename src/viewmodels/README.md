# viewmodels

Stores Zustand que fazem o papel de ViewModel: chamam os Use Cases de
`src/domain/usecases`, guardam estado de UI (veículo ativo, formulários,
loading) e expõem esse estado para as Screens em `src/presentation`.
Não contêm regra de negócio — só orquestram.

- **`dependencies.ts`** — instâncias únicas dos repositórios SQLite e
  serviços concretos (hash de senha, token de sessão, notificações),
  importadas por todas as stores. Sem container de DI — app pequeno
  demais pra justificar um.
- **`authStore`** — login/cadastro/logout e o auto-login do boot
  (`bootstrap`, UC00c) a partir do token no SecureStore.
- **`vehicleStore`** — lista de veículos e qual está "ativo" na tela
  (UC01-UC04). Edição (UC02) e remoção (UC03) não têm caso de uso
  próprio: são só persistência direta via repositório.
- **`expenseStore`** — registro de despesas (UC05-UC07), histórico
  (UC09), resumo (UC10) e consumo médio (UC11). Depois de
  `RegisterExpense` (que atualiza o hodômetro do veículo e, se aplicável,
  conclui um lembrete só no banco), chama `syncSideEffects` pra refletir
  isso também no `vehicleStore`/`reminderStore` em memória — senão a tela
  ficaria com hodômetro/lembrete desatualizados até um reload manual.
- **`reminderStore`** — lembretes de manutenção (UC12-UC14), por
  veículo ou todos os pendentes (para o dashboard).

Nenhuma store importa outra store no nível de módulo além do que
`expenseStore` precisa para `syncSideEffects` — cuidado pra não criar
dependência circular entre stores.
