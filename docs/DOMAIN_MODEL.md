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
| `FuelType`             | `GASOLINE`, `ETHANOL`, `FLEX`, `DIESEL`, `GNV`, `ELECTRIC`, `HYBRID`     |
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
