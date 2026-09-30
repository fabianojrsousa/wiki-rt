# Fórum Radar RT — Fase 1 (MVP)

- **Data:** 2026-09-30
- **Status:** aguardando revisão
- **Autores:** Felipe Andrade, com Claude

## 1. Objetivo

Criar um espaço dentro do radarrt.com onde as pessoas possam tirar dúvidas pontuais
sobre a Reforma Tributária do Consumo (legislação, apuração assistida, APIs, documentos
fiscais, SAP, contabilização) e responder às dúvidas dos outros.

O fórum serve a dois propósitos:

1. **Ajuda mútua.** Quem tem uma dúvida concreta pergunta; quem sabe responde.
2. **Divulgação do site.** Cada pergunta respondida é uma página que o Google indexa e
   que pode ser compartilhada no WhatsApp ou no LinkedIn com título e descrição próprios.

### Critérios de sucesso da Fase 1

- Uma pessoa entra com a conta Google em radarrt.com, publica uma pergunta, outra pessoa
  responde e o autor marca a melhor resposta. O tópico aparece como resolvido.
- Qualquer visitante lê o fórum sem login.
- O link de um tópico colado no WhatsApp mostra o título da pergunta.
- Os testes de RLS (seção 8) passam.
- As páginas atuais do site continuam iguais: o build passa e a busca continua indexando
  as mesmas páginas estáticas.

### Fora do escopo da Fase 1

Ficam para as fases 2 e 3, cada uma com spec próprio:

- Denúncia de conteúdo, voto "útil", painel de moderação na interface.
- Cloudflare Turnstile (anti-bot).
- Notificação por e-mail, RSS do fórum.
- Tópicos do fórum no sitemap.
- Markdown, imagens, anexos, menções.
- Criação ou edição de categorias pela interface.

## 2. Decisões tomadas

| Decisão | Escolha |
| --- | --- |
| Backend | Supabase Cloud, região São Paulo (`sa-east-1`). A migração para self-host numa VPS será avaliada depois pelo time. |
| Arquitetura | Híbrida: páginas atuais continuam estáticas; só a lista e o tópico são renderizados no servidor (Cloudflare). |
| Leitura | Pública, sem login. |
| Escrita | Só com login Google. |
| Identidade | Nome e foto da conta Google, com apelido opcional. |
| Moderação | Posterior à publicação: o moderador oculta o que for impróprio. Sem fila de aprovação. |
| Moderadores | Felipe Andrade e Fabiano Sousa (papel `admin`). |
| Onde o fórum aparece | Área de ferramentas, junto de Quiz, Podcasts e Glossário (seção 6.1). |

## 3. Arquitetura

```
Visitante ──► Cloudflare Pages
               ├─ páginas estáticas (todas as atuais, /forum/nova, /forum/perfil, /forum/entrar, /termos, /privacidade)
               └─ Worker (SSR) ── /forum e /forum/t/:id ──► Supabase (leitura pública, chave anon)

Navegador logado ──► supabase-js ──► Supabase Auth (Google) e Postgres (escrita, limitada por RLS)
```

- O Astro passa de `output: 'static'` para `output: 'hybrid'` com o adapter
  `@astrojs/cloudflare`, na versão compatível com Astro 4 (fixada, como foi feito com o
  `@astrojs/sitemap`). Só `src/pages/forum/index.astro` e `src/pages/forum/t/[slug].astro`
  declaram `export const prerender = false`. Todo o resto continua pré-renderizado.
- O servidor **só lê** dados públicos, com a chave `anon`. Ele não guarda sessão nem
  cookie de usuário.
- Toda escrita acontece no navegador, com o token do usuário logado. Quem garante que
  cada um só grava o que pode é o RLS do Postgres, não o código do site.
- O deploy continua igual: `wrangler pages deploy dist`. O adapter gera `dist/_worker.js`,
  que o Cloudflare Pages executa. O Pagefind continua indexando só o HTML estático.
