# Casos de Uso — AutoMobile

Ator principal: **Motorista** (usuário único do app, dono de um ou mais
veículos). Não há outros atores humanos no MVP (sem backend/servidor).

| ID    | Caso de uso                                   | Resumo |
|-------|------------------------------------------------|--------|
| UC01  | Cadastrar veículo                              | Motorista informa apelido, tipo, marca/modelo, ano, placa (opcional), tipo de combustível e hodômetro inicial. |
| UC02  | Editar veículo                                 | Motorista atualiza dados cadastrais de um veículo existente. |
| UC03  | Remover veículo                                | Motorista exclui um veículo e (com confirmação) seu histórico de gastos/lembretes. |
| UC04  | Selecionar veículo ativo                       | Motorista alterna qual veículo está "em foco" nas telas de registro/dashboard. |
| UC05  | Registrar abastecimento/recarga                | Motorista registra `FuelExpense`: quantidade (L ou kWh), preço, hodômetro, se foi tanque cheio/carga completa. |
| UC06  | Registrar manutenção                           | Motorista registra `MaintenanceExpense` (preventiva ou corretiva): descrição, oficina, peças, custo, hodômetro. |
| UC07  | Registrar outra despesa                        | Motorista registra `OtherExpense` (seguro, IPVA, pedágio, lavagem, multa, acessório, etc.). |
| UC08  | Editar/excluir registro de despesa             | Motorista corrige ou remove um lançamento já feito. |
| UC09  | Consultar histórico de gastos                  | Motorista visualiza lista de despesas de um veículo, com filtro por categoria e período. |
| UC10  | Visualizar dashboard de custos                 | Motorista vê totais por categoria/mês e evolução de gasto por veículo. |
| UC11  | Calcular consumo médio                         | Sistema calcula km/l (combustão) ou km/kWh (elétrico) a partir dos abastecimentos/recargas com tanque cheio. |
| UC12  | Configurar lembrete de manutenção preventiva   | Motorista cria um `MaintenanceReminder` por data e/ou por km (ex.: troca de óleo a cada 10.000 km ou 6 meses). |
| UC13  | Receber notificação local de manutenção        | Sistema dispara notificação local quando um lembrete está próximo do vencimento ou vencido. |
| UC14  | Marcar manutenção como concluída               | A partir de um lembrete vencido, motorista registra a `MaintenanceExpense` correspondente e o lembrete é concluído automaticamente. |
| UC15  | Exportar dados (backlog)                       | Fora do MVP: exportar histórico em CSV para backup/análise externa. |

## Detalhamento — UC05 (Registrar abastecimento/recarga)

- **Ator**: Motorista.
- **Pré-condição**: Existe ao menos um veículo cadastrado e selecionado como ativo.
- **Fluxo principal**:
  1. Motorista abre a tela "Novo abastecimento" a partir do veículo ativo.
  2. Informa hodômetro atual, quantidade (L ou kWh conforme `fuelType` do veículo), preço unitário, se foi tanque cheio/carga completa, e opcionalmente posto/local.
  3. Sistema calcula e sugere o valor total (`quantity * unitPrice`), editável.
  4. Motorista confirma.
  5. Sistema salva o `FuelExpense`, atualiza `Vehicle.currentOdometerKm` e recalcula o consumo médio (UC11) se houver um registro anterior com `fullTank = true`.
- **Fluxo alternativo**: hodômetro informado é menor que o atual do veículo → sistema bloqueia com mensagem de erro (regra de negócio do `Vehicle.updateOdometer`).
- **Pós-condição**: despesa registrada, hodômetro do veículo atualizado, disponível no histórico (UC09) e no dashboard (UC10).

## Detalhamento — UC12 + UC13 (Lembrete de manutenção preventiva)

- **Ator**: Motorista (cria) / Sistema (dispara).
- **Fluxo principal**:
  1. Motorista cria um lembrete: título (ex.: "Troca de óleo"), tipo (`BY_DATE`, `BY_ODOMETER` ou `BOTH`), valor de data e/ou km alvo, e se é recorrente.
  2. Sistema agenda notificação local (`expo-notifications`) próxima da data/km alvo.
  3. Quando a condição é atingida, sistema marca o lembrete como `OVERDUE` e dispara a notificação local.
  4. Motorista toca na notificação, é levado à tela de "Nova manutenção" pré-preenchida a partir do lembrete (UC14).
- **Pós-condição**: lembrete concluído e vinculado à despesa de manutenção criada; se recorrente, um novo lembrete é criado automaticamente a partir da nova data/km base.
