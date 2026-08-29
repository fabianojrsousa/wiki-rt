---
titulo: "Apuração de IBS e CBS"
resumo: "Como funciona o cálculo mensal do IBS e da CBS, as diferenças em relação à apuração de PIS/Cofins e ICMS, e o papel do DPS e da DIBS."
normas_relacionadas:
  - lc-214-2025
  - lc-227-2026
conceitos_relacionados:
  - ibs
  - cbs
  - split-payment
verificado_em: 2026-08-29
---

## A lógica da apuração

Tanto o IBS quanto a CBS seguem o modelo IVA: o contribuinte apura o **débito** (imposto sobre as saídas) e deduz o **crédito** (imposto sobre as entradas). A diferença é o valor a recolher. Se os créditos superam os débitos, o saldo é crédito a recuperar ou compensar.

Esse modelo é conceitualmente parecido com o PIS/Cofins não cumulativo que existe hoje — mas com algumas diferenças importantes.

## O que muda em relação ao PIS/Cofins

| Aspecto | PIS/Cofins atual | CBS (2027 em diante) |
|---------|-----------------|----------------------|
| Quem apura | Regime de lucro real (não cumulativo) ou presumido (cumulativo) | Todos, com regime uniforme |
| Alíquota | PIS 1,65% + Cofins 7,6% (lucro real), ou PIS 0,65% + Cofins 3% (presumido) | Alíquota única (a ser fixada — previsão nov/2026) |
| Crédito | Limitado a lista taxativa de insumos | Crédito amplo sobre todas as aquisições tributadas |
| Base de cálculo | Receita bruta (com exclusões) | Operação com bens e serviços |
| Obrigação acessória | EFD-Contribuições | DIBS (Declaração de Informações do IBS e CBS) |
| Pagamento | DARF no código da receita correspondente | DPS (Documento de Pagamento Simplificado) |

## O que muda em relação ao ICMS

| Aspecto | ICMS atual | IBS (2029 em diante) |
|---------|-----------|----------------------|
| Quem arrecada | 27 estados e DF, cada um com sua legislação | Comitê Gestor do IBS (CGIBS) — administração centralizada |
| Princípio | Origem (onde é produzido) | Destino (onde é consumido) |
| Alíquota | Varia por estado e operação | Alíquota única (referência fixada pelo Senado) |
| Crédito | Complexo, com restrições por estado | Crédito amplo, uniforme |
| Declaração | SPED EFD-ICMS/IPI + GIA estadual | DIBS |

## Período de apuração

O período de apuração é mensal, igual ao PIS/Cofins. O contribuinte apura no fechamento do mês e recolhe no prazo definido em ato normativo (a regulamentar para os prazos definitivos de CBS/IBS).

## DPS — Documento de Pagamento Simplificado

O DPS é o documento que vai centralizar o pagamento de IBS e CBS. Ele é emitido pelo próprio sistema da Receita Federal / CGIBS, sem necessidade de o contribuinte calcular e emitir uma DARF separada para cada tributo.

Em modelos de regimes específicos (como serviços financeiros), o DPS pode ser gerado automaticamente a partir dos dados da DeRE.

## DIBS — Declaração de Informações do IBS e CBS

A DIBS substitui a função da EFD-Contribuições para os novos tributos. É a declaração mensal onde o contribuinte registra:
- Operações tributadas (débitos)
- Aquisições com crédito (créditos)
- Saldo apurado
- Eventuais saldos credores anteriores

## Impacto para sistemas que extraem NF-e do SAP

A apuração de IBS e CBS parte dos mesmos dados que a apuração atual de PIS/Cofins: as notas fiscais de entrada e saída. A diferença é que os valores de CBS/IBS já vêm **explícitos no XML** do documento fiscal, ao contrário de PIS/Cofins, que é calculado pelo contribuinte sobre a receita.

Isso significa que o sistema pode comparar o valor destacado no XML com o valor calculado internamente — e identificar divergências antes do fechamento.

## 2026: os campos estão lá, mas não geram recolhimento

Em 2026 os campos de IBS e CBS nos documentos fiscais existem para fins de teste e calibração. O valor destacado **não é recolhido** e **não entra na apuração de PIS/Cofins** — são informações paralelas. O sistema deve registrá-las, mas não incluí-las na apuração fiscal do período.