- **Risco:** compatibilidade do adapter com Astro 4.16. A primeira tarefa do plano é um
  teste de deploy com uma página SSR mínima. Se falhar, o fallback é a abordagem 100% no
  navegador com URLs `/forum/t/?id=123`, perdendo SEO e preview por tópico.

### Variáveis de ambiente

| Nome | Onde | Observação |
| --- | --- | --- |
| `PUBLIC_SUPABASE_URL` | secret do GitHub Actions e `.env` local | Pública por design. |
| `PUBLIC_SUPABASE_ANON_KEY` | secret do GitHub Actions e `.env` local | Pública por design; a segurança vem do RLS. |

A chave `service_role` **nunca** entra no site nem no repositório. O `.env` entra no
`.gitignore`.

### Migrations no repositório

O schema fica em `supabase/migrations/*.sql`, versionado no Git. Aplicar esses arquivos
em ordem recria o banco inteiro. É isso que torna a futura migração para self-host um
`pg_dump`/restore mais a troca das duas variáveis.

## 4. Autenticação

- Provedor: Google, via Supabase Auth, fluxo PKCE.
- Configuração no Supabase: Site URL `https://radarrt.com`; redirect URLs permitidas
  `https://radarrt.com/**` e `http://localhost:4321/**`.
- Configuração no Google Cloud: OAuth Client do tipo "Web", nome do app "Radar RT",
  URI de redirecionamento `https://<ref-do-projeto>.supabase.co/auth/v1/callback`,
  escopos padrão (`email`, `profile`).
- A sessão fica no `localStorage`, gerenciada pelo supabase-js.

### Página `/forum/entrar`

Uma única página estática faz as duas pontas do login:

1. Aberta com `?volta=/caminho`: chama `signInWithOAuth({ provider: 'google' })` com
   `redirectTo` apontando para ela mesma, e mostra "Redirecionando para o Google…".
2. Aberta pelo retorno do Google (com `?code=`): troca o código pela sessão e navega para
   `volta`. Se `volta` não começar com `/`, usa `/forum` (evita redirect aberto).

### Indicador no header

As páginas comuns **não** carregam o supabase-js (~50 KB). Um componente
`src/components/forum/SessaoHeader.astro`, incluído no `.nav-acoes` do `Base.astro`, lê a
sessão salva no `localStorage` com um script inline pequeno:

- Sem sessão: link "Entrar" para `/forum/entrar?volta=<página atual>`.
- Com sessão: avatar do Google, com link para `/forum/perfil`.

A alteração no `Base.astro` se limita a importar e posicionar esse componente, para
reduzir conflito com as edições que o Fabiano faz no mesmo arquivo.

## 5. Dados

Todas as tabelas ficam no schema `public`, com RLS ligado.

### 5.1 Tabelas

**`perfis`**, um por usuário do Auth.

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `id` | `uuid` PK | referencia `auth.users(id)`, `on delete cascade` |
| `nome` | `text` | vem do Google (`full_name`) |
| `apelido` | `text` null | 2 a 40 caracteres |
| `avatar_url` | `text` null | vem do Google |
| `papel` | enum `membro`, `moderador`, `admin` | padrão `membro` |
| `banido` | `boolean` | padrão `false` |
| `criado_em` | `timestamptz` | padrão `now()` |

O e-mail **não** fica em `perfis`; continua só em `auth.users`, que não é público. Um
trigger em `auth.users` cria o perfil no primeiro login. O nome exibido é
`apelido` quando preenchido, senão `nome`.

**`categorias`**: `slug` (PK), `nome`, `descricao`, `ordem`. Dados iniciais:

| slug | nome |
| --- | --- |
| `legislacao` | Legislação e normas |
| `apuracao-assistida` | Apuração Assistida |
| `apis` | APIs e integrações |
| `documentos-fiscais` | Documentos fiscais (NF-e, NFS-e, CT-e…) |
| `sap` | SAP e sistemas |
| `contabilizacao` | Contabilização |
| `simples-nacional` | Simples Nacional |
| `geral` | Geral |

