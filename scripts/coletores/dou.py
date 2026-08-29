"""Coletor do Diário Oficial da União.

A Imprensa Nacional não publica API documentada para uso geral, mas o
buscador de in.gov.br é alimentado por um endpoint acessível. Antes de
evoluir este coletor, avalie o Ro-DOU, ferramenta oficial de clipping do
DOU mantida pelo governo no GitHub (organização gestaogovbr), construída
em Airflow para exatamente este propósito.

Este módulo é o esqueleto: confirme o endpoint atual e o formato da
resposta antes de colocar em produção.
"""

from __future__ import annotations

import os

from base import Achado

TERMOS = [t.strip() for t in os.getenv(
    "TERMOS", "IBS,CBS,Imposto Seletivo,LC 214,LC 227,Reforma Tributária"
).split(",")]

CONSULTA = "https://www.in.gov.br/consulta/-/buscar/dou"


def coletar() -> list[Achado]:
    print(f"  DOU: termos monitorados: {', '.join(TERMOS)}")
    print("  DOU: confirme o endpoint de busca atual antes de ativar em produção.")
    print(f"  DOU: referência de consulta manual: {CONSULTA}")
    return []
