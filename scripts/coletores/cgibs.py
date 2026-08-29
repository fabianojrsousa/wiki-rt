"""Coletor do portal do Comitê Gestor do IBS.

Não há API. O portal publica os atos como PDF em um diretório de uploads
e os anuncia em páginas de notícia. O coletor varre as duas coisas.
"""

from __future__ import annotations

import re
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from base import Achado, arquiva, baixa, ja_visto, registra, salva_rascunho

BASE = "https://cgibs.gov.br"
PADRAO_ATO = re.compile(
    r"(resolu[çc][ãa]o|ato\s+conjunto|portaria|nota\s+t[ée]cnica)", re.IGNORECASE
)


def coletar() -> list[Achado]:
    achados: list[Achado] = []
    html = baixa(BASE)
    if not html:
        return achados

    sopa = BeautifulSoup(html, "lxml")

    for link in sopa.find_all("a", href=True):
        href = urljoin(BASE, link["href"])
        texto = " ".join(link.get_text(" ", strip=True).split())

        if not texto or not PADRAO_ATO.search(texto):
            continue
        if ja_visto(href):
            continue

        conteudo = baixa(href)
        if not conteudo:
            continue

        h, caminho = arquiva(conteudo, href)
        if ja_visto(h):
            registra(h, href)
            continue

        achado = Achado(
            titulo=texto[:160],
            url=href,
            orgao="Comitê Gestor do IBS",
            fonte="cgibs",
            hash=h,
            arquivo_local=caminho,
            tipo_sugerido="resolucao" if "resolu" in texto.lower() else "ato_conjunto",
        )
        slug = re.sub(r"[^a-z0-9]+", "-", texto.lower()).strip("-")[:60]
        salva_rascunho(achado, "normas", slug, "")
        registra(h, href)
        achados.append(achado)

    return achados