**`topicos`**

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `id` | `bigint` identity PK | |
| `autor_id` | `uuid` null | padrão `auth.uid()`; `on delete set null` |
| `categoria` | `text` | referencia `categorias(slug)` |
| `titulo` | `text` | 10 a 150 caracteres |
| `corpo` | `text` | 20 a 10.000 caracteres |
| `resolvido` | `boolean` | padrão `false` |
| `melhor_resposta_id` | `bigint` null | referencia `respostas(id)`, `on delete set null` |
| `oculto` | `boolean` | padrão `false` |
| `n_respostas` | `int` | respostas visíveis; mantido por trigger |
| `criado_em` | `timestamptz` | padrão `now()` |
| `editado_em` | `timestamptz` null | preenchido por trigger ao editar título ou corpo |
| `ultima_atividade` | `timestamptz` | padrão `now()`; atualizado a cada resposta |
| `busca` | `tsvector` gerado | `portuguese`, título com peso A e corpo com peso B; índice GIN |

**`respostas`**

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `id` | `bigint` identity PK | |
| `topico_id` | `bigint` | referencia `topicos(id)`, `on delete cascade` |
| `autor_id` | `uuid` null | padrão `auth.uid()`; `on delete set null` |
| `corpo` | `text` | 5 a 10.000 caracteres |
| `oculto` | `boolean` | padrão `false` |
| `criado_em` | `timestamptz` | padrão `now()` |
| `editado_em` | `timestamptz` null | preenchido por trigger |

O slug do título **não** é gravado. A URL é `/forum/t/<id>-<slug>`; o servidor usa só o
`id` e responde 301 para a URL canônica quando o slug não confere.

### 5.2 Permissões

A regra geral é: o que o usuário pode alterar diretamente é limitado por **grants de
coluna** mais **políticas RLS**; ações privilegiadas passam por funções `security definer`
que conferem a permissão por dentro.

| Ação | Quem | Mecanismo |
| --- | --- | --- |
| Ler categorias, perfis | todos | política `select` aberta |
| Ler tópico ou resposta | todos, se não oculto; autor e moderadores sempre | política `select` |
| Criar tópico | logado e não banido | `grant insert (categoria, titulo, corpo)` + política `with check (autor_id = auth.uid() and not banido)` |
| Criar resposta | logado e não banido, em tópico visível | `grant insert (topico_id, corpo)` + política equivalente |
| Editar título, corpo, categoria do tópico | autor | `grant update (titulo, corpo, categoria)` + política `autor_id = auth.uid()` |
| Editar corpo da resposta | autor | `grant update (corpo)` + política `autor_id = auth.uid()` |
| Editar apelido | dono do perfil | `grant update (apelido)` + política `id = auth.uid()` |
| Marcar ou desmarcar melhor resposta | autor do tópico ou moderador | RPC `marcar_melhor_resposta(p_topico, p_resposta)` |
| Ocultar ou reexibir tópico ou resposta | moderador | RPC `definir_oculto(p_tipo, p_id, p_oculto)` |
| Excluir a própria conta | dono | RPC `excluir_minha_conta()` |
| Apagar tópico ou resposta | ninguém pela API | não há grant de `delete` |
| Mudar `papel` ou `banido` | só pelo SQL Editor do Supabase | não há grant |

Colunas como `resolvido`, `oculto`, `n_respostas` e `autor_id` não têm grant de escrita
para o usuário. Por isso, mesmo chamando a API diretamente, ninguém consegue publicar em
nome de outra pessoa, ocultar conteúdo, marcar tópico como resolvido fora da RPC ou alterar
contadores.

`marcar_melhor_resposta` confere que a resposta pertence ao tópico e define
`resolvido = (p_resposta is not null)`.

### 5.3 Triggers

- **Criar perfil** no primeiro login (`after insert on auth.users`).
- **Contador e atividade:** ao inserir resposta, ou ao mudar `oculto` de uma resposta,
  recalcula `n_respostas` do tópico e atualiza `ultima_atividade`.
