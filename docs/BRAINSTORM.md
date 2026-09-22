# Brainstorm — AutoMobile

## Origem

Este projeto corresponde ao **Projeto 5** do planejamento de portfólio
(`Mobile: Controle de Manutenção Automotiva`), expandido com escopo próprio:
não apenas manutenção, mas o controle **completo de gastos** do veículo do
motorista comum.

## Problema

O motorista comum (carro, moto, caminhonete, SUV, elétrico ou a combustão)
não tem visibilidade real de quanto gasta com o próprio veículo. Os gastos
ficam espalhados entre notas fiscais, aplicativos de posto, extratos de
cartão e memória. Isso dificulta:

- Saber o custo real por km rodado.
- Antecipar manutenções preventivas antes que virem corretivas (mais caras).
- Comparar custo de combustível vs. energia elétrica ao longo do tempo.
- Ter esse histórico disponível offline, no bolso, a qualquer momento.

## Visão do produto

Um app mobile **offline-first** onde o motorista registra, em poucos toques,
todo gasto relacionado ao veículo — abastecimento/recarga, manutenções,
seguro, IPVA, pedágio, lavagem, multas — e recebe de volta:

- Histórico organizado por veículo.
- Lembretes de manutenção preventiva (por data e/ou por km).
- Consumo médio (km/l para combustão, km/kWh para elétrico).
- Visão consolidada de custos por período/categoria.

## Público-alvo / Personas

1. **Motorista de carro a combustão (uso diário/urbano)** — quer saber
   quanto está gastando por mês e não perder a próxima troca de óleo.
2. **Motociclista** — trocas de manutenção mais frequentes (óleo, relação,
   pneus), tickets de abastecimento menores e mais frequentes.
3. **Dono de carro/SUV elétrico ou híbrido** — quer acompanhar custo de
   recarga (kWh) em vez de litros, e comparar com o que gastaria a combustão.
4. **Motorista de caminhonete/utilitário (uso profissional/misto)** — maior
   volume de manutenção preventiva por desgaste, foco em custo por km.

## Escopo do MVP (dentro)

- Login local do motorista (nome, e-mail, senha) — trava de acesso ao
  app no aparelho, sem servidor/conta na nuvem.
- Cadastro de múltiplos veículos (carro, moto, caminhonete, SUV, van, outros;
  combustão, flex, elétrico, híbrido).
- Registro de abastecimento/recarga.
- Registro de manutenção (preventiva e corretiva).
- Registro de outras despesas (seguro, IPVA, pedágio, lavagem, multa, etc.).
- Lembretes de manutenção preventiva com notificação local (por data e/ou km).
- Histórico de gastos por veículo, com filtros.
- Dashboard simples de custos (total por período, por categoria).
- Cálculo de consumo médio (km/l ou km/kWh).
- Funcionamento 100% offline (SQLite local).

## Fora do MVP (backlog futuro)

- Sincronização em nuvem / múltiplos dispositivos.
- Múltiplos motoristas no mesmo app / troca de conta (o login do MVP é
  de trava local, um único `Driver` por instalação).
- Compartilhamento de veículo entre motoristas (ex: família, frota).
- OCR de nota fiscal / leitura automática de bomba.
- Integração com preços de combustível em tempo real.
- Exportação de relatórios (CSV/PDF).

## Por que isso é diferente do Projeto 5 original

O documento original descrevia "registro de manutenções preventivas,
abastecimentos e afins". O AutoMobile assume esse núcleo e o generaliza
para **controle financeiro completo do veículo**, cobrindo qualquer tipo de
veículo (carro, moto, caminhonete, SUV) e qualquer fonte de energia
(combustão ou elétrico/híbrido), com um modelo de domínio que trata
"abastecer" e "recarregar" como a mesma categoria de gasto (`FUEL`), apenas
com unidades diferentes (litros vs. kWh).
