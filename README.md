# Wiki da Reforma Tributária do Consumo

Wiki pública que organiza a Reforma Tributária brasileira de forma consultável e
rastreável até a fonte oficial. Site estático, sem banco de dados, sem login.

A pergunta que este site responde melhor que qualquer outro lugar:
**qual é a regra hoje, desde quando, e onde está escrito.**

## Stack

| Camada | Tecnologia |
| --- | --- |
| Gerador | Astro 4 (static output) |
| Busca | Pagefind (client-side, sem servidor) |
| Hospedagem | Cloudflare Pages |
| CI/CD | GitHub Actions + `cloudflare/wrangler-action@v3` |
| Tipografia | Space Grotesk (títulos/interface) · IBM Plex Mono (datas/números) |

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # gera dist/ e o índice de busca (Pagefind)
```

## Publicar manualmente

```bash
npx wrangler pages deploy dist --project-name wiki-rt --branch main --commit-dirty=true
```

## CI/CD via GitHub Actions

Push para `main` dispara `build-deploy.yml` automaticamente. Requer dois secrets no repositório (Settings → Secrets and variables → Actions):

| Secret | Onde obter |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | `dash.cloudflare.com` → Profile → API Tokens → Edit Cloudflare Pages |
| `CLOUDFLARE_ACCOUNT_ID` | `dash.cloudflare.com` → Workers & Pages → Account ID |

## Como o conteúdo é organizado

Cinco tipos de página, e só cinco. Todo conteúdo novo cabe em um deles.

| Tipo | Responde a | Pasta |
| --- | --- | --- |
| Marco | Quando? | `src/content/marcos/` |
| Norma | Onde está escrito? | `src/content/normas/` |
| Conceito | O que é isso? | `src/content/conceitos/` |
| Situação | O que muda para mim? | `src/content/situacoes/` |
| Verbete | O que significa essa sigla? | `src/content/glossario/` |

## Páginas do site

| URL | Descrição |
| --- | --- |
| `/` | Home — linha do tempo e últimas atualizações |
| `/linha-do-tempo` | Todos os marcos cronológicos |
| `/normas` | Índice das normas publicadas |
| `/conceitos` | Conceitos da reforma (IBS, CBS, IS…) |
| `/situacoes` | O que muda por perfil de contribuinte |
| `/glossario` | Siglas e termos técnicos |
| `/apuracao-assistida` | Apuração Assistida: IPA, ROC e fluxo entre os sistemas |
| `/apuracao-cbs` | APIs de apuração da CBS (débitos, créditos, pagamentos, recolhimentos) |
| `/obrigacoes-2027` | Novas obrigações acessórias: o que acaba, o que fica, o que nasce |
| `/contabilizacao` | Lançamentos contábeis — venda, compra e apuração |
| `/sap` | RT x SAP: impacto nos sistemas SAP |
| `/quiz` | Quiz com 116 casos práticos |
| `/podcasts` | Podcasts sobre a reforma |

Busca (`Ctrl+K`) usa o índice do Pagefind gerado em `npm run build`. Em `npm run dev`
o índice não existe e a busca cai numa lista fixa em `src/layouts/Base.astro`.
`sitemap-index.xml` e `robots.txt` são gerados no build; a imagem de compartilhamento
é `public/og.png`.

## Cinco regras editoriais

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

`scripts/coletores/` varre as fontes oficiais. O agendamento automático no GitHub Actions
foi removido (commit `d9cd1e8`); os scripts continuam no repositório e rodam manualmente
com `python scripts/coletores/run_all.py`. Quando encontra ato novo, arquiva o original em
`arquivo/` e gera rascunho em `.rascunhos/` para revisão.

**Nenhum rascunho é publicado sem revisão humana.** Coletor propõe, pessoa aprova.

| Fonte | Acesso | Situação |
| --- | --- | --- |
| CGIBS | Scraping | Implementado |
| Câmara dos Deputados | API REST documentada | Implementado |
| DOU / Imprensa Nacional | Endpoint do buscador | Esqueleto |
| Senado, Receita, SPED, DF-e, CGSN, STF | API e scraping | A implementar |

> Antes de evoluir o coletor de DOU, avalie o **Ro-DOU** — ferramenta oficial de
> clipping da organização `gestaogovbr` no GitHub, construída em Airflow para exatamente
> este propósito.

## Simulador

Não construir motor de cálculo próprio. A Receita Federal e o Serpro disponibilizam a
**Calculadora de Tributos** como software gratuito e código aberto, no modelo
*Tax as a Service*: cálculos embarcados, sem conexão com servidores da Receita, sem
limite de requisição, sem custo por chamada.

Para o dia 1, linkar para o simulador oficial já entrega valor sem infraestrutura.

## Design

Papel de arquivo, tinta e carimbo. O elemento de assinatura é a **régua temporal**:
marcas cheias para datas confirmadas, marcas vazadas para datas previstas.

Tipografia: Space Grotesk (`--display`, títulos e interface) e IBM Plex Mono (`--dado`,
datas, números e metadados). Tokens em `src/styles/global.css`.

## Aviso

Este site organiza informação pública e cita a fonte de cada afirmação. Não é
consultoria tributária e não substitui profissional habilitado.
