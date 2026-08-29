#!/usr/bin/env python3
"""Executa todos os coletores e escreve o resumo do pull request."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from base import Achado, resumo_pr, RAIZ  # noqa: E402
import cgibs, dou, camara  # noqa: E402

COLETORES = [
    ("CGIBS", cgibs.coletar),
    ("DOU", dou.coletar),
    ("Câmara", camara.coletar),
]


def main() -> int:
    todos: list[Achado] = []
    falhas: list[str] = []

    for nome, fn in COLETORES:
        print(f"→ {nome}")
        try:
            achados = fn()
            print(f"  {len(achados)} item(ns)")
            todos.extend(achados)
        except Exception as exc:  # coletor quebrado não pode derrubar os outros
            print(f"  ERRO: {exc}")
            falhas.append(f"{nome}: {exc}")

    resumo = resumo_pr(todos)
    if falhas:
        resumo += "\n\n### Coletores com falha\n\n" + "\n".join(f"- {f}" for f in falhas)
        resumo += "\n\nFalha em fonte crítica por duas execuções seguidas deve abrir issue."

    (RAIZ / ".coleta-resumo.md").write_text(resumo, encoding="utf-8")
    print(f"\n{len(todos)} achado(s), {len(falhas)} falha(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
