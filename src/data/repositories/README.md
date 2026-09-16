# data/repositories

Implementações concretas (SQLite) das interfaces definidas em
`src/domain/repositories` (`VehicleRepository`, `ExpenseRepository`,
`MaintenanceReminderRepository`). Nada em `src/domain` deve importar
diretamente desta pasta — a dependência é sempre domain -> interface,
data -> implementa a interface.
