"""Coletor de proposições na Câmara dos Deputados.

Esta é a fonte mais bem estruturada do conjunto: API REST documentada,
gratuita e sem cadastro.
"""

from __future__ import annotations

import requests

from base import Achado, UA, TIMEOUT

API = "https://dadosabertos.camara.leg.br/api/v2/proposicoes"
SIGLAS = ["PLP", "PL", "MPV"]


def coletar(ano: int = 2026) -> list[Achado]:
    achados: list[Achado] = []
    for sigla in SIGLAS:
        try:
            r = requests.get(
                API,
                params={
                    "siglaTipo": sigla,
                    "ano": ano,
                    "keywords": "reforma tributária",
                    "ordem": "DESC",
                    "ordenarPor": "id",
                    "itens": 20,
                },
                headers={"User-Agent": UA, "Accept": "application/json"},
                timeout=TIMEOUT,
            )
            r.raise_for_status()
        except requests.RequestException as exc:
            print(f"  Câmara ({sigla}): falha — {exc}")
            continue

        for p in r.json().get("dados", []):
            achados.append(
                Achado(
                    titulo=f"{p['siglaTipo']} {p['numero']}/{p['ano']} — {p.get('ementa', '')[:120]}",
                    url=f"https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao={p['id']}",
                    orgao="Câmara dos Deputados",
                    fonte="camara",
                    tipo_sugerido="lei_complementar" if sigla == "PLP" else "medida_provisoria",
                )
            )
    return achados