- **`editado_em`:** ao atualizar título ou corpo.
- **Limite anti-spam** (`before insert`): no máximo 5 tópicos e 20 respostas por usuário
  na última hora. Ao estourar, a inserção falha com uma mensagem que o site exibe.

### 5.4 Exclusão de conta (LGPD)

`excluir_minha_conta()` apaga o registro em `auth.users`. O perfil é apagado em cascata;
os tópicos e respostas permanecem, com `autor_id = null`, exibidos como "Usuário removido".
O plano inclui um teste confirmando que a função, criada pelo dono do schema, tem
permissão para apagar em `auth.users` no Supabase Cloud.

## 6. Interface

Todo o visual reaproveita o design system atual: tokens de `global.css`, fontes Space
Grotesk / Source Serif 4 / IBM Plex Mono, cards, pills e o componente `Aviso`. Nenhuma cor
ou fonte nova.

### 6.1 Pontos de entrada

- **Card de ferramentas da home** (`src/pages/index.astro`): novo item "Fórum" com a
  descrição "Tire dúvidas com a comunidade", no mesmo padrão de Quiz, Podcasts e Glossário.
- **Menu mobile** (`Base.astro`): item "Fórum" junto de Quiz, Podcasts e Glossário.
- **Header**: "Entrar" ou avatar (seção 4).
- **Busca** (`Ctrl+K`): a página `/forum` entra na lista de fallback.

### 6.2 Páginas

**`/forum`** (SSR)
- Cabeçalho da página, com botão "Fazer uma pergunta".
- Filtro por categoria (`?categoria=`), abas Recentes / Sem resposta / Resolvidas
  (`?aba=`), busca (`?q=`, usando `busca` com `websearch_to_tsquery('portuguese', …)`).
- 20 tópicos por página (`?pagina=`), ordenados por `ultima_atividade`.
- Cada item: título, categoria, nome e avatar do autor, número de respostas, selo
  "Resolvido" (`--confirmado`) e data relativa.

**`/forum/t/<id>-<slug>`** (SSR)
- Pergunta com autor, data, categoria e selo "Comunidade".
- `Aviso` no topo: "Respostas são de membros da comunidade. Não substituem a norma nem
  um profissional habilitado."
- Melhor resposta primeiro, com destaque `--confirmado`; demais respostas em ordem
  cronológica.
- Script no navegador, carregado só nessa página:
  - logado: formulário de resposta;
  - autor do tópico: "Marcar como melhor resposta" e "Editar";
  - autor de resposta: "Editar";
  - moderador: "Ocultar" / "Reexibir";
  - não logado: "Entre com o Google para responder".
- Depois de publicar ou editar, a página recarrega. Como o SSR não usa cache, a mudança
  aparece na hora.
- Metadados: `<title>` e `og:title` com o título da pergunta; `description` e
  `og:description` com os primeiros 155 caracteres do corpo; `og:type` `article`;
  `og:image` padrão do site; JSON-LD `QAPage` com `Question`, `acceptedAnswer` e
  `suggestedAnswer`.
- Tópico inexistente ou oculto: 404 com o layout do site.

**`/forum/nova`** (estática)
- Sem sessão: redireciona para `/forum/entrar?volta=/forum/nova`.
- Campos: categoria, título, pergunta. Contador de caracteres com os mesmos limites do
  banco.
- Quadro de regras antes do botão: "Não publique CNPJ, CPF, chave de NF-e nem dados de
  clientes. Seja respeitoso. Cite a norma quando souber."
- Ao publicar, vai para a URL do novo tópico.

**`/forum/perfil`** (estática)
- Nome e foto do Google, campo de apelido, botão "Sair".
- "Excluir minha conta": pede para digitar `EXCLUIR` antes de confirmar e explica que as
  postagens continuam como "Usuário removido".

**`/forum/entrar`** (estática): seção 4.

**`/termos`** e **`/privacidade`** (estáticas)
- Claude redige o rascunho; Felipe revisa (ou envia a um jurídico) antes do lançamento.
- Privacidade: dados coletados (nome, e-mail e foto do Google; conteúdo publicado),
  finalidade, operadores (Supabase, Cloudflare, Google), retenção, direito de exclusão e
  e-mail de contato do controlador.
