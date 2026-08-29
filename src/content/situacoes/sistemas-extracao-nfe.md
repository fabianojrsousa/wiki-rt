---
titulo: "O que muda para sistemas de extração e apuração de NFs"
publico: "Sistemas SAP e ERPs que extraem documentos fiscais e fazem apurações tributárias"
resumo: "A Reforma cria novos campos obrigatórios nos XMLs de NF-e, NFS-e e CT-e, muda a estrutura da apuração e extingue PIS/COFINS. Há quatro ondas documentais entre agosto de 2026 e janeiro de 2027."
marcos_relevantes:
  - 2026-08-03-obrigatoriedade-dfe
  - 2026-10-01-nfs-e-e-dere
  - 2026-12-01-terceira-onda
  - 2027-01-01-cbs-em-vigor
  - 2029-01-01-inicio-transicao-icms-iss
verificado_em: 2026-08-29
---

## O problema central para o extrator

O XML dos documentos fiscais eletrônicos passou a ter campos obrigatórios de IBS e CBS a partir de 03/08/2026. Um sistema que extrai NF-e do SAP e não lê esses campos está ignorando informação que já está presente em todos os documentos do regime regular.

Em 2026 esses valores não são recolhidos — o destaque é informativo e de teste. A partir de 01/01/2027 a CBS é recolhida efetivamente e substitui PIS e Cofins. Um sistema que não estiver pronto até lá começará 2027 com apuração errada.

## O que muda nos XMLs (desde 03/08/2026)

Todos os documentos fiscais eletrônicos do regime regular passam a conter, de forma obrigatória, os seguintes campos relacionados à Reforma:

| Campo | Conteúdo |
|-------|----------|
| Alíquota IBS | 0,1% na fase de testes (2026) |
| Valor IBS | Calculado sobre a base de cálculo |
| Alíquota CBS | 0,9% na fase de testes (2026) |
| Valor CBS | Calculado sobre a base de cálculo |
| Imposto Seletivo | Quando aplicável (bebidas, cigarros, veículos, etc.) |

O valor total do destaque em 2026 é 1% (IBS + CBS). Não há recolhimento efetivo desses valores em 2026.

## Documentos alcançados por data

| Data | Documentos |
|------|-----------|
| 03/08/2026 (1ª onda) | NF-e (55), NFC-e (65), CT-e (57), CT-e OS (67), BP-e, MDF-e, GTV-e, NF3-e, DC-e, NFS-e Via |
| 01/10/2026 (2ª onda) | NFS-e (prestadores de serviço do regime regular — regra geral) |
| 01/12/2026 (3ª onda) | NFS-e para plataformas digitais, locações, arrendamentos e valores condominiais |
| 01/01/2027 (4ª onda) | Simples Nacional optante pelo regime de CBS/IBS |

**Atenção:** o Simples Nacional não teve obrigatoriedade em agosto. Documentos de fornecedores Simples emitidos antes de 01/01/2027 não têm os campos de IBS/CBS. O extrator precisa tratar os dois casos.

## O que muda na apuração

### 2026 — Fase de testes

A apuração de PIS e Cofins continua normalmente via EFD-Contribuições. Os valores de CBS destacados nos documentos **não são recolhidos** e **não entram na apuração de PIS/Cofins**. Os campos servem para calibrar sistemas, testar alíquotas e validar a infraestrutura.

### 01/01/2027 — A cobrança começa

A CBS substitui PIS e Cofins. O recolhimento passa a ser mensal, via DPS (Documento de Pagamento Simplificado). A EFD-Contribuições para CBS passa a ser a DIBS (Declaração de Informações do IBS e CBS).

**Impacto direto:** a rotina que hoje apura PIS/Cofins com base nos XMLs extraídos do SAP precisa passar a apurar CBS. As regras de crédito mudam — CBS é não cumulativa por natureza para todos os regimes, o que pode ampliar o crédito aproveitável.

### 01/01/2029 — IBS começa a substituir ICMS e ISS

A partir de 2029 o IBS cresce gradualmente enquanto ICMS e ISS são reduzidos. A apuração de ICMS via EFD-ICMS/IPI convive com a de IBS via DIBS. Em 2033 ICMS e ISS são extintos e a apuração fica inteiramente no IBS.

## Obrigações acessórias novas que impactam o extrator

| Obrigação | O que é | Quando |
|-----------|---------|--------|
| DeRE | Declaração de Regimes Específicos — para contribuintes de regimes como serviços financeiros, planos de saúde e concursos | A partir de 01/10/2026 |
| DIBS | Declaração de Informações do IBS e CBS — substitui DCTF para esses tributos, mensal | A partir de 01/01/2027 |
| DPS | Documento de Pagamento Simplificado — emitido automaticamente para IBS e CBS, sem ação do contribuinte em alguns regimes | A partir de 01/01/2027 |

## Ponto de atenção: alíquota definitiva ainda não fixada

Em agosto de 2026, a alíquota definitiva de CBS e IBS **ainda não foi definida**. A expectativa é novembro de 2026. Sistemas que parametrizam alíquota fixa precisam de mecanismo para atualização quando a alíquota sair.

A alíquota-teste (1%) não é a alíquota final. Não use 1% como base para projeções de carga tributária definitiva.
