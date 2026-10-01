/**
 * Busca atualizações da Reforma Tributária nas APIs públicas da Câmara e do Senado.
 * Grava resultado em src/data/noticias-rt.json.
 *
 * Uso: node scripts/fetch-updates.mjs
 * Requer Node >= 18 (fetch nativo, sem dependências externas).
 *
 * Fontes:
 *   Câmara  → https://dadosabertos.camara.leg.br/swagger/api.html
 *   Senado  → https://legis.senado.leg.br/dadosabertos/
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE   = join(__dirname, '..', 'src', 'data', 'noticias-rt.json');
const UA         = 'wiki-rt-bot/1.0 (fabianojrsousa@gmail.com)';

// IDs fixos das proposições-chave (validados na API da Câmara)
const PROPS_KEY = [
  { id: 2430143, sigla: 'PLP', numero: '68',  ano: '2024', tag: 'IBS/CBS (LC 214/2025)' },
  { id: 2430260, sigla: 'PLP', numero: '108', ano: '2024', tag: 'CGIBS (LC 218/2025)' },
];

// Regex para filtrar proposições relacionadas à reforma
const REGEX_RT = /\b(LC\s*21[4-9]|214\/2025|218\/2025|IBS|CBS|CGIBS|Comitê\s+Gestor|imposto\s+seletivo|split.?payment|cashback.*IBS|Contribuição\s+sobre\s+Bens)\b/i;

// ─── helpers ────────────────────────────────────────────────────────────────

async function getJSON(url, label) {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': UA },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`  [WARN] ${label}: ${err.message}`);
    return null;
  }
}

function iso(str) { return str ? String(str).slice(0, 10) : ''; }

// ─── Câmara: tramitações das proposições-chave (últimas 5 por proposição) ───

async function camaraTramitacoes() {
  const itens = [];

  for (const p of PROPS_KEY) {
    // O endpoint de tramitações NÃO aceita `ordem` nem `itens` — busca tudo, pega as últimas N
    const tram = await getJSON(
      `https://dadosabertos.camara.leg.br/api/v2/proposicoes/${p.id}/tramitacoes`,
      `Câmara tramitações ${p.sigla} ${p.numero}/${p.ano}`,
    );
    const todas    = tram?.dados ?? [];
    const recentes = todas.slice(-4).reverse(); // últimas 4, mais recente primeiro

    const urlLeg = `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${p.id}`;
    for (const t of recentes) {
      const data     = iso(t.dataHora);
      const situacao = t.descricaoSituacao ?? t.descricaoTramitacao ?? 'Movimentação';
      itens.push({
        id:        `camara-tram-${p.id}-${data}-${t.sequencia ?? 0}`,
        fonte:     'Câmara dos Deputados',
        tipo:      'tramitacao',
        titulo:    `${p.sigla} ${p.numero}/${p.ano} — ${situacao}`,
        descricao: (t.despacho ?? '').slice(0, 300),
        data,
        url:       urlLeg,
        tag:       p.tag,
      });
    }
  }
  return itens;
}

// ─── Câmara: PLPs mais recentes de 2026 relacionados à reforma ──────────────

async function camaraProposicoes() {
  const itens = [];

  // Busca PLPs de 2026 ordenados por ID decrescente (mais novos primeiro) e filtra por regex
  const res = await getJSON(
    'https://dadosabertos.camara.leg.br/api/v2/proposicoes?siglaTipo=PLP&ano=2026&itens=50&ordem=DESC&ordenarPor=id',
    'Câmara PLPs 2026',
  );
  const matches = (res?.dados ?? []).filter(r => REGEX_RT.test(r.ementa ?? ''));
  for (const r of matches) {
    itens.push({
      id:        `camara-prop-${r.id}`,
      fonte:     'Câmara dos Deputados',
      tipo:      'proposicao',
      titulo:    `PLP ${r.numero}/${r.ano}`,
      descricao: (r.ementa ?? '').slice(0, 300),
      data:      iso(r.dataApresentacao),
      url:       `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${r.id}`,
      tag:       'Nova proposição',
    });
  }
  return itens;
}

// ─── Senado: matérias relacionadas à reforma ─────────────────────────────────

const SENADO_QUERIES = [
  'Lei+Complementar+214',  // proposições que alteram a LC 214/2025 (IBS/CBS)
  'CGIBS+IBS',             // vetos e outras matérias sobre o CGIBS
];

async function senado() {
  const seen  = new Set();
  const itens = [];

  for (const q of SENADO_QUERIES) {
    const res = await getJSON(
      `https://legis.senado.leg.br/dadosabertos/materia/pesquisa/lista?palavraChave=${q}&v=7`,
      `Senado "${q}"`,
    );
    const materias = res?.PesquisaBasicaMateria?.Materias?.Materia;
    const lista    = materias ? (Array.isArray(materias) ? materias : [materias]) : [];

    for (const m of lista) {
      const id   = m.Codigo;
      const sg   = (m.Sigla ?? '').trim();
      const num  = (m.Numero ?? '').trim();
      const ano  = (m.Ano ?? '').trim();

      // Pula requerimentos de audiência (pouco relevantes para o site)
      if (!id || sg === 'REQ' || seen.has(id)) continue;
      seen.add(id);

      itens.push({
        id:        `senado-${id}`,
        fonte:     'Senado Federal',
        tipo:      sg === 'VET' ? 'veto' : 'materia',
        titulo:    `${sg} ${num}/${ano}`,
        descricao: (m.Ementa ?? '').slice(0, 300),
        data:      iso(m.Data),
        url:       `https://www25.senado.leg.br/web/atividade/materias/-/materia/${id}`,
        tag:       sg === 'VET' ? 'Veto presidencial' : 'Proposta legislativa',
      });
    }
  }
  return itens;
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\nRadar RT — buscando atualizações da Reforma Tributária...\n');

  const [tramCamara, propsCamara, itensSenado] = await Promise.all([
    camaraTramitacoes(),
    camaraProposicoes(),
    senado(),
  ]);

  console.log(`  Câmara (tramitações) : ${tramCamara.length}`);
  console.log(`  Câmara (proposições) : ${propsCamara.length}`);
  console.log(`  Senado               : ${itensSenado.length}`);

  // Dedup por id, ordena por data decrescente
  const seen  = new Set();
  const novos = [...tramCamara, ...propsCamara, ...itensSenado]
    .filter(i => i.titulo && !seen.has(i.id) && seen.add(i.id))
    .sort((a, b) => (b.data ?? '').localeCompare(a.data ?? ''));

  // Merge com histórico — mantém itens anteriores não encontrados na busca atual
  let historico = [];
  if (existsSync(OUT_FILE)) {
    try {
      const anterior = JSON.parse(readFileSync(OUT_FILE, 'utf-8'));
      const novosIds = new Set(novos.map(i => i.id));
      historico = (anterior.itens ?? []).filter(i => !novosIds.has(i.id)).slice(0, 20);
    } catch { /* arquivo corrompido — ignora */ }
  }

  const resultado = {
    gerado_em: new Date().toISOString(),
    total:     novos.length,
    itens:     [...novos, ...historico].slice(0, 40),
  };

  mkdirSync(join(__dirname, '..', 'src', 'data'), { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(resultado, null, 2) + '\n', 'utf-8');

  console.log(`\n✓ ${resultado.itens.length} itens gravados em src/data/noticias-rt.json`);
  console.log(`  Gerado em: ${resultado.gerado_em}\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
