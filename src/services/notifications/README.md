# services/notifications

Implementação de `NotificationScheduler` (interface em
`src/domain/services`) usando `expo-notifications`, incluindo pedido de
permissão e agendamento de notificações locais para lembretes de
manutenção.

`NoopNotificationScheduler.ts` é um placeholder (não agenda nada de
verdade) usado por `viewmodels/dependencies.ts` até essa implementação
existir — assim `reminderStore`/`ScheduleMaintenanceReminder` já
funcionam sem travar em uma dependência ainda não implementada.
