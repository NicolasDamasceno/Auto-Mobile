# Arquitetura — AutoMobile

## Estilo arquitetural

**Offline-First** com separação em camadas inspirada em **MVVM** e em
Clean Architecture "leve" (regras de negócio isoladas de framework/UI):

```
Presentation (Screens/Components)
        |
   ViewModel (Zustand stores)
        |
     Domain (Entities + Use Cases + Repository Interfaces)
        |
      Data (SQLite Repository Implementations)
```

- **Domain** não conhece React Native, Expo nem SQLite — só regras de
  negócio e interfaces (portas). É a camada testável e estável.
- **Data** implementa as interfaces do Domain usando SQLite
  (`expo-sqlite`), permitindo trocar o storage no futuro sem tocar em
  regra de negócio.
- **ViewModel** (Zustand) conecta os Use Cases do Domain às Screens,
  guardando estado de UI (loading, formulário, seleção de veículo ativo).
- **Presentation** só sabe renderizar e disparar ações; não fala com o
  banco diretamente.

Todo dado é gravado localmente primeiro (SQLite) — não existe estado
"pendente de servidor": o app funciona 100% sem internet, o que é
essencial para o caso de uso (motorista pode registrar abastecimento no
posto sem sinal).

## Stack

| Camada          | Tecnologia                                         |
|-----------------|-----------------------------------------------------|
| Linguagem       | TypeScript                                          |
| Framework       | React Native + Expo                                 |
| Estado (ViewModel) | Zustand                                          |
| Persistência    | SQLite (`expo-sqlite`)                              |
| Navegação       | React Navigation (native-stack)                     |
| Notificações    | `expo-notifications` (locais, sem servidor push)    |
| Datas           | `date-fns`                                          |
| Hash de senha   | `expo-crypto` (SHA-256 + salt, várias iterações — sem backend não há bcrypt/Argon2 nativo) |
| Sessão de login | `expo-crypto` (token opaco) + `expo-secure-store` (Keychain/Keystore, "continuar conectado") |

## Estrutura de pastas

```
auto-mobile/
├── App.tsx
├── app.json
├── package.json
├── tsconfig.json
├── docs/
│   ├── BRAINSTORM.md
│   ├── ARCHITECTURE.md
│   ├── DOMAIN_MODEL.md
│   └── USE_CASES.md
└── src/
    ├── domain/
    │   ├── entities/        # Driver, AuthSession, Vehicle, Expense (+ subtipos), MaintenanceReminder
    │   ├── enums/           # VehicleType, FuelType, categorias, status
    │   ├── repositories/    # interfaces (portas) — sem implementação
    │   ├── services/        # interfaces de serviços externos (notificações, hash de senha, token de sessão)
    │   └── usecases/        # regras de negócio orquestrando repositórios (inclui Login/ResumeSession/Logout)
    ├── data/
    │   ├── database/        # schema/migrations e conexão SQLite
    │   └── repositories/    # implementações SQLite das interfaces do domain
    ├── viewmodels/          # stores Zustand: authStore, vehicleStore, expenseStore, reminderStore
    ├── presentation/
    │   ├── navigation/
    │   ├── screens/
    │   └── components/
    ├── services/
    │   ├── notifications/   # NoopNotificationScheduler (placeholder); expo-notifications real, a implementar
    │   └── auth/            # ExpoPasswordHasher, ExpoSessionTokenService, sessionTokenStorage (SecureStore)
    └── utils/                # hex.ts (bytesToHex), id.ts (generateId) e outros helpers sem estado
```

Cada pasta ainda vazia tem um `README.md` explicando o que vai entrar nela
— isso é o esqueleto inicial; a implementação de Data/ViewModel/Presentation
é o próximo passo depois deste brainstorm.

## Fluxo de dados (exemplo: registrar abastecimento)

