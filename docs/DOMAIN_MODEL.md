# Modelo de Domínio — AutoMobile

## Diagrama de classes

```mermaid
classDiagram
    class Vehicle {
        +string id
        +string nickname
        +VehicleType type
        +FuelType fuelType
        +string brand
        +string model
        +number year
        +string plate
        +number currentOdometerKm
        +Date createdAt
        +isElectric() bool
        +isHybrid() bool
        +updateOdometer(km) void
    }

    class Expense {
        <<abstract>>
        +string id
        +string vehicleId
        +Date date
        +number odometerKm
        +number amount
        +string notes
        +category() ExpenseCategory
    }

    class FuelExpense {
        +FuelType fuelType
        +number quantity
        +number unitPrice
        +bool fullTank
        +string stationName
        +DieselGrade dieselGrade
        +unit() string
    }

    class MaintenanceExpense {
        +MaintenanceType maintenanceType
        +string serviceDescription
        +string workshopName
        +string[] partsReplaced
        +number nextDueOdometerKm
        +Date nextDueDate
    }

    class OtherExpense {
        +OtherExpenseCategory subCategory
        +string description
    }

    class MaintenanceReminder {
        +string id
        +string vehicleId
        +string title
        +ReminderDueType dueType
        +Date dueDate
        +number dueOdometerKm
        +bool isRecurring
        +ReminderStatus status
        +string linkedExpenseId
        +isOverdue(currentKm, currentDate) bool
    }

    Vehicle "1" --> "many" Expense : possui
    Vehicle "1" --> "many" MaintenanceReminder : possui
    Expense <|-- FuelExpense
    Expense <|-- MaintenanceExpense
    Expense <|-- OtherExpense
    MaintenanceReminder ..> MaintenanceExpense : concluído por
```

## Enums

| Enum                 | Valores                                                                 |
|-----------------------|--------------------------------------------------------------------------|
| `VehicleType`          | `CAR`, `MOTORCYCLE`, `PICKUP_TRUCK`, `SUV`, `VAN`, `OTHER`               |
| `FuelType`             | `GASOLINE`, `ETHANOL`, `FLEX`, `DIESEL`, `GNV`, `ELECTRIC`, `HYBRID`, `ARLA_32` |
| `DieselGrade`          | `S10`, `S500` (atributo opcional, só quando `fuelType = DIESEL`)        |
| `ExpenseCategory`      | `FUEL`, `MAINTENANCE`, `OTHER` (discriminador das subclasses de Expense) |
| `MaintenanceType`      | `PREVENTIVE`, `CORRECTIVE`                                               |
| `OtherExpenseCategory` | `INSURANCE`, `TAXES`, `CAR_WASH`, `PARKING`, `TOLL`, `FINE`, `ACCESSORY`, `DOCUMENTATION`, `OTHER` |
| `ReminderDueType`      | `BY_DATE`, `BY_ODOMETER`, `BOTH`                                         |
| `ReminderStatus`       | `PENDING`, `COMPLETED`, `OVERDUE`                                        |

## Regras de negócio principais

1. Um `Vehicle` nunca tem `currentOdometerKm` decrescente — só é
   atualizado para valores maiores ou iguais.
2. `FuelExpense.fuelType` deve ser compatível com o veículo: um veículo
   `ELECTRIC` só aceita `FuelExpense` com `fuelType = ELECTRIC`; um
   veículo `HYBRID` aceita `ELECTRIC` ou o tipo de combustão configurado.
3. `unit()` de um `FuelExpense` é `kWh` quando `fuelType = ELECTRIC`, e
   `L` (litros) para os demais.
4. Um `MaintenanceReminder` fica `OVERDUE` quando a data atual passa de
   `dueDate` (se `dueType` inclui `BY_DATE`) ou o hodômetro do veículo
   ultrapassa `dueOdometerKm` (se `dueType` inclui `BY_ODOMETER`).
5. Ao registrar uma `MaintenanceExpense` vinculada a um `MaintenanceReminder`
   pendente, o reminder passa para `COMPLETED` e guarda `linkedExpenseId`.
6. Consumo médio (`km/l` ou `km/kWh`) é calculado entre dois `FuelExpense`
   consecutivos do mesmo veículo com `fullTank = true`:
   `distância percorrida / quantidade abastecida na segunda medição`.
7. `dieselGrade` só pode ser definido quando `fuelType = DIESEL`; para
   qualquer outro `fuelType` (incluindo `ARLA_32`) o campo deve ficar vazio.
8. `FuelExpense` com `fuelType = ARLA_32` não entra no cálculo de consumo
   médio (regra 6) nem conta como abastecimento de combustível — é uma
   despesa própria, só compartilha a estrutura de registro (quantidade,
   preço unitário, posto) por ser comprado do mesmo jeito, por litro, no
   posto. Um veículo só aceita `ARLA_32` se for `DIESEL` (sistemas SCR são
   exclusivos de motores a diesel).
