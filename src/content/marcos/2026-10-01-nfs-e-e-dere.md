---
titulo: "Segunda onda: NFS-e na regra geral e abertura da DeRE"
data_evento: 2026-10-01
criticidade: critica
tipo: obrigacao_acessoria
afeta: ["Regime regular", "Prestadores de serviço", "Regimes específicos"]
base_normativa: ["ato-conjunto-rfb-cgibs-4-2026"]
confirmado: true
fontes:
  - titulo: "Receita Federal e Comitê Gestor do IBS publicam o Cronograma de Implementação dos Documentos Fiscais Eletrônicos"
    url: "https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/julho/receita-federal-e-comite-gestor-do-ibs-publicam-o-cronograma-de-implementacao-dos-documentos-fiscais-eletronicos-da-reforma-tributaria-do-consumo"
    orgao: "Receita Federal"
    acessado_em: 2026-08-29
verificado_em: 2026-08-29
---

Duas coisas distintas acontecem nesta data.

**NFS-e.** Passa a ser obrigatório o preenchimento dos campos de IBS e CBS nos fornecimentos de serviços sujeitos ao ISS que não estejam enquadrados nas hipóteses específicas do Ato Conjunto nº 4/2026, que têm datas próprias.

**DeRE.** O ambiente passa a recepcionar os eventos de tabela do contribuinte, D-1001 (Informações do Contribuinte) e D-1011 (Plano Geral de Contas Comentado).

## A data da DeRE não é prazo final

É termo inicial de recepção, não data-limite de entrega. A transmissão pode ser feita a partir de 01/10/2026 e precisa estar concluída e processada **antes** do envio dos eventos periódicos mensais da competência de outubro, que vencem em 15/11/2026.

A sequência recomendada é transmitir os eventos de tabela, verificar o processamento, corrigir inconsistências e só então enviar os eventos periódicos.