```mermaid
sequenceDiagram
    participant UI as Screen (Presentation)
    participant VM as useExpenseStore (ViewModel)
    participant UC as RegisterExpense (Use Case)
    participant Repo as ExpenseRepository (interface)
    participant SQLite as SQLiteExpenseRepository (Data)

    UI->>VM: submitFuelExpense(form)
    VM->>UC: execute(new FuelExpense(...))
    UC->>Repo: save(expense)
    Repo->>SQLite: INSERT INTO expenses ...
    SQLite-->>UC: expense salva
    UC-->>VM: expense
    VM-->>UI: atualiza lista/estado
```

## Decisões e trade-offs

- **SQLite via `expo-sqlite`** em vez de WatermelonDB no MVP: schema mais
  simples de raciocinar para o volume de dados de um único usuário/poucos
  veículos; WatermelonDB fica como opção futura se precisarmos de sync.
- **Zustand** em vez de Redux: menos boilerplate, adequado ao tamanho do
  app; a lógica pesada fica nos Use Cases, não na store.
- **`FuelExpense` cobre abastecimento e recarga**: evita duplicar o
  conceito de "reabastecer o veículo" — a diferença é só a unidade
  (litros vs. kWh), controlada pelo `FuelType` do registro.
- **Notificações locais, não push remoto**: consistente com offline-first;
  não depende de backend/servidor.
- **Hash de senha com `expo-crypto` (SHA-256 + salt + 1.000 iterações)
  em vez de bcrypt/Argon2**: Expo managed workflow não tem binding
  nativo pra essas libs sem dev client/eject. 1.000 iterações (bem
  menos que os ~100k de um PBKDF2 de servidor) porque
  `digestStringAsync` cruza a ponte nativa a cada chamada — mais
  iterações travariam login/cadastro por vários segundos. Aceitável pra
  ameaça real aqui (aparelho perdido/roubado, sem servidor pra sofrer
  força bruta remota); ver `src/services/auth/README.md`.
- **Login não amarra `Vehicle`/`Expense` a `Driver`**: MVP assume um
  motorista por instalação; `Driver` é só a trava de acesso. Só vira
  chave estrangeira se o app precisar de múltiplos motoristas por
  aparelho no futuro.
- **Sessão de login com token + SecureStore, sliding expiration de 90
  dias**, em vez de pedir senha toda abertura ou nunca expirar: dá o
  comportamento "tipo rede social" que foi pedido (uso contínuo nunca
  desloga) sem manter uma sessão eternamente válida caso o aparelho
  fique esquecido/perdido por muito tempo. O token vive só no
  SecureStore (Keychain/Keystore), nunca no SQLite — só o hash dele fica
  no banco, junto com a validade da sessão.
- **Ids das tabelas são `TEXT` (UUID), não `INTEGER PRIMARY KEY`**:
  revisão em relação ao primeiro rascunho do schema (DER). Toda entidade
  de domínio já nasce com `id` pronto antes do `save()` — `RegisterVehicle`,
  `RegisterDriver`, `Login`, etc. recebem o id de quem chamou o caso de
  uso, não do banco — então não dá pra depender do autoincremento do
  SQLite. O custo de espaço do `TEXT` continua pequeno em termos
  absolutos (mesmo raciocínio de sempre: poucas centenas/milhares de
  linhas); as outras otimizações (enums, datas e dinheiro como
  `INTEGER`, tabela única para `expenses`) continuam valendo.
- **Stores sem container de DI**: `viewmodels/dependencies.ts` só
  instancia os repositórios/serviços uma vez em módulo top-level. Um
  container (InversifyJS etc.) seria over-engineering pro tamanho do
  app — a única "injeção" que existe é a store importar de
  `dependencies.ts` em vez de instanciar direto.
- **`expenseStore` conhece `vehicleStore`/`reminderStore` (não o
  contrário)**: `RegisterExpense` atualiza `vehicles.odometer_km` e
  conclui lembretes só no banco, então depois de chamar o caso de uso o
  `expenseStore` também empurra a entidade atualizada pro
  `vehicleStore`/`reminderStore` em memória (`syncSideEffects`) — senão
  a tela do veículo mostraria hodômetro/lembrete desatualizados até um
  reload manual. É uma dependência de uma via só (expense -> vehicle/
  reminder), nunca ao contrário, pra não criar um ciclo de import entre
  stores.
