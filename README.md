# AutoMobile

App mobile **offline-first** para o motorista comum controlar todos os
gastos do seu veículo — carro, moto, caminhonete, SUV, van, a combustão
ou elétrico/híbrido — em um só lugar: abastecimento/recarga, manutenções
preventivas e corretivas, seguro, IPVA, pedágio, lavagem, multas e mais.

> Status: **domínio e persistência local implementados** — modelo de
> domínio, casos de uso e banco SQLite (schema, migrations e
> repositórios) prontos; UI, ViewModels, navegação e as implementações
> de hash de senha/notificações ainda por implementar.

## Documentação

- [`docs/BRAINSTORM.md`](docs/BRAINSTORM.md) — problema, visão, personas e escopo do MVP.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — camadas, stack e estrutura de pastas.
- [`docs/DOMAIN_MODEL.md`](docs/DOMAIN_MODEL.md) — diagrama de classes e regras de negócio.
- [`docs/USE_CASES.md`](docs/USE_CASES.md) — lista de casos de uso detalhados.

## Stack

TypeScript, React Native + Expo, Zustand (ViewModel), SQLite
(`expo-sqlite`), React Navigation, `expo-notifications` (notificações
locais).

## Estrutura

```
src/
├── domain/         # entidades, enums, casos de uso, interfaces de repositório (implementado)
├── data/           # SQLite: schema, migrations e repositórios (implementado)
├── viewmodels/      # stores Zustand (a implementar)
├── presentation/    # telas, navegação e componentes (a implementar)
├── services/        # hash de senha, token de sessão e notificações locais (a implementar)
└── utils/
```

## Como rodar (após implementar a UI)

```bash
npm install
npm run start
```

Requer o app Expo Go (ou um emulador Android/iOS configurado).
