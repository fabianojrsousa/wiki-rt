---
titulo: "Split payment"
resumo: "Mecanismo em que o tributo é separado e recolhido no momento da liquidação financeira do pagamento, antes de o valor líquido chegar ao fornecedor."
normas_relacionadas: ["lc-214-2025", "decreto-12955-2026"]
conceitos_relacionados: ["cbs", "ibs", "nao-cumulatividade-e-credito"]
verificado_em: 2026-08-29
---

## Em uma frase

O próprio sistema de pagamentos separa e recolhe o IBS e a CBS quando a operação é paga, antes de o valor líquido chegar à conta do fornecedor.

## Como funciona

Numa venda de R$ 50 com R$ 10 de tributo, o fornecedor recebe R$ 40 e os R$ 10 vão para o Fisco. O recolhimento deixa de depender de guia emitida no fechamento mensal e passa a acontecer dentro do fluxo do pagamento.

Bancos, instituições de pagamento e arranjos de Pix e boleto passam a ter papel na arrecadação.

## Situação atual

**Não está em produção.** Em 2026 o mecanismo não opera; o ano é de homologação de sistemas.

Em 12/08/2026, após reunião do colegiado em São Paulo, a segunda vice-presidente do Comitê Gestor do IBS informou que o split payment **não estará disponível em janeiro de 2027**, quando começa a cobrança da CBS. A implementação exige mais tempo e as próprias instituições financeiras pediram prazo adicional.

O adiamento não significa abandono. A implantação segue prevista em etapas:

1. **Fase 1 — B2B facultativo.** Uso opcional para quem inicia a transação, com as instituições participantes obrigadas a disponibilizar a funcionalidade aos clientes empresariais.
2. **Fase 2 — B2B obrigatório**, quando houver maturidade de mercado.
3. **Fase 3 — extensão ao consumidor final.**

As datas de cada fase dependem de ato conjunto da Receita Federal e do Comitê Gestor.

## Por que importa mesmo sem estar em vigor

**Fluxo de caixa.** O tributo deixa de transitar pelo caixa da empresa. Para operações com margem apertada, muda a lógica de capital de giro.

**Crédito vinculado ao recolhimento.** O adquirente só aproveita o crédito quando o débito da etapa anterior é efetivamente extinto. Se o fornecedor não recolhe, o crédito não se realiza.

## Documentação técnica

O Manual de Integração e a documentação Swagger da Plataforma Pública do Split Payment foram publicados em junho de 2026, disciplinando a comunicação entre agentes de pagamento e administrações tributárias.

## Não confundir

O termo também é usado no mercado de meios de pagamento para descrever a divisão de um valor entre vendedor, marketplace e intermediários. São coisas diferentes.
