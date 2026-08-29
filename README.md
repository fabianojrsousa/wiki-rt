# Wiki da Reforma Tributária do Consumo

Wiki pública que organiza a Reforma Tributária brasileira de forma consultável e
rastreável até a fonte oficial. Site estático, sem banco de dados, sem login.

A pergunta que este site responde melhor que qualquer outro lugar:
**qual é a regra hoje, desde quando, e onde está escrito.**

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # gera dist/ e o índice de busca
```

## Como o conteúdo é organizado

Cinco tipos de página, e só cinco. Todo conteúdo novo cabe em um deles.

| Tipo | Responde a | Pasta |
| --- | --- | --- |
| Marco | Quando? | `src/content/marcos/` |
| Norma | Onde está escrito? | `src/content/normas/` |
| Conceito | O que é isso? | `src/content/conceitos/` |
| Situação | O que muda para mim? | `src/content/situacoes/` |
| Verbete | O que significa essa sigla? | `src/content/glossario/` |

## Cinco regras

1. **Nenhuma afirmação sem fonte.** O schema em `src/content/config.ts` exige ao menos
   uma fonte oficial por norma e por marco. Sem ela o build falha e o site não é
   publicado. A regra é técnica, não editorial.
2. **Data de verificação visível** em toda página.
3. **Confirmado e previsto são coisas diferentes.** O campo `confirmado` separa data que
   consta de ato publicado de data que é expectativa. Na linha do tempo isso vira forma:
   marca cheia para confirmado, marca vazada para previsto.
4. **O histórico não é apagado.** O Git é o modelo bitemporal do projeto: cada alteração
   de redação é um commit, o diff é `git diff`, e a mensagem registra o ato que motivou
   a mudança.
5. **Conteúdo de terceiros é referenciado, nunca reproduzido.** Norma oficial é pública.
   Análise de escritório entra por link.

### Convenção de commit para alteração normativa

```
norma(lc-214): atualiza art. 348 conforme LC 227/2026, art. 25
fonte: https://in.gov.br/...
vigencia: 2026-01-14
```

Com isso, `git log --follow src/content/normas/lc-214-2025.md` é o histórico normativo
completo daquele texto.

## Coletores

`scripts/coletores/` varre as fontes oficiais duas vezes por dia via GitHub Actions.
Quando encontra ato novo, arquiva o original em `arquivo/`, gera rascunho em
`.rascunhos/` e abre um pull request.

**Nenhum rascunho é publicado sem revisão humana.** Coletor propõe, pessoa aprova.

| Fonte | Acesso | Situação |
| --- | --- | --- |
| CGIBS | Scraping | Implementado |
| Câmara dos Deputados | API REST documentada | Implementado |
| DOU / Imprensa Nacional | Endpoint do buscador | Esqueleto — ver nota abaixo |
| Senado, Receita, SPED, DF-e, CGSN, STF | API e scraping | A implementar |

Sobre o DOU: antes de evoluir o coletor, avalie o **Ro-DOU**, ferramenta oficial de
clipping mantida pelo governo no GitHub (organização `gestaogovbr`), construída em
Airflow para exatamente este propósito.

## Simulador

Não construa motor de cálculo próprio. A Receita Federal e o Serpro disponibilizam a
**Calculadora de Tributos** como software gratuito e de código aberto, no modelo
*Tax as a Service*: os cálculos rodam embarcados, sem depender de conexão com os
servidores da Receita, sem limite de requisição e sem custo por chamada.

Para o dia 1, linkar para o simulador oficial já entrega valor sem infraestrutura.

## Design

Papel de arquivo, tinta e carimbo. O elemento de assinatura é a **régua temporal**:
marcas cheias para datas confirmadas, marcas vazadas para datas previstas. A distinção
mais decisiva do domínio vira forma, não apenas rótulo.

Tipografia: Archivo (títulos e interface), Source Serif 4 (leitura), IBM Plex Mono
(datas, números e metadados). Tokens em `src/styles/global.css`.

## Publicar

Cloudflare Pages ou Vercel. Build `npm run build`, diretório `dist`.

## Aviso

Este site organiza informação pública e cita a fonte de cada afirmação. Não é
consultoria tributária e não substitui profissional habilitado.
