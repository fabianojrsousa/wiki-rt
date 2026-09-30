import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

export const GET: APIRoute = async () => {
  const [normas, marcos, conceitos, situacoes, glossario] = await Promise.all([
    getCollection('normas'),
    getCollection('marcos'),
    getCollection('conceitos'),
    getCollection('situacoes'),
    getCollection('glossario'),
  ]);

  type Item = { titulo: string; url: string; desc: string; tags: string };
  const items: Item[] = [
    // Páginas estáticas
    { titulo: 'Início',                         url: '/',                                    desc: 'Página inicial — onde estamos na Reforma Tributária', tags: '' },
    { titulo: 'Guia SAP',                       url: '/sap',                                 desc: 'Impacto no SAP — extração de NF-e e apuração tributária', tags: 'sap erp sistema' },
    { titulo: 'Linha do tempo',                 url: '/linha-do-tempo',                      desc: 'Todas as datas de 2026 a 2033', tags: 'cronograma prazos calendario' },
    { titulo: 'Glossário',                      url: '/glossario',                           desc: 'Siglas e termos da Reforma Tributária', tags: 'dicionário siglas abreviações' },
    { titulo: 'Normas',                         url: '/normas',                              desc: 'Todas as normas da Reforma Tributária', tags: 'leis decretos regulamentação' },
    { titulo: 'Conceitos',                      url: '/conceitos',                           desc: 'IBS, CBS, IVA Dual, Destino, Split Payment…', tags: 'teoria definições' },
    { titulo: 'O que muda no SAP',             url: '/situacoes',                           desc: 'Por perfil de empresa ou contribuinte', tags: 'cenários empresas' },
    { titulo: 'Apuração Assistida IBS',        url: '/apuracao-assistida',                  desc: 'APIs e fluxo de apuração assistida do IBS — CGIBS, IPA, delta, webhook', tags: 'IPA CGIBS webhook delta arquivo' },
    { titulo: 'API CBS — Visão Geral',         url: '/apuracao-cbs',                        desc: 'APIs da Receita Federal para apuração de CBS', tags: 'ROC Receita Federal débitos créditos' },
    { titulo: 'API CBS — Guia Assíncrono',     url: '/apuracao-cbs/guia-assincrono',        desc: 'Fluxo, webhook, segurança e restrições das APIs assíncronas', tags: 'webhook polling segurança' },
    { titulo: 'API CBS — Débitos',             url: '/apuracao-cbs/debitos',                desc: 'Consultar débitos de CBS incluídos ou atualizados', tags: 'débitos consulta incremental' },
    { titulo: 'API CBS — Créditos',            url: '/apuracao-cbs/creditos',               desc: 'Consultar créditos de CBS incluídos ou atualizados', tags: 'créditos consulta aproveitamento' },
    { titulo: 'API CBS — Pagamentos',          url: '/apuracao-cbs/pagamentos',             desc: 'Pagamentos próprios, RAD e split payment', tags: 'DARF pagamento RAD PCONT' },
    { titulo: 'API CBS — Recolhimentos',       url: '/apuracao-cbs/recolhimentos',          desc: 'Recolhimentos na condição de adquirente', tags: 'adquirente substituição tributária' },
    { titulo: 'API CBS — Situação',            url: '/apuracao-cbs/situacao',               desc: 'Verificar status de processamento de solicitação assíncrona', tags: 'status solicitação processamento' },
    { titulo: 'Contabilização IBS e CBS',      url: '/contabilizacao',                      desc: 'Lançamentos contábeis de venda, compra, apuração e mapa mental', tags: 'lançamentos débito crédito SPED contabilidade' },
    { titulo: 'Reforma x Obrigações',          url: '/obrigacoes-2027',                     desc: 'O que acaba, o que fica e o que é criado nas obrigações acessórias', tags: 'SPED EFD DCTF obrigações acessórias extinção' },
    { titulo: 'Quiz — Reforma na Prática',     url: '/quiz',                                desc: 'Casos práticos sobre CBS, IBS, split payment, transição PIS/Cofins e mais', tags: 'teste avaliação perguntas' },
    { titulo: 'Podcasts sobre a Reforma',      url: '/podcasts',                            desc: 'Episódios selecionados sobre a Reforma Tributária do Consumo', tags: 'áudio episódios' },
    { titulo: 'Como este site funciona',       url: '/como-este-site-funciona',             desc: 'Metodologia e fontes do Radar RT', tags: 'metodologia sobre' },
  ];

  // Normas
  for (const n of normas) {
    items.push({
      titulo: n.data.titulo,
      url: `/normas/${n.slug}`,
      desc: n.data.ementa,
      tags: `${n.data.numero} ${n.data.orgao} ${n.data.tipo.replace(/_/g, ' ')} ${n.data.conceitos.join(' ')}`,
    });
  }

  // Marcos
  for (const m of marcos) {
    const d = m.data.data_evento;
    const data = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
    items.push({
      titulo: m.data.titulo,
      url: `/marcos/${m.slug}`,
      desc: `${data} — ${m.data.afeta.join(', ') || m.data.tipo.replace(/_/g, ' ')}`,
      tags: `${m.data.afeta.join(' ')} ${m.data.tipo.replace(/_/g, ' ')} ${m.data.base_normativa.join(' ')}`,
    });
  }

  // Conceitos
  for (const c of conceitos) {
    items.push({
      titulo: c.data.titulo,
      url: `/conceitos/${c.slug}`,
      desc: c.data.resumo,
      tags: `${c.data.normas_relacionadas.join(' ')} ${c.data.conceitos_relacionados.join(' ')}`,
    });
  }

  // Situações
  for (const s of situacoes) {
    items.push({
      titulo: s.data.titulo,
      url: `/situacoes/${s.slug}`,
      desc: s.data.resumo,
      tags: s.data.publico,
    });
  }

  // Glossário — aponta para âncora na página de glossário
  for (const g of glossario) {
    items.push({
      titulo: g.data.expansao ? `${g.data.termo} — ${g.data.expansao}` : g.data.termo,
      url: `/glossario#${g.id}`,
      desc: g.data.definicao,
      tags: `${g.data.expansao ?? ''} ${g.data.termo} glossário sigla`,
    });
  }

  return new Response(JSON.stringify(items), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
