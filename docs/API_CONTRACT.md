# Contrato da API REST — AutoMobile

Contrato do recurso **veículos** na nuvem (Aula 10 de TEC.1053). O app é
offline-first: tudo é gravado primeiro no SQLite do aparelho, e a API serve
para o backup e, no futuro, para a sincronização entre aparelhos.

## Estado da implementação

| Parte | Estado |
|---|---|
| Tabela `public.vehicles` no Supabase (PostgreSQL), com CHECK e RLS | feito — `supabase/migrations/001_vehicles.sql` |
| Inserção e leitura pelo SDK `@supabase/supabase-js` | feito — `src/services/cloud/` (`backupVehicle`) |
| Rotas `/api/v1/vehicles` abaixo | contrato definido; a camada de rotas ainda não existe |
| Edição e exclusão na nuvem | dependem de login na nuvem; hoje o RLS só libera INSERT e SELECT |

## Regras

- URIs com substantivo no plural: `/api/v1/vehicles`.
- `GET` nunca altera dados (seguro e idempotente).
- `PUT` e `DELETE` são idempotentes: repetir a mesma requisição deixa o
  recurso no mesmo estado.
- Corpo de erro sempre no formato `{ "erro": "mensagem" }`.
- Quem valida os valores de enum e as regras do veículo é o PostgreSQL
  (CHECK). A API repassa a recusa do banco como `400`.

## Rotas

| Método | URI | Sucesso | Erros | Corpo da requisição |
|---|---|---|---|---|
| `POST` | `/api/v1/vehicles` | `201 Created` + header `Location: /api/v1/vehicles/{id}` + veículo criado | `400` payload inválido · `409` id já existe | veículo (sem `created_at`) |
| `GET` | `/api/v1/vehicles` | `200 OK` + array de veículos (`[]` se não houver nenhum) | — | — |
| `GET` | `/api/v1/vehicles/{id}` | `200 OK` + veículo | `400` id não é UUID · `404` não encontrado | — |
| `PUT` | `/api/v1/vehicles/{id}` | `200 OK` + veículo atualizado | `400` payload inválido ou hodômetro menor que o atual · `404` não encontrado | veículo completo (sem `id` e `created_at`) |
| `DELETE` | `/api/v1/vehicles/{id}` | `204 No Content` (sem corpo) | `404` não encontrado | — |

Erros de servidor (falha de rede com o Supabase, por exemplo) respondem
`500` com `{ "erro": "..." }`, sem detalhes internos.

## Modelo JSON do veículo

```json
{
  "id": "6f1c2a9e-3b7d-4e2a-9c51-0d8e4b7a1f23",
  "nickname": "Onix do trabalho",
  "type": "CAR",
  "fuel_type": "FLEX",
  "combustion_fuel_type": null,
  "has_gnv_kit": true,
  "brand": "Chevrolet",
  "model": "Onix 1.0",
  "year": 2020,
  "plate": "PIA1B23",
  "odometer_km": 48250,
  "created_at": "2026-11-24T16:30:00.000Z"
}
```

| Campo | Tipo | Regra |
|---|---|---|
| `id` | UUID | gerado no aparelho; obrigatório no `POST` |
| `nickname` | texto (até 60) | obrigatório, não pode ser vazio |
| `type` | texto | `CAR`, `MOTORCYCLE`, `PICKUP_TRUCK`, `SUV`, `VAN` ou `OTHER` |
| `fuel_type` | texto | `GASOLINE`, `ETHANOL`, `FLEX`, `DIESEL`, `GNV`, `ELECTRIC` ou `HYBRID` |
| `combustion_fuel_type` | texto ou `null` | obrigatório quando `fuel_type = HYBRID` (`GASOLINE`, `ETHANOL` ou `FLEX`); `null` nos demais |
| `has_gnv_kit` | booleano | `true` só com `fuel_type` `GASOLINE`, `ETHANOL` ou `FLEX` |
| `brand`, `model` | texto (até 60) | obrigatórios |
| `year` | inteiro | entre 1900 e 2100 |
| `plate` | texto (até 10) ou `null` | opcional |
| `odometer_km` | inteiro | `>= 0`; no `PUT` não pode ser menor que o valor atual |
| `created_at` | data ISO 8601 (UTC) | definido na criação; não muda |

## Exemplo de erro

`POST /api/v1/vehicles` com `"fuel_type": "QUEROSENE"`:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{ "erro": "fuel_type inválido. Válidos: GASOLINE, ETHANOL, FLEX, DIESEL, GNV, ELECTRIC, HYBRID." }
```
