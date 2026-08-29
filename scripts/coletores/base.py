"""
Infraestrutura comum dos coletores.

Regras que valem para todos:
  - Todo artefato encontrado é baixado e arquivado antes de qualquer processamento.
    Órgãos substituem arquivos sem aviso; a cópia local é a única prova do que
    estava publicado em determinada data.
  - Deduplicação por SHA-256 do conteúdo, não por URL. A mesma norma costuma
    aparecer em endereços diferentes.
  - Nenhum coletor publica nada. Coletor só propõe.
"""

from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass, field, asdict
from datetime import date, datetime
from pathlib import Path

import requests

RAIZ = Path(__file__).resolve().parents[2]
ARQUIVO = RAIZ / "arquivo"
ESTADO = RAIZ / "scripts" / "estado.json"
RASCUNHOS = RAIZ / ".rascunhos"

UA = "wiki-reforma-tributaria/0.1 (coletor de atos oficiais; contato: exemplo@dominio.br)"
TIMEOUT = 30


@dataclass
class Achado:
    """Um ato ou documento localizado em uma fonte oficial."""
    titulo: str
    url: str
    orgao: str
    fonte: str
    publicado_em: str | None = None
    tipo_sugerido: str = "ato_conjunto"
    hash: str = ""
    arquivo_local: str | None = None
    trechos: list[str] = field(default_factory=list)


def _estado() -> dict:
    if ESTADO.exists():
        return json.loads(ESTADO.read_text(encoding="utf-8"))
    return {"hashes": [], "urls": []}


def _grava_estado(e: dict) -> None:
    ESTADO.parent.mkdir(parents=True, exist_ok=True)
    ESTADO.write_text(json.dumps(e, ensure_ascii=False, indent=2), encoding="utf-8")


def ja_visto(chave: str) -> bool:
    e = _estado()
    return chave in e["hashes"] or chave in e["urls"]


def registra(hash_: str, url: str) -> None:
    e = _estado()
    if hash_ and hash_ not in e["hashes"]:
        e["hashes"].append(hash_)
    if url not in e["urls"]:
        e["urls"].append(url)
    _grava_estado(e)


def baixa(url: str) -> bytes | None:
    try:
        r = requests.get(url, headers={"User-Agent": UA}, timeout=TIMEOUT)
        r.raise_for_status()
        return r.content
    except requests.RequestException as exc:
        print(f"  falha ao baixar {url}: {exc}")
        return None


def arquiva(conteudo: bytes, url: str) -> tuple[str, str]:
    """Salva o artefato de forma imutável. Devolve (hash, caminho relativo)."""
    h = hashlib.sha256(conteudo).hexdigest()
    hoje = date.today()
    pasta = ARQUIVO / f"{hoje.year:04d}" / f"{hoje.month:02d}"
    pasta.mkdir(parents=True, exist_ok=True)

    nome = re.sub(r"[^a-zA-Z0-9._-]+", "-", url.rsplit("/", 1)[-1])[:80] or "documento"
    if "." not in nome:
        nome += ".pdf" if conteudo[:4] == b"%PDF" else ".html"

    destino = pasta / f"{h[:12]}-{nome}"
    if not destino.exists():
        destino.write_bytes(conteudo)
    return h, str(destino.relative_to(RAIZ))


def salva_rascunho(achado: Achado, colecao: str, slug: str, corpo: str) -> Path:
    """
    Gera um .md marcado como RASCUNHO. Nunca escreve direto em src/content:
    o arquivo vai para .rascunhos e entra no repositório por pull request,
    depois de revisão humana.
    """
    RASCUNHOS.mkdir(parents=True, exist_ok=True)
    hoje = date.today().isoformat()
    fm = f"""---
titulo: "{achado.titulo.replace('"', "'")}"
tipo: {achado.tipo_sugerido}
numero: "REVISAR"
ano: {date.today().year}
orgao: "{achado.orgao}"
data_publicacao: {achado.publicado_em or hoje}
ementa: "REVISAR: extrair a ementa do texto oficial."
status: vigente
fontes:
  - titulo: "{achado.titulo.replace('"', "'")}"
    url: "{achado.url}"
    orgao: "{achado.orgao}"
    acessado_em: {hoje}
{f'    arquivo_local: "/{achado.arquivo_local}"' if achado.arquivo_local else ''}
verificado_em: {hoje}
---

<!-- RASCUNHO GERADO AUTOMATICAMENTE. NÃO PUBLICAR SEM REVISÃO. -->

## O que é

REVISAR.

## O que estabelece

REVISAR.

{corpo}
"""
    destino = RASCUNHOS / f"{colecao}--{slug}.md"
    destino.write_text(fm, encoding="utf-8")
    return destino


def resumo_pr(achados: list[Achado]) -> str:
    if not achados:
        return "Nenhum ato novo encontrado nesta execução."
    linhas = [
        "## Atos encontrados nesta coleta",
        "",
        "Cada item abaixo gerou um rascunho em `.rascunhos/`. **Nada foi publicado.**",
        "Revise, mova para `src/content/` e ajuste os campos marcados como REVISAR.",
        "",
    ]
    for a in achados:
        linhas.append(f"- **{a.titulo}** — {a.orgao} · [fonte]({a.url})")
        if a.arquivo_local:
            linhas.append(f"  - cópia arquivada: `{a.arquivo_local}`")
    linhas += ["", "### Antes de aprovar", "",
               "- [ ] Número e ano conferem com o texto oficial",
               "- [ ] Ementa transcrita da fonte, não inferida",
               "- [ ] Datas de publicação e vigência conferidas",
               "- [ ] Marcos criados ou atualizados, se o ato fixa prazos",
               "- [ ] `confirmado: true` apenas para data que consta de ato publicado"]
    return "\n".join(linhas)
