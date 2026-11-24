# AutoMobile

App mobile **offline-first** para o motorista comum controlar todos os
gastos do seu veículo — carro, moto, caminhonete, SUV, van, a combustão
ou elétrico/híbrido — em um só lugar: abastecimento/recarga, manutenções
preventivas e corretivas, seguro, IPVA, pedágio, lavagem, multas e mais.

> Status: **domínio, persistência local, autenticação e ViewModels
> implementados** — modelo de domínio, casos de uso, banco SQLite
> (schema, migrations e repositórios), hash de senha/token de sessão e
> as stores Zustand prontos; falta UI/navegação e a implementação real
> de notificações locais (`expo-notifications` — hoje é um placeholder
> que não agenda nada). Backup em nuvem: tabela de veículos no Supabase
> com envio pelo SDK (`src/services/cloud/`); sync entre aparelhos e API
> pública de dados agregados por modelo de veículo ficam pra depois do
> app mobile — ver `docs/ARCHITECTURE.md` e `docs/API_CONTRACT.md`.

## Documentação

- [`docs/BRAINSTORM.md`](docs/BRAINSTORM.md) — problema, visão, personas e escopo do MVP.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — camadas, stack e estrutura de pastas.
- [`docs/DOMAIN_MODEL.md`](docs/DOMAIN_MODEL.md) — diagrama de classes e regras de negócio.
- [`docs/USE_CASES.md`](docs/USE_CASES.md) — lista de casos de uso detalhados.
- [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) — contrato REST do recurso veículos na nuvem.

## Stack

TypeScript, React Native + Expo, Zustand (ViewModel), SQLite
(`expo-sqlite`), React Navigation, `expo-notifications` (notificações
locais), Supabase (`@supabase/supabase-js`, backup em nuvem).

## Estrutura

```
src/
├── domain/         # entidades, enums, casos de uso, interfaces de repositório (implementado)
├── data/           # SQLite: schema, migrations e repositórios (implementado)
├── viewmodels/      # stores Zustand: auth, vehicle, expense, reminder (implementado)
├── presentation/    # telas, navegação e componentes (a implementar)
├── services/        # hash de senha e token de sessão (implementado); backup no Supabase (cloud/); notificações locais (placeholder)
└── utils/           # helpers sem estado (hex.ts, id.ts)
```

## Como rodar (após implementar a UI)

```bash
npm install
npm run start
```

Requer o app Expo Go (ou um emulador Android/iOS configurado).

## Backup em nuvem (Supabase)

1. Copie `.env.example` para `.env.local` e preencha com a URL e a chave
   anon do projeto (Project Settings > API). O `.env.local` não vai para o Git.
2. Rode `supabase/migrations/001_vehicles.sql` no SQL Editor do Supabase.
3. Teste a gravação: `npm run smoke:supabase`.
