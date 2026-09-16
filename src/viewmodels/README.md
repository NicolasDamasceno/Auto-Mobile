# viewmodels

Stores Zustand que fazem o papel de ViewModel: chamam os Use Cases de
`src/domain/usecases`, guardam estado de UI (veículo ativo, formulários,
loading) e expõem esse estado para as Screens em `src/presentation`.
Não contêm regra de negócio — só orquestram.