- Termos: regras de conduta, conteúdo não é consultoria, licença de exibição do conteúdo
  publicado, poder de moderação.
- Linkadas em `/forum/nova`, em `/forum/entrar` e no rodapé das páginas do fórum.

### 6.3 Texto das postagens

Texto puro. Uma função `formatarTexto` em `src/lib/forum/texto.ts`, usada no servidor e
no navegador:

1. escapa todo HTML;
2. separa parágrafos por linha em branco e converte quebras simples em `<br>`;
3. transforma URLs `http(s)://` em links com `rel="nofollow ugc noopener"` e
   `target="_blank"`.

Como nada do usuário vira HTML sem escape, não há XSS pelo conteúdo.

## 7. Erros

| Situação | Comportamento |
| --- | --- |
| Supabase fora do ar (SSR) | Página do fórum com `Aviso` "Fórum temporariamente indisponível", status 503. O resto do site não é afetado. |
| Limite por hora atingido | Mensagem: "Você atingiu o limite de publicações por hora. Tente de novo mais tarde." |
| Sessão expirada ao publicar | O texto digitado é mantido e aparece o link "Entrar de novo". |
| Validação | Feita no navegador com os mesmos limites do banco; o banco é a garantia final. |
| Usuário banido | Mensagem: "Sua conta não pode publicar no fórum." |

## 8. Testes

- **RLS e funções** (SQL executado no projeto Supabase, simulando papéis com
  `set local role` e `request.jwt.claims`):
  - anônimo lê, mas não insere nem atualiza;
  - usuário não edita tópico ou resposta de outro;
  - usuário não altera `resolvido`, `oculto`, `n_respostas`, `autor_id` nem `papel`;
  - banido não publica;
  - oculto não aparece para anônimo e aparece para moderador;
  - sexto tópico na mesma hora falha;
  - `marcar_melhor_resposta` recusa resposta de outro tópico e usuário que não é autor;
  - `definir_oculto` recusa quem não é moderador;
  - `excluir_minha_conta` remove o perfil e mantém as postagens com `autor_id` nulo.
- **Funções puras** (`formatarTexto`, geração de slug): testes com Vitest, novo
  `devDependency`.
- **Build:** `npm run build` passa; as 55 páginas estáticas continuam indexadas.
- **Deploy:** teste de SSR no Cloudflare antes de construir as telas (seção 3).
- **Fluxo no navegador:** login, perguntar, responder com outra conta, marcar melhor
  resposta, ocultar como moderador, excluir conta.

## 9. O que o Felipe precisa fazer

Claude guia cada passo quando chegar a hora.

1. Criar o projeto no Supabase Cloud, região São Paulo.
2. Criar o OAuth Client no Google Cloud Console e colar Client ID e Secret no Supabase.
3. Cadastrar `PUBLIC_SUPABASE_URL` e `PUBLIC_SUPABASE_ANON_KEY` nos secrets do GitHub.
4. Informar o e-mail de contato para a página de privacidade.
5. Revisar os textos de termos e privacidade.
6. Depois do primeiro login do Felipe e do Fabiano, rodar o SQL que os torna `admin`
   (fornecido no plano).

## 10. Riscos

| Risco | Mitigação |
| --- | --- |
| Adapter Cloudflare incompatível com Astro 4 | Teste de deploy como primeira tarefa; fallback 100% navegador. |
| Plano Free do Supabase pausa após 7 dias sem uso e não tem backup | Aceitável em teste. Antes da divulgação, passar para o Pro (US$ 25/mês) ou agendar `pg_dump` semanal. |
| Conflito com edições simultâneas no `Base.astro` | Mudança isolada em um componente; `git pull --rebase` antes de cada commit. |
| Spam antes do Turnstile | Limite por hora no banco e moderação posterior; Turnstile na Fase 2. |
| Resposta errada tratada como oficial | Selo "Comunidade", aviso no topo de cada tópico e texto dos termos. |
